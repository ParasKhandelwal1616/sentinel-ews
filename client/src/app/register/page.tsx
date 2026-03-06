"use client";
import { useState } from "react";
import { useAuth } from "@/src/context/Auth";
import Link from "next/link";
import axios from "axios";

interface Orb {
  w: number;
  top?: string;
  left?: string;
  bottom?: string;
  right?: string;
  c: string;
  d: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { register } = useAuth();

  const handleGoogleLogin = () => {
    // Logic: Redirect to your backend Google Auth route
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(formData);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed. Try again.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const orbs: Orb[] = [
    { w:560, top:"-14%",   left:"-11%",  c:"rgba(0,230,118,.07)",  d:"0s"  },
    { w:440, bottom:"-12%",right:"-9%",   c:"rgba(0,212,255,.07)",  d:"5s"  },
    { w:300, top:"32%",    left:"52%",    c:"rgba(180,79,255,.055)",d:"11s" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@500;600;700&family=Sora:wght@400;500;600&display=swap');

        @keyframes orb {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(44px,-38px) scale(1.07); }
          66%      { transform:translate(-26px,30px) scale(0.93); }
        }
        @keyframes dots-pulse {
          0%,100% { opacity:.45; }
          50%      { opacity:.10; }
        }
        @keyframes scanline {
          from { top:-1px; }
          to   { top:100%; }
        }
        @keyframes radar-cw  { to { transform:translate(-50%,-50%) rotate(360deg);  } }
        @keyframes radar-ccw { to { transform:translate(-50%,-50%) rotate(-360deg); } }
        @keyframes blink {
          0%,100% { opacity:1; }
          50%      { opacity:.15; }
        }
        @keyframes logo-pulse {
          0%,100% { box-shadow:0 0 20px rgba(0,212,255,.5); }
          50%      { box-shadow:0 0 44px rgba(0,212,255,.8), 0 0 72px rgba(180,79,255,.3); }
        }
        @keyframes card-in {
          from { opacity:0; transform:translateY(30px) scale(.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes sweep {
          0%,100% { background-position:0% 50%; }
          50%      { background-position:100% 50%; }
        }
        @keyframes spin {
          to { transform:rotate(360deg); }
        }
        @keyframes error-in {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes field-in {
          from { opacity:0; transform:translateX(-10px); }
          to   { opacity:1; transform:translateX(0); }
        }

        .f-mono    { font-family:'Share Tech Mono', monospace; }
        .f-display { font-family:'Rajdhani', sans-serif; }
        .f-body    { font-family:'Sora', sans-serif; }

        .glass {
          background: rgba(0,8,20,.60);
          border: 1px solid rgba(255,255,255,.09);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
        }

        .s-input {
          width:100%;
          background:rgba(0,212,255,.03);
          border:1px solid rgba(255,255,255,.09);
          border-radius:12px;
          padding:12px 14px;
          font-size:13px;
          font-family:'Sora',sans-serif;
          color:#dff0ff;
          outline:none;
          transition:border-color .22s, box-shadow .22s, background .22s;
        }
        .s-input::placeholder { color:rgba(200,225,255,.22); }
        .s-input:focus {
          border-color:#00d4ff;
          background:rgba(0,212,255,.06);
          box-shadow:0 0 0 3px rgba(0,212,255,.11);
        }

        /* green CTA for register */
        .btn-register {
          background:linear-gradient(135deg,#00e676,#00b8d4,#00d4ff);
          background-size:220%;
          animation:sweep 3.2s ease infinite;
          transition:transform .16s, box-shadow .16s;
          border:none;
        }
        .btn-register:hover:not(:disabled) {
          transform:scale(1.02) translateY(-1px);
          box-shadow:0 0 34px rgba(0,230,118,.40), 0 10px 28px rgba(0,0,0,.4);
        }
        .btn-register:disabled { opacity:.6; cursor:not-allowed; transform:none !important; }

        .btn-google {
          background:rgba(255,255,255,.05);
          border:1px solid rgba(255,255,255,.10);
          transition:background .2s, transform .15s, border-color .2s;
        }
        .btn-google:hover {
          background:rgba(255,255,255,.09);
          border-color:rgba(255,255,255,.18);
          transform:scale(1.01);
        }

        /* stagger each field */
        .field-1 { animation:field-in .45s cubic-bezier(.2,1,.4,1) .10s both; }
        .field-2 { animation:field-in .45s cubic-bezier(.2,1,.4,1) .18s both; }
        .field-3 { animation:field-in .45s cubic-bezier(.2,1,.4,1) .26s both; }
      `}</style>

      <div
        className="f-body relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8"
        style={{ background:"radial-gradient(ellipse at 75% 45%, #020e20 0%, #00060d 55%, #010407 100%)" }}
      >
        {/* ── ambient orbs ───────────────────────────────────────── */}
        {orbs.map((o,i) => (
          <div key={i} className="pointer-events-none absolute rounded-full"
            style={{
              width:o.w, height:o.w,
              top:o.top, left:o.left,
              right:o.right, bottom:o.bottom,
              background:`radial-gradient(circle,${o.c},transparent 68%)`,
              filter:"blur(72px)",
              animation:`orb 17s ease-in-out ${o.d} infinite`,
            }}
          />
        ))}

        {/* dot grid */}
        <div className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:"radial-gradient(rgba(0,230,118,.07) 1px,transparent 1px)",
            backgroundSize:"28px 28px",
            animation:"dots-pulse 5s ease-in-out infinite",
          }}
        />

        {/* scanline */}
        <div className="pointer-events-none absolute left-0 right-0 opacity-[.13]"
          style={{
            height:1,
            background:"linear-gradient(90deg,transparent,rgba(0,230,118,.8) 50%,transparent)",
            animation:"scanline 9s linear infinite",
          }}
        />

        {/* radar rings */}
        {[200,320,450,590].map((s,i) => (
          <div key={i} className="pointer-events-none absolute rounded-full"
            style={{
              width:s, height:s,
              top:"50%", left:"50%",
              border:"1px solid rgba(0,230,118,.045)",
              animation:`${i%2===0?"radar-cw":"radar-ccw"} ${12+i*7}s linear infinite`,
            }}
          />
        ))}

        {/* center blip */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width:5, height:5, background:"#00e676", boxShadow:"0 0 14px 4px rgba(0,230,118,.7)" }}
        />

        {/* ══ CARD ═════════════════════════════════════════════════ */}
        <div
          className="glass relative w-full overflow-hidden rounded-[28px] px-8 pb-8 pt-9 shadow-2xl"
          style={{ maxWidth:420, animation:"card-in .8s cubic-bezier(.16,1.08,.36,1) both" }}
        >
          {/* top accent — green for register */}
          <div className="absolute left-0 right-0 top-0 h-px"
            style={{ background:"linear-gradient(90deg,transparent,#00e676 30%,#00d4ff 70%,transparent)" }}
          />

          {/* inner glow */}
          <div className="pointer-events-none absolute left-1/2 rounded-full"
            style={{
              width:300, height:200, top:-90,
              transform:"translateX(-50%)",
              background:"radial-gradient(ellipse,rgba(0,230,118,.08),transparent 70%)",
              filter:"blur(28px)",
            }}
          />

          {/* ── logo ── */}
          <div className="mb-6 flex flex-col items-center">
            <div
              className="mb-4 flex items-center justify-center rounded-[18px] text-[26px]"
              style={{
                width:56, height:56,
                background:"linear-gradient(135deg,#00e676,#00d4ff)",
                animation:"logo-pulse 2.8s ease-in-out infinite",
              }}
            >
              🛡️
            </div>
            <h1 className="f-display text-[24px] font-bold tracking-[4px] text-white">
              JOIN <span style={{ color:"#00e676" }}>SENTINEL</span>
            </h1>
            <p className="f-mono mt-1.5 text-[9px] tracking-[2px] text-white/30 uppercase">
              Create your operator account
            </p>

            {/* enrollment badge */}
            <div className="mt-2.5 flex items-center gap-2 rounded-full px-3 py-1"
              style={{ background:"rgba(0,230,118,.07)", border:"1px solid rgba(0,230,118,.18)" }}
            >
              <span className="inline-block h-[5px] w-[5px] rounded-full bg-[#00e676]"
                style={{ boxShadow:"0 0 5px #00e676", animation:"blink 1.4s ease-in-out infinite" }}
              />
              <span className="f-mono text-[8px] tracking-[2px] text-[#00e676]/70 uppercase">
                Enrollment Open
              </span>
            </div>
          </div>

          {/* ── error ── */}
          {error && (
            <div
              className="f-mono mb-4 flex items-start gap-2 rounded-xl p-3 text-[11px] text-[#ff3b3b]"
              style={{
                background:"rgba(255,59,59,.08)",
                border:"1px solid rgba(255,59,59,.25)",
                animation:"error-in .3s ease both",
              }}
            >
              <span className="mt-0.5 flex-shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── google ── */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn-google mb-5 flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[13px] py-3 text-[12px] font-semibold text-white/55"
            style={{ fontFamily:"'Sora',sans-serif" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* divider */}
          <div className="relative mb-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background:"rgba(255,255,255,.07)" }} />
            <span className="f-mono text-[9px] uppercase tracking-[2px] text-white/20">
              Or manual entry
            </span>
            <div className="h-px flex-1" style={{ background:"rgba(255,255,255,.07)" }} />
          </div>

          {/* ── form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">

            {/* name */}
            <div className="field-1">
              <label className="f-mono mb-1.5 block text-[9px] uppercase tracking-[2px] text-white/30">
                Full Name
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px]">👤</span>
                <input
                  type="text"
                  placeholder="Paras Sharma"
                  required
                  className="s-input"
                  style={{ paddingLeft:38 }}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* email */}
            <div className="field-2">
              <label className="f-mono mb-1.5 block text-[9px] uppercase tracking-[2px] text-white/30">
                Email Address
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px]">📧</span>
                <input
                  type="email"
                  placeholder="paras@example.com"
                  required
                  className="s-input"
                  style={{ paddingLeft:38 }}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* password */}
            <div className="field-3">
              <label className="f-mono mb-1.5 block text-[9px] uppercase tracking-[2px] text-white/30">
                Create Password
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px]">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Create a strong password"
                  required
                  className="s-input"
                  style={{ paddingLeft:38, paddingRight:44 }}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-[13px] transition-opacity hover:opacity-70"
                  style={{ cursor:"pointer" }}
                  tabIndex={-1}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-register mt-1 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] py-[13px] text-[13px] font-bold tracking-wider text-white"
              style={{ fontFamily:"'Sora',sans-serif" }}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/25 border-t-white"
                    style={{ animation:"spin .65s linear infinite" }} />
                  ENROLLING...
                </>
              ) : (
                <>🛡️ CREATE OPERATOR ACCOUNT</>
              )}
            </button>

            {/* login link */}
            <p className="f-mono mt-1 text-center text-[11px] text-white/28">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#00d4ff] transition-opacity hover:opacity-70"
              >
                Login →
              </Link>
            </p>
          </form>

          {/* bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background:"linear-gradient(90deg,transparent,rgba(0,230,118,.4),transparent)" }}
          />
        </div>
      </div>
    </>
  );
}