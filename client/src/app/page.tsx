import Link from "next/link";

// ── Static data arrays (fill from API/CMS later) ─────────────────────────
const FEATURES = [
  {
    icon: "⚡",
    tag: "PROTOCOL-01",
    title: "Sub-Second Broadcasting",
    body: "Powered by WebSockets (Socket.io), threat reports are injected into the live feed of all connected operators instantly — no page reloads, zero latency.",
    accent: "#ff3b3b",
  },
  {
    icon: "📍",
    tag: "PROTOCOL-02",
    title: "Precision Geolocation",
    body: "Utilizing native browser APIs and React-Leaflet, the radar automatically locks onto the operator's exact physical coordinates for rapid field reporting.",
    accent: "#00d4ff",
  },
  {
    icon: "🎨",
    tag: "PROTOCOL-03",
    title: "Dynamic Threat Visuals",
    body: "A conditional rendering engine classifies geospatial data based on threat severity, prioritizing critical alerts visually on the command map in real time.",
    accent: "#ff8c42",
  },
];

const STACK = [
  { name: "Next.js 14",     color: "#fff"    },
  { name: "Node + Fastify", color: "#00e676" },
  { name: "MongoDB Atlas",  color: "#00d4ff" },
  { name: "Socket.io",      color: "#ff8c42" },
  { name: "React-Leaflet",  color: "#00e676" },
  { name: "JWT Auth",       color: "#ff3b3b" },
];

