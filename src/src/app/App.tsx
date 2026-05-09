import { ProfileHeader  } from "./components/ProfileHeader";
import { StatsBox       } from "./components/StatsBox";
import { MedicineCabinet} from "./components/MedicineCabinet";
import { SmartWidget    } from "./components/SmartWidget";
import { motion         } from "motion/react";

/* ── Data ─────────────────────────────────────────────────────────── */
const USER = { name: "Cù Minh Hưng", email: "hung.cu@email.com", badgeLevel: "Đại sứ Di sản" };
const STATS = { savedRemedies: 12, streakDays: 7, exploredLocations: 24 };
const REMEDIES = [
  { id:"1", name:"Siro Lá Lốt",   description:"Hỗ trợ điều trị ho, long đàm, tăng cường hệ miễn dịch tự nhiên hiệu quả.", ingredients:["Lá lốt","Mật ong","Gừng","Chanh"] },
  { id:"2", name:"Trà Lá Sen",    description:"Giải nhiệt, thanh lọc cơ thể, giúp thư giãn tinh thần sâu và ngủ ngon.",   ingredients:["Lá sen","Hoa sen","Trà xanh"] },
  { id:"3", name:"Cao Sả Gừng",   description:"Giảm đau nhức xương khớp, kháng viêm tự nhiên, ấm người trong mùa lạnh.", ingredients:["Sả","Gừng","Nghệ","Mật ong","Bạc hà"] },
];
const WIDGET = {
  city:"Đà Nẵng", aqi:85, aqiLevel:"Trung bình",
  suggestedRemedy:{ name:"Trà Lá Sen Thanh Lọc", reason:"Giúp thanh lọc đường hô hấp và tăng cường sức đề kháng khi không khí ô nhiễm." },
};

/* ── NAV items ─────────────────────────────────────────────────────── */
const NAV = ["Trang chủ","Bản đồ","Bài thuốc","Hồ sơ"];

