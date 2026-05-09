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
import { getAvatarUrl } from "../../utils/avatarUtils";

interface FeedbackSectionProps { onPendingChange?: () => void; }
type TabId = "all" | "web" | "heritage" | "pending";

export function FeedbackSection({ onPendingChange }: FeedbackSectionProps) {
  const [records, setRecords] = useState<FeedbackRecord[]>(() =>
    loadStoredState(FEEDBACK_STORAGE_KEY, createSeedFeedback())
  );
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchTerm, setSearchTerm] = useState("");
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
        if (JSON.stringify(prev) !== JSON.stringify(next)) {
          return next;
        }
        return prev;
      });
    };

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
    const matchesSearch = r.author.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.content.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

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
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007BFF] mb-2">Module 4</p>
        <h2 className="text-3xl font-black tracking-tighter text-[#1E293B] sm:text-4xl leading-tight">Quản lý Tương tác & Đánh giá</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-500 font-medium italic">
          Điều phối và kiểm duyệt phản hồi từ cộng đồng. Các nhận xét phải được <strong className="text-emerald-600 underline">xác thực</strong> bởi quản trị viên trước khi hiển thị chính thức trên nền tảng EcoHeritage.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-5 mb-8">
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-500/10 p-2 border border-emerald-500/20"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Đã duyệt</p><p className="text-2xl font-bold text-slate-900">{records.filter(r => r.status === "published").length}</p></div></div></div>
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-500/10 p-2 border border-amber-500/20"><Clock className="h-4 w-4 text-amber-600" /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chờ duyệt</p><p className="text-2xl font-bold text-slate-900">{pendingCount}</p></div></div></div>
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-500/10 p-2 border border-amber-500/20"><Star className="h-4 w-4 text-amber-600" /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tiêu biểu</p><p className="text-2xl font-bold text-slate-900">{records.filter(r => r.isFeatured).length}</p></div></div></div>
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-blue-500/10 p-2 border border-blue-500/20"><Globe className="h-4 w-4 text-blue-600" /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Web</p><p className="text-2xl font-bold text-slate-900">{webCount}</p></div></div></div>
        <div className={`${shellCardClass} p-5`}><div className="flex items-center gap-3"><div className="rounded-xl bg-emerald-500/10 p-2 border border-emerald-500/20"><Leaf className="h-4 w-4 text-emerald-600" /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Di sản</p><p className="text-2xl font-bold text-slate-900">{heritageCount}</p></div></div></div>
      </div>

      <div className={`${shellCardClass} overflow-hidden`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 bg-slate-50/50">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all border ${activeTab === tab.id ? "bg-emerald-600 text-white border-emerald-600 shadow-lg" : "bg-white text-slate-400 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"}`}>
                <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ml-1 ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="Tìm người gửi, nội dung..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500/50 transition-all"
              />
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
            </div>
            {filtered.length > 0 && (
              <button onClick={() => setBulkDeleteActive(true)} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-600 transition-colors">
                <Trash className="h-3.5 w-3.5" /> Xóa nhóm
              </button>
            )}
            {pendingCount > 0 && <button onClick={approveAll} className="text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-700">Duyệt hết ✓</button>}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <div className="mb-6 rounded-full bg-slate-50 p-8 shadow-inner"><MessageSquareQuote className="h-16 w-16 text-slate-200" /></div>
            <h4 className="text-lg font-semibold text-slate-400">Không tìm thấy phản hồi nào</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                  <th className="px-6 py-5 text-left">Người đóng góp</th>
                  <th className="px-6 py-5 text-left">Nội dung & Di sản</th>
                  <th className="px-6 py-5 text-center">Đánh giá</th>
                  <th className="px-6 py-5 text-center">Trạng thái</th>
                  <th className="px-6 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(fb => (
                  <tr key={fb.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="relative group/avatar shrink-0">
                          <div className="w-11 h-11 rounded-2xl p-[2px] bg-gradient-to-tr from-emerald-500 to-amber-400 shadow-sm transition-transform group-hover/avatar:scale-110">
                            <div className="w-full h-full rounded-[14px] bg-white p-[1px] overflow-hidden">
                              <img 
                                src={getAvatarUrl(fb.author)} 
                                alt={fb.author} 
                                className="w-full h-full object-cover grayscale-[0.1] contrast-125"
                              />
                            </div>
                          </div>
                        </div>
                        <div><p className="font-bold text-slate-900 text-[15px]">{fb.author}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-md">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-2">{fb.remedyUsed}</p>
                      <p className="text-sm leading-relaxed text-slate-600 italic font-medium">"{fb.content}"</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-2.5 w-2.5 ${i < (fb.satisfaction || 5) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                      <p className="text-[9px] font-black text-slate-300 mt-2 uppercase tracking-widest">{fb.category === "heritage" ? "Di sản" : "Web"}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] shadow-sm border ${
                          fb.status === "published" 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          <div className={`h-1.5 w-1.5 rounded-full ${fb.status === "pending" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                          {fb.status === "published" ? "Đã duyệt" : "Chờ duyệt"}
                        </span>
                        {fb.isFeatured && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-amber-400 text-[#051a11] shadow-sm mt-1">
                            ★ Featured
                          </span>
                        )}
                        <p className="text-[10px] font-bold text-slate-300 mt-2">{formatDateTime(fb.createdAt)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {fb.status === "pending" && (
                          <button
                            onClick={() => approveOne(fb.id)}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                            title="Duyệt nhận xét"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {fb.status === "published" && (
                          <button 
                            onClick={() => {
                              const category = fb.category || 'web';
                              const currentlyFeaturedCount = records.filter(r => r.category === category && r.isFeatured).length;
                              if (!fb.isFeatured && currentlyFeaturedCount >= 4) {
                                toast.error(`Tối đa 4 nhận xét cho luồng ${category === 'web' ? 'Web' : 'Di sản'}.`);
                                return;
                              }
                              persist(records.map(r => r.id === fb.id ? { ...r, isFeatured: !r.isFeatured } : r));
                            }}
                            className={`group relative flex items-center justify-center h-6 w-12 rounded-full p-1 transition-all duration-500 shadow-inner ${fb.isFeatured ? "bg-amber-400" : "bg-slate-100"}`}
                            title="Đánh dấu tiêu biểu"
                          >
                            <motion.div 
                              animate={{ x: fb.isFeatured ? 12 : -12 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="h-4 w-4 rounded-full bg-white shadow-md flex items-center justify-center"
                            >
                              {fb.isFeatured && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />}
                            </motion.div>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget({ id: fb.id, author: fb.author })}
                          className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash2 className="h-4 w-4" />
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
