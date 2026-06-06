"use client"

import { useState, useEffect } from "react"
import { Menu, X, Zap } from "lucide-react"

const navLinks = [
  { label: "Upload", href: "#upload" },
  { label: "Results", href: "#results" },
  { label: "Profit", href: "#profit" },
  { label: "Impact", href: "#impact" },
  { label: "Recommendations", href: "#recommendations" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass border-b border-neon-green/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-neon-green flex items-center justify-center glow-green">
            <Zap className="w-4 h-4 text-background" fill="currentColor" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Waste<span className="text-neon-green">Vision</span>
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm text-muted-foreground hover:text-neon-green transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/dealer"
            className="px-4 py-2 rounded-lg border border-neon-cyan/40 text-neon-cyan font-semibold text-sm hover:bg-neon-cyan/10 transition-all duration-200"
          >
            Dealer Portal
          </a>
          <a
            href="#upload"
            className="px-5 py-2 rounded-lg bg-neon-green text-background font-semibold text-sm glow-green hover:opacity-90 transition-opacity"
          >
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-neon-green/10 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-sm text-muted-foreground hover:text-neon-green transition-colors font-medium"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/dealer"
            onClick={() => setMobileOpen(false)}
            className="px-5 py-2 rounded-lg border border-neon-cyan/40 text-neon-cyan font-semibold text-sm text-center hover:bg-neon-cyan/10 transition-all"
          >
            Dealer Portal
          </a>
          <a
            href="#upload"
            onClick={() => setMobileOpen(false)}
            className="px-5 py-2 rounded-lg bg-neon-green text-background font-semibold text-sm text-center"
          >
            Get Started
          </a>
        </div>
      )}
    </header>
  )
}
