"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Video, Calendar, Clock, CheckCircle, XCircle, Plus,
  Sparkles, MessageSquare, ChevronRight, Edit3, Trash2,
  CheckSquare, Square, Loader2, User, FileText,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface MeetingData {
  _id: string
  parentId: string
  parentName?: string
  studentId: string
  studentName?: string
  scheduledDate: string
  meetingLink?: string
  aiPreSummary?: string
  meetingNotes?: string
  actionItems: { task: string; isCompleted: boolean }[]
  status: string
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

export default function MeetingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [meetings, setMeetings] = useState<MeetingData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingData | null>(null)

  // Create modal
  const [showCreate, setShowCreate] = useState(false)
  const [newMeeting, setNewMeeting] = useState({ parentId: "", parentName: "", studentId: "", studentName: "", scheduledDate: "", meetingLink: "" })

  // Notes editor
  const [notes, setNotes] = useState("")
  const [savingNotes, setSavingNotes] = useState(false)
  const [newAction, setNewAction] = useState("")

  // Summary generation
  const [generatingSummary, setGeneratingSummary] = useState(false)

  const loadMeetings = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/meetings")
      if (res.ok) setMeetings(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadMeetings()
  }, [status])

  const openMeeting = (m: MeetingData) => {
    setSelectedMeeting(m)
    setNotes(m.meetingNotes || "")
  }

  const scheduleMeeting = async () => {
    if (!newMeeting.parentId || !newMeeting.studentId || !newMeeting.scheduledDate) return
    const res = await fetch("/api/teacher/meetings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "schedule", ...newMeeting }),
    })
    if (res.ok) {
      setShowCreate(false)
      setNewMeeting({ parentId: "", parentName: "", studentId: "", studentName: "", scheduledDate: "", meetingLink: "" })
      loadMeetings()
    }
  }

  const generateSummary = async () => {
    if (!selectedMeeting) return
    setGeneratingSummary(true)
    const res = await fetch("/api/teacher/meetings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate-summary", meetingId: selectedMeeting._id }),
    })
    if (res.ok) {
      const data = await res.json()
      setSelectedMeeting((prev) => prev ? { ...prev, aiPreSummary: data.summary } : prev)
    }
    setGeneratingSummary(false)
  }

  const saveNotes = async () => {
    if (!selectedMeeting) return
    setSavingNotes(true)
    await fetch("/api/teacher/meetings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-notes", meetingId: selectedMeeting._id, notes }),
    })
    setSavingNotes(false)
  }

  const addActionItem = async () => {
    if (!selectedMeeting || !newAction.trim()) return
    const res = await fetch("/api/teacher/meetings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add-action", meetingId: selectedMeeting._id, task: newAction }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSelectedMeeting(updated)
      setNewAction("")
    }
  }

  const toggleAction = async (itemIndex: number) => {
    if (!selectedMeeting) return
    const res = await fetch("/api/teacher/meetings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-action", meetingId: selectedMeeting._id, itemIndex }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSelectedMeeting(updated)
    }
  }

  const updateStatus = async (status: string) => {
    if (!selectedMeeting) return
    await fetch("/api/teacher/meetings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-status", meetingId: selectedMeeting._id, status }),
    })
    setSelectedMeeting((prev) => prev ? { ...prev, status } : prev)
    loadMeetings()
  }

  const statusColor = (s: string) =>
    s === "Scheduled" ? C.blue : s === "In-Progress" ? C.amber : s === "Completed" ? C.emerald : C.steel

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Video size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Parent-Teacher Digital Meetings</h1>
            <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>Schedule, AI pre-summaries, live notes & action items</p>
          </div>
        </div>
        <button onClick={() => setShowCreate(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)" }}>
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Meetings list */}
        <div style={{ flex: "0 0 320px", ...CARD_STYLES, padding: 12 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, color: C.text, padding: "0 8px" }}>
            Meetings ({meetings.length})
          </h3>
          {loading ? (
            <div style={{ textAlign: "center", padding: 30, color: C.steel, fontSize: 12 }}>Loading...</div>
          ) : meetings.length === 0 ? (
            <div style={{ textAlign: "center", padding: 30, color: C.steel, fontSize: 12 }}>No meetings scheduled.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {meetings.map((m) => (
                <div key={m._id} onClick={() => openMeeting(m)}
                  style={{
                    padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                    background: selectedMeeting?._id === m._id ? `${C.blue}10` : "transparent",
                    borderLeft: `3px solid ${statusColor(m.status)}`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.studentName || m.studentId}</div>
                  <div style={{ fontSize: 10, color: C.steel, marginTop: 2 }}>
                    {new Date(m.scheduledDate).toLocaleDateString()} at {new Date(m.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: statusColor(m.status), marginTop: 2 }}>{m.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Meeting Room */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!selectedMeeting ? (
            <div style={{ textAlign: "center", padding: 80, color: C.steel, fontSize: 13 }}>
              <Video size={40} style={{ opacity: 0.15, marginBottom: 12 }} />
              <p style={{ margin: 0 }}>Select a meeting to open the meeting room</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Meeting header */}
              <div style={{ ...CARD_STYLES, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>
                      {selectedMeeting.studentName || selectedMeeting.studentId}
                    </h2>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: C.steel }}>
                      Parent: {selectedMeeting.parentName || selectedMeeting.parentId} | 
                      {new Date(selectedMeeting.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {selectedMeeting.status === "Scheduled" && (
                      <button onClick={() => updateStatus("In-Progress")} style={{ padding: "6px 12px", background: C.amber, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>
                        Start Meeting
                      </button>
                    )}
                    {selectedMeeting.status === "In-Progress" && (
                      <button onClick={() => updateStatus("Completed")} style={{ padding: "6px 12px", background: C.emerald, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, cursor: "pointer" }}>
                        End Meeting
                      </button>
                    )}
                    <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${statusColor(selectedMeeting.status)}14`, color: statusColor(selectedMeeting.status) }}>
                      {selectedMeeting.status}
                    </span>
                  </div>
                </div>

                {/* AI Pre-Summary */}
                {selectedMeeting.aiPreSummary ? (
                  <div style={{ marginTop: 12, padding: "10px 14px", background: `${C.purple}08`, borderRadius: 10, fontSize: 12, color: C.text, lineHeight: 1.5 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 600, fontSize: 11, color: C.purple, marginBottom: 4 }}>
                      <Sparkles size={12} /> AI Pre-Meeting Summary
                    </div>
                    {selectedMeeting.aiPreSummary}
                  </div>
                ) : (
                  <button onClick={generateSummary} disabled={generatingSummary}
                    style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.purple, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: generatingSummary ? 0.6 : 1 }}>
                    {generatingSummary ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} />}
                    {generatingSummary ? "Generating..." : "Generate AI Pre-Meeting Summary"}
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                {/* Meeting Notes */}
                <div style={{ flex: 1, ...CARD_STYLES, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Edit3 size={14} color={C.blue} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Meeting Notes</span>
                    <button onClick={saveNotes} disabled={savingNotes}
                      style={{ marginLeft: "auto", padding: "4px 10px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, fontSize: 10, cursor: "pointer", opacity: savingNotes ? 0.6 : 1 }}>
                      {savingNotes ? "Saving..." : "Save"}
                    </button>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take live notes during the meeting..."
                    rows={10}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", resize: "vertical", lineHeight: 1.6 }}
                  />
                </div>

                {/* Action Items */}
                <div style={{ flex: "0 0 280px", ...CARD_STYLES, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <CheckSquare size={14} color={C.emerald} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Action Items</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, color: C.steel }}>
                      {selectedMeeting.actionItems.filter((a) => a.isCompleted).length}/{selectedMeeting.actionItems.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
                    {selectedMeeting.actionItems.map((item, i) => (
                      <div key={i} onClick={() => toggleAction(i)}
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, cursor: "pointer", background: item.isCompleted ? `${C.emerald}08` : C.elevated }}>
                        {item.isCompleted ? <CheckCircle size={14} color={C.emerald} /> : <Square size={14} color={C.steel} />}
                        <span style={{ fontSize: 12, color: C.text, textDecoration: item.isCompleted ? "line-through" : "none", flex: 1 }}>{item.task}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 4 }}>
                    <input value={newAction} onChange={(e) => setNewAction(e.target.value)} placeholder="Add action item..."
                      style={{ flex: 1, padding: "6px 10px", borderRadius: 6, border: `1px solid ${C.borderStrong}`, fontSize: 11, outline: "none" }}
                      onKeyDown={(e) => e.key === "Enter" && addActionItem()} />
                    <button onClick={addActionItem} disabled={!newAction.trim()}
                      style={{ padding: "6px 10px", background: C.emerald, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, cursor: "pointer", opacity: !newAction.trim() ? 0.5 : 1 }}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              style={{ background: C.panel, borderRadius: 20, padding: 28, width: 460 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 16 }}>Schedule Meeting</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input value={newMeeting.studentName} onChange={(e) => setNewMeeting((p) => ({ ...p, studentName: e.target.value }))} placeholder="Student Name *"
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                <input value={newMeeting.studentId} onChange={(e) => setNewMeeting((p) => ({ ...p, studentId: e.target.value }))} placeholder="Student ID *"
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                <input value={newMeeting.parentName} onChange={(e) => setNewMeeting((p) => ({ ...p, parentName: e.target.value }))} placeholder="Parent Name"
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                <input value={newMeeting.parentId} onChange={(e) => setNewMeeting((p) => ({ ...p, parentId: e.target.value }))} placeholder="Parent ID *"
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                <input type="datetime-local" value={newMeeting.scheduledDate} onChange={(e) => setNewMeeting((p) => ({ ...p, scheduledDate: e.target.value }))}
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                <input value={newMeeting.meetingLink} onChange={(e) => setNewMeeting((p) => ({ ...p, meetingLink: e.target.value }))} placeholder="Meeting link (e.g. Zoom URL)"
                  style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "10px", background: C.elevated, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.steel, cursor: "pointer" }}>Cancel</button>
                <button onClick={scheduleMeeting} style={{ flex: 1, padding: "10px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Schedule</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } } .spin { animation: spin 1s linear infinite }`}</style>
    </div>
  )
}
