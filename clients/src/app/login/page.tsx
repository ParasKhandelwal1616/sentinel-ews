"use client";
import { useState } from "react";
import { Eye, EyeOff, Shield, ArrowRight, Lock, Mail } from "lucide-react";
import axios from "axios";
import api from "@/src/lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const responce = await api.post("/auth/login", {
        email: email,
        password: password,
      });
      console.log(responce.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
    console.log("Logging in with:", { email, password });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@400;500;600;700&display=swap');

        @keyframes orb-drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(50px,-45px) scale(1.07); }
          66%      { transform: translate(-30px,35px) scale(0.93); }
        }
        @keyframes grid-pulse {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 0.12; }
        }
        @keyframes scanline {
          from { top: -1px; }
          to   { top: 100%; }
        }
        @keyframes logo-glow {
          0%,100% { box-shadow: 0 0 20px 2px rgba(0,212,255,0.5); }
          50%      { box-shadow: 0 0 48px 8px rgba(0,212,255,0.8), 0 0 90px 12px rgba(180,79,255,0.3); }
        }
        @keyframes gradient-sweep {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(36px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin-loader {
          to { transform: rotate(360deg); }
        }
        @keyframes radar-cw  { to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes radar-ccw { to { transform: translate(-50%, -50%) rotate(-360deg); } }
        @keyframes accent-expand {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes dot-pulse {
          0%,100% { opacity: 1;   box-shadow: 0 0 6px 2px rgba(0,255,136,0.8); }
          50%      { opacity: 0.2; box-shadow: none; }
        }
        @keyframes float-y {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }

        .font-orbitron { font-family: 'Orbitron', monospace; }
        .font-sora     { font-family: 'Sora', sans-serif; }

        /* Glass */
        .glass {
          background: rgba(255,255,255,0.038);
          border: 1px solid rgba(255,255,255,0.09);
          backdrop-filter: blur(26px);
          -webkit-backdrop-filter: blur(26px);
        }

        /* Input */
        .s-input {
          width: 100%;
          background: rgba(255,255,255,0.048);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 14px;
          padding: 13px 16px 13px 44px;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          color: #e8f4ff;
          outline: none;
          transition: border-color 0.22s, box-shadow 0.22s, background 0.22s;
        }
        .s-input::placeholder { color: rgba(200,225,255,0.26); }
        .s-input:focus {
          border-color: #00d4ff;
          background: rgba(0,212,255,0.055);
          box-shadow: 0 0 0 3px rgba(0,212,255,0.12);
        }

        /* Gradient CTA */
        .btn-cta {
          background: linear-gradient(135deg, #00d4ff, #7c3aed, #b44fff);
          background-size: 220% 220%;
          animation: gradient-sweep 3s ease infinite;
          border: none;
          transition: transform 0.17s, box-shadow 0.17s;
        }
        .btn-cta:hover:not(:disabled) {
          transform: scale(1.025) translateY(-1px);
          box-shadow: 0 0 38px 5px rgba(0,212,255,0.42), 0 10px 28px rgba(0,0,0,0.45);
        }
        .btn-cta:active:not(:disabled) { transform: scale(0.975); }
        .btn-cta:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }

        /* Spinner */
        .loader {
          width: 15px; height: 15px; flex-shrink: 0;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          animation: spin-loader 0.6s linear infinite;
        }

        /* Radar rings */
        .radar {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(0,212,255,0.065);
        }

        /* Card */
        .card-in { animation: card-enter 0.8s cubic-bezier(0.16,1.08,0.36,1) both; }

        /* Accent line */
        .accent-line { animation: accent-expand 1s cubic-bezier(0.2,1,0.4,1) 0.25s both; transform-origin: center; }

        /* Live dot */
        .live-dot { animation: dot-pulse 1.4s ease-in-out infinite; }

        /* Shield float */
        .shield-float { animation: float-y 3.5s ease-in-out infinite; }
      `}</style>

      <main
        className="font-sora relative flex min-h-screen items-center justify-center overflow-hidden p-4"
        style={{
          background: "radial-gradient(ellipse at 22% 44%, #020e20 0%, #00070f 52%, #010407 100%)",
        }}
      >
        {/* ── Orbs ── */}
        {[
          { size: 600, top: "-14%", left: "-11%", color: "rgba(0,212,255,0.08)", delay: "0s" },
          { size: 480, bottom: "-12%", right: "-10%", color: "rgba(180,79,255,0.08)", delay: "5s" },
          { size: 360, top: "38%", left: "54%", color: "rgba(0,255,136,0.055)", delay: "10s" },
        ].map((o, i) => (
          <div
            key={i}
            className="pointer-events-none absolute rounded-full"
            style={{
              width: o.size, height: o.size,
              top: (o as any).top, left: (o as any).left,
              right: (o as any).right, bottom: (o as any).bottom,
              background: `radial-gradient(circle, ${o.color}, transparent 68%)`,
              filter: "blur(72px)",
              animation: `orb-drift 16s ease-in-out ${o.delay} infinite`,
            }}
          />
        ))}

        {/* ── Dot grid ── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(0,212,255,0.16) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
            animation: "grid-pulse 5s ease-in-out infinite",
          }}
        />

        {/* ── Scanline ── */}
        <div
          className="pointer-events-none absolute left-0 right-0 opacity-20"
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.95) 50%, transparent)",
            animation: "scanline 7.5s linear infinite",
          }}
        />

        {/* ── Radar rings ── */}
        {[
          { size: 230, anim: "radar-cw",  dur: "12s" },
          { size: 390, anim: "radar-ccw", dur: "20s" },
          { size: 560, anim: "radar-cw",  dur: "30s" },
          { size: 730, anim: "radar-ccw", dur: "42s" },
        ].map((r, i) => (
          <div
            key={i}
            className="radar"
            style={{ width: r.size, height: r.size, animation: `${r.anim} ${r.dur} linear infinite` }}
          />
        ))}

        {/* Center blip */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 5, height: 5, background: "#00d4ff", boxShadow: "0 0 14px 4px rgba(0,212,255,0.7)" }}
        />

        {/* ═══════════════════════════════
            CARD
        ═══════════════════════════════ */}
        <div
          className="glass card-in relative w-full overflow-hidden rounded-[30px] px-8 pb-8 pt-9 shadow-2xl"
          style={{ maxWidth: 414 }}
        >
          {/* Top accent */}
          <div
            className="accent-line absolute left-0 right-0 top-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #00d4ff 35%, #b44fff 65%, transparent)" }}
          />

          {/* Card inner glow */}
          <div
            className="pointer-events-none absolute left-1/2 rounded-full"
            style={{
              width: 300, height: 200, top: -90,
              transform: "translateX(-50%)",
              background: "radial-gradient(ellipse, rgba(0,212,255,0.09), transparent 70%)",
              filter: "blur(28px)",
            }}
          />

          {/* ── Logo ── */}
          <div className="mb-8 flex flex-col items-center gap-1">
            <div
              className="shield-float font-orbitron mb-3 flex items-center justify-center rounded-[18px] text-[26px]"
              style={{
                width: 56, height: 56,
                background: "linear-gradient(135deg, #00d4ff, #b44fff)",
                animation: "logo-glow 2.8s ease-in-out infinite, float-y 3.5s ease-in-out infinite",
              }}
            >
              🛡️
            </div>

            <h1 className="font-orbitron text-[23px] font-black tracking-[4px] text-[#ecf4ff]">
              SENTINEL
            </h1>

            <div className="flex items-center gap-2 mt-1">
              <span
                className="live-dot inline-block h-[6px] w-[6px] rounded-full bg-[#00ff88]"
              />
              <span className="text-[9px] uppercase tracking-[2.5px] text-white/28">
                Welcome Back, Guardian
              </span>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="flex flex-col gap-3">

            {/* Email */}
            <div className="relative">
              <Mail
                size={14}
                className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-white/25"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="s-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock
                size={14}
                className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-white/25"
              />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                required
                className="s-input"
                style={{ paddingRight: 44 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-[13px] top-1/2 -translate-y-1/2 border-none bg-transparent p-0 text-white/28 transition-colors hover:text-[#00d4ff]"
                style={{ cursor: "pointer" }}
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Forgot */}
            <div className="-mt-1 text-right">
              <span className="cursor-pointer text-[11px] font-semibold text-[#00d4ff] transition-opacity hover:opacity-70">
                Forgot Password?
              </span>
            </div>

            {/* CTA button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-cta mt-0.5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] py-[13px] text-[13px] font-bold tracking-wide text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {loading ? (
                <>
                  <span className="loader" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={14} />
                  Sign In to Sentinel
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="my-0.5 flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.20)" }}>OR</span>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Google */}
            <button
              type="button"
              className="glass flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[14px] py-3 text-[13px] font-semibold text-white/55 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.07] hover:text-white/80"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {/* Real Google SVG icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Switch to signup */}
            <p className="mt-1 text-center text-[12px]" style={{ color: "rgba(200,225,255,0.28)" }}>
              Don&apos;t have an account?{" "}
              <span className="cursor-pointer font-bold text-[#00d4ff] transition-opacity hover:opacity-70">
                Sign Up
              </span>
            </p>
          </form>

          {/* Bottom accent */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(180,79,255,0.5), transparent)" }}
          />
        </div>
      </main>
    </>
  );
}