"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ArchiveCollection {
  id: string;
  name: string;
  category: "students" | "academic" | "fees" | "staff" | "system";
  recordCount: number;
  sizeGB: number;
  yearRange: string;
  status: "active" | "archiving" | "archived" | "pending";
  lastArchived: string;
  icon: string;
  retentionYears: number;
}

const COLLECTIONS: ArchiveCollection[] = [
  { id: "a1", name: "Student Records 2020-2022", category: "students", recordCount: 2341, sizeGB: 1.2, yearRange: "2020-2022", status: "archived", lastArchived: "Jan 2023", icon: "🎓", retentionYears: 10 },
  { id: "a2", name: "Fee Ledger 2019-2021", category: "fees", recordCount: 8924, sizeGB: 0.8, yearRange: "2019-2021", status: "archived", lastArchived: "Mar 2022", icon: "💰", retentionYears: 7 },
  { id: "a3", name: "Exam Results 2018-2022", category: "academic", recordCount: 15632, sizeGB: 2.1, yearRange: "2018-2022", status: "archived", lastArchived: "Jun 2022", icon: "📝", retentionYears: 10 },
  { id: "a4", name: "Staff Records 2015-2020", category: "staff", recordCount: 412, sizeGB: 0.3, yearRange: "2015-2020", status: "pending", lastArchived: "Never", icon: "👩‍🏫", retentionYears: 10 },
  { id: "a5", name: "System Logs 2022", category: "system", recordCount: 892341, sizeGB: 4.7, yearRange: "2022", status: "pending", lastArchived: "Never", icon: "🖥️", retentionYears: 3 },
  { id: "a6", name: "Past Papers 2015-2020", category: "academic", recordCount: 1204, sizeGB: 3.8, yearRange: "2015-2020", status: "archived", lastArchived: "Aug 2021", icon: "📄", retentionYears: 15 },
  { id: "a7", name: "Attendance Logs 2019-2021", category: "academic", recordCount: 234891, sizeGB: 1.9, yearRange: "2019-2021", status: "pending", lastArchived: "Never", icon: "📅", retentionYears: 5 },
  { id: "a8", name: "Complaint Records 2020-2023", category: "system", recordCount: 892, sizeGB: 0.1, yearRange: "2020-2023", status: "archived", lastArchived: "Dec 2023", icon: "📬", retentionYears: 5 },
];

const CAT_STYLE: Record<string, string> = {
  students: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  academic: "text-violet-400 bg-violet-400/10 border-violet-400/25",
  fees: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  staff: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  system: "text-slate-400 bg-slate-400/10 border-slate-400/25",
};

const STATUS_STYLE: Record<string, string> = {
  archived: "text-emerald-400 bg-emerald-400/10 border-emerald-400/25",
  pending: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  archiving: "text-cyan-400 bg-cyan-400/10 border-cyan-400/25",
  active: "text-slate-400 bg-slate-400/10 border-slate-400/25",
};

