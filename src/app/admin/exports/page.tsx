"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  category: "academic" | "financial" | "hr" | "analytics" | "compliance";
  formats: ("csv" | "xlsx" | "pdf" | "json")[];
  fields: string[];
  estimatedRows: number;
  icon: string;
  lastExported: string;
}

interface ExportJob {
  id: string;
  name: string;
  format: string;
  status: "queued" | "processing" | "done" | "failed";
  progress: number;
  size: string;
  createdAt: string;
  rows: number;
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const TEMPLATES: ExportTemplate[] = [
  {
    id: "e1", name: "Student Master List",
    description: "Complete student database with all profile fields",
    category: "academic", icon: "🎓",
    formats: ["csv", "xlsx", "pdf"],
    fields: ["Name", "Roll No", "Class", "Section", "DOB", "Guardian", "Contact", "Address", "Status"],
    estimatedRows: 847,
    lastExported: "2 days ago",
  },
  {
    id: "e2", name: "Fee Collection Report",
    description: "Monthly fee status, paid/pending breakdown per student",
    category: "financial", icon: "💰",
    formats: ["xlsx", "pdf"],
    fields: ["Student", "Class", "Fee Amount", "Paid", "Due", "Date", "Receipt No", "Method"],
    estimatedRows: 412,
    lastExported: "Yesterday",
  },
  {
    id: "e3", name: "Attendance Summary",
    description: "Student attendance per month with percentage",
    category: "academic", icon: "📅",
    formats: ["csv", "xlsx", "pdf"],
    fields: ["Student", "Class", "Present Days", "Absent Days", "Late", "Percentage", "Month"],
    estimatedRows: 1694,
    lastExported: "1 week ago",
  },
  {
    id: "e4", name: "Teacher Staff Register",
    description: "All staff records with qualifications and assignments",
    category: "hr", icon: "👩‍🏫",
    formats: ["csv", "xlsx"],
    fields: ["Name", "Subject", "Qualification", "Join Date", "Salary Grade", "Classes", "Contact"],
    estimatedRows: 64,
    lastExported: "3 days ago",
  },
  {
    id: "e5", name: "Exam Results Sheet",
    description: "Subject-wise marks and grades for all students",
    category: "academic", icon: "📝",
    formats: ["xlsx", "pdf"],
    fields: ["Roll No", "Name", "Math", "Physics", "Chemistry", "English", "Urdu", "Total", "Grade", "Position"],
    estimatedRows: 847,
    lastExported: "2 weeks ago",
  },
  {
    id: "e6", name: "AI Usage Analytics",
    description: "Token usage, costs and module activity breakdown",
    category: "analytics", icon: "🤖",
    formats: ["csv", "json"],
    fields: ["Module", "Date", "Tokens", "Cost USD", "Calls", "Latency", "Status"],
    estimatedRows: 2341,
    lastExported: "Today",
  },
  {
    id: "e7", name: "Complaint Log",
    description: "All submitted complaints with status and resolution",
    category: "compliance", icon: "📋",
    formats: ["csv", "xlsx", "pdf"],
    fields: ["Code", "Category", "Severity", "Subject", "Status", "Assigned To", "Submitted", "Resolved"],
    estimatedRows: 89,
    lastExported: "4 days ago",
  },
  {
    id: "e8", name: "Board Readiness Report",
    description: "Student readiness scores and subject analysis",
    category: "analytics", icon: "📊",
    formats: ["xlsx", "pdf"],
    fields: ["Student", "Class", "Readiness Score", "Risk Level", "Predicted Grade", "Weak Areas", "Strong Areas"],
    estimatedRows: 847,
    lastExported: "1 day ago",
  },
];

const INITIAL_JOBS: ExportJob[] = [
  { id: "j1", name: "Student Master List", format: "xlsx", status: "done", progress: 100, size: "2.4 MB", createdAt: "Today 09:14 AM", rows: 847 },
  { id: "j2", name: "Fee Collection Report", format: "pdf", status: "done", progress: 100, size: "1.1 MB", createdAt: "Yesterday 04:22 PM", rows: 412 },
  { id: "j3", name: "AI Usage Analytics", format: "csv", status: "done", progress: 100, size: "340 KB", createdAt: "Yesterday 11:00 AM", rows: 2341 },
  { id: "j4", name: "Attendance Summary", format: "xlsx", status: "failed", progress: 67, size: "—", createdAt: "2 days ago", rows: 0 },
];

const FORMAT_STYLE: Record<string, string> = {
  csv: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  xlsx: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  pdf: "text-red-400 bg-red-400/10 border-red-400/25",
  json: "text-amber-400 bg-amber-400/10 border-amber-400/25",
};

const CATEGORY_STYLE: Record<string, string> = {
  academic: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  financial: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  hr: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  analytics: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  compliance: "text-slate-400 bg-slate-400/10 border-slate-400/25",
};

// --------- Export Card ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ExportCard({ template, onExport }: {
  template: ExportTemplate;
  onExport: (t: ExportTemplate, format: string) => void;
}) {
  const [selectedFormat, setSelectedFormat] = useState(template.formats[0]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/8 bg-white/[0.03] p-5 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden group"
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4)1px,transparent 1px)", backgroundSize: "20px 20px" }} />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
          {template.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{template.name}</h3>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{template.description}</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${CATEGORY_STYLE[template.category]}`}>
          {template.category}
        </span>
      </div>

      {/* Fields preview */}
      <div className="flex flex-wrap gap-1 mb-4">
        {template.fields.slice(0, 5).map((f) => (
          <span key={f} className="text-[9px] text-slate-600 bg-white/3 px-1.5 py-0.5 rounded border border-white/5">{f}</span>
        ))}
        {template.fields.length > 5 && (
          <span className="text-[9px] text-slate-700 px-1.5 py-0.5">+{template.fields.length - 5} more</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 text-[10px]">
        <span className="text-slate-600">~<span className="text-slate-400 font-mono">{template.estimatedRows.toLocaleString()}</span> rows</span>
        <span className="text-slate-600">Last: <span className="text-slate-400">{template.lastExported}</span></span>
      </div>

      {/* Format selector + export button */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 flex-1">
          {template.formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all duration-200
                ${selectedFormat === fmt ? FORMAT_STYLE[fmt] : "border-white/8 text-slate-600 hover:text-slate-400"}`}
            >
              {fmt}
            </button>
          ))}
        </div>
        <button
          onClick={() => onExport(template, selectedFormat)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 text-[11px] font-semibold hover:bg-cyan-400/25 transition-all duration-200 shrink-0"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
    </motion.div>
  );
}

