"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --------- Types ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface BroadcastTemplate {
  id: string;
  name: string;
  category: "emergency" | "academic" | "event" | "fee" | "holiday";
  subject: string;
  body: string;
  icon: string;
}

interface SentBroadcast {
  id: string;
  subject: string;
  category: string;
  sentTo: string[];
  sentAt: string;
  reach: number;
  openRate: number;
  status: "delivered" | "partial" | "failed";
}

interface RecipientGroup {
  id: string;
  label: string;
  count: number;
  color: string;
  selected: boolean;
}

// --------- Mock Data ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const TEMPLATES: BroadcastTemplate[] = [
  {
    id: "t1", name: "School Closure", category: "emergency",
    icon: "🚨",
    subject: "URGENT: School Closed Tomorrow",
    body: "Dear Parents,\n\nDue to unforeseen circumstances, ZeeShaoor School will remain CLOSED tomorrow. All classes and activities are cancelled.\n\nStudents are advised to stay home and continue self-study. Further updates will be shared shortly.\n\nThank you for your cooperation.\n\nZeeShaoor Administration",
  },
  {
    id: "t2", name: "Exam Schedule", category: "academic",
    icon: "📋",
    subject: "Final Exam Schedule — Please Read Carefully",
    body: "Dear Students & Parents,\n\nThe final examination schedule has been announced. Please ensure your ward is well-prepared.\n\nExams begin on [DATE]. Students must bring their admit cards and arrive 30 minutes early.\n\nBest of luck!\n\nZeeShaoor Academic Team",
  },
  {
    id: "t3", name: "Fee Reminder", category: "fee",
    icon: "💳",
    subject: "Fee Payment Reminder — Due Date Approaching",
    body: "Dear Parents,\n\nThis is a gentle reminder that the monthly fee is due by [DATE].\n\nKindly ensure timely payment to avoid any inconvenience. Payments can be made via the portal or at the school office.\n\nFor queries, contact accounts@zeeshaoor.pk\n\nZeeShaoor Accounts Team",
  },
  {
    id: "t4", name: "Holiday Notice", category: "holiday",
    icon: "🎉",
    subject: "Public Holiday — School Closed",
    body: "Dear Parents & Students,\n\nPlease be informed that the school will remain closed on [DATE] on account of [HOLIDAY NAME].\n\nClasses will resume normally on [NEXT DATE].\n\nWishing everyone a wonderful holiday!\n\nZeeShaoor Administration",
  },
  {
    id: "t5", name: "Emergency Drill", category: "emergency",
    icon: "🔔",
    subject: "Fire Drill Notice — Tomorrow",
    body: "Dear All,\n\nA fire safety drill will be conducted tomorrow at [TIME]. All students and staff must participate.\n\nPlease follow instructions from your class teacher calmly and quickly.\n\nSafety is our priority.\n\nZeeShaoor Safety Team",
  },
  {
    id: "t6", name: "Annual Event", category: "event",
    icon: "🌟",
    subject: "Annual Day Celebration — You're Invited!",
    body: "Dear Parents & Guardians,\n\nWe are delighted to invite you to ZeeShaoor's Annual Day celebration on [DATE] at [TIME].\n\nVenue: School Auditorium\n\nYour presence will mean the world to our students. Kindly confirm attendance.\n\nWarm regards,\nZeeShaoor Management",
  },
];

const SENT_BROADCASTS: SentBroadcast[] = [
  { id: "b1", subject: "Eid Holiday Notice", category: "holiday", sentTo: ["All Students", "All Parents"], sentAt: "2 days ago", reach: 1247, openRate: 89, status: "delivered" },
  { id: "b2", subject: "Mid-Term Exam Schedule", category: "academic", sentTo: ["Grade 9", "Grade 10", "Grade 11"], sentAt: "1 week ago", reach: 634, openRate: 94, status: "delivered" },
  { id: "b3", subject: "Fee Due Reminder", category: "fee", sentTo: ["All Parents"], sentAt: "1 week ago", reach: 892, openRate: 71, status: "partial" },
  { id: "b4", subject: "Emergency: Water Supply Issue", category: "emergency", sentTo: ["All Staff", "All Parents"], sentAt: "2 weeks ago", reach: 1103, openRate: 97, status: "delivered" },
  { id: "b5", subject: "Sports Day Registration", category: "event", sentTo: ["All Students"], sentAt: "3 weeks ago", reach: 412, openRate: 68, status: "delivered" },
];

