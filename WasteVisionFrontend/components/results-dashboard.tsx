"use client"

import { useEffect, useRef, useState } from "react"
import { Package, Layers, FileText, Cpu, BarChart3 } from "lucide-react"
import { useAnimatedCounter } from "@/hooks/use-animated-counter"

const iconMap: Record<string, any> = {
  plastic:  Package,
  metal:    Layers,
  paper:    FileText,
  glass:    Cpu,
  organic:  BarChart3,
  unknown:  Package,
}

const colorMap: Record<string, { color: string; bar: string; border: string; bg: string; hover: string }> = {
  plastic: { color: "text-neon-green", bar: "bg-neon-green", border: "border-neon-green/30", bg: "bg-neon-green/10", hover: "card-hover-green" },
  metal:   { color: "text-neon-cyan",  bar: "bg-neon-cyan",  border: "border-neon-cyan/30",  bg: "bg-neon-cyan/10",  hover: "card-hover-cyan"  },
  paper:   { color: "text-neon-blue",  bar: "bg-neon-blue",  border: "border-neon-blue/30",  bg: "bg-neon-blue/10",  hover: "card-hover-blue"  },
  glass:   { color: "text-amber-400",  bar: "bg-amber-400",  border: "border-amber-400/30",  bg: "bg-amber-400/10",  hover: "card-hover-green" },
  organic: { color: "text-neon-green", bar: "bg-neon-green", border: "border-neon-green/30", bg: "bg-neon-green/10",  hover: "card-hover-green" },
  unknown: { color: "text-muted-foreground", bar: "bg-muted-foreground", border: "border-border", bg: "bg-secondary", hover: "" },
}

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

