import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

import { hashPassword } from '../utils/crypto';
import { ADMIN_SESSION_KEY } from '../pages/admin/adminUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string, email: string }) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [error, setError] = useState('');

  // Tính toán độ mạnh mật khẩu (1-4: Yếu, 5-6: Trung bình, 7+: Mạnh)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', barClass: 'bg-transparent', textClass: 'text-transparent' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    if (score >= 3) return { score: 3, label: 'Mạnh', barClass: 'bg-emerald-400', textClass: 'text-emerald-400' };
    if (score >= 2) return { score: 2, label: 'Trung bình', barClass: 'bg-amber-400', textClass: 'text-amber-400' };
    return { score: 1, label: 'Yếu', barClass: 'bg-rose-400', textClass: 'text-rose-400' };
  };

  const strength = getPasswordStrength(isForgotPassword && forgotPasswordStep === 'reset' ? newPassword : password);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsForgotPassword(false);
      setForgotPasswordStep('email');
      setIsLogin(true);
    }
  }, [isOpen]);

  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#34d399', '#fbbf24', '#059669'],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Quên mật khẩu: xử lý từng bước
    if (isForgotPassword) {
      if (forgotPasswordStep === 'email') {
        if (!email) {
          setError('Vui lòng nhập email của bạn.');
          return;
        }
        try {
          const usersRaw = localStorage.getItem('ecoheritage_users');
          const users = usersRaw ? JSON.parse(usersRaw) : [];
          const user = users.find((u: any) => u.email === email);
          if (user) {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            sessionStorage.setItem('eco_reset_otp', JSON.stringify({
              code: generatedOtp, email, expiresAt: Date.now() + 300000
            }));
            toast.success('Mã xác thực đã được gửi!', {
              description: `Mã OTP của bạn: ${generatedOtp} — Hiệu lực 5 phút.`,
              duration: 8000,
            });
            setForgotPasswordStep('otp');
          } else {
            setError('Email không tồn tại trong hệ thống.');
            toast.error('Không tìm thấy tài khoản.');
          }
        } catch {
          setError('Đã xảy ra lỗi hệ thống.');
        }
        return;
      }

      if (forgotPasswordStep === 'otp') {
        if (!otp) {
          setError('Vui lòng nhập mã xác thực.');
          return;
        }
        try {
          const otpData = JSON.parse(sessionStorage.getItem('eco_reset_otp') || '{}');
          if (otpData.code === otp && otpData.email === email && Date.now() < otpData.expiresAt) {
            toast.success('Xác thực thành công!', { description: 'Bây giờ bạn có thể đặt mật khẩu mới.' });
            sessionStorage.removeItem('eco_reset_otp');
            setForgotPasswordStep('reset');
          } else if (otpData.expiresAt && Date.now() >= otpData.expiresAt) {
            setError('Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.');
            toast.error('Mã OTP đã hết hạn!');
          } else {
            setError('Mã xác thực không chính xác.');
            toast.error('Mã OTP sai!');
          }
        } catch {
          setError('Lỗi xác thực. Vui lòng thử lại.');
        }
        return;
      }

      if (forgotPasswordStep === 'reset') {
        if (!newPassword || !confirmNewPassword) {
          setError('Vui lòng nhập mật khẩu mới.');
          return;
        }
        if (newPassword.length < 6) {
          setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
          return;
        }
        if (newPassword !== confirmNewPassword) {
          setError('Mật khẩu xác nhận không khớp.');
          return;
        }

        try {
          const usersRaw = localStorage.getItem('ecoheritage_users');
          let users = usersRaw ? JSON.parse(usersRaw) : [];
          const userIndex = users.findIndex((u: any) => u.email === email);
          
          if (userIndex !== -1) {
            const hashedNewPassword = await hashPassword(newPassword);
            users[userIndex].password = hashedNewPassword;
            localStorage.setItem('ecoheritage_users', JSON.stringify(users));
            toast.success('Đổi mật khẩu thành công! 🎉', { description: 'Vui lòng đăng nhập lại với mật khẩu mới.' });
            triggerSuccessConfetti();
            setIsForgotPassword(false);
            setForgotPasswordStep('email');
            setIsLogin(true);
            setPassword('');
          } else {
            setError('Lỗi không tìm thấy người dùng để cập nhật.');
          }
        } catch {
          setError('Lỗi khi cập nhật mật khẩu.');
        }
        return;
      }
    }

    // Admin login chỉ qua /admin-portal — không cho shortcut ở modal công khai

    // Đăng nhập / Đăng ký: cần đầy đủ thông tin
    if (!email || !password || (!isLogin && !name)) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      const usersRaw = localStorage.getItem('ecoheritage_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const hashedPassword = await hashPassword(password);
      const normalizedEmail = email.toLowerCase().trim();

      if (isLogin) {
        const user = users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail && u.password === hashedPassword);
        if (user) {
          if (user.status === "banned") {
            setError('Tài khoản của bạn đã bị khóa do vi phạm chính sách cộng đồng. Liên hệ Admin để biết thêm chi tiết.');
            toast.error('Tài khoản bị khóa');
            return;
          }
          toast.success(`Chào mừng ${user.name} trở lại!`);
          onLoginSuccess({ name: user.name, email: user.email });
        } else {
          setError('Email hoặc mật khẩu không chính xác.');
          toast.error('Đăng nhập thất bại.');
        }
      } else {
        const existingUser = users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail);
        if (existingUser) {
          setError('Email này đã được đăng ký.');
          toast.error('Email đã tồn tại.');
        } else {
          const newUser = {
            name,
            email: normalizedEmail,
            password: hashedPassword,
            provider: "email",
            createdAt: new Date().toISOString(),
            status: "active"
          };
          users.push(newUser);
          localStorage.setItem('ecoheritage_users', JSON.stringify(users));
          
          // IT Expert: Force Admin Portal to update immediately
          window.dispatchEvent(new Event("storage_sync"));
          window.dispatchEvent(new StorageEvent("storage", { key: 'ecoheritage_users' }));
          
          toast.success('Tạo tài khoản thành công! 🎉');
          triggerSuccessConfetti();
          onLoginSuccess({ name: newUser.name, email: newUser.email });
        }
      }
    } catch (err) {
      setError('Đã xảy ra lỗi hệ thống. Vui lòng thử lại.');
      toast.error('Lỗi hệ thống!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-lg"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[420px] bg-[#0d1612]/50 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_0_80px_-15px_rgba(52,211,153,0.25)] border border-white/10 max-h-[90vh] flex flex-col isolate"
          >
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

            {/* Close button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              aria-label="Đóng"
              title="Đóng"
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#0d1612]/90 backdrop-blur-md border border-white/15 text-white/70 hover:text-emerald-400 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all z-50 cursor-pointer shadow-lg group"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </button>

            <div data-lenis-prevent="true" className="pt-8 pb-7 px-6 sm:pt-10 sm:pb-9 sm:px-8 relative z-10 overflow-y-auto overflow-x-hidden flex-1 rounded-[1.5rem] custom-scrollbar">
            {/* Logo at top */}
            <div className="flex justify-center mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-11 h-11 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <Leaf className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            <div className="text-center mb-6">
              <h2 className="font-display text-2xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-200 mb-2">
                {isForgotPassword 
                  ? (forgotPasswordStep === 'email' ? 'Khôi phục mật khẩu' : forgotPasswordStep === 'otp' ? 'Xác thực mã OTP' : 'Đặt mật khẩu mới')
                  : isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-xs text-emerald-100/50">
                {isForgotPassword
                  ? (forgotPasswordStep === 'email' ? 'Nhập email để nhận mã xác thực' : forgotPasswordStep === 'otp' ? `Mã đã gửi tới ${email}` : 'Vui lòng nhập mật khẩu mới bảo mật hơn')
                  : isLogin
                    ? 'Đăng nhập để tiếp tục hành trình sức khỏe xanh'
                    : 'Tham gia cộng đồng EcoHeritage AI'}
              </p>
            </div>

            {/* Toggle Login/Register */}
            {!isForgotPassword && (
              <div className="relative flex p-1 bg-black/50 rounded-xl mb-6 border border-white/5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`relative flex-1 py-2 text-xs font-bold rounded-lg transition-colors duration-300 z-10 ${
                    isLogin ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {isLogin && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-[0_2px_10px_rgba(16,185,129,0.3)] z-[-1]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`relative flex-1 py-2 text-xs font-bold rounded-lg transition-colors duration-300 z-10 ${
                    !isLogin ? 'text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {!isLogin && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-[0_2px_10px_rgba(16,185,129,0.3)] z-[-1]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  Đăng ký
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="popLayout">
                {!isLogin && !isForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-emerald-500/50" />
                    </div>
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 focus:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Input (Always visible for Email step or common steps) */}
              {(!isForgotPassword || forgotPasswordStep === 'email') && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-emerald-500/50" />
                  </div>
                  <input
                    type="text"
                    placeholder="Địa chỉ Email hoặc Tên đăng nhập"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 focus:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all"
                  />
                </div>
              )}

              {/* OTP Input Step */}
              {isForgotPassword && forgotPasswordStep === 'otp' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ShieldCheck className="w-5 h-5 text-amber-500/50" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập mã xác thực 6 số"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-amber-500/20 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all text-center tracking-[0.5em] placeholder:tracking-normal font-bold"
                  />
                </motion.div>
              )}

              {/* Reset Password Step */}
              {isForgotPassword && forgotPasswordStep === 'reset' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-emerald-500/50" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Mật khẩu mới"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 focus:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter for New Password */}
                  <div className="px-1 mt-1 mb-4">
                    <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                      <div className={`h-full transition-all duration-500 rounded-full w-1/3 ${newPassword.length > 0 ? strength.barClass : 'bg-transparent'}`} />
                      <div className={`h-full transition-all duration-500 rounded-full w-1/3 ${strength.score >= 2 ? strength.barClass : 'bg-transparent'}`} />
                      <div className={`h-full transition-all duration-500 rounded-full w-1/3 ${strength.score >= 3 ? strength.barClass : 'bg-transparent'}`} />
                    </div>
                    {newPassword.length > 0 && (
                      <p className={`text-[10px] mt-2 flex items-center gap-1 font-medium tracking-wider uppercase ${strength.textClass}`}>
                        <ShieldCheck className="w-3 h-3" /> {strength.label}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-emerald-500/50" />
                    </div>
                    <input
                      type="password"
                      placeholder="Xác nhận mật khẩu mới"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all ${confirmNewPassword && newPassword !== confirmNewPassword
                          ? 'border-rose-500/30 focus:border-rose-500/50 focus:shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                          : 'border-white/10 focus:border-emerald-500/40 focus:shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                        }`}
                    />
                  </div>
                </motion.div>
              )}

              {/* Default Password Input for Login/Register */}
              <AnimatePresence mode="popLayout">
                {!isForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-emerald-500/50" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40 focus:shadow-[0_0_15px_rgba(52,211,153,0.2)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {!isLogin && !isForgotPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    {/* Password Strength Meter */}
                    <div className="px-1 mt-1 mb-4">
                      <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                        <div className={`h-full transition-all duration-500 rounded-full w-1/3 ${password.length > 0 ? strength.barClass : 'bg-transparent'}`} />
                        <div className={`h-full transition-all duration-500 rounded-full w-1/3 ${strength.score >= 2 ? strength.barClass : 'bg-transparent'}`} />
                        <div className={`h-full transition-all duration-500 rounded-full w-1/3 ${strength.score >= 3 ? strength.barClass : 'bg-transparent'}`} />
                      </div>
                      {password.length > 0 && (
                        <p className={`text-[10px] mt-2 flex items-center gap-1 font-medium tracking-wider uppercase ${strength.textClass}`}>
                          <ShieldCheck className="w-3 h-3" /> {strength.label}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-emerald-500/50" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Xác nhận mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-sm text-white placeholder-white/30 focus:outline-none transition-all ${confirmPassword && password !== confirmPassword
                            ? 'border-rose-500/30 focus:border-rose-500/50 focus:shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                            : 'border-white/10 focus:border-emerald-500/40 focus:shadow-[0_0_15px_rgba(52,211,153,0.2)]'
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-400 text-xs text-center font-medium bg-rose-500/10 border border-rose-500/20 rounded-lg py-2 px-3"
                >
                  {error}
                </motion.p>
              )}

              {isLogin && !isForgotPassword && (
                <div className="text-right">
                  <button type="button" onClick={() => { setIsForgotPassword(true); setForgotPasswordStep('email'); }} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                    Quên mật khẩu?
                  </button>
                </div>
              )}

              {isForgotPassword && (
                <div className="flex justify-between items-center">
                  {forgotPasswordStep !== 'email' && (
                    <button type="button" onClick={() => setForgotPasswordStep(forgotPasswordStep === 'reset' ? 'otp' : 'email')} className="text-xs text-white/40 hover:text-white transition-colors">
                      Quay lại
                    </button>
                  )}
                  <button type="button" onClick={() => { setIsForgotPassword(false); setForgotPasswordStep('email'); }} className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors ml-auto">
                    Quay lại Đăng nhập
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="relative w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isForgotPassword 
                  ? (forgotPasswordStep === 'email' ? 'Nhận mã OTP' : forgotPasswordStep === 'otp' ? 'Xác thực OTP' : 'Đổi mật khẩu mới')
                  : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              {!isForgotPassword && (
                <div className="pt-5 mt-5 border-t border-white/10 flex flex-col items-center">
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Hoặc tiếp tục với</p>

                  <div className="w-full flex justify-center items-center">
                    <GoogleLogin
                      theme="filled_black"
                      shape="pill"
                      text="continue_with"
                      onSuccess={(credentialResponse) => {
                        try {
                          const token = credentialResponse.credential;
                          if (!token) throw new Error('No credential received');

                          // Giải mã JWT an toàn để lấy tên thật và email
                          const base64Url = token.split('.')[1];
                          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                          const jsonPayload = decodeURIComponent(
                            atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
                          );
                          const decoded = JSON.parse(jsonPayload);

                          toast.success(
                            `🎉 Chào mừng ${decoded.name}!`,
                            {
                              description: 'Xác thực Google thành công. Chúc bạn trải nghiệm EcoHeritage AI thật vui!',
                              duration: 5000,
                              style: {
                                fontSize: '16px',
                                fontWeight: 'bold',
                                padding: '20px 24px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #0a2e1f 0%, #051a11 100%)',
                                color: '#fff',
                                border: '1px solid rgba(16,185,129,0.3)',
                                boxShadow: '0 20px 60px -15px rgba(16,185,129,0.35)',
                              },
                              // @ts-ignore - bypass sonner prop type issue
                              descriptionClassName: 'text-emerald-400/80 text-[13px] font-normal mt-1',
                            }
                          );
                          triggerSuccessConfetti();

                          // Persist Google User for Admin Portal tracking
                          try {
                            const usersRaw = localStorage.getItem('ecoheritage_users');
                            let users = usersRaw ? JSON.parse(usersRaw) : [];
                            if (!users.find((u: any) => u.email === decoded.email)) {
                              users.push({
                                name: decoded.name,
                                email: decoded.email,
                                password: 'GOOGLE_AUTH_TOKEN',
                                provider: 'google',
                                createdAt: new Date().toISOString(),
                                status: 'active'
                              });
                              localStorage.setItem('ecoheritage_users', JSON.stringify(users));
                              
                              // IT Expert: Force Admin Portal to update immediately
                              window.dispatchEvent(new Event("storage_sync"));
                              window.dispatchEvent(new StorageEvent("storage", { key: 'ecoheritage_users' }));
                            }
                          } catch (e) { /* ignore storage errors */ }

                          onLoginSuccess({ name: decoded.name, email: decoded.email });
                        } catch (err) {
                          console.error('Google JWT Decode Error', err);
                          toast.error('Lỗi khi đọc dữ liệu từ Google.');
                        }
                      }}
                      onError={() => {
                        toast.error('Lỗi khi gọi Google. Cần OAuth Client ID!');
                      }}
                      width="100%"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