const STATS = [
  { value: "< 200ms", label: "Broadcast latency" },
  { value: "99.9%",   label: "Uptime SLA"         },
  { value: "∞",       label: "Concurrent ops"     },
  { value: "2dsphere",label: "Geo index type"     },
];

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Bebas+Neue&family=Sora:wght@300;400;500;600&display=swap');

        /* ── Custom properties ── */
        :root {
          --red:    #ff3b3b;
          --amber:  #ff8c42;
          --cyan:   #00d4ff;
          --green:  #00e676;
          --bg:     #03080f;
          --surface:#080f1a;
          --border: rgba(255,255,255,0.07);
        }

        /* ── Fonts ── */
        .f-mono    { font-family: 'Share Tech Mono', monospace; }
        .f-display { font-family: 'Bebas Neue', sans-serif; }
        .f-body    { font-family: 'Sora', sans-serif; }

        /* ── Keyframes ── */
        @keyframes orb-drift {
          0%,100% { transform: translate(0,0) scale(1); }
          30%      { transform: translate(50px,-45px) scale(1.06); }
          65%      { transform: translate(-30px,35px) scale(0.94); }
        }
        @keyframes grid-flicker {
          0%,100% { opacity: 0.40; }
          50%      { opacity: 0.12; }
        }
        @keyframes scanline {
          from { top: -2px; }
          to   { top: 101%; }
        }
        @keyframes crt-flicker {
          0%,97%,100% { opacity: 1; }
          98%          { opacity: 0.82; }
          99%          { opacity: 0.95; }
        }
        @keyframes radar-cw {
          to { transform: rotate(360deg); }
        }
        @keyframes radar-ccw {
          to { transform: rotate(-360deg); }
        }
        @keyframes blink-dot {
          0%,100% { opacity: 1; box-shadow: 0 0 6px 2px currentColor; }
          50%      { opacity: 0.15; box-shadow: none; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes sweep-grad {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes border-pulse {
          0%,100% { border-color: rgba(255,59,59,0.22); }
          50%      { border-color: rgba(255,59,59,0.65); box-shadow: 0 0 20px rgba(255,59,59,0.18); }
        }
        @keyframes crosshair-spin {
          to { transform: rotate(90deg); }
        }
        @keyframes stat-count {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* ── Glass ── */
        .glass {
          background: rgba(8,15,26,0.60);
          border: 1px solid var(--border);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }
        .glass-red {
          background: rgba(255,59,59,0.05);
          border: 1px solid rgba(255,59,59,0.20);
          backdrop-filter: blur(18px);
        }

        /* ── CTA button ── */
        .btn-primary {
          background: linear-gradient(135deg, #ff3b3b, #c0392b, #ff3b3b);
          background-size: 200%;
          animation: sweep-grad 3s ease infinite;
          transition: transform .18s, box-shadow .18s;
          position: relative;
          overflow: hidden;
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.10) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform .5s;
        }
        .btn-primary:hover::before { transform: translateX(100%); }
        .btn-primary:hover {
          transform: scale(1.025) translateY(-2px);
          box-shadow: 0 0 48px rgba(255,59,59,0.55), 0 12px 36px rgba(0,0,0,0.5);
        }

        .btn-outline {
          transition: all .2s;
          position: relative;
        }
        .btn-outline:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }

        /* ── Scrollbar ── */
        * { scrollbar-width: thin; scrollbar-color: rgba(255,59,59,0.3) transparent; }

        /* ── Feature card ── */
        .feat-card {
          transition: transform .25s, box-shadow .25s, border-color .25s;
        }
        .feat-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
        }
      `}</style>

      <div
        className="f-body relative min-h-screen overflow-x-hidden"
        style={{ background: "var(--bg)", color: "#c8d8e8" }}
      >

        {/* ══ AMBIENT LAYER ══════════════════════════════════════════ */}

        {/* Deep orbs */}
        {[
          { w:700, top:"-15%", left:"-15%", c:"rgba(255,59,59,0.07)",   d:"0s"  },
          { w:600, top:"30%",  right:"-14%",c:"rgba(0,212,255,0.06)",   d:"5s"  },
          { w:500, bottom:"-8%",left:"25%", c:"rgba(255,140,66,0.05)",  d:"9s"  },
        ].map((o,i) => (
          <div key={i} className="pointer-events-none fixed rounded-full"
            style={{
              width:o.w, height:o.w,
              top:(o as any).top, left:(o as any).left,
              right:(o as any).right, bottom:(o as any).bottom,
              background:`radial-gradient(circle,${o.c},transparent 68%)`,
              filter:"blur(80px)",
              animation:`orb-drift 18s ease-in-out ${o.d} infinite`,
              zIndex:0,
            }}
          />
        ))}

        {/* Dot grid */}
        <div className="pointer-events-none fixed inset-0" style={{
          backgroundImage:"radial-gradient(rgba(0,212,255,0.10) 1px,transparent 1px)",
          backgroundSize:"32px 32px",
          animation:"grid-flicker 6s ease-in-out infinite",
          zIndex:0,
        }} />

        {/* CRT scanline sweep */}
        <div className="pointer-events-none fixed left-0 right-0 opacity-[0.12]" style={{
          height:2,
          background:"linear-gradient(90deg,transparent,rgba(0,212,255,0.9) 50%,transparent)",
          animation:"scanline 10s linear infinite",
          zIndex:1,
        }} />

        {/* CRT flicker overlay */}
        <div className="pointer-events-none fixed inset-0 opacity-[0.015]" style={{
          background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.3) 2px,rgba(0,0,0,0.3) 4px)",
          animation:"crt-flicker 8s linear infinite",
          zIndex:1,
        }} />


        {/* ══ ALERT TICKER ═══════════════════════════════════════════ */}
        <div
          className="f-mono relative z-30 overflow-hidden py-2 text-[10px] tracking-widest"
          style={{
            background:"rgba(255,59,59,0.08)",
            borderBottom:"1px solid rgba(255,59,59,0.22)",
            animation:"border-pulse 2.5s ease-in-out infinite",
          }}
        >
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 text-[9px] font-black text-white"
            style={{ background:"#ff3b3b", minWidth:72 }}>
            ALERT
          </div>
          <div className="ml-[72px] overflow-hidden">
            <div className="flex whitespace-nowrap gap-12" style={{ animation:"ticker 24s linear infinite" }}>
              {[
                "🔴 SYSTEM ONLINE — ALL SECTORS MONITORING",
                "🟠 PROTOCOL ACTIVE — GEOFENCING ENABLED",
                "🟢 OPERATOR NODES CONNECTED — GRID STABLE",
                "🔴 SYSTEM ONLINE — ALL SECTORS MONITORING",
                "🟠 PROTOCOL ACTIVE — GEOFENCING ENABLED",
                "🟢 OPERATOR NODES CONNECTED — GRID STABLE",
              ].map((m,i) => (
                <span key={i} className="text-[#ff8c42]/70">{m}<span className="mx-6 opacity-25">◆</span></span>
              ))}
            </div>
          </div>
        </div>


        {/* ══ NAVBAR ══════════════════════════════════════════════════ */}
        <nav className="relative z-20 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {/* Radar icon */}
            <div className="relative h-10 w-10">
              <div className="absolute inset-0 rounded-full border border-[rgba(255,59,59,0.3)]" style={{ animation:"radar-cw 6s linear infinite" }} />
              <div className="absolute inset-[5px] rounded-full border border-[rgba(255,59,59,0.18)]" style={{ animation:"radar-ccw 4s linear infinite" }} />
              <div className="absolute inset-[10px] rounded-full bg-[#ff3b3b]" style={{ boxShadow:"0 0 12px 3px rgba(255,59,59,0.7)", animation:"blink-dot 1.4s ease-in-out infinite", color:"#ff3b3b" }} />
            </div>
            <div>
              <div className="f-display text-[22px] tracking-[3px] text-white leading-none">
                SENTINEL<span style={{ color:"var(--red)" }}>EWS</span>
              </div>
              <div className="f-mono text-[8px] tracking-[2px] text-white/22">EARLY WARNING SYSTEM</div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden items-center gap-6 md:flex">
            {["Architecture","Protocol","Deploy"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                className="f-mono text-[11px] tracking-widest text-white/38 transition-colors hover:text-[#00d4ff]"
              >
                {l}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link href="/dashboard"
            className="f-mono glass flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] tracking-widest text-white/60 transition-all hover:text-[#ff3b3b] hover:border-[rgba(255,59,59,0.35)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#00e676]" style={{ boxShadow:"0 0 5px #00e676", animation:"blink-dot 1.3s ease-in-out infinite", color:"#00e676" }} />
            OPERATOR LOGIN
          </Link>
        </nav>


        {/* ══ HERO ════════════════════════════════════════════════════ */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-16 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left column */}
            <div style={{ animation:"fade-up .8s cubic-bezier(.2,1,.4,1) both" }}>

              {/* System status badge */}
              <div className="f-mono mb-7 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[10px] tracking-widest text-[#00e676]"
                style={{ background:"rgba(0,230,118,.07)", border:"1px solid rgba(0,230,118,.22)" }}
              >
                <span className="h-2 w-2 rounded-full bg-[#00e676]" style={{ boxShadow:"0 0 7px #00e676", animation:"blink-dot 1.3s ease-in-out infinite", color:"#00e676" }} />
                SYSTEM ONLINE · ALL SECTORS MONITORING
              </div>

              {/* Headline */}
              <h1 className="f-display mb-6 text-[72px] leading-[0.92] tracking-[2px] text-white lg:text-[88px]"
                style={{ textShadow:"0 0 60px rgba(255,255,255,0.06)" }}
              >
                REAL-TIME<br />
                THREAT<br />
                <span style={{
                  background:"linear-gradient(90deg,#ff3b3b,#ff8c42,#ff3b3b)",
                  backgroundClip:"text", WebkitBackgroundClip:"text", color:"transparent",
                  backgroundSize:"200%", animation:"sweep-grad 3s ease infinite",
                }}>
                  INTELLIGENCE
                </span>
              </h1>

              {/* Sub */}
              <p className="mb-10 max-w-lg text-[15px] leading-[1.75] text-white/45">
                A geospatial Early Warning System designed to instantly broadcast localized hazards. 
                From severe flooding to venomous snake sightings — drop a pin, alert every connected 
                operator in the grid.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard"
                  className="btn-primary f-mono flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-[12px] tracking-widest text-white uppercase"
                >
                  ⚡ Initialize Command Center
                </Link>
                <a href="#architecture"
                  className="btn-outline glass f-mono flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-[12px] tracking-widest text-white/55 uppercase"
                >
                  ◈ View Architecture
                </a>
              </div>

              {/* Quick stats row */}
              <div className="mt-10 grid grid-cols-4 gap-3">
                {STATS.map((s, i) => (
                  <div key={i} className="text-center"
                    style={{ animation:`stat-count .6s cubic-bezier(.2,1,.4,1) ${.3+i*.08}s both` }}
                  >
                    <div className="f-display text-[22px] tracking-wider text-white">{s.value}</div>
                    <div className="f-mono mt-0.5 text-[8px] tracking-widest text-white/22 uppercase">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column — decorative radar */}
            <div className="hidden items-center justify-center lg:flex"
              style={{ animation:"fade-up .8s cubic-bezier(.2,1,.4,1) .15s both" }}
            >
              <div className="relative flex h-[420px] w-[420px] items-center justify-center">

                {/* Concentric rings */}
                {[380,300,220,140,70].map((s,i) => (
                  <div key={i} className="absolute rounded-full"
                    style={{
                      width:s, height:s,
                      border:`1px solid rgba(255,59,59,${0.05+i*0.04})`,
                      animation:`${i%2?"radar-ccw":"radar-cw"} ${20-i*3}s linear infinite`,
                    }}
                  />
                ))}

                {/* Sweep line */}
                <div className="absolute left-1/2 top-1/2 h-[190px] w-[1px] origin-bottom -translate-x-1/2"
                  style={{
                    background:"linear-gradient(to top,rgba(255,59,59,0.6),transparent)",
                    animation:"radar-cw 4s linear infinite",
                    transformOrigin:"bottom center",
                  }}
                />

                {/* Sweep glow */}
                <div className="absolute left-1/2 top-1/2 h-[190px] w-[30px] origin-bottom -translate-x-1/2 rounded-full opacity-20"
                  style={{
                    background:"linear-gradient(to top,rgba(255,59,59,0.8),transparent)",
                    animation:"radar-cw 4s linear infinite",
                    transformOrigin:"bottom center",
                    filter:"blur(6px)",
                  }}
                />

                {/* Grid crosshair */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:"linear-gradient(rgba(0,212,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.5) 1px,transparent 1px)",
                    backgroundSize:"40px 40px",
                  }}
                />

                {/* Threat blips */}
                {[
                  { top:"28%", left:"38%", c:"#ff3b3b", s:5 },
                  { top:"52%", left:"62%", c:"#ff8c42", s:4 },
                  { top:"68%", left:"30%", c:"#00e676", s:3 },
                  { top:"35%", left:"68%", c:"#ff3b3b", s:5 },
                  { top:"72%", left:"58%", c:"#00d4ff", s:3 },
                ].map((b,i) => (
                  <div key={i} className="absolute" style={{ top:b.top, left:b.left }}>
                    <div className="rounded-full" style={{
                      width:b.s, height:b.s,
                      background:b.c,
                      boxShadow:`0 0 ${b.s*3}px ${b.c}`,
                      animation:`blink-dot ${1+i*.2}s ease-in-out infinite`,
                      color:b.c,
                    }} />
                  </div>
                ))}

                {/* Center point */}
                <div className="relative z-10 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-white"
                    style={{ boxShadow:"0 0 20px 6px rgba(255,255,255,0.6)" }}
                  />
                </div>

                {/* Corner brackets */}
                {[
                  { top:8, left:8,  br:"border-t border-l" },
                  { top:8, right:8, br:"border-t border-r" },
                  { bottom:8, left:8,  br:"border-b border-l" },
                  { bottom:8, right:8, br:"border-b border-r" },
                ].map((c,i) => (
                  <div key={i} className={`absolute h-6 w-6 ${c.br}`}
                    style={{
                      top:(c as any).top, left:(c as any).left,
                      right:(c as any).right, bottom:(c as any).bottom,
                      borderColor:"rgba(0,212,255,0.4)",
                    }}
                  />
                ))}

                {/* Label */}
                <div className="f-mono absolute bottom-4 left-1/2 -translate-x-1/2 text-[9px] tracking-[3px] text-[#00d4ff]/40 uppercase">
                  RADAR · SECTOR 7
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* ══ FEATURE CARDS ═══════════════════════════════════════════ */}
        <section id="architecture" className="relative z-10 mx-auto max-w-7xl px-6 py-20">

          {/* Section header */}
          <div className="mb-12 flex items-end justify-between">
            <div>
              <div className="f-mono mb-2 text-[10px] tracking-[3px] text-[#ff3b3b] uppercase">
                ◆ Core Protocols
              </div>
              <h2 className="f-display text-[52px] tracking-[1px] text-white leading-none">
                SYSTEM ARCHITECTURE
              </h2>
            </div>
            <div className="f-mono hidden text-right text-[10px] tracking-widest text-white/20 md:block">
              v2.4.1 · BUILD STABLE<br />
              3 MODULES · OPERATIONAL
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.tag}
                className="feat-card glass rounded-2xl p-7 relative overflow-hidden"
                style={{
                  borderColor:`${f.accent}18`,
                  animation:`card-in .7s cubic-bezier(.2,1,.4,1) ${.1+i*.12}s both`,
                }}
              >
                {/* Top accent */}
                <div className="absolute left-0 right-0 top-0 h-[2px]"
                  style={{ background:`linear-gradient(90deg,transparent,${f.accent},transparent)` }}
                />

                {/* Protocol tag */}
                <div className="f-mono mb-5 text-[9px] tracking-[2.5px] uppercase" style={{ color: f.accent }}>
                  {f.tag}
                </div>

                {/* Icon */}
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{ background:`${f.accent}0f`, border:`1px solid ${f.accent}22`, boxShadow:`inset 0 0 20px ${f.accent}08` }}
                >
                  {f.icon}
                </div>

                {/* Title */}
                <h3 className="f-display mb-3 text-[22px] tracking-wide text-white">{f.title}</h3>

                {/* Body */}
                <p className="text-[13px] leading-[1.7] text-white/40">{f.body}</p>

                {/* Bottom glow on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background:`linear-gradient(90deg,transparent,${f.accent}60,transparent)` }}
                />
              </div>
            ))}
          </div>
        </section>


        {/* ══ TECH STACK STRIP ════════════════════════════════════════ */}
        <section className="relative z-10 border-y py-6" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="f-mono mr-4 text-[9px] tracking-[2px] text-white/20 uppercase">Built with:</span>
              {STACK.map(s => (
                <span key={s.name}
                  className="f-mono rounded-lg px-3 py-1.5 text-[10px] tracking-wider transition-all hover:-translate-y-0.5"
                  style={{
                    background:`${s.color}0c`,
                    border:`1px solid ${s.color}20`,
                    color:s.color,
                  }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </section>


        {/* ══ CTA BAND ════════════════════════════════════════════════ */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
          <div
            className="glass-red relative overflow-hidden rounded-3xl px-10 py-14 text-center"
            style={{ animation:"border-pulse 3s ease-in-out infinite" }}
          >
            {/* Inner glow */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl"
              style={{ background:"radial-gradient(ellipse at 50% 0%,rgba(255,59,59,0.10),transparent 65%)" }}
            />

            {/* Decorative corner radar */}
            <div className="pointer-events-none absolute -right-8 -top-8 opacity-10">
              <div className="relative h-32 w-32">
                {[120,80,40].map((s,i) => (
                  <div key={i} className="absolute rounded-full border border-[#ff3b3b]"
                    style={{ width:s,height:s,top:"50%",left:"50%",marginTop:-s/2,marginLeft:-s/2 }}
                  />
                ))}
              </div>
            </div>

            <div className="f-mono mb-3 text-[10px] tracking-[3px] text-[#ff8c42]">
              ◆ READY FOR DEPLOYMENT
            </div>
            <h2 className="f-display mb-5 text-[56px] tracking-[2px] text-white">
              PROTECT YOUR GRID
            </h2>
            <p className="mx-auto mb-10 max-w-lg text-[14px] leading-relaxed text-white/40">
              Whether you&apos;re managing disaster response, wildlife monitoring, or community safety — 
              Sentinel EWS gives your field operators a real-time edge.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard"
                className="btn-primary f-mono flex items-center gap-2.5 rounded-xl px-8 py-4 text-[12px] tracking-widest text-white uppercase"
              >
                🛡️ Initialize Command Center
              </Link>
              <Link href="/dashboard"
                className="btn-outline glass f-mono flex items-center gap-2.5 rounded-xl px-8 py-4 text-[12px] tracking-widest text-white/50 uppercase"
              >
                ◈ Operator Login
              </Link>
            </div>
          </div>
        </section>


        {/* ══ FOOTER ══════════════════════════════════════════════════ */}
        <footer className="relative z-10 border-t px-6 py-8"
          style={{ borderColor:"rgba(255,255,255,0.06)" }}
        >
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-[#ff3b3b]"
                style={{ boxShadow:"0 0 6px #ff3b3b", animation:"blink-dot 1.4s ease-in-out infinite", color:"#ff3b3b" }}
              />
              <span className="f-display text-[16px] tracking-[3px] text-white">
                SENTINEL<span style={{ color:"var(--red)" }}>EWS</span>
              </span>
            </div>

            {/* Center */}
            <p className="f-mono text-[10px] tracking-widest text-white/20">
              SENTINEL EWS · OPERATIONAL · {new Date().getFullYear()}
            </p>

            {/* Status */}
            <div className="f-mono flex items-center gap-2 text-[10px] tracking-widest text-[#00e676]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e676]"
                style={{ boxShadow:"0 0 5px #00e676", animation:"blink-dot 1.3s ease-in-out infinite", color:"#00e676" }}
              />
              ALL SYSTEMS NOMINAL
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}