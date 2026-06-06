"use client"

import { useEffect, useRef, useState } from "react"
import { Award, Lightbulb, Wind, Droplets, TreePine, Leaf } from "lucide-react"
import { useAnimatedCounter } from "@/hooks/use-animated-counter"
import { NearbyDealers } from "./nearby-dealers"

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

// ── Segregation Score ─────────────────────────────────────

const DEFAULT_SUGGESTIONS = [
  "Separate plastic bottles from mixed plastic waste to increase value by ~15%.",
  "Clean metal scraps before selling — dirty metal fetches 20% lower rates.",
  "Bundle paper waste in dry bales for higher recycler acceptance rates.",
  "Consider on-site compacting to reduce transport costs by up to 30%.",
]

export function SegregationScore({ score = 0, suggestions }: { score?: number; suggestions?: string[] }) {
  const { ref, inView } = useInView(0.3)
  const animatedScore = useAnimatedCounter(score, 1600, inView)
  const circumference = 2 * Math.PI * 54

  // Determine grade colour based on score
  const scoreColor = score >= 80 ? "var(--neon-green)" : score >= 50 ? "#f59e0b" : "#ef4444"

  const getStatusText = (s: number) => {
    if (s >= 90) return "Excellent Segregation"
    if (s >= 80) return "Good Segregation"
    if (s >= 50) return "Needs Improvement"
    return "Poor Segregation"
  }

  const getStatusDescription = (s: number) => {
    if (s >= 90) return "Exceptional waste segregation! Setting a high standard for recycling quality."
    if (s >= 80) return "You're above average — small improvements can push you to Excellent."
    if (s >= 50) return "Good effort! Follow the suggestions below to raise your score."
    return "Focus on proper segregation. Separate waste types carefully."
  }

  const displaySuggestions = (suggestions && suggestions.length > 0) ? suggestions : DEFAULT_SUGGESTIONS

  return (
    <section id="segregation" className="py-24 px-6">
      <div className="max-w-7xl mx-auto" ref={ref}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-neon-green/30 mb-4">
            <Award className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-xs font-medium text-neon-green tracking-widest uppercase">Step 4 — Segregation Score</span>
          </div>
          <h2 className="text-4xl font-bold text-balance mb-3">
            Your Waste <span className="text-neon-green">Quality Score</span>
          </h2>
          <p className="text-muted-foreground text-lg">How well-segregated is your waste? Here's what AI found.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Circular progress */}
          <div className="card-hover card-hover-green glass rounded-2xl border border-neon-green/20 p-8 flex flex-col items-center gap-8">
            <div className="relative flex items-center justify-center">
              <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border)" strokeWidth="10" />
                <circle
                  cx="70" cy="70" r="54"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={inView ? circumference - (score / 100) * circumference : circumference}
                  style={{
                    filter: `drop-shadow(0 0 8px ${scoreColor})`,
                    transition: "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold tabular-nums" style={{ color: scoreColor }}>
                  {animatedScore}
                </span>
                <span className="text-xs text-muted-foreground">out of 100</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{getStatusText(score)}</p>
              <p className="text-sm text-muted-foreground mt-1">{getStatusDescription(score)}</p>
              {/* Grade badge */}
              <div className="mt-4">
                {score >= 80 ? (
                  <span className="px-4 py-1 rounded-full text-xs font-bold bg-neon-green/10 border border-neon-green/30 text-neon-green">🟢 Green Grade</span>
                ) : score >= 50 ? (
                  <span className="px-4 py-1 rounded-full text-xs font-bold bg-amber-400/10 border border-amber-400/30 text-amber-400">🟡 Yellow Grade</span>
                ) : (
                  <span className="px-4 py-1 rounded-full text-xs font-bold bg-red-400/10 border border-red-400/30 text-red-400">🔴 Red Grade</span>
                )}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="card-hover card-hover-cyan glass rounded-2xl border border-border p-8 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-bold text-foreground">Improvement Suggestions</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {displaySuggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-muted-foreground leading-relaxed p-3 rounded-xl hover:bg-secondary/60 hover:text-foreground transition-all duration-200 cursor-default group/tip"
                  style={{
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateX(0)" : "translateX(-16px)",
                    transition: `opacity 0.4s ease ${0.3 + i * 0.1}s, transform 0.4s ease ${0.3 + i * 0.1}s`,
                  }}
                >
                  <span className="w-5 h-5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold group-hover/tip:bg-neon-green group-hover/tip:text-background transition-colors duration-200">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Environmental Impact ──────────────────────────────────

interface SustainMetrics {
  carbon_saved: number
  water_saved:  number
  energy_saved: number
  trees_saved:  number
}

function buildEnvMetrics(sustain: SustainMetrics | null) {
  const c = sustain?.carbon_saved ?? 0
  const w = sustain?.water_saved  ?? 0
  const e = sustain?.energy_saved ?? 0
  const t = sustain?.trees_saved  ?? 0

  return [
    {
      icon: Wind,
      label: "CO₂ Saved",
      // animate in tenths is not needed — directly pass value * 100 for int animation
      value: Math.round(c * 100),
      display: (v: number) => `${(v / 100).toFixed(2)} kg`,
      sub: "vs. landfill disposal",
      colorClass: "text-neon-green",
      borderClass: "border-neon-green/30",
      bgClass: "bg-neon-green/10",
      hoverClass: "card-hover-green",
    },
    {
      icon: Droplets,
      label: "Water Conserved",
      value: Math.round(w),
      display: (v: number) => `${v} L`,
      sub: "vs. virgin material production",
      colorClass: "text-neon-cyan",
      borderClass: "border-neon-cyan/30",
      bgClass: "bg-neon-cyan/10",
      hoverClass: "card-hover-cyan",
    },
    {
      icon: TreePine,
      label: "Trees Equivalent",
      value: Math.round(t * 1000),
      display: (v: number) => `${(v / 1000).toFixed(3)}`,
      sub: "trees worth of paper saved",
      colorClass: "text-neon-blue",
      borderClass: "border-neon-blue/30",
      bgClass: "bg-neon-blue/10",
      hoverClass: "card-hover-blue",
    },
    {
      icon: Leaf,
      label: "Energy Saved",
      value: Math.round(e * 100),
      display: (v: number) => `${(v / 100).toFixed(2)} kWh`,
      sub: "via material recovery",
      colorClass: "text-neon-green",
      borderClass: "border-neon-green/30",
      bgClass: "bg-neon-green/10",
      hoverClass: "card-hover-green",
    },
  ]
}

function EnvCard({
  metric,
  inView,
  index,
}: {
  metric: ReturnType<typeof buildEnvMetrics>[0]
  inView: boolean
  index: number
}) {
  const val = useAnimatedCounter(metric.value, 1400, inView)
  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.5s ease ${index * 100}ms, transform 0.5s ease ${index * 100}ms`,
      }}
    >
      <div
        className={`card-hover ${metric.hoverClass} glass rounded-2xl border ${metric.borderClass} p-6 flex flex-col gap-4 cursor-default`}
      >
        <div className={`w-12 h-12 rounded-xl ${metric.bgClass} border ${metric.borderClass} flex items-center justify-center`}>
          <metric.icon className={`w-6 h-6 ${metric.colorClass}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{metric.label}</p>
          <p className={`text-3xl font-extrabold tabular-nums ${metric.colorClass} mt-1`}>
            {metric.display(val)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{metric.sub}</p>
        </div>
      </div>
    </div>
  )
}

export function EnvironmentalImpact({ sustain }: { sustain?: SustainMetrics | null }) {
  const { ref, inView } = useInView(0.15)

  const envMetrics = buildEnvMetrics(sustain ?? null)

  // Overall sustainability score: 0-100 based on how many non-zero metrics
  const sustainScore = sustain
    ? Math.min(100, Math.round(
        ((sustain.carbon_saved > 0 ? 30 : 0) +
         (sustain.water_saved  > 0 ? 25 : 0) +
         (sustain.energy_saved > 0 ? 30 : 0) +
         (sustain.trees_saved  > 0 ? 15 : 0)) +
        Math.min(30, sustain.carbon_saved * 10)
      ))
    : 0
  const animSustain = useAnimatedCounter(sustainScore, 1600, inView)

  return (
    <section id="impact" className="relative overflow-hidden py-24 px-6 bg-secondary/30">
      {/* Animated Truck Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-24 left-[-260px] animate-truck opacity-100">
          <div className="absolute left-0 top-8 w-40 h-6 bg-green-400/20 blur-2xl rounded-full" />
          <div className="relative">
            <div className="flex items-end gap-1">
              <div className="w-32 h-16 rounded-md border border-green-400/70 bg-green-400/30 shadow-[0_0_35px_rgba(34,197,94,0.8)]" />
              <div className="w-14 h-11 rounded-sm border border-green-300/80 bg-green-300/35 shadow-[0_0_30px_rgba(34,197,94,0.75)]" />
            </div>
            <div className="absolute -top-3 left-8 w-3 h-3 rounded-full bg-green-300 shadow-[0_0_18px_rgba(134,239,172,0.9)] animate-pulse" />
            <div className="absolute -top-5 left-16 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)] animate-ping" />
            <div className="absolute -top-4 left-24 w-2 h-2 rounded-full bg-green-200 shadow-[0_0_14px_rgba(187,247,208,0.9)] animate-pulse" />
            <div className="flex gap-8 mt-2 ml-4">
              <div className="w-5 h-5 rounded-full border border-green-300 bg-green-400/80 shadow-[0_0_16px_rgba(34,197,94,0.9)]" />
              <div className="w-5 h-5 rounded-full border border-green-300 bg-green-400/80 shadow-[0_0_16px_rgba(34,197,94,0.9)]" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto" ref={ref}>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-neon-cyan/30 mb-4">
            <Leaf className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="text-xs font-medium text-neon-cyan tracking-widest uppercase">Step 5 — Environmental Impact</span>
          </div>
          <h2 className="text-4xl font-bold text-balance mb-3">
            Your <span className="text-neon-cyan">Sustainability Metrics</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            The positive environmental effect of recycling your waste correctly.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {envMetrics.map((metric, i) => (
            <EnvCard key={metric.label} metric={metric} inView={inView} index={i} />
          ))}
        </div>

        {/* Progress bar summary */}
        <div className="mt-10 card-hover card-hover-green glass rounded-2xl border border-neon-green/20 p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Overall Sustainability Score</span>
            <span className="text-sm font-bold text-neon-green tabular-nums">{animSustain} / 100</span>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-neon-green transition-all ease-out"
              style={{ width: inView ? `${sustainScore}%` : "0%", transition: "width 1.5s cubic-bezier(0.4,0,0.2,1)" }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {sustain && sustain.carbon_saved > 0
              ? `Recycling this batch properly prevents approx. ${sustain.carbon_saved.toFixed(2)} kg of CO₂ from entering the atmosphere.`
              : "Upload a waste image to see your real sustainability impact."}
          </p>
        </div>
      </div>
    </section>
  )
}

// ── Smart Recommendations ─────────────────────────────────

const recommendations = [
  {
    action: "Recycle",
    description: "Send plastic and paper to certified recyclers for maximum recovery.",
    badge: "Recommended",
    badgeColor: "bg-neon-green/10 border-neon-green/30 text-neon-green",
    icon: "♻",
    border: "border-neon-green/30",
    hoverClass: "card-hover-green",
  },
  {
    action: "Sell",
    description: "Metal scraps have high resale value — connect with local scrap dealers.",
    badge: "High Value",
    badgeColor: "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan",
    icon: "₹",
    border: "border-neon-cyan/30",
    hoverClass: "card-hover-cyan",
  },
  {
    action: "Dispose Safely",
    description: "Contaminated items must go through authorised waste channels.",
    badge: "Required",
    badgeColor: "bg-destructive/10 border-destructive/30 text-destructive-foreground",
    icon: "!",
    border: "border-border",
    hoverClass: "card-hover-neutral",
  },
]

export function SmartRecommendations() {
  return (
    <section id="recommendations" className="relative overflow-hidden px-6 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.10),transparent_35%)] pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-8 left-8 w-20 h-32 rounded-full bg-green-400/20 blur-md animate-bounce [animation-duration:6s]" />
        <div className="absolute top-20 right-16 w-24 h-14 rounded-xl rotate-12 bg-cyan-400/15 blur-md animate-bounce [animation-duration:7s]" />
        <div className="absolute bottom-16 left-1/4 w-16 h-16 rounded-full bg-blue-400/20 blur-md animate-pulse" />
        <div className="absolute bottom-20 right-1/3 w-14 h-24 rounded-lg rotate-[-12deg] bg-emerald-300/20 blur-md animate-bounce [animation-duration:8s]" />
        <div className="absolute top-1/3 left-1/2 w-4 h-4 rounded-full bg-green-400/50 blur-[3px] animate-ping" />
        <div className="absolute top-16 left-[60%] w-3 h-3 rounded-full bg-cyan-400/40 blur-[2px] animate-pulse" />
        <div className="absolute bottom-16 right-20 w-3 h-3 rounded-full bg-blue-400/40 blur-[2px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto rounded-2xl border border-border bg-card/35 backdrop-blur-md p-8 shadow-lg space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-foreground">Next Steps</h2>
          <p className="text-muted-foreground">Find nearby scrap dealers and request pickup for your waste</p>
        </div>

        <NearbyDealers />
      </div>
    </section>
  )
}
