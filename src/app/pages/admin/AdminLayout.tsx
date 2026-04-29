import { useState, useEffect, useCallback } from "react"; // Fixed false positive TS module errors
import {
  BarChart3, Database, MessageSquareQuote, KeyRound, Users,
  Leaf, LogOut, Menu, X, Bell, ChevronRight, RefreshCw,
} from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  AdminSectionId, ADMIN_USERNAME, ADMIN_SESSION_KEY,
  FEEDBACK_STORAGE_KEY, loadStoredState, loadAdminSession,
  ADMIN_PASSWORD, shellCardClass,
} from "./adminUtils";
import { DashboardSection } from "@/app/pages/admin/DashboardSection";
import { HeritageCMS } from "@/app/pages/admin/HeritageCMS";
import { FeedbackSection } from "@/app/pages/admin/FeedbackSection";
import { UsersSection } from "@/app/pages/admin/UsersSection";

const sectionMeta: { id: AdminSectionId; label: string; hint: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Dashboard", hint: "Tổng quan vận hành", icon: BarChart3 },
  { id: "heritage", label: "Heritage CMS", hint: "Quản lý bài thuốc", icon: Database },
  { id: "feedback", label: "Tương tác", hint: "Feedback & review", icon: MessageSquareQuote },
  { id: "users", label: "Người dùng", hint: "Quản lý tài khoản", icon: Users },
];