/* ── Background orbs ─────────────────────────────────────────────── */
const ORBS = [
  { s:480, l:"-10%", t:"-18%", c:"radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 65%)", a:"orb-drift-1", d:"20s" },
  { s:360, l:"62%",  t:"55%",  c:"radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 65%)", a:"orb-drift-2", d:"25s" },
  { s:280, l:"38%",  t:"-8%",  c:"radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)", a:"orb-drift-3", d:"18s" },
  { s:220, l:"-4%",  t:"65%",  c:"radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 65%)", a:"orb-drift-1", d:"22s" },
  { s:200, l:"80%",  t:"8%",   c:"radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)", a:"orb-drift-2", d:"16s" },
];

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #040c06 0%, #060f08 40%, #050d07 70%, #040b05 100%)",
      position: "relative", overflowX: "hidden",
    }}>

      {/* ── Ambient orbs ── */}
      {ORBS.map((o, i) => (
        <div key={i} style={{
          position:"fixed", left:o.l, top:o.t,
          width:`${o.s}px`, height:`${o.s}px`,
          borderRadius:"50%", background:o.c,
          animation:`${o.a} ${o.d} ease-in-out infinite`,
          pointerEvents:"none", zIndex:0,
        }} />
      ))}

      {/* ── Dot-grid texture ── */}
      <div style={{
        position:"fixed", inset:0,
        backgroundImage:"radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize:"28px 28px",
        pointerEvents:"none", zIndex:0,
      }} />

      {/* ── Vignette ── */}
      <div style={{
        position:"fixed", inset:0,
        background:"radial-gradient(ellipse 80% 70% at 50% 50%, transparent 50%, rgba(2,7,4,0.55) 100%)",
        pointerEvents:"none", zIndex:0,
      }} />

      {/* ── Page ── */}
      <div style={{ position:"relative", zIndex:1, maxWidth:"1380px", margin:"0 auto", padding:"24px 28px 36px" }}>

        {/* ── Top Nav ── */}
        <motion.nav
          initial={{ opacity:0, y:-16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.55 }}
          className="panel"
          style={{
            borderRadius:"20px", marginBottom:"20px",
            padding:"0 20px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            height:"56px",
          }}
        >
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{
              width:"32px", height:"32px", borderRadius:"9px",
              background:"linear-gradient(135deg, #059669, #D4AF37)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 14px rgba(16,185,129,0.3)",
              fontSize:"0.9rem",
            }}>🌿</div>
            <div>
              <div className="gold-title" style={{ fontSize:"0.82rem", fontWeight:800, letterSpacing:"0.04em" }}>
                Di Sản Y Học
              </div>
              <div style={{ color:"rgba(240,253,244,0.25)", fontSize:"0.55rem", letterSpacing:"0.06em" }}>
                BẢO TỒN TRI THỨC CỔ TRUYỀN
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display:"flex", gap:"2px" }}>
            {NAV.map((item, i) => (
              <motion.button key={item} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                style={{
                  padding:"7px 18px", borderRadius:"12px",
                  background: i === 3 ? "rgba(16,185,129,0.12)" : "transparent",
                  border: i === 3 ? "1px solid rgba(16,185,129,0.22)" : "1px solid transparent",
                  color: i === 3 ? "#34d399" : "rgba(240,253,244,0.45)",
                  fontSize:"0.76rem", fontWeight: i === 3 ? 700 : 400,
                  cursor:"pointer",
                }}
              >{item}</motion.button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            {/* Streak badge */}
            <div style={{
              display:"flex", alignItems:"center", gap:"5px",
              padding:"5px 13px", borderRadius:"100px",
              background:"rgba(212,175,55,0.10)",
              border:"1px solid rgba(212,175,55,0.22)",
            }}>
              <span style={{ fontSize:"0.8rem", animation:"streak-burn 1.6s ease-in-out infinite" }}>🔥</span>
              <span style={{ color:"#F5C518", fontSize:"0.72rem", fontWeight:700 }}>7 ngày streak</span>
            </div>
            {/* Notification */}
            <div style={{ position:"relative" }}>
              <motion.button whileHover={{ scale:1.1 }} style={{
                width:"34px", height:"34px", borderRadius:"9px",
                background:"rgba(255,255,255,0.04)",
                border:"1px solid rgba(255,255,255,0.07)",
                display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer", fontSize:"0.9rem",
              }}>🔔</motion.button>
              <div style={{
                position:"absolute", top:"-2px", right:"-2px",
                width:"8px", height:"8px", borderRadius:"50%",
                background:"#ef4444", border:"2px solid #040c06",
                boxShadow:"0 0 5px rgba(239,68,68,0.7)",
              }} />
            </div>
          </div>
        </motion.nav>

        {/* ── Page heading ── */}
        <motion.div
          initial={{ opacity:0, x:-20 }}
          animate={{ opacity:1, x:0 }}
          transition={{ duration:0.55, delay:0.08 }}
          style={{ marginBottom:"20px", display:"flex", alignItems:"baseline", gap:"12px" }}
        >
          <h1 className="gold-title" style={{ fontSize:"1.65rem", fontWeight:800, letterSpacing:"-0.02em" }}>
            Hồ Sơ Cá Nhân
          </h1>
          <span style={{ color:"rgba(240,253,244,0.28)", fontSize:"0.8rem" }}>
            / Tổng quan hành trình di sản
          </span>
        </motion.div>

        {/* ═════════════════════════════════════════════════
            BENTO GRID – 5 columns
            Col 1  : Profile  (rows 1–2)
            Col 2–4: Stats    (row 1) | Cabinet (row 2)
            Col 5  : Widget   (rows 1–2)
        ═════════════════════════════════════════════════ */}
        <div style={{
          display:"grid",
          gridTemplateColumns:"290px repeat(3,1fr) 310px",
          gridTemplateRows:"auto auto",
          gap:"16px",
        }}>
          {/* Profile */}
          <div style={{ gridColumn:"1", gridRow:"1 / 3" }}>
            <ProfileHeader
              name={USER.name}
              email={USER.email}
              badgeLevel={USER.badgeLevel}
            />
          </div>

          {/* Stats */}
          <div style={{ gridColumn:"2 / 5", gridRow:"1" }}>
            <StatsBox
              savedRemedies={STATS.savedRemedies}
              streakDays={STATS.streakDays}
              exploredLocations={STATS.exploredLocations}
            />
          </div>

          {/* Smart Widget */}
          <div style={{ gridColumn:"5", gridRow:"1 / 3" }}>
            <SmartWidget
              city={WIDGET.city}
              aqi={WIDGET.aqi}
              aqiLevel={WIDGET.aqiLevel}
              suggestedRemedy={WIDGET.suggestedRemedy}
            />
          </div>

          {/* Medicine Cabinet */}
          <div style={{ gridColumn:"2 / 5", gridRow:"2" }}>
            <MedicineCabinet remedies={REMEDIES} />
          </div>
        </div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
          style={{
            marginTop:"28px", textAlign:"center",
            color:"rgba(240,253,244,0.18)", fontSize:"0.65rem",
            display:"flex", alignItems:"center", justifyContent:"center", gap:"12px",
          }}
        >
          <div style={{ height:"1px", flex:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.1))" }} />
          <span>© 2026 Di Sản Y Học · Bảo tồn tri thức cổ truyền Việt Nam</span>
          <div style={{ height:"1px", flex:1, background:"linear-gradient(90deg,rgba(212,175,55,0.1),transparent)" }} />
        </motion.div>
      </div>
    </div>
  );
}