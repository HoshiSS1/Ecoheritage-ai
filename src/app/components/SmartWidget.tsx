import { Wind, Sparkles, Leaf, MapPin, ArrowUpRight, Droplets, Eye, ChevronRight, Sun } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useEffect, useState, useRef } from "react";

interface SmartWidgetProps {
  city: string;
  aqi: number;
  aqiLevel: string;
  uvIndex?: number;
  humidity?: number;
  windSpeed?: number;
  suggestedRemedy: { name: string; reason: string };
}

const emerald = { main: "#10b981", light: "#34d399", dark: "#059669" };
const gold    = { main: "#D4AF37", light: "#F5C518", dark: "#92742A" };
const T = {
  p95: "rgba(240,253,244,0.95)",
  p55: "rgba(240,253,244,0.55)",
  p28: "rgba(240,253,244,0.28)",
  p14: "rgba(240,253,244,0.14)",
};

function Divider() {
  return <div className="divider" />;
}

/* ── AQI Ring Gauge ── */
function AQIGauge({ aqi, level }: { aqi: number; level: string }) {
  const ref  = useRef<SVGCircleElement>(null);
  const inView = useInView(ref as any, { once: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView) { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }
  }, [inView]);

  const getColor = (l: string) => {
    if (l === "Tốt")       return { stroke: emerald.main, text: emerald.light, label: "Tốt" };
    if (l === "Trung bình") return { stroke: gold.main,    text: gold.light,    label: "TB"  };
    return                          { stroke: "#ef4444",   text: "#f87171",     label: "Kém" };
  };

  const c      = getColor(level);
  const SIZE   = 130;
  const R      = 52;
  const ARC    = 2 * Math.PI * R * 0.72;   // 260° arc
  const CIRC   = 2 * Math.PI * R;
  const maxAQI = 200;
  const pct    = Math.min(aqi / maxAQI, 1);
  const offset = ARC - (animated ? ARC * pct : 0);

  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Track */}
        <circle cx={SIZE/2} cy={SIZE/2} r={R}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"
          strokeDasharray={`${ARC} ${CIRC - ARC}`}
          strokeDashoffset={-((CIRC - ARC) / 2)}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle ref={ref} cx={SIZE/2} cy={SIZE/2} r={R}
          fill="none" stroke={c.stroke} strokeWidth="8"
          strokeDasharray={`${ARC} ${CIRC - ARC}`}
          strokeDashoffset={offset - ((CIRC - ARC) / 2)}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1.8s cubic-bezier(0.23,1,0.32,1)",
            filter: `drop-shadow(0 0 6px ${c.stroke}90)`,
          }}
        />
        {/* Inner deco ring */}
        <circle cx={SIZE/2} cy={SIZE/2} r={38}
          fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      </svg>

      {/* Center text */}
      <div style={{
        position: "absolute",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: "1px",
      }}>
        <span style={{
          fontSize: "1.7rem", fontWeight: 800, lineHeight: 1,
          color: c.text,
          filter: `drop-shadow(0 2px 6px ${c.stroke}60)`,
        }}>
          {aqi}
        </span>
        <span style={{ color: T.p28, fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          AQI
        </span>
      </div>
    </div>
  );
}

