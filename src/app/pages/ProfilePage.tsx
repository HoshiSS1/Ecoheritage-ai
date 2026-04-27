import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Heart, Leaf, Activity, Camera, Lock, Check, Key, Shield, Star, Calendar, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { hashPassword } from '../utils/crypto';

interface ProfilePageProps {
  user: { name: string; email: string };
  onLogout: () => void;
  onAvatarChange?: (newAvatar: string) => void;
}

export function ProfilePage({ user, onLogout, onAvatarChange }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem(`avatar_${user.email}`);
    if (savedAvatar) setAvatarPreview(savedAvatar);
  }, [user.email]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Ảnh tối đa 2MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAvatarPreview(base64);
      localStorage.setItem(`avatar_${user.email}`, base64);
      onAvatarChange?.(base64);
      toast.success('✨ Cập nhật ảnh đại diện thành công!', {
        description: 'Hình ảnh mới của bạn đã được lưu lại. Trông tuyệt vời lắm!',
        duration: 7000,
        style: { fontSize: '15px', fontWeight: 'bold', padding: '18px 22px', borderRadius: '18px', background: 'linear-gradient(135deg, #0a2e1f 0%, #051a11 100%)', color: '#fff', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 20px 60px -15px rgba(16,185,129,0.35)' },
      });
    };
    reader.readAsDataURL(file);
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
      toast.success('🔒 Đổi mật khẩu thành công!', {
        description: 'Tài khoản của bạn đã được bảo vệ với mật khẩu mới. Hãy ghi nhớ kỹ nhé!',
        duration: 7000,
        style: { fontSize: '15px', fontWeight: 'bold', padding: '18px 22px', borderRadius: '18px', background: 'linear-gradient(135deg, #0a2e1f 0%, #051a11 100%)', color: '#fff', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 20px 60px -15px rgba(16,185,129,0.35)' },
      });
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch { toast.error('Lỗi hệ thống'); }
  };

  const joinDate = new Date();
  joinDate.setDate(joinDate.getDate() - 12); // Mock data

  return (
    <div className="min-h-screen bg-[#051a11] pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/textures/cubes.png')]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-emerald-600/10 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Header Cá nhân */}
        <div className="bg-gradient-to-br from-[#0a1913] to-[#051a11] border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-400 p-1 shadow-2xl group-hover:shadow-emerald-500/40 transition-shadow duration-500">
              <div className="w-full h-full rounded-[22px] bg-[#0a1913] flex items-center justify-center overflow-hidden relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-amber-300 to-emerald-300">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
                {/* Overlay Hover */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-3">
              <Leaf className="w-4 h-4" /> Thành viên Xanh
            </div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">{user.name}</h1>
            <p className="text-emerald-300/70 text-lg mb-6">{user.email}</p>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Cấu trúc Tabs & Content */}
        <div className="bg-[#0a1913] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="flex bg-[#071510] border-b border-white/10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-5 text-sm md:text-base font-bold tracking-wide text-center transition-all relative ${
                activeTab === 'profile' ? 'text-emerald-300' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Tổng quan Hồ sơ
              {activeTab === 'profile' && (
                <motion.div layoutId="profileTabLarge" className="absolute bottom-0 left-[20%] right-[20%] h-1 bg-emerald-400 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`flex-1 py-5 text-sm md:text-base font-bold tracking-wide text-center transition-all relative ${
                activeTab === 'security' ? 'text-emerald-300' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Bảo mật & Mật khẩu
              {activeTab === 'security' && (
                <motion.div layoutId="profileTabLarge" className="absolute bottom-0 left-[20%] right-[20%] h-1 bg-emerald-400 rounded-t-full" />
              )}
            </button>
          </div>

          <div className="p-6 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { icon: Activity, value: '12', label: 'Ngày đồng hành', color: 'emerald' },
                      { icon: Heart, value: '5', label: 'Bài thuốc đã lưu', color: 'amber' },
                      { icon: Star, value: 'Hạng Bạc', label: 'Thành tích', color: 'emerald' },
                    ].map((s) => (
                      <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors">
                        <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${s.color === 'emerald' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                          <s.icon className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-display font-bold text-white">{s.value}</div>
                        <div className="text-xs text-white/50 uppercase tracking-widest mt-2">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400" /> Huy hiệu đạt được
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {['Người mới', '7 ngày liên tiếp', 'Yêu trà thảo mộc'].map((badge) => (
                          <span key={badge} className="text-sm bg-white/5 border border-white/10 text-white/80 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { icon: Calendar, label: 'Ngày tham gia', value: joinDate.toLocaleDateString('vi-VN') },
                        { icon: Shield, label: 'Trạng thái', value: 'Đã xác minh an toàn' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/10 transition-colors">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/40 uppercase tracking-wider">{item.label}</p>
                            <p className="text-base text-white font-medium truncate">{item.value}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-xl mx-auto"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                      <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl">
                        <Key className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">Đổi mật khẩu</h4>
                        <p className="text-sm text-white/40 mt-1">Đảm bảo tài khoản của bạn luôn được bảo vệ an toàn nhất.</p>
                      </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-5">
                      {[
                        { label: 'Mật khẩu hiện tại', value: oldPassword, setter: setOldPassword, icon: Lock, placeholder: 'Nhập mật khẩu hiện tại', key: 'old' },
                        { label: 'Mật khẩu mới', value: newPassword, setter: setNewPassword, icon: Lock, placeholder: 'Tạo mật khẩu mới (ít nhất 4 ký tự)', key: 'new' },
                        { label: 'Xác nhận mật khẩu', value: confirmPassword, setter: setConfirmPassword, icon: Check, placeholder: 'Nhập lại mật khẩu mới', key: 'confirm' },
                      ].map((field) => (
                        <div key={field.label}>
                          <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">{field.label}</label>
                          <div className="relative">
                            <field.icon className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                            <input
                              type={showPasswords[field.key] ? 'text' : 'password'}
                              value={field.value}
                              onChange={e => field.setter(e.target.value)}
                              className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-base text-white placeholder-white/20 focus:border-emerald-400/50 focus:outline-none transition-colors"
                              placeholder={field.placeholder}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPasswords(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                            >
                              {showPasswords[field.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-400 text-[#0a1913] rounded-xl text-base font-bold hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          Cập nhật mật khẩu
                        </button>
                      </div>
                    </form>
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
