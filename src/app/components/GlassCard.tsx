import { motion, type HTMLMotionProps } from 'motion/react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Glow color on hover: emerald (default), amber, blue, rose */
  glow?: 'emerald' | 'amber' | 'blue' | 'rose' | 'none';
  /** Hover lift amount */
  hoverLift?: boolean;
  /** Animation delay for stagger reveals (seconds) */
  delay?: number;
  /** Additional classes */
  className?: string;
  /** Children */
  children: React.ReactNode;
}

const glowColors = {
  emerald: 'hover:border-emerald-500/25 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)]',
  amber:   'hover:border-amber-500/25 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)]',
  blue:    'hover:border-blue-500/25 hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]',
  rose:    'hover:border-rose-500/25 hover:shadow-[0_0_30px_rgba(244,63,94,0.12)]',
  none:    '',
};

/**
 * Reusable glass-morphism card component with consistent
 * styling, hover effects, and entrance animations.
 *
 * Replaces ad-hoc glass-premium cards throughout the application
 * with a single, token-based component.
 */
export function GlassCard({
  glow = 'emerald',
  hoverLift = true,
  delay = 0,
  className = '',
  children,
  ...props
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={[
        'relative overflow-hidden',
        'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]',
        'border border-[var(--border-default)]',
        'rounded-[var(--radius-xl)]',
        'shadow-[var(--shadow-md)]',
        'transition-all duration-500 ease-[var(--ease-spring)]',
        hoverLift ? 'hover:-translate-y-1' : '',
        glowColors[glow],
        className,
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </motion.div>
  );
}
