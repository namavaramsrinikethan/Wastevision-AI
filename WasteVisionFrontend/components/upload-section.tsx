"use client"

import { useState, useCallback } from "react"
import { Upload, ImageIcon, X, CheckCircle, Brain, Cpu, Zap, Scan } from "lucide-react"

const loadingSteps = [
  { icon: Scan,  label: "Scanning image..." },
  { icon: Brain, label: "Running AI model..." },
  { icon: Cpu,   label: "Classifying waste types..." },
  { icon: Zap,   label: "Calculating profit estimate..." },
]

export function UploadSection() {
  const [isDragging, setIsDragging]   = useState(false)
  const [preview, setPreview]         = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName]       = useState<string | null>(null)
  const [analyzing, setAnalyzing]     = useState(false)
  const [analyzed, setAnalyzed]       = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)

  const handleFile = useCallback((file: File) => {
  if (!file.type.startsWith("image/")) return

  setSelectedFile(file)   // 🔥 IMPORTANT LINE
  setFileName(file.name)

  const reader = new FileReader()
  reader.onload = (e) => setPreview(e.target?.result as string)
  reader.readAsDataURL(file)

  setAnalyzed(false)
}, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleAnalyze = async () => {
  if (!selectedFile) {
    alert("Please select an image")
    return
  }

  const formData = new FormData()
  formData.append("file", selectedFile)

  try {
    const res = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    console.log("BACKEND RESPONSE:", data) // 🔥 IMPORTANT

    // ✅ SAVE TO LOCAL STORAGE
    localStorage.setItem("wasteData", JSON.stringify(data))
    window.dispatchEvent(new Event("storage"))

    // continue your animation logic
    setAnalyzing(true)
    setLoadingStep(0)

    let step = 0
    const interval = setInterval(() => {
      step++
      if (step < loadingSteps.length) {
        setLoadingStep(step)
      } else {
        clearInterval(interval)
        setTimeout(() => {
          setAnalyzing(false)
          setAnalyzed(true)
          document.getElementById("results")?.scrollIntoView({ behavior: "smooth" })
        }, 400)
      }
    }, 500)

  } catch (err) {
    console.error("ERROR:", err)
  }
}

  const handleClear = () => {
    setPreview(null)
    setFileName(null)
    setAnalyzed(false)
    setAnalyzing(false)
    setLoadingStep(0)
  }

  return (
    <section id="upload" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-neon-cyan/30 mb-4">
            <Upload className="w-3.5 h-3.5 text-neon-cyan" />
            <span className="text-xs font-medium text-neon-cyan tracking-widest uppercase">Step 1</span>
          </div>
          <h2 className="text-4xl font-bold text-balance mb-3">
            Upload Your <span className="text-neon-green">Waste Image</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Drop an image of your waste and our AI will identify, classify, and analyze it instantly.
          </p>
        </div>

        {/* Upload card */}
        <div className="glass rounded-2xl border border-neon-green/20 p-8 hover:border-neon-green/35 transition-colors duration-300">
          {!preview ? (
            <label
              className={`relative flex flex-col items-center justify-center w-full h-72 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                isDragging
                  ? "border-neon-green bg-neon-green/5 glow-green"
                  : "border-border hover:border-neon-green/50 hover:bg-neon-green/[0.02]"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleInputChange}
              />
              <div className="flex flex-col items-center gap-4 pointer-events-none">
                <div className={`w-16 h-16 rounded-2xl border border-neon-green/30 flex items-center justify-center transition-all duration-300 ${isDragging ? "bg-neon-green/20 glow-green scale-110" : "bg-neon-green/10"}`}>
                  <Upload className={`w-7 h-7 transition-colors ${isDragging ? "text-neon-green" : "text-muted-foreground"}`} />
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-foreground">
                    Drag &amp; drop your image here
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or <span className="text-neon-green font-medium">click to browse</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WEBP — Max 10MB
                </p>
              </div>
            </label>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Preview */}
              <div className="relative rounded-xl overflow-hidden border border-neon-green/20 aspect-video bg-secondary flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Uploaded waste image preview"
                  className={`w-full h-full object-contain transition-all duration-500 ${analyzing ? "brightness-50 blur-[1px]" : ""}`}
                />

                {/* AI scanning overlay */}
                {analyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
                    {/* Scan border */}
                    <div className="absolute inset-3 rounded-lg border-2 border-neon-green glow-green animate-pulse-glow" />
                    {/* Horizontal scan line */}
                    <div
                      className="absolute left-3 right-3 h-0.5 bg-neon-green/80"
                      style={{ boxShadow: "0 0 12px var(--neon-green)", animation: "scan-line 1.4s linear infinite", top: "0%" }}
                    />
                    {/* Step indicator */}
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-background/80 border border-neon-green/40 flex items-center justify-center glow-green">
                        {(() => {
                          const StepIcon = loadingSteps[loadingStep].icon
                          return <StepIcon className="w-6 h-6 text-neon-green animate-spin-slow" />
                        })()}
                      </div>
                      <div className="glass border border-neon-green/30 px-4 py-2 rounded-full">
                        <span className="text-sm font-semibold text-neon-green">
                          {loadingSteps[loadingStep].label}
                        </span>
                      </div>
                      {/* Step dots */}
                      <div className="flex items-center gap-2">
                        {loadingSteps.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                              i <= loadingStep ? "bg-neon-green" : "bg-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {analyzed && (
                  <div className="absolute inset-0 border-2 border-neon-green rounded-xl pointer-events-none glow-green" />
                )}
                <button
                  onClick={handleClear}
                  className="absolute top-3 right-3 w-8 h-8 rounded-lg glass border border-border flex items-center justify-center hover:border-destructive hover:text-destructive transition-colors z-20"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* File info */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border">
                <ImageIcon className="w-4 h-4 text-neon-cyan shrink-0" />
                <span className="text-sm text-foreground font-medium truncate flex-1">{fileName}</span>
                {analyzed && <CheckCircle className="w-4 h-4 text-neon-green shrink-0" />}
              </div>

              {!analyzed ? (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full py-3 rounded-xl bg-neon-green text-background font-bold text-sm glow-green hover:opacity-90 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {analyzing ? (
                    <>
                      <Brain className="w-4 h-4 animate-spin" />
                      Analyzing — step {loadingStep + 1} of {loadingSteps.length}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Analyze with WasteVision AI
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl border border-neon-green/40 bg-neon-green/5 hover:bg-neon-green/10 transition-colors duration-200">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  <span className="text-sm font-semibold text-neon-green">
                    Analysis Complete — See Results Below
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Supported types */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {["Plastic", "Metal", "Paper", "Glass", "Organic", "E-Waste"].map((type) => (
            <span
              key={type}
              className="px-3 py-1 rounded-full text-xs font-medium glass border border-border text-muted-foreground hover:border-neon-green/40 hover:text-neon-green transition-colors duration-200 cursor-default"
            >
              {type}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
