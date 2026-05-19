import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sparkles, Leaf, Info, X, ChevronRight, BookOpen, Clock, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';

interface TraditionalRemedyCardProps {
  id: string;
  category: string;
  name: string;
  ingredients: string[];
  benefits: string;
  usage: string;
  image: string;
  imageUrl?: string;
  steps?: string[];
  index?: number;
}

export function TraditionalRemedyCard({ id, category, name, ingredients, benefits, usage, imageUrl, steps, index = 0 }: TraditionalRemedyCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const syncState = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('ecoheritage_saved_remedies') || '[]');
        setIsSaved(saved.includes(name));
      } catch { }
    };
    syncState();
    window.addEventListener('storage_sync', syncState);
    return () => window.removeEventListener('storage_sync', syncState);
  }, [name]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Kiểm tra xem người dùng đã đăng nhập chưa
    const activeUser = sessionStorage.getItem('ecoheritage_active_user');
    if (!activeUser) {
      toast.error('Yêu cầu đăng nhập!', {
        description: 'Vui lòng đăng nhập để lưu bài thuốc này vào tủ thuốc di sản cá nhân.',
        duration: 5000,
        style: {
          fontSize: '15px',
          fontWeight: 'bold',
          padding: '18px 22px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #2e0a0a 0%, #1a0505 100%)',
          color: '#fff',
          border: '1px solid rgba(239,68,68,0.3)',
        },
      });
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem('ecoheritage_saved_remedies') || '[]');
      let next;
      if (isSaved) {
        next = saved.filter((n: string) => n !== name);
        toast.info(`Đã bỏ lưu ${name}`);
      } else {
        next = [...saved, name];
        toast.success(`Đã lưu ${name} vào bộ sưu tập!`);
      }
      localStorage.setItem('ecoheritage_saved_remedies', JSON.stringify(next));
      setIsSaved(!isSaved);
      window.dispatchEvent(new Event('storage_sync'));
    } catch { }
  };

  return (
    <div id={id} className="h-full">
      <GlassCard
        glow="emerald"
        delay={index * 0.15}
        className="group flex flex-col h-full !p-0 overflow-hidden cursor-pointer scroll-mt-32"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Luxury Border Glow Animation */}
        <div className="absolute -inset-[2px] bg-gradient-to-r from-emerald-500/0 via-amber-400/0 to-emerald-500/0 group-hover:via-amber-400/40 group-hover:duration-1000 transition-all duration-1000 z-0 rounded-[var(--radius-xl)] opacity-0 group-hover:opacity-100 blur-[2px]" />
        <div className="absolute inset-0 bg-[var(--eco-dark)] z-[1] rounded-[var(--radius-xl)]" />
        
        {/* Image Section */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-b-[var(--radius-xl)] z-10 border-b border-[var(--border-default)]">
          {imageUrl ? (
            <ImageWithFallback
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 group-hover:rotate-1 transition-all duration-[2s] ease-out will-change-transform"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[var(--eco-surface)] via-[var(--eco-elevated)] to-[var(--eco-dark)] flex flex-col items-center justify-center gap-4 group-hover:scale-105 transition-transform duration-[2s] ease-out">
              <div className="w-20 h-20 rounded-full border border-[var(--border-default)] bg-white/5 flex items-center justify-center shadow-[var(--shadow-glow-emerald)]">
                <Leaf className="w-10 h-10 text-emerald-400" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.35em] text-amber-400 font-bold">{category}</span>
            </div>
          )}
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--eco-dark)] via-[var(--eco-dark)]/40 to-transparent transition-opacity duration-700" />
          
          {/* Badge */}
          <div className="absolute top-4 left-4 z-20">
            <StatusBadge variant="amber" label="Di sản Đà Nẵng" icon={Sparkles} />
          </div>

          {/* Heart Save Button */}
          <button
            onClick={toggleSave}
            title={isSaved ? "Bỏ lưu bài thuốc" : "Lưu vào bộ sưu tập"}
            className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--border-default)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg group/heart overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/heart:opacity-100 transition-opacity" />
            <Heart className={`w-4 h-4 relative z-10 transition-colors duration-300 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-white/80 group-hover/heart:text-rose-400'}`} />
          </button>
        </div>

        {/* Content Section */}
        <div className="p-5 sm:p-6 relative bg-transparent z-10 flex flex-col flex-grow">
          <div className="mb-5 transform group-hover:-translate-y-1 transition-transform duration-500">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[9px] uppercase tracking-[0.3em] text-emerald-400 font-bold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              {category}
            </div>
            <h3 className="font-display text-xl sm:text-2xl text-white leading-tight font-bold break-words group-hover:text-amber-300 transition-colors duration-500">
              {name}
            </h3>
          </div>
          
          {/* Ingredients */}
          <div className="mb-5 transform group-hover:translate-x-1 transition-transform duration-500 delay-75">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <Leaf className="w-3 h-3 text-emerald-400" /> Thành phần
            </h4>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, i) => (
                <span key={i} className="bg-[var(--glass-bg)] border border-[var(--border-default)] text-[11px] font-medium text-[var(--text-primary)] px-3 py-1.5 rounded-md transition-colors duration-300 cursor-default">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-5 transform group-hover:translate-x-1 transition-transform duration-500 delay-100">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <Info className="w-3 h-3 text-sky-400" /> Công dụng
            </h4>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-3">
              {benefits}
            </p>
          </div>

          {/* Execution & Usage */}
          <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex flex-col gap-3">
            <div className="flex items-center justify-between opacity-70 group-hover:opacity-100 transition-opacity duration-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                  Thực hiện: {
                    name.toLowerCase().includes('trà') || name.toLowerCase().includes('nước') ? '5 - 10P' :
                    name.toLowerCase().includes('cháo') || name.toLowerCase().includes('canh') ? '30 - 45P' :
                    name.toLowerCase().includes('ngâm') && !name.toLowerCase().includes('chân') ? '2 - 3 TUẦN' :
                    name.toLowerCase().includes('siro') ? '1 - 2 GIỜ' :
                    name.toLowerCase().includes('xông') || name.toLowerCase().includes('chân') ? '15 - 20P' :
                    '15 - 20P'
                  }
                </span>
              </div>
              <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full w-2/3 bg-gradient-to-r from-emerald-500 to-amber-400" />
              </div>
            </div>

            <div className="relative transform group-hover:translate-x-1 transition-transform duration-500 delay-150 flex flex-col items-start">
              {steps && steps.length > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                  className="mt-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-emerald-400 hover:text-amber-400 transition-colors group/btn"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Xem cách thực hiện
                  <ChevronRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Steps Modal — portaled to body to escape GlassCard transform+overflow containment */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ margin: 0 }}>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-[#020b07]/80 backdrop-blur-sm"
              />
              
              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-[var(--eco-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden max-h-[85vh] flex flex-col shadow-[var(--shadow-2xl)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-[var(--border-subtle)] flex items-start justify-between bg-[var(--glass-bg)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <div className="mb-3">
                      <StatusBadge variant="emerald" label={category} icon={Sparkles} />
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl text-white font-bold leading-tight">
                      <span className="text-premium-gradient">{name}</span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-6 flex items-center gap-2">
                    <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Các bước thực hiện
                  </h4>
                  
                  <div className="space-y-6">
                    {steps?.map((step, idx) => (
                      <div key={idx} className="flex gap-4 group/step">
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--eco-elevated)] border border-[var(--border-default)] text-emerald-400 flex items-center justify-center font-display font-bold text-sm shadow-sm group-hover/step:bg-emerald-500/10 group-hover/step:border-emerald-500/30 transition-all duration-300">
                          {idx + 1}
                        </div>
                        <p className="text-[var(--text-secondary)] leading-relaxed text-[15px] font-medium pt-1 group-hover/step:text-[var(--text-primary)] transition-colors">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-[var(--border-subtle)]">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-amber-400" /> Cách dùng
                    </h4>
                    <p className="text-[14px] text-[var(--text-primary)] italic font-medium leading-relaxed bg-[var(--eco-elevated)] p-4 rounded-lg border border-[var(--border-default)] border-l-2 border-l-amber-500/50">
                      {usage}
                    </p>
                  </div>

                  {/* Footer / Disclaimer */}
                  <div className="mt-8">
                    <p className="text-[10px] text-amber-400/80 italic flex items-center justify-center gap-1.5 uppercase tracking-widest font-bold">
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                      Tham vấn ý kiến chuyên gia trước khi sử dụng
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
