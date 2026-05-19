import { Heart, ArrowRight, Leaf, Sparkles, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { GlassCard } from "./GlassCard";

interface Remedy {
  id:          string;
  name:        string;
  description: string;
  ingredients: string[];
  imageUrl?:   string;
}
interface MedicineCabinetProps { remedies: Remedy[]; }

const IMAGES = [
  "https://images.unsplash.com/photo-1677146332601-1bf0e7e37a3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1697506529269-22e50e2a941c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1717769071502-e9b5d06c5fc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1521364921183-0f5135b59191?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1549017377-110ba4d5b85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
];

/* ── Remedy Card ──────────────────────────────────────────────────── */
function RemedyCard({ remedy, index }: { remedy: Remedy; index: number }) {
  const [liked, setLiked] = useState(true);
  const img = remedy.imageUrl ?? IMAGES[index % IMAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.08, ease: [0.23, 1, 0.32, 1] }}
      className="shrink-0 w-[200px] sm:w-[220px] rounded-[var(--radius-xl)] bg-[#0a1913]/60 border border-[var(--border-default)] overflow-hidden cursor-pointer hover:-translate-y-1.5 transition-transform duration-500 shadow-lg group"
    >
      {/* Image Container */}
      <div className="relative h-[120px] sm:h-[130px] overflow-hidden">
        <motion.img
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.5 }}
          src={img} 
          alt={remedy.name}
          className="w-full h-full object-cover block"
        />
        {/* Gradient Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1913] via-transparent to-transparent opacity-90" />
        
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />

        {/* Heart Toggle */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
            liked 
              ? "bg-rose-500/20 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
              : "bg-black/20 border border-white/20 hover:bg-white/10"
          }`}
        >
          <Heart size={14} className={liked ? "text-rose-400 fill-rose-400" : "text-white/70"} />
        </motion.button>
      </div>

      {/* Body Content */}
      <div className="p-3.5 flex flex-col gap-2">
        <h3 className="text-white font-bold text-sm leading-tight line-clamp-1 group-hover:text-emerald-300 transition-colors">
          {remedy.name}
        </h3>
        <p className="text-[var(--text-secondary)] text-xs leading-relaxed line-clamp-2">
          {remedy.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {remedy.ingredients.slice(0, 2).map((ing, k) => (
            <span key={k} className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-medium tracking-wide">
              {ing}
            </span>
          ))}
          {remedy.ingredients.length > 2 && (
            <span className="px-2 py-1 rounded-full bg-white/5 border border-[var(--border-subtle)] text-[var(--text-secondary)] text-[10px] font-medium">
              +{remedy.ingredients.length - 2}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Add-more card ─────────────────────────────────────────────────── */
function AddCard() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="shrink-0 w-[110px] rounded-[var(--radius-xl)] border-[1.5px] border-dashed border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[220px] transition-colors duration-300 group"
    >
      <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/20 transition-all">
        <Plus size={16} className="text-amber-400" />
      </div>
      <span className="text-amber-400/80 text-[11px] uppercase tracking-widest font-bold text-center px-3 leading-snug">
        Thêm bài thuốc
      </span>
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export function MedicineCabinet({ remedies }: MedicineCabinetProps) {
  if (remedies.length === 0) {
    return (
      <GlassCard delay={0.35} className="p-12 flex flex-col items-center justify-center gap-4 min-h-[260px] text-center">
        <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-emerald-500/10 border border-[var(--border-subtle)] flex items-center justify-center">
          <Leaf size={32} className="text-emerald-500/60" />
        </div>
        <div>
          <p className="text-[var(--text-primary)] font-bold text-lg mb-1">Tủ thuốc đang trống</p>
          <p className="text-[var(--text-disabled)] text-sm">Khám phá bản đồ di sản để thêm bài thuốc cá nhân hóa.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow="emerald" delay={0.35} className="p-6 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            <Leaf size={22} className="text-emerald-400 drop-shadow-md" />
          </div>
          <div>
            <h2 className="text-white font-display text-xl sm:text-2xl font-bold tracking-tight">
              Tủ Thuốc Của Tôi
            </h2>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-medium mt-0.5">
              Bộ sưu tập dược liệu cá nhân
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-emerald-300 text-xs font-bold uppercase tracking-wide">
              {remedies.length} hoạt động
            </span>
          </div>
          <button className="flex items-center gap-1.5 text-[var(--text-disabled)] hover:text-white text-xs font-bold uppercase tracking-widest transition-colors group">
            Xem tất cả 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* ── Scroll Area ── */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar relative z-10 snap-x">
        {remedies.map((r, i) => (
          <div key={r.id} className="snap-start">
            <RemedyCard remedy={r} index={i} />
          </div>
        ))}
        <div className="snap-start">
          <AddCard />
        </div>
      </div>
    </GlassCard>
  );
}
