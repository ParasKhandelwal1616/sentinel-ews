"use client";
import { useState } from "react";
import { Eye, EyeOff, Shield, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic: Here we will use 'axios' to send data to http://localhost:5000/api/auth/login
    console.log("Logging in with:", { email, password });
  };

  return (
    <>
      {/* ── Inline keyframes (no extra CSS file needed) ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Sora:wght@400;500;600&display=swap');

        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-40px) scale(1.06); }
          66%      { transform: translate(-20px,30px) scale(0.94); }
        }
        @keyframes gridPulse {
          0%,100% { opacity: 0.6; }
          50%      { opacity: 0.18; }
        }
        @keyframes scan {
          from { top: -2px; }
          to   { top: 100%; }
        }
        @keyframes logoPulse {
          0%,100% { box-shadow: 0 0 18px rgba(0,212,255,0.45); }
          50%      { box-shadow: 0 0 40px rgba(0,212,255,0.75), 0 0 70px rgba(0,212,255,0.25); }
        }
        @keyframes gradientSweep {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes radarSpin {
          to { transform: rotate(360deg); }
        }

        .sentinel-font  { font-family: 'Orbitron', monospace; }
        .sora-font      { font-family: 'Sora', sans-serif; }

        .glass {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .input-sentinel {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 14px 16px 14px 44px;
          font-size: 13px;
          font-family: 'Sora', sans-serif;
          color: #e8f4ff;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .input-sentinel::placeholder { color: rgba(200,225,255,0.30); }
        .input-sentinel:focus {
          border-color: #00d4ff;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.14);
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #00d4ff, #b44fff);
          background-size: 200%;
          animation: gradientSweep 3s ease infinite;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          transform: scale(1.02);
          box-shadow: 0 0 32px rgba(0,212,255,0.45);
        }
        .btn-primary:active { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .card-fade { animation: fadeUp 0.7s cubic-bezier(0.2,1,0.4,1) both; }
        .radar-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(0,212,255,0.08);
          animation: radarSpin linear infinite;
        }
      `}</style>

      <div
        className="sora-font"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 30% 50%, #020c1b 0%, #000810 55%, #010508 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "20px",
        }}
      >
        {/* ── Animated orbs ── */}
        {[
          {
            w: 560,
            h: 560,
            top: "-15%",
            left: "-12%",
            c: "rgba(0,212,255,0.07)",
            d: "0s",
          },
          {
            w: 440,
            h: 440,
            bottom: "-10%",
            right: "-10%",
            c: "rgba(180,79,255,0.07)",
            d: "5s",
          },
          {
            w: 340,
            h: 340,
            top: "40%",
            left: "50%",
            c: "rgba(0,255,136,0.05)",
            d: "10s",
          },
        ].map((o, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: o.w,
              height: o.h,
              top: (o as any).top,
              left: (o as any).left,
              right: (o as any).right,
              bottom: (o as any).bottom,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${o.c}, transparent 70%)`,
              filter: "blur(65px)",
              animation: `orbDrift 16s ease-in-out ${o.d} infinite`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* ── Grid overlay ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            animation: "gridPulse 5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        {/* ── Scanline ── */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(0,212,255,0.7), transparent)",
            animation: "scan 7s linear infinite",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />

        {/* ── Radar rings (decorative) ── */}
        {[220, 340, 460].map((size, i) => (
          <div
            key={i}
            className="radar-ring"
            style={{
              width: size,
              height: size,
              top: "50%",
              left: "50%",
              marginTop: -size / 2,
              marginLeft: -size / 2,
              animationDuration: `${10 + i * 5}s`,
              animationDirection: i % 2 === 0 ? "normal" : "reverse",
              opacity: 0.5,
            }}
          />
        ))}

        {/* ── Login Card ── */}
        <div
          className="glass card-fade"
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 28,
            padding: "40px 36px 36px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Top gradient line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, #00d4ff, #b44fff, transparent)",
            }}
          />

          {/* Inner glow */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: "50%",
              transform: "translateX(-50%)",
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(0,212,255,0.09), transparent 70%)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }}
          />

          {/* ── Logo ── */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <div
              className="sentinel-font"
              style={{
                width: 52,
                height: 52,
                borderRadius: 16,
                background: "linear-gradient(135deg, #00d4ff, #b44fff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                marginBottom: 14,
                animation: "logoPulse 2.5s ease-in-out infinite",
              }}
            >
              🛡️
            </div>
            <div
              className="sentinel-font"
              style={{
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 4,
                color: "#e8f4ff",
              }}
            >
              SENTINEL
            </div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(200,225,255,0.35)",
                marginTop: 5,
              }}
            >
              Welcome Back, Guardian
            </div>
          </div>

          {/* ── Form ── */}
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            {/* Email */}
            <div style={{ position: "relative" }}>
              <Mail
                size={15}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(200,225,255,0.30)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="input-sentinel"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{
                  position: "absolute",
                  left: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(200,225,255,0.30)",
                  pointerEvents: "none",
                }}
              />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Password"
                required
                className="input-sentinel"
                style={{ paddingRight: 44 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(200,225,255,0.35)",
                  padding: 0,
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: "right", marginTop: -4 }}>
              <span
                style={{
                  fontSize: 11,
                  color: "#00d4ff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Forgot Password?
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "white",
                      animation: "radarSpin 0.7s linear infinite",
                    }}
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield size={15} />
                  Sign In to Sentinel
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "4px 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <span style={{ fontSize: 10, color: "rgba(200,225,255,0.25)" }}>
                OR
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </div>

            {/* Google */}
            <button
              type="button"
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(10px)",
                fontFamily: "'Sora', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: "rgba(232,244,255,0.75)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s, transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.09)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
              }
            >
              <span style={{ fontSize: 16 }}>🌐</span>
              Continue with Google
            </button>

            {/* Sign up link */}
            <p
              style={{
                textAlign: "center",
                fontSize: 12,
                color: "rgba(200,225,255,0.35)",
                marginTop: 4,
              }}
            >
              Don&apos;t have an account?{" "}
              <span
                style={{ color: "#00d4ff", fontWeight: 700, cursor: "pointer" }}
              >
                Sign Up
              </span>
            </p>
          </form>

          {/* Bottom gradient line */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(180,79,255,0.4), transparent)",
            }}
          />
        </div>
      </div>
    </>
  );
}
