import { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Menu, X, MapPin, Mail, Phone, Facebook, Instagram, Youtube, Activity, LogOut, User, ShieldCheck, MessageSquareQuote } from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { AuthModal } from './components/AuthModal';
import { ChatWidget } from './widgets/ChatWidget';
import { createSeedFeedback, createSeedUsers } from './pages/admin/adminData';
import { FEEDBACK_STORAGE_KEY } from './pages/admin/adminUtils';

// Disable browser's automatic scroll restoration
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const HeritagePage = lazy(() => import('./pages/HeritagePage').then(m => ({ default: m.HeritagePage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminPortalPage = lazy(() => import('./pages/AdminPortalPage').then(m => ({ default: m.AdminPortalPage })));

// Component cuộn lên đầu trang chuyên dụng
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  
  useLayoutEffect(() => {
    if (hash) {
      // Handle hash navigation
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    } else {
      // Handle page navigation
      window.scrollTo(0, 0);
      const t = setTimeout(() => window.scrollTo(0, 0), 0);
      return () => clearTimeout(t);
    }
  }, [pathname, hash]);

  return null;
}

export default function App() {
  // ─── ĐẢM BẢO ĐỒNG NHẤT DỮ LIỆU TRÊN MÁY MỚI ───
  useEffect(() => {
    // 1. Khởi tạo Feedback
    if (!localStorage.getItem(FEEDBACK_STORAGE_KEY)) {
      const initialSeeds = createSeedFeedback();
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(initialSeeds));
      console.log("EcoHeritage: Khởi tạo dữ liệu mẫu thành công.");
    }

    // 2. Khởi tạo Users (Khắc phục lỗi mất tài khoản khi sang máy khác)
    if (!localStorage.getItem('ecoheritage_users')) {
      const seedUsers = createSeedUsers();
      localStorage.setItem('ecoheritage_users', JSON.stringify(seedUsers));
      console.log("EcoHeritage: Khởi tạo danh sách người dùng mẫu thành công.");
    }
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [now, setNow] = useState(new Date());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const isAdminRoute = location.pathname.startsWith('/admin-portal');

  useEffect(() => {
    const activeUser = sessionStorage.getItem('ecoheritage_active_user');
    if (activeUser) {
      const parsed = JSON.parse(activeUser);
      setUser(parsed);
      const savedAvatar = localStorage.getItem(`avatar_${parsed.email}`);
      if (savedAvatar) setUserAvatar(savedAvatar);
    }
    const s = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', s);
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => { window.removeEventListener('scroll', s); clearInterval(t); };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUser(null);
    setUserAvatar(null);
    setProfileDropdownOpen(false);
    sessionStorage.removeItem('ecoheritage_active_user');
    navigate('/');
    toast.success('👋 Đã đăng xuất thành công!', {
      description: 'Hẹn gặp lại bạn lần sau. Hãy luôn giữ gìn sức khỏe nhé!',
      duration: 7000,
      style: {
        fontSize: '15px', fontWeight: 'bold', padding: '18px 22px', borderRadius: '18px',
        background: 'linear-gradient(135deg, #0a2e1f 0%, #051a11 100%)',
        color: '#fff', border: '1px solid rgba(251,191,36,0.3)',
      },
    });
  };

  const navLinks = [
    { name: 'Môi trường', path: '/#environment' },
    { name: 'Sức Khỏe', path: '/#health' },
    { name: 'Kho tàng Bài thuốc', path: '/heritage' },
    { name: 'Tư vấn', path: '#contact' }
  ];

  const suspenseFallback = (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
      <p className="text-emerald-400/60 text-sm font-medium animate-pulse tracking-widest uppercase">Äang táº£i dá»¯ liá»‡u...</p>
    </div>
  );

  if (isAdminRoute) {
    return (
      <>
        <ScrollToTop />
        <Suspense fallback={suspenseFallback}>
          <Routes>
            <Route path="/admin-portal" element={<AdminPortalPage />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#051a11] text-emerald-50 selection:bg-amber-400/30 selection:text-white font-body overflow-x-hidden relative">
      <ScrollToTop />
      {/* NAV - Fix background color (tránh chìm) và thêm viền */}
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-500 ${
          scrolled ? 'bg-[#020b07]/90 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] border-b border-emerald-500/10' : 'bg-[#051a11]/60 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-700 p-3 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all duration-500">
              <div className="absolute -inset-1 bg-emerald-400/20 rounded-2xl blur-md animate-pulse" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Leaf className="w-7 h-7 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            </div>
            <div>
              <div className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors duration-300">EcoHeritage</div>
              <div className="text-[10px] uppercase tracking-[0.3em] font-semibold text-amber-400/90 group-hover:text-white transition-colors duration-300">AI · Đà Nẵng</div>
            </div>
          </Link>

          <div className="hidden lg:flex flex-1 items-center justify-center gap-10">
            {navLinks.map((l) => (
              l.path.startsWith('/#') || l.path.startsWith('#') ? (
                <a 
                  key={l.name} 
                  href={l.path}
                  onClick={(e) => {
                    if (location.pathname === '/' && l.path.startsWith('/#')) {
                      e.preventDefault();
                      document.getElementById(l.path.replace('/#', ''))?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-[16px] font-bold tracking-tight hover:text-amber-400 transition-all relative group text-white drop-shadow-sm"
                >
                  {l.name}
                  <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-amber-400 transition-all duration-300 group-hover:w-full" />
                </a>
              ) : (
                <Link 
                  key={l.name} 
                  to={l.path} 
                  className={`text-[16px] font-bold tracking-tight transition-all relative group drop-shadow-sm ${
                    location.pathname === l.path ? 'text-amber-400' : 'text-white hover:text-amber-400'
                  }`}
                >
                  {l.name}
                  <span className={`absolute -bottom-1.5 left-0 h-0.5 bg-amber-400 transition-all duration-300 ${location.pathname === l.path ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              )
            ))}
          </div>
            
          <div className="hidden lg:flex items-center">
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 glass-premium hover:bg-white/10 px-4 py-2 rounded-2xl border-emerald-500/20 transition-all group/user shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center border border-emerald-500/30 group-hover/user:scale-110 transition-transform duration-500 overflow-hidden relative">
                    <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover relative z-10" />
                    ) : (
                      <User className="w-5 h-5 text-emerald-400 relative z-10" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-white tracking-tight">{user.name}</span>
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-56 bg-[#0a2e1f]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-white/5">
                        <p className="text-xs text-white/40 uppercase tracking-wider px-3 mb-1">Tài khoản</p>
                        <p className="text-sm text-white font-medium px-3 truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors font-medium"
                        >
                          <User className="w-4 h-4 text-emerald-400" /> Hồ sơ của tôi
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" /> Đăng xuất
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-[#0a2e1f] px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-amber-400/20 hover:-translate-y-0.5 transition-all"
              >
                Đăng nhập
              </button>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-[#0a2e1f]/95 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((l) => (
                l.path.startsWith('/#') || l.path.startsWith('#') ? (
                  <a
                    key={l.name}
                    href={l.path}
                    onClick={(e) => {
                      setMenuOpen(false);
                      if (location.pathname === '/') {
                        e.preventDefault();
                        const id = l.path.replace('/#', '').replace('#', '');
                        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="text-white/80 hover:text-amber-400 font-medium text-lg py-3 border-b border-white/5 last:border-none transition-colors"
                  >
                    {l.name}
                  </a>
                ) : (
                  <Link
                    key={l.name}
                    to={l.path}
                    onClick={() => setMenuOpen(false)}
                    className="text-white/80 hover:text-amber-400 font-medium text-lg py-3 border-b border-white/5 last:border-none transition-colors"
                  >
                    {l.name}
                  </Link>
                )
              ))}
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="w-full text-center bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold transition-colors">Hồ sơ của tôi</Link>
                  <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-4 rounded-2xl font-bold transition-colors border border-rose-500/20">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </>
              ) : (
                <button onClick={() => { setIsAuthOpen(true); setMenuOpen(false); }} className="w-full bg-amber-400 text-[#0a2e1f] py-4 rounded-2xl font-bold">Đăng nhập ngay</button>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={(u) => {
          setUser(u);
          setUserAvatar(localStorage.getItem(`avatar_${u.email}`));
          sessionStorage.setItem('ecoheritage_active_user', JSON.stringify(u));
          setIsAuthOpen(false);
          toast.success(`🌟 Chào mừng ${u.name}!`, {
            description: 'Đăng nhập thành công. Chúc bạn trải nghiệm EcoHeritage AI thật tuyệt vời!',
            duration: 7000,
            style: {
              fontSize: '15px', fontWeight: 'bold', padding: '18px 22px', borderRadius: '18px',
              background: 'linear-gradient(135deg, #0a2e1f 0%, #051a11 100%)',
              color: '#fff', border: '1px solid rgba(16,185,129,0.3)',
            },
          });
        }} 
      />

      {/* Tích hợp Widget Chat AI */}
      {/* Truyền user vào ChatWidget để lưu lịch sử chat */}
      <ChatWidget user={user} />

      {/* ROUTES */}
      <Suspense fallback={
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
          <p className="text-emerald-400/60 text-sm font-medium animate-pulse tracking-widest uppercase">Đang tải dữ liệu...</p>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage setIsAuthOpen={setIsAuthOpen} />} />
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/profile" element={
            user ? (
              <ProfilePage 
                user={user} 
                onLogout={() => {
                  setUser(null);
                  setUserAvatar(null);
                  sessionStorage.removeItem('ecoheritage_active_user');
                }}
                onAvatarChange={(newAvatar: string) => setUserAvatar(newAvatar)}
              />
            ) : (
              <div className="min-h-screen flex items-center justify-center bg-[#051a11] text-white">
                 Vui lòng <button onClick={() => setIsAuthOpen(true)} className="text-amber-400 mx-2 underline font-bold">đăng nhập</button> để xem hồ sơ.
              </div>
            )
          } />
        </Routes>
      </Suspense>

      <footer id="contact" className="bg-[#020b07] text-emerald-50/80 pt-24 pb-12 border-t border-emerald-500/10 relative overflow-hidden">
        {/* Decorative background elements - enhanced glow */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-20 items-stretch">
            {/* Brand Column */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                <Link to="/" className="flex items-center gap-4 group">
                  <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-700 p-3.5 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-500">
                    <Leaf className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                  </div>
                  <div>
                    <div className="font-display text-3xl font-bold text-white tracking-tight">EcoHeritage</div>
                    <div className="text-[10px] uppercase tracking-[0.4em] font-bold text-amber-400 mt-1">AI · Đà Nẵng</div>
                  </div>
                </Link>
                <p className="text-emerald-100/60 leading-relaxed text-lg font-medium max-w-[320px]">
                  Tiên phong kết hợp trí tuệ nhân tạo với di sản y học dân tộc để mang lại giải pháp chăm sóc sức khỏe xanh bền vững.
                </p>
              </div>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, href: "https://facebook.com/vku.udn.vn" },
                  { icon: Instagram, href: "https://instagram.com/vku.udn.vn" },
                  { icon: Youtube, href: "https://youtube.com/@vku.udn.vn" }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-center hover:!bg-emerald-500 hover:!text-[#051a11] hover:border-emerald-400 hover:-translate-y-1.5 transition-all duration-500 shadow-lg group/social"
                  >
                    <social.icon className="w-5 h-5 transition-transform group-hover/social:scale-110" />
                  </a>
                ))}
              </div>
            </div>

            {/* Discovery Links Column */}
            <div className="lg:col-span-2">
              <h4 className="text-white font-bold mb-8 text-sm uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span className="text-premium-gradient">Khám phá</span>
              </h4>
              <ul className="space-y-4">
                {navLinks.filter(l => l.path !== '#contact').map((l) => (
                  <li key={l.name}>
                    <Link to={l.path} className="text-emerald-100/70 hover:text-emerald-400 font-bold transition-all flex items-center gap-3 group/link text-base">
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
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
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
                    <a href={item.href} className="text-emerald-100/80 hover:text-white font-semibold transition-colors text-[15px] leading-relaxed break-all">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quote Column */}
            <div className="lg:col-span-3">
              <div className="glass-premium rounded-[2rem] p-7 relative overflow-hidden group h-full flex flex-col justify-center border-white/5 hover:border-emerald-500/20 transition-all duration-700 shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5 opacity-40">
                    <MessageSquareQuote className="w-6 h-6 text-emerald-400" />
                    <div className="h-[1px] w-10 bg-emerald-500/30" />
                  </div>
                  
                  <p className="text-xl italic font-display text-white leading-tight mb-6 drop-shadow-md">
                    "Nam dược trị <br/>
                    <span className="text-2xl not-italic font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-200">Nam nhân</span>"
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-emerald-400/80 uppercase tracking-[0.4em] font-black">Tuệ Tĩnh</span>
                    <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform duration-500">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-white/30">
            <p>© 2026 EcoHeritage AI · Mọi quyền được bảo lưu</p>
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4">
              <span className="hover:text-emerald-400 cursor-pointer transition-colors">Điều khoản</span>
              <span className="hover:text-emerald-400 cursor-pointer transition-colors">Bảo mật</span>
              <span className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 text-[10px]">
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
    </div>
  );
}
