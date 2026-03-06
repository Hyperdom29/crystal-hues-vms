import { useState, useEffect, useCallback } from "react";

const API = `${import.meta.env.VITE_API_URL}/api`;

/* ═══════════════════════════════════════════════════
   DESIGN TOKENS — Crystal Hues VMS
═══════════════════════════════════════════════════ */
const C = {
  bg:         "#06101D",
  surf:       "#0B1829",
  card:       "#0F1E30",
  elev:       "#152435",
  border:     "#1A2E44",
  borderHi:   "#243D58",
  orange:     "#E8601A",
  orangeHi:   "#F07230",
  orangeDim:  "rgba(232,96,26,0.12)",
  orangeGlow: "rgba(232,96,26,0.06)",
  white:      "#FFFFFF",
  t1:         "#EDF3F8",
  t2:         "#7896B2",
  t3:         "#3A5268",
  ok:         "#22C55E",
  okDim:      "rgba(34,197,94,0.1)",
  warn:       "#F59E0B",
  warnDim:    "rgba(245,158,11,0.1)",
  err:        "#EF4444",
  errDim:     "rgba(239,68,68,0.08)",
  blue:       "#60A5FA",
  blueDim:    "rgba(96,165,250,0.12)",
  purple:     "#C084FC",
  purpleDim:  "rgba(192,132,252,0.12)",
  pink:       "#F472B6",
  pinkDim:    "rgba(244,114,182,0.12)",
  teal:       "#2DD4BF",
  tealDim:    "rgba(45,212,191,0.12)",
};

const TYPE_META = {
  "Translator":       { color: C.blue,   dim: C.blueDim },
  "Transcriptionist": { color: C.purple, dim: C.purpleDim },
  "Voice Artist":     { color: C.pink,   dim: C.pinkDim },
  "Interpreter":      { color: C.teal,   dim: C.tealDim },
  "Data Annotator":   { color: C.warn,   dim: C.warnDim },
  "Agency":           { color: C.orange, dim: C.orangeDim },
};

const STATUS_META = {
  "Active":   { color: C.ok,   dim: C.okDim },
  "Pending":  { color: C.warn, dim: C.warnDim },
  "Inactive": { color: C.err,  dim: C.errDim },
};

const NAV_ITEMS = [
  { id:"dashboard",  icon:"⊞", label:"Dashboard" },
  { id:"vendors",    icon:"◉", label:"Vendor Directory" },
  { id:"onboard",    icon:"⊕", label:"Onboard Vendor" },
  { id:"compliance", icon:"◎", label:"ISO Compliance" },
  { id:"reports",    icon:"▤", label:"Reports & Analytics" },
  { id:"settings",   icon:"⊙", label:"Settings" },
];

const LANGUAGES = ["English","Hindi","Spanish","French","German","Japanese","Mandarin","Arabic","Portuguese","Russian","Korean","Italian","Dutch","Polish","Turkish","Tamil","Telugu","Marathi","Bengali","Punjabi","Swahili","Thai","Vietnamese","Indonesian"];
const SERVICES  = ["Translation","Transcription","Localization","Interpretation","Voice Over","Dubbing","Subtitling","MTPE","Post Editing","Proofreading","DTP","Data Annotation","Data Labeling","Sentiment Analysis","Data Pre-processing","Data Sourcing","Data Augmentation","Semantic Annotation","Multilingual Staffing"];
const STEPS     = ["Basic Info","Services","Qualifications","Rates","Review & Submit"];

/* ═══════════════════════════════════════════════════
   FONT LOADER
═══════════════════════════════════════════════════ */
function FontLoader() {
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: ${C.surf}; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.borderHi}; }
    input, select, button { font-family: inherit; }
    input::placeholder { color: ${C.t3}; }
    select option { background: ${C.elev}; color: ${C.t1}; }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    .nav-btn:hover { background: ${C.orangeGlow} !important; color: ${C.t1} !important; }
    .row-hover:hover { background: ${C.elev} !important; cursor: pointer; }
    .card-hover:hover { border-color: ${C.borderHi} !important; }
    .qa-hover:hover { border-color: ${C.orange} !important; }
    `;
    document.head.appendChild(s);
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════
   ATOMS
═══════════════════════════════════════════════════ */
function Spinner() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%",
        border: `3px solid ${C.border}`, borderTopColor: C.orange,
        animation: "spin 0.7s linear infinite" }} />
      <span style={{ color: C.t3, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
        Loading vendors…
      </span>
    </div>
  );
}

function TypeBadge({ type }) {
  const m = TYPE_META[type] || { color: C.t2, dim: C.elev };
  return (
    <span style={{ background: m.dim, color: m.color, border: `1px solid ${m.color}22`,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 4, fontFamily: "'Barlow Condensed', sans-serif",
      whiteSpace: "nowrap" }}>
      {type}
    </span>
  );
}

function StatusChip({ status }) {
  const m = STATUS_META[status] || STATUS_META.Inactive;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5,
      background: m.dim, color: m.color,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
      padding: "3px 9px", borderRadius: 20,
      fontFamily: "'Barlow Condensed', sans-serif" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.color,
        display: "inline-block", animation: status === "Active" ? "pulse 2s infinite" : "none" }} />
      {status}
    </span>
  );
}

function Avatar({ name, size = 38 }) {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `hsl(${hue},40%,18%)`,
      border: `1.5px solid hsl(${hue},40%,28%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
      fontSize: size * 0.33, color: `hsl(${hue},60%,72%)` }}>
      {initials}
    </div>
  );
}

function ISOBadge({ label, active }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
      background: active ? C.okDim : C.errDim,
      color: active ? C.ok : C.t3,
      border: `1px solid ${active ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.12)"}`,
      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 4,
      fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>
      <span style={{ fontSize: 9 }}>{active ? "✓" : "○"}</span>
      {label}
    </span>
  );
}

