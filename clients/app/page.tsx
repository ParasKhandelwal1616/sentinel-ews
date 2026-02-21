"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Sun,
  Moon,
  X,
  Eye,
  EyeOff,
  ArrowRight,
  // MapPin, Bell, Brain, Navigation, Wifi, Users, Radio, Activity — re-add when FEATURES/STATS data is populated
  Zap,
  AlertTriangle,
  ChevronDown,
  Github,
  Twitter,
  Globe,
  Lock,
  Mail,
  User,
} from "lucide-react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type Modal = "login" | "signup" | null;
type Theme = "dark" | "light";

/* ─────────────────────────────────────────────
   DATA — TODO: replace with API / CMS / props
───────────────────────────────────────────── */

// TODO: fetch from /api/features or import from a CMS
const FEATURES: {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}[] = [];

// TODO: fetch from /api/stats (live counts from DB)
const STATS: {
  value: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [];

// TODO: fetch from /api/tech-stack or define in a config file
const TECH: {
  name: string;
  color: string;
  bg: string;
}[] = [];

// TODO: fetch from /api/alerts (live WebSocket / polling)
const TICKER_ALERTS: string[] = [];

/* ─────────────────────────────────────────────
   BACKGROUND
───────────────────────────────────────────── */
function Background({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? "radial-gradient(ellipse at 20% 50%, #020c1b 0%, #000810 60%, #010508 100%)"
            : "radial-gradient(ellipse at 20% 50%, #deeeff 0%, #c8daff 60%, #d8e8ff 100%)",
        }}
      />

      {/* Orbs */}
      {[
        {
          w: 600,
          h: 600,
          t: "-10%",
          l: "-10%",
          c: dark ? "rgba(0,212,255,0.07)" : "rgba(0,120,255,0.12)",
          d: "0s",
        },
        {
          w: 500,
          h: 500,
          t: "30%",
          r: "-8%",
          c: dark ? "rgba(180,79,255,0.07)" : "rgba(120,50,255,0.10)",
          d: "4s",
        },
        {
          w: 400,
          h: 400,
          b: "-5%",
          l: "25%",
          c: dark ? "rgba(0,255,136,0.05)" : "rgba(0,180,100,0.10)",
          d: "8s",
        },
      ].map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.w,
            height: o.h,
            top: (o as any).t,
            left: (o as any).l,
            right: (o as any).r,
            bottom: (o as any).b,
            background: `radial-gradient(circle, ${o.c}, transparent 70%)`,
            filter: "blur(60px)",
            animation: `orbDrift 16s ease-in-out ${o.d} infinite`,
          }}
        />
      ))}

      {/* Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: dark
            ? "linear-gradient(rgba(0,212,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.03) 1px,transparent 1px)"
            : "linear-gradient(rgba(0,80,200,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,80,200,0.05) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          animation: "gridPulse 5s ease-in-out infinite",
        }}
      />

      {/* Scanline */}
      <div
        className="absolute left-0 right-0 h-[1px] opacity-30"
        style={{
          background: dark
            ? "linear-gradient(90deg,transparent,rgba(0,212,255,0.8),transparent)"
            : "linear-gradient(90deg,transparent,rgba(0,100,200,0.5),transparent)",
          animation: "scan 8s linear infinite",
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar({
  theme,
  toggleTheme,
  openModal,
  scrolled,
}: {
  theme: Theme;
  toggleTheme: () => void;
  openModal: (m: Modal) => void;
  scrolled: boolean;
}) {
  const dark = theme === "dark";
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.2, 1, 0.4, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div
          className={`glass rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? "shadow-2xl" : ""}`}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 16px rgba(0,212,255,0.4)",
                  "0 0 32px rgba(0,212,255,0.7)",
                  "0 0 16px rgba(0,212,255,0.4)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "linear-gradient(135deg,#00d4ff,#b44fff)" }}
            >
              🛡️
            </motion.div>
            <div>
              <div
                className={`font-orbitron text-base font-black tracking-[3px] ${dark ? "text-white" : "text-gray-900"}`}
              >
                SENTINEL
              </div>
              <div
                className={`text-[8px] tracking-[1.5px] uppercase ${dark ? "text-white/30" : "text-gray-400"} hidden sm:block`}
              >
                Early Warning System
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {["Features", "Tech Stack", "About"].map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(" ", "-")}`}
                className={`text-[12px] font-semibold tracking-wide transition-colors hover:text-[#00d4ff] ${dark ? "text-white/60" : "text-gray-500"}`}
              >
                {l}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Live badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider text-[#00ff88]"
              style={{
                background: "rgba(0,255,136,0.08)",
                border: "1px solid rgba(0,255,136,0.25)",
              }}
            >
              <motion.span
                animate={{ opacity: [1, 0.1, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-[#00ff88] inline-block"
              />
              LIVE
            </div>

            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="glass w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
            >
              {dark ? (
                <Sun size={15} className="text-[#00d4ff]" />
              ) : (
                <Moon size={15} className="text-blue-600" />
              )}
            </motion.button>

            <motion.button
              onClick={() => openModal("login")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`glass px-4 py-2 rounded-xl text-[12px] font-semibold tracking-wide cursor-pointer ${dark ? "text-white/80" : "text-gray-700"}`}
            >
              Log In
            </motion.button>

            <motion.button
              onClick={() => openModal("signup")}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 0 28px rgba(0,212,255,0.5)",
              }}
              whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-xl text-[12px] font-bold tracking-wide cursor-pointer text-white"
              style={{ background: "linear-gradient(135deg,#00d4ff,#b44fff)" }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

/* ─────────────────────────────────────────────
   TICKER
───────────────────────────────────────────── */
function AlertTicker({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  const items = [...TICKER_ALERTS, ...TICKER_ALERTS];
  return (
    <div
      className="relative overflow-hidden py-2 px-0"
      style={{
        background: dark ? "rgba(255,68,68,0.06)" : "rgba(255,68,68,0.05)",
        borderTop: "1px solid rgba(255,68,68,0.2)",
        borderBottom: "1px solid rgba(255,68,68,0.2)",
      }}
    >
      <div className="flex items-center gap-3 mb-0">
        <div
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-3 text-[10px] font-black tracking-widest text-white"
          style={{ background: "#ff4444", minWidth: 80 }}
        >
          ALERTS
        </div>
        <div className="ml-[80px] overflow-hidden">
          <div
            className="flex gap-8 whitespace-nowrap"
            style={{ animation: "ticker 22s linear infinite" }}
          >
            {items.map((a, i) => (
              <span
                key={i}
                className={`text-[11px] font-medium ${dark ? "text-white/70" : "text-gray-600"}`}
              >
                {a}
                <span className="mx-4 opacity-30">|</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero({
  theme,
  openModal,
}: {
  theme: Theme;
  openModal: (m: Modal) => void;
}) {
  const dark = theme === "dark";
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-4 text-center">
      {/* Radar ring graphic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: i * 280,
              height: i * 280,
              border: dark
                ? `1px solid rgba(0,212,255,${0.1 - i * 0.025})`
                : `1px solid rgba(0,100,200,${0.1 - i * 0.025})`,
              animation: `radarSpin ${8 + i * 4}s linear infinite ${i % 2 === 0 ? "reverse" : ""}`,
            }}
          >
            {/* Sweep indicator */}
            {i === 2 && (
              <div
                className="absolute top-0 left-1/2 w-0.5 h-1/2 -translate-x-1/2 origin-bottom"
                style={{
                  background: dark
                    ? "linear-gradient(to top,rgba(0,212,255,0.5),transparent)"
                    : "linear-gradient(to top,rgba(0,100,200,0.3),transparent)",
                }}
              />
            )}
          </div>
        ))}
        <div
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: dark ? "#00d4ff" : "#0066cc",
            boxShadow: dark
              ? "0 0 20px rgba(0,212,255,0.8)"
              : "0 0 12px rgba(0,100,200,0.5)",
          }}
        />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 text-[11px] font-semibold tracking-wider"
        style={{ color: "#00d4ff" }}
      >
        <Zap size={12} />
        AI-POWERED · REAL-TIME · LIFE-SAVING
        <Zap size={12} />
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.2, 1, 0.4, 1] }}
        className="font-orbitron text-4xl sm:text-6xl lg:text-7xl font-black mb-6 leading-none relative z-10"
        style={{ color: dark ? "white" : "#0a1628" }}
      >
        SENTINEL
        <br />
        <span
          className="text-3xl sm:text-4xl lg:text-5xl font-bold"
          style={{
            background: "linear-gradient(90deg,#00d4ff,#b44fff,#00ff88)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            backgroundSize: "200%",
            animation: "gradientSweep 4s ease infinite",
          }}
        >
          EARLY WARNING SYSTEM
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7 }}
        className="max-w-2xl text-base sm:text-lg mb-10 leading-relaxed relative z-10"
        style={{
          color: dark ? "rgba(200,225,255,0.65)" : "rgba(30,60,120,0.70)",
        }}
      >
        A distributed, AI-powered disaster early warning platform with real-time
        geospatial intelligence, crowdsourced SOS, and multi-channel alerting —
        built to save lives at scale.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-wrap gap-3 justify-center mb-12 relative z-10"
      >
        <motion.button
          onClick={() => openModal("signup")}
          whileHover={{
            scale: 1.04,
            boxShadow: "0 0 40px rgba(0,212,255,0.5)",
          }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm tracking-wide text-white cursor-pointer"
          style={{
            background: "linear-gradient(135deg,#00d4ff,#b44fff)",
            backgroundSize: "200%",
            animation: "gradientSweep 4s ease infinite",
          }}
        >
          <Shield size={16} />
          Join Sentinel Now
          <ArrowRight size={16} />
        </motion.button>

        <motion.button
          onClick={() => openModal("login")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-sm tracking-wide cursor-pointer"
          style={{
            background: dark
              ? "rgba(255,255,255,0.06)"
              : "rgba(255,255,255,0.7)",
            border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,80,200,0.2)"}`,
            backdropFilter: "blur(12px)",
            color: dark ? "white" : "#1a3a6a",
          }}
        >
          <User size={16} />
          Sign In to Dashboard
        </motion.button>
      </motion.div>

      {/* Mini stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap justify-center gap-3 relative z-10"
      >
        {STATS.map((s, i) => (
          <div
            key={i}
            className="glass px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ minWidth: 120 }}
          >
            <span style={{ color: s.color }}>{s.icon}</span>
            <div>
              <div
                className="font-orbitron text-lg font-bold"
                style={{ color: s.color, lineHeight: 1 }}
              >
                {s.value}
              </div>
              <div
                className={`text-[9px] tracking-wide uppercase mt-0.5 ${dark ? "text-white/35" : "text-gray-400"}`}
              >
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <ChevronDown
            size={20}
            style={{
              color: dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)",
            }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES
───────────────────────────────────────────── */
function Features({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  return (
    <section
      id="features"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <div
          className="inline-block font-orbitron text-[11px] tracking-[3px] mb-4 px-4 py-1.5 rounded-full"
          style={{
            color: "#00d4ff",
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
          }}
        >
          CORE CAPABILITIES
        </div>
        <h2
          className="font-orbitron text-3xl sm:text-4xl font-black mb-4"
          style={{ color: dark ? "white" : "#0a1628" }}
        >
          Every Feature Built to Save Lives
        </h2>
        <p
          className="max-w-xl mx-auto text-sm leading-relaxed"
          style={{
            color: dark ? "rgba(200,225,255,0.5)" : "rgba(30,60,120,0.55)",
          }}
        >
          From AI-powered crowdsourced reporting to offline-first resilience —
          Sentinel is engineered for the worst.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            viewport={{ once: true }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="glass rounded-2xl p-6 cursor-default relative overflow-hidden group"
          >
            {/* Top accent line */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg,transparent,${f.color}80,transparent)`,
              }}
            />

            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: `${f.color}14`,
                color: f.color,
                border: `1px solid ${f.color}30`,
              }}
            >
              {f.icon}
            </div>

            <h3
              className={`font-orbitron text-[13px] font-bold mb-2 ${dark ? "text-white" : "text-gray-800"}`}
            >
              {f.title}
            </h3>
            <p
              className="text-[12px] leading-relaxed"
              style={{
                color: dark ? "rgba(200,225,255,0.5)" : "rgba(30,60,120,0.55)",
              }}
            >
              {f.desc}
            </p>

            {/* Hover glow */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: `linear-gradient(90deg,transparent,${f.color}80,transparent)`,
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LIVE ALERT DEMO
───────────────────────────────────────────── */
function LiveDemo({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  // TODO: fetch from /api/alerts (live polling or WebSocket)
  const demoAlerts: {
    sev: string;
    color: string;
    bg: string;
    emoji: string;
    title: string;
    sub: string;
    dot: boolean;
  }[] = [];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Left: text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <div
            className="inline-block font-orbitron text-[11px] tracking-[3px] mb-4 px-4 py-1.5 rounded-full"
            style={{
              color: "#ff4444",
              background: "rgba(255,68,68,0.08)",
              border: "1px solid rgba(255,68,68,0.25)",
            }}
          >
            LIVE ALERT FEED
          </div>
          <h2
            className="font-orbitron text-3xl sm:text-4xl font-black mb-4"
            style={{ color: dark ? "white" : "#0a1628" }}
          >
            Real-Time Crisis Intelligence
          </h2>
          <p
            className="text-sm leading-relaxed mb-6"
            style={{
              color: dark ? "rgba(200,225,255,0.5)" : "rgba(30,60,120,0.55)",
            }}
          >
            Every alert is triaged by the AI engine: NLP parses Hindi/English
            SOS messages, Vision API verifies photo evidence, and the system
            auto-classifies severity before dispatching geofenced notifications
            to at-risk users only.
          </p>

          {/* TODO: Priority pills — fetch severity levels from /api/severity-config */}
        </motion.div>

        {/* Right: live alert panel */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="glass rounded-2xl overflow-hidden shadow-2xl"
          style={{
            animation: "alertBorder 2.5s ease-in-out infinite",
            borderColor: "rgba(255,68,68,0.3)",
          }}
        >
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{ borderBottom: "1px solid var(--glass-border)" }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#ff4444]" />
              <span
                className="font-orbitron text-[12px] font-bold tracking-[2px]"
                style={{ color: dark ? "white" : "#0a1628" }}
              >
                ACTIVE INCIDENTS
              </span>
            </div>
            <motion.span
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full text-[#00ff88]"
              style={{
                background: "rgba(0,255,136,0.08)",
                border: "1px solid rgba(0,255,136,0.3)",
              }}
            >
              ● LIVE
            </motion.span>
          </div>

          <div
            className="divide-y"
            style={{ divideColor: "var(--glass-border)" }}
          >
            {demoAlerts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ backgroundColor: "var(--glass-hover)" }}
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-all"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: a.color,
                    boxShadow: a.dot ? `0 0 8px ${a.color}` : undefined,
                    animation: a.dot
                      ? "blink 1.2s ease-in-out infinite"
                      : undefined,
                  }}
                />
                <span className="text-lg flex-shrink-0">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div
                    className="text-[12px] font-semibold truncate"
                    style={{
                      color: dark ? "rgba(255,255,255,0.9)" : "#1a2a4a",
                    }}
                  >
                    {a.title}
                  </div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{
                      color: dark
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(30,60,120,0.4)",
                    }}
                  >
                    {a.sub}
                  </div>
                </div>
                <span
                  className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded flex-shrink-0"
                  style={{
                    background: a.bg,
                    color: a.color,
                    border: `1px solid ${a.color}30`,
                  }}
                >
                  {a.sev}
                </span>
              </motion.div>
            ))}
          </div>

          <div
            className="px-5 py-3 flex justify-between items-center"
            style={{ borderTop: "1px solid var(--glass-border)" }}
          >
            <span
              className="text-[10px]"
              style={{
                color: dark ? "rgba(255,255,255,0.3)" : "rgba(30,60,120,0.4)",
              }}
            >
              Powered by Gemini AI · Kafka · Redis
            </span>
            <span className="text-[10px] font-bold text-[#00d4ff]">
              View All →
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TECH STACK
───────────────────────────────────────────── */
function TechStack({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  return (
    <section
      id="tech-stack"
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <div
          className="inline-block font-orbitron text-[11px] tracking-[3px] mb-4 px-4 py-1.5 rounded-full"
          style={{
            color: "#b44fff",
            background: "rgba(180,79,255,0.08)",
            border: "1px solid rgba(180,79,255,0.2)",
          }}
        >
          TECH STACK
        </div>
        <h2
          className="font-orbitron text-3xl sm:text-4xl font-black"
          style={{ color: dark ? "white" : "#0a1628" }}
        >
          Built for 20 LPA Profiles
        </h2>
        <p
          className="mt-3 text-sm max-w-lg mx-auto"
          style={{
            color: dark ? "rgba(200,225,255,0.5)" : "rgba(30,60,120,0.55)",
          }}
        >
          Every technology chosen to demonstrate real Architectural Thinking —
          not just tool usage.
        </p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3">
        {TECH.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.08, y: -3 }}
            className="px-5 py-2.5 rounded-xl font-semibold text-[12px] tracking-wide cursor-default"
            style={{
              background: t.bg,
              color: t.color,
              border: `1px solid ${t.color}25`,
              backdropFilter: "blur(12px)",
            }}
          >
            {t.name}
          </motion.div>
        ))}
      </div>

      {/* Architecture diagram hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-10 glass rounded-2xl p-6 max-w-3xl mx-auto"
      >
        <div
          className="font-orbitron text-[11px] tracking-[2px] mb-5 text-center"
          style={{ color: "#00d4ff" }}
        >
          EVENT-DRIVEN ARCHITECTURE FLOW
        </div>
        {/* TODO: architecture flow nodes — define in /lib/config/arch-flow.ts and map here */}
        <div className="flex items-center justify-center flex-wrap gap-2 text-[11px] font-semibold text-white/30">
          Architecture flow coming soon...
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   CTA SECTION
───────────────────────────────────────────── */
function CTASection({
  theme,
  openModal,
}: {
  theme: Theme;
  openModal: (m: Modal) => void;
}) {
  const dark = theme === "dark";
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="glass rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background: dark
              ? "radial-gradient(ellipse at 50% 50%,rgba(0,212,255,0.06),transparent 70%)"
              : "radial-gradient(ellipse at 50% 50%,rgba(0,100,200,0.08),transparent 70%)",
          }}
        />

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-5xl mb-6"
        >
          🛡️
        </motion.div>

        <h2
          className="font-orbitron text-3xl sm:text-5xl font-black mb-4 relative z-10"
          style={{ color: dark ? "white" : "#0a1628" }}
        >
          Ready to Save Lives?
        </h2>
        <p
          className="mb-8 text-sm max-w-lg mx-auto relative z-10"
          style={{
            color: dark ? "rgba(200,225,255,0.55)" : "rgba(30,60,120,0.55)",
          }}
        >
          Join Sentinel today. Whether you're a responder, citizen, or
          administrator — the system adapts to you.
        </p>

        <div className="flex flex-wrap gap-3 justify-center relative z-10">
          <motion.button
            onClick={() => openModal("signup")}
            whileHover={{
              scale: 1.04,
              boxShadow: "0 0 50px rgba(0,212,255,0.5)",
            }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base text-white cursor-pointer"
            style={{
              background: "linear-gradient(135deg,#00d4ff,#b44fff)",
              backgroundSize: "200%",
              animation: "gradientSweep 3s ease infinite",
            }}
          >
            <Shield size={18} />
            Create Free Account
            <ArrowRight size={18} />
          </motion.button>
          <motion.button
            onClick={() => openModal("login")}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-base cursor-pointer"
            style={{
              background: dark
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.7)",
              border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,80,200,0.2)"}`,
              backdropFilter: "blur(12px)",
              color: dark ? "white" : "#1a3a6a",
            }}
          >
            <Lock size={18} />
            Sign In
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
───────────────────────────────────────────── */
function Footer({ theme }: { theme: Theme }) {
  const dark = theme === "dark";
  return (
    <footer
      className="relative z-10 border-t"
      style={{ borderColor: "var(--glass-border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: "linear-gradient(135deg,#00d4ff,#b44fff)" }}
          >
            🛡️
          </div>
          <span
            className="font-orbitron text-sm font-black tracking-[2px]"
            style={{ color: dark ? "white" : "#0a1628" }}
          >
            SENTINEL
          </span>
        </div>
        <div
          className="text-[11px] tracking-wide"
          style={{
            color: dark ? "rgba(255,255,255,0.25)" : "rgba(30,60,120,0.4)",
          }}
        >
          Stack: Next.js · Fastify · MongoDB · Redis · Kafka · K8s · Gemini AI ·
          Mapbox
        </div>
        <div className="flex items-center gap-3">
          {[
            { icon: <Github size={16} />, label: "GitHub" },
            { icon: <Twitter size={16} />, label: "Twitter" },
            { icon: <Globe size={16} />, label: "Website" },
          ].map((s) => (
            <motion.button
              key={s.label}
              whileHover={{ scale: 1.1, color: "#00d4ff" }}
              className="glass w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
              style={{
                color: dark ? "rgba(255,255,255,0.4)" : "rgba(30,60,120,0.5)",
              }}
              title={s.label}
            >
              {s.icon}
            </motion.button>
          ))}
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────────── */
function AuthModal({
  mode,
  theme,
  onClose,
  onSwitch,
}: {
  mode: Modal;
  theme: Theme;
  onClose: () => void;
  onSwitch: () => void;
}) {
  const dark = theme === "dark";
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isLogin = mode === "login";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1800);
  };

  return (
    <AnimatePresence>
      {mode && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{
              background: dark ? "rgba(0,0,0,0.75)" : "rgba(10,22,60,0.45)",
              backdropFilter: "blur(8px)",
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ duration: 0.45, ease: [0.2, 1, 0.4, 1] }}
            className="fixed inset-0 z-[70] flex items-center justify-center px-4 pointer-events-none"
          >
            <div
              className="glass rounded-3xl p-8 w-full max-w-md pointer-events-auto relative overflow-hidden shadow-2xl"
              style={{ border: "1px solid var(--glass-border)" }}
            >
              {/* Top gradient bar */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg,transparent,#00d4ff,#b44fff,transparent)",
                }}
              />

              {/* Glow orb behind modal */}
              <div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle,rgba(0,212,255,0.10),transparent 70%)",
                  filter: "blur(30px)",
                }}
              />

              {/* Close */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 glass w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer"
              >
                <X
                  size={14}
                  style={{ color: dark ? "rgba(255,255,255,0.6)" : "#555" }}
                />
              </motion.button>

              {/* Logo */}
              <div className="flex flex-col items-center mb-7">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 16px rgba(0,212,255,0.4)",
                      "0 0 32px rgba(0,212,255,0.7)",
                      "0 0 16px rgba(0,212,255,0.4)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{
                    background: "linear-gradient(135deg,#00d4ff,#b44fff)",
                  }}
                >
                  🛡️
                </motion.div>
                <div
                  className="font-orbitron text-xl font-black tracking-[3px]"
                  style={{ color: dark ? "white" : "#0a1628" }}
                >
                  SENTINEL
                </div>
                <div
                  className="text-[10px] tracking-[2px] uppercase mt-1"
                  style={{
                    color: dark
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(30,60,120,0.4)",
                  }}
                >
                  {isLogin
                    ? "Welcome Back, Guardian"
                    : "Join the Early Warning Network"}
                </div>
              </div>

              {/* Success state */}
              {done ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div className="text-5xl mb-4">✅</div>
                  <div className="font-orbitron text-lg font-bold text-[#00ff88] mb-2">
                    {isLogin ? "Access Granted!" : "Welcome to Sentinel!"}
                  </div>
                  <div
                    className="text-sm"
                    style={{
                      color: dark
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(30,60,120,0.5)",
                    }}
                  >
                    {isLogin
                      ? "Redirecting to dashboard..."
                      : "Your account is ready."}
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Name field (signup only) */}
                  {!isLogin && (
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                        style={{
                          color: dark
                            ? "rgba(255,255,255,0.3)"
                            : "rgba(30,60,120,0.4)",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-sora input-glow transition-all"
                        style={{
                          background: dark
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(255,255,255,0.7)",
                          border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,80,200,0.2)"}`,
                          color: dark ? "white" : "#0a1628",
                          outline: "none",
                        }}
                      />
                    </div>
                  )}

                  {/* Email */}
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{
                        color: dark
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(30,60,120,0.4)",
                      }}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-sora input-glow transition-all"
                      style={{
                        background: dark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.7)",
                        border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,80,200,0.2)"}`,
                        color: dark ? "white" : "#0a1628",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{
                        color: dark
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(30,60,120,0.4)",
                      }}
                    />
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Password"
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-xl text-sm font-sora input-glow transition-all"
                      style={{
                        background: dark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.7)",
                        border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,80,200,0.2)"}`,
                        color: dark ? "white" : "#0a1628",
                        outline: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{
                        color: dark
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(30,60,120,0.4)",
                      }}
                    >
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Role select (signup) */}
                  {!isLogin && (
                    <select
                      required
                      className="w-full px-4 py-3 rounded-xl text-sm font-sora input-glow transition-all"
                      style={{
                        background: dark
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.7)",
                        border: `1px solid ${dark ? "rgba(255,255,255,0.12)" : "rgba(0,80,200,0.2)"}`,
                        color: dark
                          ? "rgba(255,255,255,0.6)"
                          : "rgba(30,60,120,0.7)",
                        outline: "none",
                      }}
                    >
                      <option value="">Select Role</option>
                      <option value="citizen">🏘️ Citizen / Public</option>
                      <option value="responder">🚑 Emergency Responder</option>
                      <option value="admin">🛡️ Admin / Authority</option>
                      <option value="dev">💻 Developer</option>
                    </select>
                  )}

                  {/* Forgot (login only) */}
                  {isLogin && (
                    <div className="text-right -mt-1">
                      <button
                        type="button"
                        className="text-[11px] cursor-pointer"
                        style={{ color: "#00d4ff" }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{
                      scale: loading ? 1 : 1.02,
                      boxShadow: "0 0 30px rgba(0,212,255,0.45)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer mt-1"
                    style={{
                      background: "linear-gradient(135deg,#00d4ff,#b44fff)",
                      backgroundSize: "200%",
                      animation: "gradientSweep 3s ease infinite",
                      opacity: loading ? 0.8 : 1,
                    }}
                  >
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white"
                        />
                        {isLogin ? "Authenticating..." : "Creating Account..."}
                      </>
                    ) : (
                      <>
                        <Shield size={15} />
                        {isLogin ? "Sign In to Sentinel" : "Create Account"}
                        <ArrowRight size={15} />
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-1">
                    <div
                      className="flex-1 h-px"
                      style={{ background: "var(--glass-border)" }}
                    />
                    <span
                      className="text-[10px]"
                      style={{
                        color: dark
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(30,60,120,0.35)",
                      }}
                    >
                      OR
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "var(--glass-border)" }}
                    />
                  </div>

                  {/* Google */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer glass"
                    style={{ color: dark ? "rgba(255,255,255,0.75)" : "#333" }}
                  >
                    <span className="text-base">🌐</span>
                    Continue with Google
                  </motion.button>

                  {/* Switch */}
                  <div
                    className="text-center text-[12px] mt-1"
                    style={{
                      color: dark
                        ? "rgba(255,255,255,0.35)"
                        : "rgba(30,60,120,0.5)",
                    }}
                  >
                    {isLogin
                      ? "Don't have an account? "
                      : "Already registered? "}
                    <button
                      type="button"
                      onClick={onSwitch}
                      className="font-bold cursor-pointer"
                      style={{ color: "#00d4ff" }}
                    >
                      {isLogin ? "Sign Up" : "Log In"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   ROOT PAGE
───────────────────────────────────────────── */
export default function Page() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [modal, setModal] = useState<Modal>(null);
  const [scrolled, setScrolled] = useState(false);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));
  const openModal = (m: Modal) => setModal(m);
  const closeModal = () => setModal(null);
  const switchModal = () =>
    setModal((p) => (p === "login" ? "signup" : "login"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.className =
      theme === "dark" ? "dark-mode" : "light-mode";
    document.body.style.background = theme === "dark" ? "#010810" : "#d8e8ff";
    document.body.style.color = theme === "dark" ? "#e8f4ff" : "#0a1628";
  }, [theme]);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Background theme={theme} />

      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        openModal={openModal}
        scrolled={scrolled}
      />

      {/* Alert ticker strip (below navbar) */}
      <div className="relative z-40 mt-[76px]">
        <AlertTicker theme={theme} />
      </div>

      <Hero theme={theme} openModal={openModal} />
      <Features theme={theme} />
      <LiveDemo theme={theme} />
      <TechStack theme={theme} />
      <CTASection theme={theme} openModal={openModal} />
      <Footer theme={theme} />

      <AuthModal
        mode={modal}
        theme={theme}
        onClose={closeModal}
        onSwitch={switchModal}
      />
    </main>
  );
}
