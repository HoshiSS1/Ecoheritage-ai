import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { Link } from 'react-router';
import { EnvironmentCard } from '../components/EnvironmentCard';
import { HealthAdviceCard } from '../components/HealthAdviceCard';
import { EnvironmentChart } from '../components/EnvironmentChart';
import { TraditionalRemedyCard } from '../components/TraditionalRemedyCard';
import { Hero } from '../components/Hero';
import { StatsSection } from '../components/StatsSection';
import { HeritageStory } from '../components/HeritageStory';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { environmentData, healthAdvices, traditionalRemedies as defaultRemedies } from '../data';
import { useAirQuality } from '../utils/useAirQuality';
import { Cloud, Sun, Droplets, Wind, TrendingUp } from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';

function RemediesMarquee({ remedies }: { remedies: any[] }) {
  const [isPaused, setIsPaused] = useState(false);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
  };

  const handleMouseLeave = () => {
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2000);
  };

  return (
    <div className="relative w-full overflow-hidden py-10">
      <motion.div
        // Để đơn giản và không bị giật, ta dùng CSS animation-play-state
        style={{
          display: 'flex',
          gap: '2rem',
          width: 'max-content',
          animation: `marquee 60s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="px-4"
      >
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex gap-8 items-stretch">
            {remedies.map((r, idx) => (
              <div key={`${r.name}-${i}-${idx}`} className="w-[280px] sm:w-[350px] shrink-0 h-full">
                <TraditionalRemedyCard {...r} index={idx} />
              </div>
            ))}
          </div>
        ))}
      </motion.div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export function HomePage({ setIsAuthOpen }: { setIsAuthOpen: (v: boolean) => void }) {
  const { data: aqiData } = useAirQuality();

  const [displayRemedies, setDisplayRemedies] = useState(defaultRemedies);

  useEffect(() => {
    const loadRemedies = () => {
      const raw = localStorage.getItem('ecoheritage_admin_remedies');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const activeRemedies = parsed.filter((r: any) => r && r.status === 'published');
            if (activeRemedies.length > 0) {
              setDisplayRemedies(activeRemedies);
              return;
            }
          }
        } catch { /* ignore */ }
      }
      setDisplayRemedies(defaultRemedies);
    };
    loadRemedies();
    window.addEventListener('storage', loadRemedies);
    window.addEventListener('storage_sync', loadRemedies);
    return () => {
      window.removeEventListener('storage', loadRemedies);
      window.removeEventListener('storage_sync', loadRemedies);
    };
  }, []);

  // Cập nhật environmentData với dữ liệu AQI thực tế
  const dynamicEnvironmentData = environmentData.map(item => {
    if (!aqiData) return item;

    if (item.title.includes('AQI')) {
      return {
        ...item,
        value: aqiData.aqi,
        status: aqiData.status as any,
        description: aqiData.description
      };
    }

    if (item.title.includes('UV')) {
      let uvStatus: 'good' | 'moderate' | 'unhealthy' | 'hazardous' = 'good';
      if (aqiData.uvIndex >= 11) uvStatus = 'hazardous';
      else if (aqiData.uvIndex >= 8) uvStatus = 'unhealthy';
      else if (aqiData.uvIndex >= 3) uvStatus = 'moderate';

      return {
        ...item,
        value: aqiData.uvIndex,
        status: uvStatus,
        description: aqiData.uvIndex <= 2
          ? "Chỉ số UV thấp. Vẫn nên bảo vệ da nếu ở ngoài trời lâu."
          : item.description
      };
    }

    if (item.title.includes('Độ ẩm')) {
      let hStatus: 'good' | 'moderate' | 'unhealthy' = 'good';
      if (aqiData.humidity > 80) hStatus = 'unhealthy';
      else if (aqiData.humidity > 70) hStatus = 'moderate';

      return {
        ...item,
        value: `${aqiData.humidity}%`,
        status: hStatus as 'good' | 'moderate' | 'unhealthy' | 'hazardous',
        description: aqiData.humidity > 80 ? "Độ ẩm rất cao (nồm ẩm). Nên bật máy hút ẩm và hạn chế mở cửa." : item.description
      };
    }

    if (item.title.includes('Gió')) {
      const isStrong = aqiData.windSpeed > 10;
      return {
        ...item,
        value: isStrong ? "Mạnh" : "Tốt",
        status: (isStrong ? 'moderate' : 'good') as 'good' | 'moderate' | 'unhealthy' | 'hazardous',
        description: isStrong ? "Gió đang thổi mạnh. Cẩn thận khi di chuyển ngoài trời, đặc biệt khu vực gần biển." : item.description
      };
    }

    return item;
  });

  // Lấy 10 bài thuốc tiêu biểu cho trang chủ
  const featuredRemedies = displayRemedies.slice(0, 10);

  return (
    <>
      <Hero />
      <StatsSection />

      <section id="environment" className="py-14 sm:py-20 md:py-32 relative bg-[#051a11] overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-emerald-600/10 blur-[100px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-amber-600/5 blur-[120px] mix-blend-screen" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col items-center text-center mb-16 sm:mb-24 max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-full text-[12px] uppercase tracking-[0.4em] font-black backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.25)] mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#10b981]" />
              GIÁM SÁT THỜI GIAN THỰC
            </motion.div>

            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] font-bold drop-shadow-xl mb-8 break-words"
              >
                Theo dõi <em className="text-premium-gradient not-italic font-bold">nhịp thở</em> của <br className="hidden sm:block" />
                thành phố hôm nay
              </motion.h2>
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "16rem", opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                className="h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded-full mb-8 mx-auto" 
              />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-emerald-100/70 font-light max-w-2xl mx-auto"
              >
                Nhận cảnh báo môi trường để chủ động bồi bổ cơ thể theo y học cổ truyền.
              </motion.p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 perspective-[1000px]">
            {dynamicEnvironmentData && dynamicEnvironmentData.map((d, i) => (
              d && <EnvironmentCard key={d.title} {...d} index={i} />
            ))}
          </div>

          <EnvironmentChart />
        </div>
      </section>

      <section id="health" className="py-14 sm:py-20 md:py-32 relative bg-gradient-to-b from-[#051a11] to-[#0a2e1f] overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-emerald-400 to-transparent" />
          <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col items-center text-center mb-12 sm:mb-20 max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-6 py-3 rounded-full text-[12px] uppercase tracking-[0.4em] font-black backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.25)] mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_12px_#f59e0b]" />
              LỜI KHUYÊN HÔM NAY
            </motion.div>
            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] font-bold drop-shadow-xl mb-8 break-words"
              >
                Giao thoa y học: <br />
                <em className="text-amber-400 not-italic font-bold">Hiện đại & Cổ truyền.</em>
              </motion.h2>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "16rem", opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                className="h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.4)] rounded-full mb-8 mx-auto"
              />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-emerald-100/70 font-light max-w-2xl mx-auto"
              >
                Kết hợp hài hòa giữa khoa học hiện đại và y lý dân gian.
              </motion.p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 perspective-[1000px]">
            {healthAdvices.map((a, i) => (
              <HealthAdviceCard key={a.title} {...a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <HeritageStory />



      <section id="heritage-featured" className="py-14 sm:py-20 md:py-32 relative bg-[#0a2e1f] overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('/textures/cubes.png')]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="flex flex-col items-center text-center mb-12 sm:mb-20 max-w-4xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-6 py-3 rounded-full text-[12px] uppercase tracking-[0.4em] font-black backdrop-blur-md shadow-[0_0_25px_rgba(16,185,129,0.25)] mb-8"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#10b981]" />
              BỘ SƯU TẬP BÀI THUỐC
            </motion.div>
            <div className="relative">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] font-bold drop-shadow-xl mb-8 break-words"
              >
                Kho tàng <em className="text-amber-400 not-italic font-bold">bài thuốc</em> dân gian.
              </motion.h2>
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: "16rem", opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                className="h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded-full mb-8 mx-auto"
              />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-emerald-100/70 font-light max-w-2xl mx-auto"
              >
                Số hóa tinh hoa y học dân gian để chăm sóc sức khỏe cộng đồng.
              </motion.p>
            </div>
          </div>

          <RemediesMarquee remedies={featuredRemedies} />

          <div className="mt-16 text-center">
            <Link
              to="/heritage"
              className="inline-flex items-center gap-2 relative group overflow-hidden bg-white/5 border border-amber-400/50 text-amber-300 px-8 py-4 rounded-full font-bold text-base backdrop-blur-sm transition-all duration-500 hover:bg-amber-400 hover:text-[#051a11]"
            >
              Khám phá kho tàng di sản
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA */}
      {!sessionStorage.getItem('ecoheritage_active_user') && (
        <section className="py-14 sm:py-20 md:py-32 relative bg-[#051a11] overflow-hidden flex items-center justify-center min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh]">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] bg-gradient-to-tr from-emerald-600/20 to-amber-500/20 blur-[80px] rounded-full animate-pulse mix-blend-screen" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} className="bg-[#0a2e1f]/40 backdrop-blur-2xl border border-white/10 p-8 sm:p-12 md:p-20 rounded-[1.5rem] sm:rounded-[2.5rem] md:rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-400 mb-6 drop-shadow-lg">Sẵn sàng sống xanh?</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-8 text-white drop-shadow-2xl break-words">
                Khởi đầu lối <em className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 not-italic">sống xanh</em> <br />
                cùng <em className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 not-italic">EcoHeritage</em>
              </h2>
              <p className="text-emerald-100/80 max-w-2xl mx-auto mb-10 sm:mb-12 text-base sm:text-lg font-light leading-relaxed">
                Chủ động làm chủ sức khỏe mỗi ngày cùng Trí tuệ nhân tạo và Y học bản địa.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#051a11] px-12 py-5 rounded-full font-bold text-lg shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.7)] transition-all duration-500 hover:-translate-y-1"
                >
                  <span className="relative z-10 flex items-center gap-2">Tham gia EcoHeritage <Activity className="w-5 h-5" /></span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                </button>
                <Link
                  to="/heritage"
                  className="relative group overflow-hidden bg-white/5 border border-white/20 text-white hover:text-amber-300 px-12 py-5 rounded-full font-bold text-lg backdrop-blur-sm transition-all duration-500 hover:-translate-y-1"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </>
  );
}
