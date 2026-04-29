import { useState } from "react";
import { CloudSun, Cpu, Droplets, RefreshCw, Save, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  shellCardClass, loadStoredState,
  CLIMATE_SETTINGS_STORAGE_KEY, ClimateSettings, getDefaultClimateSettings,
  DEFAULT_AQI_API_URL,
} from "./adminUtils";

export function ApiConfigSection() {
  const [settings, setSettings] = useState<ClimateSettings>(() =>
    loadStoredState(CLIMATE_SETTINGS_STORAGE_KEY, getDefaultClimateSettings())
  );
  const [geminiKey, setGeminiKey] = useState(() =>
    localStorage.getItem("ecoheritage_gemini_key") || (import.meta.env.VITE_GEMINI_KEY || "")
  );
  const [geminiModel, setGeminiModel] = useState(() =>
    localStorage.getItem("ecoheritage_gemini_model") || "gemini-2.0-flash"
  );
  const [googleClientId, setGoogleClientId] = useState(() =>
    localStorage.getItem("ecoheritage_google_client_id") || (import.meta.env.VITE_GOOGLE_CLIENT_ID || "")
  );

  // Connection test states
  const [climateTest, setClimateTest] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [geminiTest, setGeminiTest] = useState<"idle" | "loading" | "success" | "error">("idle");

  const saveClimate = () => {
    localStorage.setItem(CLIMATE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    toast.success("Đã lưu cấu hình Climate API!", { style: { borderLeft: "4px solid #22c55e" } });
  };

  const saveGemini = () => {
    localStorage.setItem("ecoheritage_gemini_key", geminiKey);
    localStorage.setItem("ecoheritage_gemini_model", geminiModel);
    toast.success("Đã lưu cấu hình LLM API!", { style: { borderLeft: "4px solid #8b5cf6" } });
  };

  const saveGoogle = () => {
    localStorage.setItem("ecoheritage_google_client_id", googleClientId);
    toast.success("Đã lưu cấu hình Google Services!", { style: { borderLeft: "4px solid #ef4444" } });
  };

  const testClimate = async () => {
    setClimateTest("loading");
    try {
      const url = `${DEFAULT_AQI_API_URL}/air_pollution?lat=${settings.lat}&lon=${settings.lon}&appid=${settings.openWeatherKey}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      setClimateTest("success");
      toast.success("✅ Climate API kết nối thành công!");
    } catch {
      setClimateTest("error");
      toast.error("❌ Không thể kết nối Climate API. Kiểm tra API key.");
    }
  };

  const testGemini = async () => {
    setGeminiTest("loading");
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`,
        { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: "Xin chào" }] }] }) }
      );
      if (!res.ok) throw new Error();
      setGeminiTest("success");
      toast.success("✅ Gemini API kết nối thành công!");
    } catch {
      setGeminiTest("error");
      toast.error("❌ Không thể kết nối Gemini. Kiểm tra API key.");
    }
  };

  const StatusBadge = ({ status }: { status: "idle" | "loading" | "success" | "error" }) => {
    if (status === "idle") return null;
    if (status === "loading") return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
    if (status === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    return <XCircle className="h-4 w-4 text-rose-500" />;
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#007BFF]">Module 4</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Cấu hình API & Dịch vụ</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Quản lý tập trung API key cho Climate và AI. Mỗi dịch vụ có nút "Test" để kiểm tra kết nối.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Card 1: Climate API */}
        <div className={`${shellCardClass} p-5 sm:p-6 flex flex-col`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-sky-50 p-3 text-sky-600"><CloudSun className="h-5 w-5" /></div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-950">Climate API</h3>
              <p className="text-xs text-slate-500">OpenWeather · O₃ & PM₂.₅</p>
            </div>
            <StatusBadge status={climateTest} />
          </div>

          <div className="space-y-4 flex-1">
            <div className="flex gap-2">
              {(["openweather", "iqair"] as const).map(p => (
                <button key={p} onClick={() => setSettings(s => ({ ...s, provider: p }))}
                  className={`flex-1 rounded-xl px-3 py-2 text-xs font-medium transition ${settings.provider === p ? "bg-[#007BFF] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {p === "openweather" ? "OpenWeather" : "IQAir"}
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">OpenWeather Key</label>
              <input type="password" value={settings.openWeatherKey} onChange={e => setSettings(s => ({ ...s, openWeatherKey: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:bg-white transition" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">IQAir Key</label>
              <input type="password" value={settings.iqAirKey} onChange={e => setSettings(s => ({ ...s, iqAirKey: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:bg-white transition" placeholder="Lưu cho tích hợp sau" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Lat</label>
                <input value={settings.lat} onChange={e => setSettings(s => ({ ...s, lat: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:bg-white transition" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Lon</label>
                <input value={settings.lon} onChange={e => setSettings(s => ({ ...s, lon: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:bg-white transition" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={saveClimate} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition">
              <Save className="h-3.5 w-3.5" /> Lưu
            </button>
            <button onClick={testClimate} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:border-[#007BFF] hover:text-[#007BFF] transition">
              <RefreshCw className="h-3.5 w-3.5" /> Test
            </button>
          </div>
        </div>

        {/* Card 2: LLM API (Gemini) */}
        <div className={`${shellCardClass} p-5 sm:p-6 flex flex-col`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-600"><Cpu className="h-5 w-5" /></div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-950">LLM (Google Gemini)</h3>
              <p className="text-xs text-slate-500">Bộ não nhân tạo hệ thống</p>
            </div>
            <StatusBadge status={geminiTest} />
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Gemini API Key</label>
              <input type="password" value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:bg-white transition" placeholder="AIza..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Model</label>
              <select value={geminiModel} onChange={e => setGeminiModel(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#007BFF] focus:bg-white transition">
                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                <option value="gemini-2.5-flash-preview-05-20">Gemini 2.5 Flash</option>
                <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro</option>
              </select>
            </div>

            <div className="rounded-xl bg-violet-50 p-4 text-sm text-violet-800">
              <p className="font-medium mb-1">Trạng thái hiện tại</p>
              <p className="text-xs leading-5">Model: <span className="font-mono font-semibold">{geminiModel}</span></p>
              <p className="text-xs leading-5">Key: {geminiKey ? "••••" + geminiKey.slice(-6) : "Chưa cấu hình"}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium mb-1">Lưu ý quan trọng</p>
              <p className="text-xs leading-5">API key cũng có thể cấu hình qua biến <span className="font-mono">VITE_GEMINI_KEY</span> trong file <span className="font-mono">.env.local</span></p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={saveGemini} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition">
              <Save className="h-3.5 w-3.5" /> Lưu
            </button>
            <button onClick={testGemini} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:border-violet-400 hover:text-violet-600 transition">
              <RefreshCw className="h-3.5 w-3.5" /> Test
            </button>
          </div>
        </div>

        {/* Card 3: Google Services */}
        <div className={`${shellCardClass} p-5 sm:p-6 flex flex-col`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.04 5.36-7.84 5.36-5.04 0-9.12-4.16-9.12-9.28s4.08-9.28 9.12-9.28c2.88 0 4.8 1.2 5.88 2.28l2.56-2.48C18.96 1.08 15.96 0 12.48 0 5.64 0 0 5.64 0 12.48s5.64 12.48 12.48 12.48c7.12 0 11.84-5.04 11.84-12.08 0-.84-.08-1.44-.2-2.08h-11.64z"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-slate-950">Google Services</h3>
              <p className="text-xs text-slate-500">Xác thực & Bảo mật</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600">Google Client ID</label>
              <textarea 
                value={googleClientId} 
                onChange={e => setGoogleClientId(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-mono outline-none focus:border-rose-400 focus:bg-white transition resize-none" 
                placeholder="349492237712-..." 
              />
            </div>

            <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
              <p className="font-medium mb-1">Dịch vụ sử dụng</p>
              <ul className="text-xs leading-5 list-disc list-inside opacity-80">
                <li>Google One-Tap Login</li>
                <li>Hệ thống đăng nhập thành viên</li>
              </ul>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium mb-1">Hướng dẫn</p>
              <p className="text-xs leading-5">Lấy ID này từ <a href="https://console.cloud.google.com/" target="_blank" rel="noreferrer" className="text-rose-600 underline">Google Cloud Console</a>. ID này được lưu tại biến <span className="font-mono">VITE_GOOGLE_CLIENT_ID</span>.</p>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <button onClick={saveGoogle} className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition">
              <Save className="h-3.5 w-3.5" /> Lưu cấu hình Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