function RatingStars({ rating }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
      <span style={{ color: C.orange, fontSize: 11, letterSpacing: "-1px" }}>{"★".repeat(Math.round(rating))}</span>
      <span style={{ color: C.t2, fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════ */
function Sidebar({ active, setActive }) {
  return (
    <aside style={{ width: 232, minWidth: 232, background: C.surf,
      borderRight: `1px solid ${C.border}`, display: "flex",
      flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>

      {/* Wordmark */}
      <div style={{ padding: "22px 18px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: C.orange,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
            fontSize: 15, color: "#fff", letterSpacing: "-0.5px", flexShrink: 0 }}>
            CH
          </div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: 16, color: C.t1, letterSpacing: "0.02em", lineHeight: 1.1 }}>
              Crystal Hues
            </div>
            <div style={{ fontSize: 9, color: C.t3, fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, letterSpacing: "0.09em", textTransform: "uppercase", marginTop: 1 }}>
              Vendor Management
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: 9, color: C.t3, fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "8px 8px 4px" }}>
          Navigation
        </div>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          return (
            <button key={item.id} className="nav-btn" onClick={() => setActive(item.id)} style={{
              display: "flex", alignItems: "center", gap: 9,
              width: "100%", padding: "9px 10px", borderRadius: 7,
              border: "none", background: isActive ? C.orangeDim : "transparent",
              color: isActive ? C.orange : C.t2,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: isActive ? 700 : 400, fontSize: 13.5,
              letterSpacing: "0.02em", cursor: "pointer",
              borderLeft: `2px solid ${isActive ? C.orange : "transparent"}`,
              transition: "all 0.12s ease", textAlign: "left",
              marginBottom: 1,
            }}>
              <span style={{ fontSize: 14, opacity: isActive ? 1 : 0.45, width: 16, textAlign: "center" }}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ISO Footer */}
      <div style={{ padding: "14px 16px 18px", borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 9, color: C.t3, fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          Certified To
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {["ISO 17100", "ISO 18587", "ISO 9001", "ISO 27001"].map(iso => (
            <span key={iso} style={{ fontSize: 9.5, fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, color: C.t3, background: "rgba(255,255,255,0.03)",
              border: `1px solid ${C.border}`, padding: "2px 7px", borderRadius: 3 }}>
              {iso}
            </span>
          ))}
        </div>
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8,
          padding: "7px 10px", borderRadius: 8, background: C.elev,
          border: `1px solid ${C.border}` }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.orange,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 900, color: "#fff",
            fontFamily: "'Barlow Condensed', sans-serif", flexShrink: 0 }}>A</div>
          <div>
            <div style={{ fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, color: C.t1 }}>Admin</div>
            <div style={{ fontSize: 10, color: C.t3, fontFamily: "'DM Sans', sans-serif" }}>
              Administrator
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════
   TOP BAR
═══════════════════════════════════════════════════ */
function TopBar({ title, subtitle, action, searchVal, onSearch }) {
  return (
    <div style={{ height: 58, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 26px",
      borderBottom: `1px solid ${C.border}`, background: C.surf,
      position: "sticky", top: 0, zIndex: 20, flexShrink: 0 }}>
      <div>
        <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
          fontSize: 20, color: C.t1, letterSpacing: "0.02em", margin: 0, lineHeight: 1 }}>
          {title}
        </h1>
        {subtitle && <div style={{ fontSize: 11, color: C.t3, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {onSearch && (
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%",
              transform: "translateY(-50%)", color: C.t3, fontSize: 12, pointerEvents: "none" }}>⌕</span>
            <input value={searchVal} onChange={e => onSearch(e.target.value)}
              placeholder="Search vendors…"
              style={{ background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "7px 12px 7px 28px",
                color: C.t1, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                outline: "none", width: 210 }} />
          </div>
        )}
        {action && (
          <button onClick={action.onClick} style={{ display: "flex", alignItems: "center",
            gap: 6, padding: "7px 14px", borderRadius: 8,
            background: C.orange, border: "none", color: "#fff", cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
            fontSize: 13, letterSpacing: "0.03em" }}>
            {action.icon} {action.label}
          </button>
        )}
        <div style={{ width: 30, height: 30, borderRadius: "50%",
          background: C.elev, border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, cursor: "pointer", color: C.t2 }}>🔔</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════ */
function StatCard({ icon, label, value, sub, accent, delay = 0 }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "18px 20px", position: "relative", overflow: "hidden",
      animation: `fadeSlideIn 0.4s ease ${delay}ms both` }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 70, height: 70,
        background: accent ? `${accent}07` : `${C.orange}05`,
        borderRadius: "0 10px 0 70px" }} />
      <div style={{ fontSize: 20, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
        fontSize: 34, color: accent || C.t1, lineHeight: 1, marginBottom: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: C.t2, fontFamily: "'DM Sans', sans-serif",
        fontWeight: 500, marginBottom: sub ? 2 : 0 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.t3, fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════ */
function DashboardView({ vendors, setView }) {
  const active   = vendors.filter(v => v.status === "Active").length;
  const pending  = vendors.filter(v => v.status === "Pending").length;
  const isoCount = vendors.filter(v => v.iso17100 || v.iso27001).length;

  const breakdown = [
    { label:"Translators",       count:vendors.filter(v=>v.type==="Translator").length,       color:C.blue },
    { label:"Transcriptionists", count:vendors.filter(v=>v.type==="Transcriptionist").length, color:C.purple },
    { label:"Voice Artists",     count:vendors.filter(v=>v.type==="Voice Artist").length,     color:C.pink },
    { label:"Interpreters",      count:vendors.filter(v=>v.type==="Interpreter").length,      color:C.teal },
    { label:"Data Annotators",   count:vendors.filter(v=>v.type==="Data Annotator").length,   color:C.warn },
    { label:"Agencies",          count:vendors.filter(v=>v.type==="Agency").length,           color:C.orange },
  ].filter(b => b.count > 0);

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20,
      animation: "fadeSlideIn 0.3s ease both" }}>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <StatCard icon="👥" label="Total Vendors" value={vendors.length} sub="All categories" delay={0} />
        <StatCard icon="✅" label="Active" value={active} sub="Currently engaged" accent={C.ok} delay={60} />
        <StatCard icon="⏳" label="Pending Review" value={pending} sub="Awaiting approval" accent={C.warn} delay={120} />
        <StatCard icon="🏆" label="ISO Compliant" value={isoCount} sub="Certified vendors" accent={C.blue} delay={180} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Onboardings */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: 15, color: C.t1 }}>Recent Onboardings</span>
            <button onClick={() => setView("vendors")} style={{ background: "none", border: "none",
              color: C.orange, cursor: "pointer", fontSize: 12,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>View all →</button>
          </div>
          {vendors.slice(0, 5).map((v, i) => (
            <div key={v.id} className="row-hover" style={{ display: "flex", alignItems: "center",
              gap: 12, padding: "11px 18px", transition: "background 0.1s",
              borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
              <Avatar name={v.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                  fontSize: 14, color: C.t1, letterSpacing: "0.01em",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                  <TypeBadge type={v.type} />
                  <span style={{ color: C.t3, fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>{v.location}</span>
                </div>
              </div>
              <StatusChip status={v.status} />
            </div>
          ))}
        </div>

        {/* Type Distribution */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: 15, color: C.t1 }}>Vendor Distribution</span>
          </div>
          <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 11 }}>
            {breakdown.map(b => (
              <div key={b.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif",
                    color: C.t2, fontWeight: 500 }}>{b.label}</span>
                  <span style={{ fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif",
                    color: b.color, fontWeight: 700 }}>{b.count}</span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: C.border, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: b.color, borderRadius: 2,
                    width: `${(b.count / vendors.length) * 100}%`,
                    transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
                </div>
              </div>
            ))}
          </div>

          {/* ISO Summary */}
          <div style={{ padding: "12px 18px 16px", borderTop: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 9, color: C.t3, fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Compliance Summary
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
              {[
                { l:"ISO 17100", n:vendors.filter(v=>v.iso17100).length },
                { l:"ISO 18587", n:vendors.filter(v=>v.iso18587).length },
                { l:"ISO 27001", n:vendors.filter(v=>v.iso27001).length },
                { l:"NDA",       n:vendors.filter(v=>v.nda_signed).length },
              ].map(item => (
                <div key={item.l} style={{ background: C.elev, border: `1px solid ${C.border}`,
                  borderRadius: 7, padding: "8px 6px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 900, fontSize: 20, color: C.ok, lineHeight: 1 }}>{item.n}</div>
                  <div style={{ fontSize: 9, color: C.t3, fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 2 }}>{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 20px" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
          fontSize: 15, color: C.t1, marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { icon:"⊕", label:"Onboard Vendor",  desc:"Add a new vendor", action:()=>setView("onboard") },
            { icon:"◎", label:"ISO Audit",        desc:"Review compliance" },
            { icon:"↓", label:"Export Directory", desc:"Download as CSV" },
            { icon:"✉", label:"Batch NDA Send",   desc:"Send to pending vendors" },
          ].map(a => (
            <div key={a.label} className="qa-hover" onClick={a.action}
              style={{ padding: "12px 14px", borderRadius: 8, background: C.elev,
                border: `1px solid ${C.border}`, cursor: "pointer",
                transition: "border-color 0.15s ease" }}>
              <div style={{ fontSize: 18, marginBottom: 6, color: C.orange }}>{a.icon}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: 13, color: C.t1, marginBottom: 2 }}>{a.label}</div>
              <div style={{ fontSize: 11, color: C.t3, fontFamily: "'DM Sans', sans-serif" }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   VENDOR DIRECTORY
═══════════════════════════════════════════════════ */
function VendorDirectory({ vendors, onSelect, setView }) {
  const [search,       setSearch]       = useState("");
  const [filterType,   setFilterType]   = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const types    = ["All","Translator","Transcriptionist","Voice Artist","Interpreter","Data Annotator","Agency"];
  const statuses = ["All","Active","Pending","Inactive"];

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    const matchQ = !q || v.name.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q) ||
      v.languages.some(l => l.toLowerCase().includes(q)) ||
      v.services.some(s => s.toLowerCase().includes(q));
    return matchQ &&
      (filterType   === "All" || v.type   === filterType) &&
      (filterStatus === "All" || v.status === filterStatus);
  });

  const FilterBtn = ({ label, active, color, onClick }) => (
    <button onClick={onClick} style={{ padding: "4px 11px", borderRadius: 6,
      border: `1px solid ${active ? (color || C.orange) : C.border}`,
      background: active ? (color ? `${color}14` : C.orangeDim) : "transparent",
      color: active ? (color || C.orange) : C.t2,
      cursor: "pointer", fontSize: 11,
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
      letterSpacing: "0.03em", transition: "all 0.1s" }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Vendor Directory" subtitle={`${filtered.length} of ${vendors.length} vendors`}
        action={{ icon:"⊕", label:"Add Vendor", onClick:()=>setView("onboard") }}
        searchVal={search} onSearch={setSearch} />

      <div style={{ padding: "16px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 14,
        animation: "fadeSlideIn 0.3s ease both" }}>
        {/* Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: C.t3, fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginRight: 2 }}>Type:</span>
          {types.map(t => <FilterBtn key={t} label={t} active={filterType===t} onClick={()=>setFilterType(t)} />)}
          <div style={{ width: 1, height: 16, background: C.border, margin: "0 6px" }} />
          <span style={{ fontSize: 10, color: C.t3, fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginRight: 2 }}>Status:</span>
          {statuses.map(s => <FilterBtn key={s} label={s} active={filterStatus===s}
            color={STATUS_META[s]?.color} onClick={()=>setFilterStatus(s)} />)}
        </div>

        {/* Table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", flex: 1 }}>
          <div style={{ display: "grid",
            gridTemplateColumns: "2fr 1.1fr 1.6fr 0.9fr 1fr 1fr 24px",
            padding: "9px 18px", borderBottom: `1px solid ${C.border}`,
            background: C.surf }}>
            {["Vendor","Type","Languages","Exp.","Rating","Status",""].map(h => (
              <span key={h} style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, color: C.t3, letterSpacing: "0.09em", textTransform: "uppercase" }}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: 48, textAlign: "center", color: C.t3,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>
              No vendors match your search criteria.
            </div>
          )}

          <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 280px)" }}>
            {filtered.map((v, i) => (
              <div key={v.id} className="row-hover" onClick={() => onSelect(v)}
                style={{ display: "grid",
                  gridTemplateColumns: "2fr 1.1fr 1.6fr 0.9fr 1fr 1fr 24px",
                  padding: "12px 18px", alignItems: "center",
                  borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : "none",
                  transition: "background 0.1s" }}>

                {/* Vendor */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <Avatar name={v.name} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                      fontSize: 14, color: C.t1, whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</div>
                    <div style={{ fontSize: 10, color: C.t3, fontFamily: "'DM Sans', sans-serif" }}>
                      #{v.id} · {v.location}
                    </div>
                  </div>
                </div>

                <TypeBadge type={v.type} />

                {/* Languages */}
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                  {v.languages.slice(0, 2).map(l => (
                    <span key={l} style={{ fontSize: 10, background: C.elev,
                      border: `1px solid ${C.border}`, color: C.t2,
                      padding: "2px 6px", borderRadius: 3,
                      fontFamily: "'DM Sans', sans-serif" }}>{l}</span>
                  ))}
                  {v.languages.length > 2 && (
                    <span style={{ fontSize: 10, color: C.t3,
                      fontFamily: "'DM Sans', sans-serif", alignSelf: "center" }}>
                      +{v.languages.length - 2}
                    </span>
                  )}
                </div>

                <span style={{ fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 14, color: C.t2, fontWeight: 600 }}>{v.experience}y</span>

                <RatingStars rating={v.rating} />
                <StatusChip status={v.status} />
                <span style={{ color: C.t3, fontSize: 14, textAlign: "center" }}>›</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   VENDOR PROFILE PANEL
═══════════════════════════════════════════════════ */
function VendorProfile({ vendor: v, onClose, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [edit, setEdit] = useState(null);

  // Initialise edit form from vendor data
  const startEdit = () => {
    setEdit({
      name:           v.name,
      email:          v.email,
      phone:          v.phone          || "",
      location:       v.location       || "",
      type:           v.type           || "",
      status:         v.status         || "Pending",
      languages:      v.languages      || [],
      services:       v.services       || [],
      experience:     v.experience     ?? "",
      education:      v.education      || "",
      specialization: v.specialization || "",
      iso17100:       v.iso17100       || false,
      iso18587:       v.iso18587       || false,
      iso27001:       v.iso27001       || false,
      nda_signed:     v.nda_signed     || false,
      rate:           v.rate           || "",
      rate_unit:      v.rate_unit      || "per word",
      availability:   v.availability   || "",
    });
    setEditing(true);
  };

  const updE = (k, val) => setEdit(f => ({ ...f, [k]: val }));
  const togE = (k, val) => setEdit(f => ({
    ...f, [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val],
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/vendors/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(edit),
      });
      if (!res.ok) throw new Error("Failed to update vendor");
      const updated = await res.json();
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${v.name}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/vendors/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete vendor");
      onDelete(v.id);
      onClose();
    } catch (err) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (!v) return null;

  const inp = {
    background: C.elev, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "7px 11px", color: C.t1,
    fontFamily: "'DM Sans', sans-serif", fontSize: 12,
    outline: "none", width: "100%",
  };

  const ChipBtn = ({ label, sel, color, onClick }) => (
    <button onClick={onClick} style={{ padding: "4px 10px", borderRadius: 5,
      border: `1px solid ${sel ? (color || C.orange) : C.border}`,
      background: sel ? (color ? `${color}14` : C.orangeDim) : C.elev,
      color: sel ? (color || C.orange) : C.t2, cursor: "pointer", fontSize: 11,
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, transition: "all 0.1s" }}>
      {label}
    </button>
  );

  const EF = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, color: C.t3, letterSpacing: "0.09em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(6,16,29,0.75)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "flex-end" }} onClick={editing ? undefined : onClose}>
      <div style={{ width: 460, height: "100vh", background: C.surf,
        borderLeft: `1px solid ${C.border}`, overflowY: "auto",
        animation: "slideInRight 0.25s cubic-bezier(0.4,0,0.2,1) both" }}
        onClick={e => e.stopPropagation()}>

        {/* Hero */}
        <div style={{ padding: "20px 22px", borderBottom: `1px solid ${C.border}`,
          background: `linear-gradient(135deg, ${C.surf} 60%, ${C.orangeGlow} 100%)` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={v.name} size={52} />
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: 22, color: C.t1, margin: "0 0 5px", letterSpacing: "0.01em" }}>{v.name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                  <TypeBadge type={v.type} />
                  <StatusChip status={v.status} />
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7,
              background: C.elev, border: `1px solid ${C.border}`, color: C.t2,
              cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0 }}>×</button>
          </div>

          {/* KPI row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 16 }}>
            {[
              { l:"Vendor ID",  v:`#${v.id}` },
              { l:"Projects",   v:v.projects },
              { l:"Rating",     v:`${v.rating} / 5.0` },
            ].map(item => (
              <div key={item.l} style={{ background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "9px 12px" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 900, fontSize: 18, color: C.orange, lineHeight: 1 }}>{item.v}</div>
                <div style={{ fontSize: 10, color: C.t3, fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{item.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── VIEW MODE ── */}
        {!editing && (
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <ProfileSection title="Contact Information">
              <InfoRow icon="✉" label="Email"    value={v.email} />
              <InfoRow icon="☎" label="Phone"    value={v.phone} />
              <InfoRow icon="⌖" label="Location" value={v.location} />
              <InfoRow icon="⊕" label="Joined"   value={v.joined} />
              <InfoRow icon="₹" label="Rate"     value={v.rate ? `${v.rate} ${v.rate_unit}` : "—"} />
            </ProfileSection>

            <ProfileSection title="Services Offered">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {v.services.map(s => (
                  <span key={s} style={{ fontSize: 12, background: C.elev,
                    border: `1px solid ${C.border}`, color: C.t1, padding: "4px 10px",
                    borderRadius: 6, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </ProfileSection>

            <ProfileSection title="Working Languages">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {v.languages.map(l => (
                  <span key={l} style={{ fontSize: 12, background: C.orangeDim,
                    border: `1px solid ${C.orange}22`, color: C.orange, padding: "4px 10px",
                    borderRadius: 6, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600 }}>{l}</span>
                ))}
              </div>
            </ProfileSection>

            <ProfileSection title="Qualifications">
              <InfoRow icon="◎" label="Education"      value={v.education} />
              <InfoRow icon="◈" label="Specialization" value={v.specialization} />
              <InfoRow icon="◷" label="Experience"     value={`${v.experience} years`} />
            </ProfileSection>

            <ProfileSection title="ISO & Compliance">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                <ISOBadge label="ISO 17100"  active={v.iso17100} />
                <ISOBadge label="ISO 18587"  active={v.iso18587} />
                <ISOBadge label="ISO 27001"  active={v.iso27001} />
                <ISOBadge label="NDA Signed" active={v.nda_signed} />
              </div>
            </ProfileSection>

            {/* Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 4 }}>
              <button onClick={startEdit} style={{ padding: "10px", borderRadius: 8,
                background: C.orangeDim, border: `1px solid ${C.orange}33`, color: C.orange,
                cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: 13 }}>
                Edit Profile
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ padding: "10px", borderRadius: 8,
                background: C.errDim, border: `1px solid rgba(239,68,68,0.25)`, color: C.err,
                cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.6 : 1,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13 }}>
                {deleting ? "Deleting…" : "Delete Vendor"}
              </button>
            </div>
          </div>
        )}

        {/* ── EDIT MODE ── */}
        {editing && edit && (
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 14 }}>

            <ProfileSection title="Basic Information">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <EF label="Full Name">
                    <input style={inp} value={edit.name} onChange={e => updE("name", e.target.value)} />
                  </EF>
                  <EF label="Email">
                    <input style={inp} value={edit.email} onChange={e => updE("email", e.target.value)} />
                  </EF>
                  <EF label="Phone">
                    <input style={inp} value={edit.phone} onChange={e => updE("phone", e.target.value)} />
                  </EF>
                  <EF label="Location">
                    <input style={inp} value={edit.location} onChange={e => updE("location", e.target.value)} />
                  </EF>
                </div>
                <EF label="Vendor Type">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {Object.keys(TYPE_META).map(t => (
                      <ChipBtn key={t} label={t} sel={edit.type === t}
                        color={TYPE_META[t].color} onClick={() => updE("type", t)} />
                    ))}
                  </div>
                </EF>
                <EF label="Status">
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Active","Pending","Inactive"].map(s => (
                      <ChipBtn key={s} label={s} sel={edit.status === s}
                        color={STATUS_META[s].color} onClick={() => updE("status", s)} />
                    ))}
                  </div>
                </EF>
              </div>
            </ProfileSection>

            <ProfileSection title="Languages">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 120, overflowY: "auto" }}>
                {LANGUAGES.map(l => (
                  <ChipBtn key={l} label={l} sel={edit.languages.includes(l)}
                    color={C.blue} onClick={() => togE("languages", l)} />
                ))}
              </div>
            </ProfileSection>

            <ProfileSection title="Services">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 120, overflowY: "auto" }}>
                {SERVICES.map(s => (
                  <ChipBtn key={s} label={s} sel={edit.services.includes(s)}
                    color={C.teal} onClick={() => togE("services", s)} />
                ))}
              </div>
            </ProfileSection>

            <ProfileSection title="Qualifications">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <EF label="Experience (years)">
                    <input type="number" style={inp} value={edit.experience} min="0" max="50"
                      onChange={e => updE("experience", e.target.value)} />
                  </EF>
                  <EF label="Specialization">
                    <input style={inp} value={edit.specialization} onChange={e => updE("specialization", e.target.value)} />
                  </EF>
                </div>
                <EF label="Education">
                  <input style={inp} value={edit.education} onChange={e => updE("education", e.target.value)} />
                </EF>
              </div>
            </ProfileSection>

            <ProfileSection title="ISO & Compliance">
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {[
                  { k:"iso17100",  l:"ISO 17100" },
                  { k:"iso18587",  l:"ISO 18587" },
                  { k:"iso27001",  l:"ISO 27001" },
                  { k:"nda_signed", l:"NDA Signed" },
                ].map(iso => (
                  <div key={iso.k} onClick={() => updE(iso.k, !edit[iso.k])} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 11px",
                    borderRadius: 7, cursor: "pointer",
                    border: `1px solid ${edit[iso.k] ? "rgba(34,197,94,0.3)" : C.border}`,
                    background: edit[iso.k] ? C.okDim : C.elev, transition: "all 0.12s" }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                      background: edit[iso.k] ? C.ok : C.border,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, color: "#fff", fontWeight: 900 }}>
                      {edit[iso.k] ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, color: edit[iso.k] ? C.ok : C.t1 }}>{iso.l}</span>
                  </div>
                ))}
              </div>
            </ProfileSection>

            <ProfileSection title="Rates & Availability">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                  <EF label="Rate">
                    <input style={inp} value={edit.rate} onChange={e => updE("rate", e.target.value)} />
                  </EF>
                  <EF label="Unit">
                    <select style={{ ...inp, cursor: "pointer" }} value={edit.rate_unit}
                      onChange={e => updE("rate_unit", e.target.value)}>
                      {["per word","per hour","per minute","per page","per project","custom"].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </EF>
                </div>
                <EF label="Availability">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["Full-time","Part-time","Project-based","On-demand","Weekends only"].map(a => (
                      <ChipBtn key={a} label={a} sel={edit.availability === a}
                        onClick={() => updE("availability", a)} />
                    ))}
                  </div>
                </EF>
              </div>
            </ProfileSection>

            {/* Save / Cancel */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 4 }}>
              <button onClick={() => setEditing(false)} style={{ padding: "10px", borderRadius: 8,
                background: C.elev, border: `1px solid ${C.border}`, color: C.t2,
                cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700, fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: "10px", borderRadius: 8,
                background: saving ? C.border : C.orange,
                border: "none", color: saving ? C.t3 : "#fff",
                cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13 }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSection({ title, children }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9 }}>
      <div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          fontSize: 11, color: C.t3, letterSpacing: "0.09em", textTransform: "uppercase" }}>{title}</span>
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 7 }}>{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ fontSize: 12, width: 16, color: C.t3, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 11, color: C.t3, fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, width: 82, flexShrink: 0, textTransform: "uppercase",
        letterSpacing: "0.05em" }}>{label}</span>
      <span style={{ fontSize: 12, color: C.t1, fontFamily: "'DM Sans', sans-serif",
        lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ONBOARDING WIZARD
═══════════════════════════════════════════════════ */

function F({ label, req, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 700, color: C.t3, letterSpacing: "0.09em", textTransform: "uppercase" }}>
        {label}{req && <span style={{ color: C.orange }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function ChipBtn({ label, sel, color, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "5px 12px", borderRadius: 6,
      border: `1px solid ${sel ? (color || C.orange) : C.border}`,
      background: sel ? (color ? `${color}14` : C.orangeDim) : C.elev,
      color: sel ? (color || C.orange) : C.t2,
      cursor: "pointer", fontSize: 12,
      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
      transition: "all 0.1s" }}>
      {label}
    </button>
  );
}

const BLANK_FORM = {
  name:"", email:"", phone:"", location:"", type:"",
  languages:[], services:[],
  experience:"", education:"", specialization:"",
  iso17100:false, iso18587:false, iso27001:false,
  rate:"", rateUnit:"per word", availability:"",
  ndaAccepted:false,
};

function OnboardingView({ onVendorCreated }) {
  const [step,      setStep]      = useState(0);
  const [form,      setForm]      = useState(BLANK_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const tog = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x=>x!==v) : [...f[k], v],
  }));

  const canNext = () => {
    if (step === 0) return form.name.trim() && form.email.trim() && form.type;
    if (step === 1) return form.languages.length > 0 && form.services.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    if (!form.ndaAccepted) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:           form.name,
          email:          form.email,
          phone:          form.phone,
          location:       form.location,
          type:           form.type,
          languages:      form.languages,
          services:       form.services,
          experience:     Number(form.experience) || 0,
          education:      form.education,
          specialization: form.specialization,
          iso17100:       form.iso17100,
          iso18587:       form.iso18587,
          iso27001:       form.iso27001,
          nda_signed:     form.ndaAccepted,
          rate:           form.rate,
          rate_unit:      form.rateUnit,
          availability:   form.availability,
          status:         "Pending",
        }),
      });
      if (!res.ok) throw new Error("Failed to create vendor");
      onVendorCreated();
      setSubmitted(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 380, animation: "fadeSlideIn 0.4s ease both" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: C.okDim,
          border: `2px solid ${C.ok}33`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>✓</div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: 28, color: C.t1, margin: "0 0 8px" }}>Vendor Onboarded!</h2>
        <p style={{ color: C.t2, fontFamily: "'DM Sans', sans-serif", fontSize: 14,
          lineHeight: 1.6, margin: "0 0 24px" }}>
          <strong style={{ color: C.orange }}>{form.name}</strong> has been added to the vendor directory.
          A confirmation and NDA copy will be sent to <strong style={{ color: C.t1 }}>{form.email}</strong>.
        </p>
        <button onClick={() => { setSubmitted(false); setStep(0); setForm(BLANK_FORM); }}
          style={{ padding: "10px 24px", borderRadius: 8, background: C.orange,
            border: "none", color: "#fff", cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15 }}>
          Onboard Another
        </button>
      </div>
    </div>
  );

  const inp = {
    background: C.elev, border: `1px solid ${C.border}`,
    borderRadius: 8, padding: "9px 13px", color: C.t1,
    fontFamily: "'DM Sans', sans-serif", fontSize: 13,
    outline: "none", width: "100%",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Onboard New Vendor"
        subtitle="Register a new vendor in the Crystal Hues network" />

      <div style={{ padding: "24px 32px", maxWidth: 700, margin: "0 auto", width: "100%",
        animation: "fadeSlideIn 0.3s ease both" }}>

        {/* Step Progress */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center",
              flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: i < step ? C.ok : i === step ? C.orange : C.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: 12, color: i <= step ? "#fff" : C.t3,
                  transition: "all 0.2s" }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 9, fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700, color: i === step ? C.orange : C.t3,
                  letterSpacing: "0.08em", textTransform: "uppercase",
                  whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1.5, margin: "0 6px", marginBottom: 16,
                  background: i < step ? C.ok : C.border, transition: "background 0.3s" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step Card */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: "26px 28px" }}>

          {/* ─ Step 0: Basic Info ─ */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: 21, color: C.t1, margin: "0 0 4px" }}>Basic Information</h2>
                <p style={{ fontSize: 12, color: C.t2, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  Enter the vendor's personal and contact details.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <F label="Full Name" req>
                  <input style={inp} value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. Priya Sharma" />
                </F>
                <F label="Email Address" req>
                  <input style={inp} value={form.email} onChange={e=>upd("email",e.target.value)} placeholder="vendor@email.com" />
                </F>
                <F label="Phone Number">
                  <input style={inp} value={form.phone} onChange={e=>upd("phone",e.target.value)} placeholder="+91 98765 43210" />
                </F>
                <F label="Location">
                  <input style={inp} value={form.location} onChange={e=>upd("location",e.target.value)} placeholder="City, Country" />
                </F>
              </div>
              <F label="Vendor Type" req>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {Object.keys(TYPE_META).map(t => (
                    <ChipBtn key={t} label={t} sel={form.type===t}
                      color={TYPE_META[t].color} onClick={()=>upd("type",t)} />
                  ))}
                </div>
              </F>
            </div>
          )}

          {/* ─ Step 1: Services ─ */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: 21, color: C.t1, margin: "0 0 4px" }}>Services & Languages</h2>
                <p style={{ fontSize: 12, color: C.t2, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  Select all languages and services this vendor provides.</p>
              </div>
              <F label="Working Languages" req>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6,
                  maxHeight: 140, overflowY: "auto", padding: "2px 0" }}>
                  {LANGUAGES.map(l => (
                    <ChipBtn key={l} label={l} sel={form.languages.includes(l)}
                      color={C.blue} onClick={()=>tog("languages",l)} />
                  ))}
                </div>
                {form.languages.length > 0 && (
                  <div style={{ fontSize: 11, color: C.t3, fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
                    Selected: {form.languages.join(", ")}
                  </div>
                )}
              </F>
              <F label="Services Offered" req>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {SERVICES.map(s => (
                    <ChipBtn key={s} label={s} sel={form.services.includes(s)}
                      color={C.teal} onClick={()=>tog("services",s)} />
                  ))}
                </div>
              </F>
            </div>
          )}

          {/* ─ Step 2: Qualifications ─ */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: 21, color: C.t1, margin: "0 0 4px" }}>Qualifications & Certifications</h2>
                <p style={{ fontSize: 12, color: C.t2, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  Educational background, domain expertise, and ISO certifications.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <F label="Years of Experience">
                  <input type="number" style={inp} value={form.experience} min="0" max="50"
                    onChange={e=>upd("experience",e.target.value)} placeholder="e.g. 8" />
                </F>
                <F label="Specialization Domain">
                  <input style={inp} value={form.specialization}
                    onChange={e=>upd("specialization",e.target.value)} placeholder="e.g. Legal, Medical" />
                </F>
              </div>
              <F label="Education / Qualifications">
                <input style={inp} value={form.education}
                  onChange={e=>upd("education",e.target.value)} placeholder="e.g. MA Linguistics, University of Delhi" />
              </F>
              <F label="ISO Certifications">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { k:"iso17100", l:"ISO 17100", d:"Translation Services — Qualification requirements for TSPs" },
                    { k:"iso18587", l:"ISO 18587", d:"Machine Translation Post-Editing — Full post-editing standards" },
                    { k:"iso27001", l:"ISO 27001", d:"Information Security — Management of sensitive information" },
                  ].map(iso => (
                    <div key={iso.k} onClick={()=>upd(iso.k,!form[iso.k])} style={{
                      display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 13px",
                      borderRadius: 8, cursor: "pointer", transition: "all 0.12s",
                      border: `1px solid ${form[iso.k] ? "rgba(34,197,94,0.3)" : C.border}`,
                      background: form[iso.k] ? C.okDim : C.elev }}>
                      <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                        background: form[iso.k] ? C.ok : C.border,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, color: "#fff", fontWeight: 900 }}>
                        {form[iso.k] ? "✓" : ""}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                          fontSize: 14, color: form[iso.k] ? C.ok : C.t1 }}>{iso.l}</div>
                        <div style={{ fontSize: 11, color: C.t3, fontFamily: "'DM Sans', sans-serif",
                          marginTop: 2 }}>{iso.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </F>
            </div>
          )}

          {/* ─ Step 3: Rates ─ */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: 21, color: C.t1, margin: "0 0 4px" }}>Rates & Availability</h2>
                <p style={{ fontSize: 12, color: C.t2, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  Specify pricing structure and working schedule.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <F label="Rate / Price">
                  <input style={inp} value={form.rate} onChange={e=>upd("rate",e.target.value)} placeholder="e.g. 1.50 or 45" />
                </F>
                <F label="Unit">
                  <select style={{ ...inp, cursor: "pointer" }} value={form.rateUnit} onChange={e=>upd("rateUnit",e.target.value)}>
                    {["per word","per hour","per minute","per page","per project","custom"].map(u=>(
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </F>
              </div>
              <F label="Availability">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {["Full-time","Part-time","Project-based","On-demand","Weekends only"].map(a => (
                    <ChipBtn key={a} label={a} sel={form.availability===a} onClick={()=>upd("availability",a)} />
                  ))}
                </div>
              </F>
            </div>
          )}

          {/* ─ Step 4: Review ─ */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
                  fontSize: 21, color: C.t1, margin: "0 0 4px" }}>Review & Submit</h2>
                <p style={{ fontSize: 12, color: C.t2, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
                  Confirm all details before registering the vendor.</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0,
                background: C.elev, border: `1px solid ${C.border}`, borderRadius: 9, overflow: "hidden" }}>
                {[
                  { l:"Name",           v:form.name || "—" },
                  { l:"Email",          v:form.email || "—" },
                  { l:"Vendor Type",    v:form.type || "—" },
                  { l:"Languages",      v:form.languages.join(", ") || "—" },
                  { l:"Services",       v:form.services.join(", ") || "—" },
                  { l:"Experience",     v:form.experience ? `${form.experience} years` : "—" },
                  { l:"Specialization", v:form.specialization || "—" },
                  { l:"Rate",           v:form.rate ? `${form.rate} ${form.rateUnit}` : "—" },
                  { l:"Availability",   v:form.availability || "—" },
                ].map((row, i, arr) => (
                  <div key={row.l} style={{ display: "flex", gap: 12, padding: "9px 14px",
                    borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none" }}>
                    <span style={{ width: 110, fontSize: 10, fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700, color: C.t3, textTransform: "uppercase",
                      letterSpacing: "0.06em", flexShrink: 0, paddingTop: 1 }}>{row.l}</span>
                    <span style={{ fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                      color: row.v === "—" ? C.t3 : C.t1, flex: 1 }}>{row.v}</span>
                  </div>
                ))}
              </div>

              {(form.iso17100 || form.iso18587 || form.iso27001) && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {form.iso17100 && <ISOBadge label="ISO 17100" active />}
                  {form.iso18587 && <ISOBadge label="ISO 18587" active />}
                  {form.iso27001 && <ISOBadge label="ISO 27001" active />}
                </div>
              )}

              {/* NDA Confirmation */}
              <div onClick={()=>upd("ndaAccepted",!form.ndaAccepted)} style={{
                display: "flex", gap: 12, padding: "13px 15px", borderRadius: 9,
                border: `1px solid ${form.ndaAccepted ? `${C.orange}44` : C.border}`,
                background: form.ndaAccepted ? C.orangeDim : C.elev,
                cursor: "pointer", transition: "all 0.15s", alignItems: "flex-start" }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, flexShrink: 0, marginTop: 1,
                  background: form.ndaAccepted ? C.orange : C.border,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, color: "#fff", fontWeight: 900 }}>
                  {form.ndaAccepted ? "✓" : ""}
                </div>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                    fontSize: 14, color: form.ndaAccepted ? C.orange : C.t1, lineHeight: 1.3 }}>
                    I confirm this vendor has acknowledged Crystal Hues' NDA and data security policies.
                  </div>
                  <div style={{ fontSize: 11, color: C.t3, fontFamily: "'DM Sans', sans-serif",
                    marginTop: 3 }}>
                    Required for ISO 27001 compliance. The vendor will receive a copy via email.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26,
            paddingTop: 18, borderTop: `1px solid ${C.border}` }}>
            <button onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0} style={{
              padding: "9px 18px", borderRadius: 8,
              background: step===0 ? "transparent" : C.elev,
              border: `1px solid ${step===0 ? "transparent" : C.border}`,
              color: step===0 ? "transparent" : C.t2,
              cursor: step===0 ? "default" : "pointer",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13 }}>
              ← Back
            </button>

            {step < STEPS.length - 1 ? (
              <button onClick={()=>setStep(s=>s+1)} disabled={!canNext()} style={{
                padding: "9px 22px", borderRadius: 8,
                background: canNext() ? C.orange : C.border,
                border: "none", color: canNext() ? "#fff" : C.t3,
                cursor: canNext() ? "pointer" : "not-allowed",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13,
                transition: "background 0.15s" }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit}
                disabled={!form.ndaAccepted || submitting} style={{
                padding: "9px 22px", borderRadius: 8,
                background: form.ndaAccepted && !submitting ? C.orange : C.border,
                border: "none",
                color: form.ndaAccepted && !submitting ? "#fff" : C.t3,
                cursor: form.ndaAccepted && !submitting ? "pointer" : "not-allowed",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13 }}>
                {submitting ? "Submitting…" : "✓ Submit Vendor"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PLACEHOLDER
═══════════════════════════════════════════════════ */
function Placeholder({ title, icon }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <TopBar title={title} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 10 }}>
        <div style={{ fontSize: 44, opacity: 0.3 }}>{icon}</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
          fontSize: 18, color: C.t3 }}>Coming Soon</div>
        <div style={{ fontSize: 12, color: C.t3, fontFamily: "'DM Sans', sans-serif" }}>
          This module is under development.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════ */
