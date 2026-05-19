interface StatusBadgeProps {
  /** Text label */
  label: string;
  /** Color variant */
  variant?: 'emerald' | 'amber' | 'orange' | 'blue' | 'rose' | 'purple' | 'default';
  /** Show pulsing dot indicator */
  pulse?: boolean;
  /** Icon component */
  icon?: React.ComponentType<{ className?: string }>;
  /** Additional classes */
  className?: string;
}

const variants = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  orange: {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    text: 'text-orange-400',
    dot: 'bg-orange-500',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
  },
  purple: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
  },
  default: {
    bg: 'bg-white/5',
    border: 'border-white/10',
    text: 'text-white/70',
    dot: 'bg-white/50',
  },
};

/**
 * Consistent badge/pill component for labels, statuses, and tags.
 * Replaces dozens of inline badge implementations across the codebase.
 */
export function StatusBadge({ label, variant = 'emerald', pulse = false, icon: Icon, className = '' }: StatusBadgeProps) {
  const v = variants[variant];

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border ${v.bg} ${v.border} ${v.text} px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm ${className}`}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${v.dot} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${v.dot}`} />
        </span>
      )}
      {Icon && <Icon className="w-3 h-3" />}
      {label}
    </div>
  );
}
