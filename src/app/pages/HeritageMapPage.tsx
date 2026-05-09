import React, { useState, useMemo, useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { Search, Leaf, MapPin, ChevronLeft, ChevronRight, Share2, Activity, History as HistoryIcon, Star, Clock, Sprout, Navigation } from 'lucide-react';
import { toast } from 'sonner';

import { HeritageMap } from '../components/HeritageMap';
import { HERITAGE_LOCATIONS } from '../heritageData';
import { useAirQuality } from '../utils/useAirQuality';

export function HeritageMapPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useAirQuality();

  useEffect(() => {
    const doScroll = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    doScroll();
    const t = setTimeout(doScroll, 100);
    const t2 = setTimeout(doScroll, 300);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const raw = localStorage.getItem('ecoheritage_admin_locations');
      if (raw) {
        try {
          const stored = JSON.parse(raw);
          const mapped = stored
            .map((l: any) => ({
              ...l,
              position: [l.lat, l.lon],
              image: l.imageBase64 || l.image,
              herbs: typeof l.herbs === 'string' ? l.herbs.split(',').map((h: string) => h.trim()) : l.herbs,
              history: l.history || 'Nguồn gốc đang được cập nhật thêm thông tin chân thực từ người dân địa phương.',
              comments: l.comments && l.comments.length > 0 ? l.comments : [
                { user: 'Trần Bình', text: 'Không gian rất tốt, mọi người nên đến trải nghiệm!', rating: 5 },
                { user: 'Ngọc Lan', text: 'Nhiều thảo dược quý, môi trường bảo tồn tuyệt vời.', rating: 4 }
              ]
            }))
            .filter((l: any) => l.isVisible !== false);
          setLocations(mapped);
        } catch {
          setLocations(HERITAGE_LOCATIONS);
        }
      } else {
        setLocations(HERITAGE_LOCATIONS);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('storage_sync', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('storage_sync', loadData);
    };
  }, []);

  const categories = useMemo(() => {
    try {
      const types = (locations || []).map((l) => l?.type).filter(Boolean);
      return ['Tất cả', ...Array.from(new Set(types))];
    } catch {
      return ['Tất cả'];
    }
  }, [locations]);

  const normalize = (str: any) => {
    try {
      return String(str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
    } catch {
      return '';
    }
  };

  const filteredLocations = useMemo(() => {
    try {
      const searchNormalized = normalize(searchTerm);
      return (locations || []).filter((loc) => {
        if (!loc) return false;
        const matchesSearch =
          normalize(loc.name).includes(searchNormalized) ||
          normalize(loc.address).includes(searchNormalized) ||
          (loc.herbs && Array.isArray(loc.herbs) && loc.herbs.some((kw: string) => normalize(kw).includes(searchNormalized)));

        const matchesFilter = activeFilter === 'Tất cả' || loc.type === activeFilter;
        return matchesSearch && matchesFilter;
      });
    } catch {
      return [];
    }
  }, [searchTerm, activeFilter, locations]);

  const handleLocationSelect = (locId: string) => {
    setActiveLocationId((prev) => (prev === locId ? null : locId));
  };

  const getAQILevel = (score: number) => {
    if (score <= 50) return { label: 'Trong lành', color: 'text-emerald-400' };
    if (score <= 100) return { label: 'Bình thường', color: 'text-amber-400' };
    return { label: 'Cần lưu ý', color: 'text-rose-400' };
  };

  useEffect(() => {
    if (activeLocationId) {
      const activeElement = document.getElementById(`sidebar-item-${activeLocationId}`);
      if (activeElement) activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeLocationId]);

  const activeLoc = activeLocationId ? filteredLocations.find((l) => l.id === activeLocationId) : null;

  return (
    <div className="bg-[#051a11] h-screen relative overflow-hidden font-body">
      {/* HEADER TITLE */}
      <div className="absolute top-[100px] left-1/2 -translate-x-1/2 z-[50] pointer-events-none text-center w-full">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#051a11]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-full py-4 px-12 shadow-[0_20px_80px_rgba(0,0,0,0.6)] inline-block relative"
        >
          <h1 className="font-display text-sm md:text-lg text-white font-black tracking-[0.2em] uppercase relative pb-4">
            Bản đồ dược liệu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Đà Nẵng</span>
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "8rem", opacity: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 shadow-[0_0_15px_rgba(251,191,36,0.4)] rounded-full" 
            />
          </h1>
        </motion.div>
      </div>

      <Link 
        to="/" 
        className="absolute top-[100px] left-6 md:left-12 z-[100] w-12 h-12 bg-[#051a11]/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-emerald-400 hover:bg-emerald-500 hover:text-[#051a11] transition-all shadow-2xl group"
        title="Về trang chủ"
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
      </Link>

      {/* SIDEBAR */}
      <div className="absolute top-[120px] md:top-[160px] left-4 right-4 md:left-6 md:right-auto bottom-8 z-[100] flex pointer-events-none">
        <AnimatePresence mode="wait">
          {isSidebarOpen && !activeLocationId && (
            <motion.div
              initial={{ x: -500, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -500, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 80 }}
              className="w-[calc(100%-40px)] md:w-[380px] h-full flex flex-col pointer-events-auto"
            >
              <div className="bg-[#051a11]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden h-full flex flex-col relative">
                {/* Search Pill */}
                <div className="p-6 pb-4 shrink-0">
                  <div className="relative group mb-4">
                    <div className="relative bg-white/5 border border-white/10 rounded-xl flex items-center group-focus-within:border-emerald-500/50 transition-all">
                      <div className="pl-4">
                        <Search className="w-3.5 h-3.5 text-emerald-400/40" />
                      </div>
                      <input
                        type="text"
                        placeholder="Tìm dược liệu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent border-none py-3.5 px-4 text-[14px] text-white placeholder-white/20 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 overflow-x-auto no-scrollbar pb-3 mb-2 px-1">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveFilter(cat)}
                        className="relative py-2 group/tab transition-all shrink-0"
                      >
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                          activeFilter === cat ? 'text-amber-400' : 'text-white/30 group-hover/tab:text-amber-300'
                        }`}>
                          {cat}
                        </span>
                        <motion.div 
                          className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500 ${
                            activeFilter === cat ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover/tab:w-full group-hover/tab:opacity-100'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subheader */}
                <div className="px-6 py-2.5 bg-white/5 shrink-0 border-y border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">{filteredLocations.length} Vùng tài nguyên</span>
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-4">
                  <div className="space-y-2">
                    {filteredLocations.map((loc) => (
                      <motion.div
                        key={loc.id}
                        id={`sidebar-item-${loc.id}`}
                        onClick={() => handleLocationSelect(loc.id)}
                        className="relative group p-3 rounded-2xl cursor-pointer bg-white/[0.01] border border-white/5 hover:bg-white/[0.08] hover:border-emerald-500/20 transition-all duration-500"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                            <img src={loc.image} alt={loc.name || 'Ảnh địa điểm'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-[13px] text-white/90 group-hover:text-emerald-400 truncate mb-0.5 uppercase tracking-tight">{loc.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{loc.type}</span>
                              <span className="text-[9px] text-white/20 truncate font-medium">{loc.address}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="p-6 mt-auto border-t border-white/5 bg-white/[0.01]">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {[
                      { label: 'Khu bảo tồn', color: '#10b981' },
                      { label: 'Làng nghề', color: '#f59e0b' },
                      { label: 'Tiệm thuốc', color: '#8b5cf6' },
                      { label: 'Dược liệu', color: '#ec4899' },
                    ].map((type) => (
                      <div key={type.label} className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.1em]">{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeLocationId && (
          <div className="flex items-center pointer-events-auto h-full pl-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-9 h-9 bg-[#051a11]/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-emerald-400 shadow-2xl hover:bg-emerald-500 hover:text-[#051a11] transition-all"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* DETAIL PANEL */}
      <AnimatePresence>
        {activeLoc && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 120 }}
            className="absolute top-0 right-0 bottom-0 z-[110] w-full md:w-[50%] lg:w-[35%] bg-[#020b07] border-l border-white/10 shadow-[-30px_0_120px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
          >
            <div className="flex-1 overflow-y-auto no-scrollbar pb-28">
              {/* HERO */}
              <div className="h-[35vh] relative shrink-0 group overflow-hidden">
                <img
                  src={activeLoc.image}
                  alt={activeLoc.name || 'Ảnh địa điểm'}
                  className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#020b07] via-[#020b07]/20 to-black/40" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />

                <div className="absolute top-8 left-8 flex items-center z-[100]">
                  <button
                    type="button"
                    onClick={() => setActiveLocationId(null)}
                    className="group flex items-center gap-3 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-full pl-2 pr-6 py-2 text-white hover:bg-emerald-500 hover:text-[#051a11] hover:border-emerald-400 transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)] active:scale-95"
                    aria-label="Quay lại bản đồ"
                    title="Quay lại"
                  >
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
                      <ChevronLeft className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Quay lại</span>
                  </button>
                </div>

                <div className="absolute top-8 right-8 z-[100]">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(window.location.href);
                        toast.success('Đã sao chép liên kết chia sẻ!');
                      } catch { /* ignore */ }
                    }}
                    className="w-12 h-12 bg-black/40 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-emerald-500 hover:scale-110 transition-all shadow-2xl group"
                    aria-label="Chia sẻ"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute bottom-6 left-8 right-8 z-20 pt-1.5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-emerald-500 text-[#051a11] rounded-md text-[8px] font-black uppercase tracking-widest shadow-lg">{activeLoc.type}</span>
                    <div className="px-3 py-1 bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 rounded-md text-[8px] font-black text-amber-400 uppercase flex items-center gap-1.5">
                      <Clock className="w-2.5 h-2.5" /> {activeLoc.bestTime}
                    </div>
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-display font-black text-white leading-tight tracking-tighter uppercase mb-1 drop-shadow-lg">{activeLoc.name}</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-white/50">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-bold tracking-wide uppercase opacity-70 truncate max-w-[150px]">{activeLoc.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 lg:p-10 space-y-10 relative">
                {/* SECTION 0: Tổng quan di sản */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                    <h3 className="text-[13px] font-black uppercase text-white tracking-[0.2em]">Tổng quan di sản</h3>
                  </div>
                  <p className="text-[15px] text-white/90 leading-relaxed font-medium">{activeLoc.description}</p>
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <HistoryIcon className="w-4 h-4 text-emerald-400/50" />
                      <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">Lịch sử & Nguồn gốc</span>
                    </div>
                    <p className="text-[13px] text-white/80 leading-relaxed italic">{activeLoc.history}</p>
                  </div>
                </div>

                {/* SECTION 2: Kho tàng dược liệu (bỏ mục hình 2 theo yêu cầu) */}
                {/* Để tránh lỗi JSX và đúng yêu cầu, mình xóa toàn bộ khối section này ở panel detail. */}

                {/* SECTION 4: Thông tin tham quan */}
                <div className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 space-y-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-[13px] font-black uppercase text-white tracking-[0.2em]">Thông tin tham quan</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Thời điểm lý tưởng</p>
                      <p className="text-[13px] text-white/90 font-bold">{activeLoc.bestTime}</p>
                    </div>
                    <div className="space-y-1.5 text-right">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Liên hệ</p>
                      <p className="text-[13px] text-emerald-400 font-bold">{activeLoc.contact}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[12px] text-white/80 leading-relaxed">
                      <span className="font-black text-rose-400 uppercase tracking-widest mr-1.5">Lưu ý:</span>
                      {activeLoc.regulations}
                    </p>
                  </div>
                </div>

                {/* SECTION 3: Trải nghiệm */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[13px] font-black uppercase text-white tracking-[0.2em] flex items-center gap-2">
                      <div className="w-1 h-5 bg-amber-400 rounded-full" /> Đánh giá & Di sản
                    </h3>
                    <div className="flex items-center gap-1">
                      <div className="flex text-amber-400">
                        {Array.from({ length: Math.floor(activeLoc.rating || 5) }).map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 px-1">
                    {(activeLoc.comments || []).map((comment: any, idx: number) => (
                      <div key={idx} className="p-5 bg-white/[0.02] border border-white/5 rounded-[1.5rem] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-black text-emerald-400 uppercase tracking-widest">{comment.user}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: comment.rating }).map((_, i) => (
                              <Star key={i} className="w-2 h-2 text-amber-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-[14px] text-white/80 font-medium italic leading-relaxed">"{comment.text}"</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 px-1">
                    <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem]">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Đánh giá chung</p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-white font-black text-2xl">{activeLoc.rating || 4.9}</span>
                          <span className="text-white/10 font-bold text-[12px]">/ 5.0</span>
                        </div>
                      </div>
                      <button className="px-5 py-2 bg-white/5 rounded-full text-[11px] font-black text-emerald-400 uppercase border border-emerald-400/20 hover:bg-emerald-400 hover:text-[#051a11] transition-all">
                        Tất cả nhận xét
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex flex-col items-center gap-3 opacity-10">
                  <Leaf className="w-4 h-4 text-emerald-500" />
                  <p className="text-[8px] font-black text-white uppercase tracking-[0.3em]">EcoHeritage Platform © 2026</p>
                </div>
              </div>
            </div>

            {/* STICKY ACTION BAR */}
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#020b07] via-[#020b07] to-transparent z-[60] border-t border-white/5 backdrop-blur-md">
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${activeLoc.position[0]},${activeLoc.position[1]}`,
                      '_blank'
                    )
                  }
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl flex items-center justify-center gap-3 text-[#051a11] font-black text-[12px] shadow-[0_10px_30px_rgba(16,185,129,0.25)] transition-all transform hover:-translate-y-0.5 active:scale-[0.98] group"
                >
                  <Navigation className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                  DẪN ĐƯỜNG NGAY
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 z-0">
        <HeritageMap data={filteredLocations} selectedLocationId={activeLocationId} onLocationSelect={(id) => handleLocationSelect(id)} />
      </div>

      <style>{`
        /* Note: Inline style retained for small UI tweaks (scrollbars). */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }

        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
        .custom-scrollbar-h::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar-h::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

