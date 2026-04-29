import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Sparkles, Leaf, Info, X, ChevronRight, BookOpen } from 'lucide-react';
import { ReviewSystem } from './ReviewSystem';

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
      className="group flex flex-col h-full relative bg-[#0a2e1f]/40 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] hover:shadow-[0_40px_80px_-20px_rgba(251,191,36,0.25)] transition-all duration-700 border border-white/10 transform-style-3d will-change-transform scroll-mt-32"
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
            <div className="w-24 h-24 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.18)]">
              <Leaf className="w-12 h-12 text-emerald-300" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.35em] text-amber-300 font-bold">{category}</span>
          </div>
        )}
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#051a11] via-[#051a11]/40 to-transparent transition-opacity duration-700" />
        
        {/* Badge */}
        <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-xl border border-white/20 text-amber-300 text-[10px] px-4 py-2 rounded-full uppercase tracking-[0.3em] font-bold shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-2 transform group-hover:translate-z-10 transition-transform">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Di sản Đà Nẵng
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-8 left-6 right-6 transform group-hover:-translate-y-2 transition-transform duration-500">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-amber-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.25)]">
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
          <p className="text-[15px] text-amber-50 italic font-medium leading-relaxed relative z-10 drop-shadow-md break-words pl-4 border-l-2 border-amber-500/50">
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
              className="absolute inset-0 bg-[#020b07]/80 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#0a2e1f]/90 backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-8 border-b border-white/5 flex items-start justify-between bg-gradient-to-br from-white/5 to-transparent">
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-amber-300">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {category}
                  </div>
                  <h3 className="font-display text-2xl sm:text-3xl text-white font-bold leading-tight">
                    {name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-2">
                  <Leaf className="w-4 h-4" /> Các bước thực hiện
                </h4>
                
                <div className="space-y-6">
                  {steps?.map((step, idx) => (
                    <div key={idx} className="flex gap-4 group/step">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-display font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover/step:bg-emerald-500/20 group-hover/step:scale-110 transition-all">
                        {idx + 1}
                      </div>
                      <p className="text-[#F8FAFC] leading-relaxed text-[15px] font-medium pt-1">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Rating & Review Section */}
                <div className="mt-10 pt-8 border-t border-white/10">
                  <ReviewSystem remedyId={id} remedyName={name} />
                </div>
              </div>

              {/* Footer / Disclaimer */}
              <div className="p-5 bg-black/20 border-t border-white/5 text-center">
                <p className="text-[11px] text-white/40 italic flex items-center justify-center gap-2">
                  <Info className="w-3.5 h-3.5" />
                  Thông tin mang tính chất tham khảo, hãy tham vấn ý kiến chuyên gia trước khi sử dụng.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
