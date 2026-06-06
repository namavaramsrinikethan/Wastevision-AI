"use client"

import { HeroSection } from "@/components/hero-section"
import { UploadSection } from "@/components/upload-section"
import { ResultsDashboard } from "@/components/results-dashboard"
import { SegregationScore, EnvironmentalImpact, SmartRecommendations } from "@/components/lower-sections"
import { HistorySection } from "@/components/history-section"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"

interface WasteData {
  score?: number
  grade?: string
  suggestions?: string[]
  carbon_saved?: number
  water_saved?: number
  energy_saved?: number
  trees_saved?: number
}

export default function Home() {
  const [wasteScore, setWasteScore] = useState(0)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [sustain, setSustain] = useState<{
    carbon_saved: number
    water_saved:  number
    energy_saved: number
    trees_saved:  number
  } | null>(null)

  useEffect(() => {
    const loadData = () => {
      const raw = localStorage.getItem("wasteData")
      if (!raw) return
      try {
        const data: WasteData = JSON.parse(raw)
        if (data.score !== undefined)    setWasteScore(data.score)
        if (data.suggestions?.length)    setSuggestions(data.suggestions)
        if (data.carbon_saved !== undefined) {
          setSustain({
            carbon_saved: data.carbon_saved ?? 0,
            water_saved:  data.water_saved  ?? 0,
            energy_saved: data.energy_saved ?? 0,
            trees_saved:  data.trees_saved  ?? 0,
          })
        }
      } catch (e) {
        console.error("Failed to parse wasteData:", e)
      }
    }

    loadData()
    window.addEventListener("storage", loadData)
    return () => window.removeEventListener("storage", loadData)
  }, [])

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <main className="flex-1 min-w-0">
        <HeroSection />
        <UploadSection />
        <ResultsDashboard />
        <SegregationScore score={wasteScore} suggestions={suggestions} />
        <EnvironmentalImpact sustain={sustain} />
        <SmartRecommendations />
        <HistorySection />
        <Footer />
      </main>
    </div>
  )
}