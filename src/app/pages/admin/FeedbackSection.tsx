import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquareQuote, CheckCircle2, Clock, Filter, Globe, FlaskConical, Trash2, Star, Trash } from "lucide-react";
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
    toast.success("Đã xóa vĩnh viễn nhận xét.");
  };

  const handleBulkDelete = () => {
    const idsToRemove = new Set(filtered.map(r => r.id));
    const next = records.filter(r => !idsToRemove.has(r.id));
    persist(next);
    setBulkDeleteActive(false);
    toast.success(`Đã xóa sạch ${idsToRemove.size} nhận xét.`);
  };

  const pendingCount = records.filter(r => r.status === "pending").length;
  const webCount = records.filter(r => (r.category || "web") === "web").length;
  const heritageCount = records.filter(r => r.category === "heritage").length;

  const tabs: { id: TabId; label: string; icon: any; count: number }[] = [
    { id: "all", label: "Tất cả", icon: Filter, count: records.length },
    { id: "web", label: "Web", icon: Globe, count: webCount },
    { id: "heritage", label: "Bài thuốc", icon: FlaskConical, count: heritageCount },
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

      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-8">
        <div className={`${shellCardClass} p-5 bg-gradient-to-br from-white to-slate-50 border-emerald-100/50`}><div className="flex items-center gap-3"><div className="rounded-2xl bg-emerald-500/10 p-2.5 border border-emerald-500/20 shadow-inner"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đã duyệt</p><p className="text-2xl font-black text-slate-800 tracking-tight">{records.filter(r => r.status === "published").length}</p></div></div></div>
        <div className={`${shellCardClass} p-5 bg-gradient-to-br from-white to-slate-50 border-amber-100/50`}><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-500/10 p-2.5 border border-amber-500/20 shadow-inner"><Clock className="h-5 w-5 text-amber-600" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chờ duyệt</p><p className="text-2xl font-black text-slate-800 tracking-tight">{pendingCount}</p></div></div></div>
        <div className={`${shellCardClass} p-5 bg-gradient-to-br from-white to-slate-50 border-amber-100/50`}><div className="flex items-center gap-3"><div className="rounded-2xl bg-amber-500/10 p-2.5 border border-amber-500/20 shadow-inner"><Star className="h-5 w-5 text-amber-600" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiêu biểu</p><p className="text-2xl font-black text-slate-800 tracking-tight">{records.filter(r => r.isFeatured).length}</p></div></div></div>
        <div className={`${shellCardClass} p-5 bg-gradient-to-br from-white to-slate-50 border-blue-100/50`}><div className="flex items-center gap-3"><div className="rounded-2xl bg-blue-500/10 p-2.5 border border-blue-500/20 shadow-inner"><Globe className="h-5 w-5 text-blue-600" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Góp ý Web</p><p className="text-2xl font-black text-slate-800 tracking-tight">{webCount}</p></div></div></div>
        <div className={`${shellCardClass} p-5 bg-gradient-to-br from-white to-slate-50 border-emerald-100/50`}><div className="flex items-center gap-3"><div className="rounded-2xl bg-emerald-500/10 p-2.5 border border-emerald-500/20 shadow-inner"><FlaskConical className="h-5 w-5 text-emerald-600" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bài thuốc</p><p className="text-2xl font-black text-slate-800 tracking-tight">{heritageCount}</p></div></div></div>
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
          <div className="flex flex-col items-center justify-center py-24 px-4 bg-white">
            <div className="mb-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 p-10 shadow-inner"><MessageSquareQuote className="h-20 w-20 text-slate-200" /></div>
            <h4 className="text-xl font-black text-slate-800 tracking-tight">Không tìm thấy phản hồi nào</h4>
            <p className="text-sm text-slate-400 font-medium mt-2">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="p-6 bg-slate-50/30">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(fb => (
                <div key={fb.id} className="group relative bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Header: User Info & Actions */}
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-[1.25rem] p-[2px] bg-gradient-to-tr from-emerald-400 to-emerald-100 shadow-md">
                          <div className="w-full h-full rounded-[1.1rem] bg-white p-[2px] overflow-hidden">
                            <img src={getAvatarUrl(fb.author, fb.authorEmail)} alt={fb.author} className="w-full h-full object-cover rounded-[0.9rem]" />
                          </div>
                        </div>
                        {fb.isFeatured && (
                          <div className="absolute -bottom-1 -right-1 bg-amber-400 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <Star className="w-3 h-3 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-[15px]">{fb.author}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{formatDateTime(fb.createdAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {fb.status === "pending" && (
                        <button onClick={() => approveOne(fb.id)} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors" title="Duyệt">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}
                      {fb.status === "published" && (
                        <button onClick={() => {
                          const category = fb.category || 'web';
                          const currentlyFeaturedCount = records.filter(r => r.category === category && r.isFeatured).length;
                          if (!fb.isFeatured && currentlyFeaturedCount >= 4) { toast.error(`Tối đa 4 nhận xét cho ${category === 'web' ? 'Web' : 'Di sản'}.`); return; }
                          persist(records.map(r => r.id === fb.id ? { ...r, isFeatured: !r.isFeatured } : r));
                        }} className={`p-2 rounded-xl transition-colors ${fb.isFeatured ? 'bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`} title={fb.isFeatured ? "Bỏ tiêu biểu" : "Đánh dấu tiêu biểu"}>
                          <Star className={`w-4 h-4 ${fb.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      )}
                      <button onClick={() => setDeleteTarget({ id: fb.id, author: fb.author })} className="p-2 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Rating & Category */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < (fb.satisfaction || 5) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                      ))}
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${fb.category === "heritage" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border border-blue-100"}`}>
                      {fb.category === "heritage" ? "Bài thuốc" : "Web"}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-slate-50/80 border border-slate-100 rounded-2xl p-4 relative z-10">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <MessageSquareQuote className="w-3 h-3" /> {fb.remedyUsed}
                    </p>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic line-clamp-4">"{fb.content}"</p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="mt-4 flex items-center justify-between relative z-10 border-t border-slate-100 pt-4">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${fb.status === "published" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-amber-500 animate-pulse"}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${fb.status === "published" ? "text-emerald-600" : "text-amber-600"}`}>
                           {fb.status === "published" ? "Đã xác thực" : "Đang chờ duyệt"}
                        </span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
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
