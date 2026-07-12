"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  category: "exam" | "holiday" | "event" | "meeting" | "deadline" | "activity";
  description: string;
  affectedClasses: string[];
  isRecurring: boolean;
  priority: "high" | "medium" | "low";
  status: "upcoming" | "ongoing" | "completed";
  icon: string;
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const EVENTS: CalendarEvent[] = [
  { id: "ev1", title: "Final Term Exams Begin", date: "2025-03-10", endDate: "2025-03-21", category: "exam", description: "Final term examinations for all classes Grade 9-12", affectedClasses: ["9-A","9-B","10-A","10-B","11-A","11-B"], isRecurring: false, priority: "high", status: "upcoming", icon: "📝" },
  { id: "ev2", title: "Pakistan Day Holiday", date: "2025-03-23", category: "holiday", description: "National holiday — school closed", affectedClasses: ["All"], isRecurring: true, priority: "medium", status: "upcoming", icon: "🇵🇰" },
  { id: "ev3", title: "Science Fair 2025", date: "2025-03-05", category: "event", description: "Annual inter-school science fair and project exhibition", affectedClasses: ["9-A","9-B","10-A"], isRecurring: true, priority: "high", status: "upcoming", icon: "🔬" },
  { id: "ev4", title: "Parent-Teacher Meeting", date: "2025-02-28", category: "meeting", description: "Semester progress meeting with parents of Grade 10", affectedClasses: ["10-A","10-B"], isRecurring: false, priority: "high", status: "upcoming", icon: "👥" },
  { id: "ev5", title: "Fee Submission Deadline", date: "2025-03-07", category: "deadline", description: "Last date for March month fee submission", affectedClasses: ["All"], isRecurring: true, priority: "high", status: "upcoming", icon: "💳" },
  { id: "ev6", title: "Sports Day", date: "2025-03-15", category: "activity", description: "Annual sports day and athletics competition", affectedClasses: ["All"], isRecurring: true, priority: "medium", status: "upcoming", icon: "🏃" },
  { id: "ev7", title: "Mid-Term Results", date: "2025-02-20", category: "exam", description: "Distribution of mid-term result cards", affectedClasses: ["All"], isRecurring: false, priority: "medium", status: "completed", icon: "📊" },
  { id: "ev8", title: "Eid ul-Fitr Break", date: "2025-03-30", endDate: "2025-04-04", category: "holiday", description: "Eid holidays — school closed", affectedClasses: ["All"], isRecurring: true, priority: "high", status: "upcoming", icon: "🌙" },
  { id: "ev9", title: "Board Exam Preparation Camp", date: "2025-03-01", endDate: "2025-03-08", category: "activity", description: "Intensive revision camp for Grade 10 board students", affectedClasses: ["10-A","10-B"], isRecurring: false, priority: "high", status: "upcoming", icon: "📚" },
  { id: "ev10", title: "Annual Day Celebration", date: "2025-04-10", category: "event", description: "ZeeShaoor Annual Day — awards and performances", affectedClasses: ["All"], isRecurring: true, priority: "high", status: "upcoming", icon: "🌟" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_OF_WEEK = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const CATEGORY_STYLE: Record<string, string> = {
  exam: "text-red-400 bg-red-400/10 border-red-400/25",
  holiday: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  event: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  meeting: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  deadline: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  activity: "text-pink-400 bg-pink-400/10 border-pink-400/25",
};

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-slate-500",
};

// --------- Calendar Grid ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function CalendarGrid({ events, year, month }: { events: CalendarEvent[]; year: number; month: number }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getEventsForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr || (e.endDate && dateStr >= e.date && dateStr <= e.endDate));
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
      {/* Month header */}
      <div className="flex items-center justify-between p-5 border-b border-white/6">
        <h3 className="text-base font-bold text-white">{MONTHS[month]} {year}</h3>
        <div className="flex gap-2">
          {Object.entries(CATEGORY_STYLE).slice(0, 4).map(([cat, style]) => (
            <span key={cat} className={`text-[9px] px-1.5 py-0.5 rounded-full border capitalize ${style}`}>{cat}</span>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-white/5">
        {DAYS_OF_WEEK.map(d => (
          <div key={d} className="p-2 text-center text-[10px] font-medium text-slate-600">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isToday = day === 15; // mock today
          return (
            <div key={i} className={`min-h-16 p-1.5 border-r border-b border-white/[0.04] last:border-r-0 transition-colors
              ${day ? "hover:bg-white/[0.02] cursor-pointer" : ""}`}>
              {day && (
                <>
                  <span className={`text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full mb-1
                    ${isToday ? "bg-cyan-400 text-[#020817] font-bold" : "text-slate-500"}`}>
                    {day}
                  </span>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} className={`text-[9px] px-1 py-0.5 rounded truncate font-medium
                        ${ev.category === "exam" ? "bg-red-400/20 text-red-400" :
                          ev.category === "holiday" ? "bg-emerald-400/20 text-emerald-400" :
                          ev.category === "event" ? "bg-violet-400/20 text-violet-400" :
                          ev.category === "deadline" ? "bg-amber-400/20 text-amber-400" :
                          ev.category === "meeting" ? "bg-cyan-400/20 text-cyan-400" :
                          "bg-pink-400/20 text-pink-400"}`}>
                        {ev.icon} {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-600 px-1">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --------- Event Card ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-2xl border border-white/8 bg-white/[0.03] hover:border-white/15 transition-all duration-200">
      <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0">
        {event.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-[11px] font-bold text-white">{event.title}</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">{event.date}{event.endDate ? ` → ${event.endDate}` : ""}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[event.priority]}`} />
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CATEGORY_STYLE[event.category]}`}>{event.category}</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-1 leading-relaxed">{event.description}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {event.affectedClasses.slice(0, 4).map(c => (
            <span key={c} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-slate-500">{c}</span>
          ))}
          {event.affectedClasses.length > 4 && (
            <span className="text-[9px] text-slate-600">+{event.affectedClasses.length - 4}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function CalendarPage() {
  const [events] = useState<CalendarEvent[]>(EVENTS);
  const [activeTab, setActiveTab] = useState<"calendar" | "list" | "add">("calendar");
  const [filterCat, setFilterCat] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(2); // March
  const [currentYear] = useState(2025);
  const [newEvent, setNewEvent] = useState({ title: "", date: "", category: "event", description: "", priority: "medium" });
  const [saved, setSaved] = useState(false);

  const filtered = events.filter(e => filterCat === "all" || e.category === filterCat);
  const upcoming = events.filter(e => e.status === "upcoming").length;
  const exams = events.filter(e => e.category === "exam").length;
  const holidays = events.filter(e => e.category === "holiday").length;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-[-180px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400/20 to-pink-400/20 border border-violet-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Academic Calendar Manager</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">Manage exams, holidays, events & deadlines for the academic year</p>
          </div>
          <button onClick={() => setActiveTab("add")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/20 border border-violet-400/40 text-violet-400 text-sm font-semibold hover:bg-violet-500/30 transition-all">
            + Add Event
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Events", value: String(events.length), icon: "📅", color: "text-violet-400", sub: "this academic year" },
            { label: "Upcoming", value: String(upcoming), icon: "⏰", color: "text-cyan-400", sub: "in next 30 days" },
            { label: "Exam Dates", value: String(exams), icon: "📝", color: "text-red-400", sub: "scheduled" },
            { label: "Holidays", value: String(holidays), icon: "🎉", color: "text-emerald-400", sub: "this term" },
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

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-fit">
          {(["calendar", "list", "add"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab ? "bg-violet-500/20 text-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.15)]" : "text-slate-500 hover:text-slate-300"}`}>
              {tab === "calendar" ? "📅 Calendar" : tab === "list" ? "📋 Event List" : "➕ Add Event"}
            </button>
          ))}
        </div>

        {/* Calendar Tab */}
        {activeTab === "calendar" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-400">←</button>
              <span className="text-sm font-semibold text-white min-w-24 text-center">{MONTHS[currentMonth]} {currentYear}</span>
              <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-slate-400">→</button>
            </div>
            <CalendarGrid events={events} year={currentYear} month={currentMonth} />
          </div>
        )}

        {/* List Tab */}
        {activeTab === "list" && (
          <>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {["all", "exam", "holiday", "event", "meeting", "deadline", "activity"].map((cat) => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border capitalize transition-all
                    ${filterCat === cat ? "bg-violet-400/15 border-violet-400/40 text-violet-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                  {cat}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-slate-600">{filtered.length} events</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {filtered.sort((a, b) => a.date.localeCompare(b.date)).map(ev => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          </>
        )}

        {/* Add Event Tab */}
        {activeTab === "add" && (
          <div className="max-w-2xl space-y-5">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">New Calendar Event</h3>

              <div>
                <label className="text-[11px] text-slate-400 mb-1.5 block">Event Title</label>
                <input value={newEvent.title} onChange={e => setNewEvent(p => ({...p, title: e.target.value}))}
                  placeholder="e.g. Final Term Exams Begin"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-400/40 transition-colors" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1.5 block">Start Date</label>
                  <input type="date" value={newEvent.date} onChange={e => setNewEvent(p => ({...p, date: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400/40 transition-colors" />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1.5 block">Category</label>
                  <select value={newEvent.category} onChange={e => setNewEvent(p => ({...p, category: e.target.value}))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-violet-400/40">
                    <option value="exam">📝 Exam</option>
                    <option value="holiday">🎉 Holiday</option>
                    <option value="event">🌟 Event</option>
                    <option value="meeting">👥 Meeting</option>
                    <option value="deadline">💳 Deadline</option>
                    <option value="activity">🏃 Activity</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1.5 block">Priority</label>
                <div className="flex gap-2">
                  {["high", "medium", "low"].map(p => (
                    <button key={p} onClick={() => setNewEvent(prev => ({...prev, priority: p}))}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-medium border capitalize transition-all
                        ${newEvent.priority === p
                          ? p === "high" ? "bg-red-400/20 border-red-400/40 text-red-400"
                            : p === "medium" ? "bg-amber-400/20 border-amber-400/40 text-amber-400"
                            : "bg-slate-400/20 border-slate-400/40 text-slate-400"
                          : "bg-white/5 border-white/10 text-slate-600 hover:text-slate-400"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1.5 block">Description</label>
                <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({...p, description: e.target.value}))}
                  placeholder="Brief description of the event..."
                  rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-violet-400/40 transition-colors resize-none" />
              </div>

              <button onClick={handleSave}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300
                  ${saved ? "bg-emerald-400/20 border border-emerald-400/40 text-emerald-400" : "bg-violet-500/20 border border-violet-400/40 text-violet-400 hover:bg-violet-500/30"}`}>
                {saved ? "✅ Event Added!" : "Add to Calendar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
