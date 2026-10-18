"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Complaint {
  id: string;
  code: string;
  category: "teacher" | "admin" | "facility" | "academic" | "safety" | "other";
  severity: "low" | "medium" | "high" | "critical";
  subject: string;
  body: string;
  submittedAt: string;
  status: "new" | "reviewing" | "resolved" | "dismissed";
  assignedTo: string | null;
  responses: number;
  isAnonymous: boolean;
  tags: string[];
}

interface ComplaintResponse {
  id: string;
  text: string;
  by: string;
  at: string;
  isAdmin: boolean;
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const COMPLAINTS: Complaint[] = [
  {
    id: "c1", code: "ZS-2024-0091",
    category: "teacher", severity: "high",
    subject: "Teacher repeatedly skips last 15 minutes of class",
    body: "For the past 3 weeks, the teacher has been ending class early without covering the syllabus. This is affecting our exam preparation significantly.",
    submittedAt: "2 hours ago", status: "new",
    assignedTo: null, responses: 0, isAnonymous: true,
    tags: ["attendance", "syllabus"],
  },
  {
    id: "c2", code: "ZS-2024-0090",
    category: "facility", severity: "critical",
    subject: "Broken water pipes in Block C washrooms",
    body: "Water has been leaking from pipes in the Block C washrooms for 5 days. The floor is slippery and dangerous for students.",
    submittedAt: "5 hours ago", status: "reviewing",
    assignedTo: "Maintenance Team", responses: 1, isAnonymous: true,
    tags: ["safety", "urgent", "infrastructure"],
  },
  {
    id: "c3", code: "ZS-2024-0089",
    category: "academic", severity: "medium",
    subject: "Unfair marking in Physics mid-term",
    body: "Several students received very different marks for identical answers. We believe the marking was inconsistent and biased.",
    submittedAt: "1 day ago", status: "reviewing",
    assignedTo: "Academic Committee", responses: 2, isAnonymous: false,
    tags: ["grading", "fairness"],
  },
  {
    id: "c4", code: "ZS-2024-0088",
    category: "safety", severity: "critical",
    subject: "Suspicious person seen near school gate daily",
    body: "For the past week, an unknown individual has been loitering near the main gate during dismissal time. This is a safety concern for students.",
    submittedAt: "1 day ago", status: "resolved",
    assignedTo: "Security", responses: 3, isAnonymous: true,
    tags: ["security", "safety"],
  },
  {
    id: "c5", code: "ZS-2024-0087",
    category: "admin", severity: "low",
    subject: "Fee receipts not being issued on time",
    body: "When paying fees at the counter, receipts are delayed by 2-3 days. This causes issues for record keeping.",
    submittedAt: "2 days ago", status: "resolved",
    assignedTo: "Accounts", responses: 1, isAnonymous: false,
    tags: ["fees", "admin"],
  },
  {
    id: "c6", code: "ZS-2024-0086",
    category: "other", severity: "medium",
    subject: "Canteen food quality has declined significantly",
    body: "The food quality in the school canteen has been very poor for the last month. Students are finding unhygienic conditions.",
    submittedAt: "3 days ago", status: "dismissed",
    assignedTo: null, responses: 0, isAnonymous: true,
    tags: ["canteen", "hygiene"],
  },
];

const MOCK_RESPONSES: ComplaintResponse[] = [
  { id: "r1", text: "We have received your complaint and assigned it to the maintenance team. Work will begin tomorrow.", by: "Admin Office", at: "3 hours ago", isAdmin: true },
  { id: "r2", text: "Maintenance team has been dispatched. Please allow 24-48 hours for resolution.", by: "Maintenance Dept", at: "1 hour ago", isAdmin: true },
];

// --------- Constants ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const CATEGORY_STYLE: Record<string, string> = {
  teacher: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  admin: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  facility: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  academic: "text-blue-400 bg-blue-400/10 border-blue-400/25",
  safety: "text-red-400 bg-red-400/10 border-red-400/25",
  other: "text-slate-400 bg-slate-400/10 border-slate-400/25",
};

