import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

import { hashPassword } from '../utils/crypto';

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
    if (!pass) return { score: 0, label: '', barColor: 'transparent', textColor: 'transparent' };
    const len = pass.length;
    if (len >= 7) return { score: 3, label: 'Mạnh', barColor: '#34d399', textColor: '#34d399' };
    if (len >= 5) return { score: 2, label: 'Trung bình', barColor: '#fbbf24', textColor: '#fbbf24' };
    return { score: 1, label: 'Yếu', barColor: '#fb7185', textColor: '#fb7185' };
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

  if (!isOpen) return null;

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
            toast.success('Mã xác thực đã được gửi!', {
              description: `Vui lòng kiểm tra hộp thư ${email} để lấy mã OTP (Demo: 123456).`,
              duration: 5000,
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
        if (otp === '123456') {
          toast.success('Xác thực thành công!', { description: 'Bây giờ bạn có thể đặt mật khẩu mới.' });
          setForgotPasswordStep('reset');
        } else {
          setError('Mã xác thực không chính xác. Thử lại với 123456.');
          toast.error('Mã OTP sai!');
        }
        return;
      }

      if (forgotPasswordStep === 'reset') {
        if (!newPassword || !confirmNewPassword) {
          setError('Vui lòng nhập mật khẩu mới.');
          return;
        }
        if (newPassword.length < 4) {
          setError('Mật khẩu mới phải có ít nhất 4 ký tự.');
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

    // Đăng nhập / Đăng ký: cần đầy đủ thông tin
    if (!email || !password || (!isLogin && !name)) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (password.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự.');
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

      if (isLogin) {
        const user = users.find((u: any) => u.email === email && u.password === hashedPassword);
        if (user) {
          toast.success(`Chào mừng ${user.name} trở lại!`);
          onLoginSuccess({ name: user.name, email: user.email });
        } else {
          setError('Email hoặc mật khẩu không chính xác.');
          toast.error('Đăng nhập thất bại.');
        }
      } else {
        const existingUser = users.find((u: any) => u.email === email);
        if (existingUser) {
          setError('Email này đã được đăng ký.');
          toast.error('Email đã tồn tại.');
        } else {
          const newUser = { name, email, password: hashedPassword };
          users.push(newUser);
          localStorage.setItem('ecoheritage_users', JSON.stringify(users));
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[#0a1913]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_80px_-15px_rgba(52,211,153,0.3)] border border-white/10 max-h-[90vh] flex flex-col"
          style={{ isolation: 'isolate' }}
        >
          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/15 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-5 right-5 p-2.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all z-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 sm:p-10 relative z-10 overflow-y-auto overflow-x-hidden flex-1 rounded-[2.5rem] custom-scrollbar">
            {/* Logo at top */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]"
              >
                <Leaf className="w-8 h-8 text-white" />
              </motion.div>
            </div>

            <div className="text-center mb-7">
              <h2 className="font-display text-3xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-amber-200 mb-2">
                {isForgotPassword 
                  ? (forgotPasswordStep === 'email' ? 'Khôi phục mật khẩu' : forgotPasswordStep === 'otp' ? 'Xác thực mã OTP' : 'Đặt mật khẩu mới')
                  : isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
              </h2>
              <p className="text-sm text-emerald-100/50">
                {isForgotPassword
                  ? (forgotPasswordStep === 'email' ? 'Nhập email để nhận mã xác thực' : forgotPasswordStep === 'otp' ? `Mã đã gửi tới ${email}` : 'Vui lòng nhập mật khẩu mới bảo mật hơn')
                  : isLogin
                    ? 'Đăng nhập để tiếp tục hành trình sức khỏe xanh'
                    : 'Tham gia cộng đồng EcoHeritage AI'}
              </p>
            </div>

            {/* Toggle Login/Register */}
            {!isForgotPassword && (
              <div className="flex p-1 bg-black/40 rounded-2xl mb-7 border border-white/5">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${isLogin ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 border border-emerald-500/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'text-white/40 hover:text-white/70'
                    }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/10 border border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'text-white/40 hover:text-white/70'
                    }`}
                >
                  Đăng ký
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all"
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
                    type="email"
                    placeholder="Địa chỉ Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all"
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
                    placeholder="Nhập mã OTP (123456)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-amber-500/30 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/60 focus:shadow-[0_0_0_3px_rgba(245,158,11,0.15)] transition-all text-center tracking-[0.5em] font-bold"
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
                      className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter for New Password */}
                  <div className="px-1 mt-1 mb-4">
                    <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-white/5">
                      <div className="h-full transition-all duration-500 rounded-full w-1/3" style={{ backgroundColor: newPassword.length > 0 ? strength.barColor : 'transparent' }} />
                      <div className="h-full transition-all duration-500 rounded-full w-1/3" style={{ backgroundColor: strength.score >= 2 ? strength.barColor : 'transparent' }} />
                      <div className="h-full transition-all duration-500 rounded-full w-1/3" style={{ backgroundColor: strength.score >= 3 ? strength.barColor : 'transparent' }} />
                    </div>
                    {newPassword.length > 0 && (
                      <p className="text-[10px] mt-2 flex items-center gap-1 font-medium tracking-wider uppercase" style={{ color: strength.textColor }}>
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
                      className={`w-full pl-11 pr-4 py-3.5 bg-white/5 border rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none transition-all ${confirmNewPassword && newPassword !== confirmNewPassword
                          ? 'border-rose-500/50 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)]'
                          : 'border-white/10 focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
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
                      className="w-full pl-11 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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
                        <div className="h-full transition-all duration-500 rounded-full w-1/3" style={{ backgroundColor: password.length > 0 ? strength.barColor : 'transparent' }} />
                        <div className="h-full transition-all duration-500 rounded-full w-1/3" style={{ backgroundColor: strength.score >= 2 ? strength.barColor : 'transparent' }} />
                        <div className="h-full transition-all duration-500 rounded-full w-1/3" style={{ backgroundColor: strength.score >= 3 ? strength.barColor : 'transparent' }} />
                      </div>
                      {password.length > 0 && (
                        <p className="text-[10px] mt-2 flex items-center gap-1 font-medium tracking-wider uppercase" style={{ color: strength.textColor }}>
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
                        className={`w-full pl-11 pr-12 py-3.5 bg-white/5 border rounded-2xl text-sm text-white placeholder-white/30 focus:outline-none transition-all ${confirmPassword && password !== confirmPassword
                            ? 'border-rose-500/50 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.15)]'
                            : 'border-white/10 focus:border-emerald-500/60 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
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
                  className="text-rose-400 text-xs text-center font-medium bg-rose-500/10 border border-rose-500/20 rounded-xl py-2.5 px-4"
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
                className="relative w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-2xl font-bold shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isForgotPassword 
                  ? (forgotPasswordStep === 'email' ? 'Nhận mã OTP' : forgotPasswordStep === 'otp' ? 'Xác thực OTP' : 'Đổi mật khẩu mới')
                  : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {!isForgotPassword && (
                <div className="pt-5 mt-5 border-t border-white/10 flex flex-col items-center">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-4">Hoặc tiếp tục với</p>

                  <div className="w-full rounded-xl overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.03)] border border-white/5">
                    <GoogleLogin
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
                          onLoginSuccess({ name: decoded.name, email: decoded.email });
                        } catch (err) {
                          console.error('Google JWT Decode Error', err);
                          toast.error('Lỗi khi đọc dữ liệu từ Google.');
                        }
                      }}
                      onError={() => {
                        toast.error('Lỗi khi gọi Google. Cần OAuth Client ID!');
                      }}
                      theme="filled_black"
                      text="continue_with"
                      shape="rectangular"
                      width="100%"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
