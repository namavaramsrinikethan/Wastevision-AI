"use client"

import { HeroSection } from "@/components/hero-section"
import { UploadSection } from "@/components/upload-section"
import { ResultsDashboard } from "@/components/results-dashboard"
import { SegregationScore, EnvironmentalImpact, SmartRecommendations } from "@/components/lower-sections"
import { HistorySection } from "@/components/history-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <main className="flex-1 min-w-0">
        <HeroSection />
        <UploadSection />
        <ResultsDashboard />
        <SegregationScore />
        <EnvironmentalImpact />
        <SmartRecommendations />
        <HistorySection />
        <Footer />
      </main>
    </div>
  )
}