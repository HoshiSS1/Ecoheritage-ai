import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const chapters = [
  {
    year: 'Thế kỷ 15',
    title: 'Hải Thượng Lãn Ông',
    text: 'Danh y đặt nền móng cho y học cổ truyền Việt Nam, ghi chép hàng ngàn bài thuốc từ thảo mộc bản địa miền Trung.',
  },
  {
    year: 'Đời sống Đà Nẵng',
    title: 'Vườn thuốc nam trong sân nhà',
    text: 'Mỗi gia đình Quảng - Đà đều có lá lốt, tía tô, sả, lá sen — kho tàng y học xanh giữa lòng phố biển.',
  },
  {
    year: '2026',
    title: 'EcoHeritage AI ra đời',
    text: 'Chúng tôi số hóa di sản ấy và kết hợp AI với dữ liệu môi trường thời gian thực để bảo vệ thế hệ hôm nay.',
  },
];

export function HeritageStory() {
  return (
    <section className="relative py-32 bg-[#051a11] overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-emerald-700/10 blur-[150px] mix-blend-screen" />
        <div className="absolute bottom-[10%] right-[5%] w-[30vw] h-[30vw] rounded-full bg-amber-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/textures/black-scales.png')] opacity-10 mix-blend-overlay" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center perspective-[1500px]">
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: -15 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
            className="relative transform-style-3d group"
          >
            {/* Glowing Backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500 via-amber-400 to-emerald-500 rounded-[3.5rem] blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-1000 animate-pulse" />
            
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border-[3px] border-white/10 group-hover:border-white/30 transition-colors duration-700 z-10">
              <ImageWithFallback
                src="/images/heritage_story.jpg"
                alt="Vietnamese herbs"
                className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[2s] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#051a11] via-[#051a11]/40 to-transparent opacity-80" />
            </div>

            {/* 3D Floating Quote Box */}
            <motion.div
              initial={{ opacity: 0, y: 30, translateZ: 50 }}
              whileInView={{ opacity: 1, y: 0, translateZ: 100 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8, type: "spring" }}
              className="absolute -bottom-10 -right-4 lg:-right-12 bg-gradient-to-br from-[#0a2e1f]/90 to-[#051a11]/90 backdrop-blur-2xl text-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-w-sm border border-white/10 z-30 group-hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl" />
              <div className="absolute -top-6 -left-6 bg-[#0a2e1f] border border-amber-400/30 w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-amber-300 font-display text-4xl">"</div>
              <div className="font-display italic text-xl sm:text-2xl leading-[1.4] drop-shadow-lg relative z-10 break-words max-w-full">
                Nam dược trị Nam nhân — thuốc của đất Việt chữa người Việt.
              </div>
              <div className="text-[10px] mt-6 text-amber-300/80 uppercase tracking-[0.4em] font-bold flex items-center gap-2 relative z-10">
                <span className="w-6 h-[1px] bg-amber-300/50" /> Tuệ Tĩnh
              </div>
            </motion.div>
          </motion.div>

          <div className="relative z-20 mt-16 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-emerald-200 px-5 py-2.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-bold mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                </span>
                Hành trình di sản
              </div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-[1.1] mb-6 drop-shadow-xl break-words max-w-full">
                Từ <em className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 not-italic font-bold">lá lốt sau hè</em> <br/>đến <em className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 not-italic font-bold">thuật toán AI</em>.
              </h2>
              <p className="text-lg text-emerald-100/70 leading-relaxed font-light drop-shadow-sm">
                Mỗi bài thuốc là một mảnh ghép lịch sử của vùng đất Quảng - Đà. Chúng tôi không chỉ lưu giữ, mà còn "số hóa" chúng thành những giải pháp cá nhân hóa, đồng bộ với nhịp thở của tự nhiên hiện tại.
              </p>
            </motion.div>

            <div className="space-y-10 relative">
              {/* Glowing Timeline Line */}
              <div className="absolute left-[11px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-amber-500 via-emerald-500 to-transparent opacity-30" />
              
              {chapters.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.2, duration: 0.8, type: "spring", bounce: 0.3 }}
                  className="flex gap-8 relative group cursor-default"
                >
                  <div className="relative z-10 mt-1">
                    <div className="w-6 h-6 rounded-full bg-[#051a11] border-[3px] border-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.5)] group-hover:scale-125 transition-transform duration-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 p-6 rounded-3xl backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 shadow-lg group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex-1">
                    <div className="inline-block bg-[#051a11] border border-amber-400/30 text-[10px] font-bold uppercase tracking-widest text-amber-400 px-3 py-1 rounded-full mb-3 shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                      {c.year}
                    </div>
                    <div className="font-display text-xl sm:text-2xl text-white font-bold mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-amber-200 transition-colors break-words max-w-full">{c.title}</div>
                    <p className="text-[15px] text-emerald-100/60 leading-relaxed font-light">{c.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
