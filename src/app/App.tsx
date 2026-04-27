import { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Menu, X, MapPin, Mail, Phone, Facebook, Instagram, Youtube, Activity, LogOut, User } from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { AuthModal } from './components/AuthModal';
import { ChatWidget } from './widgets/ChatWidget';

// Disable browser's automatic scroll restoration
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const HeritagePage = lazy(() => import('./pages/HeritagePage').then(m => ({ default: m.HeritagePage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

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
    { name: 'Sức khỏe', path: '/#health' },
    { name: 'Di sản', path: '/heritage' },
    { name: 'Liên hệ', path: '#contact' }
  ];

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
                  className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-white">{user.name}</span>
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

      <footer id="contact" className="bg-[#020b07] text-emerald-50/80 pt-16 sm:pt-24 pb-8 sm:pb-12 border-t border-emerald-900/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('/textures/stardust.png')] mix-blend-overlay" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50vw] h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-50" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8 mb-12 sm:mb-16 pb-12 sm:pb-16 border-b border-white/10">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="relative bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <div className="absolute -inset-1 bg-emerald-400/15 rounded-xl blur-md" />
                  <Leaf className="w-7 h-7 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </div>
                <div>
                  <div className="font-display text-2xl font-bold text-white tracking-tight">EcoHeritage</div>
                  <div className="text-[10px] uppercase tracking-[0.3em] font-semibold text-amber-400">Đà Nẵng</div>
                </div>
              </div>
              <p className="text-base leading-relaxed text-emerald-100/60 pr-4">
                Trợ lý sức khỏe xanh kết hợp di sản y học Việt Nam và trí tuệ nhân tạo. Chăm sóc bạn từ những điều nhỏ nhất.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-base uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Khám phá
              </h4>
              <ul className="space-y-3 text-base">
                {navLinks.filter(l => l.path !== '#contact').map((l) => (
                  <li key={l.name}>
                    <Link to={l.path} className="text-emerald-100/60 hover:text-amber-400 hover:translate-x-1 transition-all inline-block">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-base uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Liên hệ
              </h4>
              <ul className="space-y-4 text-base text-emerald-100/60">
                <li className="flex items-start gap-3 hover:text-white transition-colors cursor-pointer">
                  <MapPin className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                  <a href="https://www.google.com/maps/search/?api=1&query=Vietnam+Korea+University+of+Information+and+Communication+Technology" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">
                    BestStudent VKU, Ngũ Hành Sơn, Đà Nẵng
                  </a>
                </li>
                <li className="flex items-start gap-3 hover:text-white transition-colors cursor-pointer">
                  <Mail className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                  <a href="mailto:EcoHeritage@gmail.com" className="hover:text-amber-400 transition-colors">EcoHeritage@gmail.com</a>
                </li>
                <li className="flex items-start gap-3 hover:text-white transition-colors cursor-pointer">
                  <Phone className="w-4 h-4 mt-0.5 text-amber-400 shrink-0" />
                  <a href="tel:+842368880101" className="hover:text-amber-400 transition-colors">+84 236 888 0101</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-base uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Kết nối
              </h4>
              <div className="flex gap-4 mb-8">
                <a href="https://www.facebook.com/vku.udn.vn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-amber-400 hover:border-amber-400 hover:text-[#0a2e1f] hover:-translate-y-1 flex items-center justify-center transition-all duration-300" title="Facebook VKU">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/vku.udn.vn/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-amber-400 hover:border-amber-400 hover:text-[#0a2e1f] hover:-translate-y-1 flex items-center justify-center transition-all duration-300" title="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.youtube.com/@vku.udn.vn" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-amber-400 hover:border-amber-400 hover:text-[#0a2e1f] hover:-translate-y-1 flex items-center justify-center transition-all duration-300" title="Youtube VKU">
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
              <div className="bg-[#051a11] border border-white/5 p-5 rounded-xl relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <p className="text-base md:text-lg italic font-display text-amber-200/90 leading-relaxed relative z-10">
                  "Nam dược trị Nam nhân" <br/>
                  <span className="text-sm text-emerald-400/80 mt-2 block not-italic font-medium">— Tuệ Tĩnh</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-emerald-50/40 gap-4">
            <p className="font-medium">© 2026 EcoHeritage AI · Mọi quyền được bảo lưu</p>
            <div className="flex items-center gap-4">
              <span className="hover:text-white cursor-pointer transition-colors">Điều khoản</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="hover:text-white cursor-pointer transition-colors">Bảo mật</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-emerald-500" /> Cập nhật: {now.toLocaleTimeString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
