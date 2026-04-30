import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, User, Clock, ShieldCheck, MessageSquareQuote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { getAvatarUrl } from '../utils/avatarUtils';

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

const STORAGE_KEY = 'ecoheritage_reviews';

export function ReviewSystem({ remedyId, remedyName }: ReviewSystemProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  useEffect(() => {
    const savedReviews = localStorage.getItem(STORAGE_KEY);
    if (savedReviews) {
      const allReviews: Review[] = JSON.parse(savedReviews);
      setReviews(allReviews.filter(r => r.remedyId === remedyId));
    } else {
      // Seed initial reviews if none exist
      const initialReviews: Review[] = [
        {
          id: 'seed-1',
          remedyId: 'tra-la-sen',
          userName: 'Minh Hoàng',
          rating: 5,
          comment: 'Rất hiệu quả, mình uống xong thấy người nhẹ nhàng hẳn.',
          date: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
          id: 'seed-2',
          remedyId: 'tra-la-sen',
          userName: 'Lan Anh',
          rating: 4,
          comment: 'Vị hơi đắng chút nhưng rất mát gan.',
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialReviews));
      setReviews(initialReviews.filter(r => r.remedyId === remedyId));
    }
  }, [remedyId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nhận xét của bạn");
      return;
    }

    setIsSubmitting(true);

    const activeUser = sessionStorage.getItem('ecoheritage_active_user');
    const user = activeUser ? JSON.parse(activeUser) : { name: 'Khách' };

    const newReview: Review = {
      id: Date.now().toString(),
      remedyId,
      userName: user.name,
      rating,
      comment: comment.trim(),
      date: new Date().toISOString()
    };

    setTimeout(() => {
      const savedReviews = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const updatedReviews = [newReview, ...savedReviews];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReviews));
      
      setReviews(prev => [newReview, ...prev]);
      setComment('');
      setRating(5);
      setIsSubmitting(false);
      toast.success("Cảm ơn bạn đã đánh giá!");
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
          <div className="flex items-center gap-2 mb-4 bg-white/5 p-3 rounded-2xl border border-white/5">
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
                      ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'text-white/20'
                  } transition-all duration-300`}
                />
              </button>
            ))}
            <span className="ml-4 text-xs text-amber-200 font-bold uppercase tracking-widest">
              {rating}/5 sao
            </span>
          </div>

          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về bài thuốc này..."
              className="w-full input-premium min-h-[120px] resize-none"
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
                  className="glass-premium rounded-2xl p-6 space-y-4 hover:bg-white/[0.08] transition-all group relative overflow-hidden card-glow-hover"
                >
                  <MessageSquareQuote className="absolute -top-2 -right-2 w-16 h-16 text-white/[0.02] transform -rotate-12 group-hover:text-emerald-500/[0.05] transition-all duration-700" />
                  
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative group/avatar">
                        <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-emerald-500 to-amber-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <div className="w-full h-full rounded-full bg-[#051a11] p-[1.5px]">
                            <img 
                              src={getAvatarUrl(review.userName)} 
                              alt={review.userName} 
                              className="w-full h-full rounded-full object-cover grayscale-[0.1] contrast-110"
                            />
                          </div>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#051a11] flex items-center justify-center shadow-lg">
                          <ShieldCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{review.userName}</p>
                        <div className="flex gap-0.5 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                              } drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-bold uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      {new Date(review.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <p className="text-emerald-50/80 text-sm leading-relaxed relative z-10 pl-3 border-l-2 border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
                    {review.comment}
                  </p>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
