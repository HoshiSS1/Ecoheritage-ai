import { useState, useEffect, useLayoutEffect, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, Menu, X, MapPin, Mail, Phone, Facebook, Instagram, Youtube, 
  Activity, LogOut, User, ShieldCheck, MessageSquareQuote, Heart, 
  BookOpen, Map as MapIcon, ArrowUp, ArrowRight, ChevronDown 
} from 'lucide-react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { AuthModal } from './components/AuthModal';
import { ChatWidget } from './widgets/ChatWidget';
import { AQIAlertPopup } from './components/AQIAlertPopup';
import { ScrollProgress } from './components/ScrollProgress';
import { getAvatarUrl } from './utils/avatarUtils';
import { createSeedFeedback, createSeedUsers } from './pages/admin/adminData';
import { FEEDBACK_STORAGE_KEY } from './pages/admin/adminUtils';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Disable browser's automatic scroll restoration
if (typeof window !== 'undefined') {
  window.history.scrollRestoration = 'manual';
}

const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const HeritagePage = lazy(() => import('./pages/HeritagePage').then(m => ({ default: m.HeritagePage })));
const HeritageMapPage = lazy(() => import('./pages/HeritageMapPage').then(m => ({ default: m.HeritageMapPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AdminPortalPage = lazy(() => import('./pages/AdminPortalPage'));



function BackToTop({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 18, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Lên đầu trang"
          className="fixed bottom-24 right-4 z-[85] inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-300/30 bg-[#0a2e1f]/90 text-emerald-100 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-amber-300/60 hover:bg-amber-400 hover:text-[#051a11] sm:bottom-8 sm:right-8"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  // ─── SMOOTH SCROLL (Lenis) ───
  useSmoothScroll();

  // ─── ĐẢM BẢO ĐỒNG NHẤT DỮ LIỆU TRÊN MỌI THIẾT BỊ ───
  useEffect(() => {
    import('./pages/admin/adminUtils').then(({ DATA_VERSION, VERSION_CHECK_KEY }) => {
      const storedVersion = localStorage.getItem(VERSION_CHECK_KEY);
      
      // Nếu phiên bản dữ liệu cũ hoặc chưa có, thực hiện Migration/Reset
      if (storedVersion !== DATA_VERSION) {
        console.log(`EcoHeritage: Đang nâng cấp dữ liệu từ ${storedVersion || 'v0'} lên ${DATA_VERSION}...`);
        
        // 1. Khởi tạo/Cập nhật Feedback (Đảm bảo seed mới nhất)
        const initialSeeds = createSeedFeedback();
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(initialSeeds));

        // 2. Khởi tạo Users
        const seedUsers = createSeedUsers();
        localStorage.setItem('ecoheritage_users', JSON.stringify(seedUsers));

        // 3. Cập nhật version để không lặp lại logic này
        localStorage.setItem(VERSION_CHECK_KEY, DATA_VERSION);
        
        // Dispatch để các component khác (Bản đồ, Bài thuốc) biết để load lại từ Source mới
        window.dispatchEvent(new Event("storage_sync"));
        
        toast.info("💎 Hệ thống đã đồng bộ dữ liệu mới nhất!", {
          description: "Các chỉ số môi trường và bản đồ di sản đã được cập nhật chính xác.",
          duration: 5000
        });
      }
    });
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [now, setNow] = useState(new Date());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin-portal');

  useEffect(() => {
    try {
      const activeUser = sessionStorage.getItem('ecoheritage_active_user');
      if (activeUser) {
        const parsed = JSON.parse(activeUser);
        setUser(parsed);
        const savedAvatar = localStorage.getItem(`avatar_${parsed.email}`);
        if (savedAvatar) setUserAvatar(savedAvatar);
      }
    } catch (e) {
      console.warn("Active user parse error:", e);
    }
    const s = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', s);
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => { window.removeEventListener('scroll', s); clearInterval(t); };
  }, []);

  // Hooks moved to Navbar

  const handleLogout = () => {
    setUser(null);
    setUserAvatar(null);
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

  // navLinks moved to navigation.ts

  const suspenseFallback = (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
      <p className="text-emerald-400/60 text-sm font-medium animate-pulse tracking-widest uppercase">Đang tải dữ liệu...</p>
    </div>
  );

  if (isAdminRoute) {
    return (
      <>
        <Suspense fallback={suspenseFallback}>
          <Routes>
            <Route path="/admin-portal/*" element={<AdminPortalPage />} />
          </Routes>
        </Suspense>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#051a11] text-emerald-50 selection:bg-amber-400/30 selection:text-white font-body overflow-x-hidden relative">
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      <Navbar 
        scrolled={scrolled} 
        user={user} 
        userAvatar={userAvatar} 
        onLogout={handleLogout} 
        onOpenAuth={() => setIsAuthOpen(true)} 
      />

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
      <AQIAlertPopup />
      <BackToTop visible={scrolled} />

      {/* ROUTES */}
      <Suspense fallback={suspenseFallback}>
        <Routes>
          <Route path="/" element={<HomePage setIsAuthOpen={setIsAuthOpen} />} />
          <Route path="/heritage" element={<HeritagePage />} />
          <Route path="/heritage/map" element={<HeritageMapPage />} />
          <Route path="/profile" element={
            user ? (
              <ProfilePage 
                user={user} 
                onLogout={handleLogout} 
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

      <Footer user={user} now={now} />
    </div>
  );
}
