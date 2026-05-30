import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldCheck, Leaf, Sparkles, Stethoscope, ScrollText, CloudSun } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

import { hashPassword } from '../utils/crypto';
import { ADMIN_SESSION_KEY } from '../pages/admin/adminUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string, email: string }) => void;
}

// ─── Password Strength Helper ───────────────────────────────────
const getPasswordStrength = (pass: string) => {
  if (!pass) return { score: 0, label: '', color: 'transparent', percent: 0 };
  const len = pass.length;
  const hasLetter = /[a-zA-Z]/.test(pass);
  const hasDigit = /[0-9]/.test(pass);
  const hasSpecial = /[^A-Za-z0-9]/.test(pass);
  if (len < 6) return { score: 1, label: 'Yếu', color: '#f43f5e', percent: 33 };
  const isStrong = len >= 8 && ((hasLetter && hasDigit) || hasSpecial);
  if (isStrong) return { score: 3, label: 'Mạnh', color: '#10b981', percent: 100 };
  return { score: 2, label: 'Trung bình', color: '#f59e0b', percent: 66 };
};

// ─── Eye Toggle Button ─────────────────────────────────────────
const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
  <button type="button" onClick={onToggle}
    className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
  >
    {show ? <EyeOff className="w-4 h-4" strokeWidth={1.8} /> : <Eye className="w-4 h-4" strokeWidth={1.8} />}
  </button>
);

