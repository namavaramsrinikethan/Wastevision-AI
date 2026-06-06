"use client"

import { useEffect, useRef, useState } from "react"
import { Upload, Play, Brain } from "lucide-react"

/* ─── Floating 3-D-style SVG objects ──────────────────────────── */

function BottleSVG() {
  return (
    <svg width="52" height="88" viewBox="0 0 52 88" fill="none" aria-hidden="true">
      {/* cap */}
      <rect x="18" y="0" width="16" height="10" rx="3" fill="oklch(0.82 0.22 145 / 0.5)" />
      {/* neck */}
      <rect x="20" y="10" width="12" height="12" rx="2" fill="oklch(0.82 0.22 145 / 0.25)" />
      {/* body */}
      <rect x="8" y="22" width="36" height="58" rx="8" fill="oklch(0.82 0.22 145 / 0.12)"
        stroke="oklch(0.82 0.22 145 / 0.55)" strokeWidth="1.2" />
      {/* highlight */}
      <rect x="12" y="28" width="6" height="40" rx="3" fill="oklch(0.82 0.22 145 / 0.18)" />
      {/* liquid fill */}
      <rect x="9" y="50" width="34" height="29" rx="0 0 8 8" fill="oklch(0.82 0.22 145 / 0.15)" />
      {/* label band */}
      <rect x="8" y="42" width="36" height="14" rx="2" fill="oklch(0.82 0.22 145 / 0.08)"
        stroke="oklch(0.82 0.22 145 / 0.3)" strokeWidth="0.8" />
    </svg>
  )
}

function CanSVG() {
  return (
    <svg width="56" height="72" viewBox="0 0 56 72" fill="none" aria-hidden="true">
      {/* body */}
      <rect x="8" y="10" width="40" height="52" rx="6"
        fill="oklch(0.78 0.19 200 / 0.12)" stroke="oklch(0.78 0.19 200 / 0.55)" strokeWidth="1.2" />
      {/* top ellipse */}
      <ellipse cx="28" cy="10" rx="20" ry="5" fill="oklch(0.78 0.19 200 / 0.35)" />
      {/* bottom ellipse */}
      <ellipse cx="28" cy="62" rx="20" ry="5" fill="oklch(0.78 0.19 200 / 0.25)" />
      {/* tab */}
      <path d="M24 4 Q28 0 32 4" stroke="oklch(0.78 0.19 200 / 0.8)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* vertical lines */}
      <line x1="20" y1="12" x2="20" y2="60" stroke="oklch(0.78 0.19 200 / 0.2)" strokeWidth="0.8" />
      <line x1="36" y1="12" x2="36" y2="60" stroke="oklch(0.78 0.19 200 / 0.2)" strokeWidth="0.8" />
      {/* highlight */}
      <rect x="12" y="14" width="5" height="44" rx="2.5" fill="oklch(0.78 0.19 200 / 0.2)" />
    </svg>
  )
}

function PaperSVG() {
  return (
    <svg width="64" height="72" viewBox="0 0 64 72" fill="none" aria-hidden="true">
      {/* folded corner */}
      <path d="M4 4 L52 4 L60 14 L60 68 Q60 70 58 70 L4 70 Q2 70 2 68 L2 6 Q2 4 4 4Z"
        fill="oklch(0.65 0.20 260 / 0.10)" stroke="oklch(0.65 0.20 260 / 0.5)" strokeWidth="1.2" />
      {/* fold triangle */}
      <path d="M52 4 L60 14 L52 14 Z" fill="oklch(0.65 0.20 260 / 0.25)" />
      <path d="M52 4 L52 14 L60 14" stroke="oklch(0.65 0.20 260 / 0.5)" strokeWidth="0.8" fill="none" />
      {/* text lines */}
      <line x1="12" y1="24" x2="50" y2="24" stroke="oklch(0.65 0.20 260 / 0.35)" strokeWidth="1" />
      <line x1="12" y1="33" x2="50" y2="33" stroke="oklch(0.65 0.20 260 / 0.25)" strokeWidth="1" />
      <line x1="12" y1="42" x2="42" y2="42" stroke="oklch(0.65 0.20 260 / 0.25)" strokeWidth="1" />
      <line x1="12" y1="51" x2="46" y2="51" stroke="oklch(0.65 0.20 260 / 0.20)" strokeWidth="1" />
      <line x1="12" y1="60" x2="36" y2="60" stroke="oklch(0.65 0.20 260 / 0.15)" strokeWidth="1" />
    </svg>
  )
}