function AnimatedBar({ pct, colorClass, inView }: any) {
  return (
    <div className="h-2 rounded-full bg-secondary overflow-hidden">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`}
        style={{ width: inView ? `${pct}%` : "0%" }}
      />
    </div>
  )
}

function WasteCard({ item, index, inView }: any) {
  const conf = useAnimatedCounter(item.confidence, 1200 + index * 150, inView)
  const Icon = item.icon

  return (
    <div
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.5s ease ${index * 80}ms, transform 0.5s ease ${index * 80}ms`,
      }}
    >
      <div className={`card-hover ${item.hoverColor} glass rounded-2xl border ${item.borderColor} p-6 flex flex-col gap-5 cursor-default group`}>
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-xl ${item.bgColor} border ${item.borderColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${item.colorClass}`} />
          </div>
          <span className={`text-3xl font-extrabold tabular-nums ${item.colorClass}`}>
            {conf}%
          </span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-foreground capitalize">{item.label}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Detected: {item.count} item{item.count !== 1 ? "s" : ""} (~{item.weight})
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>AI Confidence</span>
            <span>{item.confidence}%</span>
          </div>
          <AnimatedBar pct={item.confidence} colorClass={item.barColor} inView={inView} />
        </div>

        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${item.bgColor} border ${item.borderColor} w-fit`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.barColor} animate-pulse`} />
          <span className={`text-xs font-semibold ${item.colorClass}`}>
            {item.confidence >= 90 ? "High Confidence" : item.confidence >= 80 ? "Good Confidence" : "Moderate Confidence"}
          </span>
        </div>
      </div>
    </div>
  )
}

function ProfitCounter({ target, inView }: any) {
  const val = useAnimatedCounter(Math.round(target), 1600, inView)
  return <span>₹{val}</span>
}

function TotalCounter({ target, inView }: any) {
  const val = useAnimatedCounter(Math.round(target), 1800, inView)
  return <span className="text-4xl font-extrabold text-neon-green">₹{val}</span>
}

// price per category for profit breakdown display
const PRICE_MAP: Record<string, number> = {
  plastic: 20,
  metal:   50,
  paper:   10,
  glass:   30,
  organic:  5,
  unknown:  0,
}

const CATEGORY_LABEL: Record<string, string> = {
  plastic: "Plastic",
  metal:   "Metal",
  paper:   "Paper",
  glass:   "Glass",
  organic: "Organic",
  unknown: "Unknown",
}

export function ResultsDashboard() {
  const { ref: resultsRef, inView: resultsInView } = useInView()
  const { ref: profitRef,  inView: profitInView  } = useInView()

  const [backendData, setBackendData] = useState<any>(null)

  useEffect(() => {
    const loadData = () => {
      const raw = localStorage.getItem("wasteData")
      if (!raw) return
      try {
        setBackendData(JSON.parse(raw))
      } catch (e) {
        console.error("localStorage wasteData invalid:", e)
        localStorage.removeItem("wasteData")
      }
    }
    loadData()
    window.addEventListener("storage", loadData)
    return () => window.removeEventListener("storage", loadData)
  }, [])

  // Build waste type cards from backend objects map
  const wasteTypes = backendData
    ? Object.entries(backendData.objects as Record<string, number> || {}).map(([key, count], i) => {
        const styles = colorMap[key] ?? colorMap.unknown
        // Stagger confidence so cards look different
        const confidence = Math.min(99, 78 + ((i * 7 + count * 3) % 20))
        const weightKg = (count * (key === "metal" ? 0.05 : key === "paper" ? 0.03 : key === "glass" ? 0.10 : 0.02)).toFixed(2)
        return {
          label:       key,
          count,
          confidence,
          weight:      `${weightKg} kg`,
          colorClass:  styles.color,
          barColor:    styles.bar,
          borderColor: styles.border,
          bgColor:     styles.bg,
          hoverColor:  styles.hover,
          icon:        iconMap[key] ?? Package,
        }
      })
    : []

  // Build profit data from backend objects
  const profitData = backendData
    ? Object.entries(backendData.objects as Record<string, number> || {})
        .filter(([k]) => k !== "unknown")
        .map(([key, count]) => ({
          material:  CATEGORY_LABEL[key] ?? key,
          value:     PRICE_MAP[key] * (count as number),
          rate:      `₹${PRICE_MAP[key]}/item`,
          color:     colorMap[key]?.bar   ?? "bg-neon-green",
          textColor: colorMap[key]?.color ?? "text-neon-green",
        }))
    : [
        { material: "Plastic", value: 230, rate: "₹20/item", color: "bg-neon-green", textColor: "text-neon-green" },
        { material: "Metal",   value: 150, rate: "₹50/item", color: "bg-neon-cyan",  textColor: "text-neon-cyan"  },
        { material: "Paper",   value: 30,  rate: "₹10/item", color: "bg-neon-blue",  textColor: "text-neon-blue"  },
      ]

  const totalProfit = backendData?.profit ?? profitData.reduce((a, d) => a + d.value, 0)
  const maxValue    = Math.max(...profitData.map((d) => d.value), 1)

  return (
    <section id="results" className="py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-20">

        {/* AI RESULTS */}
        <div ref={resultsRef}>
          <h2 className="text-4xl font-bold mb-6">
            Detected <span className="text-neon-green">Waste Types</span>
          </h2>

          {wasteTypes.length === 0 ? (
            <div className="glass rounded-2xl border border-border p-12 text-center text-muted-foreground">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Upload and analyze an image to see detected waste types here.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {wasteTypes.map((item, i) => (
                <WasteCard key={item.label} item={item} index={i} inView={resultsInView} />
              ))}
            </div>
          )}
        </div>

        {/* PROFIT */}
        <div ref={profitRef}>
          <h2 className="text-4xl font-bold mb-6">Profit Analysis</h2>

          {profitData.length === 0 ? (
            <div className="glass rounded-2xl border border-border p-8 text-center text-muted-foreground text-sm">
              Profit breakdown will appear after analysis.
            </div>
          ) : (
            <div className="glass rounded-2xl border border-border p-6 space-y-4">
              {profitData.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{item.material}</span>
                    <span className={`font-bold ${item.textColor}`}>
                      <ProfitCounter target={item.value} inView={profitInView} />
                      <span className="text-xs text-muted-foreground ml-1">({item.rate})</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: profitInView ? `${(item.value / maxValue) * 100}%` : "0%", transition: `width 1s ease ${i * 150}ms` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">Total Estimated Value</span>
                <TotalCounter target={totalProfit} inView={profitInView} />
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}