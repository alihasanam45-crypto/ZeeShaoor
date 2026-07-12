"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Student {
  id: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  readinessScore: number;
  trend: "up" | "down" | "stable";
  subjects: SubjectScore[];
  riskLevel: "safe" | "watch" | "danger" | "critical";
  predictedGrade: string;
  attendancePercent: number;
  testsAttempted: number;
  totalTests: number;
  weakAreas: string[];
  strongAreas: string[];
  lastActivity: string;
}

interface SubjectScore {
  name: string;
  score: number;
  maxScore: number;
  trend: "up" | "down" | "stable";
}

interface ClassSummary {
  class: string;
  avgScore: number;
  totalStudents: number;
  safe: number;
  watch: number;
  danger: number;
  critical: number;
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const STUDENTS: Student[] = [
  {
    id: "s1", name: "Ayesha Nawaz", rollNo: "1001", class: "10", section: "A",
    readinessScore: 91, trend: "up", riskLevel: "safe",
    predictedGrade: "A+", attendancePercent: 97, testsAttempted: 18, totalTests: 20,
    subjects: [
      { name: "Mathematics", score: 94, maxScore: 100, trend: "up" },
      { name: "Physics", score: 88, maxScore: 100, trend: "stable" },
      { name: "Chemistry", score: 91, maxScore: 100, trend: "up" },
      { name: "English", score: 95, maxScore: 100, trend: "up" },
      { name: "Urdu", score: 87, maxScore: 100, trend: "stable" },
    ],
    weakAreas: ["Organic Chemistry"],
    strongAreas: ["Algebra", "English Grammar", "Calculus"],
    lastActivity: "2 hours ago",
  },
  {
    id: "s2", name: "Hassan Raza", rollNo: "1002", class: "10", section: "A",
    readinessScore: 74, trend: "stable", riskLevel: "watch",
    predictedGrade: "B", attendancePercent: 88, testsAttempted: 15, totalTests: 20,
    subjects: [
      { name: "Mathematics", score: 72, maxScore: 100, trend: "up" },
      { name: "Physics", score: 68, maxScore: 100, trend: "down" },
      { name: "Chemistry", score: 79, maxScore: 100, trend: "stable" },
      { name: "English", score: 81, maxScore: 100, trend: "up" },
      { name: "Urdu", score: 70, maxScore: 100, trend: "stable" },
    ],
    weakAreas: ["Thermodynamics", "Trigonometry"],
    strongAreas: ["English Writing", "Organic Chemistry"],
    lastActivity: "1 day ago",
  },
  {
    id: "s3", name: "Sara Ahmed", rollNo: "1003", class: "10", section: "B",
    readinessScore: 48, trend: "down", riskLevel: "danger",
    predictedGrade: "C", attendancePercent: 71, testsAttempted: 11, totalTests: 20,
    subjects: [
      { name: "Mathematics", score: 44, maxScore: 100, trend: "down" },
      { name: "Physics", score: 51, maxScore: 100, trend: "down" },
      { name: "Chemistry", score: 55, maxScore: 100, trend: "stable" },
      { name: "English", score: 62, maxScore: 100, trend: "up" },
      { name: "Urdu", score: 48, maxScore: 100, trend: "down" },
    ],
    weakAreas: ["Algebra", "Mechanics", "Urdu Grammar"],
    strongAreas: ["English Comprehension"],
    lastActivity: "3 days ago",
  },
  {
    id: "s4", name: "Omar Farooq", rollNo: "1004", class: "10", section: "B",
    readinessScore: 29, trend: "down", riskLevel: "critical",
    predictedGrade: "D", attendancePercent: 58, testsAttempted: 7, totalTests: 20,
    subjects: [
      { name: "Mathematics", score: 28, maxScore: 100, trend: "down" },
      { name: "Physics", score: 31, maxScore: 100, trend: "down" },
      { name: "Chemistry", score: 33, maxScore: 100, trend: "stable" },
      { name: "English", score: 41, maxScore: 100, trend: "stable" },
      { name: "Urdu", score: 35, maxScore: 100, trend: "down" },
    ],
    weakAreas: ["All Mathematics", "Physics Laws", "Attendance"],
    strongAreas: [],
    lastActivity: "1 week ago",
  },
  {
    id: "s5", name: "Fatima Malik", rollNo: "1005", class: "10", section: "A",
    readinessScore: 85, trend: "up", riskLevel: "safe",
    predictedGrade: "A", attendancePercent: 94, testsAttempted: 19, totalTests: 20,
    subjects: [
      { name: "Mathematics", score: 88, maxScore: 100, trend: "up" },
      { name: "Physics", score: 82, maxScore: 100, trend: "up" },
      { name: "Chemistry", score: 86, maxScore: 100, trend: "stable" },
      { name: "English", score: 90, maxScore: 100, trend: "up" },
      { name: "Urdu", score: 79, maxScore: 100, trend: "stable" },
    ],
    weakAreas: ["Inorganic Chemistry"],
    strongAreas: ["Calculus", "English", "Optics"],
    lastActivity: "5 hours ago",
  },
  {
    id: "s6", name: "Bilal Khan", rollNo: "1006", class: "10", section: "C",
    readinessScore: 62, trend: "up", riskLevel: "watch",
    predictedGrade: "B-", attendancePercent: 82, testsAttempted: 14, totalTests: 20,
    subjects: [
      { name: "Mathematics", score: 65, maxScore: 100, trend: "up" },
      { name: "Physics", score: 60, maxScore: 100, trend: "up" },
      { name: "Chemistry", score: 63, maxScore: 100, trend: "stable" },
      { name: "English", score: 71, maxScore: 100, trend: "up" },
      { name: "Urdu", score: 58, maxScore: 100, trend: "stable" },
    ],
    weakAreas: ["Integration", "Waves"],
    strongAreas: ["English", "Basic Algebra"],
    lastActivity: "1 day ago",
  },
];

const CLASS_SUMMARIES: ClassSummary[] = [
  { class: "10-A", avgScore: 83, totalStudents: 42, safe: 28, watch: 10, danger: 3, critical: 1 },
  { class: "10-B", avgScore: 67, totalStudents: 38, safe: 18, watch: 12, danger: 6, critical: 2 },
  { class: "10-C", avgScore: 71, totalStudents: 40, safe: 22, watch: 13, danger: 4, critical: 1 },
  { class: "9-A", avgScore: 76, totalStudents: 44, safe: 30, watch: 10, danger: 3, critical: 1 },
  { class: "9-B", avgScore: 69, totalStudents: 39, safe: 20, watch: 14, danger: 4, critical: 1 },
];

// --------- Constants ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const RISK_STYLE: Record<string, string> = {
  safe: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  watch: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  danger: "text-orange-400 bg-orange-400/10 border-orange-400/25",
  critical: "text-red-400 bg-red-400/10 border-red-400/25",
};

