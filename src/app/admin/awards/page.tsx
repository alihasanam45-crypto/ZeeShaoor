"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Award {
  id: string;
  name: string;
  category: "academic" | "sports" | "leadership" | "attendance" | "special";
  description: string;
  criteria: string[];
  value: string;
  frequency: "monthly" | "quarterly" | "annual";
  maxWinners: number;
  currentWinners: number;
  status: "active" | "nominations_open" | "closed" | "draft";
  deadline: string;
  sponsor: string;
  icon: string;
}

interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  gpa: number;
  attendance: number;
  extracurriculars: string[];
  awards: string[];
  matchScore: number;
  eligible: boolean;
  nominated: boolean;
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const AWARDS: Award[] = [
  {
    id: "a1", name: "Merit Excellence Scholarship",
    category: "academic", icon: "🎓",
    description: "Full scholarship for students with outstanding academic performance",
    criteria: ["GPA ≥ 3.8", "Attendance ≥ 90%", "No disciplinary record", "Class 9-12 only"],
    value: "PKR 50,000 / year", frequency: "annual", maxWinners: 5, currentWinners: 3,
    status: "nominations_open", deadline: "Jan 31, 2025", sponsor: "ZeeShaoor Foundation",
  },
  {
    id: "a2", name: "Sports Star Award",
    category: "sports", icon: "🏆",
    description: "Recognition for exceptional athletic achievement and sportsmanship",
    criteria: ["Participated in ≥2 school sports", "Represented school at district level", "Good academic standing (GPA ≥ 2.5)"],
    value: "Certificate + PKR 10,000", frequency: "annual", maxWinners: 3, currentWinners: 3,
    status: "closed", deadline: "Dec 15, 2024", sponsor: "School Management",
  },
  {
    id: "a3", name: "Perfect Attendance Award",
    category: "attendance", icon: "📅",
    description: "Awarded to students with 100% attendance record for the term",
    criteria: ["100% attendance for full term", "No late arrivals > 3", "Active class participation"],
    value: "Certificate + PKR 5,000", frequency: "quarterly", maxWinners: 10, currentWinners: 4,
    status: "active", deadline: "Mar 31, 2025", sponsor: "School Management",
  },
  {
    id: "a4", name: "Student Leadership Prize",
    category: "leadership", icon: "⭐",
    description: "For students who demonstrate exceptional leadership in school activities",
    criteria: ["Class captain or club president", "Organized ≥1 school event", "Peer recognition score ≥ 80%"],
    value: "PKR 15,000 + Trophy", frequency: "annual", maxWinners: 2, currentWinners: 0,
    status: "nominations_open", deadline: "Feb 15, 2025", sponsor: "Alumni Association",
  },
  {
    id: "a5", name: "STEM Innovation Award",
    category: "academic", icon: "🔬",
    description: "For students excelling in Science, Technology, Engineering or Mathematics",
    criteria: ["Top 5% in Math or Science", "Science fair participation", "Teacher recommendation"],
    value: "PKR 25,000 + Laptop", frequency: "annual", maxWinners: 3, currentWinners: 1,
    status: "nominations_open", deadline: "Feb 28, 2025", sponsor: "Tech Pakistan Foundation",
  },
  {
    id: "a6", name: "Community Service Medal",
    category: "special", icon: "🌟",
    description: "Recognizing students who contribute to community and society",
    criteria: ["≥20 hours community service", "Principal recommendation", "Documentation required"],
    value: "Medal + Certificate", frequency: "annual", maxWinners: 5, currentWinners: 0,
    status: "draft", deadline: "TBD", sponsor: "Local NGO Partnership",
  },
];

