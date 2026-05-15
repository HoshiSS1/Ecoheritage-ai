import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquareQuote, User, Send, Heart, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { FEEDBACK_STORAGE_KEY, saveAdminFeedback } from '../pages/admin/adminUtils';
import { getAvatarUrl } from '../utils/avatarUtils';

interface Review {
  id: string;
  remedyId?: string;
  author: string;
  rating: number;
  content: string;
  date: string;
}

export function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const activeUserStr = sessionStorage.getItem('ecoheritage_active_user');
      if (activeUserStr) {
        const activeUser = JSON.parse(activeUserStr);
        if (activeUser?.name) {
          setName(activeUser.name);
        }
      }
    } catch (e) {}

    // Only show admin-approved reviews that are FEATURED
    const adminFbRaw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    const adminFb = adminFbRaw ? JSON.parse(adminFbRaw) : [];
    
    // Filter by category 'web' and isFeatured true
    const featuredReviews = adminFb
      .filter((f: any) => f.status === 'published' && f.category === 'web' && f.isFeatured)
      .map((f: any) => ({
        id: f.id, 
        author: f.author, 
        rating: f.satisfaction,
        content: f.content, 
        date: f.createdAt,
      }));

    setReviews(featuredReviews.slice(0, 4));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      toast.error('Vui lòng nhập tên và lời góp ý của bạn!');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `feedback-${Date.now()}`;
      const isoDate = new Date().toISOString();

      // IT Expert: Use unified helper for perfect sync
      const activeUserData = sessionStorage.getItem('ecoheritage_active_user');
      const userEmail = activeUserData ? JSON.parse(activeUserData).email : '';
      
      saveAdminFeedback({
        id: newId,
        author: name,
        authorEmail: userEmail,
        remedyUsed: 'Nền tảng EcoHeritage',
        content: comment,
        satisfaction: rating,
        category: 'web',
        createdAt: isoDate
      });

      setComment('');
      // Reset name if not using logged in account
      const activeUserStr = sessionStorage.getItem('ecoheritage_active_user');
      if (!activeUserStr || useCustomName) {
        setName('');
      }
      setRating(5);
      setIsSubmitting(false);
      toast.success('Cảm ơn bạn đã góp ý! Lời nhắn đã được gửi đến ban quản trị.');
    }, 1000);
  };

  return (
    <section className="py-20 sm:py-32 relative bg-[#051a11] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 sm:mb-28"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-8 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <MessageSquareQuote className="w-4 h-4" />
            Cộng đồng lan tỏa
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white font-bold tracking-tight leading-[1.1] break-words max-w-full">
            Những <em className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-200 not-italic font-bold italic drop-shadow-2xl">câu chuyện</em> <br />
            được chia sẻ
          </h2>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-emerald-500 to-amber-400 mx-auto rounded-full opacity-30" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left: Feedback Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-4 glass-premium rounded-[2.5rem] p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-amber-500/20 transition-colors duration-700" />
            
            <h3 className="text-2xl font-bold text-white mb-4 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-rose-400 fill-rose-400 animate-pulse" /> 
                <span className="text-premium-gradient">Gửi góp ý</span>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full" />
            </h3>
            <p className="text-emerald-100/60 text-sm mb-8">Ý kiến của bạn giúp EcoHeritage hoàn thiện mỗi ngày.</p>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner mb-4">
                <p className="text-xs font-bold text-white/60 mb-3">Mức độ hài lòng</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoveredStar !== null ? star <= hoveredStar : star <= rating)
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                            : 'text-white/20 hover:text-white/40'
                        } transition-all duration-300`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 px-3 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl text-xs font-black">
                    {rating}/5
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {sessionStorage.getItem('ecoheritage_active_user') && !useCustomName ? (() => {
                  const user = JSON.parse(sessionStorage.getItem('ecoheritage_active_user')!);
                  return (
                    <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/10 group/badge">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-amber-400">
                            <div className="w-full h-full rounded-full bg-[#051a11] p-[2px]">
                              <img src={getAvatarUrl(user.name, user.email)} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#051a11] flex items-center justify-center">
                            <ShieldCheck className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9px] text-emerald-400/80 font-bold uppercase tracking-wider mb-0.5">Tài khoản</p>
                          <p className="text-white font-bold text-sm truncate max-w-[120px] sm:max-w-[180px]">{user.name}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUseCustomName(true);
                          setName('');
                        }}
                        className="text-xs text-white/40 hover:text-white underline underline-offset-4 transition-colors shrink-0 ml-2"
                      >
                        Đổi tên khác
                      </button>
                    </div>
                  );
                })() : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Nhập tên hiển thị (hoặc để trống để Ẩn danh)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full input-premium"
                    />
                    {sessionStorage.getItem('ecoheritage_active_user') && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setUseCustomName(false);
                            const u = JSON.parse(sessionStorage.getItem('ecoheritage_active_user')!);
                            setName(u.name);
                          }}
                          className="text-xs text-emerald-400 font-bold uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3" /> Quay lại dùng tài khoản
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận về trải nghiệm của bạn..."
                  className="w-full input-premium min-h-[140px] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-premium flex items-center justify-center gap-3 group/btn"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#051a11]/20 border-t-[#051a11] rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-[0.2em] text-sm">Gửi Đánh Giá</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right: Reviews Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {reviews.slice(0, 4).map((review, idx) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="glass-premium rounded-[2.5rem] p-6 sm:p-8 hover:bg-white/[0.08] transition-all duration-500 relative group flex flex-col h-full card-glow-hover"
              >
                <MessageSquareQuote className="absolute top-6 right-6 w-16 h-16 text-white/[0.03] transform group-hover:scale-110 group-hover:text-emerald-500/[0.05] transition-all duration-700" />
                
                <div className="flex gap-1 mb-6 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'} drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]`}
                    />
                  ))}
                </div>
                
                <p className="text-emerald-50/90 text-base leading-relaxed font-medium mb-10 relative z-10 flex-grow pl-4 border-l-2 border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
                  "{review.content}"
                </p>
                
                <div className="flex items-center gap-4 mt-auto relative z-10">
                  <div className="relative group/avatar">
                    <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-emerald-500 to-amber-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <div className="w-full h-full rounded-full bg-[#051a11] p-[2px]">
                        <img 
                          src={getAvatarUrl(review.author)} 
                          alt={review.author} 
                          className="w-full h-full rounded-full object-cover grayscale-[0.2] contrast-125"
                        />
                      </div>
                    </div>
                    {/* Verified Badge */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#051a11] flex items-center justify-center shadow-lg">
                      <ShieldCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm tracking-tight">{review.author}</h4>
                    <p className="text-emerald-400/80 text-[9px] uppercase tracking-[0.2em] mt-1 font-bold">
                      Thành viên EcoHeritage
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

