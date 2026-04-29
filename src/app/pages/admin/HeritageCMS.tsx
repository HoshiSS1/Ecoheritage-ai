import { useState, useRef } from "react";
import { Plus, Save, SquarePen, Trash2, X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
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
  const stored = loadStoredState<RemedyRecord[] | null>(REMEDIES_STORAGE_KEY, null);
  if (stored) {
    // Enrich existing records with images from data.ts if missing
    return stored.map((r) => {
      if (!r.imageBase64 && remedyImageMap[r.id]) {
        return { ...r, imageBase64: remedyImageMap[r.id] };
      }
      return r;
    });
  }
  // First time: create seed with images
  return createSeedRemedies().map((r) => ({
    ...r,
    imageBase64: remedyImageMap[r.id] || "",
  }));
}

export function HeritageCMS() {
  const [remedies, setRemedies] = useState<RemedyRecord[]>(getEnrichedRemedies);
  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ name: "", ingredients: "", method: "", doctorNote: "", imageBase64: "" });
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
    setForm({ name: "", ingredients: "", method: "", doctorNote: "", imageBase64: "" });
    setIsSlideOpen(true);
  };

  const openEdit = (r: RemedyRecord) => {
    setEditingId(r.id);
    setForm({ name: r.name, ingredients: r.ingredients, method: r.method, doctorNote: r.doctorNote, imageBase64: r.imageBase64 || "" });
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

  // Resolve image source: either base64 or bundled import URL
  const getImageSrc = (r: RemedyRecord): string | undefined => {
    if (r.imageBase64) return r.imageBase64;
    return remedyImageMap[r.id] || undefined;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#007BFF]">Module 2</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Quản lý Di sản (Heritage CMS)</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">Quản lý bài thuốc truyền thống. Bấm "Thêm mới" hoặc icon ✏️ để mở bảng chỉnh sửa.</p>
      </div>

      {/* Table */}
      <div className={`${shellCardClass} overflow-hidden`}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">Danh sách bài thuốc</h3>
            <p className="text-sm text-slate-500">{remedies.length} bản ghi</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-2xl bg-[#007BFF] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0064D1] shadow-[0_8px_20px_-8px_rgba(0,123,255,0.4)]">
            <Plus className="h-4 w-4" /> Thêm mới
          </button>
        </div>

        {remedies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="mb-4 rounded-full bg-slate-50 p-6"><ImageIcon className="h-12 w-12 text-slate-300" /></div>
            <h4 className="text-lg font-semibold text-slate-600">Chưa có bài thuốc nào</h4>
            <p className="mt-2 text-sm text-slate-500 text-center max-w-sm">Bấm "Thêm mới" để bắt đầu số hóa di sản y học truyền thống.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-5 py-4 sm:px-6">Bài thuốc</th>
                  <th className="px-5 py-4">Ảnh</th>
                  <th className="px-5 py-4">Thành phần</th>
                  <th className="px-5 py-4">Cập nhật</th>
                  <th className="px-5 py-4 text-right sm:px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {remedies.slice(0, 25).map((remedy) => {
                  const imgSrc = getImageSrc(remedy);
                  return (
                    <tr key={remedy.id} className="border-t border-slate-200/70 align-top hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-medium text-slate-950">{remedy.name}</p>
                        <p className="mt-1 line-clamp-1 max-w-sm text-sm text-slate-500">{remedy.doctorNote}</p>
                      </td>
                      <td className="px-5 py-4">
                        {imgSrc ? (
                          <img src={imgSrc} alt={remedy.name} className="h-11 w-11 rounded-xl object-cover border border-slate-200 shadow-sm" />
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center"><ImageIcon className="h-4 w-4 text-slate-400" /></div>
                        )}
                      </td>
                      <td className="px-5 py-4"><p className="line-clamp-2 max-w-md text-sm text-slate-600">{remedy.ingredients}</p></td>
                      <td className="px-5 py-4 text-sm text-slate-500">{formatDateTime(remedy.updatedAt)}</td>
                      <td className="px-5 py-4 sm:px-6">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(remedy)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-[#007BFF] hover:text-[#007BFF]" title="Sửa">
                            <SquarePen className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteTarget({ id: remedy.id, name: remedy.name })} className="rounded-xl border border-slate-200 p-2 text-rose-600 transition hover:border-rose-300 hover:bg-rose-50" title="Xóa">
                            <Trash2 className="h-4 w-4" />
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
              className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-white shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#007BFF]">Heritage CMS</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">{editingId ? "Chỉnh sửa bài thuốc" : "Thêm bài thuốc mới"}</h3>
                </div>
                <button onClick={() => setIsSlideOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ảnh thảo mộc</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                  {form.imageBase64 ? (
                    <div className="relative group">
                      <img src={form.imageBase64} alt="Preview" className="w-full h-48 object-cover rounded-2xl border border-slate-200" />
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, imageBase64: "" }))}
                        className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-[#007BFF] hover:text-[#007BFF] hover:bg-[#F3F8FF] transition-all">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm font-medium">Kéo thả hoặc bấm để chọn ảnh</span>
                      <span className="text-xs text-slate-400">Tối đa 5MB · Tự nén về 600×600</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tên bài thuốc <span className="text-rose-400">*</span></label>
                  <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#007BFF] focus:bg-white" placeholder="Ví dụ: Trà Gừng Mật Ong" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Thành phần <span className="text-rose-400">*</span></label>
                  <textarea value={form.ingredients} onChange={e => setForm(prev => ({ ...prev, ingredients: e.target.value }))}
                    rows={3} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#007BFF] focus:bg-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Cách làm</label>
                  <textarea value={form.method} onChange={e => setForm(prev => ({ ...prev, method: e.target.value }))}
                    rows={4} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#007BFF] focus:bg-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Lời dặn thầy thuốc</label>
                  <textarea value={form.doctorNote} onChange={e => setForm(prev => ({ ...prev, doctorNote: e.target.value }))}
                    rows={3} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#007BFF] focus:bg-white" />
                </div>

                <button type="submit" disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-white font-medium transition hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_8px_24px_-8px_rgba(15,23,42,0.3)]">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSaving ? "Đang lưu..." : editingId ? "Lưu chỉnh sửa" : "Thêm vào CMS"}
                </button>
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
