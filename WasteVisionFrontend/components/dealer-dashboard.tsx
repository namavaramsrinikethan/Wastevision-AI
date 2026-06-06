"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Package, LogOut, RefreshCw, CheckCircle, XCircle,
  Truck, Clock, MapPin, User, Phone, Loader2, AlertCircle,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dealer {
  id: string
  name: string
  area: string
  username: string
}

interface PickupRequest {
  id: string
  user_name: string
  phone: string
  address: string
  lat: number
  lng: number
  waste_types: string[]
  dealer_name: string
  estimated_value: number
  status: "Pending" | "Accepted" | "Rejected" | "Completed"
  driver: { name: string; phone: string; vehicle: string; color: string } | null
  eta_minutes: number | null
  reference_id: string
  created_at: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  Pending:   "bg-amber-400/10 border-amber-400/30 text-amber-400",
  Accepted:  "bg-neon-green/10 border-neon-green/30 text-neon-green",
  Rejected:  "bg-red-400/10 border-red-400/30 text-red-400",
  Completed: "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan",
}

function timeAgo(ts: number) {
  const secs = Math.floor(Date.now() / 1000) - ts
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (dealer: Dealer) => void }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("http://localhost:5000/dealer_login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Login failed")
      onLogin(data.dealer)
    } catch (e: any) {
      setError(e.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
              <Truck className="w-6 h-6 text-neon-green" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">WasteVision</p>
              <p className="font-bold text-foreground">Dealer Portal</p>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Dealer Login</h1>
          <p className="text-muted-foreground mt-2">Access your pickup request dashboard</p>
        </div>

        {/* Demo creds hint */}
        <div className="rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-neon-cyan mb-1">Demo Credentials:</p>
          <p>dealer1 / pass123 &nbsp;·&nbsp; dealer2 / pass456 &nbsp;·&nbsp; dealer3 / pass789</p>
        </div>

        <form onSubmit={handleLogin} className="glass rounded-2xl border border-border p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="dealer1"
              required
              className="w-full rounded-xl border border-border bg-background/80 px-4 py-3 text-sm outline-none focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-border bg-background/80 px-4 py-3 text-sm outline-none focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-neon-green text-background font-bold text-sm hover:opacity-90 hover:scale-[1.01] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          <a href="/" className="text-neon-cyan hover:underline">← Back to WasteVision</a>
        </p>
      </div>
    </div>
  )
}

// ─── Request Card ──────────────────────────────────────────────────────────────

