import { motion } from 'motion/react';
import { Sparkles, Leaf, ArrowRight, Play } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import heroImage from '../../assets/hero/vietnamese_herbs_ai_hero_1777022882110.png';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#051a11] text-white min-h-[90vh] flex items-center pt-20 md:pt-28">
      {/* Immersive 3D Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1f] via-[#051a11] to-[#020b07] opacity-90" />
        <div className="absolute inset-0 mix-blend-overlay opacity-30 bg-[url('/textures/stardust.png')]" />
        
        {/* Dynamic Orbs */}
        <motion.div
          className="absolute top-[10%] -left-[10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-emerald-500/20 blur-[150px] mix-blend-screen"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[0%] -right-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full bg-amber-500/10 blur-[150px] mix-blend-screen"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.5, 0.2], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full z-10">
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-emerald-200 px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.3em] font-bold mb-8 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 shadow-[0_0_10px_#fbbf24]"></span>
            </span>
            Di sản Đà Nẵng x AI
          </motion.div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.08] mb-6 sm:mb-8 tracking-tight drop-shadow-2xl break-words max-w-full overflow-hidden">
            <span className="block text-white">Hơi thở ngàn năm</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 italic mt-2 filter drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              trong lá xanh hôm nay.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-emerald-100/80 mb-8 sm:mb-10 max-w-xl leading-relaxed font-light">
            <strong className="font-semibold tracking-wide text-white">EcoHeritage AI</strong> — nơi dữ liệu môi trường thời gian thực hòa quyện cùng trí tuệ y học cổ truyền, dẫn lối bạn sống khỏe giữa một hành tinh đang đổi thay.
          </p>

          {/* SOLUTION STATEMENT - HIGHLY PROMINENT */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
            className="relative mt-12 mb-12 group perspective-[1000px]"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-60 transition-opacity duration-1000 animate-pulse" />
            <div className="relative border border-white/10 bg-[#0a2e1f]/50 p-6 md:p-8 rounded-3xl backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transform transition-transform duration-700 group-hover:scale-[1.02] group-hover:-translate-y-2 group-hover:rotate-x-2">
              <div className="absolute -top-5 -left-5 bg-gradient-to-br from-emerald-400 to-emerald-600 border-[3px] border-[#051a11] p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-300 mb-4 font-bold ml-6 drop-shadow-md">
                Tuyên ngôn sứ mệnh
              </p>
              <h3 className="font-display text-lg sm:text-xl md:text-2xl italic text-white leading-[1.4] drop-shadow-xl pl-6 relative break-words max-w-full">
                <span className="absolute -left-2 -top-4 text-5xl text-amber-500/30">"</span>
                Kết nối tinh hoa y học cổ truyền và AI hiện đại, giúp bạn sống khỏe mạnh thuận theo từng hơi thở của tự nhiên.
                <span className="absolute -bottom-4 -right-0 text-5xl text-amber-500/30">"</span>
              </h3>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-5 mt-8 sm:mt-10">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('environment')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative group overflow-hidden bg-gradient-to-r from-amber-400 to-amber-300 text-[#051a11] px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] transition-all duration-500"
            >
              <span className="relative z-10 flex items-center gap-2 text-base sm:text-lg">Khám phá ngay <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.dispatchEvent(new Event('openChatWidget'))}
              className="inline-flex items-center justify-center gap-3 bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/40 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 text-base sm:text-lg font-medium"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Play className="w-3 h-3 text-white ml-0.5" />
              </div>
              Trò chuyện AI
            </motion.button>
          </div>

          {/* 3D Floating Mini Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 sm:mt-16 pt-6 sm:pt-8 relative">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            {[
              { num: '100+', label: 'Bài thuốc', sub: 'Dữ liệu gốc' },
              { num: '24/7', label: 'Giám sát', sub: 'Thời gian thực' },
              { num: '98.5%', label: 'Cá nhân hóa', sub: 'Thuật toán AI' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                className="relative group"
              >
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl text-white mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{s.num}</div>
                <div className="text-[10px] sm:text-[11px] text-amber-300 uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold mb-0.5">{s.label}</div>
                <div className="text-[9px] sm:text-[10px] text-emerald-200/60 uppercase tracking-widest">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: Immersive 3D Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1.5, delay: 0.4, type: "spring", bounce: 0.4 }}
          className="relative hidden lg:block perspective-[1500px]"
        >
          {/* Main 3D Container */}
          <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-white/10 transform-style-3d group">
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-amber-500/20 mix-blend-overlay z-10 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            
            <ImageWithFallback
              src={heroImage}
              alt="Vietnamese herbs with AI data overlays"
              className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[2s] ease-out"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-[#051a11] via-[#051a11]/40 to-transparent z-20" />
          </div>

          {/* 3D Floating Glass Card: Live AQI */}
          <motion.div
            initial={{ opacity: 0, x: 50, y: 50, translateZ: 50 }}
            animate={{ opacity: 1, x: 0, y: 0, translateZ: 100 }}
            transition={{ delay: 1.2, duration: 1, type: "spring" }}
            className="absolute -left-2 lg:-left-12 top-20 bg-[#0a2e1f]/70 backdrop-blur-2xl border border-white/10 text-white rounded-[2rem] p-5 lg:p-6 shadow-[0_30px_60px_rgba(0,0,0,0.6)] w-56 lg:w-72 z-30 hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500/30 rounded-full blur-xl" />
            <div className="flex items-center gap-3 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 font-bold">Đà Nẵng · Trực tiếp</span>
            </div>
            <div className="flex items-end justify-between mb-2">
              <div className="min-w-0">
                <div className="font-display text-4xl sm:text-5xl font-bold tracking-tighter drop-shadow-xl text-white truncate">75</div>
                <div className="text-[10px] sm:text-xs text-amber-300/90 font-medium uppercase tracking-widest mt-1">AQI — Trung bình</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 rounded-2xl shadow-lg">
                <Leaf className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 text-[12px] lg:text-[13px] text-emerald-100/70 italic font-light leading-relaxed">
              "Độ ẩm tốt. Hôm nay thích hợp uống trà lá sen thanh nhiệt."
            </div>
          </motion.div>

          {/* 3D Floating Glass Card: Remedy */}
          <motion.div
            initial={{ opacity: 0, x: -50, y: -50, translateZ: 80 }}
            animate={{ opacity: 1, x: 0, y: 0, translateZ: 120 }}
            transition={{ delay: 1.5, duration: 1, type: "spring" }}
            className="absolute -right-2 lg:-right-8 bottom-24 bg-gradient-to-br from-amber-400/90 to-amber-600/90 backdrop-blur-xl border border-white/20 text-[#051a11] rounded-[2rem] p-5 lg:p-6 shadow-[0_30px_60px_rgba(0,0,0,0.6)] w-52 lg:w-64 z-40 hover:-translate-y-2 transition-transform duration-500"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-[url('/textures/rice-paper.png')] opacity-30 mix-blend-overlay rounded-[2rem]" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-inner border border-white/30 backdrop-blur-sm relative overflow-hidden">
                <Leaf className="w-6 h-6 text-[#051a11]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent" />
              </div>
              <div className="font-display text-lg sm:text-xl leading-tight font-bold mb-1 drop-shadow-sm">Gợi ý dược liệu</div>
              <div className="text-[13px] font-medium text-[#051a11]/80 leading-relaxed mt-2">Siro lá lốt mật ong — giải pháp vàng cho hô hấp ngày bụi.</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modern Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20 cursor-pointer"
      >
        <span className="text-[9px] uppercase tracking-[0.5em] text-white/50 font-bold">Khám phá</span>
        <div className="w-px h-16 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
      </motion.div>
    </section>
  );
}
