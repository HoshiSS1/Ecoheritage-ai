import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquareQuote, CheckCircle2, Clock, Filter, Globe, Leaf, Trash2, Star, Trash } from "lucide-react";
import { toast } from "sonner";
import {
  shellCardClass, formatDateTime, loadStoredState,
  FEEDBACK_STORAGE_KEY, FeedbackRecord,
} from "./adminUtils";
import { createSeedFeedback } from "./adminData";
import { ConfirmDialog } from "./ConfirmDialog";

interface FeedbackSectionProps { onPendingChange?: () => void; }
type TabId = "all" | "web" | "heritage" | "pending";

export function FeedbackSection({ onPendingChange }: FeedbackSectionProps) {
  const [records, setRecords] = useState<FeedbackRecord[]>(() =>
    loadStoredState(FEEDBACK_STORAGE_KEY, createSeedFeedback())
  );
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; author: string } | null>(null);
  const [bulkDeleteActive, setBulkDeleteActive] = useState(false);

  // IT Expert Fix: Bulletproof polling + event listening for 100% sync guarantee
  useEffect(() => {
    // 1. Safe Sync seeded data: Load FRESH from storage first
    const freshData = loadStoredState(FEEDBACK_STORAGE_KEY, []);
    const seedData = createSeedFeedback();
    const existingIds = new Set(freshData.map(r => r.id));
    const missingSeeds = seedData.filter(s => !existingIds.has(s.id));
    
    if (missingSeeds.length > 0) {
      const merged = [...missingSeeds, ...freshData];
      setRecords(merged);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(merged));
    } else {
      setRecords(freshData);
    }
    
    // 2. The ultimate sync function
    const syncFromStorage = () => {
      setRecords(prev => {
        const next = loadStoredState(FEEDBACK_STORAGE_KEY, []);
        // Only update state if data actually changed to prevent render loops
        if (JSON.stringify(prev) !== JSON.stringify(next)) {
          return next;
        }
        return prev;
      });
    };

    // 3. Listen to all possible events AND poll every 2 seconds as a fallback
    window.addEventListener('storage', syncFromStorage);
    window.addEventListener('storage_sync', syncFromStorage);
    const interval = setInterval(syncFromStorage, 2000);
    
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener('storage_sync', syncFromStorage);
      clearInterval(interval);
    };
  }, []);

  const persist = (next: FeedbackRecord[]) => {
    setRecords(next);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
    onPendingChange?.();
  };

  // Filter and sort so NEWEST is ALWAYS AT THE TOP
  const filtered = records.filter(r => {
    if (activeTab === "web") return (r.category || "web") === "web";
    if (activeTab === "heritage") return r.category === "heritage";
    if (activeTab === "pending") return r.status === "pending";
    return true;
  }).sort((a, b) => new Date(b.createdAt || Date.now()).getTime() - new Date(a.createdAt || Date.now()).getTime());

  const approveOne = (id: string) => {
    setRecords(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: "published" as const } : r);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
      onPendingChange?.();
      return next;
    });
    toast.success("Đã phê duyệt nhận xét!");
  };
  
  const approveAll = () => {
    setRecords(prev => {
      const next = prev.map(r => r.status === "pending" ? { ...r, status: "published" as const } : r);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
      onPendingChange?.();
      return next;
    });
    toast.success("Đã phê duyệt tất cả!");
  };

  const handleDelete = (id: string) => {
    setRecords(prev => {
      const next = prev.filter(r => r.id !== id);
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(next));
      onPendingChange?.();
      return next;
    });

    // 2. IMPORTANT: Remove from Public Pool to stop "Ghost Sync"
    const publicRaw = localStorage.getItem("ecoheritage_reviews");
    if (publicRaw) {
      try {
        const publicReviews = JSON.parse(publicRaw);
        const filteredPublic = publicReviews.filter((r: any) => r.id !== id);
        localStorage.setItem("ecoheritage_reviews", JSON.stringify(filteredPublic));
      } catch (e) {}
    }

    toast.success("Đã xóa vĩnh viễn nhận xét.");
  };

  const handleBulkDelete = () => {
    const idsToRemove = new Set(filtered.map(r => r.id));
    const next = records.filter(r => !idsToRemove.has(r.id));
    persist(next);

    // Clean up public pool too
    const publicRaw = localStorage.getItem("ecoheritage_reviews");
    if (publicRaw) {
      const publicReviews = JSON.parse(publicRaw);
      const filteredPublic = publicReviews.filter((r: any) => !idsToRemove.has(r.id));
      localStorage.setItem("ecoheritage_reviews", JSON.stringify(filteredPublic));
    }

    setBulkDeleteActive(false);
    toast.success(`Đã xóa sạch ${idsToRemove.size} nhận xét.`);
  };

  const pendingCount = records.filter(r => r.status === "pending").length;
  const webCount = records.filter(r => (r.category || "web") === "web").length;
  const heritageCount = records.filter(r => r.category === "heritage").length;

  const tabs: { id: TabId; label: string; icon: any; count: number }[] = [
    { id: "all", label: "Tất cả", icon: Filter, count: records.length },
    { id: "web", label: "Web", icon: Globe, count: webCount },
    { id: "heritage", label: "Di sản", icon: Leaf, count: heritageCount },
    { id: "pending", label: "Chờ duyệt", icon: Clock, count: pendingCount },
  ];

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#007BFF]">Module 3</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Quản lý tương tác & đánh giá</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Nhận xét phải được <strong>duyệt</strong> mới hiển thị trên trang công khai.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-5 mb-6">
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Đã duyệt</p><p className="text-2xl font-semibold text-slate-950">{records.filter(r => r.status === "published").length}</p></div></div></div>
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-2"><Clock className="h-4 w-4 text-amber-600" /></div><div><p className="text-sm text-slate-500">Chờ duyệt</p><p className="text-2xl font-semibold text-slate-950">{pendingCount}</p></div></div></div>
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-2"><Star className="h-4 w-4 text-amber-600" /></div><div><p className="text-sm text-slate-500">Tiêu biểu</p><p className="text-2xl font-semibold text-slate-950">{records.filter(r => r.isFeatured).length}</p></div></div></div>
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-50 p-2"><Globe className="h-4 w-4 text-blue-600" /></div><div><p className="text-sm text-slate-500">Nhận xét Web</p><p className="text-2xl font-semibold text-slate-950">{webCount}</p></div></div></div>
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2"><Leaf className="h-4 w-4 text-emerald-600" /></div><div><p className="text-sm text-slate-500">Nhận xét Di sản</p><p className="text-2xl font-semibold text-slate-950">{heritageCount}</p></div></div></div>
      </div>

      <div className={`${shellCardClass} overflow-hidden`}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-3 sm:px-6 overflow-x-auto">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${activeTab === tab.id ? "bg-[#EFF6FF] text-[#007BFF] shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}>
                <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-[#007BFF] text-white" : "bg-slate-100 text-slate-500"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {filtered.length > 0 && (
              <button onClick={() => setBulkDeleteActive(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors">
                <Trash className="h-3.5 w-3.5" /> Xóa mục này
              </button>
            )}
            {pendingCount > 0 && <button onClick={approveAll} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Duyệt tất cả ✓</button>}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="mb-6 rounded-full bg-slate-50 p-8 shadow-inner"><MessageSquareQuote className="h-14 w-14 text-slate-300" /></div>
            <h4 className="text-xl font-semibold text-slate-600">Hiện chưa có phản hồi nào</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  <th className="px-6 py-4 text-left">Người đóng góp</th>
                  <th className="px-6 py-4 text-left">Nội dung</th>
                  <th className="px-6 py-4 text-center">Luồng</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(fb => (
                  <tr key={fb.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold ${fb.source === "seeded" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                          {fb.author.charAt(0).toUpperCase()}
                        </div>
                        <div><p className="font-semibold text-slate-900 text-[15px]">{fb.author}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-md">
                      <p className="text-xs font-bold text-slate-900 mb-1">{fb.remedyUsed}</p>
                      <p className="text-sm leading-relaxed text-slate-600 italic">"{fb.content}"</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${fb.category === "heritage" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                        {fb.category === "heritage" ? <Leaf className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                        {fb.category === "heritage" ? "Di sản" : "Web"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${fb.status === "published" ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                          {fb.status === "published" ? "Đã duyệt" : "Chờ duyệt"}
                        </span>
                        {fb.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-amber-100 text-amber-600 ring-1 ring-amber-200 mt-1">
                            ★ Đang hiện ngoài
                          </span>
                        )}
                        {!fb.isRead && fb.status === "pending" && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-blue-100 text-blue-600 ring-1 ring-blue-200 animate-pulse">
                            NEW
                          </span>
                        )}
                        <p className="text-[10px] font-medium text-slate-400 mt-1">{formatDateTime(fb.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {fb.status === "published" && (
                          <button 
                            onClick={() => {
                              const category = fb.category || 'web';
                              const currentlyFeaturedCount = records.filter(r => r.category === category && r.isFeatured).length;
                              if (!fb.isFeatured && currentlyFeaturedCount >= 4) {
                                toast.error(`Chỉ được phép hiển thị tối đa 4 nhận xét tiêu biểu cho luồng ${category === 'web' ? 'Web' : 'Di sản'}.`);
                                return;
                              }
                              persist(records.map(r => r.id === fb.id ? { ...r, isFeatured: !r.isFeatured } : r));
                            }}
                            className={`group relative flex items-center justify-center h-6 w-12 rounded-full p-1 transition-all duration-500 ${fb.isFeatured ? "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]" : "bg-slate-200"}`}
                          >
                            <motion.div 
                              animate={{ x: fb.isFeatured ? 12 : -12 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="h-4 w-4 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden"
                            >
                              {fb.isFeatured && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                            </motion.div>
                          </button>
                        )}
                        {fb.status === "pending" && (
                          <button onClick={() => approveOne(fb.id)} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700">Duyệt</button>
                        )}
                        <button onClick={() => setDeleteTarget({ id: fb.id, author: fb.author })} className="p-2 text-slate-300 hover:text-rose-600 transition">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa nhận xét?"
        message={`Bạn sắp xóa nhận xét của "${deleteTarget?.author}". Hành động này không thể hoàn tác.`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        isOpen={bulkDeleteActive}
        title={`Xóa mục ${activeTab}?`}
        message={`Hệ thống sẽ xóa vĩnh viễn ${filtered.length} nhận xét trong mục này. Bạn có chắc chắn?`}
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteActive(false)}
      />
    </div>
  );
}
