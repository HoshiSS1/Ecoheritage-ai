import { LucideIcon, Microscope, Leaf, Sparkles, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { motion } from 'motion/react';

interface HealthAdviceCardProps {
  icon: LucideIcon;
  title: string;
  modernAdvice: string[];
  traditionalAdvice: string[];
  category: 'protection' | 'nutrition' | 'exercise' | 'rest';
  index?: number;
}

const categoryConfig = {
  protection: {
    grad: 'from-sky-400 to-blue-600',
    iconColor: 'text-sky-400',
    accentLight: 'rgba(56,189,248,0.12)',
    accentBorder: 'border-sky-500/20',
    bulletGlow: 'bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.6)]',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(56,189,248,0.08)]',
    neonLine: 'from-sky-400 to-blue-500',
    glow: 'blue' as const,
  },
  nutrition: {
    grad: 'from-emerald-400 to-green-600',
    iconColor: 'text-emerald-400',
    accentLight: 'rgba(52,211,153,0.12)',
    accentBorder: 'border-emerald-500/20',
    bulletGlow: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(52,211,153,0.08)]',
    neonLine: 'from-emerald-400 to-green-500',
    glow: 'emerald' as const,
  },
  exercise: {
    grad: 'from-purple-400 to-fuchsia-600',
    iconColor: 'text-purple-400',
    accentLight: 'rgba(192,132,252,0.12)',
    accentBorder: 'border-purple-500/20',
    bulletGlow: 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(192,132,252,0.08)]',
    neonLine: 'from-purple-400 to-fuchsia-500',
    glow: 'rose' as const,
  },
  rest: {
    grad: 'from-amber-400 to-orange-600',
    iconColor: 'text-amber-400',
    accentLight: 'rgba(251,191,36,0.12)',
    accentBorder: 'border-amber-500/20',
    bulletGlow: 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]',
    hoverGlow: 'group-hover:shadow-[0_0_40px_rgba(251,191,36,0.08)]',
    neonLine: 'from-amber-400 to-orange-500',
    glow: 'amber' as const,
  },
};

export function HealthAdviceCard({ icon: Icon, title, modernAdvice, traditionalAdvice, category, index = 0 }: HealthAdviceCardProps) {
  const c = categoryConfig[category];

  return (
    <GlassCard
      glow={c.glow}
      delay={index * 0.1}
      className={`group flex flex-col h-full p-0 border border-white/[0.06] hover:border-white/[0.12] relative overflow-hidden ${c.hoverGlow} transition-all duration-700`}
    >
      {/* ═══ Ambient background glow orbs ═══ */}
      <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-[65px] pointer-events-none opacity-20 group-hover:opacity-45 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle, ${c.accentLight}, transparent 70%)` }}
      />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-[55px] pointer-events-none opacity-10 group-hover:opacity-30 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle, ${c.accentLight}, transparent 70%)` }}
      />

      {/* ═══ Header Section ═══ */}
      <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-5 relative z-10">
        <div className="flex items-center gap-4">
          {/* Icon with animated ring */}
          <div className="relative">
            <div className={`w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${c.grad} p-2.5 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-500 relative z-10`}>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <Icon className="w-full h-full text-white relative z-10 drop-shadow-md" strokeWidth={1.8} />
            </div>
            {/* Pulse ring */}
            <div className={`absolute -inset-1.5 rounded-2xl bg-gradient-to-br ${c.grad} opacity-0 group-hover:opacity-25 blur-sm transition-opacity duration-700 z-0`} />
          </div>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[21px] sm:text-[24px] text-white font-bold sm:font-extrabold tracking-tight drop-shadow-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-white/80 transition-all duration-500">
              {title}
            </h3>
            <div className={`mt-1.5 h-0.5 w-0 group-hover:w-16 bg-gradient-to-r ${c.neonLine} rounded-full transition-all duration-700 ease-out`} />
          </div>
        </div>
      </div>

      {/* ═══ Content Panels ═══ */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-7 space-y-4 relative z-10 flex flex-col flex-grow">

        {/* ─── Modern Science Panel ─── */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 + 0.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:from-white/[0.08] hover:to-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.3)] rounded-2xl p-5 sm:p-6 flex-1 group/modern transition-all duration-500 overflow-hidden"
        >
          {/* Accent line left */}
          <div className={`absolute top-4 bottom-4 left-0 w-[3.5px] rounded-full bg-gradient-to-b ${c.neonLine} opacity-70 group-hover/modern:opacity-100 group-hover/modern:w-[4.5px] transition-all duration-300`} />

          {/* Section header */}
          <div className="flex items-center gap-2.5 mb-4 ml-1">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.accentBorder} border`}
              style={{ backgroundColor: c.accentLight }}
            >
              <Microscope className={`w-4 h-4 ${c.iconColor}`} strokeWidth={2} />
            </div>
            <h4 className={`text-[12px] sm:text-[12.5px] font-black uppercase tracking-[0.22em] ${c.iconColor}`}>
              Khoa học hiện đại
            </h4>
          </div>

          {/* Advice items */}
          <ul className="space-y-3.5 ml-1">
            {modernAdvice.map((advice, i) => (
              <li key={i} className="flex items-start gap-3 group/item">
                <ChevronRight className={`w-4 h-4 ${c.iconColor} flex-shrink-0 mt-[4px] opacity-60 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all duration-300`} strokeWidth={2.5} />
                <span className="text-[14.5px] sm:text-[15.5px] text-zinc-300/90 group-hover/item:text-white leading-relaxed font-semibold transition-colors duration-300">
                  {advice}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ─── Traditional Medicine Panel ─── */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 + 0.22, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:from-white/[0.08] hover:to-white/[0.03] border border-white/[0.06] hover:border-amber-500/20 hover:shadow-[inset_0_1px_1px_rgba(251,191,36,0.05),0_8px_20px_rgba(0,0,0,0.3)] rounded-2xl p-5 sm:p-6 flex-1 group/trad transition-all duration-500 overflow-hidden"
        >
          {/* Accent line right */}
          <div className="absolute top-4 bottom-4 right-0 w-[3.5px] rounded-full bg-gradient-to-b from-amber-400 to-emerald-500 opacity-70 group-hover/trad:opacity-100 group-hover/trad:w-[4.5px] transition-all duration-300" />

          {/* Section header — right-aligned for visual contrast */}
          <div className="flex items-center justify-end gap-2.5 mb-4 mr-1">
            <h4 className="text-[12px] sm:text-[12.5px] font-black uppercase tracking-[0.22em] text-amber-400">
              Y học cổ truyền
            </h4>
            <div className="w-8 h-8 rounded-xl border border-amber-500/25 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(251,191,36,0.12)' }}
            >
              <Leaf className="w-4 h-4 text-amber-400" strokeWidth={2} />
            </div>
          </div>

          {/* Advice items — right-aligned */}
          <ul className="space-y-3.5 mr-1">
            {traditionalAdvice.map((advice, i) => (
              <li key={i} className="flex items-start justify-end gap-3 group/item">
                <span className="text-[14.5px] sm:text-[15.5px] text-zinc-300/90 group-hover/item:text-amber-100 leading-relaxed font-semibold text-right transition-colors duration-300">
                  {advice}
                </span>
                <Sparkles className="w-4 h-4 text-amber-400/60 flex-shrink-0 mt-[4px] group-hover/item:text-amber-300 group-hover/item:scale-120 transition-all duration-300" strokeWidth={2} />
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </GlassCard>
  );
}
