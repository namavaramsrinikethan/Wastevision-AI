"use client"

import { useState, useEffect } from "react"
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  MapPin,
  History,
  Settings,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { id: "dashboard",      label: "Dashboard",     icon: LayoutDashboard, href: "#" },
  { id: "upload",         label: "Upload Image",  icon: Upload,          href: "#upload" },
  { id: "analytics",      label: "Analytics",     icon: BarChart3,       href: "#results" },
  { id: "disposal",       label: "Disposal Plan", icon: MapPin,          href: "#recommendations" },
  { id: "history",        label: "History",       icon: History,         href: "#history" },
  { id: "settings",       label: "Settings",      icon: Settings,        href: "#settings" },
]

interface AppSidebarProps {
  activeSection: string
}

export function AppSidebar({ activeSection }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out",
          "border-r border-border",
          "glass",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-border px-3 shrink-0",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-neon-green flex items-center justify-center glow-green shrink-0">
            <Zap className="w-4 h-4 text-background" fill="currentColor" />
          </div>
          <span
            className={cn(
              "text-base font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            Waste<span className="text-neon-green">Vision</span>
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 flex-1 px-2 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeSection === item.id
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                 e.preventDefault()
                 if (!item.href || item.href === "#") {
                   window.scrollTo({ top: 0, behavior: "smooth" })
                   return
                 }
                 try {
                   const element = document.querySelector(item.href)
                   if (element) {
                     element.scrollIntoView({ behavior: "smooth" })
                   }
                 } catch {
                   // invalid selector — do nothing
                 }
                }}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl transition-all duration-300 ease-in-out cursor-pointer",
                  "h-10 px-3 gap-3 transform",

                  isActive
                    ? "bg-green-500/15 text-green-400 border border-green-500/30 shadow-[0_0_12px_rgba(34,197,94,0.5)]"
                    : "text-muted-foreground border border-transparent",

                  // 🔥 HOVER GLOW + FLOAT
                   "hover:bg-green-500/10 hover:text-green-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.6)]",
                   "hover:scale-[1.03] hover:-translate-y-[2px]"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-neon-green" />
                )}

                <item.icon
                  className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-colors duration-200",
                    isActive ? "text-neon-green" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />

                <span
                  className={cn(
                    "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}
                >
                  {item.label}
                </span>

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 rounded-md bg-card border border-border text-xs text-foreground font-medium pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </a>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex items-center rounded-xl h-10 px-3 gap-3 w-full",
              "text-muted-foreground hover:text-foreground hover:bg-secondary",
              "transition-all duration-200 border border-transparent"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-[18px] h-[18px] shrink-0" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
                <span className={cn(
                  "text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300",
                  collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                  Collapse
                </span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer to push content right */}
      <div
        className={cn(
          "shrink-0 transition-all duration-300 ease-in-out",
          collapsed ? "w-[68px]" : "w-[220px]"
        )}
        aria-hidden="true"
      />
    </>
  )
}
