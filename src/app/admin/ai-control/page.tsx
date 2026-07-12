"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface AIModule {
  id: string;
  name: string;
  description: string;
  category: "core" | "analytics" | "automation" | "communication";
  enabled: boolean;
  usage: number; // percent
  callsToday: number;
  callsLimit: number;
  latency: number; // ms
  model: string;
  costUSD: number;
  status: "healthy" | "degraded" | "offline";
  lastUsed: string;
}

interface UsageLog {
  id: string;
  module: string;
  user: string;
  action: string;
  timestamp: string;
  tokens: number;
  status: "success" | "blocked" | "error";
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const INITIAL_MODULES: AIModule[] = [
  {
    id: "wellbeing-ai",
    name: "Wellbeing Monitor AI",
    description: "Analyzes student emotional & behavioral patterns",
    category: "analytics",
    enabled: true,
    usage: 72,
    callsToday: 1847,
    callsLimit: 5000,
    latency: 234,
    model: "claude-3-5-sonnet",
    costUSD: 4.21,
    status: "healthy",
    lastUsed: "2 min ago",
  },
  {
    id: "predictions-ai",
    name: "Predictive Analytics AI",
    description: "Forecasts dropout risk & academic trajectories",
    category: "analytics",
    enabled: true,
    usage: 45,
    callsToday: 923,
    callsLimit: 3000,
    latency: 512,
    model: "claude-3-opus",
    costUSD: 12.87,
    status: "healthy",
    lastUsed: "8 min ago",
  },
  {
    id: "fee-ai",
    name: "Fee Automation AI",
    description: "Smart fee reminders, waivers & fraud detection",
    category: "automation",
    enabled: true,
    usage: 28,
    callsToday: 412,
    callsLimit: 2000,
    latency: 189,
    model: "claude-3-haiku",
    costUSD: 0.94,
    status: "healthy",
    lastUsed: "1 min ago",
  },
  {
    id: "broadcast-ai",
    name: "Emergency Broadcast AI",
    description: "Auto-drafts multilingual emergency alerts",
    category: "communication",
    enabled: false,
    usage: 0,
    callsToday: 0,
    callsLimit: 500,
    latency: 0,
    model: "claude-3-5-sonnet",
    costUSD: 0,
    status: "offline",
    lastUsed: "Never",
  },
  {
    id: "board-ai",
    name: "Board Readiness AI",
    description: "Calculates exam readiness scores per student",
    category: "analytics",
    enabled: true,
    usage: 91,
    callsToday: 2744,
    callsLimit: 3000,
    latency: 678,
    model: "claude-3-opus",
    costUSD: 31.22,
    status: "degraded",
    lastUsed: "Just now",
  },
  {
    id: "timetable-ai",
    name: "Staff Timetable AI",
    description: "Optimizes teacher schedules & conflict resolution",
    category: "automation",
    enabled: true,
    usage: 15,
    callsToday: 87,
    callsLimit: 1000,
    latency: 301,
    model: "claude-3-5-sonnet",
    costUSD: 1.44,
    status: "healthy",
    lastUsed: "34 min ago",
  },
  {
    id: "complaints-ai",
    name: "Complaint Analysis AI",
    description: "Anonymizes & categorizes complaints using NLP",
    category: "communication",
    enabled: true,
    usage: 33,
    callsToday: 219,
    callsLimit: 1000,
    latency: 145,
    model: "claude-3-haiku",
    costUSD: 0.38,
    status: "healthy",
    lastUsed: "15 min ago",
  },
  {
    id: "awards-ai",
    name: "Scholarship Engine AI",
    description: "Matches students to awards based on criteria",
    category: "core",
    enabled: false,
    usage: 0,
    callsToday: 0,
    callsLimit: 500,
    latency: 0,
    model: "claude-3-5-sonnet",
    costUSD: 0,
    status: "offline",
    lastUsed: "3 days ago",
  },
];

const USAGE_LOGS: UsageLog[] = [
  { id: "l1", module: "Wellbeing Monitor AI", user: "admin@zeeshaoor.pk", action: "Batch student scan", timestamp: "09:42:11", tokens: 4821, status: "success" },
  { id: "l2", module: "Board Readiness AI", user: "principal@zeeshaoor.pk", action: "Grade 10 readiness report", timestamp: "09:38:05", tokens: 9134, status: "success" },
  { id: "l3", module: "Board Readiness AI", user: "teacher@zeeshaoor.pk", action: "Single student query", timestamp: "09:35:22", tokens: 2201, status: "blocked" },
  { id: "l4", module: "Fee Automation AI", user: "accounts@zeeshaoor.pk", action: "Monthly reminder batch", timestamp: "09:31:00", tokens: 1540, status: "success" },
  { id: "l5", module: "Predictions AI", user: "admin@zeeshaoor.pk", action: "Dropout risk analysis", timestamp: "09:28:47", tokens: 7832, status: "success" },
  { id: "l6", module: "Complaints AI", user: "system", action: "Auto-categorize submissions", timestamp: "09:20:15", tokens: 882, status: "error" },
  { id: "l7", module: "Wellbeing Monitor AI", user: "counselor@zeeshaoor.pk", action: "Flag high-risk students", timestamp: "09:15:03", tokens: 3210, status: "success" },
];

const CATEGORY_COLORS: Record<string, string> = {
  core: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  analytics: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  automation: "text-violet-400 bg-violet-400/10 border-violet-400/30",
  communication: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
};

const STATUS_DOT: Record<string, string> = {
  healthy: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
  degraded: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
  offline: "bg-slate-600",
};

// --------- Tiny Sparkline ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function Sparkline({ usage, color }: { usage: number; color: string }) {
  const points = Array.from({ length: 12 }, (_, i) =>
    Math.max(5, Math.min(95, usage + (Math.random() - 0.5) * 30))
  );
  const w = 80, h = 28;
  const pts = points
    .map((v, i) => `${(i / 11) * w},${h - (v / 100) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// --------- Arc Gauge ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ArcGauge({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(value / max, 1);
  const r = 22, cx = 28, cy = 28;
  const circumference = Math.PI * r; // half circle
  const offset = circumference * (1 - pct);
  return (
    <svg width="56" height="36" viewBox="0 0 56 36">
      <path d={`M 6 28 A ${r} ${r} 0 0 1 50 28`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" strokeLinecap="round" />
      <path d={`M 6 28 A ${r} ${r} 0 0 1 50 28`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset} />
      <text x="28" y="24" textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

// --------- Module Card ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ModuleCard({ module, onToggle, onSelect, selected }: {
  module: AIModule;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  selected: boolean;
}) {
  const usagePct = module.callsToday / module.callsLimit;
  const barColor = usagePct > 0.85 ? "#f59e0b" : usagePct > 0.6 ? "#22d3ee" : "#34d399";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(module.id)}
      className={`relative cursor-pointer rounded-2xl border transition-all duration-300 p-5 group
        ${selected
          ? "border-cyan-400/60 bg-cyan-400/5 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.055]"
        }`}
    >
      {/* Grid texture overlay */}
      <div className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${STATUS_DOT[module.status]}`} />
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">{module.name}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{module.description}</p>
          </div>
        </div>
        {/* Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(module.id); }}
          className={`relative w-10 h-5 rounded-full transition-all duration-300 shrink-0 ml-2 mt-0.5
            ${module.enabled ? "bg-cyan-500/80 shadow-[0_0_12px_rgba(34,211,238,0.4)]" : "bg-slate-700/60"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300
            ${module.enabled ? "left-5" : "left-0.5"}`} />
        </button>
      </div>

      {/* Category badge + model */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[module.category]}`}>
          {module.category}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">{module.model}</span>
      </div>

      {/* Usage bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-slate-500">API Calls Today</span>
          <span className="text-[10px] font-mono" style={{ color: barColor }}>
            {module.callsToday.toLocaleString()} / {module.callsLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usagePct * 100, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${barColor}99, ${barColor})` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] text-slate-600">Latency</p>
            <p className="text-[11px] font-mono text-slate-300">{module.enabled ? `${module.latency}ms` : "—"}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600">Cost</p>
            <p className="text-[11px] font-mono text-amber-400">${module.costUSD.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600">Last used</p>
            <p className="text-[11px] text-slate-400">{module.lastUsed}</p>
          </div>
        </div>
        <Sparkline usage={module.usage} color={module.enabled ? barColor : "#334155"} />
      </div>

      {/* Degraded warning */}
      {module.status === "degraded" && (
        <div className="mt-3 rounded-lg bg-amber-400/8 border border-amber-400/20 px-3 py-1.5 flex items-center gap-2">
          <svg className="w-3 h-3 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-[10px] text-amber-400">Approaching call limit — consider throttling</span>
        </div>
      )}
    </motion.div>
  );
}