function RequestCard({
  req,
  onAccept,
  onReject,
  onComplete,
  actioning,
}: {
  req: PickupRequest
  onAccept:   (id: string) => void
  onReject:   (id: string) => void
  onComplete: (id: string) => void
  actioning:  string | null
}) {
  const busy = actioning === req.reference_id

  return (
    <div className={`glass rounded-2xl border p-6 space-y-4 transition-all duration-300 ${
      req.status === "Accepted"  ? "border-neon-green/40 bg-neon-green/5"  :
      req.status === "Completed" ? "border-neon-cyan/40 bg-neon-cyan/5"    :
      req.status === "Rejected"  ? "border-red-400/20 opacity-60"          :
      "border-border"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-neon-green font-semibold">{req.reference_id}</p>
          <p className="font-bold text-foreground mt-0.5">{req.user_name}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(req.created_at)}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[req.status] ?? STATUS_STYLE.Pending}`}>
          {req.status}
        </span>
      </div>

      {/* Details grid */}
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <a href={`tel:${req.phone}`} className="text-neon-green hover:underline">{req.phone}</a>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{req.address}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="w-3.5 h-3.5 shrink-0" />
          <span>{req.waste_types.join(", ")}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-neon-green font-bold">₹{req.estimated_value}</span>
          <span>est. value</span>
        </div>
      </div>

      {/* Driver info (when accepted) */}
      {req.status === "Accepted" && req.driver && (
        <div className="rounded-xl border border-neon-green/20 bg-neon-green/5 p-3 text-sm space-y-1">
          <p className="font-semibold text-neon-green flex items-center gap-1.5">
            <Truck className="w-4 h-4" /> Driver Assigned
          </p>
          <p className="text-muted-foreground">{req.driver.name} · {req.driver.phone}</p>
          <p className="text-muted-foreground">{req.driver.vehicle} ({req.driver.color}) · ETA {req.eta_minutes} min</p>
        </div>
      )}

      {/* Actions */}
      {req.status === "Pending" && (
        <div className="flex gap-3">
          <button
            onClick={() => onAccept(req.reference_id)}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl border border-neon-green/40 bg-neon-green/10 text-neon-green font-semibold text-sm hover:bg-neon-green/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Accept
          </button>
          <button
            onClick={() => onReject(req.reference_id)}
            disabled={busy}
            className="flex-1 py-2.5 rounded-xl border border-red-400/30 bg-red-400/10 text-red-400 font-semibold text-sm hover:bg-red-400/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      )}

      {req.status === "Accepted" && (
        <button
          onClick={() => onComplete(req.reference_id)}
          disabled={busy}
          className="w-full py-2.5 rounded-xl border border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan font-semibold text-sm hover:bg-neon-cyan/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Mark as Completed
        </button>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({ dealer, onLogout }: { dealer: Dealer; onLogout: () => void }) {
  const [requests, setRequests]   = useState<PickupRequest[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [actioning, setActioning] = useState<string | null>(null)
  const [filter, setFilter]       = useState<"All" | "Pending" | "Accepted" | "Completed" | "Rejected">("All")

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("http://localhost:5000/pickup_requests")
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setRequests(Array.isArray(data) ? data.reverse() : [])
    } catch (e: any) {
      setError(e.message || "Could not load requests")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
    const interval = setInterval(fetchRequests, 8000)
    return () => clearInterval(interval)
  }, [fetchRequests])

  const callAction = async (endpoint: string, ref_id: string) => {
    setActioning(ref_id)
    try {
      const res = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference_id: ref_id }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      await fetchRequests()
    } catch (e: any) {
      setError(e.message || "Action failed")
    } finally {
      setActioning(null)
    }
  }

  const displayed = filter === "All" ? requests : requests.filter(r => r.status === filter)
  const counts = {
    All:       requests.length,
    Pending:   requests.filter(r => r.status === "Pending").length,
    Accepted:  requests.filter(r => r.status === "Accepted").length,
    Completed: requests.filter(r => r.status === "Completed").length,
    Rejected:  requests.filter(r => r.status === "Rejected").length,
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
              <Truck className="w-4 h-4 text-neon-green" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">{dealer.name}</p>
              <p className="text-xs text-muted-foreground">{dealer.area}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="p-2 rounded-xl border border-border hover:border-neon-green/40 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:border-red-400/40 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-4 gap-4">
          {(["Pending", "Accepted", "Completed", "Rejected"] as const).map((s) => (
            <div key={s} className={`glass rounded-2xl border p-4 flex items-center gap-3 ${STATUS_STYLE[s]}`}
              style={{ borderColor: "var(--border)" }}>
              <div className="text-2xl font-extrabold tabular-nums">{counts[s]}</div>
              <div className="text-sm font-medium">{s}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["All", "Pending", "Accepted", "Completed", "Rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                filter === f
                  ? "border-neon-green/60 bg-neon-green/10 text-neon-green"
                  : "border-border text-muted-foreground hover:border-neon-green/30"
              }`}
            >
              {f} {f !== "All" && `(${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Requests */}
        {loading && requests.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
            <p>Loading pickup requests…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <Clock className="w-10 h-10 opacity-30" />
            <p className="text-lg font-medium">No {filter !== "All" ? filter.toLowerCase() : ""} requests</p>
            <p className="text-sm">New pickup requests will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {displayed.map((req) => (
              <RequestCard
                key={req.reference_id}
                req={req}
                onAccept={(id) => callAction("accept_pickup", id)}
                onReject={(id) => callAction("reject_pickup", id)}
                onComplete={(id) => callAction("complete_pickup", id)}
                actioning={actioning}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function DealerDashboard() {
  const [dealer, setDealer] = useState<Dealer | null>(null)

  const handleLogout = () => setDealer(null)

  if (!dealer) return <LoginScreen onLogin={setDealer} />
  return <Dashboard dealer={dealer} onLogout={handleLogout} />
}