export default function ArchivePage() {
  const [collections, setCollections] = useState<ArchiveCollection[]>(COLLECTIONS);
  const [activeTab, setActiveTab] = useState<"collections" | "restore" | "settings">("collections");
  const [filterCat, setFilterCat] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const handleArchive = (id: string) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, status: "archiving" } : c));
    setTimeout(() => {
      setCollections(prev => prev.map(c => c.id === id ? { ...c, status: "archived", lastArchived: "Just now" } : c));
    }, 3000);
  };

  const filtered = collections.filter(c => {
    const matchCat = filterCat === "all" || c.category === filterCat;
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchCat && matchStatus;
  });

  const totalGB = collections.reduce((s, c) => s + c.sizeGB, 0).toFixed(1);
  const archivedCount = collections.filter(c => c.status === "archived").length;
  const pendingCount = collections.filter(c => c.status === "pending").length;
  const totalRecords = collections.reduce((s, c) => s + c.recordCount, 0);

  return (
    <div className="min-h-screen bg-[#020817] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.016)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.016)1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute top-[-180px] right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-120px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 70%)" }} />

      <div className="relative z-10 max-w-[1440px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-slate-400/20 border border-amber-400/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-medium tracking-widest uppercase">ZeeShaoor.Pk — Admin</p>
                <h1 className="text-2xl font-bold text-white tracking-tight">Legacy Data Archiver</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 ml-12">Archive old records, manage retention policies & restore legacy data</p>
          </div>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/10 border border-amber-400/25">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-semibold text-amber-400">{pendingCount} collections pending archive</span>
            </div>
          )}
        </div>

        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Collections", value: String(collections.length), icon: "🗄️", color: "text-amber-400", sub: "legacy datasets" },
            { label: "Archived", value: `${archivedCount}/${collections.length}`, icon: "✅", color: "text-emerald-400", sub: "safely stored" },
            { label: "Total Size", value: `${totalGB} GB`, icon: "💾", color: "text-cyan-400", sub: "archive storage used" },
            { label: "Total Records", value: totalRecords.toLocaleString(), icon: "📊", color: "text-violet-400", sub: "across all collections" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5)1px,transparent 1px)", backgroundSize: "18px 18px" }} />
              <p className="text-2xl mb-1">{kpi.icon}</p>
              <p className={`text-2xl font-bold font-mono ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-white font-medium mt-1">{kpi.label}</p>
              <p className="text-[11px] text-slate-600 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-fit">
          {(["collections", "restore", "settings"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize
                ${activeTab === tab ? "bg-amber-400/20 text-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.15)]" : "text-slate-500 hover:text-slate-300"}`}>
              {tab === "collections" ? "🗄️ Collections" : tab === "restore" ? "♻️ Restore" : "⚙️ Retention Policy"}
            </button>
          ))}
        </div>

        {/* Collections Tab */}
        {activeTab === "collections" && (
          <>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {["all", "students", "academic", "fees", "staff", "system"].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border capitalize transition-all
                    ${filterCat === cat ? "bg-amber-400/15 border-amber-400/40 text-amber-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                  {cat}
                </button>
              ))}
              {["all", "pending", "archived", "archiving"].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border capitalize transition-all ml-1
                    ${filterStatus === s ? "bg-cyan-400/15 border-cyan-400/40 text-cyan-400" : "bg-white/[0.02] border-white/8 text-slate-500 hover:text-slate-300"}`}>
                  {s}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <AnimatePresence>
                {filtered.map((col, i) => (
                  <motion.div key={col.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 hover:border-white/15 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.4)1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4)1px,transparent 1px)", backgroundSize: "20px 20px" }} />

                    {col.status === "archiving" && (
                      <motion.div className="absolute inset-0 pointer-events-none" animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{ background: "linear-gradient(90deg, transparent, rgba(251,191,36,0.07), transparent)" }} />
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{col.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-white">{col.name}</h3>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CAT_STYLE[col.category]}`}>{col.category}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLE[col.status]}`}>{col.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { label: "Records", value: col.recordCount.toLocaleString() },
                        { label: "Size", value: `${col.sizeGB} GB` },
                        { label: "Years", value: col.yearRange },
                        { label: "Retain", value: `${col.retentionYears}y` },
                      ].map(stat => (
                        <div key={stat.label} className="p-2 rounded-xl bg-white/[0.02] border border-white/6 text-center">
                          <p className="text-[10px] text-slate-600">{stat.label}</p>
                          <p className="text-[11px] font-mono text-slate-300 mt-0.5">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">Last archived: <span className="text-slate-500">{col.lastArchived}</span></span>
                      {col.status === "pending" && (
                        <button onClick={() => handleArchive(col.id)}
                          className="px-4 py-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[11px] font-semibold hover:bg-amber-400/25 transition-all">
                          📦 Archive Now
                        </button>
                      )}
                      {col.status === "archiving" && (
                        <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
                          <div className="w-3 h-3 border border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                          Archiving...
                        </div>
                      )}
                      {col.status === "archived" && (
                        <span className="text-[10px] text-emerald-400">✅ Archived</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Restore Tab */}
        {activeTab === "restore" && (
          <div className="space-y-4 max-w-2xl">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-5">♻️ Restore Archived Data</h3>
              <div className="space-y-3">
                {collections.filter(c => c.status === "archived").map(col => (
                  <div key={col.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/6">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{col.icon}</span>
                      <div>
                        <p className="text-[11px] font-semibold text-white">{col.name}</p>
                        <p className="text-[10px] text-slate-500">{col.recordCount.toLocaleString()} records · {col.sizeGB} GB</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/25 text-cyan-400 text-[10px] font-medium hover:bg-cyan-400/20 transition-colors">
                      Restore →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4 max-w-2xl">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6">
              <h3 className="text-sm font-semibold text-white mb-5">⚙️ Retention Policy</h3>
              <div className="space-y-4">
                {[
                  { category: "Student Records", years: 10, description: "Academic and personal student data" },
                  { category: "Fee Records", years: 7, description: "Financial transaction history" },
                  { category: "Exam Results", years: 10, description: "Assessment and grade records" },
                  { category: "System Logs", years: 3, description: "Application and error logs" },
                  { category: "Staff Records", years: 10, description: "Employee data and contracts" },
                ].map((policy, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                    <div>
                      <p className="text-xs font-semibold text-white">{policy.category}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{policy.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-400 font-mono">{policy.years}y</span>
                      <span className="text-[10px] text-slate-600">retention</span>
                    </div>
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
