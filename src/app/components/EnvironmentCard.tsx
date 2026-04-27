import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface EnvironmentCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  status: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
  description: string;
  index?: number;
}

const statusConfig = {
  good: { ring: 'from-emerald-400 to-emerald-600', dot: 'bg-emerald-400', label: 'Tốt', text: 'text-emerald-300' },
  moderate: { ring: 'from-amber-400 to-amber-600', dot: 'bg-amber-400', label: 'Trung bình', text: 'text-amber-300' },
  unhealthy: { ring: 'from-orange-400 to-orange-600', dot: 'bg-orange-500', label: 'Không tốt', text: 'text-orange-300' },
  hazardous: { ring: 'from-rose-500 to-rose-700', dot: 'bg-rose-500', label: 'Nguy hại', text: 'text-rose-300' },
};

export function EnvironmentCard({ icon: Icon, title, value, status, description, index = 0 }: EnvironmentCardProps) {
  const s = statusConfig[status];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.7, type: "spring", bounce: 0.3 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group flex flex-col h-full relative bg-[#0a2e1f]/40 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-500 overflow-hidden transform-style-3d cursor-default"
    >
      <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br ${s.ring} opacity-20 group-hover:opacity-40 blur-3xl transition-opacity duration-700`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className={`relative bg-gradient-to-br ${s.ring} p-4 rounded-2xl shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
          <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Icon className="w-6 h-6 text-white relative z-10" />
        </div>
        <div className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${s.dot} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${s.dot}`}></span>
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest text-white drop-shadow-sm`}>{s.label}</span>
        </div>
      </div>

      <p className="text-[10px] text-emerald-200/60 font-bold uppercase tracking-[0.2em] mb-2 relative z-10 break-words max-w-full">{title}</p>
      <p className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 relative z-10 drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-emerald-200 transition-all duration-500 break-words max-w-full">{value}</p>
      <p className="text-sm text-emerald-100/70 leading-relaxed font-light relative z-10 break-words max-w-full mt-auto">{description}</p>
    </motion.div>
  );
}
