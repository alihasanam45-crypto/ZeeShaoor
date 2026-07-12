"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface Teacher {
  id: string;
  name: string;
  subject: string;
  color: string;
  totalPeriods: number;
  maxPeriods: number;
  available: boolean[];  // 5 days x availability
}

interface Period {
  id: string;
  teacherId: string | null;
  subject: string | null;
  room: string;
  conflict: boolean;
}

type TimetableGrid = Record<string, Period[]>; // class -> [Mon-Fri x 7 periods]

interface ConflictAlert {
  id: string;
  type: "double_booking" | "overload" | "room_clash";
  message: string;
  severity: "warning" | "error";
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const TEACHERS: Teacher[] = [
  { id: "t1", name: "Sir Ahmed Khan", subject: "Mathematics", color: "#22d3ee", totalPeriods: 24, maxPeriods: 28, available: [true, true, true, true, true] },
  { id: "t2", name: "Ma'am Fatima", subject: "Physics", color: "#a78bfa", totalPeriods: 20, maxPeriods: 25, available: [true, true, false, true, true] },
  { id: "t3", name: "Sir Hassan", subject: "Chemistry", color: "#34d399", totalPeriods: 18, maxPeriods: 25, available: [true, true, true, false, true] },
  { id: "t4", name: "Ma'am Sara", subject: "English", color: "#fbbf24", totalPeriods: 22, maxPeriods: 28, available: [true, true, true, true, false] },
  { id: "t5", name: "Sir Bilal", subject: "Urdu", color: "#f87171", totalPeriods: 16, maxPeriods: 20, available: [true, false, true, true, true] },
  { id: "t6", name: "Ma'am Zara", subject: "Biology", color: "#fb923c", totalPeriods: 19, maxPeriods: 25, available: [true, true, true, true, true] },
  { id: "t7", name: "Sir Omar", subject: "Computer Science", color: "#60a5fa", totalPeriods: 14, maxPeriods: 20, available: [true, true, true, true, true] },
  { id: "t8", name: "Ma'am Nadia", subject: "Islamiat", color: "#c084fc", totalPeriods: 12, maxPeriods: 15, available: [true, true, true, true, true] },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = ["P1\n08:00", "P2\n09:00", "P3\n10:00", "BREAK", "P4\n11:30", "P5\n12:30", "P6\n13:30"];
const CLASSES = ["10-A", "10-B", "10-C", "9-A", "9-B"];
const ROOMS = ["R-101", "R-102", "R-103", "Lab-1", "Lab-2", "Hall-A"];

const CONFLICTS: ConflictAlert[] = [
  { id: "c1", type: "double_booking", message: "Sir Ahmed Khan assigned to 10-A and 9-B simultaneously on Tuesday P3", severity: "error" },
  { id: "c2", type: "overload", message: "Ma'am Fatima has 26 periods this week — exceeds max limit of 25", severity: "warning" },
  { id: "c3", type: "room_clash", message: "Lab-1 double booked on Wednesday P5 for 10-A and 10-C", severity: "error" },
];

// --------- Generate mock timetable ------------------------------------------------------------------------------------------------------------------------------------------------------
function generateTimetable(): TimetableGrid {
  const grid: TimetableGrid = {};
  const teacherAssignments: Record<string, string[]> = {
    "t1": ["Mathematics", "#22d3ee"],
    "t2": ["Physics", "#a78bfa"],
    "t3": ["Chemistry", "#34d399"],
    "t4": ["English", "#fbbf24"],
    "t5": ["Urdu", "#f87171"],
    "t6": ["Biology", "#fb923c"],
    "t7": ["Computer Sc.", "#60a5fa"],
    "t8": ["Islamiat", "#c084fc"],
  };

  const teacherIds = Object.keys(teacherAssignments);

  CLASSES.forEach((cls) => {
    grid[cls] = [];
    DAYS.forEach((_, dayIdx) => {
      PERIODS.forEach((period, pIdx) => {
        if (period === "BREAK") {
          grid[cls].push({ id: `${cls}-${dayIdx}-${pIdx}`, teacherId: null, subject: "BREAK", room: "", conflict: false });
        } else {
          const tIdx = (dayIdx * 7 + pIdx + CLASSES.indexOf(cls)) % teacherIds.length;
          const tid = teacherIds[tIdx];
          const isConflict = (cls === "10-A" && dayIdx === 1 && pIdx === 2) || (cls === "10-A" && dayIdx === 2 && pIdx === 5);
          grid[cls].push({
            id: `${cls}-${dayIdx}-${pIdx}`,
            teacherId: tid,
            subject: teacherAssignments[tid][0],
            room: ROOMS[tIdx % ROOMS.length],
            conflict: isConflict,
          });
        }
      });
    });
  });
  return grid;
}

const TIMETABLE = generateTimetable();

// --------- Teacher Load Bar ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function TeacherLoadBar({ teacher }: { teacher: Teacher }) {
  const pct = Math.round((teacher.totalPeriods / teacher.maxPeriods) * 100);
  const color = pct >= 90 ? "#f87171" : pct >= 75 ? "#fbbf24" : "#34d399";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/6 hover:border-white/10 transition-colors"
    >
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: teacher.color, boxShadow: `0 0 6px ${teacher.color}` }} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <p className="text-[11px] font-semibold text-white truncate">{teacher.name}</p>
          <span className="text-[10px] font-mono ml-2" style={{ color }}>{teacher.totalPeriods}/{teacher.maxPeriods}</span>
        </div>
        <p className="text-[10px] text-slate-600 mb-1.5">{teacher.subject}</p>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
      </div>
      {/* Availability dots */}
      <div className="flex gap-0.5 shrink-0">
        {teacher.available.map((avail, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full ${avail ? "bg-emerald-400" : "bg-red-400/50"}`} title={DAYS[i].slice(0, 3)} />
        ))}
      </div>
    </motion.div>
  );
}

// --------- Timetable Cell ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function TimetableCell({ period, teachers, onClick, selected }: {
  period: Period;
  teachers: Teacher[];
  onClick: () => void;
  selected: boolean;
}) {
  if (period.subject === "BREAK") {
    return (
      <div className="h-14 flex items-center justify-center text-[9px] text-slate-700 font-medium bg-white/[0.01] border border-white/4 rounded-lg">
        BREAK
      </div>
    );
  }

  const teacher = teachers.find(t => t.id === period.teacherId);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`h-14 rounded-lg border cursor-pointer transition-all duration-200 p-1.5 relative overflow-hidden
        ${period.conflict
          ? "border-red-400/50 bg-red-400/10 shadow-[0_0_8px_rgba(248,113,113,0.2)]"
          : selected
          ? "border-cyan-400/50 bg-cyan-400/8"
          : "border-white/6 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
        }`}
    >
      {teacher && (
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg" style={{ background: teacher.color }} />
      )}
      {period.conflict && (
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-red-400 flex items-center justify-center">
          <span className="text-[7px] text-white font-bold">!</span>
        </div>
      )}
      <p className="text-[9px] font-semibold text-white truncate pl-1">{period.subject}</p>
      <p className="text-[8px] text-slate-500 truncate pl-1">{period.room}</p>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function TimetablePage() {
  const [activeTab, setActiveTab] = useState<"grid" | "teachers" | "conflicts" | "ai">("grid");
  const [selectedClass, setSelectedClass] = useState("10-A");
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [viewMode, setViewMode] = useState<"class" | "teacher">("class");
  const [selectedTeacher, setSelectedTeacher] = useState("t1");

  const handleAiOptimize = () => {
    setAiRunning(true);
    setAiDone(false);
    setTimeout(() => {
      setAiRunning(false);
      setAiDone(true);
    }, 3500);
  };

  const grid = TIMETABLE[selectedClass] || [];
  const conflictCount = CONFLICTS.filter(c => c.severity === "error").length;
  const totalPeriods = TEACHERS.reduce((s, t) => s + t.totalPeriods, 0);
  const overloadedCount = TEACHERS.filter(t => t.totalPeriods / t.maxPeriods >= 0.9).length;

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      {/* Orbs */}
      <div className="absolute top-[-180px] left-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-400/20 border border-cyan-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.Pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Staff Timetable AI</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">AI-powered schedule optimization, conflict detection & teacher load balancing</p>
          </div>

          <div className="flex items-center gap-3">
            {conflictCount > 0 && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/10 border border-red-400/25">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-semibold text-red-400">{conflictCount} conflicts</span>
              </div>
            )}
            <motion.button
              onClick={handleAiOptimize}
              disabled={aiRunning}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300
                ${aiDone
                  ? "bg-emerald-400/15 border-emerald-400/40 text-emerald-400"
                  : aiRunning
                  ? "bg-cyan-400/10 border-cyan-400/25 text-cyan-400 cursor-wait"
                  : "bg-cyan-400/15 border-cyan-400/40 text-cyan-400 hover:bg-cyan-400/25"
                }`}
            >
              {aiRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  Optimizing...
                </>
              ) : aiDone ? (
                <>✓ Optimized!</>
              ) : (
                <>🤖 AI Optimize</>
              )}
            </motion.button>
          </div>
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Teachers", value: String(TEACHERS.length), icon: "👨‍🏫", color: "text-cyan-400", sub: `${TEACHERS.filter(t => t.available[0]).length} available today` },
            { label: "Weekly Periods", value: String(totalPeriods), icon: "📅", color: "text-violet-400", sub: "across all teachers" },
            { label: "Conflicts Found", value: String(CONFLICTS.length), icon: "⚠️", color: "text-red-400", sub: `${conflictCount} critical` },
            { label: "Overloaded", value: String(overloadedCount), icon: "🔴", color: "text-amber-400", sub: "teachers near limit" },
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
          {(["grid", "teachers", "conflicts", "ai"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab ? "bg-cyan-500/20 text-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.15)]" : "text-slate-500 hover:text-slate-300"}`}>
              {tab === "grid" ? "📋 Timetable Grid" : tab === "teachers" ? "👨‍🏫 Teacher Load" : tab === "conflicts" ? `⚠️ Conflicts (${CONFLICTS.length})` : "🤖 AI Suggestions"}
            </button>
          ))}
        </div>

        {/* ------ Grid Tab ------ */}
        {activeTab === "grid" && (
          <div className="space-y-5">
            {/* Class selector + view toggle */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {CLASSES.map((cls) => (
                  <button key={cls} onClick={() => setSelectedClass(cls)}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-semibold border transition-all
                      ${selectedClass === cls ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                    Class {cls}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-red-400" /> Conflict</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-sm bg-cyan-400" /> Selected</div>
              </div>
            </div>

            {/* Grid */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-white/6">
                      <th className="p-3 text-left">
                        <span className="text-[10px] text-slate-600 font-medium">Period / Day</span>
                      </th>
                      {DAYS.map((day) => (
                        <th key={day} className="p-3 text-center">
                          <span className="text-[11px] text-slate-400 font-semibold">{day.slice(0, 3)}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map((period, pIdx) => (
                      <tr key={pIdx} className="border-b border-white/[0.04]">
                        <td className="p-2 w-20">
                          {period === "BREAK" ? (
                            <span className="text-[9px] text-slate-700 font-medium">BREAK</span>
                          ) : (
                            <div>
                              <p className="text-[10px] font-bold text-slate-400">{period.split("\n")[0]}</p>
                              <p className="text-[9px] text-slate-600">{period.split("\n")[1]}</p>
                            </div>
                          )}
                        </td>
                        {DAYS.map((_, dayIdx) => {
                          const cellIdx = dayIdx * PERIODS.length + pIdx;
                          const cell = grid[cellIdx];
                          if (!cell) return <td key={dayIdx} className="p-1.5" />;
                          return (
                            <td key={dayIdx} className="p-1.5">
                              <TimetableCell
                                period={cell}
                                teachers={TEACHERS}
                                onClick={() => setSelectedCell(selectedCell === cell.id ? null : cell.id)}
                                selected={selectedCell === cell.id}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3">
              {TEACHERS.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: t.color }} />
                  <span className="text-[10px] text-slate-500">{t.subject}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------ Teachers Tab ------ */}
        {activeTab === "teachers" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white mb-4">Teacher Workload Overview</h3>
              {TEACHERS.map((t) => <TeacherLoadBar key={t.id} teacher={t} />)}
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-5">Weekly Availability Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left pb-3 text-[10px] text-slate-600 font-medium">Teacher</th>
                      {DAYS.map(d => (
                        <th key={d} className="text-center pb-3 text-[10px] text-slate-600 font-medium">{d.slice(0, 3)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {TEACHERS.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
                            <span className="text-[11px] text-slate-300 whitespace-nowrap">{t.name.split(" ").slice(-1)[0]}</span>
                          </div>
                        </td>
                        {t.available.map((avail, i) => (
                          <td key={i} className="py-2.5 text-center">
                            <div className={`w-5 h-5 rounded-md mx-auto flex items-center justify-center text-[9px]
                              ${avail ? "bg-emerald-400/20 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
                              {avail ? "✓" : "✗"}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------ Conflicts Tab ------ */}
        {activeTab === "conflicts" && (
          <div className="space-y-4">
            {CONFLICTS.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`rounded-2xl border p-5 flex items-start gap-4
                  ${c.severity === "error"
                    ? "border-red-400/30 bg-red-400/5"
                    : "border-amber-400/30 bg-amber-400/5"
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm
                  ${c.severity === "error" ? "bg-red-400/15 text-red-400" : "bg-amber-400/15 text-amber-400"}`}>
                  {c.severity === "error" ? "🚨" : "⚠️"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium
                      ${c.severity === "error" ? "text-red-400 border-red-400/30 bg-red-400/10" : "text-amber-400 border-amber-400/30 bg-amber-400/10"}`}>
                      {c.type.replace("_", " ")}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${c.severity === "error" ? "text-red-400" : "text-amber-400"}`}>
                      {c.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.message}</p>
                </div>
                <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 border border-cyan-400/25 px-2.5 py-1 rounded-lg">
                  Auto-Fix
                </button>
              </motion.div>
            ))}

            {CONFLICTS.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-slate-400 text-sm">No conflicts detected!</p>
              </div>
            )}
          </div>
        )}

        {/* ------ AI Tab ------ */}
        {activeTab === "ai" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI suggestions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">🤖 AI Optimization Suggestions</h3>
              {[
                { icon: "🔄", title: "Swap Ahmed & Hassan on Tuesday", desc: "Resolves double-booking conflict in 10-A. Confidence: 94%", impact: "high", action: "Apply Swap" },
                { icon: "📉", title: "Reduce Fatima's load by 1 period", desc: "Move Wednesday P4 to Ma'am Zara — she has 6 free slots. Confidence: 88%", impact: "medium", action: "Reassign" },
                { icon: "🏫", title: "Move Lab-1 session to Lab-2", desc: "Eliminates room clash on Wednesday P5. Both labs have same equipment. Confidence: 99%", impact: "high", action: "Change Room" },
                { icon: "⚡", title: "Consolidate Sir Bilal's free periods", desc: "Currently fragmented across week. Grouping saves 2 transition periods. Confidence: 76%", impact: "low", action: "Optimize" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-2xl border border-white/8 bg-white/[0.025] flex items-start gap-3">
                  <span className="text-xl shrink-0">{s.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-semibold text-white">{s.title}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full border
                        ${s.impact === "high" ? "text-red-400 border-red-400/30 bg-red-400/10" :
                          s.impact === "medium" ? "text-amber-400 border-amber-400/30 bg-amber-400/10" :
                            "text-slate-400 border-slate-400/30 bg-slate-400/10"}`}>
                        {s.impact}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">{s.desc}</p>
                  </div>
                  <button className="text-[10px] text-cyan-400 border border-cyan-400/25 px-2.5 py-1 rounded-lg hover:bg-cyan-400/10 transition-colors shrink-0">
                    {s.action}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* AI Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">📊 Schedule Health Score</h3>
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
                {/* Big score */}
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold font-mono text-amber-400 mb-1">73</div>
                  <p className="text-sm text-slate-500">/ 100 Schedule Health</p>
                  <div className="mt-3 h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "73%" }} transition={{ duration: 1 }}
                      className="h-full rounded-full bg-amber-400" />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: "Conflict Resolution", score: 45, color: "#f87171" },
                    { label: "Load Distribution", score: 78, color: "#fbbf24" },
                    { label: "Room Utilization", score: 82, color: "#34d399" },
                    { label: "Teacher Availability", score: 91, color: "#22d3ee" },
                    { label: "Period Distribution", score: 69, color: "#a78bfa" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500">{m.label}</span>
                        <span className="font-mono" style={{ color: m.color }}>{m.score}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${m.score}%` }} transition={{ duration: 0.8 }}
                          className="h-full rounded-full" style={{ background: m.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-white/6">
                  <p className="text-[11px] text-slate-500 text-center">After AI optimization: estimated score <span className="text-emerald-400 font-bold">91/100</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
