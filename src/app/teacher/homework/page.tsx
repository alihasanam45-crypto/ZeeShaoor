"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen, Plus, Clock, CheckCircle, XCircle, AlertTriangle,
  Sparkles, Trash2, ChevronRight, Upload, FileText, BarChart3,
  RefreshCw, GraduationCap,
} from "lucide-react"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

interface TaskRow {
  _id: string
  title: string
  description: string
  dueDate: string
  rubric: string
  recurrence: string
  totalPoints: number
  autoAlertParents: boolean
  stats?: { total: number; submitted: number; graded: number }
}

interface SubmissionRow {
  _id: string
  studentId: string
  content: string
  status: string
  aiScore?: number
  aiFeedback?: string
  submittedAt?: string
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, transition: "all 0.2s" }

function TaskCard({
  task,
  onView,
  onDelete,
}: {
  task: TaskRow
  onView: () => void
  onDelete: () => void
}) {
  const s = task.stats
  const subRate = s && s.total > 0 ? Math.round((s.submitted / s.total) * 100) : 0
  const gradedRate = s && s.total > 0 ? Math.round((s.graded / s.total) * 100) : 0
  const isOverdue = new Date(task.dueDate) < new Date()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        ...CARD_STYLES,
        background: C.panel,
        padding: 20,
        cursor: "pointer",
        borderLeft: `3px solid ${isOverdue ? C.rose : C.blue}`,
      }}
      onClick={onView}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <GraduationCap size={16} color={C.blue} />
            <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>{task.title}</span>
            {isOverdue && (
              <span style={{ fontSize: 10, background: `${C.rose}14`, color: C.rose, padding: "1px 8px", borderRadius: 4, fontWeight: 600 }}>
                OVERDUE
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: C.textDim, margin: 0, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {task.description || "No description"}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, color: C.steel }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} /> {new Date(task.dueDate).toLocaleDateString()}
            </span>
            {task.recurrence !== "None" && (
              <span style={{ background: `${C.purple}12`, color: C.purple, padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
                {task.recurrence}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", padding: 4 }}
        >
          <Trash2 size={14} />
        </button>
      </div>

      {s && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.steel, marginBottom: 4 }}>
            <span>Submitted {s.submitted}/{s.total}</span>
            <span>{subRate}%</span>
          </div>
          <div style={{ height: 4, background: C.elevated, borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${subRate}%` }}
              style={{ height: "100%", borderRadius: 2, background: subRate >= 80 ? C.emerald : subRate >= 50 ? C.amber : C.rose }}
            />
          </div>
          {gradedRate > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.steel, marginTop: 6, marginBottom: 4 }}>
                <span>Graded {s.graded}/{s.total}</span>
                <span>{gradedRate}%</span>
              </div>
              <div style={{ height: 4, background: C.elevated, borderRadius: 2, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gradedRate}%` }}
                  style={{ height: "100%", borderRadius: 2, background: C.blue }}
                />
              </div>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {task.rubric && <span style={{ fontSize: 10, background: `${C.purple}10`, color: C.purple, padding: "2px 8px", borderRadius: 4 }}>AI Rubric Ready</span>}
        {task.autoAlertParents && <span style={{ fontSize: 10, background: `${C.amber}10`, color: C.amber, padding: "2px 8px", borderRadius: 4 }}>Parent Alerts On</span>}
      </div>
    </motion.div>
  )
}

function SubmissionRowView({
  sub,
  rubric,
  onGrade,
  onRefresh,
}: {
  sub: SubmissionRow
  rubric: string
  onGrade: () => void
  onRefresh: () => void
}) {
  return (
    <div
      style={{
        ...CARD_STYLES,
        background: C.panel,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderLeft: `3px solid ${
          sub.status === "Graded" ? C.emerald : sub.status === "Submitted" ? C.blue : sub.status === "Missing" ? C.rose : C.steel
        }`,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 500, fontSize: 13, color: C.text }}>Student: {sub.studentId}</span>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: "1px 8px", borderRadius: 4,
            background: sub.status === "Graded" ? `${C.emerald}14` : sub.status === "Submitted" ? `${C.blue}14` : sub.status === "Missing" ? `${C.rose}14` : `${C.steel}14`,
            color: sub.status === "Graded" ? C.emerald : sub.status === "Submitted" ? C.blue : sub.status === "Missing" ? C.rose : C.steel,
          }}>
            {sub.status}
          </span>
        </div>
        {sub.content && (
          <p style={{ fontSize: 11, color: C.textDim, margin: 0, marginBottom: 4, maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {sub.content}
          </p>
        )}
        {sub.aiScore !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: sub.aiScore >= 70 ? C.emerald : sub.aiScore >= 40 ? C.amber : C.rose }}>
              {sub.aiScore}/100
            </span>
            {sub.aiFeedback && <span style={{ fontSize: 10, color: C.textDim }}>{sub.aiFeedback}</span>}
          </div>
        )}
        {sub.submittedAt && (
          <span style={{ fontSize: 10, color: C.textDim }}>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {sub.status === "Submitted" && rubric && (
          <button
            onClick={onGrade}
            style={{
              display: "flex", alignItems: "center", gap: 4, padding: "6px 12px",
              background: C.gradient, color: "#fff", border: "none", borderRadius: 8,
              fontSize: 11, fontWeight: 600, cursor: "pointer",
            }}
          >
            <Sparkles size={12} /> Grade AI
          </button>
        )}
        <button
          onClick={onRefresh}
          style={{ background: "none", border: "none", color: C.steel, cursor: "pointer", padding: 4 }}
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </div>
  )
}

