import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

const mockData = [
  { time: '6h', aqi: 45, uv: 2, humidity: 75 },
  { time: '9h', aqi: 52, uv: 4, humidity: 72 },
  { time: '12h', aqi: 68, uv: 8, humidity: 65 },
  { time: '15h', aqi: 75, uv: 7, humidity: 60 },
  { time: '18h', aqi: 62, uv: 3, humidity: 68 },
  { time: '21h', aqi: 48, uv: 0, humidity: 72 },
];

export function EnvironmentChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, type: "spring", bounce: 0.4 }}
      className="relative bg-[#0a2e1f]/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
      <div className="absolute -top-[50%] -right-[20%] w-[100%] h-[100%] bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl pointer-events-none mix-blend-screen" />
      
      <div className="flex items-start justify-between mb-10 flex-wrap gap-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold mb-4 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <TrendingUp className="w-3.5 h-3.5" /> Xu hướng
          </div>
          <h3 className="font-display text-xl sm:text-3xl md:text-5xl text-white font-bold tracking-tight drop-shadow-lg break-words max-w-full">Nhịp thở của thành phố</h3>
          <p className="text-emerald-100/60 mt-2 sm:mt-3 font-light text-sm sm:text-lg break-words max-w-full">Phân tích đa chiều các chỉ số môi trường theo từng khung giờ</p>
        </div>
        <div className="flex gap-4 md:gap-6 bg-[#051a11]/60 px-6 py-3.5 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner">
          {[
            { c: '#fbbf24', l: 'AQI' },
            { c: '#f97316', l: 'UV' },
            { c: '#10b981', l: 'Độ ẩm' },
          ].map((x) => (
            <div key={x.l} className="flex items-center gap-2 group cursor-pointer">
              <span className="w-3.5 h-3.5 rounded-full shadow-[0_0_10px_currentColor] transition-transform duration-300 group-hover:scale-150" style={{ background: x.c, color: x.c }} />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 group-hover:text-white transition-colors">{x.l}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uvG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={15} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={15} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(5, 26, 17, 0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                padding: '16px',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}
              itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
            <Area type="monotone" dataKey="aqi" stroke="#fbbf24" strokeWidth={3} fill="url(#aqiG)" name="AQI" filter="url(#glow)" />
            <Area type="monotone" dataKey="uv" stroke="#f97316" strokeWidth={3} fill="url(#uvG)" name="UV" filter="url(#glow)" />
            <Area type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={3} fill="url(#humG)" name="Độ ẩm (%)" filter="url(#glow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
