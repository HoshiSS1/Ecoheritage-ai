import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, User, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

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
      <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          Đánh giá & Nhận xét
        </h4>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
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
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-white/20'
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-amber-200 font-medium">
              {rating}/5 sao
            </span>
          </div>

          <div className="relative">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về bài thuốc này..."
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-white text-sm focus:outline-none focus:border-emerald-500/50 min-h-[100px] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#051a11] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-[#051a11]/20 border-t-[#051a11] rounded-full animate-spin" />
            ) : (
              <>
                Gửi nhận xét <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <User className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{review.userName}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-medium">
                      <Clock className="w-3 h-3" />
                      {new Date(review.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed pl-1">
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
