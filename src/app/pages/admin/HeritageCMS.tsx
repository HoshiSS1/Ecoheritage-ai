import { useMemo, useRef, useState } from "react";
import { Plus, Save, SquarePen, Trash2, X, Upload, Image as ImageIcon, Loader2, Search, Database } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  shellCardClass, createId, formatDateTime, compressImage,
  loadStoredState, REMEDIES_STORAGE_KEY, RemedyRecord,
} from "./adminUtils";
import { createSeedRemedies } from "./adminData";
import { ConfirmDialog } from "./ConfirmDialog";
import { traditionalRemedies } from "../../data";

// Build a map of remedy id -> imageUrl from the main data source
const remedyImageMap: Record<string, string> = {};
traditionalRemedies.forEach((r) => {
  if (r.imageUrl && typeof r.imageUrl === "string") {
    remedyImageMap[r.id] = r.imageUrl;
  }
});

// On first load, enrich seed remedies with actual images
function getEnrichedRemedies(): RemedyRecord[] {
  try {
    const stored = loadStoredState<RemedyRecord[] | null>(REMEDIES_STORAGE_KEY, null);
    if (stored && Array.isArray(stored)) {
      // Enrich existing records with images from data.ts if missing
      return stored.map((r) => {
        if (r && !r.imageBase64 && remedyImageMap[r.id]) {
          return { ...r, imageBase64: remedyImageMap[r.id] };
        }
        return r;
      });
    }
    // First time: create seed with images
    const seeds = createSeedRemedies();
    if (!Array.isArray(seeds)) return [];
    
    return seeds.map((r) => ({
      ...r,
      imageBase64: remedyImageMap[r.id] || "",
    }));
  } catch (e) {
    console.error("Critical error in getEnrichedRemedies:", e);
    return [];
  }
}

