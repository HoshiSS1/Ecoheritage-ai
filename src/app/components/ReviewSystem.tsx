import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, User, Clock, ShieldCheck, MessageSquareQuote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getAvatarUrl } from '../utils/avatarUtils';
import { saveAdminFeedback, FEEDBACK_STORAGE_KEY } from '../pages/admin/adminUtils';

interface Review {
  id: string;
  remedyId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ReviewSystemProps {
  remedyId: string;
  remedyName: string;
}


export function ReviewSystem({ remedyId, remedyName }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [customName, setCustomName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    // Read from unified admin feedback, filter by heritage + matching remedy
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (raw) {
      try {
        const allFb = JSON.parse(raw);
        const matching = allFb
          .filter((f: any) => f.category === 'heritage' && f.status === 'published' && f.isFeatured && f.remedyUsed === remedyName)
          .map((f: any) => ({
            id: f.id,
            remedyId,
            userName: f.author,
            rating: f.satisfaction,
            comment: f.content,
            date: f.createdAt
          }));
        setReviews(matching);
      } catch {}
    }
  }, [remedyId, remedyName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nhận xét của bạn");
      return;
    }

    setIsSubmitting(true);

    const activeUser = sessionStorage.getItem('ecoheritage_active_user');
    let finalName = 'Khách';
    
    if (useCustomName && customName.trim()) {
      finalName = customName.trim();
    } else if (activeUser && !useCustomName) {
      finalName = JSON.parse(activeUser).name;
    } else if (customName.trim()) {
      finalName = customName.trim();
    }

    const newReview: Review = {
      id: Date.now().toString(),
      remedyId,
      userName: finalName,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString()
    };

    setIsSubmitting(true);
    setTimeout(() => {
      const activeUser = sessionStorage.getItem('ecoheritage_active_user');
      const userEmail = activeUser ? JSON.parse(activeUser).email : '';

      saveAdminFeedback({
        author: finalName,
        authorEmail: userEmail,
        content: comment.trim(),
        satisfaction: rating,
        category: 'heritage',
        status: 'pending',
        remedyUsed: remedyName,
        createdAt: new Date().toISOString()
      });
      
      setReviews(prev => [newReview, ...prev]);
      setComment('');
      setRating(5);
      setIsSubmitting(false);
      toast.success('Cảm ơn bạn đã đánh giá! Đã gửi đến ban quản trị.');
    }, 800);
  };

  return (
    <div className="mt-10 space-y-8">
      <div className="glass-premium rounded-[2rem] p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-emerald-500/20 transition-colors duration-700" />
        
        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
          <Star className="w-6 h-6 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          <span className="text-premium-gradient">Đánh giá & Nhận xét</span>
        </h4>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {sessionStorage.getItem('ecoheritage_active_user') && !useCustomName ? (() => {
            const user = JSON.parse(sessionStorage.getItem('ecoheritage_active_user')!);
            return (
              <div className="flex items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/10 mb-2 group/badge">
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
                  onClick={() => setUseCustomName(true)}
                  className="text-xs text-white/40 hover:text-white underline underline-offset-4 transition-colors shrink-0 ml-2"
                >
                  Đổi tên khác
                </button>
              </div>
            );
          })() : (
            <div className="space-y-2 mb-2">
              <input
                type="text"
                placeholder="Nhập tên hiển thị (hoặc để trống để Ẩn danh)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full input-premium"
              />
              {sessionStorage.getItem('ecoheritage_active_user') && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomName(false);
                      setCustomName('');
                    }}
                    className="text-xs text-emerald-400 font-bold uppercase tracking-widest hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3" /> Quay lại dùng tài khoản
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-inner mb-4">
            <p className="text-xs font-bold text-white/60 mb-3">Mức độ hài lòng</p>
            <div className="flex items-center gap-2">
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
                    className={`w-8 h-8 ${
                      (hoveredStar !== null ? star <= hoveredStar : star <= rating)
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                        : 'text-white/20 hover:text-white/40'
                    } transition-all duration-300`}
                  />
                </button>
              ))}
              <span className="ml-3 px-3 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-xl text-xs font-black uppercase tracking-widest">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="relative group/textarea">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-amber-500/0 opacity-0 group-hover/textarea:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`Bạn cảm thấy thế nào về ${remedyName}? Hãy chia sẻ trải nghiệm của mình...`}
              className="w-full input-premium min-h-[140px] resize-none text-[15px] leading-relaxed relative z-10"
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
                <span className="uppercase tracking-[0.2em] text-sm">Gửi nhận xét</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h5 className="text-sm font-bold uppercase tracking-widest text-emerald-400 px-2">
          Cộng đồng nói gì ({reviews.length})
        </h5>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {reviews.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/40 text-sm italic text-center py-8"
              >
                Chưa có nhận xét nào. Hãy là người đầu tiên!
              </motion.p>
            ) : (
              reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass-premium rounded-[1.5rem] p-6 space-y-5 hover:bg-white/[0.06] transition-all duration-500 group relative overflow-hidden card-glow-hover border-white/5 hover:border-emerald-500/30"
                >
                  <MessageSquareQuote className="absolute -top-4 -right-4 w-24 h-24 text-white/[0.02] transform -rotate-12 group-hover:text-emerald-500/[0.05] group-hover:rotate-0 transition-all duration-700" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative group/avatar">
                        <div className="w-12 h-12 rounded-[1rem] p-[2px] bg-gradient-to-tr from-emerald-500 to-amber-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover/avatar:scale-110 transition-transform duration-500">
                          <div className="w-full h-full rounded-[0.8rem] bg-[#051a11] p-[2px]">
                            <img 
                              src={getAvatarUrl(review.userName)} 
                              alt={review.userName} 
                              className="w-full h-full rounded-[0.6rem] object-cover grayscale-[0.1] contrast-110"
                            />
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#051a11] flex items-center justify-center shadow-lg">
                          <ShieldCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-black text-[15px] tracking-tight">{review.userName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                                } drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]`}
                              />
                            ))}
                          </div>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <div className="flex items-center gap-1.5 text-[9px] text-emerald-400/80 font-black uppercase tracking-widest">
                            <Clock className="w-3 h-3" />
                            {new Date(review.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 rounded-2xl p-4 relative z-10 border border-white/5 group-hover:border-emerald-500/20 transition-colors duration-500">
                    <p className="text-emerald-50/90 text-[15px] leading-relaxed font-medium italic">
                      "{review.comment}"
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