/* ─── Energy stream particles ──────────────────────────── */

// All delays are hardcoded constants — no Math.random() to avoid hydration mismatch.
const STREAM_BEAMS = [
  // [topOffset, duration, delay, opacity, blur, colors]
  { top: "43%",  dur: "5.5s",  delay: "0s",    opacity: 0.90, blur: 0,  colors: "oklch(0.82 0.22 145), oklch(0.78 0.19 200), oklch(0.65 0.20 260)" },
  { top: "44.5%",dur: "6.2s",  delay: "0.4s",  opacity: 0.55, blur: 4,  colors: "oklch(0.78 0.19 200), oklch(0.65 0.20 260), oklch(0.82 0.22 145)" },
  { top: "42%",  dur: "7s",    delay: "1s",    opacity: 0.30, blur: 8,  colors: "oklch(0.65 0.20 260), oklch(0.82 0.22 145), oklch(0.78 0.19 200)" },
] as const

const STREAM_PARTICLES = [
  { top: "43.5%", dur: "5.8s",  delay: "0.2s",  size: 3, color: "var(--neon-green)", anim: "stream-particle"      },
  { top: "44%",   dur: "6.6s",  delay: "1.1s",  size: 2, color: "var(--neon-cyan)",  anim: "stream-particle-up"   },
  { top: "42.5%", dur: "7.2s",  delay: "2.0s",  size: 2, color: "var(--neon-blue)",  anim: "stream-particle-down" },
  { top: "45%",   dur: "5.2s",  delay: "0.7s",  size: 2, color: "var(--neon-green)", anim: "stream-particle"      },
  { top: "41.5%", dur: "6.0s",  delay: "1.8s",  size: 3, color: "var(--neon-cyan)",  anim: "stream-particle-up"   },
  { top: "46%",   dur: "8.0s",  delay: "3.0s",  size: 2, color: "var(--neon-blue)",  anim: "stream-particle-down" },
  { top: "43%",   dur: "5.5s",  delay: "2.5s",  size: 2, color: "var(--neon-green)", anim: "stream-particle"      },
  { top: "44.5%", dur: "9.0s",  delay: "4.0s",  size: 3, color: "var(--neon-cyan)",  anim: "stream-particle-up"   },
] as const

const SPECK_POSITIONS = [
  { left: "18%", top: "40%", dur: "2.4s", delay: "0.9s"  },
  { left: "32%", top: "46%", dur: "2.8s", delay: "1.7s"  },
  { left: "47%", top: "39%", dur: "2.0s", delay: "0.3s"  },
  { left: "61%", top: "47%", dur: "3.1s", delay: "2.2s"  },
  { left: "75%", top: "41%", dur: "1.8s", delay: "1.0s"  },
  { left: "88%", top: "44%", dur: "2.6s", delay: "0.5s"  },
  { left: "24%", top: "43%", dur: "2.2s", delay: "3.4s"  },
  { left: "54%", top: "42%", dur: "1.9s", delay: "1.5s"  },
] as const

interface EnergyStreamProps { hovered: boolean }

