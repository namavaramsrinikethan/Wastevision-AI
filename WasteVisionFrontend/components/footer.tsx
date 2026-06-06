import { Zap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo & tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <a href="#" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-neon-green flex items-center justify-center glow-green">
              <Zap className="w-3.5 h-3.5 text-background" fill="currentColor" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Waste<span className="text-neon-green">Vision</span>
            </span>
          </a>
          <p className="text-sm text-muted-foreground font-medium tracking-widest uppercase">
            AI for Sustainability
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {["Upload", "Results", "Profit", "Impact", "Recommendations"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="hover:text-neon-green transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground text-center md:text-right">
          &copy; {new Date().getFullYear()} WasteVision. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
