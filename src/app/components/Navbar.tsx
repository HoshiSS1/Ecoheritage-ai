import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router';
import { Leaf, Menu, X, ChevronDown, User, LogOut, ArrowRight } from 'lucide-react';
import { navLinks } from './navigation';
import { getAvatarUrl } from '../utils/avatarUtils';

interface NavbarProps {
  scrolled: boolean;
  user: { name: string; email: string } | null;
  userAvatar: string | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export function Navbar({ scrolled, user, userAvatar, onLogout, onOpenAuth }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-[120] transition-all duration-500 ${
        scrolled 
          ? 'bg-[#020b07]/90 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] border-b border-[var(--border-subtle)]' 
          : 'bg-[#0a1913]/60 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between relative">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-700 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_40px_rgba(16,185,129,0.7)] transition-all duration-500">
            <div className="absolute -inset-1 bg-emerald-400/20 rounded-xl sm:rounded-2xl blur-md animate-pulse" />
            <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Leaf className="w-5 h-5 sm:w-7 sm:h-7 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
          </div>
          <div>
            <div className="font-display text-lg sm:text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors duration-300">EcoHeritage</div>
            <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.3em] font-semibold text-amber-400/90 group-hover:text-white transition-colors duration-300">AI · Đà Nẵng</div>
          </div>
        </Link>

        <div className="hidden lg:flex flex-1 items-center justify-center gap-10">
          {navLinks.map((l) => {
            const isActive = location.pathname === l.path || (l.subItems && l.subItems.some(si => location.pathname === si.path));
            const isSection = l.path.startsWith('/#') || l.path.startsWith('#');
            
            return (
              <div key={l.name} className="relative group px-1 py-2">
                {isSection ? (
                  <Link 
                    to={l.path}
                    className={`relative text-[16px] font-bold transition-all duration-500 hover:text-amber-400 group/navitem ${
                      isActive ? 'text-white' : 'text-white/70'
                    }`}
                  >
                    {l.name}
                    <span className={`absolute -bottom-1 left-0 h-[2px] bg-amber-400 transition-all duration-500 ${
                      isActive ? 'w-full opacity-100 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'w-0 opacity-0 group-hover/navitem:w-full group-hover/navitem:opacity-100'
                    }`} />
                  </Link>
                ) : (
                  <div className="relative group/sub">
                    <span 
                      className={`relative text-[16px] font-bold transition-all duration-500 hover:text-amber-400 flex items-center gap-1.5 cursor-pointer group/navitem ${
                        isActive ? 'text-white' : 'text-white/70'
                      }`}
                    >
                      {l.name}
                      {l.subItems && <ChevronDown className="w-4 h-4 opacity-50 group-hover/sub:rotate-180 transition-transform duration-500" />}
                      <span className={`absolute -bottom-1 left-0 h-[2px] bg-amber-400 transition-all duration-500 ${
                        isActive ? 'w-full opacity-100 shadow-[0_0_10px_rgba(251,191,36,0.8)]' : 'w-0 opacity-0 group-hover/navitem:w-full group-hover/navitem:opacity-100'
                      }`} />
                    </span>

                    {l.subItems && (
                      <div className="absolute top-full -left-6 pt-6 opacity-0 translate-y-3 invisible group-hover/sub:opacity-100 group-hover/sub:translate-y-0 group-hover/sub:visible transition-all duration-500 z-50">
                        <div className="bg-[#0a1913]/95 border border-emerald-500/20 rounded-[var(--radius-2xl)] shadow-[var(--shadow-2xl)] overflow-hidden min-w-[280px] backdrop-blur-xl p-2 relative">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
                          <div className="grid gap-1">
                            {l.subItems.map((sub) => (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                className="flex items-center gap-4 px-5 py-4 rounded-[var(--radius-xl)] bg-transparent hover:bg-white/5 border border-transparent hover:border-[var(--border-subtle)] transition-all duration-300 group/item relative overflow-hidden"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
                                
                                <div className="relative z-10 w-10 h-10 shrink-0 rounded-xl bg-[#0a1f16] border border-[var(--border-default)] flex items-center justify-center text-emerald-400 group-hover/item:scale-110 group-hover/item:bg-emerald-500 group-hover/item:text-[#051a11] transition-all duration-500 shadow-lg">
                                  <sub.icon className="w-5 h-5" />
                                </div>
                                
                                <div className="relative z-10 flex-1">
                                  <span className="block text-sm font-black uppercase tracking-wider text-white group-hover/item:text-amber-300 transition-colors duration-300">
                                    {sub.name}
                                  </span>
                                  <span className="text-[9px] text-emerald-100/50 font-bold uppercase tracking-widest mt-1 block group-hover/item:text-white/80 transition-colors duration-300">
                                    {sub.name === 'Y Lý Cổ Truyền' ? 'Tinh hoa dược liệu' : 'Hệ sinh thái số'}
                                  </span>
                                </div>
                                
                                <div className="relative z-10 opacity-0 -translate-x-2 group-hover/item:opacity-60 group-hover/item:translate-x-0 transition-all duration-500">
                                  <ArrowRight className="w-4 h-4 text-white" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <img src={getAvatarUrl(user.name, user.email)} alt={user.name} className="w-full h-full object-cover grayscale-[0.2]" />
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
                        onClick={onLogout}
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
              onClick={onOpenAuth}
              className="bg-amber-400 hover:bg-amber-300 text-[#0a2e1f] px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-amber-400/20 hover:-translate-y-0.5 transition-all"
            >
              Đăng nhập
            </button>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden relative z-20 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="lg:hidden fixed inset-0 h-screen w-screen bg-[#020b07]/90 backdrop-blur-md z-[110]"
            />
            
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }} 
              animate={{ opacity: 1, y: 0, scale: 1 }} 
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="lg:hidden absolute top-[90px] left-4 right-4 bg-[#0a2e1f]/98 shadow-[0_40px_80px_rgba(0,0,0,1)] rounded-[2.5rem] border border-[var(--border-default)] overflow-hidden z-[120]"
            >
              <div className="px-6 py-8 flex flex-col gap-2 relative max-h-[75vh] overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full" />
            
            {navLinks.map((l) => (
              <div key={l.name} className="flex flex-col">
                {l.subItems ? (
                  <div className="space-y-1 mb-2">
                    <div className="text-emerald-400/40 text-[10px] font-black uppercase tracking-[0.4em] px-4 mb-3">{l.name}</div>
                    {l.subItems.map(sub => (
                      <Link
                        key={sub.name}
                        to={sub.path}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-5 text-white/90 hover:text-white hover:bg-emerald-500/10 font-bold text-lg px-5 py-5 rounded-[1.5rem] transition-all group"
                      >
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                          <sub.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest">{sub.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  l.path.startsWith('/#') || l.path.startsWith('#') ? (
                    <a
                      href={l.path}
                      onClick={(e) => {
                        setMenuOpen(false);
                        if (location.pathname === '/') {
                          e.preventDefault();
                          const id = l.path.replace('/#', '').replace('#', '');
                          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-white/90 hover:text-amber-400 font-bold text-[15px] uppercase tracking-widest px-6 py-5 rounded-[1.5rem] hover:bg-white/5 transition-all"
                    >
                      {l.name}
                    </a>
                  ) : (
                    <Link
                      to={l.path}
                      onClick={() => setMenuOpen(false)}
                      className="text-white/90 hover:text-amber-400 font-bold text-[15px] uppercase tracking-widest px-6 py-5 rounded-[1.5rem] hover:bg-white/5 transition-all"
                    >
                      {l.name}
                    </Link>
                  )
                )}
                <div className="h-[1px] bg-white/5 mx-6 my-2 last:hidden" />
              </div>
            ))}

            <div className="mt-6 pt-8 pb-12 border-t border-white/10 space-y-4">
              {user ? (
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white py-5 rounded-3xl font-bold transition-all border border-white/10 text-xs uppercase tracking-widest">
                    <User className="w-4 h-4 text-emerald-400" />
                    Hồ sơ
                  </Link>
                  <button onClick={() => { onLogout(); setMenuOpen(false); }} className="flex items-center justify-center gap-3 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 py-5 rounded-3xl font-bold transition-all border border-rose-500/10 text-xs uppercase tracking-widest">
                    <LogOut className="w-4 h-4" /> Thoát
                  </button>
                </div>
              ) : (
                <button onClick={() => { onOpenAuth(); setMenuOpen(false); }} className="w-full bg-gradient-to-r from-amber-500 to-amber-300 text-[#0a2e1f] py-6 rounded-[2rem] font-black uppercase tracking-[0.25em] text-xs shadow-2xl shadow-amber-500/40 active:scale-95 transition-all">Đăng nhập</button>
              )}
            </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
