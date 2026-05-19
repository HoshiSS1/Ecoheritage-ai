import { Link } from 'react-router';
import { Leaf, MapPin, Mail, Phone, Facebook, Instagram, Youtube, MessageSquareQuote, ShieldCheck, Activity } from 'lucide-react';
import { navLinks } from './navigation';

interface FooterProps {
  user: { name: string; email: string } | null;
  now: Date;
}

export function Footer({ user, now }: FooterProps) {
  return (
    <footer id="contact" className="bg-[var(--eco-dark)] text-emerald-50/80 pt-16 sm:pt-24 pb-20 sm:pb-12 border-t border-[var(--border-subtle)] relative overflow-hidden">
      {/* Decorative background elements - enhanced glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-20 items-stretch">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <Link to="/" aria-label="Về trang chủ" title="Về trang chủ" className="flex items-center gap-4 group">
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-700 p-3.5 rounded-2xl shadow-[var(--shadow-glow-emerald)] group-hover:scale-110 transition-transform duration-500">
                  <Leaf className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                </div>
                <div>
                  <div className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">EcoHeritage</div>
                  <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-400 mt-1">AI · Đà Nẵng</div>
                </div>
              </Link>
              <p className="text-[var(--text-secondary)] leading-relaxed text-sm sm:text-lg font-medium max-w-[320px]">
                Tiên phong kết hợp trí tuệ nhân tạo với di sản y học dân tộc để mang lại giải pháp chăm sóc sức khỏe xanh bền vững.
              </p>
            </div>
            <div className="flex gap-4">
              {[
                { icon: Facebook, href: "https://facebook.com/vku.udn.vn", label: 'Facebook' },
                { icon: Instagram, href: "https://instagram.com/vku.udn.vn", label: 'Instagram' },
                { icon: Youtube, href: "https://youtube.com/@vku.udn.vn", label: 'YouTube' }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  aria-label={social.label}
                  className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-center hover:!bg-emerald-500 hover:!text-[var(--eco-dark)] hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-500 shadow-lg group/social"
                >
                  <social.icon className="w-5 h-5 transition-transform group-hover/social:scale-110" />
                </a>
              ))}
            </div>
          </div>

          {/* Discovery Links Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[var(--shadow-glow-emerald)]" />
              <span className="text-premium-gradient">Khám phá</span>
            </h4>
            <ul className="space-y-4">
              {navLinks.filter(l => l.path !== '#contact').map((l) => (
                <li key={l.name}>
                  <Link to={l.path} className="text-[var(--text-secondary)] hover:text-emerald-400 font-bold transition-all flex items-center gap-3 group/link text-base">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/20 group-hover/link:bg-emerald-500 group-hover/link:scale-125 transition-all" />
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Consultant Column */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[var(--shadow-glow-amber)]" />
              <span className="text-premium-gradient">Tư vấn</span>
            </h4>
            <ul className="space-y-5">
              {[
                { icon: MapPin, text: "BestStudent VKU, Đà Nẵng", href: "#" },
                { icon: Mail, text: "EcoHeritage@gmail.com", href: "mailto:EcoHeritage@gmail.com" },
                { icon: Phone, text: "+84 236 888 0101", href: "tel:+842368880101" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 group/contact">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover/contact:scale-110 transition-transform shrink-0 shadow-[0_0_10px_rgba(251,191,36,0.1)] group-hover/contact:bg-amber-500/20">
                    <item.icon className="w-5 h-5 text-amber-400 group-hover/contact:text-amber-300 transition-colors" />
                  </div>
                  <a href={item.href} className="text-[var(--text-secondary)] hover:text-white font-semibold transition-colors text-[15px] leading-relaxed break-all">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quote Column */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--glass-bg)] backdrop-blur-2xl rounded-[2rem] p-7 relative overflow-hidden group h-full flex flex-col justify-center border border-[var(--border-default)] hover:border-[var(--border-hover)] transition-all duration-700 shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-5 opacity-40">
                  <MessageSquareQuote className="w-6 h-6 text-emerald-400" />
                  <div className="h-[1px] w-10 bg-emerald-500/30" />
                </div>
                
                <p className="text-2xl sm:text-3xl font-black text-white leading-[1.1] mb-6 tracking-tighter">
                  "NAM DƯỢC TRỊ <br/>
                  <span className="text-3xl sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-200">NAM NHÂN</span>"
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-emerald-400/80 uppercase tracking-[0.4em] font-black">Tuệ Tĩnh</span>
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-[var(--border-default)] group-hover:rotate-12 transition-transform duration-500">
                    <Leaf className="w-3.5 h-3.5 text-emerald-500/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-[var(--border-subtle)] flex flex-col lg:flex-row justify-between items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-disabled)]">
          <p>© 2026 EcoHeritage AI · Mọi quyền được bảo lưu</p>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
            {user && (
              <Link to="/profile" className="hover:text-emerald-400 cursor-pointer transition-colors">Hồ sơ cá nhân</Link>
            )}
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Điều khoản</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Bảo mật</span>
            <span className="flex items-center gap-2 bg-[var(--glass-bg)] px-2.5 py-1 rounded-full border border-[var(--border-subtle)] text-[10px]">
              <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
              {now.toLocaleTimeString('vi-VN')}
            </span>
            <Link to="/admin-portal" className="flex items-center gap-2 hover:text-amber-400 transition-colors group/admin">
              <ShieldCheck className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
              Cổng Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