const INITIAL_GROUPS: RecipientGroup[] = [
  { id: "g1", label: "All Students", count: 847, color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/8", selected: false },
  { id: "g2", label: "All Parents", count: 892, color: "text-violet-400 border-violet-400/30 bg-violet-400/8", selected: false },
  { id: "g3", label: "All Teachers", count: 64, color: "text-amber-400 border-amber-400/30 bg-amber-400/8", selected: false },
  { id: "g4", label: "All Staff", count: 112, color: "text-emerald-400 border-emerald-400/30 bg-emerald-400/8", selected: false },
  { id: "g5", label: "Grade 9", count: 180, color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/8", selected: false },
  { id: "g6", label: "Grade 10", count: 210, color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/8", selected: false },
  { id: "g7", label: "Grade 11", count: 195, color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/8", selected: false },
  { id: "g8", label: "Grade 12", count: 162, color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/8", selected: false },
];

const CATEGORY_STYLE: Record<string, string> = {
  emergency: "text-red-400 bg-red-400/10 border-red-400/25",
  academic: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  event: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  fee: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  holiday: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
};

const CHANNELS = [
  { id: "sms", label: "SMS", icon: "📱", desc: "Direct to phone" },
  { id: "email", label: "Email", icon: "📧", desc: "Full message" },
  { id: "push", label: "Push Notification", icon: "🔔", desc: "App notification" },
  { id: "portal", label: "Portal Banner", icon: "🖥️", desc: "In-app alert" },
];

// --------- Confirm Send Modal ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ConfirmSendModal({
  subject,
  recipientCount,
  channels,
  onConfirm,
  onCancel,
}: {
  subject: string;
  recipientCount: number;
  channels: string[];
  onConfirm: () => void;
  onCancel: () => void;
}) {
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
        className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#020817] p-6 shadow-[0_0_60px_rgba(251,191,36,0.12)]"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-xl">
            📡
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Confirm Broadcast</h3>
            <p className="text-[11px] text-slate-500">This will send to {recipientCount.toLocaleString()} recipients</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/8 mb-5 space-y-3">
          <div>
            <p className="text-[10px] text-slate-600 mb-0.5">Subject</p>
            <p className="text-sm font-medium text-white">{subject}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600 mb-1">Channels</p>
            <div className="flex gap-2 flex-wrap">
              {channels.map((ch) => (
                <span key={ch} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-400">{ch}</span>
              ))}
            </div>
          </div>
          <div className="pt-2 border-t border-white/6">
            <p className="text-[10px] text-slate-600">Total Reach</p>
            <p className="text-xl font-bold text-amber-400 font-mono">{recipientCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-400 hover:bg-white/8 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-sm font-semibold text-amber-400 hover:bg-amber-400/30 transition-colors">
            Send Broadcast
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --------- Success Toast ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function SuccessToast({ count, onClose }: { count: number; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-400/15 border border-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.2)]"
    >
      <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
        <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <p className="text-sm font-medium text-emerald-400">
        Broadcast sent to <span className="font-bold">{count.toLocaleString()}</span> recipients!
      </p>
    </motion.div>
  );
}

// --------- Main Page ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function BroadcastPage() {
  const [activeTab, setActiveTab] = useState<"compose" | "history" | "templates">("compose");
  const [groups, setGroups] = useState<RecipientGroup[]>(INITIAL_GROUPS);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["sms", "push"]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [priority, setPriority] = useState<"normal" | "urgent" | "critical">("normal");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const toggleGroup = (id: string) =>
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, selected: !g.selected } : g));

  const toggleChannel = (id: string) =>
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );

  const applyTemplate = (t: BroadcastTemplate) => {
    setSubject(t.subject);
    setBody(t.body);
    setCharCount(t.body.length);
    setSelectedTemplate(t.id);
    setActiveTab("compose");
  };

  const totalRecipients = groups.filter((g) => g.selected).reduce((s, g) => s + g.count, 0);
  const selectedGroupLabels = groups.filter((g) => g.selected).map((g) => g.label);
  const canSend = subject.trim() && body.trim() && totalRecipients > 0 && selectedChannels.length > 0;

  const handleSend = () => {
    setShowConfirm(false);
    setShowSuccess(true);
    setSubject("");
    setBody("");
    setCharCount(0);
    setGroups((prev) => prev.map((g) => ({ ...g, selected: false })));
    setSelectedTemplate(null);
  };

  const PRIORITY_STYLE = {
    normal: "border-white/10 text-slate-400",
    urgent: "border-amber-400/40 text-amber-400 bg-amber-400/8",
    critical: "border-red-400/40 text-red-400 bg-red-400/8",
  };

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      {/* Grid texture */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Ambient orbs */}
      <div className="absolute top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)" }} />

      {/* Modals */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmSendModal
            subject={subject}
            recipientCount={totalRecipients}
            channels={selectedChannels}
            onConfirm={handleSend}
            onCancel={() => setShowConfirm(false)}
          />
        )}
        {showSuccess && <SuccessToast count={totalRecipients} onClose={() => setShowSuccess(false)} />}
      </AnimatePresence>

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* ------ Header ------ */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-red-400/20 border border-amber-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Emergency Broadcast</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">Send instant alerts to students, parents & staff across all channels</p>
          </div>

          {/* Priority selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Priority:</span>
            {(["normal", "urgent", "critical"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize border transition-all duration-200
                  ${priority === p ? PRIORITY_STYLE[p] : "border-white/8 text-slate-600 hover:text-slate-400"}`}
              >
                {p === "critical" ? "🔴" : p === "urgent" ? "🟡" : "🟢"} {p}
              </button>
            ))}
          </div>
        </div>

        {/* ------ KPI Strip ------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Recipients", value: "1,915", icon: "👥", color: "text-cyan-400", sub: "students + parents + staff" },
            { label: "Broadcasts Sent", value: "47", icon: "📡", color: "text-amber-400", sub: "this month" },
            { label: "Avg Open Rate", value: "83%", icon: "📬", color: "text-emerald-400", sub: "across all channels" },
            { label: "Active Channels", value: "4", icon: "🔗", color: "text-violet-400", sub: "SMS, Email, Push, Portal" },
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
          {(["compose", "templates", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                ${activeTab === tab
                  ? "bg-amber-400/20 text-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.15)]"
                  : "text-slate-500 hover:text-slate-300"
                }`}
            >
              {tab === "compose" ? "✍️ Compose" : tab === "templates" ? "📋 Templates" : "📜 History"}
            </button>
          ))}
        </div>

        {/* ------ Compose Tab ------ */}
        {activeTab === "compose" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Left: Compose form */}
            <div className="xl:col-span-2 space-y-5">

              {/* Subject */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <label className="text-[11px] text-slate-400 mb-2 block font-medium">Subject Line</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter broadcast subject..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-400/40 transition-colors"
                />
              </div>

              {/* Body */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-slate-400 font-medium">Message Body</label>
                  <span className={`text-[10px] font-mono ${charCount > 800 ? "text-amber-400" : "text-slate-600"}`}>
                    {charCount} chars
                  </span>
                </div>
                <textarea
                  value={body}
                  onChange={(e) => { setBody(e.target.value); setCharCount(e.target.value.length); }}
                  placeholder="Write your broadcast message here..."
                  rows={10}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-400/40 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Channels */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <label className="text-[11px] text-slate-400 mb-3 block font-medium">Delivery Channels</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CHANNELS.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => toggleChannel(ch.id)}
                      className={`p-3 rounded-xl border text-left transition-all duration-200
                        ${selectedChannels.includes(ch.id)
                          ? "border-amber-400/40 bg-amber-400/8"
                          : "border-white/8 bg-white/[0.02] hover:border-white/15"
                        }`}
                    >
                      <p className="text-lg mb-1">{ch.icon}</p>
                      <p className={`text-[11px] font-semibold ${selectedChannels.includes(ch.id) ? "text-amber-400" : "text-slate-400"}`}>{ch.label}</p>
                      <p className="text-[10px] text-slate-600">{ch.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Recipients + Send */}
            <div className="space-y-5">

              {/* Recipients */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[11px] text-slate-400 font-medium">Recipients</label>
                  <button
                    onClick={() => setGroups((prev) => prev.map((g) => ({ ...g, selected: true })))}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Select All
                  </button>
                </div>
                <div className="space-y-2">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => toggleGroup(g.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-200
                        ${g.selected ? g.color : "border-white/8 bg-white/[0.02] hover:border-white/15"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all
                          ${g.selected ? "bg-current border-current" : "border-slate-600"}`}>
                          {g.selected && (
                            <svg className="w-2 h-2 text-[#020817]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[11px] font-medium ${g.selected ? "" : "text-slate-400"}`}>{g.label}</span>
                      </div>
                      <span className={`text-[10px] font-mono ${g.selected ? "" : "text-slate-600"}`}>{g.count.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reach summary */}
              <div className={`rounded-2xl border p-5 transition-all duration-300
                ${totalRecipients > 0 ? "border-amber-400/25 bg-amber-400/5" : "border-white/8 bg-white/[0.02]"}`}>
                <p className="text-[11px] text-slate-500 mb-1">Total Reach</p>
                <p className={`text-3xl font-bold font-mono ${totalRecipients > 0 ? "text-amber-400" : "text-slate-700"}`}>
                  {totalRecipients.toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-600 mt-1">
                  {selectedGroupLabels.length > 0 ? selectedGroupLabels.join(", ") : "No groups selected"}
                </p>
              </div>

              {/* Send button */}
              <motion.button
                onClick={() => canSend && setShowConfirm(true)}
                whileHover={canSend ? { scale: 1.02 } : {}}
                whileTap={canSend ? { scale: 0.98 } : {}}
                className={`w-full py-4 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300
                  ${canSend
                    ? priority === "critical"
                      ? "bg-red-500/20 border border-red-400/40 text-red-400 shadow-[0_0_24px_rgba(239,68,68,0.2)] hover:shadow-[0_0_32px_rgba(239,68,68,0.3)]"
                      : priority === "urgent"
                      ? "bg-amber-400/20 border border-amber-400/40 text-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.2)] hover:shadow-[0_0_32px_rgba(251,191,36,0.3)]"
                      : "bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 shadow-[0_0_24px_rgba(34,211,238,0.15)]"
                    : "bg-white/[0.02] border border-white/8 text-slate-700 cursor-not-allowed"
                  }`}
              >
                {canSend ? `📡 Send ${priority === "critical" ? "CRITICAL" : priority === "urgent" ? "URGENT" : ""} Broadcast` : "Complete all fields to send"}
              </motion.button>

              {!canSend && (
                <div className="space-y-1.5">
                  {!subject && <p className="text-[10px] text-slate-700 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-700" />Subject required</p>}
                  {!body && <p className="text-[10px] text-slate-700 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-700" />Message body required</p>}
                  {totalRecipients === 0 && <p className="text-[10px] text-slate-700 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-700" />Select at least one recipient group</p>}
                  {selectedChannels.length === 0 && <p className="text-[10px] text-slate-700 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-slate-700" />Select at least one channel</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ------ Templates Tab ------ */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {TEMPLATES.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 hover:border-white/15 hover:bg-white/[0.05] transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{t.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CATEGORY_STYLE[t.category]}`}>
                        {t.category}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mb-1">{t.subject}</p>
                <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed">{t.body}</p>
                <button
                  onClick={() => applyTemplate(t)}
                  className="mt-4 w-full py-2 rounded-xl bg-amber-400/10 border border-amber-400/25 text-amber-400 text-[11px] font-semibold hover:bg-amber-400/20 transition-all duration-200"
                >
                  Use Template →
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* ------ History Tab ------ */}
        {activeTab === "history" && (
          <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
            <div className="p-5 border-b border-white/6 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Broadcast History</h3>
              <button className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors">Export CSV →</button>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {SENT_BROADCASTS.map((b, i) => (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className={`w-16 text-center text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0
                    ${b.status === "delivered" ? "bg-emerald-400/10 text-emerald-400" :
                      b.status === "partial" ? "bg-amber-400/10 text-amber-400" :
                        "bg-red-400/10 text-red-400"}`}>
                    {b.status}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 font-medium truncate">{b.subject}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{b.sentTo.join(", ")}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${CATEGORY_STYLE[b.category]}`}>{b.category}</span>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-mono text-cyan-400">{b.reach.toLocaleString()} sent</p>
                    <p className="text-[10px] text-emerald-400">{b.openRate}% opened</p>
                  </div>
                  <span className="text-[11px] text-slate-600 shrink-0 w-24 text-right">{b.sentAt}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}