export default function App() {
  const [view,     setView]     = useState("dashboard");
  const [vendor,   setVendor]   = useState(null);
  const [vendors,  setVendors]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchVendors = useCallback(async () => {
    try {
      const res = await fetch(`${API}/vendors`);
      const data = await res.json();
      setVendors(data);
    } catch (err) {
      console.error("Failed to load vendors:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const handleUpdate = (updated) => {
    setVendors(vs => vs.map(v => v.id === updated.id ? updated : v));
    setVendor(updated);
  };

  const handleDelete = (id) => {
    setVendors(vs => vs.filter(v => v.id !== id));
    setVendor(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh",
      background: C.bg, color: C.t1,
      fontFamily: "'DM Sans', sans-serif" }}>
      <FontLoader />
      <Sidebar active={view} setActive={v => { setView(v); setVendor(null); }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        minWidth: 0, overflowY: "auto" }}>

        {loading ? (
          <>
            <TopBar title="Crystal Hues VMS" subtitle="Loading…" />
            <Spinner />
          </>
        ) : (
          <>
            {view === "dashboard"  && <>
              <TopBar title="Dashboard" subtitle="Crystal Hues Vendor Management System"
                action={{ icon:"⊕", label:"Add Vendor", onClick:()=>setView("onboard") }} />
              <DashboardView vendors={vendors} setView={setView} />
            </>}
            {view === "vendors"    && <VendorDirectory vendors={vendors} onSelect={setVendor} setView={setView} />}
            {view === "onboard"    && <OnboardingView onVendorCreated={fetchVendors} />}
            {view === "compliance" && <Placeholder title="ISO Compliance" icon="◎" />}
            {view === "reports"    && <Placeholder title="Reports & Analytics" icon="▤" />}
            {view === "settings"   && <Placeholder title="Settings" icon="⊙" />}
          </>
        )}
      </div>

      {vendor && (
        <VendorProfile
          vendor={vendor}
          onClose={() => setVendor(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
