import { motion } from 'motion/react';
import { Droplets, Gauge, Sun, Wind, Activity } from 'lucide-react';
import { useAirQuality } from '../utils/useAirQuality';
import { AnimatedCounter } from './AnimatedCounter';
import { SectionHeader } from './SectionHeader';

export function StatsSection() {
  const { data: aqiData } = useAirQuality();

  const stats = [
    {
      icon: Gauge,
      value: aqiData?.aqi ?? 0,
      suffix: '',
      label: 'US AQI Đà Nẵng',
      color: 'text-sky-400',
      gradient: 'from-sky-400 to-blue-600',
    },
    {
      icon: Wind,
      value: aqiData?.pm25 ?? 0,
      suffix: '',
      label: 'PM2.5 (µg/m³)',
      color: 'text-rose-400',
      gradient: 'from-rose-400 to-pink-600',
    },
    {
      icon: Sun,
      value: aqiData?.uvIndex ?? 0,
      suffix: '',
      label: 'Chỉ số UV hiện tại',
      color: 'text-amber-400',
      gradient: 'from-amber-400 to-orange-600',
    },
    {
      icon: Droplets,
      value: aqiData?.humidity ?? 0,
      suffix: '%',
      label: 'Độ ẩm không khí',
      color: 'text-emerald-400',
      gradient: 'from-emerald-400 to-green-600',
    },
  ];

  return (
    <section className="bg-gradient-to-b from-[var(--eco-black)] to-[var(--eco-dark)] relative overflow-hidden border-y border-[var(--border-subtle)]" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>
      {/* Perspective Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-emerald-500/20 to-transparent" style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'bottom' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          icon={Activity}
          badge="Trạm dữ liệu môi trường"
          title={<>Theo dõi chất lượng môi trường <em className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 not-italic">theo thời gian thực</em></>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative bg-[var(--eco-surface)]/60 backdrop-blur-xl rounded-[var(--radius-2xl)] p-5 sm:p-6 lg:p-8 border border-[var(--border-default)] shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-xl)] hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {/* Ambient glow */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700`} />

              {/* Icon */}
              <div className={`relative z-10 w-12 h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${s.gradient} p-2.5 mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <s.icon className="w-full h-full text-white drop-shadow-md" />
              </div>

              {/* Animated Value */}
              <div className="relative z-10 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 tracking-tighter">
                <AnimatedCounter
                  target={s.value}
                  duration={1800}
                  suffix={s.suffix}
                  decimals={s.label.includes('PM') ? 1 : 0}
                />
              </div>

              {/* Label */}
              <div className="relative z-10 text-[11px] sm:text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-[0.15em] group-hover:text-[var(--text-primary)] transition-colors">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
