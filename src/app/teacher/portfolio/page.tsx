"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Download, Search, Plus, Award, BookOpen,
  TrendingUp, Star, MessageSquare, User, GraduationCap,
  Trash2,
} from "lucide-react"
import type { StudentSearchResult, PortfolioData } from "@/actions/portfolio-actions"

const C = {
  bg: "#f8f9fc", panel: "#ffffff", elevated: "#f1f3f8",
  border: "rgba(15,23,42,0.08)", borderStrong: "rgba(15,23,42,0.16)",
  steel: "#64748b", blue: "#2563eb", purple: "#7c3aed",
  emerald: "#10b981", amber: "#f59e0b", rose: "#ef4444",
  gradient: "linear-gradient(135deg,#2563eb,#7c3aed)",
  text: "#1f2937", textDim: "rgba(31,41,55,0.55)",
}

const CARD_STYLES = { borderRadius: 16, border: `1px solid ${C.border}`, background: C.panel }

export default function PortfolioPage() {
  const portfolioRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)

  // Annotation state
  const [annotationText, setAnnotationText] = useState("")
  const [addingAnnotation, setAddingAnnotation] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Student search
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/teacher/portfolio?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) setSearchResults(await res.json())
      } finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadPortfolio = useCallback(async (studentId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/portfolio?studentId=${studentId}`)
      if (res.ok) setPortfolio(await res.json())
    } finally { setLoading(false) }
  }, [])

  const selectStudent = (s: StudentSearchResult) => {
    setSelectedStudent(s)
    setSearchQuery("")
    setSearchResults([])
    loadPortfolio(s._id)
  }

  const addAnnotation = async () => {
    if (!annotationText.trim() || !selectedStudent) return
    setAddingAnnotation(true)
    try {
      const res = await fetch("/api/teacher/portfolio/annotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent._id, annotationText }),
      })
      if (res.ok) {
        setAnnotationText("")
        loadPortfolio(selectedStudent._id)
      }
    } finally { setAddingAnnotation(false) }
  }

  const deleteAnnotation = async (annotationId: string) => {
    const res = await fetch(`/api/teacher/portfolio/annotations?annotationId=${annotationId}`, {
      method: "DELETE",
    })
    if (res.ok && selectedStudent) loadPortfolio(selectedStudent._id)
  }

  const exportPDF = async () => {
    if (!portfolioRef.current) return
    setExporting(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const canvas = await html2canvas(portfolioRef.current, {
        scale: 2,
        backgroundColor: '#f8f9fc',
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdf.internal.pageSize.getHeight() - 20

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdf.internal.pageSize.getHeight() - 20
      }

      pdf.save(`${selectedStudent?.name ?? 'portfolio'}_portfolio.pdf`)
    } catch (err) {
      console.error('PDF export error:', err)
    } finally { setExporting(false) }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: C.gradient, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0 }}>Student Portfolio Builder</h1>
            <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>Auto-compile profiles, add annotations, export PDF</p>
          </div>
        </div>
        {selectedStudent && portfolio && (
          <button onClick={exportPDF} disabled={exporting}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", background: C.gradient, color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(37,99,235,0.3)", opacity: exporting ? 0.6 : 1 }}>
            <Download size={16} /> {exporting ? "Exporting..." : "Download Portfolio (PDF)"}
          </button>
        )}
      </div>

      {/* Student Search */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.steel }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a student by name..."
              style={{ width: "100%", padding: "10px 14px 10px 36px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 13, outline: "none", background: C.panel }}
            />
          </div>
          {selectedStudent && (
            <button onClick={() => { setSelectedStudent(null); setPortfolio(null) }}
              style={{ padding: "8px 14px", background: C.elevated, border: "none", borderRadius: 8, fontSize: 12, color: C.steel, cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, marginTop: 4, ...CARD_STYLES, padding: 4, maxHeight: 240, overflow: "auto", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
            >
              {searchResults.map((s) => (
                <div key={s._id} onClick={() => selectStudent(s)}
                  style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: C.text }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.elevated)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <span style={{ fontWeight: 600 }}>{s.name}</span>
                    <span style={{ marginLeft: 8, fontSize: 11, color: C.steel }}>Class {s.classId} | {s.rollNo}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: s.avgScore >= 60 ? C.emerald : C.amber }}>
                    Avg: {s.avgScore}%
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Portfolio Content */}
      <AnimatePresence mode="wait">
        {!selectedStudent ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: 80 }}>
            <User size={48} style={{ opacity: 0.15, marginBottom: 16 }} />
            <p style={{ color: C.steel, fontSize: 14 }}>Search for a student above to view their portfolio</p>
          </motion.div>
        ) : loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: 60, color: C.steel, fontSize: 13 }}>
            Loading portfolio...
          </motion.div>
        ) : portfolio ? (
          <motion.div key="portfolio" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div ref={portfolioRef} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Student Info Card */}
              <div style={{ ...CARD_STYLES, padding: 24, background: C.gradient, color: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraduationCap size={28} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{portfolio.studentInfo?.name ?? selectedStudent.name}</h2>
                    <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.8 }}>
                      Class {portfolio.studentInfo?.classId ?? selectedStudent.classId} | Roll No: {selectedStudent.rollNo}
                    </p>
                    <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                      <span>Avg: {Math.round(portfolio.studentInfo?.averageScore ?? 0)}%</span>
                      <span>Attendance: {portfolio.studentInfo?.attendance ?? 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                {/* Left: Scores + Certificates */}
                <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Subject Scores */}
                  <div style={{ ...CARD_STYLES, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <BookOpen size={16} color={C.blue} />
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Subject Scores</h3>
                    </div>
                    {(portfolio.studentInfo?.subjects?.length ?? 0) > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(portfolio.studentInfo?.subjects ?? []).map((sub, i) => (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                              <span style={{ color: C.text }}>{sub.name}</span>
                              <span style={{ fontWeight: 600, color: sub.score >= 60 ? C.emerald : sub.score >= 40 ? C.amber : C.rose }}>{sub.score}%</span>
                            </div>
                            <div style={{ height: 4, background: C.elevated, borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ width: `${sub.score}%`, height: "100%", borderRadius: 2, background: sub.score >= 60 ? C.emerald : sub.score >= 40 ? C.amber : C.rose }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: C.steel, margin: 0 }}>No subject data.</p>
                    )}
                  </div>

                  {/* Top Quiz Scores */}
                  <div style={{ ...CARD_STYLES, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <TrendingUp size={16} color={C.emerald} />
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Top Quiz Performances</h3>
                    </div>
                    {portfolio.topQuizScores.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {portfolio.topQuizScores.map((q, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.elevated, borderRadius: 8 }}>
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{q.subject}</span>
                              {q.chapter && <span style={{ marginLeft: 6, fontSize: 11, color: C.steel }}>— {q.chapter}</span>}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: C.emerald }}>{q.score}%</span>
                              <span style={{ fontSize: 10, color: C.textDim }}>{q.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: C.steel, margin: 0 }}>No quiz data.</p>
                    )}
                  </div>

                  {/* Certificates */}
                  <div style={{ ...CARD_STYLES, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Award size={16} color={C.amber} />
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Certificates & Achievements</h3>
                    </div>
                    {portfolio.certificates.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {portfolio.certificates.map((c, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.elevated, borderRadius: 10 }}>
                            <Star size={16} color={C.amber} />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{c.title}</div>
                              {c.description && <div style={{ fontSize: 11, color: C.steel }}>{c.description}</div>}
                            </div>
                            <span style={{ marginLeft: "auto", fontSize: 10, color: C.textDim }}>{c.issuedAt}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, color: C.steel, margin: 0 }}>No certificates yet.</p>
                    )}
                  </div>
                </div>

                {/* Right: Annotations */}
                <div style={{ flex: 1, minWidth: 280, ...CARD_STYLES, padding: 20, alignSelf: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <MessageSquare size={16} color={C.purple} />
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: C.text }}>Teacher Annotations</h3>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: C.steel }}>{portfolio.annotations.length}</span>
                  </div>

                  {/* Add annotation */}
                  <div style={{ marginBottom: 12 }}>
                    <textarea
                      value={annotationText}
                      onChange={(e) => setAnnotationText(e.target.value)}
                      placeholder="e.g. Sara has shown remarkable growth in Physics this quarter..."
                      rows={3}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.borderStrong}`, fontSize: 12, outline: "none", resize: "vertical" }}
                    />
                    <button onClick={addAnnotation} disabled={addingAnnotation || !annotationText.trim()}
                      style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: C.gradient, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: addingAnnotation || !annotationText.trim() ? 0.6 : 1 }}>
                      <Plus size={12} /> Add Note
                    </button>
                  </div>

                  {/* Annotation list */}
                  {portfolio.annotations.length === 0 ? (
                    <p style={{ fontSize: 12, color: C.steel, margin: 0 }}>No annotations yet. Write your first note above.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 400, overflow: "auto" }}>
                      {portfolio.annotations.map((a) => (
                        <div key={a._id} style={{ padding: "10px 14px", background: C.elevated, borderRadius: 10, borderLeft: `2px solid ${C.purple}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 10, color: C.steel }}>{a.date}</span>
                            <button onClick={() => deleteAnnotation(a._id)}
                              style={{ background: "none", border: "none", color: C.rose, cursor: "pointer", padding: 0 }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: C.text, lineHeight: 1.5 }}>{a.annotationText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
