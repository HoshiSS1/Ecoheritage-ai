import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogOut, Heart, Leaf, Activity, Camera, Lock, Check, Key, Shield, 
  Star, Calendar, ChevronRight, Eye, EyeOff, User, Bell, 
  Settings, Award, Zap, Cloud, Sun, Droplets, MapPin, Search,
  Mail, Layout, BookOpen, MessageSquareQuote, Phone
} from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { hashPassword } from '../utils/crypto';
import { useAirQuality } from '../utils/useAirQuality';
import { traditionalRemedies } from '../data';
import { getAvatarUrl } from '../utils/avatarUtils';
import { TraditionalRemedyCard } from '../components/TraditionalRemedyCard';

interface ProfilePageProps {
  user: { name: string; email: string };
  onLogout: () => void;
  onAvatarChange?: (newAvatar: string) => void;
}

export function ProfilePage({ user, onLogout, onAvatarChange }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'activity' | 'settings'>('overview');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [savedRemediesCount, setSavedRemediesCount] = useState(0);
  const [savedLocationsCount, setSavedLocationsCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [savedRemediesList, setSavedRemediesList] = useState<any[]>([]);
  
  const [address, setAddress] = useState('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { data: aqiData } = useAirQuality();

  useEffect(() => {
    const doScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    doScroll();
    const t1 = setTimeout(doScroll, 50);
    const t2 = setTimeout(doScroll, 250);
    const t3 = setTimeout(doScroll, 500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const savedAvatar = localStorage.getItem(`avatar_${user.email}`);
    if (savedAvatar) setAvatarPreview(savedAvatar);
    
    const savedCover = localStorage.getItem(`cover_${user.email}`);
    if (savedCover) setCoverPreview(savedCover);

    const savedPhone = localStorage.getItem(`phone_${user.email}`);
    if (savedPhone) setPhone(savedPhone);

    const savedAddress = localStorage.getItem(`address_${user.email}`);
    if (savedAddress) setAddress(savedAddress);

    // Calculate real stats
    const updateStats = () => {
      try {
        const remediesRaw = localStorage.getItem('ecoheritage_saved_remedies');
        const savedNames = (remediesRaw && remediesRaw !== 'undefined') ? JSON.parse(remediesRaw) : [];
        if (Array.isArray(savedNames)) {
          setSavedRemediesCount(savedNames.length);
          // Map names to full objects
          const fullObjects = savedNames.map(name => 
            traditionalRemedies.find(tr => tr.name === name)
          ).filter(Boolean);
          setSavedRemediesList(fullObjects);
        }
        
        const locationsRaw = localStorage.getItem('ecoheritage_saved_locations');
        const locations = (locationsRaw && locationsRaw !== 'undefined') ? JSON.parse(locationsRaw) : [];
        if (Array.isArray(locations)) setSavedLocationsCount(locations.length);
        
        const reviewsRaw = localStorage.getItem('ecoheritage_reviews');
        const reviews = (reviewsRaw && reviewsRaw !== 'undefined') ? JSON.parse(reviewsRaw) : [];
        if (Array.isArray(reviews)) {
          const userReviews = reviews.filter((r: any) => r && r.author === user.name);
          setReviewsCount(userReviews.length);
        }
      } catch (e) {
        console.error("Stats update error:", e);
      }
    };
    updateStats();

    const handleStorage = () => {
      const av = localStorage.getItem(`avatar_${user.email}`);
      if (av && av !== avatarPreview) setAvatarPreview(av);
      updateStats();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('storage_sync', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('storage_sync', handleStorage);
    };
  }, [user.email, user.name, avatarPreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Ảnh tối đa 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'avatar') {
        setAvatarPreview(base64);
        localStorage.setItem(`avatar_${user.email}`, base64);
        onAvatarChange?.(base64);
        window.dispatchEvent(new Event('storage_sync'));
        toast.success('✨ Cập nhật ảnh đại diện thành công!');
      } else {
        setCoverPreview(base64);
        localStorage.setItem(`cover_${user.email}`, base64);
        toast.success('🖼️ Cập nhật ảnh bìa thành công!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCover = () => {
    setCoverPreview(null);
    localStorage.removeItem(`cover_${user.email}`);
    toast.success('Đã xóa ảnh bìa');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(`phone_${user.email}`, phone);
    localStorage.setItem(`address_${user.email}`, address);
    toast.success('✅ Cập nhật thông tin thành công!');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) { toast.error('Vui lòng điền đủ thông tin'); return; }
    if (newPassword.length < 4) { toast.error('Mật khẩu mới phải ít nhất 4 ký tự'); return; }
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu xác nhận không khớp'); return; }
    try {
      const usersRaw = localStorage.getItem('ecoheritage_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const idx = users.findIndex((u: any) => u.email === user.email);
      if (idx === -1) { toast.error('Không tìm thấy tài khoản'); return; }
      
      const hashedOldPassword = await hashPassword(oldPassword);
      if (users[idx].password !== hashedOldPassword) { toast.error('Mật khẩu hiện tại không đúng'); return; }
      
      const hashedNewPassword = await hashPassword(newPassword);
      users[idx].password = hashedNewPassword;
      localStorage.setItem('ecoheritage_users', JSON.stringify(users));
      toast.success('🔒 Đổi mật khẩu thành công!');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch { toast.error('Lỗi hệ thống'); }
  };

  const stats = [
    { label: 'Ngày đồng hành', value: '1', icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: 'Mới' },
    { label: 'Bài thuốc đã lưu', value: savedRemediesCount.toString(), icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10', trend: 'Hoạt động' },
    { label: 'Góp ý hệ thống', value: reviewsCount.toString(), icon: MessageSquareQuote, color: 'text-amber-400', bg: 'bg-amber-400/10', trend: 'Đã gửi' },
    { label: 'Địa điểm quan tâm', value: savedLocationsCount.toString(), icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: 'Đã đánh dấu' },
  ];

  const recentActivity = [
    { id: 1, type: 'search', title: 'Tìm kiếm "Trà Tâm Sen"', time: '2 giờ trước', icon: Search, color: 'text-blue-400' },
    { id: 2, type: 'save', title: 'Lưu bài thuốc "Nha Đam Đường Phèn"', time: '5 giờ trước', icon: Heart, color: 'text-rose-400' },
    { id: 3, type: 'location', title: 'Xem bản đồ Vùng nguyên liệu Cẩm Lệ', time: 'Hôm qua', icon: MapPin, color: 'text-emerald-400' },
    { id: 4, type: 'feedback', title: 'Gửi góp ý về tính năng AI tư vấn', time: '2 ngày trước', icon: MessageSquareQuote, color: 'text-amber-400' },
  ];
  return (
    <div className="min-h-screen bg-[#020b07] text-white pt-24 pb-20 relative overflow-hidden font-body">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[60vw] h-[60vh] bg-emerald-600/10 blur-[150px] opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-[50vw] h-[50vh] bg-amber-600/5 blur-[150px] opacity-20" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-50" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-20"
        >
          <div className="h-[28rem] sm:h-[32rem] rounded-[3.5rem] overflow-hidden relative border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group/banner">
            {coverPreview ? (
               <img src={coverPreview} alt="Cover" className="absolute inset-0 w-full h-[65%] object-cover z-0" />
            ) : (
               <>
                 <div className="absolute inset-0 h-[65%] bg-gradient-to-r from-[#0a2e1f] via-[#051a11] to-[#020b07] z-0" />
                 <div className="absolute inset-0 h-[65%] bg-[url('https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay scale-110 z-0" />
                 <div className="absolute top-10 right-20 w-48 h-48 rounded-full bg-emerald-500/20 blur-3xl animate-pulse z-0" />
                 <div className="absolute -bottom-10 left-40 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl z-0" />
               </>
            )}
            <div className="absolute inset-0 h-[65%] bg-gradient-to-t from-[#020b07] via-[#051a11]/20 to-transparent opacity-60 z-10 pointer-events-none" />
            
            {/* User Info Glass Container */}
            <div className="absolute bottom-4 sm:bottom-12 left-4 right-4 sm:right-auto sm:left-12 z-20 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-10 bg-black/60 backdrop-blur-3xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:max-w-[600px]">
               <div className="relative group/avatar cursor-pointer shrink-0">
                  <div className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                  <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-white/10 overflow-hidden relative shadow-2xl">
                     {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                           <User className="w-10 h-10 sm:w-12 sm:h-12 text-white/50" />
                        </div>
                     )}
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm" onClick={() => avatarInputRef.current?.click()}>
                        <Camera className="w-6 h-6 text-white" />
                     </div>
                  </div>
                  <input type="file" ref={avatarInputRef} onChange={(e) => handleImageUpload(e, 'avatar')} accept="image/*" className="hidden" />
               </div>

               <div className="text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-3 sm:mb-2">
                     <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md">{user.name}</h2>
                     <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] px-3 py-1 rounded-full uppercase tracking-widest font-black shadow-inner">
                        {user.email === 'admin@ecoheritage.com' ? 'Super Admin' : 'Thành viên'}
                     </span>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-widest">
                     <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user.email}</div>
                     <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {address || 'Đà Nẵng, Việt Nam'}</div>
                  </div>
               </div>
            </div>

            <div className="absolute top-6 right-6 flex items-center gap-3 opacity-0 group-hover/banner:opacity-100 transition-all z-20">
              {coverPreview && (
                <button 
                   onClick={handleRemoveCover}
                   className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/40 backdrop-blur-md border border-rose-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
                >
                   Xóa ảnh
                </button>
              )}
              <button 
                 onClick={() => coverInputRef.current?.click()}
                 className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
              >
                 <Camera className="w-3.5 h-3.5" /> Đổi ảnh bìa
              </button>
            </div>
            <input type="file" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'cover')} accept="image/*" className="hidden" />
          </div>

          <div className="absolute bottom-6 right-10 sm:right-20 hidden lg:flex gap-4">
             {/* Banner buttons reserved for future use */}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-4 backdrop-blur-2xl shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-blue-500" />
              <div className="flex flex-col gap-2">
                {[
                  { id: 'overview', label: 'Tổng quan', icon: Layout },
                  { id: 'security', label: 'Bảo mật', icon: Lock },
                  { id: 'activity', label: 'Hoạt động', icon: Heart },
                  { id: 'settings', label: 'Cài đặt', icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-emerald-500 text-[#051a11] shadow-lg shadow-emerald-500/20 translate-x-2' 
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-[#051a11]' : 'text-emerald-500/50'}`} />
                    {tab.label}
                  </button>
                ))}
                </div>
             </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
             <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6 sm:space-y-8"
                  >
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                      {stats.map((s, i) => (
                        <div key={s.label} className="relative bg-[#0a1913]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl hover:scale-[1.05] transition-all duration-500 group overflow-hidden">
                           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-amber-500/0 to-emerald-500/0 group-hover:from-emerald-500/10 group-hover:via-amber-500/10 group-hover:to-emerald-500/10 transition-colors duration-1000 z-0 pointer-events-none" />
                           <div className={`relative z-10 w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}>
                              <s.icon className="w-6 h-6" />
                           </div>
                           <div className="relative z-10 text-3xl font-black tracking-tighter text-white mb-1 drop-shadow-md">{s.value}</div>
                           <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Environment Insight Card (Modern Bento) */}
                    <div className="bg-gradient-to-br from-[#0a2e1f] to-[#051a11] border border-emerald-500/20 rounded-[3rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
                       
                       <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                          <div className="flex-1">
                             <div className="inline-flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                                <Activity className="w-4 h-4 animate-pulse" /> Trí tuệ Sức khỏe AI
                             </div>
                             <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-6">Chào {user.name.split(' ')[0]}, hôm nay <br /> không khí khá <span className="text-emerald-400">tuyệt vời</span>.</h3>
                             <p className="text-emerald-100/40 text-sm font-medium leading-relaxed max-w-md mb-8">
                                Chỉ số AQI hiện tại là {aqiData?.aqi || '—'}. Một chén trà <strong>Chè Dây</strong> vào buổi sáng sẽ giúp hệ tiêu hóa của bạn khỏe mạnh hơn trong tiết trời này.
                             </p>
                             <div className="flex gap-4">
                                <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                                   <Droplets className="w-5 h-5 text-blue-400" />
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Độ ẩm</p>
                                      <p className="text-sm font-bold text-white">{aqiData?.humidity || '—'}%</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 px-5 py-3 rounded-2xl border border-white/10">
                                   <Sun className="w-5 h-5 text-amber-400" />
                                   <div>
                                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Chỉ số UV</p>
                                      <p className="text-sm font-bold text-white">{aqiData?.uvIndex !== undefined ? aqiData.uvIndex : '0'}</p>
                                   </div>
                                </div>
                             </div>
                          </div>
                          <div className="w-full md:w-64 h-64 bg-white/5 rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center p-8 relative shadow-inner">
                             <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full" />
                             <div className="text-5xl font-black tracking-tighter text-white mb-2 relative z-10">{aqiData?.aqi || '—'}</div>
                             <div className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 relative z-10">AQI Hiện tại</div>
                             <div className="mt-8 w-full h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min((aqiData?.aqi || 0), 100)}%` }}
                                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-400" 
                                />
                             </div>
                             <div className="mt-4 w-full h-10 opacity-70 flex items-end justify-between px-2 relative z-10" title="Biến thiên AQI trong ngày">
                               <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible drop-shadow-md" preserveAspectRatio="none">
                                  <polyline points="0,20 20,15 40,25 60,10 80,18 100,5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" />
                                  <polyline points="0,20 20,15 40,25 60,10 80,18 100,5 100,30 0,30" fill="currentColor" className="text-emerald-500/20" />
                               </svg>
                             </div>
                             <p className="mt-3 text-[10px] font-bold text-white/50 uppercase tracking-widest text-center relative z-10">Chất lượng không khí tốt</p>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-[#0a1913]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
                          <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                             <User className="w-4 h-4 text-emerald-400" /> Thông tin liên hệ
                          </h4>
                          <div className="space-y-4">
                             <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Điện thoại</span>
                                <span className="text-sm font-bold text-white">{phone || 'Chưa cập nhật'}</span>
                             </div>
                             <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Địa chỉ</span>
                                <span className="text-sm font-bold text-white">{address || 'Chưa cập nhật'}</span>
                             </div>
                          </div>
                       </div>
                       <div className="bg-[#0a1913]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex items-center justify-between group cursor-default">
                          <div>
                             <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-2">Ghi chú hệ thống</h4>
                             <p className="text-xl font-black text-white">Tài khoản <span className="text-emerald-400">Đã xác minh</span></p>
                             <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Cập nhật lần cuối: 2 giờ trước</p>
                          </div>
                          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                             <Shield className="w-8 h-8" />
                          </div>
                       </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#0a1913]/60 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl max-w-2xl mx-auto"
                  >
                    <div className="flex items-center gap-5 mb-12 pb-8 border-b border-white/5">
                      <div className="w-16 h-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center text-blue-400 border border-blue-500/20">
                         <Key className="w-8 h-8" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-white tracking-tight">Bảo mật Tài khoản</h3>
                         <p className="text-white/40 text-sm font-medium">Bảo vệ danh tính và dữ liệu của bạn an toàn tuyệt đối.</p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-8">
                       {[
                         { label: 'Mật khẩu hiện tại', value: oldPassword, setter: setOldPassword, key: 'old', icon: Lock },
                         { label: 'Mật khẩu mới', value: newPassword, setter: setNewPassword, key: 'new', icon: Key },
                         { label: 'Xác nhận mật khẩu mới', value: confirmPassword, setter: setConfirmPassword, key: 'confirm', icon: Shield },
                       ].map((field) => (
                         <div key={field.key} className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">{field.label}</label>
                            <div className="relative group">
                               <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors">
                                  <field.icon className="w-5 h-5" />
                               </div>
                               <input
                                 type={showPasswords[field.key] ? 'text' : 'password'}
                                 value={field.value}
                                 onChange={e => field.setter(e.target.value)}
                                 className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-14 text-sm font-black text-white outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                                 placeholder={`••••••••`}
                               />
                               <button
                                 type="button"
                                 onClick={() => setShowPasswords(p => ({ ...p, [field.key]: !p[field.key] }))}
                                 className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                               >
                                 {showPasswords[field.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                               </button>
                            </div>
                         </div>
                       ))}

                       <button type="submit" className="w-full py-6 bg-[#007BFF] hover:bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] mt-4">
                          Cập nhật thông tin bảo mật
                       </button>
                    </form>
                  </motion.div>
                )}

                {activeTab === 'activity' && (
                  <motion.div
                    key="activity"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#0a1913]/60 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center justify-center min-h-[500px]"
                  >
                     {savedRemediesList.length > 0 ? (
                        <div className="w-full h-full">
                           <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
                              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                 <BookOpen className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-xl font-black text-white">Bộ sưu tập Dược liệu</h3>
                                 <p className="text-white/40 text-xs font-bold mt-1">Đã lưu {savedRemediesList.length} bài thuốc di sản</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 perspective-[1500px]">
                              {savedRemediesList.map((r: any, idx: number) => (
                                 <TraditionalRemedyCard key={r.id} {...r} index={idx} />
                              ))}
                           </div>
                        </div>
                     ) : (
                        <div className="text-center flex flex-col items-center">
                           <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-emerald-400 mb-8 border border-emerald-500/20">
                              <BookOpen className="w-12 h-12" />
                           </div>
                           <h3 className="text-2xl font-black text-white mb-3">Bộ sưu tập Dược liệu số</h3>
                           <p className="text-white/30 text-sm font-medium max-w-sm mb-10 leading-relaxed">Bạn chưa lưu bài thuốc di sản nào. Hãy bắt đầu khám phá kho tàng dược liệu để xây dựng tủ thuốc của riêng mình.</p>
                           <Link to="/heritage" className="px-10 py-5 bg-emerald-500 text-[#051a11] rounded-full font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 hover:scale-105 transition-transform active:scale-95">Khám phá Di sản</Link>
                        </div>
                     )}
                  </motion.div>
                )}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#0a1913]/60 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 sm:p-12 shadow-2xl max-w-2xl mx-auto"
                  >
                    <div className="flex items-center gap-5 mb-12 pb-8 border-b border-white/5">
                      <div className="w-16 h-16 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center text-amber-400 border border-amber-500/20">
                         <Settings className="w-8 h-8" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-white tracking-tight">Cài đặt Tài khoản</h3>
                         <p className="text-white/40 text-sm font-medium">Cập nhật thông tin cá nhân để hoàn thiện hồ sơ di sản.</p>
                      </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Họ và tên</label>
                          <div className="relative group">
                             <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                                <User className="w-5 h-5" />
                             </div>
                             <input
                               type="text"
                               defaultValue={user.name}
                               readOnly
                               className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold text-white/40 outline-none cursor-not-allowed"
                             />
                          </div>
                       </div>

                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Địa chỉ Email</label>
                          <div className="relative group">
                             <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20">
                                <Mail className="w-5 h-5" />
                             </div>
                             <input
                               type="email"
                               defaultValue={user.email}
                               readOnly
                               className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold text-white/40 outline-none cursor-not-allowed"
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Số điện thoại</label>
                             <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors">
                                   <Phone className="w-5 h-5" />
                                </div>
                                <input
                                  type="tel"
                                  value={phone}
                                  onChange={e => setPhone(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-sm font-black text-white outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                                  placeholder="09xx xxx xxx"
                                />
                             </div>
                          </div>

                          <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">Tỉnh / Thành phố</label>
                             <div className="relative group">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald-400 transition-colors">
                                   <MapPin className="w-5 h-5" />
                                </div>
                                <input
                                  type="text"
                                  value={address}
                                  onChange={e => setAddress(e.target.value)}
                                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-sm font-black text-white outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all placeholder:text-white/10"
                                  placeholder="Đà Nẵng"
                                />
                             </div>
                          </div>
                       </div>

                       <button type="submit" className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-[#051a11] rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-emerald-500/20 transition-all active:scale-[0.98] mt-4">
                          Lưu cấu hình tài khoản
                       </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400 mb-4 ml-2">Vùng nguy hiểm</h4>
                       <button onClick={onLogout} className="w-full py-5 bg-transparent hover:bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3">
                         <LogOut className="w-4 h-4" /> Đăng xuất thiết bị
                       </button>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
