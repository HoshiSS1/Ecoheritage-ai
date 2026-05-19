import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart3,
  Database,
  MessageSquareQuote,
  Users,
  Leaf,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  RefreshCw,
  ArrowLeft,
  MapPin,
  Sparkles,
  Search,
  LayoutDashboard
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  AdminSectionId, ADMIN_USERNAME, ADMIN_SESSION_KEY,
  FEEDBACK_STORAGE_KEY, loadStoredState, loadAdminSession,
  ADMIN_PASSWORD, shellCardClass,
} from "./adminUtils";
import { DashboardSection } from "./DashboardSection";
import { HeritageCMS } from "./HeritageCMS";
import { FeedbackSection } from "./FeedbackSection";
import { UsersSection } from "./UsersSection";
import { LocationCMS } from "./LocationCMS";

const sectionMeta: { id: AdminSectionId; label: string; hint: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Tổng quan", hint: "Vận hành hệ thống", icon: BarChart3 },
  { id: "heritage", label: "Kho Bài thuốc", hint: "Quản lý bài thuốc", icon: Database },
  { id: "locations", label: "Tọa độ Dược liệu", hint: "Quản lý điểm bản đồ", icon: MapPin },
  { id: "feedback", label: "Tương tác khách", hint: "Feedback & review", icon: MessageSquareQuote },
  { id: "users", label: "Thành viên", hint: "Quản lý tài khoản", icon: Users },
];

