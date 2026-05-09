import { Award, Edit3, LogOut, Zap, Calendar, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatarUrl?: string;
  badgeLevel: string;
}

const AVATAR_SRC =
  "https://images.unsplash.com/photo-1734669578512-91222908a263?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400";

const WEEK_ACTIVITY = [
  { day: "T2", active: true  },
  { day: "T3", active: true  },
  { day: "T4", active: true  },
  { day: "T5", active: true  },
  { day: "T6", active: false },
  { day: "T7", active: true  },
  { day: "CN", active: true  },
];

const XP = { current: 680, max: 1000, level: 12 };

/* ── micro utility ── */
const T = {
  p95:  "rgba(240,253,244,0.95)",
  p55:  "rgba(240,253,244,0.55)",
  p30:  "rgba(240,253,244,0.30)",
  p16:  "rgba(240,253,244,0.16)",
};
const emerald = { main: "#10b981", light: "#34d399", dark: "#059669" };
const gold    = { main: "#D4AF37", light: "#F5C518", dark: "#92742A" };

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      color: T.p30, fontSize: "0.62rem", fontWeight: 700,
      letterSpacing: "0.1em", textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

function Divider() {
  return <div className="divider" />;
}

function XpBar() {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW((XP.current / XP.max) * 100), 600); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Zap size={12} style={{ color: gold.main }} />
          <Label>Kinh nghiệm</Label>
        </div>
        <span style={{ color: gold.main, fontSize: "0.7rem", fontWeight: 700 }}>
          Cấp {XP.level}
        </span>
      </div>

      <div style={{
        height: "5px", borderRadius: "100px",
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
        position: "relative",
      }}>
        <motion.div
          animate={{ width: `${w}%` }}
          transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
          style={{
            position: "absolute", inset: "0 auto 0 0",
            height: "100%", borderRadius: "100px",
            background: `linear-gradient(90deg, ${emerald.dark}, ${emerald.main}, #a7f3d0)`,
            boxShadow: `0 0 8px ${emerald.main}80`,
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: T.p30, fontSize: "0.66rem" }}>
          {XP.current.toLocaleString()} XP
        </span>
        <span style={{ color: T.p30, fontSize: "0.66rem" }}>
          {XP.max.toLocaleString()} XP → Cấp {XP.level + 1}
        </span>
      </div>
    </div>
  );
}

function WeekActivity() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Calendar size={12} style={{ color: T.p30 }} />
        <Label>Hoạt động 7 ngày qua</Label>
      </div>
      <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
        {WEEK_ACTIVITY.map(({ day, active }, i) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.4, delay: 0.8 + i * 0.06, ease: "backOut" }}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}
          >
            <div style={{
              width: "100%",
              height: active ? "28px" : "14px",
              borderRadius: "6px",
              background: active
                ? `linear-gradient(180deg, ${emerald.light}, ${emerald.main})`
                : "rgba(255,255,255,0.07)",
              boxShadow: active ? `0 0 8px ${emerald.main}60` : "none",
              transition: "all 0.3s",
            }} />
            <span style={{
              color: active ? T.p55 : T.p30,
              fontSize: "0.58rem", fontWeight: active ? 600 : 400,
            }}>
              {day}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ProfileHeader({ name, email, badgeLevel, avatarUrl }: ProfileHeaderProps) {
  const src = avatarUrl || AVATAR_SRC;

  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
      className="panel"
      style={{
        borderRadius: "28px", padding: "28px",
        height: "100%", display: "flex", flexDirection: "column", gap: "20px",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* subtle bg glow */}
      <div style={{
        position: "absolute", top: "-80px", right: "-80px",
        width: "260px", height: "260px", borderRadius: "50%",
        background: `radial-gradient(circle, ${emerald.main}12 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* ── Avatar ── */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
        <div style={{ position: "relative" }}>
          {/* spinning gold ring */}
          <div style={{
            position: "absolute", inset: "-5px", borderRadius: "50%",
            background: `conic-gradient(${gold.light}, ${gold.main}, ${gold.dark}, ${gold.main}, ${gold.light})`,
            animation: "ring-spin 10s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: "-2px", borderRadius: "50%",
            background: "rgba(10,24,14,1)",
          }} />
          <div style={{
            position: "relative", width: "96px", height: "96px",
            borderRadius: "50%", overflow: "hidden", zIndex: 1,
          }}>
            <img src={src} alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, transparent 50%, rgba(10,24,14,0.4) 100%)",
            }} />
          </div>

          {/* online dot */}
          <div style={{
            position: "absolute", bottom: "4px", right: "4px", zIndex: 2,
            width: "13px", height: "13px", borderRadius: "50%",
            background: emerald.light,
            border: "2px solid rgba(10,24,14,1)",
            boxShadow: `0 0 8px ${emerald.main}`,
            animation: "pulse-glow 2s ease-in-out infinite",
          }} />
        </div>

        {/* Name */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
          <h1 className="gold-title" style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.01em" }}>
            {name}
          </h1>
          <p style={{ color: T.p30, fontSize: "0.75rem" }}>{email}</p>

          {/* Badge */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              padding: "5px 14px", borderRadius: "100px", cursor: "default",
              background: `linear-gradient(135deg, ${gold.dark}28, ${gold.main}14)`,
              border: `1px solid ${gold.main}35`,
              boxShadow: `0 0 16px ${gold.main}18`,
              alignSelf: "center",
            }}
          >
            <Award size={11} style={{ color: gold.main }} />
            <span style={{ color: gold.main, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" }}>
              {badgeLevel}
            </span>
            <Star size={9} style={{ color: gold.main, fill: gold.main }} />
          </motion.div>
        </div>
      </div>

      <Divider />

      {/* ── XP Bar ── */}
      <XpBar />

      <Divider />

      {/* ── Week Activity ── */}
      <WeekActivity />

      {/* ── Milestones row ── */}
      <div style={{
        display: "flex", gap: "8px",
        padding: "12px", borderRadius: "14px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        {[
          { icon: "🌿", label: "Thảo dược sơ cấp", earned: true },
          { icon: "🏛️", label: "Di sản nhà thám hiểm", earned: true },
          { icon: "🔥", label: "Streak 7 ngày",   earned: true },
          { icon: "⭐", label: "Cấp cao tiếp theo", earned: false },
        ].map(({ icon, label, earned }) => (
          <div key={label} title={label} style={{
            flex: 1, aspectRatio: "1",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "10px", fontSize: "1.1rem",
            background: earned ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${earned ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"}`,
            opacity: earned ? 1 : 0.3,
          }}>
            {icon}
          </div>
        ))}
      </div>

      {/* spacer */}
      <div style={{ flex: 1 }} />

      {/* ── Actions ── */}
      <div style={{ display: "flex", gap: "8px" }}>
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", gap: "6px",
            padding: "10px 0", borderRadius: "14px",
            background: `linear-gradient(135deg, ${emerald.dark}28, ${emerald.main}14)`,
            border: `1px solid ${emerald.main}30`,
            color: emerald.light, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
            boxShadow: `0 4px 12px ${emerald.main}14`,
          }}
        >
          <Edit3 size={13} /> Chỉnh sửa
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1, display: "flex", alignItems: "center",
            justifyContent: "center", gap: "6px",
            padding: "10px 0", borderRadius: "14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: T.p30, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
          }}
        >
          <LogOut size={13} /> Đăng xuất
        </motion.button>
      </div>
    </motion.div>
  );
}
