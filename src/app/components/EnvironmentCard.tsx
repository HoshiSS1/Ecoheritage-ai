import { useState } from 'react';
import { LucideIcon, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { StatusBadge } from './StatusBadge';
import { AnimatedCounter } from './AnimatedCounter';
import { Link } from 'react-router';

interface EnvironmentCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  status: 'good' | 'moderate' | 'unhealthy' | 'hazardous';
  description: string;
  index?: number;
}

const statusConfig = {
  good: { ring: 'from-emerald-400 to-emerald-600', badge: 'emerald' as const, label: 'Tốt', glow: 'emerald' as const },
  moderate: { ring: 'from-amber-400 to-amber-600', badge: 'amber' as const, label: 'Khá ổn', glow: 'amber' as const },
  unhealthy: { ring: 'from-orange-400 to-orange-600', badge: 'orange' as const, label: 'Rất cao', glow: 'amber' as const },
  hazardous: { ring: 'from-rose-500 to-rose-700', badge: 'rose' as const, label: 'Nguy hại', glow: 'rose' as const },
};

// Hàm gợi ý bài thuốc động sử dụng văn phong học thuật Y lý Cổ truyền chuẩn xác nhất
const getRemedyRecommendation = (title: string, status: string) => {
  const t = title.toLowerCase();
  const s = status.toLowerCase();
  
  if (t.includes('aqi') || t.includes('không khí')) {
    if (s === 'good') {
      return {
        name: 'Nước Sả Chanh Gừng',
        benefit: 'Hỗ trợ ôn trung chỉ khái, tuyên phế khí và tăng cường vệ khí hàng ngày.',
        link: '/heritage'
      };
    }
    if (s === 'moderate') {
      return {
        name: 'Trà Lá Sen Mật Ong',
        benefit: 'Hỗ trợ thanh nhiệt, hóa đàm, bổ phế quản và bảo vệ phế hệ trước khói bụi.',
        link: '/heritage'
      };
    }
    if (s === 'unhealthy') {
      return {
        name: 'Siro Lá Lốt Mật Ong',
        benefit: 'Tuyên phế, ôn trung, bổ phế quản, giúp hóa đàm chỉ khái và dịu đường hô hấp.',
        link: '/heritage'
      };
    }
    return {
      name: 'Xông Hơi Tinh Dầu Bạc Hà',
      benefit: 'Tuyên phế thông khiếu, phát tán phong nhiệt, sát trùng phế hệ khi khí cực đoan.',
      link: '/heritage'
    };
  }
  
  if (t.includes('uv')) {
    if (s === 'good') {
      return {
        name: 'Trà Hoa Cúc La Mã',
        benefit: 'Tư âm nhuận táo, dưỡng can minh mục (mát gan sáng mắt) dưới nắng nhẹ.',
        link: '/heritage'
      };
    }
    if (s === 'moderate') {
      return {
        name: 'Nước Đậu Đen Rang',
        benefit: 'Bổ thận thủy, thanh nhiệt tả hỏa, bổ sung tân dịch hao tổn do thời tiết.',
        link: '/heritage'
      };
    }
    if (s === 'unhealthy') {
      return {
        name: 'Nha Đam Đường Phèn',
        benefit: 'Tả hỏa mát gan cực tốt, sinh tân chỉ khát và dưỡng huyết xoa dịu làn da bỏng nắng.',
        link: '/heritage'
      };
    }
    return {
      name: 'Canh Khổ Qua Xương Sen',
      benefit: 'Thanh hỏa giải thử, tả can hỏa (làm mát tỳ vị can đởm) trong tiết trời đại nhiệt.',
      link: '/heritage'
    };
  }
  
  if (t.includes('ẩm')) {
    if (s === 'good') {
      return {
        name: 'Nước Vối Tươi',
        benefit: 'Kích thích tỳ vị tiêu hóa, thanh nhiệt lợi thấp trong độ ẩm lý tưởng.',
        link: '/heritage'
      };
    }
    if (s === 'moderate') {
      return {
        name: 'Trà Tâm Sen',
        benefit: 'Thanh tâm trừ phiền, định chí an thần, điều hòa tạng phủ ngủ sâu giấc.',
        link: '/heritage'
      };
    }
    return {
      name: 'Nước Tía Tô Đường Phèn',
      benefit: 'Tuyên phế giải biểu, phát tán phong hàn và hạn chế mẩn ngứa do thấp nhiệt.',
      link: '/heritage'
    };
  }
  
  if (t.includes('gió')) {
    if (s === 'good') {
      return {
        name: 'Nước Ép Diếp Cá',
        benefit: 'Thanh can giải độc, lương huyết chỉ huyết giúp tạng phủ luôn thanh mát nhẹ nhàng.',
        link: '/heritage'
      };
    }
    return {
      name: 'Trà Gừng Mật Ong',
      benefit: 'Ôn trung khứ hàn, làm ấm tỳ vị tạng phủ và phát tán phong hàn phòng trúng gió.',
      link: '/heritage'
    };
  }
  
  return null;
};