export function AdminLayout() {
  const [activeSection, setActiveSection] = useState<AdminSectionId>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingNotifs, setPendingNotifs] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);

  // Notification badge: poll pending feedback every 10s
  const pollPending = useCallback(() => {
    try {
      const feedbackRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      let feedback = [];
      try {
        feedback = feedbackRaw ? JSON.parse(feedbackRaw) : [];
      } catch (e) {
        console.error("Lỗi parse feedback:", e);
        feedback = [];
      }

      // IT EXPERT: DATA RECOVERY ALGORITHM
      // Automatically scan ecoheritage_reviews to recover any lost data from the v3 deletion
      const publicRaw = localStorage.getItem("ecoheritage_reviews");
      if (publicRaw) {
        try {
          const publicReviews = JSON.parse(publicRaw);
          const existingIds = new Set(feedback.map((f: any) => f.id));
          
          const recovered = publicReviews.filter((r: any) => !existingIds.has(r.id)).map((r: any) => ({
            id: r.id,
            author: r.author || r.userName || "Ẩn danh",
            remedyUsed: r.remedyUsed || r.remedyId || "Nền tảng EcoHeritage",
            content: r.content || r.comment || "",
            satisfaction: r.satisfaction || r.rating || 5,
            source: "user",
            category: (r.remedyId && r.remedyId !== "web-general" ? "heritage" : "web"),
            status: "pending",
            isRead: false,
            createdAt: r.createdAt || r.date || new Date().toISOString()
          }));
          
          if (recovered.length > 0) {
            feedback = [...recovered, ...feedback];
            // PERMANENTLY save recovered data so it doesn't get lost or reset
            localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
            // Force FeedbackSection to update
            window.dispatchEvent(new Event("storage_sync"));
            console.log("IT Expert: Đã phục hồi thành công", recovered.length, "góp ý bị mất!");
          }
        } catch (e) {
          console.error("Lỗi thuật toán cứu hộ:", e);
        }
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
      
      // IT Expert Fix: The list should show the latest pending items
      const displayItems = feedback.filter((f: any) => f.status === "pending")
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        
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
    const interval = setInterval(pollPending, 1000); // IT Expert: Super-fast 1s poll for instant sync
    
    // Listen for storage changes from other tabs (Feedback submissions)
    const handleStorageChange = (e: Event) => {
      // IT Expert: Handle both native storage and custom sync events
      pollPending();
    };
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

  const navigate = (id: AdminSectionId) => {
    setActiveSection(id);
    setIsMobileSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview": return <DashboardSection />;
      case "heritage": return <HeritageCMS />;
      case "feedback": return <FeedbackSection onPendingChange={pollPending} />;
      case "users": return <UsersSection />;
      default: return <DashboardSection />;
    }
  };

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 text-white shadow-[0_12px_34px_-18px_rgba(16,185,129,0.72)]">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-[#1E293B]">EcoHeritage AI</p>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Admin Portal</p>
        </div>
      </div>

      {/* Session Info */}
      <div className="mt-8 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Phiên làm việc</p>
        <p className="mt-3 text-sm font-medium text-slate-800">Xin chào, {ADMIN_USERNAME}</p>
        <p className="mt-1 text-sm text-slate-600">Dashboard đồng bộ AQI tự động.</p>
      </div>

      {/* Nav */}
      <nav className="mt-8 flex flex-1 flex-col gap-1.5">
        {sectionMeta.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => navigate(section.id)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-200 ${
                isActive
                  ? "bg-[#EFF6FF] shadow-[0_4px_16px_-6px_rgba(0,123,255,0.2)]"
                  : "hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className={`rounded-xl p-2 transition-colors ${isActive ? "bg-[#007BFF] text-white" : "bg-slate-100 text-slate-700"}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className={`block text-sm font-medium ${isActive ? "text-[#007BFF]" : "text-slate-900"}`}>{section.label}</span>
                  <span className="block text-xs text-slate-500">{section.hint}</span>
                </span>
              </span>
              <span className="flex items-center gap-2">
                {section.id === "feedback" && pendingCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white animate-pulse">
                    {pendingCount}
                  </span>
                )}
                {section.id === "users" && userCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-white">
                    {userCount}
                  </span>
                )}
                <ChevronRight className={`h-4 w-4 transition-colors ${isActive ? "text-[#007BFF]" : "text-slate-400"}`} />
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Nav Section */}
      <div className="space-y-2 border-t border-slate-200 pt-5">
        {/* IT Expert Diagnostic Panel */}
        <div className="mb-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Trạng thái hệ thống</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-slate-600 flex justify-between">
              <span>Đồng bộ:</span>
              <span className="font-mono text-emerald-600">Đang chạy...</span>
            </p>
            <p className="text-[11px] text-slate-600 flex justify-between">
              <span>Dữ liệu gốc:</span>
              <span className="font-mono">{localStorage.getItem(FEEDBACK_STORAGE_KEY) ? JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || "[]").length : 0} mục</span>
            </p>
          </div>
        </div>

        <Link to="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
          <ChevronRight className="h-4 w-4 rotate-180" /> Về website public
        </Link>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50">
          <LogOut className="h-4 w-4" /> Khóa portal
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#F8FAFC] text-[#1E293B]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[292px] border-r border-slate-200/80 bg-white/95 px-6 py-6 backdrop-blur-xl lg:flex lg:flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/35 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)}>
          <div className="h-full w-[86%] max-w-[320px] bg-white p-6 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold tracking-tight text-slate-950">EcoHeritage AI</p>
              <button onClick={() => setIsMobileSidebarOpen(false)} className="rounded-2xl border border-slate-200 p-3 text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Area */}
      <div className="flex h-screen flex-col lg:ml-[292px]">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/88 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setIsMobileSidebarOpen(true)} className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 lg:hidden">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#007BFF]">EcoHeritage AI</p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight text-[#1E293B] sm:text-2xl">
                  {sectionMeta.find(s => s.id === activeSection)?.label || "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    const nextOpen = !isNotifOpen;
                    setIsNotifOpen(nextOpen);
                    if (nextOpen) {
                      // Mark all as read locally and in storage when viewing
                      const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
                      if (raw) {
                        try {
                          const feedback = JSON.parse(raw);
                          const updated = feedback.map((f: any) => f.status === 'pending' ? { ...f, isRead: true } : f);
                          localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(updated));
                          
                          // IT Expert Fix: Update local states immediately so UI doesn't flicker or stay empty
                          setPendingCount(0);
                          setPendingNotifs(updated.filter((f: any) => f.status === 'pending').slice(0, 5));
                          
                          window.dispatchEvent(new Event("storage_sync"));
                        } catch (e) {
                          console.error("Lỗi update read status:", e);
                        }
                      }
                    }
                  }}
                  className={`relative rounded-2xl border p-3 transition ${isNotifOpen ? 'bg-amber-50 border-amber-300 text-amber-600' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:text-amber-600'}`}
                >
                  <Bell className="h-5 w-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-[0_2px_8px_rgba(244,63,94,0.4)]">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Notif */}
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
                    {pendingCount > 0 && (
                      <div className="border-t border-slate-100 p-2">
                        <button onClick={() => { setIsNotifOpen(false); navigate("feedback"); }} className="w-full py-2 text-xs font-semibold text-center text-[#007BFF] hover:bg-blue-50 rounded-xl transition">
                          Xem tất cả trong Quản lý
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button type="button" onClick={handleLogout} className="hidden rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 sm:inline-flex sm:items-center sm:gap-2">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
