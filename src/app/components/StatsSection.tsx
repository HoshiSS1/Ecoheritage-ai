import { motion } from 'motion/react';
import { Wind, Heart, Users, Sprout } from 'lucide-react';

import { useAirQuality } from '../utils/useAirQuality';

export function StatsSection() {
  const { data: aqiData } = useAirQuality();
  
  const stats = [
    { icon: Wind, value: aqiData ? String(aqiData.aqi) : '75', label: 'Chỉ số chất lượng khí (AQI)', color: 'text-sky-400' },
    { icon: Heart, value: '25+', label: 'Bài thuốc di sản được số hóa', color: 'text-rose-400' },
    { icon: Sprout, value: '50+', label: 'Cơ sở dữ liệu thảo mộc bản địa', color: 'text-emerald-400' },
    { icon: Users, value: '98.5%', label: 'Phân tích triệu chứng bằng AI', color: 'text-amber-400' },
  ];

  return (
    <section className="bg-gradient-to-b from-[#020b07] to-[#051a11] py-14 sm:py-20 md:py-32 relative overflow-hidden border-y border-white/5">
      {/* 3D Grid Floor */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-emerald-500/20 to-transparent" style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px', transform: 'perspective(500px) rotateX(60deg)', transformOrigin: 'bottom' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 md:mb-16 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.4em] font-bold mb-6 sm:mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#10b981]" />
            Trạm cứu hộ sức khỏe xanh
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-[1.1] font-bold drop-shadow-xl mb-6 break-words max-w-full">
            Di sản y học ngàn đời là <em className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 not-italic">"tấm khiên"</em> <br className="hidden md:block" /> bảo vệ <em className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 not-italic">tương lai</em>.
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 perspective-[1000px]">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 40, rotateX: 15 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.8, type: "spring", bounce: 0.4 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-[#0a2e1f]/60 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] p-5 sm:p-6 lg:p-8 border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] transition-all duration-500 relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br from-current to-transparent opacity-10 blur-2xl group-hover:opacity-30 transition-opacity duration-700 ${s.color}`} />
              
              <s.icon className={`w-8 h-8 sm:w-10 sm:h-10 mb-4 sm:mb-6 drop-shadow-[0_0_15px_currentColor] transition-transform duration-500 group-hover:scale-110 ${s.color}`} />
              <div className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg tracking-tighter truncate">{s.value}</div>
              <div className="text-[9px] sm:text-[11px] md:text-[13px] text-emerald-100/70 leading-relaxed font-light group-hover:text-emerald-50 transition-colors uppercase tracking-widest break-words">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