const RISK_DOT: Record<string, string> = {
  safe: "bg-emerald-400 shadow-[0_0_6px_#34d399]",
  watch: "bg-amber-400 shadow-[0_0_6px_#fbbf24]",
  danger: "bg-orange-400 shadow-[0_0_6px_#fb923c]",
  critical: "bg-red-400 animate-pulse shadow-[0_0_8px_#f87171]",
};

const SCORE_COLOR = (score: number) =>
  score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : score >= 40 ? "#fb923c" : "#f87171";

const TREND_ICON = (trend: string) =>
  trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

const TREND_COLOR = (trend: string) =>
  trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-500";

// --------- Radial Score Ring ------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = size * 0.38;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const color = SCORE_COLOR(score);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={size * 0.07} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={size * 0.07}
        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`} />
      <text x={cx} y={cx + 1} textAnchor="middle" dominantBaseline="middle"
        fill="white" fontSize={size * 0.2} fontWeight="700">
        {score}
      </text>
      <text x={cx} y={cx + size * 0.18} textAnchor="middle" dominantBaseline="middle"
        fill="rgba(148,163,184,0.7)" fontSize={size * 0.1}>
        /100
      </text>
    </svg>
  );
}

// --------- Student Card ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function StudentCard({ student, onSelect, selected }: {
  student: Student;
  onSelect: (s: Student) => void;
  selected: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(student)}
      className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 overflow-hidden
        ${selected
          ? "border-cyan-400/50 bg-cyan-400/5 shadow-[0_0_20px_rgba(34,211,238,0.08)]"
          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]"
        }`}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4)1px,transparent 1px)", backgroundSize: "20px 20px" }} />

      <div className="flex items-start gap-4">
        {/* Score ring */}
        <div className="shrink-0">
          <ScoreRing score={student.readinessScore} size={72} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="text-sm font-bold text-white">{student.name}</h3>
              <p className="text-[11px] text-slate-500 font-mono">#{student.rollNo} · Class {student.class}-{student.section}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${RISK_DOT[student.riskLevel]}`} />
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${RISK_STYLE[student.riskLevel]}`}>
                {student.riskLevel}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="text-center p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs font-bold text-white">{student.predictedGrade}</p>
              <p className="text-[10px] text-slate-600">Predicted</p>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs font-bold text-white">{student.attendancePercent}%</p>
              <p className="text-[10px] text-slate-600">Attendance</p>
            </div>
            <div className="text-center p-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-xs font-bold text-white">{student.testsAttempted}/{student.totalTests}</p>
              <p className="text-[10px] text-slate-600">Tests</p>
            </div>
          </div>

          {/* Trend + last activity */}
          <div className="flex items-center justify-between mt-3">
            <span className={`text-[11px] font-medium ${TREND_COLOR(student.trend)}`}>
              {TREND_ICON(student.trend)} {student.trend === "up" ? "Improving" : student.trend === "down" ? "Declining" : "Stable"}
            </span>
            <span className="text-[10px] text-slate-600">{student.lastActivity}</span>
          </div>
        </div>
      </div>

      {/* Weak areas warning */}
      {student.weakAreas.length > 0 && student.riskLevel !== "safe" && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-[10px] text-slate-600 mb-1">Weak areas:</p>
          <div className="flex flex-wrap gap-1">
            {student.weakAreas.slice(0, 3).map((w) => (
              <span key={w} className="text-[10px] text-orange-400 bg-orange-400/8 px-2 py-0.5 rounded-full border border-orange-400/15">{w}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// --------- Detail Panel ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function DetailPanel({ student, onClose }: { student: Student; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden sticky top-6"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/6 flex items-center gap-4">
        <ScoreRing score={student.readinessScore} size={64} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{student.name}</h3>
          <p className="text-[11px] text-slate-500 font-mono">Roll #{student.rollNo}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${RISK_STYLE[student.riskLevel]}`}>{student.riskLevel}</span>
            <span className="text-[10px] text-slate-500">→ {student.predictedGrade}</span>
          </div>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">

        {/* Subject breakdown */}
        <div>
          <p className="text-[11px] text-slate-400 mb-3">Subject Scores</p>
          <div className="space-y-3">
            {student.subjects.map((sub) => {
              const pct = (sub.score / sub.maxScore) * 100;
              const color = SCORE_COLOR(pct);
              return (
                <div key={sub.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-300">{sub.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${TREND_COLOR(sub.trend)}`}>{TREND_ICON(sub.trend)}</span>
                      <span className="text-[11px] font-mono font-bold" style={{ color }}>{sub.score}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full"
                      style={{ background: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/6 text-center">
            <p className="text-xl font-bold text-white">{student.attendancePercent}%</p>
            <p className="text-[10px] text-slate-500">Attendance</p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/6 text-center">
            <p className="text-xl font-bold text-white">{student.testsAttempted}/{student.totalTests}</p>
            <p className="text-[10px] text-slate-500">Tests Done</p>
          </div>
        </div>

        {/* Strong areas */}
        {student.strongAreas.length > 0 && (
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Strong Areas ✨</p>
            <div className="flex flex-wrap gap-1.5">
              {student.strongAreas.map((s) => (
                <span key={s} className="text-[10px] text-emerald-400 bg-emerald-400/8 px-2 py-0.5 rounded-full border border-emerald-400/15">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Weak areas */}
        {student.weakAreas.length > 0 && (
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Needs Improvement ⚠️</p>
            <div className="flex flex-wrap gap-1.5">
              {student.weakAreas.map((w) => (
                <span key={w} className="text-[10px] text-orange-400 bg-orange-400/8 px-2 py-0.5 rounded-full border border-orange-400/15">{w}</span>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendation */}
        <div className="p-4 rounded-xl bg-cyan-400/5 border border-cyan-400/20">
          <p className="text-[11px] text-cyan-400 font-semibold mb-2">🤖 AI Recommendation</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {student.riskLevel === "critical"
              ? "Immediate intervention required. Schedule parent meeting, assign remedial tutor, and monitor daily attendance."
              : student.riskLevel === "danger"
              ? "Focus on weak subjects with extra practice. Increase test frequency and teacher check-ins."
              : student.riskLevel === "watch"
              ? "On track but needs consistency. Monitor attendance and encourage mock tests."
              : "Excellent trajectory. Encourage advanced problem sets and peer tutoring opportunities."}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button className="w-full py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/25 transition-colors">
            📧 Notify Parents
          </button>
          <button className="w-full py-2.5 rounded-xl bg-violet-500/15 border border-violet-400/30 text-violet-400 text-xs font-medium hover:bg-violet-500/25 transition-colors">
            📋 Generate Report
          </button>
          <button className="w-full py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors">
            🎯 Assign Remedial Plan
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function BoardReadinessPage() {
  const [students] = useState<Student[]>(STUDENTS);
  const [selected, setSelected] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<"students" | "classes" | "insights">("students");
  const [filterRisk, setFilterRisk] = useState("all");
  const [filterClass, setFilterClass] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [sortBy, setSortBy] = useState<"score" | "name" | "risk">("score");

  const filtered = students
    .filter((s) => {
      const matchRisk = filterRisk === "all" || s.riskLevel === filterRisk;
      const matchClass = filterClass === "all" || s.class === filterClass;
      const matchSearch = !searchQ || s.name.toLowerCase().includes(searchQ.toLowerCase()) || s.rollNo.includes(searchQ);
      return matchRisk && matchClass && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.readinessScore - a.readinessScore;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const riskOrder = { critical: 0, danger: 1, watch: 2, safe: 3 };
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    });

  const avgScore = Math.round(students.reduce((s, st) => s + st.readinessScore, 0) / students.length);
  const criticalCount = students.filter((s) => s.riskLevel === "critical").length;
  const safeCount = students.filter((s) => s.riskLevel === "safe").length;
  const totalTests = students.reduce((s, st) => s + st.testsAttempted, 0);

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Orbs */}
      <div className="absolute top-[-180px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 border border-cyan-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.Pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Board Readiness AI Score</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">AI-powered exam readiness analysis for every student — predict, intervene & improve</p>
          </div>

          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/10 border border-red-400/25">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-sm font-semibold text-red-400">{criticalCount} critical student{criticalCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Avg Readiness", value: `${avgScore}%`, icon: "📊", color: "text-cyan-400", sub: "school-wide score" },
            { label: "Board Ready", value: `${safeCount}/${students.length}`, icon: "✅", color: "text-emerald-400", sub: "score above 80%" },
            { label: "Critical Risk", value: String(criticalCount), icon: "🚨", color: "text-red-400", sub: "immediate action needed" },
            { label: "Tests Logged", value: totalTests.toString(), icon: "📝", color: "text-amber-400", sub: "this semester" },
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
          {(["students", "classes", "insights"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                ${activeTab === tab ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.15)]" : "text-slate-500 hover:text-slate-300"}`}>
              {tab === "students" ? "🎓 Students" : tab === "classes" ? "🏫 By Class" : "💡 AI Insights"}
            </button>
          ))}
        </div>

        {/* ------ Students Tab ------ */}
        {activeTab === "students" && (
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              {/* Filters */}
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="relative flex-1 min-w-40">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search by name or roll#..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400/40 placeholder:text-slate-700" />
                </div>

                {["all", "safe", "watch", "danger", "critical"].map((r) => (
                  <button key={r} onClick={() => setFilterRisk(r)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border capitalize transition-all
                      ${filterRisk === r ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                    {r}
                  </button>
                ))}

                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-400 focus:outline-none">
                  <option value="score">Sort: Score</option>
                  <option value="risk">Sort: Risk</option>
                  <option value="name">Sort: Name</option>
                </select>

                <span className="text-[11px] text-slate-600 ml-auto">{filtered.length} students</span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filtered.map((s) => (
                    <StudentCard key={s.id} student={s}
                      onSelect={(st) => setSelected(st.id === selected?.id ? null : st)}
                      selected={selected?.id === s.id} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Detail panel */}
            <div className="w-80 shrink-0">
              <AnimatePresence>
                {selected && <DetailPanel key={selected.id} student={selected} onClose={() => setSelected(null)} />}
              </AnimatePresence>
              {!selected && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-slate-600">Click a student card to see full AI analysis</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------ Classes Tab ------ */}
        {activeTab === "classes" && (
          <div className="space-y-4">
            {CLASS_SUMMARIES.map((cls, i) => (
              <motion.div key={cls.class} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Class {cls.class}</h3>
                    <p className="text-[11px] text-slate-500">{cls.totalStudents} students</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold font-mono" style={{ color: SCORE_COLOR(cls.avgScore) }}>{cls.avgScore}%</p>
                    <p className="text-[11px] text-slate-500">avg readiness</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${cls.avgScore}%` }} transition={{ duration: 1 }}
                    className="h-full rounded-full" style={{ background: SCORE_COLOR(cls.avgScore) }} />
                </div>

                {/* Risk breakdown */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Safe", value: cls.safe, style: "text-emerald-400" },
                    { label: "Watch", value: cls.watch, style: "text-amber-400" },
                    { label: "Danger", value: cls.danger, style: "text-orange-400" },
                    { label: "Critical", value: cls.critical, style: "text-red-400" },
                  ].map((r) => (
                    <div key={r.label} className="text-center p-2 rounded-xl bg-white/[0.02] border border-white/6">
                      <p className={`text-lg font-bold font-mono ${r.style}`}>{r.value}</p>
                      <p className="text-[10px] text-slate-600">{r.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ------ Insights Tab ------ */}
        {activeTab === "insights" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-5">🏆 Top Performers</h3>
              <div className="space-y-3">
                {[...students].sort((a, b) => b.readinessScore - a.readinessScore).slice(0, 3).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6">
                    <span className="text-lg">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-500">Class {s.class}-{s.section}</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-emerald-400">{s.readinessScore}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-5">🚨 Needs Urgent Attention</h3>
              <div className="space-y-3">
                {[...students].filter(s => s.riskLevel === "critical" || s.riskLevel === "danger").map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-400/5 border border-red-400/15">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${RISK_DOT[s.riskLevel]}`} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{s.name}</p>
                      <p className="text-[10px] text-slate-500">{s.weakAreas[0]} · {s.attendancePercent}% attendance</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-red-400">{s.readinessScore}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 lg:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-5">📚 Subject-wise Platform Average</h3>
              <div className="space-y-4">
                {["Mathematics", "Physics", "Chemistry", "English", "Urdu"].map((sub) => {
                  const avg = Math.round(students.reduce((s, st) => s + (st.subjects.find(x => x.name === sub)?.score ?? 0), 0) / students.length);
                  return (
                    <div key={sub} className="flex items-center gap-4">
                      <span className="text-[11px] text-slate-400 w-28">{sub}</span>
                      <div className="flex-1">
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${avg}%` }} transition={{ duration: 0.8 }}
                            className="h-full rounded-full" style={{ background: SCORE_COLOR(avg) }} />
                        </div>
                      </div>
                      <span className="text-[11px] font-mono w-10 text-right" style={{ color: SCORE_COLOR(avg) }}>{avg}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