export function EnvironmentCard({ icon: Icon, title, value, status, description, index = 0 }: EnvironmentCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const s = statusConfig[status];

  // Xử lý trích xuất số nhảy (hỗ trợ cả các giá trị chuỗi chứa '%' như "72%")
  let isNumeric = typeof value === 'number' || !isNaN(Number(value));
  let numValue = isNumeric ? Number(value) : 0;
  let suffix = '';

  if (typeof value === 'string' && value.endsWith('%')) {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      isNumeric = true;
      numValue = parsed;
      suffix = '%';
    }
  }

  const remedy = getRemedyRecommendation(title, status);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`card-flip-container ${isFlipped ? 'is-flipped' : ''}`}
      onClick={handleCardClick}
    >
      <div className="card-flip-inner">
        
        {/* ==========================================
            MẶT TRƯỚC (FRONT SIDE) - THOÁNG ĐẠT & SANG TRỌNG
            ========================================== */}
        <div className="card-flip-front">
          <GlassCard
            glow={s.glow}
            delay={index * 0.1}
            hoverLift={false} // Tắt hover nâng để tránh giật hình khi lật 3D
            className="group flex flex-col h-full p-3.5 sm:p-6 cursor-default border border-white/10 relative overflow-hidden"
          >
            {/* Quầng sáng Aurora chuyển động phía sau */}
            <div className={`absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br ${s.ring} opacity-25 blur-3xl pointer-events-none aurora-glow`} />

            <div className="flex-1 flex flex-col justify-between relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-[var(--radius-lg)] bg-gradient-to-br ${s.ring} p-2 sm:p-2.5 shadow-lg transform group-hover:rotate-12 transition-transform duration-500`}>
                  <div className="absolute inset-0 bg-white/20 rounded-[var(--radius-lg)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="w-full h-full text-white relative z-10 drop-shadow-md" />
                </div>
                <StatusBadge
                  variant={s.badge}
                  label={s.label}
                  pulse={true}
                />
              </div>

              {/* Title & Value */}
              <div className="my-auto py-2">
                <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
                <div className="font-display text-3xl sm:text-6xl font-bold text-white tracking-tighter group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-emerald-200 transition-all duration-500 leading-none truncate max-w-full">
                  {isNumeric ? (
                    <AnimatedCounter target={numValue} duration={1500} suffix={suffix} decimals={Number.isInteger(numValue) ? 0 : 1} />
                  ) : (
                    value || '0'
                  )}
                </div>
              </div>

              {/* Footer Gợi ý */}
              <div className="border-t border-white/10 pt-4 mt-2 flex items-center justify-between text-xs text-white/40 group-hover:text-emerald-400 transition-colors">
                <span className="font-medium tracking-wide">Xem gợi ý sức khỏe</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ==========================================
            MẶT SAU (BACK SIDE) - LỜI KHUYÊN & THẢO DƯỢC (CỠ CHỮ NÂNG CẤP LỚN HƠN DỄ ĐỌC)
            ========================================== */}
        <div className="card-flip-back">
          <GlassCard
            glow={s.glow}
            noReveal={true}
            hoverLift={false}
            className="flex flex-col h-full p-3.5 sm:p-6 cursor-default border border-white/10 bg-[#030d08]/60 backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Quầng sáng Aurora chuyển động phía sau */}
            <div className={`absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-gradient-to-br ${s.ring} opacity-15 blur-3xl pointer-events-none aurora-glow`} />

            <div className="flex-1 flex flex-col justify-between relative z-10 h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-xs sm:text-[13px] font-black text-emerald-400 uppercase tracking-widest">Lời khuyên hôm nay</span>
                <StatusBadge variant={s.badge} label={s.label} pulse={false} />
              </div>

              {/* Description (Đã tăng kích cỡ to rõ ràng, vừa vặn mắt người nhìn theo screenshot hình 1) */}
              <div className="flex-1 flex flex-col justify-start overflow-y-auto custom-scrollbar max-h-[110px] mb-4 pr-1">
                <p className="text-[12px] sm:text-[14px] text-white/95 leading-relaxed font-normal tracking-wide drop-shadow-sm">
                  {description}
                </p>
              </div>

              {/* WOW Remedy Section (Đã tăng cỡ chữ bài thuốc lên to rõ, nổi bật) */}
              {remedy && (
                <div 
                  className="border border-amber-500/25 bg-amber-500/5 p-2 sm:p-3.5 rounded-xl mb-4 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all duration-300 transform hover:-translate-y-0.5"
                  onClick={(e) => {
                    // Ngăn chặn việc bấm vào bài thuốc làm lật ngược lại thẻ
                    e.stopPropagation();
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 text-[9px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 animate-pulse" />
                    <span>Dược liệu khuyến nghị</span>
                  </div>
                  <h4 className="text-[12px] sm:text-[15px] font-extrabold text-white mb-1 tracking-tight">{remedy.name}</h4>
                  <p className="text-[10px] sm:text-[13px] text-white/80 font-normal leading-relaxed line-clamp-2">{remedy.benefit}</p>
                  
                  <Link 
                    to={remedy.link}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[13px] font-extrabold text-amber-300 hover:text-amber-200 mt-2.5 transition-colors group/remedy-btn"
                  >
                    <span>Khám phá kho thảo dược</span>
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover/remedy-btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}

              {/* Footer Quay lại */}
              <div className="border-t border-white/10 pt-3 flex items-center justify-center gap-2 text-xs text-white/40 hover:text-emerald-400 transition-colors">
                <RotateCcw className="w-3.5 h-3.5 animate-spin-slow" />
                <span className="font-bold tracking-wide">Chạm để lật lại mặt trước</span>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}