function EnergyStream({ hovered }: EnergyStreamProps) {
  const intensity = hovered ? 1.4 : 1

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">

      {/* Background gradient wave */}
      <div
        className="absolute inset-y-0 w-full"
        style={{
          background: "linear-gradient(180deg, transparent 38%, oklch(0.82 0.22 145 / 0.05) 44%, oklch(0.78 0.19 200 / 0.04) 48%, transparent 55%)",
          animation: "bg-wave 5.5s linear infinite",
        }}
      />

      {/* Beam layers: outer diffuse → core */}
      {STREAM_BEAMS.map((b, i) => (
        <div
          key={i}
          className="absolute left-0 h-px"
          style={{
            top: b.top,
            width: "100%",
            height: i === 0 ? "2px" : "1px",
            background: `linear-gradient(90deg, transparent 0%, ${b.colors}, transparent 100%)`,
            filter: `blur(${b.blur}px)`,
            opacity: b.opacity * intensity,
            animation: `energy-stream ${b.dur} linear infinite ${b.delay}, beam-flicker ${i === 0 ? "3.1s" : "4.7s"} ease-in-out infinite`,
            animationDelay: b.delay,
          }}
        />
      ))}

      {/* Shimmer overlay — rides on the core beam */}
      <div
        className="absolute left-0 h-px"
        style={{
          top: "43.5%",
          width: "30%",
          height: "3px",
          background: "linear-gradient(90deg, transparent, oklch(0.90 0.25 145 / 0.9), oklch(0.85 0.22 200 / 0.8), transparent)",
          filter: "blur(1px)",
          opacity: 0.7 * intensity,
          animation: `energy-stream 5.5s linear infinite, beam-shimmer 2.2s ease-in-out infinite`,
          boxShadow: "0 0 12px oklch(0.82 0.22 145 / 0.6), 0 0 28px oklch(0.78 0.19 200 / 0.3), 0 0 48px oklch(0.65 0.20 260 / 0.15)",
        }}
      />

      {/* Stream particles */}
      {STREAM_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: 0,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            opacity: intensity * 0.9,
            animation: `${p.anim} ${p.dur} linear infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Sparkle specks along beam path */}
      {SPECK_POSITIONS.map((s, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: s.left,
            top: s.top,
            background: i % 3 === 0 ? "var(--neon-green)" : i % 3 === 1 ? "var(--neon-cyan)" : "var(--neon-blue)",
            boxShadow: `0 0 6px ${i % 3 === 0 ? "var(--neon-green)" : i % 3 === 1 ? "var(--neon-cyan)" : "var(--neon-blue)"}`,
            opacity: intensity * 0.85,
            animation: `speck-pop ${s.dur} ease-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}

    </div>
  )
}

/* ─── Floating particle dot ──────────────────────────── */
// Renders a single neon dot; colour/position/animation passed via style prop.
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute w-1 h-1 rounded-full pointer-events-none"
      style={{ background: "var(--neon-green)", boxShadow: "0 0 6px var(--neon-green)", ...style }}
    />
  )
}

