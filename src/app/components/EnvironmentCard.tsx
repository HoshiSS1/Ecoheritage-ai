import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';
import { AnimatedCounter } from './AnimatedCounter';

interface EnvironmentCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  status: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
  description: string;
  index?: number;
}

const statusConfig = {
  good: { ring: 'from-emerald-400 to-emerald-600', badge: 'emerald' as const, label: 'Tốt', glow: 'emerald' as const },
  moderate: { ring: 'from-amber-400 to-amber-600', badge: 'amber' as const, label: 'Khá ổn', glow: 'amber' as const },
  unhealthy: { ring: 'from-orange-400 to-orange-600', badge: 'orange' as const, label: 'Rất cao', glow: 'amber' as const },
  hazardous: { ring: 'from-rose-500 to-rose-700', badge: 'rose' as const, label: 'Nguy hại', glow: 'rose' as const },
};

export function EnvironmentCard({ icon: Icon, title, value, status, description, index = 0 }: EnvironmentCardProps) {
  const s = statusConfig[status];
  const isNumber = typeof value === 'number' || !isNaN(Number(value));
  const numValue = isNumber ? Number(value) : 0;

  return (
    <GlassCard
      glow={s.glow}
      delay={index * 0.1}
      className="group flex flex-col h-full p-5 sm:p-6 md:p-8 cursor-default"
    >
      {/* Ambient Glow background */}
      <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br ${s.ring} opacity-20 group-hover:opacity-40 blur-3xl transition-opacity duration-700 pointer-events-none`} />

      <div className="h-[200px] sm:h-[240px] flex flex-col relative z-10">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className={`relative w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${s.ring} p-2.5 shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
            <div className="absolute inset-0 bg-white/20 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity" />
            <Icon className="w-full h-full text-white relative z-10 drop-shadow-md" />
          </div>
          <StatusBadge
            variant={s.badge}
            label={s.label}
            pulse={true}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
          <div className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-emerald-200 transition-all duration-500 leading-none truncate max-w-full">
            {isNumber ? (
              <AnimatedCounter target={numValue} duration={1500} decimals={Number.isInteger(numValue) ? 0 : 1} />
            ) : (
              value || '0'
            )}
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-[var(--border-default)] pt-6 mt-4">
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-4 group-hover:text-[var(--text-primary)] transition-colors">{description}</p>
      </div>
    </GlassCard>
  );
}
