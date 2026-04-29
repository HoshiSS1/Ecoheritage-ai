import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Leaf, Star, Send, Heart, MessageSquareQuote, User } from 'lucide-react';
import { toast } from 'sonner';
import { TraditionalRemedyCard } from '../components/TraditionalRemedyCard';
import { PaginationBar } from '../components/PaginationBar';
import { traditionalRemedies } from '../data';
import { saveAdminFeedback } from './admin/adminUtils';

const ITEMS_PER_PAGE = 9;

export function HeritagePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const [fbName, setFbName] = useState('');
  const [fbEmail, setFbEmail] = useState('');
  const [fbComment, setFbComment] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbHover, setFbHover] = useState<number | null>(null);
  const [fbType, setFbType] = useState('Hiệu quả sử dụng');
  const [fbRemedyId, setFbRemedyId] = useState('');
  const [fbAllowPublic, setFbAllowPublic] = useState(true);
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [heritageReviews, setHeritageReviews] = useState<any[]>([]);

  const loadReviews = () => {
    // Load published heritage reviews from admin pool that are FEATURED
    const adminFbRaw = localStorage.getItem('ecoheritage_admin_feedback');
    const adminFb = adminFbRaw ? JSON.parse(adminFbRaw) : [];
    
    // Filter strictly for heritage category, published status, and isFeatured flag
    const approvedHeritage = adminFb.filter((r: any) => 
      r.category === 'heritage' && 
      r.status === 'published' &&
      r.isFeatured === true
    ).slice(0, 4); // Limit to top 4 featured
    
    setHeritageReviews(approvedHeritage);
  };

  useEffect(() => {
    loadReviews();
    
    // Live update when Admin changes something
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ecoheritage_admin_feedback') {
        loadReviews();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Khắc phục triệt để lỗi nhảy trang do Suspense (Lazy load)
  useLayoutEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Bọc lót thêm một lớp bảo vệ sau khi paint
    const t1 = requestAnimationFrame(() => {
      if (topRef.current) topRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
      window.scrollTo(0, 0);
    });
    const t2 = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
    return () => { cancelAnimationFrame(t1); clearTimeout(t2); };
  }, []);

  const categories = ['Tất cả', ...Array.from(new Set(traditionalRemedies.map(r => r.category)))];

  // Nâng cấp độ nhạy: Tìm kiếm thông minh không dấu (Accent-insensitive)
  const normalize = (str: string) => 
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const filteredRemedies = useMemo(() => {
    const searchNormalized = normalize(searchTerm);
    return traditionalRemedies.filter(remedy => {
      const matchesSearch = 
        normalize(remedy.name).includes(searchNormalized) || 
        normalize(remedy.benefits).includes(searchNormalized) ||
        (remedy.keywords && remedy.keywords.some(kw => normalize(kw).includes(searchNormalized)));
      const matchesFilter = activeFilter === 'Tất cả' || remedy.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter]);

  // Reset page when filter or search changes
  useLayoutEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredRemedies.length / ITEMS_PER_PAGE);
  const currentRemedies = filteredRemedies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div ref={topRef} className="min-h-screen bg-[#051a11] pt-24 sm:pt-32 pb-12 sm:pb-20">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/textures/cubes.png')]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-emerald-600/10 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6 backdrop-blur-md"
          >
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 font-bold">Thư viện Di sản</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4 sm:mb-6"
          >
            Tinh hoa <em className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 not-italic font-bold">Y học cổ truyền</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-emerald-100/70 font-light px-2"
          >
            Khám phá kho tàng bài thuốc dân gian quý giá được đúc kết qua hàng trăm năm, nay được phân tích dưới góc nhìn khoa học hiện đại.
          </motion.p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Tìm kiếm bài thuốc, công dụng, dược liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 transition-all"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-1">
            <div className="flex items-center gap-2 mr-2 text-white/60 text-sm font-medium">
              <Filter className="w-4 h-4" /> Bộ lọc:
            </div>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeFilter === cat
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filteredRemedies.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 perspective-[1500px]">
              {currentRemedies.map((remedy, idx) => (
                <TraditionalRemedyCard key={remedy.name} {...remedy} index={idx} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12">
                <PaginationBar 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    if (topRef.current) {
                      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 mb-4">
              <Leaf className="w-8 h-8" />
            </div>
            <h3 className="text-xl text-white font-medium mb-2">Không tìm thấy bài thuốc nào</h3>
            <p className="text-white/50">Vui lòng thử lại với từ khóa khác.</p>
          </div>
        )}

        {/* Heritage Community Section */}
        <div className="mt-24 sm:mt-32 relative">
          <div className="absolute inset-0 bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-8 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <MessageSquareQuote className="w-4 h-4" /> Cộng đồng Di sản
            </div>
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-bold tracking-tight leading-tight">
              Lan tỏa <em className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-200 not-italic font-bold italic drop-shadow-2xl">giá trị</em> bản địa
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Form - Matched to Home Style */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-4 bg-[#0a2e1f]/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
               
               <div className="mb-8">
                 <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                   <span className="text-rose-500">❤️</span> Gửi góp ý của bạn
                 </h3>
                 <p className="text-emerald-100/50 text-xs mt-2 font-medium">Ý kiến của bạn giúp EcoHeritage hoàn thiện mỗi ngày.</p>
               </div>

               <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!fbName.trim() || !fbComment.trim()) { toast.error('Vui lòng nhập tên và góp ý!'); return; }
                  setFbSubmitting(true);
                  setTimeout(() => {
                    const remedyName = fbRemedyId ? traditionalRemedies.find(r => r.id === fbRemedyId)?.name : 'Tổng thể Di sản';
                    const fullContent = `[${fbType}] ${fbComment}`;
                    const newId = `heritage-fb-${Date.now()}`;
                    const isoDate = new Date().toISOString();

                    // IT Expert: Use unified helper
                    saveAdminFeedback({
                      id: newId,
                      author: fbName + (fbEmail ? ` (${fbEmail})` : ''),
                      remedyUsed: remedyName,
                      content: fullContent,
                      satisfaction: fbRating,
                      category: 'heritage',
                      createdAt: isoDate
                    });

                    if (fbAllowPublic) {
                      const legacyReview = { id: newId, userName: fbName, rating: fbRating, comment: fullContent, date: isoDate, remedyId: fbRemedyId || 'heritage-general' };
                      const saved = JSON.parse(localStorage.getItem('ecoheritage_reviews') || '[]');
                      localStorage.setItem('ecoheritage_reviews', JSON.stringify([legacyReview, ...saved]));
                    }
                    
                    setFbName(''); setFbEmail(''); setFbComment(''); setFbRating(5); setFbType('Hiệu quả sử dụng'); setFbRemedyId(''); setFbAllowPublic(true); setFbSubmitting(false);
                    toast.success('Cảm ơn bạn! Góp ý đã được gửi thành công.', { style: { background: '#0a2e1f', color: '#fff' } });
                  }, 800);
               }} className="space-y-5">
                  <div className="flex justify-center gap-2 mb-6">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} type="button" onMouseEnter={() => setFbHover(s)} onMouseLeave={() => setFbHover(null)} onClick={() => setFbRating(s)} className="transition-transform hover:scale-125 focus:outline-none">
                        <Star className={`w-8 h-8 ${(fbHover !== null ? s <= fbHover : s <= fbRating) ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'text-white/10'} transition-all duration-300`} />
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <input value={fbName} onChange={e => setFbName(e.target.value)} placeholder="Tên của bạn *" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/20" />
                    <input value={fbEmail} onChange={e => setFbEmail(e.target.value)} type="email" placeholder="Email (Không bắt buộc)" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/20" />
                    <select value={fbRemedyId} onChange={e => setFbRemedyId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all appearance-none cursor-pointer">
                      <option value="" className="bg-[#0a2e1f]">-- Chọn bài thuốc --</option>
                      {traditionalRemedies.map(r => (
                        <option key={r.id} value={r.id} className="bg-[#0a2e1f]">{r.name}</option>
                      ))}
                    </select>
                    <textarea value={fbComment} onChange={e => setFbComment(e.target.value)} placeholder="Hãy chia sẻ câu chuyện hoặc hiệu quả sử dụng của bạn..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 min-h-[120px] transition-all resize-none placeholder:text-white/20" />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group px-1">
                    <input type="checkbox" className="w-5 h-5 rounded-lg accent-emerald-500 border-white/20 bg-white/5" checked={fbAllowPublic} onChange={e => setFbAllowPublic(e.target.checked)} />
                    <span className="text-emerald-100/40 text-[11px] select-none group-hover:text-emerald-100/70 transition-colors font-medium">Cho phép hiển thị nhận xét trên trang cộng đồng.</span>
                  </label>

                  <button type="submit" disabled={fbSubmitting} className="group relative w-full overflow-hidden bg-emerald-500 text-[#051a11] py-4.5 rounded-2xl font-bold text-base shadow-[0_15px_30px_rgba(16,185,129,0.2)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all duration-500 hover:-translate-y-1">
                    <span className="relative z-10 flex items-center justify-center gap-3 font-bold">
                      {fbSubmitting ? "Đang gửi..." : "Gửi Đánh Giá"} <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </span>
                  </button>
               </form>
            </motion.div>

            {/* Right: Grid of Reviews - Exactly like Home */}
            <div className="lg:col-span-8">
               <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl text-white font-bold flex items-center gap-3">
                   <span className="p-2 bg-emerald-500/10 rounded-lg"><Leaf className="w-5 h-5 text-emerald-400" /></span> Những câu chuyện được chia sẻ
                 </h3>
                 <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">{heritageReviews.length} nhận xét</span>
               </div>

               {heritageReviews.length === 0 ? (
                 <div className="bg-white/5 border border-dashed border-white/10 rounded-[3rem] py-24 text-center">
                    <MessageSquareQuote className="w-16 h-16 text-white/10 mx-auto mb-6" />
                    <p className="text-white/40 text-sm font-medium">Chưa có câu chuyện nào được chia sẻ công khai.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {heritageReviews.map((review, idx) => (
                     <motion.div
                       key={review.id}
                       initial={{ opacity: 0, y: 20 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: idx * 0.1 }}
                       className="bg-[#0a2e1f]/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.08] transition-all duration-500 relative group flex flex-col h-full shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)]"
                     >
                       <MessageSquareQuote className="absolute top-8 right-8 w-14 h-14 text-white/5 transform group-hover:scale-110 group-hover:text-amber-400/5 transition-all duration-500" />
                       
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < review.satisfaction ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
                            ))}
                          </div>
                          {review.remedyUsed && (
                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-widest shadow-lg shadow-emerald-500/5">
                              {review.remedyUsed}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-white/90 text-[15px] sm:text-base leading-relaxed font-medium mb-10 relative z-10 flex-grow italic">
                          "{review.content}"
                        </p>
                        
                        <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                          <div className="flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-full border border-white/10 p-0.5 group-hover:border-emerald-500/30 transition-all duration-500">
                              <div className="w-full h-full rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-emerald-400" />
                              </div>
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm tracking-tight">{review.author.split(' (')[0]}</h4>
                              <p className="text-emerald-100/40 text-[10px] font-medium mt-0.5">
                                Thành viên EcoHeritage
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                     </motion.div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
