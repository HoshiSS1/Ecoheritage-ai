import { LucideIcon, Microscope, Leaf } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface HealthAdviceCardProps {
  icon: LucideIcon;
  title: string;
  modernAdvice: string[];
  traditionalAdvice: string[];
  category: 'protection' | 'nutrition' | 'exercise' | 'rest';
  index?: number;
}

const categoryConfig = {
  protection: { glow: 'blue' as const, grad: 'from-sky-400 to-blue-600', iconColor: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  nutrition:  { glow: 'emerald' as const, grad: 'from-emerald-400 to-green-600', iconColor: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  exercise:   { glow: 'rose' as const, grad: 'from-purple-400 to-fuchsia-600', iconColor: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  rest:       { glow: 'amber' as const, grad: 'from-amber-400 to-orange-600', iconColor: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
};

export function HealthAdviceCard({ icon: Icon, title, modernAdvice, traditionalAdvice, category, index = 0 }: HealthAdviceCardProps) {
  const c = categoryConfig[category];

  return (
    <GlassCard
      glow={c.glow}
      delay={index * 0.1}
      className="group flex flex-col h-full p-5 sm:p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 sm:gap-5 mb-6 sm:mb-8 relative z-10">
        <div className={`relative w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${c.grad} p-2.5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[var(--radius-lg)]" />
          <Icon className="w-full h-full text-white relative z-10 drop-shadow-md" />
        </div>
        <h3 className="font-display text-xl sm:text-2xl text-white font-bold tracking-tight drop-shadow-md break-words max-w-full relative group-hover:text-amber-300 transition-colors duration-500">
          {title}
        </h3>
      </div>

      <div className="space-y-4 relative z-10 flex flex-col flex-grow">
        {/* Modern Advice */}
        <div className="bg-[var(--glass-bg)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden flex-1 group/modern transition-colors hover:border-[var(--border-hover)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-400 to-blue-600" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-1.5 bg-sky-500/10 rounded-md border border-sky-500/20">
              <Microscope className="w-4 h-4 text-sky-400" />
            </div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Khoa học hiện đại</h4>
          </div>
          <ul className="space-y-3 pl-1">
            {modernAdvice.map((advice, i) => (
              <li key={i} className="text-sm sm:text-base text-[var(--text-secondary)] flex items-start gap-3 leading-relaxed font-bold">
                <span className="text-sky-500 mt-1.5 text-[8px] flex-shrink-0">●</span>
                <span className="group-hover/modern:text-[var(--text-primary)] transition-colors">{advice}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Traditional Advice */}
        <div className="bg-[var(--glass-bg)] border border-[var(--border-default)] rounded-[var(--radius-lg)] p-5 relative overflow-hidden flex-1 group/trad transition-colors hover:border-[var(--border-hover)]">
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-amber-400 to-emerald-500" />
          <div className="flex items-center justify-end gap-3 mb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 text-right">Y học cổ truyền</h4>
            <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
              <Leaf className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <ul className="space-y-3 pr-1">
            {traditionalAdvice.map((advice, i) => (
              <li key={i} className="text-sm sm:text-base text-[var(--text-secondary)] flex flex-row-reverse items-start gap-3 leading-relaxed font-bold text-right">
                <span className="text-emerald-500 mt-1 text-[10px] flex-shrink-0">✦</span>
                <span className="group-hover/trad:text-amber-50 transition-colors">{advice}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassCard>
  );
}