export function HeritageCMS() {
  const [remedies, setRemedies] = useState<RemedyRecord[]>(getEnrichedRemedies);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    category: "Thanh nhiệt",
    ingredients: "", 
    method: "", 
    doctorNote: "", 
    benefits: "",
    description: "",
    status: "published" as "published" | "draft",
    imageBase64: "" 
  });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist — store without large bundled images (only user-uploaded base64)
  const persist = (next: RemedyRecord[]) => {
    setRemedies(next);
    // For storage, strip bundled image URLs to save space (they come from imports)
    const forStorage = next.map((r) => ({
      ...r,
      imageBase64: r.imageBase64?.startsWith("data:") ? r.imageBase64 : "",
    }));
    localStorage.setItem(REMEDIES_STORAGE_KEY, JSON.stringify(forStorage));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ 
      name: "", 
      category: "Thanh nhiệt",
      ingredients: "", 
      method: "", 
      doctorNote: "", 
      benefits: "",
      description: "",
      status: "published",
      imageBase64: "" 
    });
    setIsSlideOpen(true);
  };

  const openEdit = (r: RemedyRecord) => {
    setEditingId(r.id);
    setForm({ 
      name: r.name, 
      category: r.category || "Dân gian",
      ingredients: r.ingredients, 
      method: r.method, 
      doctorNote: r.doctorNote, 
      benefits: r.benefits || "",
      description: r.description || "",
      status: r.status || "published",
      imageBase64: r.imageBase64 || "" 
    });
    setIsSlideOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 600, 600, 0.7);
      setForm(prev => ({ ...prev, imageBase64: compressed }));
      toast.success("Đã tải ảnh lên và nén thành công!");
    } catch {
      // Error already toasted inside compressImage
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên bài thuốc!", { style: { borderLeft: "4px solid #ef4444" } });
      return;
    }
    if (!form.ingredients.trim()) {
      toast.error("Vui lòng nhập thành phần!", { style: { borderLeft: "4px solid #ef4444" } });
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      if (editingId) {
        persist(remedies.map(r => r.id === editingId ? { ...r, ...form, updatedAt: new Date().toISOString() } : r));
        toast.success(`✅ Đã lưu chỉnh sửa "${form.name}"`, {
          description: "Bài thuốc đã được cập nhật trong CMS.",
          style: { background: "linear-gradient(135deg, #f0fdf4, #fff)", borderLeft: "4px solid #22c55e" },
        });
      } else {
        const newRemedy: RemedyRecord = {
          id: createId("remedy"),
          ...form,
          updatedAt: new Date().toISOString(),
        };
        persist([newRemedy, ...remedies]);
        toast.success(`✅ Đã thêm "${form.name}" vào CMS`, {
          description: "Bài thuốc mới đã sẵn sàng.",
          style: { background: "linear-gradient(135deg, #f0fdf4, #fff)", borderLeft: "4px solid #22c55e" },
        });
      }
      setIsSaving(false);
      setIsSlideOpen(false);
    }, 800);
  };

  const handleDelete = (id: string) => {
    const updated = remedies.filter(r => r.id !== id);
    persist(updated);
    toast.success("Đã xóa bài thuốc.", { style: { borderLeft: "4px solid #f59e0b" } });
  };

  const filteredRemedies = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return remedies;
    return remedies.filter((remedy) =>
      remedy.name.toLowerCase().includes(normalized) ||
      remedy.ingredients.toLowerCase().includes(normalized) ||
      remedy.doctorNote.toLowerCase().includes(normalized) ||
      remedy.method.toLowerCase().includes(normalized)
    );
  }, [remedies, searchTerm]);

  // Resolve image source: either base64 or bundled import URL
  const getImageSrc = (r: RemedyRecord): string | undefined => {
    if (r.imageBase64) return r.imageBase64;
    return remedyImageMap[r.id] || undefined;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007BFF] mb-2">Module 2</p>
        <h2 className="text-3xl font-black tracking-tighter text-[#1E293B] sm:text-4xl leading-tight">Quản lý Kho Bài thuốc</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-500 font-medium italic">
          Số hóa và bảo tồn tri thức y học cổ truyền Việt Nam. Quản lý toàn diện các bản ghi di sản, thành phần và phương pháp chế biến dược liệu trong hệ thống.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-8 sm:flex-row sm:items-center sm:justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20"><Database className="h-7 w-7" /></div>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-wider">Danh mục bài thuốc</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{filteredRemedies.length} bản ghi số hóa</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm bài thuốc, thành phần..."
                className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 placeholder:text-slate-400"
              />
            </div>
            <button onClick={openAdd} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-amber-400 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-[#051a11] transition hover:bg-amber-300 shadow-xl shadow-amber-400/10">
              <Plus className="h-5 w-5" /> Thêm bài thuốc
            </button>
          </div>
        </div>

        {remedies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-4">
            <div className="mb-6 rounded-full bg-slate-50 p-8 shadow-inner"><ImageIcon className="h-16 w-16 text-slate-200" /></div>
            <h4 className="text-lg font-semibold text-slate-400">Không tìm thấy di sản nào</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-6 text-left">Bài thuốc / Di sản</th>
                  <th className="px-5 py-6 text-left">Hình ảnh</th>
                  <th className="px-5 py-6 text-left">Dược liệu chính</th>
                  <th className="px-5 py-6 text-center">Cập nhật</th>
                  <th className="px-6 py-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRemedies.slice(0, 25).map((remedy) => {
                  const imgSrc = getImageSrc(remedy);
                  return (
                    <tr key={remedy.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                      <td className="px-6 py-6">
                        <p className="font-bold text-slate-900 text-[15px] group-hover:text-emerald-600 transition-colors">{remedy.name}</p>
                        <p className="mt-1 line-clamp-1 max-w-sm text-[11px] text-slate-400 font-medium italic">"{remedy.doctorNote}"</p>
                      </td>
                      <td className="px-5 py-6">
                        {imgSrc ? (
                          <img src={imgSrc} alt={remedy.name} className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-md group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200"><ImageIcon className="h-5 w-5 text-slate-300" /></div>
                        )}
                      </td>
                      <td className="px-5 py-6"><p className="line-clamp-2 max-w-md text-sm text-slate-600 font-medium leading-relaxed">{remedy.ingredients}</p></td>
                      <td className="px-5 py-6 text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">{formatDateTime(remedy.updatedAt)}</td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => openEdit(remedy)} className="rounded-xl bg-white border border-slate-200 p-3 text-emerald-600 transition hover:bg-emerald-50 hover:border-emerald-200 shadow-sm active:scale-95" title="Sửa">
                            <SquarePen className="h-5 w-5" />
                          </button>
                          <button onClick={() => setDeleteTarget({ id: remedy.id, name: remedy.name })} className="rounded-xl bg-white border border-rose-100 p-3 text-rose-500 transition hover:bg-rose-50 hover:border-rose-200 shadow-sm active:scale-95" title="Xóa">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Panel */}
      <AnimatePresence>
        {isSlideOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSlideOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 35, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-white border-l border-slate-200 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-10 py-8 bg-slate-50/50">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Di sản Editor</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900 uppercase tracking-tight">{editingId ? "Cập nhật dữ liệu" : "Thêm mới di sản"}</h3>
                </div>
                  <button onClick={() => setIsSlideOpen(false)} className="rounded-2xl border border-slate-200 p-3 text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-10 py-10 space-y-8 custom-scrollbar bg-white">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Hình ảnh minh họa</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  {form.imageBase64 ? (
                    <div className="relative group overflow-hidden rounded-[32px] border border-slate-200 shadow-xl">
                      <img src={form.imageBase64} alt="Preview" className="w-full h-64 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest mr-2 hover:bg-amber-400 transition-colors shadow-2xl">Thay đổi</button>
                        <button type="button" onClick={() => setForm(prev => ({ ...prev, imageBase64: "" }))} className="bg-rose-500 text-white p-4 rounded-full hover:bg-rose-600 transition-colors shadow-2xl"><Trash2 className="h-5 w-5" /></button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full h-56 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-emerald-400/50 hover:bg-emerald-50 hover:text-emerald-600 transition-all group shadow-inner">
                      <div className="bg-white p-6 rounded-2xl shadow-sm group-hover:scale-110 transition-transform"><Upload className="h-8 w-8" /></div>
                      <div className="text-center">
                        <span className="block text-sm font-bold">Chọn ảnh từ thiết bị</span>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Tối đa 5MB · Auto-compressed</span>
                      </div>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <label htmlFor="remedy-name" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Tên di sản y lý <span className="text-rose-500">*</span></label>
                  <input id="remedy-name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-emerald-500/50 focus:bg-white focus:outline-none transition-all font-black" placeholder="Ví dụ: Cao Atisô Đà Lạt" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label htmlFor="remedy-category" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Phân loại <span className="text-rose-500">*</span></label>
                    <select id="remedy-category" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:border-emerald-500/50 focus:bg-white focus:outline-none transition-all font-bold text-sm">
                      <option value="Thanh nhiệt">Thanh nhiệt</option>
                      <option value="Tiêu hóa">Tiêu hóa</option>
                      <option value="An thần">An thần</option>
                      <option value="Giải độc">Giải độc</option>
                      <option value="Dân gian">Dân gian</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label htmlFor="remedy-status" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Trạng thái <span className="text-rose-500">*</span></label>
                    <select id="remedy-status" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:border-emerald-500/50 focus:bg-white focus:outline-none transition-all font-bold text-sm">
                      <option value="published">Công khai</option>
                      <option value="draft">Bản nháp</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="remedy-ingredients" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Thành phần dược liệu <span className="text-rose-500">*</span></label>
                  <textarea id="remedy-ingredients" value={form.ingredients} onChange={e => setForm(prev => ({ ...prev, ingredients: e.target.value }))}
                    rows={3} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-medium outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300" placeholder="Danh sách các loại thảo mộc..." />
                </div>

                <div className="space-y-4">
                  <label htmlFor="remedy-description" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Mô tả tóm tắt <span className="text-rose-500">*</span></label>
                  <textarea id="remedy-description" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={2} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-medium outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300" placeholder="Mô tả ngắn gọn về bài thuốc..." />
                </div>

                <div className="space-y-4">
                  <label htmlFor="remedy-benefits" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Công dụng & Lợi ích <span className="text-rose-500">*</span></label>
                  <textarea id="remedy-benefits" value={form.benefits} onChange={e => setForm(prev => ({ ...prev, benefits: e.target.value }))}
                    rows={2} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 font-medium outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300" placeholder="Các tác dụng chính đối với sức khỏe..." />
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="remedy-method" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Quy trình bào chế</label>
                    <textarea id="remedy-method" value={form.method} onChange={e => setForm(prev => ({ ...prev, method: e.target.value }))}
                      rows={5} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 text-sm outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300" placeholder="Mô tả các bước thực hiện..." />
                  </div>
 
                  <div className="space-y-4">
                    <label htmlFor="remedy-doctor-note" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Khuyến nghị chuyên gia</label>
                    <textarea id="remedy-doctor-note" value={form.doctorNote} onChange={e => setForm(prev => ({ ...prev, doctorNote: e.target.value }))}
                      rows={3} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-slate-900 text-sm italic outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300" placeholder="Lời dặn hoặc lưu ý khi sử dụng..." />
                  </div>
                </div>

                <div className="pt-6 pb-4">
                  <button type="submit" disabled={isSaving}
                    className="w-full inline-flex items-center justify-center gap-4 rounded-[32px] bg-amber-400 px-6 py-6 text-[#051a11] text-sm font-black uppercase tracking-widest transition hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_50px_rgba(251,191,36,0.2)]">
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                    {isSaving ? "Đang lưu dữ liệu..." : editingId ? "Cập nhật di sản" : "Lưu vào kho di sản"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa bài thuốc?"
        message={`Bạn sắp xóa "${deleteTarget?.name}". Hành động này không thể hoàn tác.`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
