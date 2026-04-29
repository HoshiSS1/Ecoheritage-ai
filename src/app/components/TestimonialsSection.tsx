import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MessageSquareQuote, User, Send, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { saveAdminFeedback } from '../pages/admin/adminUtils';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only show admin-approved reviews that are FEATURED
    const adminFbRaw = localStorage.getItem('ecoheritage_admin_feedback');
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
      saveAdminFeedback({
        id: newId,
        author: name,
        remedyUsed: 'Nền tảng EcoHeritage',
        content: comment,
        satisfaction: rating,
        category: 'web',
        createdAt: isoDate
      });

      // Legacy sync for public display
      const savedReviews = JSON.parse(localStorage.getItem('ecoheritage_reviews') || '[]');
      localStorage.setItem('ecoheritage_reviews', JSON.stringify([{ id: newId, author: name, content: comment, rating, date: isoDate }, ...savedReviews]));

      setComment('');
      setName('');
      setRating(5);
      setIsSubmitting(false);
      toast.success('Cảm ơn bạn đã góp ý! Lời nhắn đã được gửi đến ban quản trị.');
    }, 1000);
  };

  return (
    <section className="py-20 sm:py-32 relative bg-[#051a11] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
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
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold tracking-tight leading-[1.1]">
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
            className="lg:col-span-4 bg-gradient-to-br from-[#0a2e1f] to-[#051a11] border border-emerald-500/20 rounded-[2rem] p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />
            
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" /> Gửi góp ý của bạn
            </h3>
            <p className="text-emerald-100/60 text-sm mb-6">Ý kiến của bạn giúp EcoHeritage hoàn thiện mỗi ngày.</p>

            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              <div className="flex items-center gap-1.5 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        (hoveredStar !== null ? star <= hoveredStar : star <= rating)
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-white/20'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Tên của bạn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận về trải nghiệm của bạn..."
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 min-h-[120px] transition-colors resize-none"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#051a11] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#051a11]/20 border-t-[#051a11] rounded-full animate-spin" />
                ) : (
                  <>Gửi Đánh Giá <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
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
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-xl hover:bg-white/10 transition-colors duration-300 relative group flex flex-col h-full"
              >
                <MessageSquareQuote className="absolute top-6 right-6 w-12 h-12 text-white/5 transform group-hover:scale-110 group-hover:text-amber-400/5 transition-all duration-500" />
                
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`}
                    />
                  ))}
                </div>
                
                <p className="text-white/80 text-base leading-relaxed font-medium mb-8 relative z-10 flex-grow">
                  "{review.content}"
                </p>
                
                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-amber-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#0a2e1f] flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{review.author}</h4>
                    <p className="text-emerald-400/80 text-[10px] uppercase tracking-wider mt-0.5 font-semibold">
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