// --------- Detail Panel ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function DetailPanel({ module, onClose }: { module: AIModule; onClose: () => void }) {
  const [limit, setLimit] = useState(module.callsLimit);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 h-fit sticky top-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-white">Module Config</h3>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-5">
        {/* Module identity */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/6">
          <p className="text-xs text-slate-500 mb-1">Module</p>
          <p className="text-sm font-semibold text-white">{module.name}</p>
          <p className="text-[11px] text-slate-500 mt-1">{module.description}</p>
        </div>

        {/* Arc gauges */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/6 text-center">
            <ArcGauge value={module.callsToday} max={module.callsLimit} color="#22d3ee" />
            <p className="text-[10px] text-slate-500 mt-1">API Usage</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/6 text-center">
            <ArcGauge value={module.latency} max={1000} color={module.latency > 500 ? "#f59e0b" : "#34d399"} />
            <p className="text-[10px] text-slate-500 mt-1">Latency</p>
          </div>
        </div>

        {/* Rate limit control */}
        <div>
          <label className="text-[11px] text-slate-400 mb-2 block">Daily Call Limit</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400/50 transition-colors"
            />
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300
                ${saved
                  ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-400"
                  : "bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/30"
                }`}
            >
              {saved ? "✓ Saved" : "Apply"}
            </button>
          </div>
          <input
            type="range" min={100} max={10000} step={100} value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full mt-2 accent-cyan-400"
          />
          <div className="flex justify-between text-[10px] text-slate-600 mt-1">
            <span>100</span><span>10,000</span>
          </div>
        </div>

        {/* Model info */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/6 space-y-3">
          <div className="flex justify-between">
            <span className="text-[11px] text-slate-500">Model</span>
            <span className="text-[11px] font-mono text-slate-300">{module.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-slate-500">Avg Latency</span>
            <span className="text-[11px] font-mono text-slate-300">{module.latency}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-slate-500">Today's Cost</span>
            <span className="text-[11px] font-mono text-amber-400">${module.costUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-slate-500">Status</span>
            <span className={`text-[11px] font-medium ${module.status === "healthy" ? "text-emerald-400" : module.status === "degraded" ? "text-amber-400" : "text-slate-500"}`}>
              {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Danger zone */}
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
          <p className="text-[11px] text-red-400 font-medium mb-2">Danger Zone</p>
          <button className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
            Reset Usage Counter
          </button>
          <button className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
            Force Disable Module
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function AIControlPage() {
  const [modules, setModules] = useState<AIModule[]>(INITIAL_MODULES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"modules" | "logs" | "budget">("modules");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [globalBudget, setGlobalBudget] = useState(100);
  // null until mounted — the server must not render a clock time the client won't match
  const [liveTime, setLiveTime] = useState<Date | null>(null);

  useEffect(() => {
    setLiveTime(new Date());
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, enabled: !m.enabled, status: m.enabled ? "offline" : "healthy", callsToday: m.enabled ? 0 : m.callsToday }
          : m
      )
    );
  };

  const selectedModule = modules.find((m) => m.id === selectedId) ?? null;
  const filtered = filterCat === "all" ? modules : modules.filter((m) => m.category === filterCat);

  const totalCost = modules.reduce((s, m) => s + m.costUSD, 0);
  const totalCalls = modules.reduce((s, m) => s + m.callsToday, 0);
  const activeCount = modules.filter((m) => m.enabled).length;
  const degradedCount = modules.filter((m) => m.status === "degraded").length;

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Ambient orbs */}
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-cyan-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.Pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Usage Controller</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">Monitor, throttle & govern every AI module across the platform</p>
          </div>

          {/* Live clock + global status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/8">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span className="text-xs text-slate-400 font-mono">
                {liveTime
                  ? liveTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
                  : '--:--:--'}
              </span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${degradedCount > 0 ? "bg-amber-400/8 border-amber-400/25 text-amber-400" : "bg-emerald-400/8 border-emerald-400/25 text-emerald-400"}`}>
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">{degradedCount > 0 ? `${degradedCount} modules degraded` : "All systems nominal"}</span>
            </div>
          </div>
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Modules", value: `${activeCount}/${modules.length}`, icon: "⚡", color: "text-cyan-400", sub: `${modules.length - activeCount} offline` },
            { label: "API Calls Today", value: totalCalls.toLocaleString(), icon: "📡", color: "text-violet-400", sub: "across all modules" },
            { label: "Total Cost Today", value: `$${totalCost.toFixed(2)}`, icon: "💰", color: "text-amber-400", sub: `of $${globalBudget} budget` },
            { label: "Degraded Alerts", value: String(degradedCount), icon: "⚠️", color: degradedCount > 0 ? "text-amber-400" : "text-emerald-400", sub: degradedCount > 0 ? "needs attention" : "all healthy" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5 relative overflow-hidden">
              <div className="absolute inset-0 rounded-2xl opacity-[0.025] pointer-events-none"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "20px 20px" }} />
              <p className="text-2xl mb-1">{kpi.icon}</p>
              <p className={`text-2xl font-bold ${kpi.color} font-mono`}>{kpi.value}</p>
              <p className="text-xs text-white font-medium mt-1">{kpi.label}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ------ Tabs ------ */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-fit">
          {(["modules", "logs", "budget"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                ${activeTab === tab
                  ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
                  : "text-slate-500 hover:text-slate-300"
                }`}
            >
              {tab === "modules" ? "AI Modules" : tab === "logs" ? "Activity Logs" : "Budget Control"}
            </button>
          ))}
        </div>

        {/* ------ Modules Tab ------ */}
        {activeTab === "modules" && (
          <div className="flex gap-6">
            {/* Left: cards */}
            <div className="flex-1 min-w-0">
              {/* Category filter */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                {["all", "core", "analytics", "automation", "communication"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCat(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 capitalize border
                      ${filterCat === cat
                        ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-400"
                        : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
                <span className="ml-auto text-[11px] text-slate-600">{filtered.length} modules</span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filtered.map((mod) => (
                    <ModuleCard
                      key={mod.id}
                      module={mod}
                      onToggle={toggleModule}
                      onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
                      selected={selectedId === mod.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: detail panel */}
            <div className="w-80 shrink-0">
              <AnimatePresence>
                {selectedModule && (
                  <DetailPanel
                    key={selectedModule.id}
                    module={selectedModule}
                    onClose={() => setSelectedId(null)}
                  />
                )}
              </AnimatePresence>
              {!selectedModule && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-600">Click a module card to configure it</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------ Logs Tab ------ */}
        {activeTab === "logs" && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/6 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Real-Time Activity Feed</h3>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-slate-500">Live</span>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {USAGE_LOGS.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={`w-16 text-center text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0
                    ${log.status === "success" ? "bg-emerald-400/10 text-emerald-400" :
                      log.status === "blocked" ? "bg-amber-400/10 text-amber-400" :
                        "bg-red-400/10 text-red-400"}`}>
                    {log.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">{log.timestamp}</span>
                  <span className="text-[11px] text-slate-400 shrink-0 w-40 truncate">{log.module}</span>
                  <span className="text-[11px] text-slate-500 flex-1 truncate">{log.action}</span>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0 w-20 text-right">{log.user.split("@")[0]}</span>
                  <span className="text-[11px] font-mono text-amber-400/70 shrink-0 w-20 text-right">
                    {log.tokens.toLocaleString()} tok
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="p-4 border-t border-white/6 flex items-center justify-between">
              <span className="text-[11px] text-slate-600">Showing 7 of 2,048 events today</span>
              <button className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">Export CSV →</button>
            </div>
          </div>
        )}

        {/* ------ Budget Tab ------ */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            {/* Budget setter */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-6">
              <h3 className="text-sm font-semibold text-white mb-1">Daily AI Budget</h3>
              <p className="text-[11px] text-slate-500 mb-5">Set a daily spending cap across all AI modules. Modules will throttle automatically when 90% is reached.</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-3xl font-bold text-white font-mono">
                  $<input
                    type="number"
                    value={globalBudget}
                    onChange={(e) => setGlobalBudget(Number(e.target.value))}
                    className="bg-transparent w-24 focus:outline-none text-cyan-400"
                  />
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((totalCost / globalBudget) * 100, 100)}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full"
                      style={{
                        background: totalCost / globalBudget > 0.8
                          ? "linear-gradient(90deg, #f59e0b99, #f59e0b)"
                          : "linear-gradient(90deg, #22d3ee99, #22d3ee)"
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                    <span>${totalCost.toFixed(2)} spent</span>
                    <span>${(globalBudget - totalCost).toFixed(2)} remaining</span>
                  </div>
                </div>
              </div>

              <input type="range" min={10} max={500} step={5} value={globalBudget}
                onChange={(e) => setGlobalBudget(Number(e.target.value))}
                className="w-full accent-cyan-400" />
            </div>

            {/* Cost breakdown per module */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.025] overflow-hidden">
              <div className="p-5 border-b border-white/6">
                <h3 className="text-sm font-semibold text-white">Cost Breakdown by Module</h3>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {[...modules].sort((a, b) => b.costUSD - a.costUSD).map((mod) => (
                  <div key={mod.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[mod.status]}`} />
                    <span className="text-xs text-slate-300 flex-1">{mod.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono w-24 text-right">{mod.callsToday.toLocaleString()} calls</span>
                    <div className="w-32">
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400/70"
                          style={{ width: `${Math.min((mod.costUSD / totalCost) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 w-14 text-right">${mod.costUSD.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-white/6 flex justify-between items-center">
                <span className="text-xs text-slate-500">Total spend today</span>
                <span className="text-base font-bold text-amber-400 font-mono">${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