// ─── Password Strength Bar (sleek minimal) ────────────────────
const StrengthBar = ({ pass }: { pass: string }) => {
  const s = getPasswordStrength(pass);
  if (!pass) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="px-1 pt-2 pb-1">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${s.percent}%` }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="h-full rounded-full"
            style={{ backgroundColor: s.color }}
          />
        </div>
        <span className="text-[11px] font-semibold tracking-wide min-w-[65px] text-right" style={{ color: s.color }}>
          {s.label}
        </span>
      </div>
    </motion.div>
  );
};

// ─── Reusable Premium Input Component ─────────────────────────
interface PremiumInputProps {
  icon: any;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  ariaLabel: string;
  id: string;
  focusedField: string | null;
  setFocusedField: (id: string | null) => void;
  rightElement?: React.ReactNode;
  inputClassName?: string;
  label?: string;
}

const PremiumInput = ({
  icon: Icon, type, placeholder, value, onChange, autoComplete, ariaLabel, id,
  focusedField, setFocusedField, rightElement, inputClassName, label
}: PremiumInputProps) => {
  const isFocused = focusedField === id;
  const hasValue = value.length > 0;

  return (
    <div className="flex flex-col w-full text-left group">
      {label && (
        <label htmlFor={id} className={`block text-[11px] font-extrabold uppercase tracking-wider mb-1.5 pl-1 transition-colors duration-300 ${
          isFocused ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-500'
        }`}>
          {label}
        </label>
      )}
      <div className={`
        relative group/input rounded-2xl transition-all duration-500
        ${isFocused
          ? 'shadow-[0_0_0_2px_rgba(16,185,129,0.15),0_8px_25px_rgba(16,185,129,0.08)]'
          : 'shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
        }
      `}>
        {/* Animated border glow */}
        <div className={`absolute -inset-[1px] rounded-2xl transition-opacity duration-500 pointer-events-none ${isFocused ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(20,184,166,0.2), rgba(16,185,129,0.3))' }}
        />

        <div className={`
          relative flex items-center rounded-2xl border transition-all duration-300
          ${isFocused
            ? 'border-emerald-400/60 bg-white'
            : hasValue
              ? 'border-emerald-200/50 bg-white'
              : 'border-gray-200/80 bg-gray-50/50 hover:border-emerald-200/60 hover:bg-white'
          }
        `}>
          {/* Icon */}
          <div className={`pl-4 pr-1 flex items-center transition-colors duration-300 ${isFocused ? 'text-emerald-500' : 'text-gray-400'}`}>
            <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </div>

          {/* Input */}
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onFocus={() => setFocusedField(id)}
            onBlur={() => setFocusedField(null)}
            autoComplete={autoComplete}
            aria-label={ariaLabel}
            className={`
              w-full py-3.5 pr-4 pl-2 bg-transparent text-[14px] text-gray-900
              placeholder:text-gray-400/70 placeholder:font-normal
              focus:outline-none font-medium tracking-[0.01em]
              selection:bg-emerald-700 selection:text-white
              ${inputClassName || ''}
            `}
          />

          {/* Right element (eye toggle etc) */}
          {rightElement && (
            <div className="pr-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   AuthModal V5.0 — Cinematic Full-Screen Split Layout
   Inspiration: Apple ID, Stripe Dashboard, Linear App
   ═══════════════════════════════════════════════════════════════════ */
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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Mouse parallax for left panel
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!leftPanelRef.current) return;
    const rect = leftPanelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const strength = getPasswordStrength(isForgotPassword && forgotPasswordStep === 'reset' ? newPassword : password);

  useEffect(() => {
    if (isOpen) {
      setError(''); setPassword(''); setConfirmPassword(''); setName(''); setEmail('');
      setOtp(''); setNewPassword(''); setConfirmNewPassword('');
      setIsForgotPassword(false); setForgotPasswordStep('email'); setIsLogin(true);
      setFocusedField(null);
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const triggerSuccessConfetti = () => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#fbbf24', '#059669'] });
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const decoded = await res.json();
        
        toast.success(`Xin chào, ${decoded.name}!`);
        triggerSuccessConfetti();

        try {
          const usersRaw = localStorage.getItem('ecoheritage_users');
          const users = usersRaw ? JSON.parse(usersRaw) : [];
          if (!users.find((u: any) => u.email.toLowerCase().trim() === decoded.email.toLowerCase().trim())) {
            users.push({
              name: decoded.name,
              email: decoded.email,
              password: 'GOOGLE_AUTH_TOKEN',
              provider: 'google',
              createdAt: new Date().toISOString(),
              status: 'active'
            });
            localStorage.setItem('ecoheritage_users', JSON.stringify(users));
            window.dispatchEvent(new Event("storage_sync"));
            window.dispatchEvent(new StorageEvent("storage", { key: 'ecoheritage_users' }));
          }
        } catch (e) { /* ignore */ }

        onLoginSuccess({ name: decoded.name, email: decoded.email });
      } catch (err) {
        console.error('Google Userinfo Fetch Error', err);
        toast.error('Lỗi khi đăng nhập bằng Google.');
      }
    },
    onError: () => {
      toast.error('Đăng nhập Google thất bại!');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isForgotPassword) {
      if (forgotPasswordStep === 'email') {
        if (!email) { setError('Vui lòng nhập email của bạn.'); return; }
        try {
          const usersRaw = localStorage.getItem('ecoheritage_users');
          const users = usersRaw ? JSON.parse(usersRaw) : [];
          const user = users.find((u: any) => u.email === email);
          if (user) {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            sessionStorage.setItem('eco_reset_otp', JSON.stringify({ code: generatedOtp, email, expiresAt: Date.now() + 300000 }));
            toast.success('Mã xác thực đã được gửi!', { description: `Mã OTP của bạn: ${generatedOtp} — Hiệu lực 5 phút.`, duration: 8000 });
            setForgotPasswordStep('otp');
          } else {
            setError('Email không tồn tại trong hệ thống.');
            toast.error('Không tìm thấy tài khoản.');
          }
        } catch { setError('Đã xảy ra lỗi hệ thống.'); }
        return;
      }
      if (forgotPasswordStep === 'otp') {
        if (!otp) { setError('Vui lòng nhập mã xác thực.'); return; }
        try {
          const otpData = JSON.parse(sessionStorage.getItem('eco_reset_otp') || '{}');
          if (otpData.code === otp && otpData.email === email && Date.now() < otpData.expiresAt) {
            toast.success('Xác thực thành công!', { description: 'Bây giờ bạn có thể đặt mật khẩu mới.' });
            sessionStorage.removeItem('eco_reset_otp');
            setForgotPasswordStep('reset');
          } else if (otpData.expiresAt && Date.now() >= otpData.expiresAt) {
            setError('Mã xác thực đã hết hạn.');
            toast.error('Mã OTP đã hết hạn!');
          } else {
            setError('Mã xác thực không chính xác.');
            toast.error('Mã OTP sai!');
          }
        } catch { setError('Lỗi xác thực. Vui lòng thử lại.'); }
        return;
      }
      if (forgotPasswordStep === 'reset') {
        if (!newPassword || !confirmNewPassword) { setError('Vui lòng nhập mật khẩu mới.'); return; }
        if (newPassword.length < 6) { setError('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
        if (newPassword !== confirmNewPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }
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
            setIsForgotPassword(false); setForgotPasswordStep('email'); setIsLogin(true); setPassword('');
          } else { setError('Lỗi không tìm thấy người dùng.'); }
        } catch { setError('Lỗi khi cập nhật mật khẩu.'); }
        return;
      }
    }

    if (!email || !password || (!isLogin && !name)) { setError('Vui lòng điền đầy đủ thông tin.'); return; }
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (!isLogin && password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }

    try {
      const usersRaw = localStorage.getItem('ecoheritage_users');
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      const hashedPassword = await hashPassword(password);
      const normalizedEmail = email.toLowerCase().trim();

      if (isLogin) {
        const user = users.find((u: any) => u.email.toLowerCase().trim() === normalizedEmail && u.password === hashedPassword);
        if (user) {
          if (user.status === "banned") {
            setError('Tài khoản của bạn đã bị khóa do vi phạm chính sách cộng đồng.');
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
          const newUser = { name, email: normalizedEmail, password: hashedPassword, provider: "email", createdAt: new Date().toISOString(), status: "active" };
          users.push(newUser);
          localStorage.setItem('ecoheritage_users', JSON.stringify(users));
          window.dispatchEvent(new Event("storage_sync"));
          window.dispatchEvent(new StorageEvent("storage", { key: 'ecoheritage_users' }));
          toast.success('Tạo tài khoản thành công! 🎉');
          triggerSuccessConfetti();
          onLoginSuccess({ name: newUser.name, email: newUser.email });
        }
      }
    } catch {
      setError('Đã xảy ra lỗi hệ thống.');
      toast.error('Lỗi hệ thống!');
    }
  };



  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex"
          data-lenis-prevent="true"
        >
          {/* ══════════ BACKDROP ══════════ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl cursor-pointer z-0"
          />

          {/* ══════════ MODAL CONTAINER ══════════ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350, mass: 0.8 }}
            className="relative z-10 m-auto w-[95vw] max-w-[960px] h-auto max-h-[92vh] bg-white rounded-[28px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.35),0_30px_60px_-30px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ═════════════════════════════════════════════════════════════
               LEFT PANEL — Cinematic Visual Showcase (Desktop Only)
               ═════════════════════════════════════════════════════════════ */}
            <div
              ref={leftPanelRef}
              onMouseMove={handleMouseMove}
              className="hidden md:flex md:w-[45%] relative overflow-hidden select-none shrink-0"
            >
              {/* Full-bleed Background Image with parallax */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  x: mousePos.x * -15,
                  y: mousePos.y * -15,
                  scale: 1.08,
                }}
                transition={{ type: 'tween', duration: 0.8, ease: 'easeOut' }}
              >
                <img
                  src="/images/herbs_auth_bg.png"
                  alt="Vietnamese Herbal Heritage"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Dark gradient overlays for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/30 z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/10 z-10" />

              {/* Animated aurora particles */}
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <motion.div
                  className="absolute top-[15%] left-[10%] w-40 h-40 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)' }}
                  animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute bottom-[25%] right-[15%] w-32 h-32 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)' }}
                  animate={{ y: [0, 15, 0], x: [0, -8, 0], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
              </div>

              {/* Content overlay */}
              <div className="relative z-30 flex flex-col justify-between h-full p-7 sm:p-8">
                {/* Top: Brand */}
                <div className="flex items-center gap-3">
                  <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-700 p-2.5 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                    <div className="absolute -inset-0.5 bg-emerald-400/20 rounded-xl blur-md animate-pulse" />
                    <Leaf className="w-5 h-5 text-white relative z-10 drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold tracking-tight text-white">EcoHeritage</p>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-amber-400">AI · Đà Nẵng</p>
                  </div>
                </div>

                {/* Middle: Welcome message — dramatic & impressive */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="my-auto flex flex-col items-start"
                >
                  {/* Welcome heading — LARGE & bold */}
                  <motion.h3
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className="text-white text-[28px] sm:text-[34px] font-extrabold leading-[1.15] tracking-tight mb-5"
                    style={{ textShadow: '0 4px 30px rgba(255,255,255,0.15), 0 2px 10px rgba(0,0,0,0.5)' }}
                  >
                    Sống khỏe
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300" style={{ filter: 'drop-shadow(0 0 20px rgba(52,211,153,0.3))' }}>
                      mỗi ngày
                    </span>
                  </motion.h3>

                  {/* Divider line with glow */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="w-16 h-[2px] bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full mb-5 origin-left shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                  />

                  {/* Sub-message */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-white/80 text-[14px] sm:text-[15px] leading-relaxed font-medium mb-10 max-w-[300px]"
                  >
                    Đăng nhập để khám phá kho tàng <span className="text-amber-300 font-semibold">y học cổ truyền</span> kết hợp <span className="text-emerald-300 font-semibold">AI thông minh</span>
                  </motion.p>

                  {/* Elegant benefit row */}
                  <div className="flex items-center gap-6">
                    {[
                      { Icon: Stethoscope, label: 'AI tư vấn', gradient: 'from-emerald-400 to-emerald-600' },
                      { Icon: ScrollText, label: 'Bài thuốc', gradient: 'from-amber-400 to-amber-600' },
                      { Icon: CloudSun, label: 'Môi trường', gradient: 'from-teal-400 to-cyan-500' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 + i * 0.12, duration: 0.4 }}
                        className="flex flex-col items-center gap-2 group cursor-default"
                      >
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                          <item.Icon className="w-5 h-5 text-white drop-shadow-md" strokeWidth={2} />
                        </div>
                        <span className="text-white/70 text-[10px] font-bold tracking-wider uppercase">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Bottom: Trust badge */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center">
                      <ShieldCheck className="w-3 h-3 text-emerald-300" strokeWidth={2.5} />
                    </div>
                    <span className="text-white/50 text-[10px] font-semibold tracking-wider">Bảo mật & An toàn</span>
                  </div>
                  <span className="text-white/45 text-[9.5px] font-semibold tracking-wider">© 2026 EcoHeritage</span>
                </div>
              </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════
               RIGHT PANEL — Premium Form with Accent Header
               ═════════════════════════════════════════════════════════════ */}
            <div className="w-full md:w-[55%] overflow-y-auto overflow-x-hidden bg-[#fafbfc] relative selection:bg-emerald-700 selection:text-white">
              {/* Decorative top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 z-20" />

              {/* Subtle background patterns */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div style={{ backgroundImage: 'radial-gradient(circle at 85% 15%, rgba(16,185,129,0.05) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(251,191,36,0.04) 0%, transparent 50%)' }} className="absolute inset-0" />
                {/* Watermark leaf */}
                <div className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.025] pointer-events-none">
                  <Leaf className="w-full h-full text-emerald-900" strokeWidth={0.5} />
                </div>
              </div>

              <div className="relative z-10 flex flex-col justify-center min-h-full px-6 sm:px-10 md:px-12 py-10 md:py-12">
                {/* Close button */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  aria-label="Đóng"
                  className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100/80 transition-all z-50 cursor-pointer group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" strokeWidth={1.8} />
                </button>

                {/* Mobile brand header */}
                <div className="flex justify-center mb-6 md:hidden">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_8px_30px_rgba(16,185,129,0.3)] relative">
                    <div className="absolute -inset-1 bg-emerald-400/20 rounded-2xl blur-md animate-pulse" />
                    <Leaf className="w-7 h-7 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" strokeWidth={2} />
                  </div>
                </div>

                {/* ═══ Title & Subtitle — with icon accent ═══ */}
                <div className="text-center md:text-left mb-8">
                  <motion.div
                    key={`icon-${isLogin}-${isForgotPassword}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="hidden md:inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide mb-4"
                  >
                    <Leaf className="w-3.5 h-3.5" strokeWidth={2.2} />
                    {isForgotPassword ? 'Khôi phục bảo mật' : isLogin ? 'Cổng thành viên' : 'Thành viên mới'}
                  </motion.div>
                  <motion.h2
                    key={`title-${isLogin}-${isForgotPassword}-${forgotPasswordStep}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight"
                  >
                    {isForgotPassword
                      ? (forgotPasswordStep === 'email' ? <><span className="text-gray-900">Khôi phục </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">mật khẩu</span></> : forgotPasswordStep === 'otp' ? <><span className="text-gray-900">Xác thực </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">OTP</span></> : <><span className="text-gray-900">Mật khẩu </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">mới</span></>)
                      : isLogin ? <><span className="text-gray-900">Chào mừng </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">trở lại</span></> : <><span className="text-gray-900">Tạo </span><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">tài khoản</span></>}
                  </motion.h2>
                  <motion.p
                    key={`sub-${isLogin}-${isForgotPassword}-${forgotPasswordStep}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="mt-2 text-[14px] text-gray-500 font-normal leading-relaxed"
                  >
                    {isForgotPassword
                      ? (forgotPasswordStep === 'email' ? 'Nhập email để nhận mã xác thực khôi phục' : forgotPasswordStep === 'otp' ? `Mã đã gửi tới ${email}` : 'Tạo mật khẩu mới an toàn hơn')
                      : isLogin
                        ? 'Đăng nhập để tiếp tục hành trình sức khỏe xanh'
                        : 'Tham gia cộng đồng hệ sinh thái thảo dược Việt Nam'}
                  </motion.p>
                </div>

                {/* ═══ Tab Switcher — with emerald active indicator ═══ */}
                {!isForgotPassword && (
                  <div className="relative flex p-[3px] bg-gray-100/80 rounded-2xl mb-8 max-w-[280px] mx-auto md:mx-0 w-full">
                    <motion.div
                      className="absolute top-[3px] bottom-[3px] rounded-[14px] bg-white shadow-[0_2px_8px_rgba(16,185,129,0.1),0_1px_3px_rgba(0,0,0,0.06)]"
                      animate={{ left: isLogin ? '3px' : '50%', right: isLogin ? '50%' : '3px' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                    {['Đăng nhập', 'Đăng ký'].map((label, i) => (
                      <button key={label} type="button"
                        onClick={() => setIsLogin(i === 0)}
                        className={`relative flex-1 py-2.5 text-[13px] font-bold rounded-[14px] transition-colors duration-200 z-10 cursor-pointer ${
                          (i === 0 ? isLogin : !isLogin) ? 'text-emerald-700' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {/* ═══ Form ═══ */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name field (register only) */}
                  <AnimatePresence mode="popLayout">
                    {!isLogin && !isForgotPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <PremiumInput
                          icon={User} type="text" placeholder="Nhập họ và tên của bạn" id="name"
                          value={name} onChange={(e) => setName(e.target.value)}
                          autoComplete="name" ariaLabel="Họ và tên"
                          focusedField={focusedField} setFocusedField={setFocusedField}
                          label="Họ và tên"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email field */}
                  {(!isForgotPassword || forgotPasswordStep === 'email') && (
                    <PremiumInput
                      icon={Mail} type="email" placeholder="example@domain.com" id="email"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email" ariaLabel="Email"
                      focusedField={focusedField} setFocusedField={setFocusedField}
                      label="Địa chỉ email"
                    />
                  )}

                  {/* OTP field */}
                  {isForgotPassword && forgotPasswordStep === 'otp' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <PremiumInput
                        icon={ShieldCheck} type="text" placeholder="Nhập mã xác thực 6 số" id="otp"
                        value={otp} onChange={(e) => setOtp(e.target.value)}
                        ariaLabel="Mã xác thực"
                        focusedField={focusedField} setFocusedField={setFocusedField}
                        inputClassName="text-center tracking-[0.4em] placeholder:tracking-normal font-bold text-emerald-700"
                        label="Mã xác thực (OTP)"
                      />
                    </motion.div>
                  )}

                  {/* Reset password fields */}
                  {isForgotPassword && forgotPasswordStep === 'reset' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <PremiumInput
                        icon={Lock} type={showNewPassword ? 'text' : 'password'}
                        placeholder="••••••••" id="newPass"
                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        ariaLabel="Mật khẩu mới"
                        focusedField={focusedField} setFocusedField={setFocusedField}
                        rightElement={<EyeToggle show={showNewPassword} onToggle={() => setShowNewPassword(!showNewPassword)} />}
                        label="Mật khẩu mới"
                      />
                      <StrengthBar pass={newPassword} />
                      <PremiumInput
                        icon={Lock} type="password" placeholder="••••••••" id="confirmNewPass"
                        value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                        ariaLabel="Xác nhận mật khẩu mới"
                        focusedField={focusedField} setFocusedField={setFocusedField}
                        label="Xác nhận mật khẩu mới"
                      />
                    </motion.div>
                  )}

                  {/* Standard password field (login/register) */}
                  <AnimatePresence mode="popLayout">
                    {!isForgotPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <PremiumInput
                          icon={Lock} type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••" id="password"
                          value={password} onChange={(e) => setPassword(e.target.value)}
                          autoComplete={isLogin ? 'current-password' : 'new-password'} ariaLabel="Mật khẩu"
                          focusedField={focusedField} setFocusedField={setFocusedField}
                          rightElement={<EyeToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />}
                          label="Mật khẩu"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirm password + Strength (register) */}
                  <AnimatePresence mode="popLayout">
                    {!isLogin && !isForgotPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                      >
                        <StrengthBar pass={password} />
                        <PremiumInput
                          icon={Lock} type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="••••••••" id="confirmPassword"
                          value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          autoComplete="new-password" ariaLabel="Xác nhận mật khẩu"
                          focusedField={focusedField} setFocusedField={setFocusedField}
                          rightElement={<EyeToggle show={showConfirmPassword} onToggle={() => setShowConfirmPassword(!showConfirmPassword)} />}
                          label="Xác nhận mật khẩu"
                        />
                        {confirmPassword && password !== confirmPassword && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-rose-500 font-medium pl-1">
                            Mật khẩu xác nhận không khớp
                          </motion.p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl py-2.5 px-4 text-[13px] font-medium"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Forgot password link */}
                  {isLogin && !isForgotPassword && (
                    <div className="text-right">
                      <button type="button"
                        onClick={() => { setIsForgotPassword(true); setForgotPasswordStep('email'); }}
                        className="text-[13px] text-emerald-600 hover:text-emerald-700 font-semibold transition-colors cursor-pointer hover:underline underline-offset-2"
                      >
                        Quên mật khẩu?
                      </button>
                    </div>
                  )}

                  {/* Forgot password navigation */}
                  {isForgotPassword && (
                    <div className="flex justify-between items-center text-[13px]">
                      {forgotPasswordStep !== 'email' && (
                        <button type="button"
                          onClick={() => setForgotPasswordStep(forgotPasswordStep === 'reset' ? 'otp' : 'email')}
                          className="text-gray-400 hover:text-gray-700 transition-colors font-semibold cursor-pointer"
                        >
                          ← Quay lại
                        </button>
                      )}
                      <button type="button"
                        onClick={() => { setIsForgotPassword(false); setForgotPasswordStep('email'); }}
                        className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors ml-auto cursor-pointer hover:underline underline-offset-2"
                      >
                        Đăng nhập
                      </button>
                    </div>
                  )}

                  {/* ═══ Submit Button — with glow ring ═══ */}
                  <div className="pt-3">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="relative w-full py-4 rounded-2xl font-bold text-[15px] text-white overflow-hidden cursor-pointer border-0 flex items-center justify-center gap-2.5 group shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_35px_rgba(16,185,129,0.45)] transition-all duration-500"
                      style={{
                        background: 'linear-gradient(135deg, #047857 0%, #059669 30%, #10b981 60%, #14b8a6 100%)',
                      }}
                    >
                      {/* Animated glow ring */}
                      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 opacity-0 group-hover:opacity-40 blur-sm transition-opacity duration-500" />

                      {/* Shimmer overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

                      <span className="relative z-10 tracking-wide">
                        {isForgotPassword
                          ? (forgotPasswordStep === 'email' ? 'Gửi mã xác thực' : forgotPasswordStep === 'otp' ? 'Xác thực' : 'Đổi mật khẩu')
                          : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
                      </span>
                      <ArrowRight className="w-4.5 h-4.5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" strokeWidth={2.5} />
                    </motion.button>
                  </div>

                  {/* ═══ Divider + Google Login ═══ */}
                  {!isForgotPassword && (
                    <div className="pt-5">
                      <div className="relative flex items-center mb-5">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                        <span className="px-4 text-[11px] text-gray-400 font-bold tracking-widest uppercase">hoặc</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                      </div>

                      <div className="w-full flex justify-center relative z-10">
                        <motion.button
                          type="button"
                          onClick={() => loginWithGoogle()}
                          whileHover={{ scale: 1.005 }}
                          whileTap={{ scale: 0.995 }}
                          className="w-full py-3.5 rounded-2xl font-semibold text-[14px] text-gray-700 bg-white border border-gray-200 hover:bg-emerald-50/50 flex items-center justify-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_15px_rgba(16,185,129,0.08)] hover:border-emerald-200 transition-all cursor-pointer group"
                        >
                          <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          <span className="tracking-[0.01em]">Tiếp tục với Google</span>
                        </motion.button>
                      </div>
                    </div>
                  )}
                </form>

                {/* Bottom branded footer on mobile */}
                <div className="mt-8 text-center md:hidden">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">EcoHeritage AI · Đà Nẵng</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