const SEVERITY_STYLE: Record<string, string> = {
  low: "text-emerald-400 bg-emerald-400/8 border-emerald-400/20",
  medium: "text-amber-400 bg-amber-400/8 border-amber-400/20",
  high: "text-orange-400 bg-orange-400/8 border-orange-400/20",
  critical: "text-red-400 bg-red-400/8 border-red-400/20",
};

const STATUS_STYLE: Record<string, string> = {
  new: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  reviewing: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  resolved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  dismissed: "text-slate-500 bg-slate-500/10 border-slate-500/25",
};

const SEVERITY_DOT: Record<string, string> = {
  low: "bg-emerald-400",
  medium: "bg-amber-400",
  high: "bg-orange-400",
  critical: "bg-red-400 animate-pulse shadow-[0_0_8px_#f87171]",
};

// --------- Complaint Card ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ComplaintCard({
  complaint,
  onSelect,
  selected,
}: {
  complaint: Complaint;
  onSelect: (c: Complaint) => void;
  selected: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      onClick={() => onSelect(complaint)}
      className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 overflow-hidden
        ${selected
          ? "border-cyan-400/50 bg-cyan-400/5 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
        }`}
    >
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4)1px,transparent 1px)", backgroundSize: "20px 20px" }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 shrink-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${SEVERITY_DOT[complaint.severity]}`} />
          <span className="text-[10px] font-mono text-slate-600">{complaint.code}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[complaint.status]}`}>
            {complaint.status}
          </span>
          {complaint.isAnonymous && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-600/40 text-slate-500 bg-slate-500/8">
              👤 anon
            </span>
          )}
        </div>
      </div>

      <h3 className="text-sm font-semibold text-white mb-1 leading-snug line-clamp-2">{complaint.subject}</h3>
      <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mb-3">{complaint.body}</p>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_STYLE[complaint.category]}`}>
          {complaint.category}
        </span>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${SEVERITY_STYLE[complaint.severity]}`}>
          {complaint.severity}
        </span>
        {complaint.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[10px] text-slate-600 bg-white/3 px-2 py-0.5 rounded-full border border-white/6">
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-600">{complaint.submittedAt}</span>
        <div className="flex items-center gap-3">
          {complaint.assignedTo && (
            <span className="text-[10px] text-slate-500">→ {complaint.assignedTo}</span>
          )}
          {complaint.responses > 0 && (
            <span className="text-[10px] text-cyan-400/70 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {complaint.responses}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --------- Detail Panel ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function DetailPanel({
  complaint,
  onClose,
  onStatusChange,
}: {
  complaint: Complaint;
  onClose: () => void;
  onStatusChange: (id: string, status: Complaint["status"]) => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [assignTo, setAssignTo] = useState(complaint.assignedTo ?? "");
  const [sent, setSent] = useState(false);

  const handleReply = () => {
    if (!replyText.trim()) return;
    setSent(true);
    setReplyText("");
    setTimeout(() => setSent(false), 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden h-fit sticky top-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/6">
        <div>
          <span className="text-[10px] font-mono text-slate-600">{complaint.code}</span>
          <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">{complaint.subject}</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 ml-3">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Category", value: complaint.category, style: CATEGORY_STYLE[complaint.category] },
            { label: "Severity", value: complaint.severity, style: SEVERITY_STYLE[complaint.severity] },
          ].map((m) => (
            <div key={m.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/6">
              <p className="text-[10px] text-slate-600 mb-1">{m.label}</p>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${m.style}`}>{m.value}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/6">
          <p className="text-[10px] text-slate-600 mb-2">Complaint Details</p>
          <p className="text-xs text-slate-300 leading-relaxed">{complaint.body}</p>
          <div className="flex items-center gap-2 mt-3">
            {complaint.isAnonymous ? (
              <span className="text-[10px] text-slate-500 flex items-center gap-1">👤 Anonymous submission</span>
            ) : (
              <span className="text-[10px] text-slate-500">Identified submission</span>
            )}
            <span className="text-slate-700">·</span>
            <span className="text-[10px] text-slate-600">{complaint.submittedAt}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {complaint.tags.map((tag) => (
            <span key={tag} className="text-[10px] text-slate-500 bg-white/3 px-2 py-0.5 rounded-full border border-white/6">#{tag}</span>
          ))}
        </div>

        {/* Status changer */}
        <div>
          <p className="text-[11px] text-slate-400 mb-2">Update Status</p>
          <div className="grid grid-cols-2 gap-2">
            {(["new", "reviewing", "resolved", "dismissed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(complaint.id, s)}
                className={`py-2 rounded-lg text-[11px] font-medium border transition-all duration-200 capitalize
                  ${complaint.status === s
                    ? STATUS_STYLE[s]
                    : "border-white/8 text-slate-600 hover:text-slate-400 hover:border-white/15"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Assign */}
        <div>
          <p className="text-[11px] text-slate-400 mb-2">Assign To</p>
          <div className="flex gap-2">
            <input
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              placeholder="Department or person..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/40 transition-colors placeholder:text-slate-700"
            />
            <button className="px-3 py-2 rounded-lg bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 text-xs hover:bg-cyan-400/20 transition-colors">
              Save
            </button>
          </div>
        </div>

        {/* Responses */}
        {complaint.responses > 0 && (
          <div>
            <p className="text-[11px] text-slate-400 mb-3">Responses ({complaint.responses})</p>
            <div className="space-y-3">
              {MOCK_RESPONSES.slice(0, complaint.responses).map((r) => (
                <div key={r.id} className={`p-3 rounded-xl border ${r.isAdmin ? "bg-cyan-400/5 border-cyan-400/15" : "bg-white/[0.02] border-white/6"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-white">{r.by}</span>
                    <span className="text-[10px] text-slate-600">{r.at}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply box */}
        <div>
          <p className="text-[11px] text-slate-400 mb-2">Add Response</p>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your response to this complaint..."
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white resize-none focus:outline-none focus:border-cyan-400/40 transition-colors placeholder:text-slate-700"
          />
          <button
            onClick={handleReply}
            className={`mt-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-300
              ${sent
                ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-400"
                : "bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 hover:bg-cyan-500/30"
              }`}
          >
            {sent ? "✓ Response Sent" : "Send Response"}
          </button>
        </div>

        {/* Danger */}
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <p className="text-[11px] text-red-400 font-medium mb-2">Admin Actions</p>
          <div className="space-y-2">
            <button className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
              Mark as Spam
            </button>
            <button className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-colors">
              Escalate to Principal
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>(COMPLAINTS);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [activeTab, setActiveTab] = useState<"inbox" | "stats" | "settings">("inbox");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  const updateStatus = (id: string, status: Complaint["status"]) => {
    setComplaints((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  const filtered = complaints.filter((c) => {
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    const matchSeverity = filterSeverity === "all" || c.severity === filterSeverity;
    const matchSearch = !searchQ || c.subject.toLowerCase().includes(searchQ.toLowerCase()) || c.code.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSeverity && matchSearch;
  });

  const newCount = complaints.filter((c) => c.status === "new").length;
  const criticalCount = complaints.filter((c) => c.severity === "critical").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;
  const reviewingCount = complaints.filter((c) => c.status === "reviewing").length;

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Ambient orbs */}
      <div className="absolute top-[-180px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400/20 to-cyan-400/20 border border-violet-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Anonymous Complaint Box</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">Review, respond & resolve student and staff complaints — fully anonymized</p>
          </div>

          {/* New badge */}
          {newCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/25">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-cyan-400">{newCount} new complaints</span>
            </div>
          )}
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "New / Unread", value: String(newCount), icon: "📬", color: "text-cyan-400", sub: "awaiting review" },
            { label: "Under Review", value: String(reviewingCount), icon: "🔍", color: "text-amber-400", sub: "being investigated" },
            { label: "Critical", value: String(criticalCount), icon: "🚨", color: "text-red-400", sub: "needs immediate action" },
            { label: "Resolved", value: String(resolvedCount), icon: "✅", color: "text-emerald-400", sub: `of ${complaints.length} total` },
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

        {/* ------ Tabs ------ */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-fit">
          {(["inbox", "stats", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                ${activeTab === tab
                  ? "bg-violet-500/20 text-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.15)]"
                  : "text-slate-500 hover:text-slate-300"
                }`}
            >
              {tab === "inbox" ? `📬 Inbox (${complaints.length})` : tab === "stats" ? "📊 Analytics" : "⚙️ Settings"}
            </button>
          ))}
        </div>

        {/* ------ Inbox Tab ------ */}
        {activeTab === "inbox" && (
          <div className="flex gap-6">
            {/* Left: list */}
            <div className="flex-1 min-w-0">
              {/* Filters */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-48">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Search complaints..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400/40 transition-colors placeholder:text-slate-700"
                  />
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-1.5">
                  {["all", "new", "reviewing", "resolved", "dismissed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border capitalize
                        ${filterStatus === s
                          ? "bg-violet-400/15 border-violet-400/40 text-violet-400"
                          : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Severity filter */}
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-violet-400/40"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <span className="text-[11px] text-slate-600 ml-auto">{filtered.length} complaints</span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filtered.map((c) => (
                    <ComplaintCard
                      key={c.id}
                      complaint={c}
                      onSelect={(comp) => setSelected(comp.id === selected?.id ? null : comp)}
                      selected={selected?.id === c.id}
                    />
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && (
                  <div className="col-span-2 py-16 text-center">
                    <p className="text-slate-600 text-sm">No complaints match your filters</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: detail */}
            <div className="w-80 shrink-0">
              <AnimatePresence>
                {selected && (
                  <DetailPanel
                    key={selected.id}
                    complaint={selected}
                    onClose={() => setSelected(null)}
                    onStatusChange={updateStatus}
                  />
                )}
              </AnimatePresence>
              {!selected && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-600">Click a complaint to review & respond</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------ Stats Tab ------ */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Category */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-5">Complaints by Category</h3>
              <div className="space-y-4">
                {(["teacher", "facility", "academic", "safety", "admin", "other"] as const).map((cat) => {
                  const count = complaints.filter((c) => c.category === cat).length;
                  const pct = Math.round((count / complaints.length) * 100);
                  return (
                    <div key={cat} className="flex items-center gap-4">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border w-20 text-center ${CATEGORY_STYLE[cat]}`}>{cat}</span>
                      <div className="flex-1">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full bg-violet-400/60"
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* By Status */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-5">Resolution Status</h3>
              <div className="space-y-4">
                {(["new", "reviewing", "resolved", "dismissed"] as const).map((s) => {
                  const count = complaints.filter((c) => c.status === s).length;
                  const pct = Math.round((count / complaints.length) * 100);
                  return (
                    <div key={s} className="flex items-center gap-4">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border w-20 text-center ${STATUS_STYLE[s]}`}>{s}</span>
                      <div className="flex-1">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="h-full rounded-full bg-cyan-400/60"
                          />
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resolution rate */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 lg:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-3">Platform Health</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Resolution Rate", value: `${Math.round((resolvedCount / complaints.length) * 100)}%`, color: "text-emerald-400" },
                  { label: "Avg Response Time", value: "4.2 hrs", color: "text-cyan-400" },
                  { label: "Anonymous Rate", value: `${Math.round((complaints.filter(c => c.isAnonymous).length / complaints.length) * 100)}%`, color: "text-violet-400" },
                ].map((m) => (
                  <div key={m.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/6 text-center">
                    <p className={`text-3xl font-bold font-mono ${m.color}`}>{m.value}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------ Settings Tab ------ */}
        {activeTab === "settings" && (
          <div className="max-w-2xl space-y-5">
            {[
              { label: "Allow Anonymous Submissions", desc: "Students can submit without revealing identity", enabled: true },
              { label: "Email Notifications", desc: "Notify admin on new critical complaints", enabled: true },
              { label: "Auto-assign by Category", desc: "Automatically route complaints to departments", enabled: false },
              { label: "Public Status Tracker", desc: "Let submitters track complaint status via code", enabled: true },
              { label: "Duplicate Detection", desc: "Flag similar complaints automatically", enabled: false },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between p-5 rounded-2xl border border-white/8 bg-white/[0.025]">
                <div>
                  <p className="text-sm font-medium text-white">{setting.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{setting.desc}</p>
                </div>
                <button className={`relative w-10 h-5 rounded-full transition-all duration-300 shrink-0 ml-4
                  ${setting.enabled ? "bg-violet-500/70 shadow-[0_0_10px_rgba(139,92,246,0.35)]" : "bg-slate-700/50"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300
                    ${setting.enabled ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}