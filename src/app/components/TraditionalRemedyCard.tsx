import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sparkles, Leaf, Info, X, ChevronRight, BookOpen } from 'lucide-react';

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

  return (
    <motion.article
      id={id}
      initial={{ opacity: 0, y: 50, rotateY: 15 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 1, type: "spring", bounce: 0.4 }}
      whileHover={{ y: -15, scale: 1.02 }}
      className="group flex flex-col h-full relative glass-premium rounded-[2.5rem] overflow-hidden transition-all duration-700 transform-style-3d will-change-transform scroll-mt-32 card-glow-hover hover:bg-white/[0.05]"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-amber-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-amber-500/10 group-hover:to-emerald-500/10 transition-colors duration-1000 z-20 pointer-events-none" />
      
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-b-[1.5rem] sm:rounded-b-[2.5rem] shadow-2xl">
        {imageUrl ? (
          <ImageWithFallback
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-[2s] ease-out will-change-transform"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0a2e1f] via-[#123625] to-[#051a11] flex flex-col items-center justify-center gap-4 group-hover:scale-110 transition-transform duration-[2s] ease-out">
            <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.18)]">
              <Leaf className="w-12 h-12 text-emerald-300" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-amber-300 font-bold">{category}</span>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#051a11] via-[#051a11]/40 to-transparent transition-opacity duration-700" />
        
        {/* Badge */}
        <div className="absolute top-6 left-6 glass-premium backdrop-blur-md border-white/20 text-amber-300 text-[9px] px-4 py-2 rounded-full uppercase tracking-[0.3em] font-bold shadow-2xl flex items-center gap-2 transform group-hover:translate-z-10 transition-transform">
          <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          Di sản Đà Nẵng
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-8 left-6 right-6 transform group-hover:-translate-y-2 transition-transform duration-500">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-amber-300 shadow-[0_0_20px_rgba(0,0,0,0.25)]">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {category}
          </div>
          <h3 className="font-display text-xl sm:text-2xl md:text-3xl text-white leading-tight drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)] font-bold break-words">
            {name}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 sm:p-8 relative bg-transparent z-10 flex flex-col flex-grow">
        
        {/* Ingredients */}
        <div className="mb-6 transform group-hover:translate-x-2 transition-transform duration-500 delay-75">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-3 flex items-center gap-2">
            <Leaf className="w-3.5 h-3.5" /> Thành phần
          </h4>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing, i) => (
              <span key={i} className="bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-emerald-100 px-4 py-2 rounded-full shadow-inner transition-colors duration-300 tracking-wider backdrop-blur-sm cursor-default">
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-6 transform group-hover:translate-x-2 transition-transform duration-500 delay-100">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Công dụng
          </h4>
          <p className="text-[15px] text-[#F8FAFC]/95 leading-relaxed font-medium break-words drop-shadow-sm">
            {benefits}
          </p>
        </div>

        {/* Usage */}
        <div className="pt-6 border-t border-white/10 relative transform group-hover:translate-x-2 transition-transform duration-500 delay-150 flex-grow flex flex-col">
          <p className="text-[15px] text-emerald-50/70 italic font-medium leading-relaxed relative z-10 drop-shadow-md break-words pl-4 border-l-2 border-amber-500/30 group-hover:border-amber-500/70 transition-colors">
            {usage}
          </p>
          
          {steps && steps.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 hover:text-amber-400 transition-colors group/btn"
            >
              <BookOpen className="w-4 h-4" />
              Xem cách thực hiện
              <ChevronRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Steps Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ margin: 0 }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#020b07]/80"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-premium rounded-[2.5rem] overflow-hidden max-h-[85vh] flex flex-col shadow-[0_0_100px_rgba(16,185,129,0.2)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-5 sm:p-8 border-b border-white/5 flex items-start justify-between bg-gradient-to-br from-white/[0.02] to-transparent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[8px] uppercase tracking-[0.3em] text-emerald-400 font-bold">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    {category}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl text-white font-bold leading-tight drop-shadow-sm">
                    <span className="text-premium-gradient">{name}</span>
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white/[0.01]">
                <h4 className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-6 flex items-center gap-2">
                  <Leaf className="w-3.5 h-3.5" /> Các bước thực hiện
                </h4>
                
                <div className="space-y-6">
                  {steps?.map((step, idx) => (
                    <div key={idx} className="flex gap-4 group/step">
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-display font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover/step:bg-emerald-500/20 group-hover/step:scale-110 transition-all duration-500">
                        {idx + 1}
                      </div>
                      <p className="text-emerald-50/90 leading-relaxed text-[15px] font-medium pt-1 group-hover:text-white transition-colors">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer / Disclaimer */}
                <div className="mt-12 pt-8 border-t border-white/5">
                  <p className="text-[10px] text-white/20 italic flex items-center justify-center gap-2 uppercase tracking-widest font-bold">
                    <Info className="w-4 h-4 opacity-50" />
                    Tham vấn ý kiến chuyên gia trước khi sử dụng
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
