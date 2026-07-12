"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface DeleteRule {
  id: string;
  name: string;
  description: string;
  target: string;
  condition: string;
  retentionDays: number;
  enabled: boolean;
  lastRun: string;
  nextRun: string;
  deletedCount: number;
  status: "idle" | "running" | "done" | "error";
  category: "academic" | "user" | "logs" | "media" | "temp";
  riskLevel: "low" | "medium" | "high";
}

interface DeleteLog {
  id: string;
  rule: string;
  itemsDeleted: number;
  spaceFreed: string;
  timestamp: string;
  status: "success" | "error" | "skipped";
  triggeredBy: "auto" | "manual";
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const INITIAL_RULES: DeleteRule[] = [
  {
    id: "r1",
    name: "Expired Past Papers",
    description: "Delete past papers older than retention period",
    target: "past_papers",
    condition: "uploaded_at < NOW() - INTERVAL",
    retentionDays: 365,
    enabled: true,
    lastRun: "Yesterday 02:00 AM",
    nextRun: "Tomorrow 02:00 AM",
    deletedCount: 142,
    status: "idle",
    category: "academic",
    riskLevel: "medium",
  },
  {
    id: "r2",
    name: "Inactive Student Accounts",
    description: "Archive accounts with no login for extended period",
    target: "students",
    condition: "last_login < NOW() - INTERVAL AND status = inactive",
    retentionDays: 180,
    enabled: true,
    lastRun: "3 days ago",
    nextRun: "In 4 days",
    deletedCount: 28,
    status: "idle",
    category: "user",
    riskLevel: "high",
  },
  {
    id: "r3",
    name: "System Activity Logs",
    description: "Purge verbose system logs to free storage",
    target: "system_logs",
    condition: "created_at < NOW() - INTERVAL",
    retentionDays: 30,
    enabled: true,
    lastRun: "Today 01:00 AM",
    nextRun: "Tomorrow 01:00 AM",
    deletedCount: 89341,
    status: "idle",
    category: "logs",
    riskLevel: "low",
  },
  {
    id: "r4",
    name: "Temp Upload Files",
    description: "Clean up failed or abandoned file uploads",
    target: "temp_uploads",
    condition: "created_at < NOW() - 24h AND status = pending",
    retentionDays: 1,
    enabled: true,
    lastRun: "2 hours ago",
    nextRun: "In 22 hours",
    deletedCount: 1204,
    status: "idle",
    category: "temp",
    riskLevel: "low",
  },
  {
    id: "r5",
    name: "Old Question Bank Drafts",
    description: "Remove unpublished question drafts older than threshold",
    target: "question_drafts",
    condition: "status = draft AND updated_at < NOW() - INTERVAL",
    retentionDays: 90,
    enabled: false,
    lastRun: "Never",
    nextRun: "Disabled",
    deletedCount: 0,
    status: "idle",
    category: "academic",
    riskLevel: "medium",
  },
  {
    id: "r6",
    name: "Expired Sessions",
    description: "Clear stale authentication session tokens",
    target: "sessions",
    condition: "expires_at < NOW()",
    retentionDays: 7,
    enabled: true,
    lastRun: "1 hour ago",
    nextRun: "In 23 hours",
    deletedCount: 5621,
    status: "idle",
    category: "logs",
    riskLevel: "low",
  },
  {
    id: "r7",
    name: "Orphaned Media Files",
    description: "Delete media files with no parent record reference",
    target: "media_storage",
    condition: "parent_id IS NULL AND created_at < NOW() - INTERVAL",
    retentionDays: 14,
    enabled: false,
    lastRun: "1 week ago",
    nextRun: "Disabled",
    deletedCount: 67,
    status: "idle",
    category: "media",
    riskLevel: "medium",
  },
  {
    id: "r8",
    name: "AI Generation Cache",
    description: "Purge cached AI responses and embeddings",
    target: "ai_cache",
    condition: "created_at < NOW() - INTERVAL",
    retentionDays: 3,
    enabled: true,
    lastRun: "6 hours ago",
    nextRun: "In 18 hours",
    deletedCount: 23847,
    status: "idle",
    category: "temp",
    riskLevel: "low",
  },
];

const DELETE_LOGS: DeleteLog[] = [
  { id: "l1", rule: "System Activity Logs", itemsDeleted: 12847, spaceFreed: "2.4 GB", timestamp: "Today 01:00 AM", status: "success", triggeredBy: "auto" },
  { id: "l2", rule: "AI Generation Cache", itemsDeleted: 3241, spaceFreed: "840 MB", timestamp: "Today 06:00 AM", status: "success", triggeredBy: "auto" },
  { id: "l3", rule: "Temp Upload Files", itemsDeleted: 89, spaceFreed: "1.2 GB", timestamp: "Today 08:30 AM", status: "success", triggeredBy: "auto" },
  { id: "l4", rule: "Expired Sessions", itemsDeleted: 2104, spaceFreed: "120 MB", timestamp: "Yesterday 11:00 PM", status: "success", triggeredBy: "auto" },
  { id: "l5", rule: "Orphaned Media Files", itemsDeleted: 0, spaceFreed: "0 B", timestamp: "Yesterday 03:00 AM", status: "skipped", triggeredBy: "auto" },
  { id: "l6", rule: "Expired Past Papers", itemsDeleted: 12, spaceFreed: "340 MB", timestamp: "2 days ago", status: "success", triggeredBy: "manual" },
  { id: "l7", rule: "Inactive Student Accounts", itemsDeleted: 0, spaceFreed: "0 B", timestamp: "3 days ago", status: "error", triggeredBy: "auto" },
];

// --------- Constants ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const CATEGORY_STYLE: Record<string, string> = {
  academic: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  user: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  logs: "text-slate-400 bg-slate-400/10 border-slate-400/25",
  media: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  temp: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
};

