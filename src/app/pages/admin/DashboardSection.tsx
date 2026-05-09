import { useState, useEffect } from "react";
import { Activity, CloudSun, Database, Droplets, Flower2, RefreshCw, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  shellCardClass, loadStoredState, formatDateTime,
  getStatusFromAqi, buildClimateAdvice,
  REMEDIES_STORAGE_KEY, CLIMATE_CACHE_STORAGE_KEY,
  ClimateSnapshot, ClimateSettings, ClimateTrendPoint,
  createFallbackClimateSnapshot, getDefaultClimateSettings,
} from "./adminUtils";
import { createSeedRemedies } from "./adminData";
import { fetchAirQuality, fetchEnvironmentTrend } from "@/app/utils/airQuality";
import { getAvatarUrl } from "../../utils/avatarUtils";

function AdminStatCard({ title, value, description, accent, icon: Icon }: {
  title: string; value: string; description: string; accent: string; icon: typeof Activity;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-500">
      <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-700 ${accent.split(' ')[0]}`} />
      <div className="mb-5 flex items-start justify-between gap-4 relative z-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{value}</p>
        </div>
        <div className={`rounded-2xl p-4 shadow-lg ${accent}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-500 relative z-10 font-medium">{description}</p>
      
      {/* Decorative pulse line */}
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
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

  // Dynamic Quote Logic
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quotes = [
    "Sức khỏe là vốn quý nhất của con người. Hãy trân trọng từng hơi thở sạch.",
    "Y học cổ truyền là kho tàng kinh nghiệm ngàn năm. Hãy bảo tồn và phát huy.",
    "Một cơ thể khỏe mạnh bắt nguồn từ một môi trường sống trong lành.",
    "Phòng bệnh hơn chữa bệnh. Theo dõi AQI mỗi ngày để bảo vệ gia đình.",
    "Thiên nhiên cung cấp mọi thứ ta cần để chữa lành. Hãy sống xanh, sống khỏe."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(timer);
  }, [quotes.length]);

  const [climateSnapshot, setClimateSnapshot] = useState<ClimateSnapshot>(() =>
    loadStoredState(CLIMATE_CACHE_STORAGE_KEY, createFallbackClimateSnapshot())
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [climateError, setClimateError] = useState<string | null>(null);

  const settings: ClimateSettings = {
    provider: "openweather",
    openWeatherKey: "",
    iqAirKey: "",
    lat: import.meta.env.VITE_OPENWEATHER_LAT || "16.0544",
    lon: import.meta.env.VITE_OPENWEATHER_LON || "108.2022",
  };

  async function syncClimate(showToast: boolean) {
    setIsSyncing(true);
    setClimateError(null);
    try {
      const [current, trendPoints] = await Promise.all([
        fetchAirQuality(),
        fetchEnvironmentTrend(),
      ]);

      const status = getStatusFromAqi(current.aqi);
      const trend: ClimateTrendPoint[] = trendPoints.length
        ? trendPoints.map((p) => ({
          label: p.time,
          pm25: p.pm25,
          aqi: p.aqi,
          timestamp: Math.floor(new Date(p.timestamp).getTime() / 1000),
        }))
        : climateSnapshot.trend;

      const snapshot: ClimateSnapshot = {
        aqi: current.aqi,
        pm25: current.pm25,
        source: current.source,
        updatedAt: new Date().toISOString(),
        statusLabel: status.label,
        statusTone: status.tone,
        advisory: buildClimateAdvice(current.aqi, current.pm25),
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
    <div className="space-y-10">
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007BFF] mb-2">Module 1</p>
        <h2 className="text-3xl font-black tracking-tighter text-[#1E293B] sm:text-4xl leading-tight">Di sản Y học AI</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-500 font-medium italic">
          Công cụ điều hành trung tâm cho kho lưu trữ thảo dược và dữ liệu cộng đồng Việt Nam. Theo dõi và quản trị toàn diện hệ thống EcoHeritage.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard title="Bản ghi di sản" value={String(remedyCount)} description="Tổng số bài thuốc đã số hóa." accent="bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30" icon={Database} />
        <AdminStatCard title="Điểm tọa độ" value="64+" description="Vùng nguyên liệu dược bản địa." accent="bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30" icon={Flower2} />
        <AdminStatCard title="Thành viên" value={String(userCount)} description="Cộng đồng đồng hành bảo tồn." accent="bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30" icon={UserRound} />
        <AdminStatCard title="Chỉ số AQI" value={String(climateSnapshot.aqi)} description={`${climateSnapshot.statusLabel} · PM2.5: ${climateSnapshot.pm25.toFixed(1)}`} accent="bg-emerald-500 text-[#051a11] shadow-lg shadow-emerald-500/20" icon={CloudSun} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        {/* Chart */}
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">PM2.5 24h</p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900 uppercase tracking-wider">Biến động bụi mịn</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest ring-1 ring-emerald-500/30 bg-emerald-500/10 text-emerald-600 shadow-sm">
                {climateSnapshot.statusLabel}
              </span>
              <button onClick={() => syncClimate(true)} disabled={isSyncing} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-400 hover:text-amber-500 hover:border-amber-400/50 transition-all shadow-sm active:scale-95 disabled:opacity-50" aria-label="Làm mới dữ liệu PM2.5" title="Làm mới dữ liệu PM2.5">
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={climateSnapshot.trend}>
                <CartesianGrid stroke="#000000" strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "rgba(30,41,59,0.7)", fontSize: 11, fontWeight: 900 }} dy={12} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: "rgba(30,41,59,0.7)", fontSize: 11, fontWeight: 900 }} dx={-12} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 24, 
                    border: "1px solid rgba(16,185,129,0.2)", 
                    boxShadow: "0 25px 60px -15px rgba(0,0,0,0.1)", 
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    padding: '20px'
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: 900, fontSize: 16 }}
                  labelStyle={{ color: 'rgba(30,41,59,0.5)', marginBottom: 10, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 800 }}
                  formatter={(value: number) => [`${value.toFixed(1)} μg/m³`, "Nồng độ bụi mịn"]} 
                />
                <defs>
                  <linearGradient id="colorPm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <Line 
                  type="monotone" 
                  dataKey="pm25" 
                  stroke="#10b981" 
                  strokeWidth={5} 
                  dot={false} 
                  activeDot={{ r: 10, fill: "#10b981", stroke: '#fff', strokeWidth: 4 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Info */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Snapshot khí hậu</p>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:bg-slate-100 transition-colors cursor-default">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PM2.5 trung bình</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{avgPm25} μg/m³</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600"><Droplets className="h-5 w-5" /></div>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 border border-slate-100 shadow-sm flex items-center justify-between group hover:bg-slate-100 transition-colors cursor-default">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đỉnh 24h</p>
                  <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">{peakPm25} μg/m³</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600"><Activity className="h-5 w-5" /></div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <RefreshCw className="h-3 w-3" />
              Cập nhật: {formatDateTime(climateSnapshot.updatedAt)}
            </div>
          </div>

          <div className="bg-emerald-400 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[50px] rounded-full pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-2xl bg-[#051a11] flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(5,26,17,0.3)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#051a11]/60">Trí tuệ nhân tạo</p>
                  <h3 className="text-lg font-black text-[#051a11] uppercase tracking-wider">Lời khuyên AI</h3>
                </div>
              </div>
              
              <div className="p-5 rounded-3xl bg-black/5 border border-black/5 backdrop-blur-sm">
                <p className="text-sm leading-relaxed text-black font-bold italic h-12 flex items-center">
                  "{quotes[quoteIndex]}"
                </p>
                <div className="mt-3 pt-3 border-t border-black/10">
                   <p className="text-[11px] text-black/60 font-medium leading-relaxed">
                     Lưu ý: {climateSnapshot.advisory}
                   </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[#051a11] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#051a11]/50">Dữ liệu thời gian thực · {climateSnapshot.source === 'live' ? 'OpenWeather' : 'Fallback'}</span>
              </div>
            </div>
            {climateError && <div className="mt-6 rounded-2xl bg-rose-500/10 p-4 text-[10px] font-bold border border-rose-500/20 text-rose-300">{climateError}</div>}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Góp ý mới nhất</h3>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Feed</span>
          </div>
          <div className="space-y-4">
            {(() => {
              const raw = localStorage.getItem("ecoheritage_admin_feedback");
              const feedback = raw ? JSON.parse(raw).slice(0, 4) : [];
              if (feedback.length === 0) return <p className="text-sm text-slate-400 py-4 italic">Chưa có dữ liệu...</p>;
              return feedback.map((f: any) => (
                <div key={f.id} className="flex items-start gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-emerald-500/30 hover:bg-white hover:shadow-md transition-all group">
                  <div className="relative group/avatar shrink-0">
                    <div className="w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-emerald-500 to-amber-400 shadow-sm transition-transform group-hover/avatar:rotate-6">
                      <div className="w-full h-full rounded-[14px] bg-white p-[1px] overflow-hidden">
                        <img 
                          src={getAvatarUrl(f.author)} 
                          alt={f.author} 
                          className="w-full h-full object-cover grayscale-[0.1] contrast-125"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-black text-slate-900 truncate">{f.author}</p>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatDateTime(f.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">{f.content}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 tracking-tighter uppercase">Thành viên mới</h3>
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Registrations</span>
          </div>
          <div className="space-y-4">
            {(() => {
              const raw = localStorage.getItem("ecoheritage_users");
              const users = raw ? JSON.parse(raw).slice(0, 4) : [];
              if (users.length === 0) return <p className="text-sm text-slate-400 py-4 italic">Chưa có thành viên nào...</p>;
              return users.map((u: any) => (
                <div key={u.email} className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:border-amber-500/30 hover:bg-white hover:shadow-md transition-all group">
                  <div className="relative group/avatar shrink-0">
                    <div className="w-12 h-12 rounded-2xl p-[2px] bg-gradient-to-tr from-amber-500 to-amber-600 shadow-sm transition-transform group-hover/avatar:-rotate-6">
                      <div className="w-full h-full rounded-[14px] bg-white p-[1px] overflow-hidden">
                        <img 
                          src={localStorage.getItem(`avatar_${u.email}`) || getAvatarUrl(u.name)} 
                          alt={u.name} 
                          className="w-full h-full object-cover grayscale-[0.1] contrast-125"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate">{u.name}</p>
                    <p className="text-[10px] font-black text-slate-400 tracking-wider uppercase">{u.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-xl px-3 py-1.5 text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20">Member</span>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
