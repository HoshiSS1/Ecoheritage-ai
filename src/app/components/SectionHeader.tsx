import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  /** Icon for the badge pill */
  icon?: LucideIcon;
  /** Badge text (e.g. "XU HƯỚNG") */
  badge: string;
  /** Main heading — supports JSX for gradient text */
  title: React.ReactNode;
  /** Optional subtitle paragraph */
  subtitle?: string;
  /** Alignment, defaults to center */
  align?: 'left' | 'center';
  /** Additional className for the wrapper */
  className?: string;
}

/**
 * Reusable section header component used across the application.
 * Replaces 6+ duplicated instances of the badge → h2 → divider → p pattern.
 *
 * Usage:
 * <SectionHeader
 *   icon={TrendingUp}
 *   badge="Xu hướng"
 *   title={<>Nhịp thở của <em className="text-premium-gradient not-italic">thành phố</em></>}
 *   subtitle="Phân tích đa chiều AQI, UV và Độ ẩm"
 * />
 */
export function SectionHeader({ icon: Icon, badge, title, subtitle, align = 'center', className = '' }: SectionHeaderProps) {
  const isCenter = align === 'center';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`${isCenter ? 'text-center' : 'text-left'} mb-12 sm:mb-16 ${className}`}
    >
      {/* Badge Pill */}
      <div className={`inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-6 shadow-[0_0_20px_rgba(16,185,129,0.08)] backdrop-blur-sm`}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {badge}
      </div>

      {/* Title */}
      <h2 className="font-display text-white font-bold tracking-tight leading-[1.1] break-words max-w-full" style={{ fontSize: 'var(--text-display)' }}>
        {title}
      </h2>

      {/* Divider */}
      <div className={`mt-6 w-20 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full opacity-40 ${isCenter ? 'mx-auto' : ''}`} />

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-6 text-emerald-100/60 font-medium leading-relaxed max-w-2xl" style={{ fontSize: 'var(--text-body-lg)', ...(isCenter ? { marginLeft: 'auto', marginRight: 'auto' } : {}) }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
