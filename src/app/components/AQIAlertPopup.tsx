import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X } from 'lucide-react';
import { useAirQuality } from '../utils/useAirQuality';

export function AQIAlertPopup() {
  const { data } = useAirQuality();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!data || data.aqi < 101) return;
    if (sessionStorage.getItem('aqi_alert_dismissed')) return;

    const timer = window.setTimeout(() => setIsVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, [data]);

  if (!isVisible || !data || data.aqi < 101) return null;

  const progress = Math.min(Math.max((data.aqi / 200) * 100, 8), 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-24 right-4 sm:right-6 z-[60] w-[calc(100vw-2rem)] sm:w-[340px]"
      >
        <div className="bg-[#0a2e1f]/95 backdrop-blur-xl border border-red-500/20 rounded-xl p-3.5 shadow-[0_15px_40px_rgba(239,68,68,0.15)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0 animate-pulse">
              <ShieldAlert className="w-5.5 h-5.5 text-red-400" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <h4 className="text-red-400 font-bold text-xs uppercase tracking-wider">Cảnh báo không khí</h4>
                <button 
                  type="button"
                  onClick={() => {
                    setIsVisible(false);
                    sessionStorage.setItem('aqi_alert_dismissed', 'true');
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                  aria-label="Đóng cảnh báo AQI"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-white/80 text-[11px] leading-relaxed">
                US AQI hiện tại là <span className="text-red-400 font-bold">{data.aqi}</span> ({data.statusLabel}).
                PM2.5: <span className="text-red-400 font-bold">{data.pm25} µg/m³</span>. Khuyến nghị hạn chế vận động mạnh ngoài trời.
              </p>
              
              <div className="mt-2.5 flex items-center gap-2">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-red-500"
                  />
                </div>
                <span className="text-[9px] text-white/40 font-medium">{data.aqi}/200</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
