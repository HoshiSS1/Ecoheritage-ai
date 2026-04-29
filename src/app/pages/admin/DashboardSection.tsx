import { useState, useEffect } from "react";
import { Activity, CloudSun, Database, Droplets, Flower2, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  shellCardClass, loadStoredState, formatDateTime, formatHourLabel,
  getStatusFromAqi, buildClimateAdvice, DEFAULT_AQI_API_URL,
  REMEDIES_STORAGE_KEY, CLIMATE_CACHE_STORAGE_KEY, CLIMATE_SETTINGS_STORAGE_KEY,
  ClimateSnapshot, ClimateSettings, ClimateTrendPoint,
  createFallbackClimateSnapshot, getDefaultClimateSettings,
} from "./adminUtils";
import { createSeedRemedies } from "./adminData";

function AdminStatCard({ title, value, description, accent, icon: Icon }: {
  title: string; value: string; description: string; accent: string; icon: typeof Activity;
}) {
  return (
    <div className={`${shellCardClass} p-5 sm:p-6`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accent}`}><Icon className="h-5 w-5" /></div>
      </div>
      <p className="text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export function DashboardSection() {
  const [userCount] = useState(() => {
    try { const raw = localStorage.getItem("ecoheritage_users"); return raw ? JSON.parse(raw).length : 0; } catch { return 0; }
  });
  const [remedyCount] = useState(() => {
    const stored = loadStoredState(REMEDIES_STORAGE_KEY, null);
    return stored ? (stored as any[]).length : createSeedRemedies().length;
  });

  const [climateSnapshot, setClimateSnapshot] = useState<ClimateSnapshot>(() =>
    loadStoredState(CLIMATE_CACHE_STORAGE_KEY, createFallbackClimateSnapshot())
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [climateError, setClimateError] = useState<string | null>(null);

  const settings: ClimateSettings = loadStoredState(CLIMATE_SETTINGS_STORAGE_KEY, getDefaultClimateSettings());

  async function syncClimate(showToast: boolean) {
    setIsSyncing(true);
    setClimateError(null);
    try {
      const key = settings.openWeatherKey;
      const currentUrl = `${DEFAULT_AQI_API_URL}/air_pollution?lat=${settings.lat}&lon=${settings.lon}&appid=${key}`;
      const histUrl = `${DEFAULT_AQI_API_URL}/air_pollution/history?lat=${settings.lat}&lon=${settings.lon}&start=${Math.floor(Date.now() / 1000) - 86400}&end=${Math.floor(Date.now() / 1000)}&appid=${key}`;

      const [currentRes, histRes] = await Promise.all([fetch(currentUrl), fetch(histUrl)]);
      if (!currentRes.ok) throw new Error(`API error: ${currentRes.status}`);

      const currentData = await currentRes.json();
      const histData = histRes.ok ? await histRes.json() : null;

      const current = currentData.list?.[0];
      if (!current) throw new Error("Empty response");

      const status = getStatusFromAqi(current.main.aqi);
      const trend: ClimateTrendPoint[] = histData?.list
        ? histData.list.filter((_: any, i: number) => i % Math.max(1, Math.floor(histData.list.length / 8)) === 0).slice(0, 8)
          .map((p: any) => ({ label: formatHourLabel(p.dt), pm25: p.components.pm2_5, aqi: p.main.aqi, timestamp: p.dt }))
        : climateSnapshot.trend;

      const snapshot: ClimateSnapshot = {
        aqi: current.main.aqi,
        pm25: current.components.pm2_5,
        source: "live",
        updatedAt: new Date().toISOString(),
        statusLabel: status.label,
        statusTone: status.tone,
        advisory: buildClimateAdvice(current.main.aqi, current.components.pm2_5),
        trend,
      };

      setClimateSnapshot(snapshot);
      localStorage.setItem(CLIMATE_CACHE_STORAGE_KEY, JSON.stringify(snapshot));
      if (showToast) toast.success("Đã đồng bộ dữ liệu khí hậu thành công!");
    } catch (err: any) {
      setClimateError(err.message);
      if (showToast) toast.error("Lỗi đồng bộ: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => { syncClimate(false); }, []);

  const avgPm25 = climateSnapshot.trend.length > 0
    ? (climateSnapshot.trend.reduce((s, p) => s + p.pm25, 0) / climateSnapshot.trend.length).toFixed(1)
    : "—";
  const peakPm25 = climateSnapshot.trend.length > 0
    ? Math.max(...climateSnapshot.trend.map(p => p.pm25)).toFixed(1)
    : "—";

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#007BFF]">Module 1</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Dashboard tổng quan</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Theo dõi nhanh quy mô nội dung, lượt truy cập và chất lượng không khí theo thời gian thực.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Tổng bài thuốc" value={String(remedyCount)} description="Danh mục hiện có trong Heritage CMS." accent="bg-[#EFF6FF] text-[#007BFF]" icon={Database} />
        <AdminStatCard title="Tổng thảo mộc" value="50" description="Mốc quản trị herb inventory." accent="bg-emerald-50 text-emerald-700" icon={Flower2} />
        <AdminStatCard title="Tổng tài khoản" value={String(userCount)} description="Người dùng đã đăng ký trên nền tảng." accent="bg-violet-50 text-violet-700" icon={UserRound} />
        <AdminStatCard title="AQI hiện tại" value={String(climateSnapshot.aqi)} description={`PM2.5: ${climateSnapshot.pm25.toFixed(1)} μg/m³ · ${climateSnapshot.statusLabel}`} accent="bg-amber-50 text-amber-700" icon={CloudSun} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        {/* Chart */}
        <div className={`${shellCardClass} p-5 sm:p-6`}>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#007BFF]">PM2.5 24h</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">Biến động bụi mịn</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${climateSnapshot.statusTone}`}>
                {climateSnapshot.statusLabel}
              </span>
              <button onClick={() => syncClimate(true)} disabled={isSyncing} className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:text-[#007BFF] hover:border-[#007BFF] transition disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={climateSnapshot.trend}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 18px 45px -24px rgba(15,23,42,0.18)", background: "#FFFFFF" }}
                  formatter={(value: number) => [`${value.toFixed(1)} μg/m³`, "PM2.5"]} />
                <Line type="monotone" dataKey="pm25" name="pm25" stroke="#007BFF" strokeWidth={3} dot={false} activeDot={{ r: 5, fill: "#007BFF" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side cards */}
        <div className="space-y-6">
          <div className={`${shellCardClass} p-5 sm:p-6`}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Snapshot khí hậu</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">PM2.5 trung bình</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{avgPm25} μg/m³</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Đỉnh 24h</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{peakPm25} μg/m³</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">Cập nhật: {formatDateTime(climateSnapshot.updatedAt)}</p>
          </div>

          <div className={`${shellCardClass} p-5 sm:p-6`}>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#EFF6FF] p-3 text-[#007BFF]"><Sparkles className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lời khuyên AI</p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">Đồng bộ theo AQI</h3>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{climateSnapshot.advisory}</p>
            {climateError && <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{climateError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