export default function HomeworkPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([])
  const [subLoading, setSubLoading] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTask, setNewTask] = useState({
    classId: "9", title: "", description: "", rubric: "",
    recurrence: "None" as "None" | "Weekly" | "Monthly",
    dayOfWeek: 1, dueDate: "", totalPoints: 10, autoAlertParents: false,
  })

  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/homework")
      if (!res.ok) return
      const data = await res.json()
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated") loadTasks()
  }, [status])

  const viewTask = async (task: TaskRow) => {
    setSelectedTask(task)
    setSubLoading(true)
    try {
      const res = await fetch(`/api/teacher/homework?taskId=${task._id}`)
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } finally {
      setSubLoading(false)
    }
  }

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/teacher/homework/${id}`, { method: "DELETE" })
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t._id !== id))
      if (selectedTask?._id === id) setSelectedTask(null)
    }
  }

  const createTask = async () => {
    if (!newTask.title || !newTask.dueDate) return
    setCreating(true)
    try {
      const res = await fetch("/api/teacher/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })
      if (res.ok) {
        const task = await res.json()
        setTasks((prev) => [task, ...prev])
        setShowCreate(false)
        setNewTask({ classId: "9", title: "", description: "", rubric: "", recurrence: "None", dayOfWeek: 1, dueDate: "", totalPoints: 10, autoAlertParents: false })
      }
    } finally {
      setCreating(false)
    }
  }

  const gradeSubmission = async (subId: string) => {
    if (!selectedTask?.rubric) {
      alert("No rubric configured for this task")
      return
    }
    const sub = submissions.find((s) => s._id === subId)
    if (!sub || !sub.content) {
      alert("No submission content to grade")
      return
    }
    try {
      const res = await fetch("/api/teacher/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          submissionId: subId,
          studentContent: sub.content,
          rubric: selectedTask.rubric,
        }),
      })
      if (res.ok) {
        const updated = await res.json()
        setSubmissions((prev) => prev.map((s) => (s._id === subId ? { ...s, aiScore: updated.aiScore, aiFeedback: updated.aiFeedback, status: "Graded" } : s)))
        loadTasks()
      }
    } catch {}
  }

  const markMissing = async (taskId: string) => {
    const res = await fetch("/api/teacher/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-missing", taskId }),
    })
    if (res.ok) {
      loadTasks()
      viewTask(selectedTask!)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Homework Autopilot</h1>
              <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>AI-powered homework management & grading</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
            background: C.gradient, color: "#fff", border: "none", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}
        >
          <Plus size={16} /> New Task
        </button>
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Task List */}
        <div style={{ flex: selectedTask ? "0 0 380px" : 1, maxWidth: selectedTask ? 380 : "none" }}>
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>
                <FileText size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                <p style={{ margin: 0 }}>No homework tasks yet. Create your first one!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tasks.map((task) => (
                  <TaskCard key={task._id} task={task} onView={() => viewTask(task)} onDelete={() => deleteTask(task._id)} />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Submission Details */}
        <AnimatePresence>
          {selectedTask && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ flex: 1, minWidth: 0 }}
            >
              <div style={{ ...CARD_STYLES, background: C.panel, padding: 20, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text }}>{selectedTask.title}</h2>
                    <p style={{ fontSize: 12, color: C.steel, margin: "4px 0 0" }}>
                      Due: {new Date(selectedTask.dueDate).toLocaleDateString()} | Points: {selectedTask.totalPoints}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => markMissing(selectedTask._id)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: `${C.rose}12`, color: C.rose, border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                      <XCircle size={12} /> Mark Missing
                    </button>
                    <button onClick={() => setSelectedTask(null)} style={{ background: "none", border: "none", color: C.steel, cursor: "pointer" }}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
                {selectedTask.description && <p style={{ fontSize: 12, color: C.textDim, marginTop: 8 }}>{selectedTask.description}</p>}
                {selectedTask.rubric && (
                  <div style={{ marginTop: 8, padding: 8, background: C.elevated, borderRadius: 8, fontSize: 11, color: C.steel }}>
                    <strong>Rubric:</strong> {selectedTask.rubric}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ ...CARD_STYLES, background: C.panel, flex: 1, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.blue }}>{submissions.filter((s) => s.status === "Submitted" || s.status === "Graded").length}</div>
                  <div style={{ fontSize: 11, color: C.steel }}>Submitted</div>
                </div>
                <div style={{ ...CARD_STYLES, background: C.panel, flex: 1, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.emerald }}>{submissions.filter((s) => s.status === "Graded").length}</div>
                  <div style={{ fontSize: 11, color: C.steel }}>Graded</div>
                </div>
                <div style={{ ...CARD_STYLES, background: C.panel, flex: 1, padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.rose }}>{submissions.filter((s) => s.status === "Missing").length}</div>
                  <div style={{ fontSize: 11, color: C.steel }}>Missing</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {subLoading ? (
                  <div style={{ textAlign: "center", padding: 40, color: C.steel, fontSize: 13 }}>Loading submissions...</div>
                ) : submissions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: C.steel, fontSize: 13 }}>
                    <Upload size={28} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <p style={{ margin: 0 }}>No submissions yet.</p>
                  </div>
                ) : (
                  submissions.map((sub) => (
                    <SubmissionRowView
                      key={sub._id}
                      sub={sub}
                      rubric={selectedTask.rubric}
                      onGrade={() => gradeSubmission(sub._id)}
                      onRefresh={() => viewTask(selectedTask)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: C.panel, borderRadius: 20, padding: 28, width: 520, maxWidth: "90vw", maxHeight: "90vh", overflow: "auto" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 20 }}>New Homework Task</h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Title *</label>
                  <input value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Description</label>
                  <textarea value={newTask.description} onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))} rows={3}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none", resize: "vertical" }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>AI Rubric (for auto-grading)</label>
                  <textarea value={newTask.rubric} onChange={(e) => setNewTask((p) => ({ ...p, rubric: e.target.value }))} rows={2}
                    placeholder="e.g. Correct answer = 5pts, Explanation = 3pts, Grammar = 2pts"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none", resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Due Date *</label>
                    <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask((p) => ({ ...p, dueDate: e.target.value }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Total Points</label>
                    <input type="number" value={newTask.totalPoints} onChange={(e) => setNewTask((p) => ({ ...p, totalPoints: parseInt(e.target.value) || 10 }))} min={1} max={100}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Recurrence</label>
                    <select value={newTask.recurrence} onChange={(e) => setNewTask((p) => ({ ...p, recurrence: e.target.value as any }))}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }}>
                      <option value="None">None</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  {newTask.recurrence !== "None" && (
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 600, color: C.steel, marginBottom: 4, display: "block" }}>Day of Week</label>
                      <select value={newTask.dayOfWeek} onChange={(e) => setNewTask((p) => ({ ...p, dayOfWeek: parseInt(e.target.value) }))}
                        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none" }}>
                        <option value={0}>Sunday</option><option value={1}>Monday</option><option value={2}>Tuesday</option>
                        <option value={3}>Wednesday</option><option value={4}>Thursday</option><option value={5}>Friday</option><option value={6}>Saturday</option>
                      </select>
                    </div>
                  )}
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: C.steel, cursor: "pointer" }}>
                  <input type="checkbox" checked={newTask.autoAlertParents} onChange={(e) => setNewTask((p) => ({ ...p, autoAlertParents: e.target.checked }))} />
                  Auto-alert parents on missing submission
                </label>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "10px", background: C.elevated, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, color: C.steel, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={createTask} disabled={creating || !newTask.title || !newTask.dueDate}
                  style={{ flex: 1, padding: "10px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: creating ? 0.6 : 1 }}>
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
