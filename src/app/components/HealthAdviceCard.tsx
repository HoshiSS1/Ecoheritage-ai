import { LucideIcon, Microscope, Leaf } from 'lucide-react';
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
  protection: { grad: 'from-sky-400 to-blue-600', ring: 'rgba(56,189,248,0.2)' },
  nutrition: { grad: 'from-emerald-400 to-green-600', ring: 'rgba(52,211,153,0.2)' },
  exercise: { grad: 'from-purple-400 to-fuchsia-600', ring: 'rgba(192,132,252,0.2)' },
  rest: { grad: 'from-amber-400 to-orange-600', ring: 'rgba(251,191,36,0.2)' },
};

export function HealthAdviceCard({ icon: Icon, title, modernAdvice, traditionalAdvice, category, index = 0 }: HealthAdviceCardProps) {
  const c = categoryConfig[category];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: 10 }}
      whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.15, duration: 0.8, type: "spring", bounce: 0.4 }}
      className="group relative flex flex-col h-full bg-[#051a11]/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] transition-all duration-500 overflow-hidden transform-style-3d"
    >
      {/* 3D Ambient Glow */}
      <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full bg-gradient-to-br ${c.grad} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-center gap-5 mb-8 relative z-10">
        <div className={`bg-gradient-to-br ${c.grad} p-4 rounded-2xl shadow-[0_0_20px_${c.ring}] transform group-hover:rotate-12 transition-transform duration-500 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Icon className="w-7 h-7 text-white relative z-10" />
        </div>
        <h3 className="font-display text-2xl sm:text-3xl text-white font-bold tracking-tight drop-shadow-md break-words max-w-full">{title}</h3>
      </div>

      <div className="space-y-6 relative z-10 flex flex-col flex-grow">
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 backdrop-blur-sm group-hover:bg-white/10 group-hover:border-white/10 transition-colors duration-500 relative overflow-hidden flex-1">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-sky-400 to-sky-600" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-sky-500/20 rounded-lg border border-sky-500/30">
              <Microscope className="w-4 h-4 text-sky-400" />
            </div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-300">Khoa học hiện đại</h4>
          </div>
          <ul className="space-y-3 pl-2">
            {modernAdvice.map((advice, i) => (
              <li key={i} className="text-[14px] text-emerald-100/70 flex items-start gap-3 leading-relaxed font-light break-words">
                <span className="text-sky-500 mt-1.5 text-[8px] flex-shrink-0 animate-pulse">●</span>
                <span>{advice}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-amber-500/5 to-emerald-500/5 border border-amber-500/10 rounded-2xl p-5 backdrop-blur-sm group-hover:border-amber-500/20 transition-colors duration-500 relative overflow-hidden flex-1">
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-amber-400 to-emerald-500" />
          <div className="flex items-center gap-3 mb-4 justify-end">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">Y học cổ truyền</h4>
            <div className="p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <Leaf className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <ul className="space-y-3 pr-2">
            {traditionalAdvice.map((advice, i) => (
              <li key={i} className="text-[14px] text-amber-100/90 flex items-start justify-end gap-3 leading-relaxed text-right break-words">
                <span>{advice}</span>
                <span className="text-emerald-500 mt-1.5 text-[10px] flex-shrink-0 animate-pulse">✦</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
