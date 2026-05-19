import { useState, useRef, useMemo } from "react";
import { Plus, Save, SquarePen, Trash2, X, Upload, Image as ImageIcon, Loader2, MapPin, Eye, EyeOff, Search } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  shellCardClass, createId, formatDateTime, compressImage,
  loadStoredState, LOCATIONS_STORAGE_KEY, LocationRecord,
} from "./adminUtils";
import { createSeedLocations } from "./adminData";
import { ConfirmDialog } from "./ConfirmDialog";

export function LocationCMS() {
  const [locations, setLocations] = useState<LocationRecord[]>(() => {
    const stored = loadStoredState<LocationRecord[] | null>(LOCATIONS_STORAGE_KEY, null);
    return stored || createSeedLocations();
  });

  const [isSlideOpen, setIsSlideOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    lat: 16.0544,
    lon: 108.2022,
    status: "🟢 Cho phép",
    level: "Cấp Địa Phương",
    herbs: "",
    regulations: "",
    type: "Vùng nguyên liệu",
    color: "#8b5cf6",
    imageBase64: "",
    isVisible: true,
    history: "",
    bestTime: "",
    contact: ""
  });
  
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persist = (next: LocationRecord[]) => {
    setLocations(next);
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("storage_sync"));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({
      name: "",
      address: "",
      lat: 16.0544,
      lon: 108.2022,
      status: "🟢 Cho phép",
      level: "Cấp Địa Phương",
      herbs: "",
      regulations: "",
      type: "Vùng nguyên liệu",
      color: "#8b5cf6",
      imageBase64: "",
      isVisible: true,
      history: "",
      bestTime: "",
      contact: ""
    });
    setIsSlideOpen(true);
  };

  const openEdit = (l: LocationRecord) => {
    setEditingId(l.id);
    setForm({
      name: l.name,
      address: l.address,
      lat: l.lat,
      lon: l.lon,
      status: l.status,
      level: l.level,
      herbs: l.herbs,
      regulations: l.regulations,
      type: l.type,
      color: l.color,
      imageBase64: l.imageBase64 || "",
      isVisible: l.isVisible ?? true,
      history: l.history || "",
      bestTime: l.bestTime || "",
      contact: l.contact || ""
    });
    setIsSlideOpen(true);
  };

  const toggleVisibility = (id: string) => {
    const updated = locations.map(l => 
      l.id === id ? { ...l, isVisible: !l.isVisible } : l
    );
    persist(updated);
    const loc = updated.find(l => l.id === id);
    toast.info(`${loc?.isVisible ? "Đã hiện" : "Đã ẩn"} "${loc?.name}" trên bản đồ.`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 600, 0.7);
      setForm(prev => ({ ...prev, imageBase64: compressed }));
      toast.success("Ảnh địa điểm đã được tải lên!");
    } catch {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) {
      toast.error("Vui lòng điền đầy đủ tên và địa chỉ!");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      if (editingId) {
        persist(locations.map(l => l.id === editingId ? { ...l, ...form, updatedAt: new Date().toISOString() } : l));
        toast.success(`Đã cập nhật địa điểm "${form.name}"`);
      } else {
        const newLoc: LocationRecord = {
          id: createId("loc"),
          ...form,
          updatedAt: new Date().toISOString(),
        };
        persist([newLoc, ...locations]);
        toast.success(`Đã thêm địa điểm "${form.name}"`);
      }
      setIsSaving(false);
      setIsSlideOpen(false);
    }, 600);
  };

  const handleDelete = (id: string) => {
    persist(locations.filter(l => l.id !== id));
    setDeleteTarget(null);
    toast.success("Đã xóa địa điểm.");
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007BFF] mb-2">Module 3</p>
        <h2 className="text-3xl font-black tracking-tighter text-[#1E293B] sm:text-4xl leading-tight">Bản đồ & Tọa độ Dược liệu</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-500 font-medium italic">
          Theo dõi, chỉnh sửa và quản lý mạng lưới các địa điểm di sản dược liệu. Đảm bảo dữ liệu tọa độ và thông tin vùng nguyên liệu luôn chính xác và minh bạch.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] px-8 py-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-[2rem] bg-amber-400/10 flex items-center justify-center text-amber-600 border border-amber-400/20 shadow-sm"><MapPin className="h-8 w-8" /></div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 uppercase tracking-wider">Danh mục địa danh</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{locations.length} điểm tọa độ đã xác thực</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Tìm tên địa điểm, địa chỉ..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-emerald-500/50 focus:bg-white focus:outline-none transition-all font-black"
            />
          </div>
          <button onClick={openAdd} className="inline-flex items-center justify-center gap-3 rounded-2xl bg-amber-400 px-8 py-4 text-[11px] font-black uppercase tracking-widest text-[#051a11] shadow-2xl shadow-amber-400/10 hover:bg-amber-300 transition-all whitespace-nowrap active:scale-95">
            <Plus className="w-5 h-5" /> Thêm địa điểm
          </button>
        </div>
      </div>

      {/* Table / Cards */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden md:table w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 border-b border-slate-100">
                <th className="px-8 py-6 text-left">Địa danh / Vùng di sản</th>
                <th className="px-6 py-6 text-left">Phân loại & Hiện trạng</th>
                <th className="px-6 py-6 text-left">Nguồn thảo mộc</th>
                <th className="px-6 py-6 text-center">Hiển thị</th>
                <th className="px-8 py-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || loc.address.toLowerCase().includes(searchTerm.toLowerCase())).map((loc) => (
                <tr key={loc.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-5">
                      <div 
                        onClick={() => setPreviewImage({ src: loc.imageBase64 || loc.image || "", name: loc.name })}
                        className="w-16 h-16 rounded-[24px] bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500 relative cursor-zoom-in"
                      >
                        {loc.imageBase64 || loc.image ? (
                          <img src={loc.imageBase64 || loc.image} className="w-full h-full object-cover" alt={loc.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-200">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[24px]" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                           <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-2xl" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate max-w-[220px] text-[15px] group-hover:text-emerald-600 transition-colors">{loc.name}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[220px] mt-1.5 font-medium italic">"{loc.address}"</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className="inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-400/10 text-amber-600 border border-amber-400/20 mb-2 shadow-sm">{loc.type}</span>
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5">
                      <span className={`h-2 w-2 rounded-full shadow-[0_0_8px_currentColor] ${loc.status.includes('🟢') ? 'bg-emerald-500 text-emerald-500' : 'bg-rose-500 text-rose-500'}`} />
                      {loc.status.replace(/🟢|🔴/, '').trim()}
                    </p>
                  </td>
                  <td className="px-6 py-8">
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 max-w-[240px] leading-relaxed italic">"{loc.herbs}"</p>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <button 
                      onClick={() => toggleVisibility(loc.id)}
                      className={`p-3.5 rounded-2xl transition-all border ${loc.isVisible ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' : 'bg-slate-100 text-slate-300 border-slate-200'}`}
                      title={loc.isVisible ? "Công khai" : "Riêng tư"}
                    >
                      {loc.isVisible ? <Eye className="w-6 h-6" /> : <EyeOff className="w-6 h-6" />}
                    </button>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEdit(loc)} className="p-3 bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-2xl transition-all shadow-sm active:scale-95" title="Sửa"><SquarePen className="w-5 h-5" /></button>
                      <button onClick={() => setDeleteTarget({ id: loc.id, name: loc.name })} className="p-3 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-2xl transition-all shadow-sm active:scale-95" title="Xóa"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-100">
            {locations.filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || loc.address.toLowerCase().includes(searchTerm.toLowerCase())).map((loc) => (
              <div key={loc.id} className="p-6 space-y-5 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-[32px] bg-slate-50 overflow-hidden border border-slate-100 shrink-0 shadow-md relative">
                    {loc.imageBase64 || loc.image ? (
                      <img src={loc.imageBase64 || loc.image} className="w-full h-full object-cover" alt={loc.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[32px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">{loc.type}</span>
                      <button 
                        onClick={() => toggleVisibility(loc.id)}
                        className={`p-2 rounded-xl transition-all ${loc.isVisible ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-300'}`}>
                        {loc.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-900 text-[15px]">{loc.name}</h4>
                    <p className="text-xs text-slate-400 truncate mt-1 italic font-medium">"{loc.address}"</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Trạng thái</p>
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{loc.status.replace(/🟢|🔴/, '').trim()}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cấp quản lý</p>
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{loc.level}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 pt-2">
                   <div className="flex-1">
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1 italic">
                        {loc.herbs || "Chưa cập nhật dược liệu"}
                      </p>
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={() => openEdit(loc)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-emerald-600 text-[11px] font-black uppercase tracking-widest shadow-sm">
                        <SquarePen className="w-4 h-4" /> Sửa
                      </button>
                      <button onClick={() => setDeleteTarget({ id: loc.id, name: loc.name })} className="p-2.5 rounded-2xl text-rose-500 hover:bg-rose-50 transition-colors">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide-over */}
      <AnimatePresence>
        {isSlideOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSlideOpen(false)} className="fixed inset-0 z-[60] bg-slate-950/20 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 35, stiffness: 300 }}
              className="fixed right-0 top-0 z-[70] h-full w-full max-w-[480px] bg-white border-l border-slate-200 shadow-2xl flex flex-col">
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Map Geo CMS</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1 uppercase tracking-tight">{editingId ? "Cập nhật tọa độ" : "Ghi danh địa danh"}</h3>
                </div>
                <button onClick={() => setIsSlideOpen(false)} className="rounded-2xl border border-slate-200 p-3 text-slate-400 hover:bg-white hover:text-slate-600 transition-all shadow-sm"><X className="w-7 h-7" /></button>
              </div>

              <form onSubmit={handleSubmit} data-lenis-prevent="true" className="flex-1 overflow-y-auto px-6 sm:px-10 py-10 space-y-10 bg-white" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                <div className="space-y-8">
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Tên địa danh</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300 shadow-sm" placeholder="Ví dụ: Vườn Quốc gia Cúc Phương" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Loại hình di tích</label>
                        <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold outline-none transition focus:border-emerald-500 focus:bg-white appearance-none shadow-sm">
                          {["Khu bảo tồn", "Làng nghề", "Vùng nguyên liệu", "Nguồn dược liệu quý", "Chợ dược liệu", "Tiệm di sản"].map(t => <option key={t} className="bg-white font-bold">{t}</option>)}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Địa chỉ chi tiết</label>
                     <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-medium outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300 shadow-sm" placeholder="Số nhà, đường, quận/huyện, tỉnh/thành..." />
                   </div>

                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Vĩ độ (Latitude)</label>
                        <input type="number" step="0.0001" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: parseFloat(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-mono text-sm outline-none transition focus:border-emerald-500 focus:bg-white shadow-sm" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Kinh độ (Longitude)</label>
                        <input type="number" step="0.0001" value={form.lon} onChange={e => setForm(f => ({ ...f, lon: parseFloat(e.target.value) }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-mono text-sm outline-none transition focus:border-emerald-500 focus:bg-white shadow-sm" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Dược thảo đặc trưng</label>
                        <input value={form.herbs} onChange={e => setForm(f => ({ ...f, herbs: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-medium outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300 shadow-sm" placeholder="Ngọc Linh, Quế, Hồi..." />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Thời điểm lý tưởng</label>
                        <input value={form.bestTime} onChange={e => setForm(f => ({ ...f, bestTime: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-medium outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300 shadow-sm" placeholder="05:00 - 09:00 sáng..." />
                      </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Liên hệ & Hỗ trợ</label>
                     <input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-medium outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300 shadow-sm" placeholder="Tên đơn vị, Số điện thoại..." />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Trạng thái khai thác</label>
                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold outline-none transition focus:border-emerald-500 focus:bg-white appearance-none shadow-sm">
                          <option className="bg-white">🟢 Cho phép</option>
                          <option className="bg-white">🔴 Cấm hái</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Cấp độ quản lý</label>
                        <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-bold outline-none transition focus:border-emerald-500 focus:bg-white appearance-none shadow-sm">
                          {["Cấp Quốc Gia", "Cấp Tỉnh", "Cấp Đặc Biệt", "Di sản Văn hóa", "Cấp Địa Phương"].map(lvl => <option key={lvl} className="bg-white">{lvl}</option>)}
                        </select>
                      </div>
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Lịch sử & Nguồn gốc</label>
                     <textarea value={form.history} onChange={e => setForm(f => ({ ...f, history: e.target.value }))} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 text-sm outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300 shadow-sm" placeholder="Tóm tắt lịch sử vùng đất hoặc nguồn gốc dược liệu..." />
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Quy định bảo hộ</label>
                     <textarea value={form.regulations} onChange={e => setForm(f => ({ ...f, regulations: e.target.value }))} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 text-sm outline-none transition focus:border-emerald-500 focus:bg-white placeholder:text-slate-300 shadow-sm" placeholder="Các nghị định, thông tư hoặc nội quy bảo vệ..." />
                   </div>

                   <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Hình ảnh hiện trạng</label>
                     <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                     {form.imageBase64 ? (
                        <div className="relative aspect-video rounded-[32px] overflow-hidden border border-slate-200 group shadow-lg transition-all hover:scale-[1.01]">
                           <img src={form.imageBase64} className="w-full h-full object-cover" alt="" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-slate-900 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest mr-2 hover:bg-amber-400 transition-all shadow-2xl active:scale-95">Thay đổi</button>
                              <button type="button" onClick={() => setForm(f => ({ ...f, imageBase64: "" }))} className="bg-rose-500 text-white p-4 rounded-2xl hover:bg-rose-600 transition-all shadow-2xl active:scale-95"><Trash2 className="h-6 w-6" /></button>
                           </div>
                        </div>
                     ) : (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full h-64 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-emerald-400/50 hover:bg-emerald-50 hover:text-emerald-600 transition-all group shadow-sm">
                           <div className="bg-white p-6 rounded-[24px] shadow-sm group-hover:scale-110 transition-all"><Upload className="w-10 h-10" /></div>
                           <div className="text-center">
                              <span className="block text-sm font-bold text-slate-600">Tải lên ảnh địa danh</span>
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Max 5MB · Auto-compressed</span>
                           </div>
                        </button>
                     )}
                   </div>

                   <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[32px] border border-slate-100 shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Hiển thị công khai</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1">Cho phép điểm xuất hiện trên bản đồ</p>
                      </div>
                      <button type="button" onClick={() => setForm(f => ({ ...f, isVisible: !f.isVisible }))} className={`w-16 h-8 rounded-full relative transition-all duration-500 ${form.isVisible ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md ${form.isVisible ? 'left-9' : 'left-2'}`} />
                      </button>
                   </div>
                </div>

                <div className="pt-6 pb-8">
                  <button type="submit" disabled={isSaving} className="w-full bg-amber-400 text-[#051a11] py-7 rounded-[32px] text-sm font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-amber-300 transition-all disabled:opacity-50 shadow-[0_20px_50px_rgba(251,191,36,0.25)]">
                    {isSaving ? <Loader2 className="w-7 h-7 animate-spin" /> : <Save className="w-7 h-7" />}
                    {editingId ? "Cập nhật tọa độ di sản" : "Ghi danh địa danh mới"}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa địa điểm?"
        message={`Hành động này sẽ xóa vĩnh viễn địa danh "${deleteTarget?.name}" khỏi hệ thống.`}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />

      <AnimatePresence>
        {previewImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full"
            >
              <button onClick={() => setPreviewImage(null)} className="absolute -top-16 right-0 p-3 text-white/60 hover:text-white transition-colors">
                <X className="w-10 h-10" />
              </button>
              <div className="overflow-hidden rounded-[40px] bg-white shadow-2xl border border-white/20">
                <img src={previewImage.src} className="w-full h-auto max-h-[80vh] object-contain bg-slate-100" alt={previewImage.name} />
                <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#007BFF]">Location Preview</p>
                     <h4 className="mt-1 text-2xl font-black text-slate-900 uppercase tracking-tight">{previewImage.name}</h4>
                   </div>
                   <button onClick={() => setPreviewImage(null)} className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#007BFF] transition-all shadow-xl shadow-blue-900/10 active:scale-95">Đóng xem trước</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
