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
import { environmentData, healthAdvices, traditionalRemedies } from '../data';
import { useAirQuality } from '../utils/useAirQuality';
import { Cloud, Sun, Droplets, Wind } from 'lucide-react';

export function HomePage({ setIsAuthOpen }: { setIsAuthOpen: (v: boolean) => void }) {
  const { data: aqiData } = useAirQuality();

  // Cập nhật environmentData với dữ liệu AQI thực tế
  const dynamicEnvironmentData = environmentData.map(item => {
    if (!aqiData) return item;

    if (item.title.includes('AQI')) {
      const scaledScore = aqiData.aqi * 20;
      return {
        ...item,
        value: scaledScore,
        status: aqiData.status as any,
        description: aqiData.description
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

  // Chỉ lấy 3 bài thuốc tiêu biểu cho trang chủ
  const featuredRemedies = traditionalRemedies.slice(0, 3);

  return (
    <>
      <Hero />
      <StatsSection />

      <section id="environment" className="py-14 sm:py-20 md:py-32 relative bg-[#051a11] overflow-hidden scroll-mt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-emerald-600/10 blur-[100px] mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-amber-600/5 blur-[120px] mix-blend-screen" style={{ animation: "pulse 8s infinite alternate" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <div className="text-center mb-12 sm:mb-20 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 font-bold">Giám sát thời gian thực</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-6 break-words"
            >
              Theo dõi <em className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300 not-italic font-bold">nhịp thở</em> của <br />
              thành phố hôm nay
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-emerald-100/70 font-light"
            >
              Nhận cảnh báo môi trường để chủ động bồi bổ cơ thể theo y học cổ truyền.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16 perspective-[1000px]">
            {dynamicEnvironmentData.map((d, i) => (
              <EnvironmentCard key={d.title} {...d} index={i} />
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
          <div className="text-center mb-12 sm:mb-20 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-amber-200 font-bold">Lời khuyên hôm nay</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-6 break-words"
            >
              Giao thoa y học: <br />
              <em className="text-amber-400 font-bold not-italic">Hiện đại & Cổ truyền</em>.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-emerald-100/70 font-light"
            >
              Kết hợp hài hòa giữa khoa học hiện đại và y lý dân gian.
            </motion.p>
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
          <div className="text-center mb-12 sm:mb-20 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-6 backdrop-blur-md"
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 font-bold">Bộ sưu tập bài thuốc</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-6 break-words"
            >
              Bản đồ <em className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 not-italic font-bold">thảo mộc</em> bản địa.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-emerald-100/70 font-light"
            >
              Số hóa tinh hoa y học dân gian để chăm sóc sức khỏe cộng đồng.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 perspective-[1200px]">
            {featuredRemedies.map((r, i) => (
              <TraditionalRemedyCard key={r.name} {...r} index={i} />
            ))}
          </div>
          
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
    </>
  );
}