export function AdminLayout() {
  const [activeSection, setActiveSection] = useState<AdminSectionId>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingNotifs, setPendingNotifs] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [userRole, setUserRole] = useState("Super Admin");
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sessionRaw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (sessionRaw) {
      try {
        const parsed = JSON.parse(sessionRaw);
        if (parsed?.role) setUserRole(parsed.role);
      } catch (e) {}
    }
  }, []);

  const canAccess = (sectionId: AdminSectionId) => {
    if (userRole === "Super Admin") return true;
    if (userRole === "Content Editor" && ["overview", "heritage", "locations"].includes(sectionId)) return true;
    if (userRole === "Moderator" && ["overview", "feedback", "users"].includes(sectionId)) return true;
    return false;
  };

  // Scroll to top when section changes
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeSection]);

  // Notification badge: poll pending feedback
  const pollPending = useCallback(() => {
    try {
      const feedbackRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      let feedback: any[] = [];
      try {
        feedback = feedbackRaw ? JSON.parse(feedbackRaw) : [];
      } catch (e) {
        console.error("Lỗi parse feedback:", e);
        feedback = [];
      }


      const pending = feedback.filter((r: any) => r.status === "pending" && r.isRead !== true);

      const prevCount = parseInt(sessionStorage.getItem("last_pending_count") || "0");
      if (pending.length > 0 && pending.length !== prevCount) {
        toast.info(`Có ${pending.length} góp ý mới đang chờ bạn duyệt!`, {
          icon: "🔔",
          style: { background: "#0ea5e9", color: "#fff" },
          duration: 5000
        });
      }
      sessionStorage.setItem("last_pending_count", pending.length.toString());

      setPendingCount(pending.length);

      const displayItems = feedback.filter((f: any) => f.status === "pending")
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      setPendingNotifs(displayItems.slice(0, 5));

      // Track user count
      const usersRaw = localStorage.getItem("ecoheritage_users");
      if (usersRaw) {
        try {
          const users = JSON.parse(usersRaw);
          setUserCount(users.length);
        } catch (e) {
          console.error("Lỗi parse users:", e);
        }
      }
    } catch (e) {
      console.error("Lỗi tổng quát pollPending:", e);
    }
  }, []);

  useEffect(() => {
    pollPending();
    const interval = setInterval(pollPending, 5000);

    const handleStorageChange = () => { pollPending(); };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("storage_sync", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("storage_sync", handleStorageChange);
    };
  }, [pollPending]);

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.location.reload();
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return <DashboardSection />;
      case "heritage": return <HeritageCMS />;
      case "locations": return <LocationCMS />;
      case "feedback": return <FeedbackSection onPendingChange={pollPending} />;
      case "users": return <UsersSection />;
      default: return <DashboardSection />;
    }
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 text-white shadow-[0_12px_34px_-18px_rgba(16,185,129,0.72)]">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-bold tracking-tight text-[#1E293B]">EcoHeritage</p>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
        <p className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 mt-2">Phân hệ điều hành</p>

        {canAccess("overview") && (
          <button onClick={() => setActiveSection("overview")} className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-black transition-all duration-300 ${activeSection === "overview" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"}`}>
            {activeSection === "overview" && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />}
            <LayoutDashboard className="h-4.5 w-4.5" /> Theo Dõi Hệ Thống
          </button>
        )}

        {canAccess("heritage") && (
          <button onClick={() => setActiveSection("heritage")} className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-black transition-all duration-300 ${activeSection === "heritage" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"}`}>
            {activeSection === "heritage" && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />}
            <Database className="h-4.5 w-4.5" /> Y Lý Cổ Truyền
          </button>
        )}

        {canAccess("locations") && (
          <button onClick={() => setActiveSection("locations")} className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-black transition-all duration-300 ${activeSection === "locations" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"}`}>
            {activeSection === "locations" && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />}
            <MapPin className="h-4.5 w-4.5" /> Chỉ Dẫn Địa Lý
          </button>
        )}

        {canAccess("feedback") && (
          <button onClick={() => setActiveSection("feedback")} className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-black transition-all duration-300 ${activeSection === "feedback" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"}`}>
            {activeSection === "feedback" && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />}
            <MessageSquareQuote className="h-4.5 w-4.5" /> Tương tác & Đánh giá
            {pendingCount > 0 && <span className="ml-auto flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">{pendingCount}</span>}
          </button>
        )}

        {canAccess("users") && (
          <button onClick={() => setActiveSection("users")} className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-black transition-all duration-300 ${activeSection === "users" ? "bg-emerald-50 text-emerald-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"}`}>
            {activeSection === "users" && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full" />}
            <Users className="h-4.5 w-4.5" /> Quản lý Thành viên
          </button>
        )}
      </div>

      {/* Footer Nav Section */}
      <div className="space-y-2 border-t border-slate-200 pt-5">
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          <ArrowLeft className="h-4 w-4" /> Về website public
        </Link>
      </div>
    </>
  );

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F8FAFC] text-[#1E293B]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[292px] border-r border-slate-200 bg-white px-6 py-6 lg:flex lg:flex-col shadow-[10px_0_40px_-20px_rgba(0,0,0,0.05)]">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)}>
          <div className="h-full w-[86%] max-w-[320px] bg-white p-6 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold tracking-tight text-slate-950">EcoHeritage AI</p>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="rounded-2xl border border-slate-200 p-3 text-slate-700" aria-label="Đóng menu" title="Đóng menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex h-full flex-col lg:ml-[292px]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 w-full items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-xl sm:px-8 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden items-center gap-3 lg:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Hành lang điều hành</p>
                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">
                  {sectionMeta.find(s => s.id === activeSection)?.label || "Dashboard"}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden flex-col items-end sm:flex">
              <p className="text-xs font-black text-slate-900 truncate max-w-[150px]">
                {sessionStorage.getItem(ADMIN_SESSION_KEY) ? JSON.parse(sessionStorage.getItem(ADMIN_SESSION_KEY) || "{}").email || ADMIN_USERNAME : ADMIN_USERNAME}
              </p>
              <p className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                {userRole}
              </p>
            </div>

            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#007BFF] to-[#0056b3] p-0.5 shadow-lg shadow-blue-500/20 group cursor-pointer">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white text-[#007BFF] font-black text-lg group-hover:bg-blue-50 transition-colors">
                {userRole.charAt(0)}
              </div>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 mx-2" />

            <button onClick={() => { pollPending(); toast.success("Đã đồng bộ dữ liệu hệ thống!"); }} className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-[#007BFF]/50 hover:text-[#007BFF]">
              <RefreshCw className="h-5 w-5 transition-transform group-active:rotate-180" />
            </button>

            <div className="relative">
              <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${isNotifOpen ? 'border-[#007BFF] bg-blue-50 text-[#007BFF]' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-600'}`}>
                <Bell className="h-5 w-5" />
                {pendingCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-4 ring-white shadow-lg">{pendingCount}</span>}
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.2)] border border-slate-200/60 overflow-hidden z-50">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                    <h4 className="text-sm font-semibold text-slate-800">Thông báo mới</h4>
                    <button onClick={(e) => { e.stopPropagation(); pollPending(); }} className="p-1.5 hover:bg-white rounded-lg transition-colors text-[#007BFF]">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {pendingNotifs.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-slate-500">
                        Không có thông báo mới nào
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {pendingNotifs.map((n: any) => (
                          <div key={n.id} className="p-4 hover:bg-slate-50 transition cursor-pointer" onClick={() => { setIsNotifOpen(false); setActiveSection("feedback"); }}>
                            <p className="text-sm text-slate-800 font-medium">{n.author} <span className="text-slate-500 font-normal">vừa gửi nhận xét:</span></p>
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">"{n.content}"</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">{n.category === 'heritage' ? 'Di sản' : 'Web'}</p>
                              <p className="text-[9px] text-slate-400 font-medium">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleLogout} title="Đăng xuất" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-500 transition-all hover:bg-rose-50 hover:border-rose-200 shadow-sm active:scale-95">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main ref={mainRef} data-lenis-prevent="true" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