const RISK_STYLE: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-400/8 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/8 border-amber-400/20",
  high: "text-red-400 bg-red-400/8 border-red-400/20",
};

const RISK_ICON: Record<string, string> = { low: "🟢", medium: "🟡", high: "🔴" };

// --------- Confirm Modal ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ConfirmModal({
  rule,
  onConfirm,
  onCancel,
}: {
  rule: DeleteRule;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const required = "DELETE";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#020817] p-6 shadow-[0_0_60px_rgba(239,68,68,0.15)]"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Confirm Manual Delete</h3>
            <p className="text-[11px] text-slate-500">This action cannot be undone</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/15 mb-5">
          <p className="text-xs text-slate-400 mb-1">Rule</p>
          <p className="text-sm font-semibold text-white">{rule.name}</p>
          <p className="text-[11px] text-slate-500 mt-1">{rule.description}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${RISK_STYLE[rule.riskLevel]}`}>
              {RISK_ICON[rule.riskLevel]} {rule.riskLevel} risk
            </span>
            <span className="text-[10px] text-slate-500">Target: <span className="font-mono text-slate-400">{rule.target}</span></span>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-[11px] text-slate-500 mb-2 block">
            Type <span className="font-mono text-red-400 font-bold">DELETE</span> to confirm
          </label>
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value.toUpperCase())}
            placeholder="Type DELETE here..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-400/50 transition-colors placeholder:text-slate-700"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-400 hover:bg-white/8 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== required}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${typed === required
                ? "bg-red-500/20 border border-red-400/40 text-red-400 hover:bg-red-500/30"
                : "bg-white/3 border border-white/8 text-slate-700 cursor-not-allowed"
              }`}
          >
            Run Delete Now
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --------- Rule Card ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function RuleCard({
  rule,
  onToggle,
  onRun,
}: {
  rule: DeleteRule;
  onToggle: (id: string) => void;
  onRun: (rule: DeleteRule) => void;
}) {
  const isRunning = rule.status === "running";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border p-5 transition-all duration-300 overflow-hidden
        ${rule.enabled
          ? "border-white/10 bg-white/[0.03] hover:border-white/18 hover:bg-white/[0.05]"
          : "border-white/5 bg-white/[0.015] opacity-60"
        }`}
    >
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4)1px,transparent 1px)", backgroundSize: "20px 20px" }} />

      {/* Running shimmer */}
      {isRunning && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ background: "linear-gradient(90deg, transparent, rgba(239,68,68,0.08), transparent)" }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3 relative">
        <div className="flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${RISK_STYLE[rule.riskLevel]}`}>
              {RISK_ICON[rule.riskLevel]} {rule.riskLevel}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{rule.description}</p>
        </div>
        {/* Toggle */}
        <button
          onClick={() => onToggle(rule.id)}
          className={`relative w-10 h-5 rounded-full transition-all duration-300 shrink-0
            ${rule.enabled ? "bg-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.35)]" : "bg-slate-700/50"}`}
        >
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300
            ${rule.enabled ? "left-5" : "left-0.5"}`} />
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_STYLE[rule.category]}`}>
          {rule.category}
        </span>
        <span className="text-[10px] font-mono text-slate-600 bg-white/3 px-2 py-0.5 rounded-full border border-white/6">
          {rule.target}
        </span>
        <span className="text-[10px] text-slate-600">
          Retention: <span className="text-slate-400">{rule.retentionDays}d</span>
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/6">
          <p className="text-[10px] text-slate-600 mb-0.5">Deleted Total</p>
          <p className="text-sm font-bold text-white font-mono">{rule.deletedCount.toLocaleString()}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/6">
          <p className="text-[10px] text-slate-600 mb-0.5">Last Run</p>
          <p className="text-[11px] text-slate-400 leading-tight">{rule.lastRun}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/6">
          <p className="text-[10px] text-slate-600 mb-0.5">Next Run</p>
          <p className="text-[11px] text-slate-400 leading-tight">{rule.nextRun}</p>
        </div>
      </div>

      {/* Status + Manual run */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shadow-[0_0_6px_#f87171]" />
              <span className="text-[11px] text-red-400 font-medium">Running...</span>
            </>
          ) : rule.status === "done" ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-emerald-400">Completed</span>
            </>
          ) : (
            <>
              <div className={`w-1.5 h-1.5 rounded-full ${rule.enabled ? "bg-slate-500" : "bg-slate-700"}`} />
              <span className="text-[11px] text-slate-600">{rule.enabled ? "Scheduled" : "Disabled"}</span>
            </>
          )}
        </div>

        {rule.enabled && !isRunning && (
          <button
            onClick={() => onRun(rule)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-400/20 text-red-400 text-[11px] font-medium hover:bg-red-500/20 transition-all duration-200"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Run Now
          </button>
        )}

        {isRunning && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            <span className="text-[10px] text-slate-600">Processing...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function AutoDeletePage() {
  const [rules, setRules] = useState<DeleteRule[]>(INITIAL_RULES);
  const [activeTab, setActiveTab] = useState<"rules" | "logs" | "schedule">("rules");
  const [filterCat, setFilterCat] = useState("all");
  const [confirmRule, setConfirmRule] = useState<DeleteRule | null>(null);
  const [globalPause, setGlobalPause] = useState(false);
  const [totalFreed] = useState("47.8 GB");

  const toggleRule = (id: string) =>
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const handleRun = (rule: DeleteRule) => setConfirmRule(rule);

  const handleConfirm = () => {
    if (!confirmRule) return;
    setRules((prev) =>
      prev.map((r) => r.id === confirmRule.id ? { ...r, status: "running" } : r)
    );
    setConfirmRule(null);
    setTimeout(() => {
      setRules((prev) =>
        prev.map((r) =>
          r.id === confirmRule.id
            ? { ...r, status: "done", lastRun: "Just now", deletedCount: r.deletedCount + Math.floor(Math.random() * 50) }
            : r
        )
      );
    }, 3000);
    setTimeout(() => {
      setRules((prev) =>
        prev.map((r) => r.id === confirmRule.id ? { ...r, status: "idle" } : r)
      );
    }, 6000);
  };

  const filtered = filterCat === "all" ? rules : rules.filter((r) => r.category === filterCat);
  const enabledCount = rules.filter((r) => r.enabled).length;
  const totalDeleted = rules.reduce((s, r) => s + r.deletedCount, 0);
  const runningCount = rules.filter((r) => r.status === "running").length;

  const SCHEDULE_TIMES = [
    { time: "01:00 AM", label: "System Logs Purge", color: "bg-slate-400" },
    { time: "02:00 AM", label: "Past Papers Cleanup", color: "bg-cyan-400" },
    { time: "06:00 AM", label: "AI Cache Purge", color: "bg-emerald-400" },
    { time: "08:30 AM", label: "Temp Files Cleanup", color: "bg-emerald-400" },
    { time: "11:00 PM", label: "Session Purge", color: "bg-slate-400" },
  ];

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Ambient orbs */}
      <div className="absolute top-[-180px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)" }} />

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmRule && (
          <ConfirmModal
            rule={confirmRule}
            onConfirm={handleConfirm}
            onCancel={() => setConfirmRule(null)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-400/20 to-amber-400/20 border border-red-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.Pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Auto-Delete Orchestrator</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">Schedule, automate & govern data retention across the entire platform</p>
          </div>

          {/* Global pause */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGlobalPause(!globalPause)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300
                ${globalPause
                  ? "bg-amber-400/15 border-amber-400/40 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                  : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20"
                }`}
            >
              {globalPause ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Resume All
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Pause All
                </>
              )}
            </button>
            {runningCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/10 border border-red-400/25">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs text-red-400 font-medium">{runningCount} running</span>
              </div>
            )}
          </div>
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Rules", value: `${enabledCount}/${rules.length}`, icon: "⚙️", color: "text-cyan-400", sub: `${rules.length - enabledCount} disabled` },
            { label: "Total Deleted", value: totalDeleted.toLocaleString(), icon: "🗑️", color: "text-red-400", sub: "all time records" },
            { label: "Storage Freed", value: totalFreed, icon: "💾", color: "text-emerald-400", sub: "this month" },
            { label: "System Status", value: globalPause ? "PAUSED" : "AUTO", icon: globalPause ? "⏸️" : "✅", color: globalPause ? "text-amber-400" : "text-emerald-400", sub: globalPause ? "all rules paused" : "running on schedule" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5 relative overflow-hidden">
              <div className="absolute inset-0 rounded-2xl opacity-[0.025] pointer-events-none"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5)1px,transparent 1px)", backgroundSize: "18px 18px" }} />
              <p className="text-2xl mb-1">{kpi.icon}</p>
              <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-white font-medium mt-1">{kpi.label}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ------ Global Pause Banner ------ */}
        <AnimatePresence>
          {globalPause && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-2xl bg-amber-400/8 border border-amber-400/25 px-5 py-4 flex items-center gap-3"
            >
              <svg className="w-5 h-5 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-400">All Auto-Delete Rules Paused</p>
                <p className="text-[11px] text-amber-400/60">No scheduled deletions will run until you resume. Manual runs are still allowed.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------ Tabs ------ */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-fit">
          {(["rules", "logs", "schedule"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                ${activeTab === tab
                  ? "bg-red-500/20 text-red-400 shadow-[0_0_16px_rgba(239,68,68,0.15)]"
                  : "text-slate-500 hover:text-slate-300"
                }`}
            >
              {tab === "rules" ? "Delete Rules" : tab === "logs" ? "Run History" : "Schedule View"}
            </button>
          ))}
        </div>

        {/* ------ Rules Tab ------ */}
        {activeTab === "rules" && (
          <>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {["all", "academic", "user", "logs", "media", "temp"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 capitalize border
                    ${filterCat === cat
                      ? "bg-red-400/15 border-red-400/40 text-red-400"
                      : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {cat}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-slate-600">{filtered.length} rules</span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AnimatePresence>
                {filtered.map((rule) => (
                  <RuleCard key={rule.id} rule={rule} onToggle={toggleRule} onRun={handleRun} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* ------ Logs Tab ------ */}
        {activeTab === "logs" && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/6 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Deletion Run History</h3>
              <button className="text-[11px] text-red-400 hover:text-red-300 transition-colors">Export CSV →</button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {DELETE_LOGS.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={`w-16 text-center text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0
                    ${log.status === "success" ? "bg-emerald-400/10 text-emerald-400" :
                      log.status === "skipped" ? "bg-slate-400/10 text-slate-400" :
                        "bg-red-400/10 text-red-400"}`}>
                    {log.status}
                  </span>
                  <span className="text-[11px] text-slate-400 flex-1 truncate">{log.rule}</span>
                  <span className="text-[11px] font-mono text-red-400/80 shrink-0 w-20 text-right">
                    -{log.itemsDeleted.toLocaleString()}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400/70 shrink-0 w-20 text-right">{log.spaceFreed}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0
                    ${log.triggeredBy === "auto" ? "bg-cyan-400/8 text-cyan-400" : "bg-violet-400/8 text-violet-400"}`}>
                    {log.triggeredBy}
                  </span>
                  <span className="text-[11px] text-slate-600 shrink-0 w-28 text-right">{log.timestamp}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ------ Schedule Tab ------ */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-6">Today's Deletion Schedule</h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-16 top-0 bottom-0 w-px bg-white/6" />
                <div className="space-y-6">
                  {SCHEDULE_TIMES.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-4 relative"
                    >
                      <span className="text-[11px] font-mono text-slate-500 w-16 text-right shrink-0">{item.time}</span>
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0 relative z-10 shadow-[0_0_8px_currentColor]`} />
                      <div className="flex-1 p-3 rounded-xl bg-white/[0.02] border border-white/6 hover:border-white/10 transition-colors">
                        <p className="text-xs text-slate-300 font-medium">{item.label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Retention policy summary */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Retention Policy Overview</h3>
              <div className="space-y-3">
                {rules.filter(r => r.enabled).map((rule) => (
                  <div key={rule.id} className="flex items-center gap-4">
                    <span className="text-[11px] text-slate-400 flex-1">{rule.name}</span>
                    <div className="flex-1 max-w-32">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((rule.retentionDays / 365) * 100, 100)}%`,
                            background: rule.riskLevel === "high" ? "#f87171" : rule.riskLevel === "medium" ? "#fbbf24" : "#34d399"
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 w-16 text-right">{rule.retentionDays}d</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border w-16 text-center ${CATEGORY_STYLE[rule.category]}`}>
                      {rule.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
