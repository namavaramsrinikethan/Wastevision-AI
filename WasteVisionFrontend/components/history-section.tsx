"use client"

import { useState } from "react"
import { History, Search, TrendingUp, ArrowUpRight } from "lucide-react"

const historyRows = [
  { id: "WV-0041", date: "Mar 22, 2026", types: ["Plastic", "Metal"], totalWeight: "3.4 kg", profit: 510, score: 82, status: "Sold" },
  { id: "WV-0040", date: "Mar 20, 2026", types: ["Paper", "Plastic"], totalWeight: "1.9 kg", profit: 234, score: 71, status: "Recycled" },
  { id: "WV-0039", date: "Mar 18, 2026", types: ["Metal"],            totalWeight: "5.1 kg", profit: 1785, score: 95, status: "Sold" },
  { id: "WV-0038", date: "Mar 15, 2026", types: ["Glass", "Paper"],   totalWeight: "2.7 kg", profit: 108, score: 63, status: "Recycled" },
  { id: "WV-0037", date: "Mar 12, 2026", types: ["E-Waste"],          totalWeight: "0.8 kg", profit: 320, score: 88, status: "Disposed" },
  { id: "WV-0036", date: "Mar 10, 2026", types: ["Organic"],          totalWeight: "4.2 kg", profit: 0,   score: 55, status: "Composted" },
]

const statusColors: Record<string, string> = {
  Sold:       "bg-neon-green/10 border-neon-green/30 text-neon-green",
  Recycled:   "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan",
  Disposed:   "bg-neon-blue/10 border-neon-blue/30 text-neon-blue",
  Composted:  "bg-amber-400/10 border-amber-400/30 text-amber-400",
}

export function HistorySection() {
  const [query, setQuery] = useState("")

  const filtered = historyRows.filter(
    (r) =>
      r.id.toLowerCase().includes(query.toLowerCase()) ||
      r.types.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
      r.status.toLowerCase().includes(query.toLowerCase())
  )

  const totalProfit = historyRows.reduce((a, r) => a + r.profit, 0)
  const totalWeight = historyRows.reduce((a, r) => a + parseFloat(r.totalWeight), 0)
  const avgScore    = Math.round(historyRows.reduce((a, r) => a + r.score, 0) / historyRows.length)

  return (
    <section id="history" className="py-24 px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-neon-green/30 mb-4">
            <History className="w-3.5 h-3.5 text-neon-green" />
            <span className="text-xs font-medium text-neon-green tracking-widest uppercase">History</span>
          </div>
          <h2 className="text-4xl font-bold text-balance mb-3">
            Past <span className="text-neon-green">Analyses</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A log of all your previous waste scans and outcomes.
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Total Profit Earned",    value: `₹${totalProfit.toLocaleString()}`, icon: TrendingUp, color: "text-neon-green", border: "border-neon-green/30", bg: "bg-neon-green/10", hover: "card-hover-green" },
            { label: "Total Waste Processed",  value: `${totalWeight.toFixed(1)} kg`,     icon: ArrowUpRight, color: "text-neon-cyan", border: "border-neon-cyan/30", bg: "bg-neon-cyan/10", hover: "card-hover-cyan" },
            { label: "Avg Segregation Score",  value: `${avgScore}/100`,                  icon: History, color: "text-neon-blue",  border: "border-neon-blue/30",  bg: "bg-neon-blue/10", hover: "card-hover-blue"  },
          ].map((s) => (
            <div
              key={s.label}
              className={`card-hover ${s.hover} glass rounded-2xl border ${s.border} p-5 flex items-center gap-4`}
            >
              <div className={`w-11 h-11 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID, type or status..."
            className="w-full pl-10 pr-4 py-3 rounded-xl glass border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/30 transition-all duration-200"
          />
        </div>

        {/* Table */}
        <div className="glass rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Waste Types</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profit</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      No records match your search.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      className="border-b border-border/60 last:border-0 transition-all duration-200 cursor-default group"
                      style={{
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "oklch(0.16 0.02 240 / 0.8)"
                        e.currentTarget.style.boxShadow = "inset 3px 0 0 var(--neon-green)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent"
                        e.currentTarget.style.boxShadow = "none"
                      }}
                    >
                      <td className="px-5 py-4 font-mono text-xs text-neon-green group-hover:text-neon-green font-semibold">
                        {row.id}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{row.date}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {row.types.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary border border-border text-foreground"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-foreground font-medium">{row.totalWeight}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-neon-green transition-all duration-700"
                              style={{ width: `${row.score}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-foreground tabular-nums">{row.score}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-neon-green tabular-nums">
                        {row.profit > 0 ? `₹${row.profit.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[row.status]}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