/* ─── Main hero ──────────────────────────────────────── */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  /* Parallax on scroll */
  useEffect(() => {
    const onScroll = () => {
      if (!bgRef.current || !sectionRef.current) return
      const scrolled = window.scrollY
      const rate = scrolled * 0.18
      bgRef.current.style.transform = `translateY(${rate}px)`
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <section
      id="dashboard"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-8"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* ── Parallax background layer ───────────────────── */}
      <div ref={bgRef} className="absolute inset-0 will-change-transform" aria-hidden="true">

        {/* Faint background grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(var(--neon-green) 1px, transparent 1px),
                              linear-gradient(90deg, var(--neon-green) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Animated scanning row — sweeps a slightly brighter horizontal line */}
        <div
          className="absolute inset-x-0 h-px opacity-[0.06]"
          style={{
            background: `linear-gradient(90deg, transparent, var(--neon-green), transparent)`,
            animation: "grid-sweep 6s ease-in-out infinite",
            top: "40%",
          }}
        />
        <div
          className="absolute inset-x-0 h-px opacity-[0.04]"
          style={{
            background: `linear-gradient(90deg, transparent, var(--neon-cyan), transparent)`,
            animation: "grid-sweep 9s ease-in-out infinite 3s",
            top: "65%",
          }}
        />

        {/* Radial glow blobs */}
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl transition-opacity duration-700"
          style={{ background: "var(--neon-green)", opacity: hovered ? 0.14 : 0.09 }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl transition-opacity duration-700"
          style={{ background: "var(--neon-cyan)", opacity: hovered ? 0.13 : 0.08 }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl"
          style={{ background: "var(--neon-blue)", opacity: 0.05 }}
        />

        {/* ── Energy stream ─────────────────────────── */}
        <EnergyStream hovered={hovered} />

        {/* Pulse wave rings */}
        {[0, 1.2, 2.4].map((delay) => (
          <div
            key={delay}
            className="absolute rounded-full border border-neon-green/10 animate-pulse-wave"
            style={{
              width: 320, height: 320,
              top: "calc(50% - 160px)", left: "calc(50% - 160px)",
              animationDelay: `${delay}s`,
            }}
          />
        ))}

        {/* ── Floating waste objects ────────────────────── */}

        {/* Plastic bottle — top-left quadrant */}
        <div
          className="absolute animate-drift-a animate-obj-glow"
          style={{ top: "12%", left: "6%", opacity: hovered ? 0.55 : 0.38, transition: "opacity 0.6s" }}
        >
          <BottleSVG />
        </div>

        {/* Metal can — bottom-right quadrant */}
        <div
          className="absolute animate-drift-b animate-obj-glow-cyan"
          style={{ bottom: "14%", right: "7%", opacity: hovered ? 0.52 : 0.35, transition: "opacity 0.6s" }}
        >
          <CanSVG />
        </div>

        {/* Paper sheet — mid-right */}
        <div
          className="absolute animate-drift-c animate-obj-glow-blue"
          style={{ top: "38%", right: "4%", opacity: hovered ? 0.5 : 0.32, transition: "opacity 0.6s" }}
        >
          <PaperSVG />
        </div>

        {/* ── Flowing data particles ───────────────────── */}
        {/* from bottle toward center */}
        <Particle style={{ top: "22%", left: "14%", animation: "particle-flow-1 3.2s ease-in-out infinite 0s"      }} />
        <Particle style={{ top: "24%", left: "16%", animation: "particle-flow-1 3.2s ease-in-out infinite 0.8s",
          background: "var(--neon-cyan)", boxShadow: "0 0 6px var(--neon-cyan)" }} />
        <Particle style={{ top: "20%", left: "12%", animation: "particle-flow-1 3.2s ease-in-out infinite 1.6s"     }} />

        {/* from can toward center */}
        <Particle style={{ bottom: "22%", right: "14%", animation: "particle-flow-2 4s ease-in-out infinite 0.4s",
          background: "var(--neon-cyan)", boxShadow: "0 0 6px var(--neon-cyan)" }} />
        <Particle style={{ bottom: "20%", right: "12%", animation: "particle-flow-2 4s ease-in-out infinite 1.4s"   }} />
        <Particle style={{ bottom: "24%", right: "16%", animation: "particle-flow-2 4s ease-in-out infinite 2.4s",
          background: "var(--neon-green)", boxShadow: "0 0 6px var(--neon-green)" }} />

        {/* from paper toward center */}
        <Particle style={{ top: "46%", right: "12%", animation: "particle-flow-3 3.8s ease-in-out infinite 0.6s",
          background: "var(--neon-blue)", boxShadow: "0 0 6px var(--neon-blue)" }} />
        <Particle style={{ top: "48%", right: "14%", animation: "particle-flow-3 3.8s ease-in-out infinite 1.8s"    }} />
        <Particle style={{ top: "44%", right: "10%", animation: "particle-flow-3 3.8s ease-in-out infinite 3s",
          background: "var(--neon-cyan)", boxShadow: "0 0 6px var(--neon-cyan)" }} />

      </div>{/* /parallax layer */}

      {/* ── Main content ────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

        {/* Left: text */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-neon-green/30 w-fit">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse-glow" />
            <span className="text-xs font-medium text-neon-green tracking-widest uppercase">
              AI-Powered Platform
            </span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-none tracking-tight text-balance">
            Turn{" "}
            <span className="text-neon-green" style={{ textShadow: "0 0 30px var(--neon-green)" }}>
              Waste
            </span>
            <br />
            into{" "}
            <span className="text-neon-cyan" style={{ textShadow: "0 0 30px var(--neon-cyan)" }}>
              Value
            </span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg text-pretty">
            AI-powered waste detection, profit estimation, and environmental impact analysis —
            transforming how the world manages waste.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href="#upload"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-green text-background font-semibold text-sm glow-green hover:opacity-90 transition-all hover:scale-105 duration-200"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </a>
            <a
              href="#results"
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-neon-cyan/40 text-neon-cyan font-semibold text-sm hover:border-neon-cyan/70 transition-all duration-200"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              View Demo
            </a>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mt-4 pt-6 border-t border-border">
            {[
              { value: "98.4%", label: "Detection Accuracy" },
              { value: "3.2s",  label: "Avg. Analysis Time"  },
              { value: "₹12M+", label: "Waste Value Unlocked" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-neon-green">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI graphic with rings */}
        <div className="relative flex items-center justify-center">

          {/* Outer rotating ring */}
          <div
            className="absolute w-80 h-80 rounded-full border border-neon-green/20 animate-spin-slow"
            style={{ borderStyle: "dashed" }}
          />
          {/* Inner counter-rotating ring */}
          <div
            className="absolute w-56 h-56 rounded-full border border-neon-cyan/30"
            style={{ animation: "spin-slow 5s linear infinite reverse", borderStyle: "dashed" }}
          />

          {/* Center brain card */}
          <div
            className="relative z-10 w-48 h-48 rounded-2xl glass border border-neon-green/30 flex flex-col items-center justify-center gap-3 animate-float transition-all duration-500"
            style={{
              boxShadow: hovered
                ? "0 0 32px oklch(0.82 0.22 145 / 0.5), 0 0 64px oklch(0.82 0.22 145 / 0.2)"
                : "0 0 20px oklch(0.82 0.22 145 / 0.35), 0 0 40px oklch(0.82 0.22 145 / 0.15)",
            }}
          >
            <div className="w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
              <Brain className="w-8 h-8 text-neon-green" />
            </div>
            <span className="text-sm font-bold text-foreground">WasteVision AI</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="text-xs text-neon-green">Scanning...</span>
            </div>
          </div>

  {/* Floating label chips — delays via className only, no inline style */}
  <div className="absolute -top-6 -left-8 glass border border-border px-3 py-1.5 rounded-lg flex items-center gap-2 animate-float [animation-delay:0s]">
    <span className="text-xs font-semibold text-foreground">Plastic</span>
    <span className="text-xs font-bold text-neon-green">94%</span>
  </div>
  <div className="absolute top-4 -left-20 glass border border-border px-3 py-1.5 rounded-lg flex items-center gap-2 animate-float [animation-delay:1.3s]">
    <span className="text-xs font-semibold text-foreground">Metal</span>
    <span className="text-xs font-bold text-neon-cyan">88%</span>
  </div>
  <div className="absolute top-32 -left-16 glass border border-border px-3 py-1.5 rounded-lg flex items-center gap-2 animate-float [animation-delay:0.7s]">
    <span className="text-xs font-semibold text-foreground">Paper</span>
    <span className="text-xs font-bold text-neon-blue">76%</span>
  </div>

          <div className="absolute -bottom-4 -right-4 glass border border-border px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">CO₂ Saved</span>
            <span className="text-xs font-bold text-neon-cyan">2.4 kg</span>
          </div>
          <div className="absolute top-0 -right-8 glass border border-border px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Profit Est.</span>
            <span className="text-xs font-bold text-neon-green">₹480</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-neon-green/60 to-transparent" />
      </div>
    </section>
  )
}