// --------- Job Row ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function JobRow({ job }: { job: ExportJob }) {
  return (
    <motion.div
      layout
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
    >
      {/* Status */}
      <div className="shrink-0 w-20">
        {job.status === "done" ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-400">✓ Done</span>
        ) : job.status === "processing" ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/25 text-cyan-400 flex items-center gap-1">
            <div className="w-2 h-2 border border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
            {job.progress}%
          </span>
        ) : job.status === "queued" ? (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400">Queued</span>
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-400/10 border border-red-400/25 text-red-400">Failed</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-300 truncate">{job.name}</p>
        <p className="text-[10px] text-slate-600">{job.createdAt}</p>
      </div>

      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${FORMAT_STYLE[job.format]}`}>
        {job.format.toUpperCase()}
      </span>

      {job.rows > 0 && (
        <span className="text-[10px] font-mono text-slate-500 shrink-0">{job.rows.toLocaleString()} rows</span>
      )}

      <span className="text-[10px] font-mono text-slate-500 shrink-0 w-16 text-right">{job.size}</span>

      {job.status === "done" && (
        <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-[10px] hover:bg-cyan-400/20 transition-colors shrink-0">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
      )}
      {job.status === "failed" && (
        <button className="px-2.5 py-1 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] hover:bg-red-400/20 transition-colors shrink-0">
          Retry
        </button>
      )}
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function ExportsPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "jobs" | "custom">("templates");
  const [jobs, setJobs] = useState<ExportJob[]>(INITIAL_JOBS);
  const [filterCat, setFilterCat] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  // Custom export state
  const [customName, setCustomName] = useState("");
  const [customFormat, setCustomFormat] = useState("csv");
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");

  const ALL_FIELDS = ["Student Name", "Roll No", "Class", "Section", "GPA", "Attendance %", "Fee Status", "Contact", "Guardian", "Address", "Exam Score", "Grade", "Remarks"];

  const handleExport = (template: ExportTemplate, format: string) => {
    const newJob: ExportJob = {
      id: `j${Date.now()}`,
      name: template.name,
      format,
      status: "processing",
      progress: 0,
      size: "—",
      createdAt: "Just now",
      rows: template.estimatedRows,
    };
    setJobs(prev => [newJob, ...prev]);
    setActiveTab("jobs");

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setJobs(prev => prev.map(j =>
          j.id === newJob.id
            ? { ...j, status: "done", progress: 100, size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB` }
            : j
        ));
      } else {
        setJobs(prev => prev.map(j =>
          j.id === newJob.id ? { ...j, progress } : j
        ));
      }
    }, 400);
  };

  const filtered = TEMPLATES.filter(t => {
    const matchCat = filterCat === "all" || t.category === filterCat;
    const matchSearch = !searchQ || t.name.toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchSearch;
  });

  const doneCount = jobs.filter(j => j.status === "done").length;
  const processingCount = jobs.filter(j => j.status === "processing").length;
  const totalSize = "8.2 MB";

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Orbs */}
      <div className="absolute top-[-180px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-cyan-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.Pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Data Export Center</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">Export any platform data as CSV, Excel, PDF or JSON — instantly</p>
          </div>

          {processingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/25">
              <div className="w-3 h-3 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-sm font-semibold text-cyan-400">{processingCount} export in progress</span>
            </div>
          )}
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Export Templates", value: String(TEMPLATES.length), icon: "📋", color: "text-cyan-400", sub: "ready to export" },
            { label: "Exports Today", value: String(doneCount), icon: "✅", color: "text-emerald-400", sub: "completed successfully" },
            { label: "Total Size", value: totalSize, icon: "💾", color: "text-amber-400", sub: "exported this month" },
            { label: "Formats", value: "4", icon: "📦", color: "text-violet-400", sub: "CSV, XLSX, PDF, JSON" },
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
          {(["templates", "jobs", "custom"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.15)]" : "text-slate-500 hover:text-slate-300"}`}>
              {tab === "templates" ? "📋 Templates" : tab === "jobs" ? `⚡ Export Jobs (${jobs.length})` : "🛠️ Custom Export"}
            </button>
          ))}
        </div>

        {/* ------ Templates Tab ------ */}
        {activeTab === "templates" && (
          <>
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search exports..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/40 placeholder:text-slate-700" />
              </div>
              {["all", "academic", "financial", "hr", "analytics", "compliance"].map((cat) => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border capitalize transition-all
                    ${filterCat === cat ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.map((t) => (
                <ExportCard key={t.id} template={t} onExport={handleExport} />
              ))}
            </div>
          </>
        )}

        {/* ------ Jobs Tab ------ */}
        {activeTab === "jobs" && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/6 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Export Queue</h3>
              <button onClick={() => setJobs(INITIAL_JOBS)} className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors">Clear History</button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              <AnimatePresence>
                {jobs.map((job) => (
                  <JobRow key={job.id} job={job} />
                ))}
              </AnimatePresence>
              {jobs.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-slate-600 text-sm">No export jobs yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------ Custom Export Tab ------ */}
        {activeTab === "custom" && (
          <div className="max-w-2xl space-y-5">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-5">Build Custom Export</h3>

              {/* Name */}
              <div className="mb-4">
                <label className="text-[11px] text-slate-400 mb-2 block">Export Name</label>
                <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="My custom report..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400/40 placeholder:text-slate-700" />
              </div>

              {/* Format */}
              <div className="mb-4">
                <label className="text-[11px] text-slate-400 mb-2 block">Output Format</label>
                <div className="flex gap-2">
                  {["csv", "xlsx", "pdf", "json"].map((fmt) => (
                    <button key={fmt} onClick={() => setCustomFormat(fmt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase border transition-all
                        ${customFormat === fmt ? FORMAT_STYLE[fmt] : "border-white/8 text-slate-600 hover:text-slate-400"}`}>
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[11px] text-slate-400 mb-2 block">Date From</label>
                  <input type="date" value={customDateFrom} onChange={e => setCustomDateFrom(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/40" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-2 block">Date To</label>
                  <input type="date" value={customDateTo} onChange={e => setCustomDateTo(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/40" />
                </div>
              </div>

              {/* Fields */}
              <div className="mb-6">
                <label className="text-[11px] text-slate-400 mb-2 block">Select Fields ({customFields.length} selected)</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_FIELDS.map((field) => (
                    <button key={field}
                      onClick={() => setCustomFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field])}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all
                        ${customFields.includes(field) ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                      {field}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!customName || customFields.length === 0}
                className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300
                  ${customName && customFields.length > 0
                    ? "bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/30 shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                    : "bg-white/[0.02] border border-white/8 text-slate-700 cursor-not-allowed"
                  }`}
              >
                {customName && customFields.length > 0
                  ? `📦 Export "${customName}" as ${customFormat.toUpperCase()}`
                  : "Fill name and select fields to export"
                }
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
