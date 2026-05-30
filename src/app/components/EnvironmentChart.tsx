import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Sparkles, Cloud, Sun, Droplets } from 'lucide-react';
import { fetchEnvironmentTrend, EnvironmentTrendPoint } from '../utils/airQuality';
import { SectionHeader } from './SectionHeader';

const fallbackChartData: EnvironmentTrendPoint[] = [
  { timestamp: 'fallback-00', time: '00:00', aqi: 40, uv: 0, humidity: 85, pm25: 12 },
  { timestamp: 'fallback-04', time: '04:00', aqi: 42, uv: 0, humidity: 88, pm25: 12.5 },
  { timestamp: 'fallback-08', time: '08:00', aqi: 55, uv: 3, humidity: 75, pm25: 14 },
  { timestamp: 'fallback-12', time: '12:00', aqi: 68, uv: 9, humidity: 60, pm25: 18 },
  { timestamp: 'fallback-16', time: '16:00', aqi: 64, uv: 5, humidity: 66, pm25: 16 },
  { timestamp: 'fallback-20', time: '20:00', aqi: 50, uv: 0, humidity: 78, pm25: 13 },
];

// Hàm phân tích động số liệu để trả về câu lời khuyên chuẩn xác, đồng bộ 100% với biểu đồ (Giải quyết phản hồi hình 2)
const getTooltipAdvice = (payload: any[]) => {
  let aqi = 0;
  let uv = 0;
  let hum = 0;
  
  payload.forEach(entry => {
    if (entry.dataKey === 'aqi' || entry.name.includes('AQI')) aqi = Number(entry.value);
    else if (entry.dataKey === 'uv' || entry.name.includes('UV')) uv = Number(entry.value);
    else if (entry.dataKey === 'humidity' || entry.name.includes('Độ ẩm')) hum = Number(entry.value);
  });

  if (aqi > 100) return '⚠️ Khí ô nhiễm, khuyên dùng Siro Lá Lốt bổ phổi';
  if (aqi > 50) return '🍃 Bụi mịn tăng nhẹ, khuyên dùng Trà Lá Sen giải độc';
  if (uv >= 8) return '☀️ UV rất cao, khuyên dùng Nha Đam giải nhiệt da';
  if (uv >= 3) return '🕶️ UV trung bình, chú ý che chắn khi ra ngoài';
  if (hum > 80) return '💧 Nồm ẩm rất cao, đề phòng phong hàn cảm lạnh';
  if (hum < 50) return '🍂 Thời tiết hanh khô, khuyên uống Trà Hoa Cúc';
  return '✨ Thời tiết lý tưởng, tỳ vị âm dương cân bằng';
};

