import { useState, useMemo, useLayoutEffect, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Leaf, Star, User, Send, Heart, MessageSquareQuote, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { TraditionalRemedyCard } from '../components/TraditionalRemedyCard';
import { PaginationBar } from '../components/PaginationBar';
import { traditionalRemedies as defaultRemedies } from '../data';
import { saveAdminFeedback } from '../pages/admin/adminUtils';
import { getAvatarUrl } from '../utils/avatarUtils';

const ITEMS_PER_PAGE = 9;

export function HeritagePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);
  const [heritageReviews, setHeritageReviews] = useState<any[]>([]);

  // Feedback Form State
  const [fbName, setFbName] = useState('');
  const [fbEmail, setFbEmail] = useState('');
  const [fbComment, setFbComment] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbHover, setFbHover] = useState<number | null>(null);
  const [fbType, setFbType] = useState('Hiệu quả sử dụng');
  const [fbRemedyId, setFbRemedyId] = useState('');
  const [fbAllowPublic, setFbAllowPublic] = useState(true);
  const [fbSubmitting, setFbSubmitting] = useState(false);

  const loadReviews = () => {
    const adminFbRaw = localStorage.getItem('ecoheritage_admin_feedback');
    let adminFb = [];
    if (adminFbRaw) {
      try {
        const parsed = JSON.parse(adminFbRaw);
        if (Array.isArray(parsed)) adminFb = parsed;
      } catch { /* ignore */ }
    }
    
    const approvedHeritage = adminFb.filter((r: any) => 
      r && 
      r.category === 'heritage' && 
      r.status === 'published' &&
      r.isFeatured === true
    ).slice(0, 4);
    
    setHeritageReviews(approvedHeritage);
  };

  useEffect(() => {
    loadReviews();
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'ecoheritage_admin_feedback' || e.key === 'storage_sync') {
        loadReviews();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('storage_sync' as any, handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('storage_sync' as any, handleStorage);
    };
  }, []);

  // ScrollToTop component handles initial mount scrolling

  const [displayRemedies, setDisplayRemedies] = useState(defaultRemedies);

  useEffect(() => {
    const loadRemedies = () => {
      const raw = localStorage.getItem('ecoheritage_admin_remedies');
      if (raw && raw !== 'undefined') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const activeRemedies = parsed.filter((r: any) => r && r.status === 'published');
            if (activeRemedies.length > 0) {
              setDisplayRemedies(activeRemedies);
              return;
            }
          }
        } catch { /* ignore */ }
      }
      setDisplayRemedies(defaultRemedies);
    };
    loadRemedies();
    window.addEventListener('storage', loadRemedies);
    window.addEventListener('storage_sync', loadRemedies);
    return () => {
      window.removeEventListener('storage', loadRemedies);
      window.removeEventListener('storage_sync', loadRemedies);
    };
  }, []);

  const categories = ['Tất cả', ...Array.from(new Set(displayRemedies.map(r => r.category).filter(Boolean)))];

  const normalize = (str: string | undefined) => 
    (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const filteredRemedies = useMemo(() => {
    const searchNormalized = normalize(searchTerm);
    return displayRemedies.filter(remedy => {
      if (!remedy) return false;
      const matchesSearch = !searchNormalized ||
        normalize(remedy.name).includes(searchNormalized) || 
        normalize((remedy as any).benefits || (remedy as any).description || '').includes(searchNormalized) ||
        (typeof remedy.keywords === 'string' && normalize(remedy.keywords).includes(searchNormalized)) ||
        (Array.isArray(remedy.keywords) && remedy.keywords.some((kw: string) => normalize(kw).includes(searchNormalized)));
      const matchesFilter = activeFilter === 'Tất cả' || remedy.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter, displayRemedies]);

  useLayoutEffect(() => {
    setCurrentPage(1);
    // Scroll up when changing filters or searching
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchTerm, activeFilter]);

  const totalPages = Math.ceil(filteredRemedies.length / ITEMS_PER_PAGE);
  const currentRemedies = filteredRemedies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbName.trim() || !fbComment.trim()) {
      toast.error('Vui lòng nhập đầy đủ tên và nhận xét của bạn!');
      return;
    }

    setFbSubmitting(true);
    try {
      const result = saveAdminFeedback({
        author: fbName,
        content: fbComment,
        satisfaction: fbRating,
        category: 'heritage',
        status: 'pending',
        remedyUsed: fbRemedyId || 'Di sản chung',
        createdAt: new Date().toISOString()
      });

      if (result) {
        toast.success('Cảm ơn bạn! Đóng góp đã được gửi để phê duyệt.');
        setFbName('');
        setFbComment('');
        setFbRating(5);
        setFbRemedyId('');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.');
    } finally {
      setFbSubmitting(false);
    }
  };

  return (
    <div ref={topRef} className="min-h-screen bg-[#051a11] pt-24 sm:pt-32 pb-12 sm:pb-20">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/textures/cubes.png')]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-emerald-600/5 blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center mb-10 sm:mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6"
          >
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 font-bold">Thư viện Di sản</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white leading-tight mb-8 relative inline-block pb-8 break-words max-w-full"
          >
            Tinh hoa <em className="text-premium-gradient not-italic font-bold drop-shadow-[0_0_30px_rgba(16,185,129,0.3)]">Y học cổ truyền</em>
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "16rem", opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 shadow-[0_0_20px_rgba(251,191,36,0.4)] rounded-full" 
            />
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
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-emerald-400/50 transition-all"
            />
          </div>

          <div className="flex items-center overflow-x-auto no-scrollbar gap-6 sm:gap-10 px-4 py-6 border-b border-white/5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className="relative py-2 group/tab transition-all shrink-0"
              >
                <span className={`text-[13px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap ${
                  activeFilter === cat ? 'text-amber-400' : 'text-white/40 group-hover/tab:text-amber-300'
                }`}>
                  {cat}
                </span>
                <motion.div 
                  className={`absolute -bottom-0.5 left-0 h-[2px] bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] transition-all duration-500 ${
                    activeFilter === cat ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover/tab:w-full group-hover/tab:opacity-100'
                  }`}
                />
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
                      topRef.current.scrollIntoView({ behavior: 'smooth' });
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
            <p className="text-emerald-100/50">Hãy thử tìm kiếm với từ khóa khác hoặc xóa bớt bộ lọc.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-24 sm:mt-32 items-start">
          {/* Feedback Form Restoration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 glass-premium rounded-[2.5rem] p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
            
            <h3 className="text-2xl font-bold text-white mb-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-rose-400 fill-rose-400 animate-pulse" /> 
                <span className="text-premium-gradient">Đóng góp cho Di sản</span>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full" />
            </h3>
            <p className="text-emerald-100/60 text-sm mb-8">Chia sẻ kinh nghiệm hoặc phản hồi của bạn về các bài thuốc dân gian.</p>

            <form onSubmit={handleSubmitFeedback} className="space-y-6 relative z-10">
              <div className="flex items-center gap-2 mb-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-white/40 uppercase tracking-widest mr-2">Đánh giá:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setFbHover(star)}
                    onMouseLeave={() => setFbHover(null)}
                    onClick={() => setFbRating(star)}
                    className="transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (fbHover !== null ? star <= fbHover : star <= fbRating)
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                          : 'text-white/10'
                      } transition-all duration-300`}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Tên của bạn"
                  value={fbName}
                  onChange={(e) => setFbName(e.target.value)}
                  className="w-full input-premium"
                />

                <div className="relative group">
                  <input
                    list="remedy-suggestions"
                    placeholder="Tìm kiếm bài thuốc cần nhận xét..."
                    value={fbRemedyId}
                    onChange={(e) => setFbRemedyId(e.target.value)}
                    className="w-full input-premium"
                  />
                  <datalist id="remedy-suggestions">
                    {defaultRemedies.map(r => (
                      <option key={r.id} value={r.name} />
                    ))}
                  </datalist>
                </div>

                <textarea
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  placeholder="Chia sẻ nhận xét hoặc kết quả sau khi sử dụng..."
                  className="w-full input-premium min-h-[140px] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={fbSubmitting}
                className="w-full btn-premium flex items-center justify-center gap-3 group/btn"
              >
                {fbSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#051a11]/20 border-t-[#051a11] rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-sm">Gửi Phản Hồi</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right: Featured Reviews List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-amber-400" /> Nhận xét từ cộng đồng
              </h3>
            </div>
            
            {heritageReviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {heritageReviews.map((review, idx) => (
                  <motion.div
                    key={review.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-premium rounded-3xl p-6 hover:bg-white/[0.08] transition-all group relative overflow-hidden card-glow-hover"
                  >
                    <MessageSquareQuote className="absolute -top-2 -right-2 w-20 h-20 text-white/[0.03] transform -rotate-12 group-hover:text-emerald-500/[0.05] transition-all duration-700" />
                    
                    <div className="flex items-center gap-4 mb-5 relative z-10">
                      <div className="relative group/avatar shrink-0">
                        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-amber-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                          <div className="w-full h-full rounded-full bg-[#051a11] p-[2px]">
                            <img 
                              src={getAvatarUrl(review.author || review.name || 'User')} 
                              alt={review.author || review.name || 'User'} 
                              className="w-full h-full rounded-full object-cover grayscale-[0.2] contrast-125"
                            />
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#051a11] flex items-center justify-center shadow-lg">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-bold text-base">{review.author || review.name || 'Thành viên'}</h4>
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                            {review.remedyUsed || 'Di sản'}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < (review.satisfaction || review.rating) ? 'text-amber-400 fill-amber-400' : 'text-white/10'} drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]`} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-emerald-50/80 text-[15px] leading-relaxed relative z-10 pl-2 border-l-2 border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
                      "{review.content || review.comment}"
                    </p>

                    <div className="mt-5 flex items-center justify-end text-[10px] text-white/30 uppercase tracking-[0.15em] font-bold relative z-10">
                      <Clock className="w-3 h-3 mr-1.5 opacity-50" />
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                <MessageSquareQuote className="w-10 h-10 text-emerald-500/20 mx-auto mb-4" />
                <p className="text-emerald-100/40 text-sm">Chưa có nhận xét nổi bật nào. Hãy là người đầu tiên chia sẻ!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
