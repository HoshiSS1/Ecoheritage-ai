import { Heart, ArrowRight, Leaf, Sparkles, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Remedy {
  id:          string;
  name:        string;
  description: string;
  ingredients: string[];
  imageUrl?:   string;
}
interface MedicineCabinetProps { remedies: Remedy[]; }

const emerald = { main: "#10b981", light: "#34d399", dark: "#059669" };
const gold    = { main: "#D4AF37", light: "#F5C518" };
const T = {
  p95: "rgba(240,253,244,0.95)",
  p55: "rgba(240,253,244,0.55)",
  p28: "rgba(240,253,244,0.28)",
};

/* Images for each remedy slot */
const IMAGES = [
  "https://images.unsplash.com/photo-1677146332601-1bf0e7e37a3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1697506529269-22e50e2a941c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1717769071502-e9b5d06c5fc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1521364921183-0f5135b59191?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  "https://images.unsplash.com/photo-1549017377-110ba4d5b85b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
];

/* ── Remedy Card ──────────────────────────────────────────────────── */
function RemedyCard({ remedy, index }: { remedy: Remedy; index: number }) {
  const [liked, setLiked] = useState(true);
  const img = remedy.imageUrl ?? IMAGES[index % IMAGES.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 + index * 0.08, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -6 }}
      className="panel"
      style={{
        flexShrink: 0, width: "200px",
        borderRadius: "20px", overflow: "hidden", cursor: "pointer",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: "120px", overflow: "hidden" }}>
        <motion.img
          whileHover={{ scale: 1.07 }}
          transition={{ duration: 0.5 }}
          src={img} alt={remedy.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {/* gradient fade */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 30%, rgba(10,24,14,0.85) 100%)",
        }} />
        {/* top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: `linear-gradient(90deg, transparent, ${emerald.main}, transparent)`,
          opacity: 0.7,
        }} />

        {/* Heart */}
        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          style={{
            position: "absolute", top: "8px", right: "8px",
            width: "28px", height: "28px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: liked ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.1)",
            border: `1px solid ${liked ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.15)"}`,
            backdropFilter: "blur(8px)",
            boxShadow: liked ? "0 0 10px rgba(239,68,68,0.25)" : "none",
            cursor: "pointer",
          }}
        >
          <Heart size={12} style={{
            color: liked ? "#f87171" : "rgba(255,255,255,0.5)",
            fill: liked ? "#f87171" : "none",
          }} />
        </motion.button>
      </div>

      {/* Body */}
      <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ color: T.p95, fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.25 }}>
          {remedy.name}
        </div>
        <div style={{
          color: T.p55, fontSize: "0.7rem", lineHeight: 1.55,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {remedy.description}
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {remedy.ingredients.slice(0, 2).map((ing, k) => (
            <span key={k} style={{
              padding: "3px 8px", borderRadius: "100px",
              background: `${emerald.dark}18`,
              border: `1px solid ${emerald.main}28`,
              color: emerald.light,
              fontSize: "0.62rem", fontWeight: 500,
            }}>
              {ing}
            </span>
          ))}
          {remedy.ingredients.length > 2 && (
            <span style={{
              padding: "3px 8px", borderRadius: "100px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: T.p28, fontSize: "0.62rem",
            }}>
              +{remedy.ingredients.length - 2}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Add-more card ─────────────────────────────────────────────────── */
function AddCard() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      style={{
        flexShrink: 0, width: "90px",
        borderRadius: "20px",
        border: `1.5px dashed ${gold.main}22`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "8px",
        cursor: "pointer", minHeight: "240px",
        background: `${gold.main}04`,
      }}
    >
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: `${gold.dark}18`,
        border: `1px solid ${gold.main}28`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Plus size={14} style={{ color: `${gold.main}80` }} />
      </div>
      <span style={{
        color: `${gold.main}60`, fontSize: "0.6rem",
        textAlign: "center", padding: "0 10px", lineHeight: 1.4,
      }}>
        Thêm bài thuốc
      </span>
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────────────────── */
export function MedicineCabinet({ remedies }: MedicineCabinetProps) {
  if (remedies.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="panel"
        style={{
          borderRadius: "28px", padding: "48px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "16px", minHeight: "220px",
        }}
      >
        <div style={{
          width: "64px", height: "64px", borderRadius: "20px",
          background: `${emerald.dark}18`,
          border: `1px solid ${emerald.main}25`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Leaf size={28} style={{ color: `${emerald.main}60` }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: T.p55, fontSize: "0.9rem", marginBottom: "6px" }}>Tủ thuốc đang trống</p>
          <p style={{ color: T.p28, fontSize: "0.78rem" }}>Khám phá bản đồ di sản để thêm bài thuốc</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="panel"
      style={{ borderRadius: "28px", padding: "24px", position: "relative", overflow: "hidden" }}
    >
      {/* ambient glow */}
      <div style={{
        position: "absolute", bottom: "-60px", left: "40%",
        width: "300px", height: "200px", borderRadius: "50%",
        background: `radial-gradient(circle, ${emerald.main}08 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "12px",
            background: `${emerald.dark}22`,
            border: `1px solid ${emerald.main}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 12px ${emerald.main}18`,
          }}>
            <Leaf size={18} style={{ color: emerald.light }} />
          </div>
          <div>
            <h2 style={{ color: T.p95, fontWeight: 700, fontSize: "1rem", lineHeight: 1.1 }}>
              Tủ Thuốc Của Tôi
            </h2>
            <p style={{ color: T.p28, fontSize: "0.68rem", marginTop: "2px" }}>
              Bộ sưu tập hoạt động
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "5px 12px", borderRadius: "100px",
            background: `${emerald.dark}18`,
            border: `1px solid ${emerald.main}28`,
          }}>
            <Sparkles size={11} style={{ color: emerald.light }} />
            <span style={{ color: emerald.light, fontSize: "0.7rem", fontWeight: 600 }}>
              {remedies.length} hoạt động
            </span>
          </div>
          <motion.button
            whileHover={{ gap: "8px", x: 2 }}
            style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "none", border: "none", cursor: "pointer",
              color: T.p28, fontSize: "0.7rem",
            }}
          >
            Xem tất cả <ArrowRight size={12} />
          </motion.button>
        </div>
      </div>

      {/* ── Scroll ── */}
      <div
        className="luxury-scroll"
        style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "6px" }}
      >
        {remedies.map((r, i) => (
          <RemedyCard key={r.id} remedy={r} index={i} />
        ))}
        <AddCard />
      </div>
    </motion.div>
  );
}