const STUDENTS: Student[] = [
  { id: "s1", name: "Ayesha Nawaz", rollNo: "1001", class: "10-A", gpa: 3.92, attendance: 97, extracurriculars: ["Debate Club", "Science Fair"], awards: ["Best Student 2023"], matchScore: 96, eligible: true, nominated: true },
  { id: "s2", name: "Fatima Malik", rollNo: "1005", class: "10-A", gpa: 3.85, attendance: 94, extracurriculars: ["Math Club"], awards: [], matchScore: 91, eligible: true, nominated: false },
  { id: "s3", name: "Hassan Raza", rollNo: "1002", class: "10-A", gpa: 3.61, attendance: 88, extracurriculars: ["Cricket Team", "Football"], awards: ["Sports Star 2023"], matchScore: 78, eligible: true, nominated: false },
  { id: "s4", name: "Bilal Khan", rollNo: "1006", class: "10-C", gpa: 3.45, attendance: 82, extracurriculars: ["Student Council"], awards: [], matchScore: 65, eligible: true, nominated: false },
  { id: "s5", name: "Sara Ahmed", rollNo: "1003", class: "10-B", gpa: 2.91, attendance: 71, extracurriculars: [], awards: [], matchScore: 32, eligible: false, nominated: false },
  { id: "s6", name: "Omar Farooq", rollNo: "1004", class: "10-B", gpa: 2.14, attendance: 58, extracurriculars: [], awards: [], matchScore: 12, eligible: false, nominated: false },
];

// --------- Constants ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const CATEGORY_STYLE: Record<string, string> = {
  academic: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  sports: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  leadership: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  attendance: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  special: "text-pink-400 bg-pink-400/10 border-pink-400/25",
};

const STATUS_STYLE: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  nominations_open: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  closed: "text-slate-500 bg-slate-500/10 border-slate-500/25",
  draft: "text-amber-400 bg-amber-400/10 border-amber-400/25",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  nominations_open: "📬 Nominations Open",
  closed: "Closed",
  draft: "Draft",
};