// Component Tooltip Glassmorphic tùy chỉnh siêu sang trọng và đầy sức sống
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const advice = getTooltipAdvice(payload);

    return (
      <div className="bg-[#041a10]/95 backdrop-blur-2xl border border-amber-500/25 p-5 rounded-[24px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)] min-w-[245px] relative overflow-hidden">
        {/* Quầng sáng nền nhỏ trong Tooltip */}
        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />
        
        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-3 border-b border-white/5 pb-2">
          ⏰ Thời gian: {label}
        </p>
        
        <div className="space-y-3">
          {payload.map((entry: any, i: number) => {
            let icon = <Sparkles className="w-4 h-4 text-amber-300" />;
            let unit = '';

            if (entry.name.includes('AQI') || entry.dataKey === 'aqi') {
              icon = <Cloud className="w-4 h-4 text-amber-300" />;
              unit = ' AQI';
            } else if (entry.name.includes('UV') || entry.dataKey === 'uv') {
              icon = <Sun className="w-4 h-4 text-orange-400" />;
              unit = ' UV';
            } else if (entry.name.includes('Độ ẩm') || entry.dataKey === 'humidity') {
              icon = <Droplets className="w-4 h-4 text-emerald-400" />;
              unit = '%';
            }

            return (
              <div key={i} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className="text-xs font-bold text-white/70">{entry.name}:</span>
                </div>
                <span className="text-sm font-black" style={{ color: entry.stroke || entry.color }}>
                  {entry.value}{unit}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Lời khuyên động khớp 100% với số liệu trên biểu đồ (Đã sửa đổi) */}
        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-amber-300 font-bold italic flex items-center gap-1.5 leading-relaxed">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
          <span>{advice}</span>
        </div>
      </div>
    );
  }
  return null;
};

export function EnvironmentChart() {
  const [chartData, setChartData] = useState<EnvironmentTrendPoint[]>(fallbackChartData);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<'live' | 'fallback'>('fallback');

  useEffect(() => {
    const controller = new AbortController();

    async function loadTrend() {
      setIsLoading(true);
      try {
        const points = await fetchEnvironmentTrend(controller.signal);
        if (points.length > 0) {
          setChartData(points);
          setSource('live');
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('Environment trend fetch error:', err);
          setSource('fallback');
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadTrend();
    return () => controller.abort();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98, rotateX: 6 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, type: "spring", bounce: 0.4 }}
      className="relative bg-[var(--eco-surface)]/40 backdrop-blur-2xl rounded-[var(--radius-3xl)] p-8 md:p-12 shadow-[var(--shadow-xl)] border border-[var(--border-default)] overflow-hidden"
      style={{ transformPerspective: 1000 }}
    >
      {/* Quầng sáng Aurora Glow di chuyển sau biểu đồ tạo sức sống */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none aurora-glow" />
      
      <div className="relative z-10 mb-10">
        <SectionHeader
          icon={TrendingUp}
          badge="Xu hướng"
          title={<>Nhịp thở của <em className="text-premium-gradient not-italic">thành phố</em></>}
          subtitle="Phân tích đa chiều AQI, UV và Độ ẩm theo thời gian thực"
          align="left"
          className="!mb-0"
        />
      </div>

      <div className="relative z-10 w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uvG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>

              {/* Bộ lọc Neon Glow SVG giúp đường biểu đồ phát sáng tràn đầy sức sống */}
              <filter id="aqiShadow" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#fbbf24" floodOpacity="0.45"/>
              </filter>
              <filter id="uvShadow" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#f97316" floodOpacity="0.45"/>
              </filter>
              <filter id="humShadow" height="200%">
                <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#10b981" floodOpacity="0.45"/>
              </filter>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={15} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={15} tickLine={false} axisLine={false} domain={[0, 160]} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={15} tickLine={false} axisLine={false} domain={[0, 12]} />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Áp dụng SVG Neon Glow filter trực tiếp lên từng Area */}
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="aqi" 
              stroke="#fbbf24" 
              strokeWidth={4.5} 
              fill="url(#aqiG)" 
              name="Chỉ số AQI" 
              filter="url(#aqiShadow)"
              dot={{ r: 0 }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#ffffff' }}
              animationDuration={2000} 
            />
            <Area 
              yAxisId="right" 
              type="monotone" 
              dataKey="uv" 
              stroke="#f97316" 
              strokeWidth={4.5} 
              fill="url(#uvG)" 
              name="Chỉ số UV" 
              filter="url(#uvShadow)"
              dot={{ r: 0 }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#ffffff' }}
              animationDuration={2500} 
            />
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="humidity" 
              stroke="#10b981" 
              strokeWidth={4.5} 
              fill="url(#humG)" 
              name="Độ ẩm không khí" 
              filter="url(#humShadow)"
              dot={{ r: 0 }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#ffffff' }}
              animationDuration={3000} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-between border-t border-white/5 pt-6 gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-amber-400 animate-pulse' : source === 'live' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            {isLoading ? 'Đang đồng bộ dữ liệu...' : source === 'live' ? 'Hệ thống trực tuyến' : 'Chế độ ngoại tuyến'}
          </span>
        </div>
        <div className="text-[13px] font-medium text-white/20 italic tracking-wide">
          {source === 'live' ? 'Dữ liệu được phân tích từ Open-Meteo Air Quality' : 'Hiển thị dữ liệu mẫu khi API không phản hồi'}
        </div>
      </div>
    </motion.div>
  );
}
