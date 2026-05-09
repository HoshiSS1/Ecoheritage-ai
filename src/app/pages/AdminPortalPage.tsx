import { useState, useEffect } from "react";
import { Lock, User, ArrowRight, ShieldCheck, Sparkles, Database, Globe, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { 
  ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_KEY, 
  REMEDIES_STORAGE_KEY, LOCATIONS_STORAGE_KEY, loadStoredState 
} from "./admin/adminUtils";
import { createSeedRemedies, createSeedLocations } from "./admin/adminData";
import AdminLayout from "./admin/AdminLayout";

export default function AdminPortalPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [heritageCount, setHeritageCount] = useState(0);
  const [regionCount, setRegionCount] = useState(0);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    const sessionRaw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionRaw) {
      try {
        const parsed = JSON.parse(sessionRaw);
        if (parsed?.authenticated) setIsAuthenticated(true);
      } catch (e) {
        console.error("Session restore failed:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch dynamic counts for data consistency, fallback to seed length if empty
    const remedies = loadStoredState(REMEDIES_STORAGE_KEY, []);
    const locations = loadStoredState(LOCATIONS_STORAGE_KEY, []);
    setHeritageCount(remedies.length || createSeedRemedies().length);
    setRegionCount(locations.length || createSeedLocations().length);
  }, []);

  if (isAuthenticated) {
    return <AdminLayout />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      let role = null;
      let userEmail = username;

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        role = "Super Admin";
      } else {
        const rawUsers = localStorage.getItem("ecoheritage_users");
        if (rawUsers) {
          const users = JSON.parse(rawUsers);
          const user = users.find((u: any) => u.email === username && u.password === password);
          if (user) {
            if (user.status === "banned") {
              toast.error("Tài khoản đã bị vô hiệu hóa", {
                description: "Vui lòng liên hệ Super Admin để biết thêm chi tiết.",
                style: { borderLeft: "4px solid #ef4444" }
              });
              setIsLoading(false);
              return;
            }
            if (user.role === "Member" || !user.role) {
              toast.error("Truy cập bị từ chối", {
                description: "Tài khoản của bạn không có quyền truy cập hệ thống quản trị.",
                style: { borderLeft: "4px solid #ef4444" }
              });
              setIsLoading(false);
              return;
            }
            role = user.role;
          }
        }
      }

      if (role) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ 
          authenticated: true, 
          timestamp: Date.now(),
          role: role,
          email: userEmail
        }));
        toast.success(`Xác thực thành công!`, {
          description: `Đăng nhập với vai trò: ${role}`,
          style: { borderLeft: "4px solid #10b981" }
        });
        window.location.reload();
      } else {
        toast.error("Thông tin xác thực không chính xác", {
          description: "Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.",
          style: { borderLeft: "4px solid #ef4444" }
        });
        setIsLoading(false);
      }
    }, 1200);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const usersRaw = localStorage.getItem('ecoheritage_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const user = users.find((u: any) => u.email === resetEmail);
      
      const isSuperAdmin = resetEmail === ADMIN_USERNAME || resetEmail === "admin@ecoheritage.vn";
      const isAdminRole = user && user.role !== 'Member';

      if (isSuperAdmin || isAdminRole) {
        toast.success("Đã gửi liên kết khôi phục!", {
          description: "Vui lòng kiểm tra hộp thư email của bạn để tiến hành thiết lập lại mật khẩu.",
          style: { borderLeft: "4px solid #10b981" }
        });
        setIsForgotPassword(false);
      } else {
        toast.error("Tài khoản không tồn tại", {
          description: "Không tìm thấy tài khoản quản trị nào với địa chỉ email này.",
          style: { borderLeft: "4px solid #ef4444" }
        });
      }
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020b07]">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[150px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[150px] animate-pulse" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[1000px] px-4"
      >
        <div className="grid overflow-hidden rounded-[2.5rem] bg-white shadow-[0_50px_120px_-20px_rgba(0,0,0,0.5)] border border-white/10 lg:grid-cols-[1.2fr_1fr]">
          
          {/* Left Panel - Visuals & Stats (Green) */}
          <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[#051a11] to-[#0a2e1f] p-12 text-white lg:flex border-r border-slate-100 overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-2.5 shadow-lg shadow-emerald-500/20">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-black tracking-tight text-white">EcoHeritage <span className="text-amber-400 italic">Admin</span></h2>
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-400/60 mt-1">Hệ thống điều hành trung tâm</p>
                  </div>
                </div>
                
                <div className="mt-20">
                  <h3 className="text-4xl font-display font-black leading-[1.1] tracking-tighter text-white">
                    Quản trị <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-200 drop-shadow-sm">Di sản Số</span>
                  </h3>
                  <p className="mt-4 max-w-sm text-base text-emerald-100/30 leading-relaxed font-medium italic">
                    "Kết hợp trí tuệ nhân tạo với tinh hoa y học truyền thống để bảo tồn giá trị Việt."
                  </p>

                  <div className="mt-12 grid grid-cols-2 gap-5">
                    <div className="rounded-[1.5rem] bg-[#172c21] p-6 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                      <div className="w-12 h-12 rounded-[1rem] bg-[#224131] flex items-center justify-center text-emerald-400 mb-6 shadow-inner relative z-10">
                        <Database className="w-6 h-6" />
                      </div>
                      <p className="text-4xl font-black text-white tracking-tight leading-none mb-2.5 relative z-10 drop-shadow-md">{heritageCount}</p>
                      <p className="text-[11px] font-black text-emerald-100/50 uppercase tracking-[0.15em] relative z-10">Dữ liệu Di sản</p>
                    </div>

                    <div className="rounded-[1.5rem] bg-[#172c21] p-6 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
                      <div className="w-12 h-12 rounded-[1rem] bg-[#224131] flex items-center justify-center text-emerald-400 mb-6 shadow-inner relative z-10">
                        <Globe className="w-6 h-6" />
                      </div>
                      <p className="text-4xl font-black text-white tracking-tight leading-none mb-2.5 relative z-10 drop-shadow-md">{regionCount}</p>
                      <p className="text-[11px] font-black text-emerald-100/50 uppercase tracking-[0.15em] relative z-10">Vùng Dược liệu</p>
                    </div>
                  </div>
                </div>
             </div>
             
             <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">© 2026 EcoHeritage AI System</p>
          </div>

          {/* Right Panel - Form (Bright/White) */}
          <div className="flex flex-col justify-center p-10 sm:p-16 bg-white">
            <div className="mb-10">
               <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-50 border border-emerald-100 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 mb-6">
                 <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                 Secure Identity Gate
               </div>
               <h1 className="text-3xl font-display font-black text-slate-900 tracking-tighter uppercase mb-4 relative inline-block">
                 {isForgotPassword ? "Khôi phục mật khẩu" : "Đăng nhập"}
                 <span className="absolute -bottom-1.5 left-0 w-12 h-1 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full" />
               </h1>
               <p className="mt-4 text-slate-400 text-sm font-bold italic">
                 {isForgotPassword ? "Nhập mã định danh để khôi phục." : "Xác thực quyền quản trị viên."}
               </p>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em] ml-1">MÃ ĐỊNH DANH / EMAIL</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 text-slate-900 placeholder:text-slate-300 focus:border-emerald-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-base shadow-sm"
                      placeholder="admin@ecoheritage.vn"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative mt-8 w-full group overflow-hidden rounded-2xl bg-[#051a11] px-8 py-4.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_-12px_rgba(5,26,17,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="flex items-center justify-center gap-3">
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Gửi mã khôi phục"
                    )}
                  </span>
                </button>

                <div className="text-center mt-6">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em] ml-1">MÃ ĐỊNH DANH</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 text-slate-900 placeholder:text-slate-300 focus:border-emerald-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-base shadow-sm"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em] ml-1">MẬT MÃ BẢO MẬT</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl bg-slate-50 border border-slate-200 py-5 pl-14 pr-14 text-slate-900 placeholder:text-slate-300 focus:border-emerald-500/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-bold text-base shadow-sm"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-6 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-md border border-slate-300 bg-white group-hover:border-emerald-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="absolute inset-0 rounded-md bg-emerald-500 opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Ghi nhớ đăng nhập</span>
                </label>
                <button 
                  type="button" 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative mt-8 w-full group overflow-hidden rounded-2xl bg-[#051a11] px-8 py-4.5 text-sm font-black uppercase tracking-widest text-white shadow-[0_20px_40px_-12px_rgba(5,26,17,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      Khởi động Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
              </button>
            </form>
            )}
            
            <div className="mt-10">
               <button 
                onClick={() => window.location.href = "/"}
                className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.15em] hover:text-emerald-600 transition-colors"
               >
                 <ArrowLeft className="h-3 w-3" />
                 Quay lại Website
               </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