// --------- Award Card ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function AwardCard({ award, onSelect, selected }: {
  award: Award;
  onSelect: (a: Award) => void;
  selected: boolean;
}) {
  const fillPct = Math.round((award.currentWinners / award.maxWinners) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(award)}
      className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 overflow-hidden
        ${selected
          ? "border-amber-400/50 bg-amber-400/5 shadow-[0_0_20px_rgba(251,191,36,0.1)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
        }`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4)1px,transparent 1px)", backgroundSize: "20px 20px" }} />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0">
            {award.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{award.name}</h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CATEGORY_STYLE[award.category]}`}>{award.category}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[award.status]}`}>{STATUS_LABEL[award.status]}</span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{award.description}</p>

      {/* Value + frequency */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 p-2.5 rounded-xl bg-amber-400/8 border border-amber-400/15 text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Value</p>
          <p className="text-[11px] font-bold text-amber-400">{award.value}</p>
        </div>
        <div className="flex-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/6 text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Frequency</p>
          <p className="text-[11px] font-medium text-slate-300 capitalize">{award.frequency}</p>
        </div>
        <div className="flex-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/6 text-center">
          <p className="text-[10px] text-slate-500 mb-0.5">Deadline</p>
          <p className="text-[11px] font-medium text-slate-300">{award.deadline}</p>
        </div>
      </div>

      {/* Winners progress */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-slate-600">Winners Selected</span>
          <span className="text-[10px] font-mono text-slate-400">{award.currentWinners}/{award.maxWinners}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fillPct}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full"
            style={{ background: fillPct >= 100 ? "#34d399" : fillPct > 50 ? "#fbbf24" : "#22d3ee" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// --------- Detail Panel ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function DetailPanel({ award, students, onClose }: {
  award: Award;
  students: Student[];
  onClose: () => void;
}) {
  const [nominated, setNominated] = useState<string[]>(
    students.filter(s => s.nominated).map(s => s.id)
  );

  const eligible = students.filter(s => s.eligible).sort((a, b) => b.matchScore - a.matchScore);

  const toggleNominate = (id: string) =>
    setNominated(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden sticky top-6"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/6 flex items-center gap-3">
        <span className="text-2xl">{award.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white leading-tight">{award.name}</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">{award.sponsor}</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-5 max-h-[78vh] overflow-y-auto">

        {/* Criteria */}
        <div>
          <p className="text-[11px] text-slate-400 font-medium mb-2">Eligibility Criteria</p>
          <div className="space-y-1.5">
            {award.criteria.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="text-emerald-400">✓</span> {c}
              </div>
            ))}
          </div>
        </div>

        {/* AI matched students */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-slate-400 font-medium">🤖 AI Matched Students</p>
            <span className="text-[10px] text-cyan-400">{eligible.length} eligible</span>
          </div>
          <div className="space-y-2">
            {eligible.map((s) => (
              <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200
                ${nominated.includes(s.id) ? "bg-amber-400/8 border-amber-400/25" : "bg-white/[0.02] border-white/6"}`}>
                {/* Match score */}
                <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-bold"
                  style={{ background: `conic-gradient(${s.matchScore >= 80 ? "#34d399" : s.matchScore >= 60 ? "#fbbf24" : "#f87171"} ${s.matchScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)` }}>
                  <div className="w-8 h-8 rounded-md bg-[#020817] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{s.matchScore}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-white">{s.name}</p>
                  <p className="text-[10px] text-slate-500">{s.class} · GPA {s.gpa} · {s.attendance}% att.</p>
                </div>
                <button
                  onClick={() => toggleNominate(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all duration-200 shrink-0
                    ${nominated.includes(s.id)
                      ? "bg-amber-400/20 border-amber-400/40 text-amber-400"
                      : "bg-white/5 border-white/10 text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {nominated.includes(s.id) ? "✓ Nominated" : "+ Nominate"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2 border-t border-white/6">
          <button className="w-full py-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 text-xs font-semibold hover:bg-amber-400/25 transition-colors">
            📢 Open Public Nominations
          </button>
          <button className="w-full py-2.5 rounded-xl bg-cyan-400/15 border border-cyan-400/30 text-cyan-400 text-xs font-semibold hover:bg-cyan-400/25 transition-colors">
            📄 Generate Award Report
          </button>
          <button className="w-full py-2.5 rounded-xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-400/25 transition-colors">
            🏅 Announce Winners
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function AwardsPage() {
  const [awards] = useState<Award[]>(AWARDS);
  const [students] = useState<Student[]>(STUDENTS);
  const [selected, setSelected] = useState<Award | null>(null);
  const [activeTab, setActiveTab] = useState<"awards" | "leaderboard" | "history">("awards");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filtered = awards.filter(a => {
    const matchCat = filterCat === "all" || a.category === filterCat;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchCat && matchStatus;
  });

  const openCount = awards.filter(a => a.status === "nominations_open").length;
  const totalValue = "PKR 1,05,000";
  const totalWinners = awards.reduce((s, a) => s + a.currentWinners, 0);

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Orbs */}
      <div className="absolute top-[-180px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-pink-400/20 border border-amber-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.Pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Scholarship & Award Engine</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">AI-powered student award matching, nominations & scholarship management</p>
          </div>

          {openCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/25">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-sm font-semibold text-cyan-400">{openCount} awards accepting nominations</span>
            </div>
          )}
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Awards", value: String(awards.length), icon: "🏆", color: "text-amber-400", sub: `${openCount} nominations open` },
            { label: "Winners This Year", value: String(totalWinners), icon: "🎖️", color: "text-cyan-400", sub: "across all awards" },
            { label: "Total Value", value: totalValue, icon: "💰", color: "text-emerald-400", sub: "scholarships + prizes" },
            { label: "AI Matched", value: `${students.filter(s => s.eligible).length}/${students.length}`, icon: "🤖", color: "text-violet-400", sub: "students eligible" },
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
          {(["awards", "leaderboard", "history"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab ? "bg-amber-400/20 text-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.15)]" : "text-slate-500 hover:text-slate-300"}`}>
              {tab === "awards" ? "🏅 Awards" : tab === "leaderboard" ? "📊 AI Leaderboard" : "📜 Past Winners"}
            </button>
          ))}
        </div>

        {/* ------ Awards Tab ------ */}
        {activeTab === "awards" && (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              {/* Filters */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                {["all", "academic", "sports", "leadership", "attendance", "special"].map((cat) => (
                  <button key={cat} onClick={() => setFilterCat(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border capitalize transition-all
                      ${filterCat === cat ? "bg-amber-400/15 border-amber-400/40 text-amber-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                    {cat}
                  </button>
                ))}
                <div className="ml-auto flex gap-2">
                  {["all", "nominations_open", "active", "closed", "draft"].map((s) => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border capitalize transition-all
                        ${filterStatus === s ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                      {s === "nominations_open" ? "open" : s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filtered.map((award) => (
                    <AwardCard key={award.id} award={award}
                      onSelect={(a) => setSelected(a.id === selected?.id ? null : a)}
                      selected={selected?.id === award.id} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Detail panel */}
            <div className="w-80 shrink-0">
              <AnimatePresence>
                {selected && (
                  <DetailPanel key={selected.id} award={selected} students={students} onClose={() => setSelected(null)} />
                )}
              </AnimatePresence>
              {!selected && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <div className="text-4xl mb-3">🏅</div>
                  <p className="text-xs text-slate-600">Click an award to see AI-matched students & nominate</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------ Leaderboard Tab ------ */}
        {activeTab === "leaderboard" && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/6 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">AI Award Eligibility Leaderboard</h3>
              <span className="text-[11px] text-slate-500">{students.length} students scored</span>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[...students].sort((a, b) => b.matchScore - a.matchScore).map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <span className="text-lg w-8 text-center shrink-0">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{s.name}</p>
                    <p className="text-[10px] text-slate-500">{s.class} · Roll #{s.rollNo}</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-slate-500">GPA <span className="text-slate-300 font-mono">{s.gpa}</span></span>
                    <span className="text-slate-500">Att <span className="text-slate-300 font-mono">{s.attendance}%</span></span>
                  </div>
                  <div className="w-24">
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${s.matchScore}%`, background: s.matchScore >= 80 ? "#34d399" : s.matchScore >= 60 ? "#fbbf24" : "#f87171" }} />
                    </div>
                    <p className="text-[10px] text-right mt-0.5 font-mono" style={{ color: s.matchScore >= 80 ? "#34d399" : s.matchScore >= 60 ? "#fbbf24" : "#f87171" }}>
                      {s.matchScore}%
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0
                    ${s.eligible ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/25" : "text-slate-600 bg-slate-600/10 border-slate-600/25"}`}>
                    {s.eligible ? "Eligible" : "Ineligible"}
                  </span>
                  {s.nominated && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border text-amber-400 bg-amber-400/10 border-amber-400/25 shrink-0">
                      Nominated
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ------ History Tab ------ */}
        {activeTab === "history" && (
          <div className="space-y-4">
            {[
              { year: "2024", winners: [{ name: "Ayesha Nawaz", award: "Merit Excellence Scholarship", value: "PKR 50,000" }, { name: "Hassan Raza", award: "Sports Star Award", value: "PKR 10,000" }, { name: "Fatima Malik", award: "STEM Innovation Award", value: "PKR 25,000" }] },
              { year: "2023", winners: [{ name: "Zara Khan", award: "Merit Excellence Scholarship", value: "PKR 50,000" }, { name: "Ali Hassan", award: "Student Leadership Prize", value: "PKR 15,000" }] },
            ].map((yr) => (
              <div key={yr.year} className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
                <div className="px-5 py-3 border-b border-white/6 bg-white/[0.02]">
                  <h3 className="text-sm font-bold text-white">🏆 {yr.year} Winners</h3>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {yr.winners.map((w, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white">{w.name}</p>
                        <p className="text-[10px] text-slate-500">{w.award}</p>
                      </div>
                      <span className="text-[11px] font-mono text-amber-400">{w.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