/* ── Env row item ── */
function EnvRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 0",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon size={13} style={{ color, opacity: 0.8 }} />
        <span style={{ color: T.p55, fontSize: "0.72rem" }}>{label}</span>
      </div>
      <span style={{ color: T.p95, fontSize: "0.72rem", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

export function SmartWidget({ city, aqi, aqiLevel, uvIndex, humidity, windSpeed, suggestedRemedy }: SmartWidgetProps) {
  const now     = new Date();
  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });

  const getAqiBadge = (l: string) => {
    if (l === "Tốt")       return { bg: `${emerald.dark}28`, border: `${emerald.main}35`, text: emerald.light };
    if (l === "Trung bình") return { bg: `${gold.dark}28`,    border: `${gold.main}40`,    text: gold.light };
    return                          { bg: "rgba(239,68,68,0.18)", border: "rgba(239,68,68,0.3)", text: "#f87171" };
  };

  const badge = getAqiBadge(aqiLevel);

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
      className="panel"
      style={{
        borderRadius: "28px", padding: "24px",
        height: "100%", display: "flex", flexDirection: "column", gap: "16px",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* ambient */}
      <div style={{
        position: "absolute", bottom: "-60px", left: "-40px",
        width: "220px", height: "220px", borderRadius: "50%",
        background: `radial-gradient(circle, ${emerald.main}0a 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "-40px", right: "-40px",
        width: "180px", height: "180px", borderRadius: "50%",
        background: `radial-gradient(circle, ${gold.main}0a 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "11px",
            background: `rgba(6,182,212,0.14)`,
            border: `1px solid rgba(6,182,212,0.25)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(6,182,212,0.15)",
          }}>
            <Wind size={16} style={{ color: "#67e8f9" }} />
          </div>
          <div>
            <div style={{ color: T.p95, fontSize: "0.85rem", fontWeight: 700, lineHeight: 1 }}>Môi trường</div>
            <div style={{ display: "flex", alignItems: "center", gap: "3px", marginTop: "2px" }}>
              <MapPin size={9} style={{ color: T.p28 }} />
              <span style={{ color: T.p28, fontSize: "0.65rem" }}>{city}</span>
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: T.p95, fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}>{timeStr}</div>
          <div style={{ color: T.p28, fontSize: "0.6rem", marginTop: "2px" }}>{dateStr}</div>
        </div>
      </div>

      <Divider />

      {/* ── AQI Section ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
      }}>
        <AQIGauge aqi={aqi} level={aqiLevel} />

        {/* AQI badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "5px",
            padding: "4px 12px", borderRadius: "100px",
            background: badge.bg, border: `1px solid ${badge.border}`,
          }}>
            <div style={{
              width: "5px", height: "5px", borderRadius: "50%",
              background: badge.text,
              animation: "pulse-glow 1.5s ease-in-out infinite",
              boxShadow: `0 0 6px ${badge.text}`,
            }} />
            <span style={{ color: badge.text, fontSize: "0.7rem", fontWeight: 700 }}>{aqiLevel}</span>
          </div>
          <span style={{ color: T.p28, fontSize: "0.65rem" }}>hôm nay</span>
        </div>
      </div>

      {/* ── Env details ── */}
      <div style={{
        borderRadius: "16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        padding: "4px 14px",
      }}>
        <EnvRow icon={Droplets} label="Độ ẩm"  value={humidity !== undefined ? `${humidity}%` : "72%"} color="#67e8f9" />
        <div className="divider" />
        <EnvRow icon={Wind}     label="Gió"    value={windSpeed !== undefined ? `${windSpeed} m/s` : "12 km/h"} color={emerald.light} />
        <div className="divider" />
        <EnvRow icon={Sun}      label="Chỉ số UV" value={uvIndex !== undefined ? uvIndex.toString() : "4"} color={gold.main} />
      </div>

      <Divider />

      {/* ── AI Suggestion ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Sparkles size={12} style={{ color: gold.main, filter: `drop-shadow(0 0 4px ${gold.main})` }} />
          <span style={{ color: gold.main, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" }}>
            Gợi ý thông minh
          </span>
        </div>

        <p style={{ color: T.p55, fontSize: "0.7rem", lineHeight: 1.55 }}>
          Với chất lượng không khí <span style={{ color: badge.text, fontWeight: 600 }}>{aqiLevel.toLowerCase()}</span>{" "}
          hôm nay, chúng tôi gợi ý:
        </p>

        <motion.div
          whileHover={{ scale: 1.02, x: 3 }}
          style={{
            padding: "12px",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${gold.dark}14, ${gold.main}08)`,
            border: `1px solid ${gold.main}20`,
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "9px", flexShrink: 0, marginTop: "1px",
              background: `${emerald.dark}20`,
              border: `1px solid ${emerald.main}28`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Leaf size={14} style={{ color: emerald.light }} />
            </div>
            <div>
              <div style={{ color: T.p95, fontSize: "0.8rem", fontWeight: 700, marginBottom: "4px", lineHeight: 1.2 }}>
                {suggestedRemedy.name}
              </div>
              <div style={{ color: T.p55, fontSize: "0.67rem", lineHeight: 1.5 }}>
                {suggestedRemedy.reason}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        <motion.button
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: "100%", padding: "11px 0",
            borderRadius: "14px",
            background: `linear-gradient(135deg, ${emerald.dark}, ${emerald.main})`,
            border: "none", color: "#fff",
            fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            boxShadow: `0 6px 20px ${emerald.main}35`,
          }}
        >
          Xem chi tiết bài thuốc
          <ArrowUpRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
}