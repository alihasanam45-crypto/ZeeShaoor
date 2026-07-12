"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface ServiceStatus {
  id: string;
  name: string;
  category: "core" | "database" | "ai" | "storage" | "auth" | "cdn";
  status: "operational" | "degraded" | "outage" | "maintenance";
  uptime: number;
  latency: number;
  lastChecked: string;
  description: string;
  icon: string;
}

interface MetricPoint {
  time: string;
  value: number;
}

interface Incident {
  id: string;
  title: string;
  severity: "critical" | "major" | "minor";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  startedAt: string;
  resolvedAt: string | null;
  affectedServices: string[];
  updates: string[];
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const SERVICES: ServiceStatus[] = [
  { id: "s1", name: "Web Application", category: "core", status: "operational", uptime: 99.98, latency: 142, lastChecked: "5s ago", description: "Main ZeeShaoor.pk web portal", icon: "🌐" },
  { id: "s2", name: "MongoDB Atlas", category: "database", status: "operational", uptime: 99.99, latency: 18, lastChecked: "5s ago", description: "Primary database cluster", icon: "🍃" },
  { id: "s3", name: "NextAuth", category: "auth", status: "operational", uptime: 100, latency: 34, lastChecked: "5s ago", description: "Authentication & session management", icon: "🔐" },
  { id: "s4", name: "Claude AI API", category: "ai", status: "degraded", uptime: 97.4, latency: 1240, lastChecked: "5s ago", description: "Anthropic Claude integration", icon: "🤖" },
  { id: "s5", name: "File Storage", category: "storage", status: "operational", uptime: 99.95, latency: 89, lastChecked: "5s ago", description: "PDF, image & document storage", icon: "📁" },
  { id: "s6", name: "Email Service", category: "core", status: "operational", uptime: 99.7, latency: 312, lastChecked: "5s ago", description: "Transactional email delivery", icon: "📧" },
  { id: "s7", name: "CDN / Assets", category: "cdn", status: "operational", uptime: 99.99, latency: 22, lastChecked: "5s ago", description: "Static asset delivery network", icon: "⚡" },
  { id: "s8", name: "SMS Gateway", category: "core", status: "operational", uptime: 98.9, latency: 445, lastChecked: "5s ago", description: "SMS broadcast service", icon: "📱" },
  { id: "s9", name: "Search Engine", category: "core", status: "maintenance", uptime: 95.2, latency: 0, lastChecked: "5s ago", description: "Full-text search indexing", icon: "🔍" },
  { id: "s10", name: "Cron Jobs", category: "core", status: "operational", uptime: 99.8, latency: 0, lastChecked: "5s ago", description: "Scheduled tasks & auto-delete", icon: "⏰" },
  { id: "s11", name: "Push Notifications", category: "core", status: "operational", uptime: 99.1, latency: 198, lastChecked: "5s ago", description: "App push notification service", icon: "🔔" },
  { id: "s12", name: "Backup System", category: "storage", status: "operational", uptime: 100, latency: 0, lastChecked: "5s ago", description: "Daily automated DB backups", icon: "💾" },
];

const INCIDENTS: Incident[] = [
  {
    id: "i1", title: "Claude AI API High Latency",
    severity: "major", status: "monitoring",
    startedAt: "Today 07:34 AM", resolvedAt: null,
    affectedServices: ["Claude AI API", "Board Readiness AI", "Predictive Analytics"],
    updates: [
      "07:34 AM — High latency detected on Claude API calls (avg 1240ms vs normal 300ms)",
      "07:45 AM — Identified: Anthropic API rate limiting due to high traffic",
      "08:00 AM — Throttling applied to non-critical modules. Monitoring.",
    ],
  },
  {
    id: "i2", title: "Search Engine Scheduled Maintenance",
    severity: "minor", status: "monitoring",
    startedAt: "Today 02:00 AM", resolvedAt: null,
    affectedServices: ["Search Engine"],
    updates: [
      "02:00 AM — Planned maintenance window started for search index rebuild",
      "Estimated completion: Today 12:00 PM",
    ],
  },
  {
    id: "i3", title: "MongoDB Slow Query Alert",
    severity: "minor", status: "resolved",
    startedAt: "Yesterday 11:20 PM", resolvedAt: "Yesterday 11:48 PM",
    affectedServices: ["MongoDB Atlas"],
    updates: [
      "11:20 PM — Slow query detected on students collection (>2s response)",
      "11:35 PM — Added compound index on {class, rollNo} fields",
      "11:48 PM — Query time normalized to <18ms. Resolved.",
    ],
  },
];

const GENERATE_SPARKLINE = (base: number, variance: number, points = 20) =>
  Array.from({ length: points }, () => Math.max(0, base + (Math.random() - 0.5) * variance));

const FLAT_SPARKLINE = (base: number, points = 20) =>
  Array.from({ length: points }, (_, i) => base + Math.sin(i / 2.5) * 3);

// --------- Constants ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const STATUS_CONFIG = {
  operational: { label: "Operational", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25", dot: "bg-emerald-400 shadow-[0_0_6px_#34d399]" },
  degraded: { label: "Degraded", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25", dot: "bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-pulse" },
  outage: { label: "Outage", color: "text-red-400", bg: "bg-red-400/10 border-red-400/25", dot: "bg-red-400 shadow-[0_0_8px_#f87171] animate-pulse" },
  maintenance: { label: "Maintenance", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25", dot: "bg-violet-400" },
};

const SEVERITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-400/8 border-red-400/20", label: "🔴 Critical" },
  major: { color: "text-amber-400", bg: "bg-amber-400/8 border-amber-400/20", label: "🟡 Major" },
  minor: { color: "text-blue-400", bg: "bg-blue-400/8 border-blue-400/20", label: "🔵 Minor" },
};

const INCIDENT_STATUS = {
  investigating: "text-red-400",
  identified: "text-amber-400",
  monitoring: "text-cyan-400",
  resolved: "text-emerald-400",
};

const CATEGORY_COLOR: Record<string, string> = {
  core: "text-cyan-400",
  database: "text-emerald-400",
  ai: "text-violet-400",
  storage: "text-amber-400",
  auth: "text-pink-400",
  cdn: "text-blue-400",
};

// --------- Mini Sparkline ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 64, h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// --------- Service Card ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ServiceCard({ service }: { service: ServiceStatus }) {
  const cfg = STATUS_CONFIG[service.status];
  const sparkData = GENERATE_SPARKLINE(
    service.status === "operational" ? 95 : service.status === "degraded" ? 60 : 20,
    service.status === "operational" ? 8 : 25
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-4 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4)1px,transparent 1px)", backgroundSize: "18px 18px" }} />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{service.icon}</span>
          <div>
            <h3 className="text-[11px] font-bold text-white">{service.name}</h3>
            <p className="text-[10px] text-slate-600">{service.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <p className="text-[10px] text-slate-600">Uptime</p>
            <p className={`text-[11px] font-mono font-bold ${service.uptime >= 99 ? "text-emerald-400" : service.uptime >= 95 ? "text-amber-400" : "text-red-400"}`}>
              {service.uptime}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600">Latency</p>
            <p className={`text-[11px] font-mono font-bold ${service.latency === 0 ? "text-slate-600" : service.latency < 200 ? "text-emerald-400" : service.latency < 500 ? "text-amber-400" : "text-red-400"}`}>
              {service.latency > 0 ? `${service.latency}ms` : "—"}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600">Category</p>
            <p className={`text-[10px] font-medium capitalize ${CATEGORY_COLOR[service.category]}`}>{service.category}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600">Checked</p>
            <p className="text-[10px] text-slate-500">{service.lastChecked}</p>
          </div>
        </div>
        <Sparkline data={sparkData}
          color={service.status === "operational" ? "#34d399" : service.status === "degraded" ? "#fbbf24" : "#f87171"} />
      </div>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function HealthPage() {
  const [services, setServices] = useState<ServiceStatus[]>(SERVICES);
  const [activeTab, setActiveTab] = useState<"overview" | "incidents" | "metrics">("overview");
  const [filterStatus, setFilterStatus] = useState("all");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // null until mounted — server-rendered HTML must not contain a clock the client won't match
  const [liveTime, setLiveTime] = useState<Date | null>(null);
  // deterministic first paint; randomized on the client after hydration
  const [spark, setSpark] = useState({
    cpu: FLAT_SPARKLINE(45),
    ram: FLAT_SPARKLINE(62),
    req: FLAT_SPARKLINE(340),
  });

  useEffect(() => {
    setLiveTime(new Date());
    setSpark({
      cpu: GENERATE_SPARKLINE(45, 20),
      ram: GENERATE_SPARKLINE(62, 10),
      req: GENERATE_SPARKLINE(340, 120),
    });
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastRefresh(new Date());
    }, 1500);
  };

  const filtered = services.filter(s => filterStatus === "all" || s.status === filterStatus);
  const operationalCount = services.filter(s => s.status === "operational").length;
  const degradedCount = services.filter(s => s.status === "degraded").length;
  const outageCount = services.filter(s => s.status === "outage").length;
  const maintenanceCount = services.filter(s => s.status === "maintenance").length;
  const activeIncidents = INCIDENTS.filter(i => i.status !== "resolved").length;
  const avgUptime = (services.reduce((s, sv) => s + sv.uptime, 0) / services.length).toFixed(2);
  const avgLatency = Math.round(services.filter(s => s.latency > 0).reduce((s, sv) => s + sv.latency, 0) / services.filter(s => s.latency > 0).length);

  const overallStatus = outageCount > 0 ? "outage" : degradedCount > 0 ? "degraded" : maintenanceCount > 0 ? "maintenance" : "operational";

  // Fake CPU/RAM data (stable between renders — regenerating every render made
  // the charts jitter on each clock tick and mismatch during hydration)
  const cpuData = spark.cpu;
  const ramData = spark.ram;
  const reqData = spark.req;

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Orbs */}
      <div className="absolute top-[-180px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${overallStatus === "operational" ? "rgba(52,211,153,0.05)" : overallStatus === "degraded" ? "rgba(251,191,36,0.06)" : "rgba(239,68,68,0.06)"} 0%, transparent 70%)` }} />
      <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center
                ${overallStatus === "operational" ? "bg-emerald-400/20 border-emerald-400/30" :
                  overallStatus === "degraded" ? "bg-amber-400/20 border-amber-400/30" :
                  "bg-red-400/20 border-red-400/30"}`}>
                <svg className={`w-5 h-5 ${overallStatus === "operational" ? "text-emerald-400" : overallStatus === "degraded" ? "text-amber-400" : "text-red-400"}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.Pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Portal Health Monitor</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">Real-time system status, uptime tracking & incident management</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live clock */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-slate-400">
                {liveTime ? liveTime.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}
              </span>
            </div>

            {/* Overall status */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${STATUS_CONFIG[overallStatus].bg}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[overallStatus].dot}`} />
              <span className={`text-xs font-semibold ${STATUS_CONFIG[overallStatus].color}`}>
                {overallStatus === "operational" ? "All Systems Operational" :
                  overallStatus === "degraded" ? "Partial Degradation" :
                  overallStatus === "maintenance" ? "Maintenance Active" : "Service Outage"}
              </span>
            </div>

            {/* Refresh */}
            <button onClick={handleRefresh}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.06] transition-colors">
              <svg className={`w-4 h-4 text-slate-400 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Operational", value: `${operationalCount}/${services.length}`, icon: "✅", color: "text-emerald-400", sub: "services running" },
            { label: "Avg Uptime", value: `${avgUptime}%`, icon: "📈", color: "text-cyan-400", sub: "last 30 days" },
            { label: "Avg Latency", value: `${avgLatency}ms`, icon: "⚡", color: avgLatency < 200 ? "text-emerald-400" : "text-amber-400", sub: "across all services" },
            { label: "Active Incidents", value: String(activeIncidents), icon: activeIncidents > 0 ? "🚨" : "🟢", color: activeIncidents > 0 ? "text-amber-400" : "text-emerald-400", sub: activeIncidents > 0 ? "needs attention" : "no active issues" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5)1px,transparent 1px)", backgroundSize: "18px 18px" }} />
              <p className="text-2xl mb-1">{kpi.icon}</p>
              <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-white font-medium mt-1">{kpi.label}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ------ Tabs ------ */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-fit">
          {(["overview", "incidents", "metrics"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab
                  ? overallStatus === "operational"
                    ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.15)]"
                    : "bg-amber-500/20 text-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.15)]"
                  : "text-slate-500 hover:text-slate-300"}`}>
              {tab === "overview" ? "🖥️ Services" : tab === "incidents" ? `🚨 Incidents (${INCIDENTS.length})` : "📊 Metrics"}
            </button>
          ))}
        </div>

        {/* ------ Overview Tab ------ */}
        {activeTab === "overview" && (
          <>
            {/* Status filter */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {["all", "operational", "degraded", "maintenance", "outage"].map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border capitalize transition-all
                    ${filterStatus === s
                      ? s === "operational" ? "bg-emerald-400/15 border-emerald-400/40 text-emerald-400"
                        : s === "degraded" ? "bg-amber-400/15 border-amber-400/40 text-amber-400"
                        : s === "outage" ? "bg-red-400/15 border-red-400/40 text-red-400"
                        : s === "maintenance" ? "bg-violet-400/15 border-violet-400/40 text-violet-400"
                        : "bg-cyan-400/15 border-cyan-400/40 text-cyan-400"
                      : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                  {s}
                </button>
              ))}
              <span className="text-[11px] text-slate-600 ml-auto">{filtered.length} services</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence>
                {filtered.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* ------ Incidents Tab ------ */}
        {activeTab === "incidents" && (
          <div className="space-y-4">
            {INCIDENTS.map((incident, i) => (
              <motion.div key={incident.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={`rounded-2xl border p-5 ${SEVERITY_CONFIG[incident.severity].bg}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY_CONFIG[incident.severity].bg} ${SEVERITY_CONFIG[incident.severity].color}`}>
                        {SEVERITY_CONFIG[incident.severity].label}
                      </span>
                      <span className={`text-[10px] font-medium capitalize ${INCIDENT_STATUS[incident.status]}`}>
                        ● {incident.status}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{incident.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Started: {incident.startedAt}
                      {incident.resolvedAt && ` · Resolved: ${incident.resolvedAt}`}
                    </p>
                  </div>
                  {incident.status !== "resolved" && (
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-amber-400/10 border border-amber-400/25 text-amber-400 shrink-0">
                      Active
                    </span>
                  )}
                </div>

                {/* Affected services */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {incident.affectedServices.map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">{s}</span>
                  ))}
                </div>

                {/* Updates timeline */}
                <div className="space-y-2">
                  {incident.updates.map((update, j) => (
                    <div key={j} className="flex gap-3 text-[11px]">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0 mt-1.5" />
                      <p className="text-slate-400">{update}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ------ Metrics Tab ------ */}
        {activeTab === "metrics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* CPU */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">CPU Usage</h3>
                <span className="text-lg font-bold font-mono text-cyan-400">{Math.round(cpuData[cpuData.length - 1])}%</span>
              </div>
              <div className="h-20 flex items-end gap-0.5">
                {cpuData.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-all"
                    style={{ height: `${v}%`, background: v > 80 ? "#f87171" : v > 60 ? "#fbbf24" : "#22d3ee", opacity: 0.7 + (i / cpuData.length) * 0.3 }} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                <span>20 min ago</span><span>Now</span>
              </div>
            </div>

            {/* RAM */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Memory Usage</h3>
                <span className="text-lg font-bold font-mono text-violet-400">{Math.round(ramData[ramData.length - 1])}%</span>
              </div>
              <div className="h-20 flex items-end gap-0.5">
                {ramData.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-all"
                    style={{ height: `${v}%`, background: v > 85 ? "#f87171" : "#a78bfa", opacity: 0.7 + (i / ramData.length) * 0.3 }} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                <span>20 min ago</span><span>Now</span>
              </div>
            </div>

            {/* Requests */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Requests / min</h3>
                <span className="text-lg font-bold font-mono text-emerald-400">{Math.round(reqData[reqData.length - 1])}</span>
              </div>
              <div className="h-20 flex items-end gap-0.5">
                {reqData.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm"
                    style={{ height: `${(v / 500) * 100}%`, background: "#34d399", opacity: 0.6 + (i / reqData.length) * 0.4 }} />
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                <span>20 min ago</span><span>Now</span>
              </div>
            </div>

            {/* Uptime table */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-4">30-Day Uptime</h3>
              <div className="space-y-3">
                {services.slice(0, 6).map((s) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 w-32 truncate">{s.name}</span>
                    <div className="flex-1">
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${s.uptime}%`, background: s.uptime >= 99 ? "#34d399" : s.uptime >= 95 ? "#fbbf24" : "#f87171" }} />
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono w-12 text-right ${s.uptime >= 99 ? "text-emerald-400" : s.uptime >= 95 ? "text-amber-400" : "text-red-400"}`}>
                      {s.uptime}%
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
