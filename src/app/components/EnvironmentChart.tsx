import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';
import { fetchEnvironmentTrend, EnvironmentTrendPoint } from '../utils/airQuality';

const fallbackChartData: EnvironmentTrendPoint[] = [
  { timestamp: 'fallback-00', time: '00:00', aqi: 40, uv: 0, humidity: 85, pm25: 12 },
  { timestamp: 'fallback-04', time: '04:00', aqi: 42, uv: 0, humidity: 88, pm25: 12.5 },
  { timestamp: 'fallback-08', time: '08:00', aqi: 55, uv: 3, humidity: 75, pm25: 14 },
  { timestamp: 'fallback-12', time: '12:00', aqi: 68, uv: 9, humidity: 60, pm25: 18 },
  { timestamp: 'fallback-16', time: '16:00', aqi: 64, uv: 5, humidity: 66, pm25: 16 },
  { timestamp: 'fallback-20', time: '20:00', aqi: 50, uv: 0, humidity: 78, pm25: 13 },
];

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
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1, type: "spring", bounce: 0.4 }}
      className="relative bg-[#0a2e1f]/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-amber-500/5 pointer-events-none" />
      
      <div className="flex flex-col mb-10 relative z-10">
        <div className="text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] font-black backdrop-blur-md mb-4"
          >
            <TrendingUp className="w-3 h-3" />
            XU HƯỚNG
          </motion.div>
          <h3 className="font-display text-3xl sm:text-4xl md:text-5xl text-white font-bold tracking-tight">
            Nhịp thở của thành phố
          </h3>
          <p className="text-emerald-100/50 text-sm sm:text-base mt-2 font-medium">
            Phân tích đa chiều AQI, UV và Độ ẩm theo thời gian thực
          </p>
        </div>
      </div>

      <div className="relative z-10 w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="uvG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="humG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={15} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={15} tickLine={false} axisLine={false} domain={[0, 160]} />
            <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.4)" fontSize={12} tickMargin={15} tickLine={false} axisLine={false} domain={[0, 12]} />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(5, 26, 17, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
                padding: '20px',
                color: 'white',
                backdropFilter: 'blur(16px)'
              }}
              itemStyle={{ fontSize: '13px', fontWeight: 'bold', padding: '4px 0' }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '12px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.2em' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="aqi" stroke="#fbbf24" strokeWidth={4} fill="url(#aqiG)" name="US AQI" animationDuration={2000} />
            <Area yAxisId="right" type="monotone" dataKey="uv" stroke="#f97316" strokeWidth={4} fill="url(#uvG)" name="Chỉ số UV" animationDuration={2500} />
            <Area yAxisId="left" type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={4} fill="url(#humG)" name="Độ ẩm (%)" animationDuration={3000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="relative z-10 mt-6 text-sm text-emerald-100/70">
        {isLoading ? 'Đang cập nhật dữ liệu mới nhất...' : source === 'live' ? 'Nguồn: Open-Meteo Air Quality + Forecast' : 'Đang hiển thị dữ liệu dự phòng khi API chưa sẵn sàng.'}
      </div>
    </motion.div>
  );
}
