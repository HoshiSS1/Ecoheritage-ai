import { BookMarked, Flame, MapPin, TrendingUp, ChevronRight } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef, useEffect, useState } from "react";

interface StatsBoxProps {
  savedRemedies: number;
  streakDays: number;
  exploredLocations: number;
}

const emerald = { main: "#10b981", light: "#34d399", dark: "#059669" };
const gold    = { main: "#D4AF37", light: "#F5C518", dark: "#92742A" };

const T = {
  p95: "rgba(240,253,244,0.95)",
  p55: "rgba(240,253,244,0.55)",
  p28: "rgba(240,253,244,0.28)",
  p14: "rgba(240,253,244,0.14)",
};

/* ── Counter ── */
function Counter({ to, delay = 0 }: { to: number; delay?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const tid = setTimeout(() => {
      let start = 0;
      const dur = 1200;
      const step = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        setN(Math.round((1 - (1 - p) ** 3) * to));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(tid);
  }, [inView, to, delay]);

  return <span ref={ref}>{n}</span>;
}

/* ── Circular mini-gauge ── */
function Ring({
  pct, color, size = 54, stroke = 5,
}: {
  pct: number; color: string; size?: number; stroke?: number;
}) {
  const [p, setP] = useState(0);
  const ref = useRef<SVGCircleElement>(null);
  const inView = useInView(ref as any, { once: true });
  useEffect(() => { if (inView) { const t = setTimeout(() => setP(pct), 400); return () => clearTimeout(t); } }, [inView, pct]);

  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ * (1 - p / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle ref={ref} cx={size/2} cy={size/2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={off}
        strokeLinecap="round"
        style={{
          transition: "stroke-dashoffset 1.5s cubic-bezier(0.23,1,0.32,1)",
          filter: `drop-shadow(0 0 4px ${color}80)`,
        }}
      />
    </svg>
  );
}

interface StatItem {
  key: "savedRemedies" | "streakDays" | "exploredLocations";
  Icon: any;
  label: string;
  sub: string;
  color: string;
  glow: string;
  pctOf: number;
  trend: string;
  bg: string;
  border: string;
  delay: number;
  isGold?: boolean;
}

const STATS: StatItem[] = [
  {
    key:   "savedRemedies" as const,
    Icon:  BookMarked,
    label: "Bài thuốc đã lưu",
    sub:   "trong tổng số 20 mục tiêu",
    color: emerald.light,
    glow:  emerald.main,
    pctOf: 20,
    trend: "+3 tuần này",
    bg:    `${emerald.dark}12`,
    border:`${emerald.main}20`,
    delay: 0,
  },
  {
    key:   "streakDays" as const,
    Icon:  Flame,
    label: "Ngày streak liên tiếp",
    sub:   "tiến tới huy hiệu 14 ngày",
    color: gold.light,
    glow:  gold.main,
    pctOf: 14,
    trend: "Kỷ lục cá nhân!",
    bg:    `${gold.dark}16`,
    border:`${gold.main}28`,
    delay: 100,
    isGold: true,
  },
  {
    key:   "exploredLocations" as const,
    Icon:  MapPin,
    label: "Địa danh khám phá",
    sub:   "trên tổng 30 địa điểm",
    color: emerald.light,
    glow:  emerald.main,
    pctOf: 30,
    trend: "+2 địa điểm mới",
    bg:    `${emerald.dark}12`,
    border:`${emerald.main}20`,
    delay: 200,
  },
];

export function StatsBox({ savedRemedies, streakDays, exploredLocations }: StatsBoxProps) {
  const vals: Record<string, number> = { savedRemedies, streakDays, exploredLocations };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", height: "100%" }}>
      {STATS.map((s, i) => {
        const val = vals[s.key];
        const pct = Math.round(Math.min(val / s.pctOf, 1) * 100);

        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ y: -6 }}
            className={`panel panel-lift${s.isGold ? " stat-card-gold" : ""}`}
            style={{
              borderRadius: "24px", padding: "24px",
              display: "flex", flexDirection: "column", gap: "16px",
              position: "relative", overflow: "hidden",
              background: `linear-gradient(145deg, ${s.bg} 0%, rgba(10,24,14,0.92) 100%)`,
            }}
          >
            {/* corner glow */}
            <div style={{
              position: "absolute", top: "-40px", right: "-40px",
              width: "120px", height: "120px", borderRadius: "50%",
              background: `radial-gradient(circle, ${s.glow}18 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />

            {/* ── Top row: number + ring ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{
                  fontSize: "2.6rem", fontWeight: 800, lineHeight: 1,
                  color: s.color,
                  filter: `drop-shadow(0 2px 8px ${s.glow}50)`,
                }}>
                  <Counter to={val} delay={s.delay} />
                </div>
                <div style={{ color: T.p28, fontSize: "0.65rem", marginTop: "3px" }}>{s.sub}</div>
              </div>
              <Ring pct={pct} color={s.color} />
            </div>

            {/* ── Icon + label ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "32px", height: "32px", borderRadius: "10px",
                background: `${s.glow}18`,
                border: `1px solid ${s.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {s.key === "streakDays"
                  ? <Flame size={16} style={{ color: s.color, animation: "streak-burn 1.6s ease-in-out infinite" }} />
                  : <s.Icon size={16} style={{ color: s.color }} />
                }
              </div>
              <span style={{
                color: T.p55, fontSize: "0.76rem", fontWeight: 500,
                lineHeight: 1.3,
              }}>
                {s.label}
              </span>
            </div>

            {/* ── Progress bar ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: T.p28, fontSize: "0.62rem" }}>Tiến độ</span>
                <span style={{ color: s.color, fontSize: "0.65rem", fontWeight: 700 }}>{pct}%</span>
              </div>
              <div style={{
                height: "4px", borderRadius: "100px",
                background: "rgba(255,255,255,0.05)",
                overflow: "hidden",
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.4, delay: 0.6 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  style={{
                    height: "100%", borderRadius: "100px",
                    background: s.key === "streakDays"
                      ? `linear-gradient(90deg, ${gold.dark}, ${gold.main}, ${gold.light})`
                      : `linear-gradient(90deg, ${emerald.dark}, ${emerald.main}, ${emerald.light})`,
                    boxShadow: `0 0 6px ${s.glow}60`,
                  }}
                />
              </div>
            </div>

            {/* ── Trend ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <TrendingUp size={11} style={{ color: s.color, opacity: 0.8 }} />
                <span style={{ color: T.p28, fontSize: "0.64rem" }}>{s.trend}</span>
              </div>
              <motion.div
                whileHover={{ x: 3 }}
                style={{ cursor: "pointer", color: T.p14, display: "flex", alignItems: "center" }}
              >
                <ChevronRight size={14} />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
