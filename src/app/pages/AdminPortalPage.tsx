import { FormEvent, useState } from "react";
import { ChevronRight, KeyRound, Leaf, ShieldCheck, Eye, EyeOff, User, Lock } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_KEY,
  loadAdminSession,
} from "./admin/adminUtils";
import { AdminLayout } from "./admin/AdminLayout";

export function AdminPortalPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(loadAdminSession);
  const [loginForm, setLoginForm] = useState({ username: ADMIN_USERNAME, password: "" });
  const [showPassword, setShowPassword] = useState(false);

  function submitAdminLogin(e: FormEvent) {
    e.preventDefault();
    const u = loginForm.username.trim();
    const p = loginForm.password.trim();
    if (u === ADMIN_USERNAME && p === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ authenticated: true, authenticatedAt: new Date().toISOString() }));
      setIsAuthenticated(true);
      toast.success("Chào mừng bạn đến với Admin Portal!", {
        description: "Đăng nhập thành công. Dashboard đang tải...",
        style: { background: "linear-gradient(135deg, #f0fdf4, #fff)", borderLeft: "4px solid #22c55e" },
      });
    } else {
      toast.error("Sai tên đăng nhập hoặc mật khẩu.", {
        description: "Vui lòng kiểm tra lại thông tin xác thực.",
        style: { borderLeft: "4px solid #ef4444" },
      });
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#051a11] font-inter">
        {/* Dynamic Background Orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] h-[600px] w-[600px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[100px] animate-pulse [animation-delay:2s]" />
        </div>

        <div className="relative z-10 flex h-[640px] w-full max-w-[1000px] overflow-hidden rounded-[40px] border border-white/20 bg-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] backdrop-blur-[24px] mx-4">
          {/* Left Side: Brand & Visual */}
          <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-emerald-600/20 to-[#051a11]/80 p-12 lg:flex overflow-hidden">
            <div className="absolute inset-0 opacity-30">
              <svg className="h-full w-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
                <path d="M0 0 C 50 100 80 100 100 0" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
              </svg>
            </div>
            
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <ShieldCheck className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="mt-8 font-display text-4xl font-bold leading-tight text-white">
                Quản trị <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-200">Di sản số.</span>
              </h2>
              <p className="mt-6 text-base text-emerald-100/60 leading-relaxed max-w-[300px]">
                Nền tảng vận hành tập trung cho hệ sinh thái y học bản địa EcoHeritage.
              </p>
            </div>

            <div className="relative">
              <div className="flex gap-4 mb-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
                ))}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400/80">EcoHeritage Security Protocol v2.0</p>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="flex w-full flex-col justify-center bg-white/90 p-8 sm:p-12 lg:w-1/2">
            <div className="mx-auto w-full max-w-[340px]">
              <div className="mb-12 text-center lg:text-left">
                <div className="lg:hidden flex justify-center mb-6">
                  <ShieldCheck className="h-10 w-10 text-emerald-600" />
                </div>
                <h1 className="font-display text-3xl font-bold tracking-tight text-slate-950">Xác thực</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">Vui lòng nhập mật khẩu quản trị viên</p>
              </div>

              <form onSubmit={submitAdminLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Admin Account</label>
                  <div className="group relative">
                    <KeyRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
                    <input
                      type="text"
                      value={loginForm.username}
                      disabled
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4.5 pl-12 pr-4 text-sm font-medium text-slate-400 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Mật khẩu</label>
                  <div className="group relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-emerald-600" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4.5 pl-12 pr-12 text-sm font-medium text-slate-950 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 py-5 text-white transition-all hover:bg-emerald-600 hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] active:scale-[0.98] overflow-hidden"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
                    <span className="font-bold tracking-wide uppercase text-sm">Mở Portal Quản Trị</span>
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </form>

              <div className="mt-10 flex flex-col items-center gap-4">
                <Link to="/" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-2">
                   Quay lại trang chủ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLayout />;
}

export default AdminPortalPage;
