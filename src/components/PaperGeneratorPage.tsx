"use client";

import { useState } from "react";

// ══════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════
type QuestionType = "mcq" | "short" | "long" | "fill" | "true_false" | "match";
type Difficulty = "easy" | "medium" | "hard" | "mixed";
type Step = 1 | 2 | 3 | 4;

interface PaperConfig {
  title: string;
  subject: string;
  className: string;
  board: string;
  duration: string;
  totalMarks: string;
  difficulty: Difficulty;
  language: string;
  includeInstructions: boolean;
  includeLogo: boolean;
  questionTypes: Record<QuestionType, { enabled: boolean; count: number; marks: number }>;
  chapters: string[];
  customInstructions: string;
}

const SUBJECTS = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "Urdu", "Islamiyat", "Pakistan Studies", "Computer Science",
  "Economics", "Accounting", "Statistics", "History", "Geography",
];
const CLASSES = [
  "Class 1","Class 2","Class 3","Class 4","Class 5",
  "Class 6","Class 7","Class 8","Class 9","Class 10",
  "1st Year (XI)","2nd Year (XII)","BS / BA (Year 1)","BS / BA (Year 2)",
];
const BOARDS = [
  "Federal Board (FBISE)", "Punjab Board (BISE Lahore)", "BISE Rawalpindi",
  "BISE Gujranwala", "BISE Faisalabad", "BISE Multan",
  "Sindh Board (BISE Karachi)", "KPK Board (BISE Peshawar)", "AJK Board",
];
const Q_TYPE_META: Record<QuestionType, { label: string; icon: string; desc: string }> = {
  mcq:        { label: "MCQ",              icon: "⊙", desc: "Multiple choice, 4 options" },
  short:      { label: "Short Questions",  icon: "✦", desc: "2–5 line answers" },
  long:       { label: "Long Questions",   icon: "◈", desc: "Detailed essay-style" },
  fill:       { label: "Fill in Blanks",   icon: "▭", desc: "Complete the sentence" },
  true_false: { label: "True / False",     icon: "⊕", desc: "Mark correct statements" },
  match:      { label: "Match Columns",    icon: "⊞", desc: "Column A ↔ Column B" },
};

const DEFAULT_CONFIG: PaperConfig = {
  title: "",
  subject: "",
  className: "",
  board: "",
  duration: "3",
  totalMarks: "100",
  difficulty: "mixed",
  language: "English",
  includeInstructions: true,
  includeLogo: true,
  questionTypes: {
    mcq:        { enabled: true,  count: 20, marks: 1 },
    short:      { enabled: true,  count: 6,  marks: 5 },
    long:       { enabled: true,  count: 3,  marks: 10 },
    fill:       { enabled: false, count: 10, marks: 1 },
    true_false: { enabled: false, count: 10, marks: 1 },
    match:      { enabled: false, count: 5,  marks: 2 },
  },
  chapters: [],
  customInstructions: "",
};

const STEP_LABELS = ["Paper Info", "Question Types", "Options", "Generate"];

// ══════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════
export default function PaperGeneratorPage() {
  const [step, setStep] = useState<Step>(1);
  const [config, setConfig] = useState<PaperConfig>(DEFAULT_CONFIG);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const setField = <K extends keyof PaperConfig>(key: K, val: PaperConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: val }));

  const setQType = (type: QuestionType, key: "enabled" | "count" | "marks", val: boolean | number) =>
    setConfig((c) => ({
      ...c,
      questionTypes: {
        ...c.questionTypes,
        [type]: { ...c.questionTypes[type], [key]: val },
      },
    }));

  const totalCalc = Object.entries(config.questionTypes)
    .filter(([, v]) => v.enabled)
    .reduce((acc, [, v]) => acc + v.count * v.marks, 0);

  const canGoNext = () => {
    if (step === 1) return config.subject && config.className && config.board;
    if (step === 2) return Object.values(config.questionTypes).some((v) => v.enabled);
    return true;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate AI generation delay
    await new Promise((r) => setTimeout(r, 3200));
    setGenerating(false);
    setGenerated(true);
  };

  return (
    <>
      <style>{PAGE_CSS}</style>

      <div className="pg-root">
        {/* ------ HEADER ------ */}
        <div className="pg-header">
          <div className="pg-header-left">
            <div className="pg-header-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
            </div>
            <div>
              <h1 className="pg-title">Automated Paper Generator</h1>
              <p className="pg-subtitle">AI-powered exam paper creation in minutes</p>
            </div>
          </div>

          <div className="pg-header-right">
            <div className="pg-stat">
              <span className="pg-stat-num">2,841</span>
              <span className="pg-stat-lbl">Papers Generated</span>
            </div>
            <div className="pg-stat">
              <span className="pg-stat-num">98.2%</span>
              <span className="pg-stat-lbl">Accuracy Rate</span>
            </div>
          </div>
        </div>

        {/* ------ STEP BAR ------ */}
        <div className="pg-steps">
          {STEP_LABELS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = step > n;
            const active = step === n;
            return (
              <div key={n} className="pg-step-wrap">
                <div className={`pg-step${active ? " active" : ""}${done ? " done" : ""}`}>
                  <span className="pg-step-num">
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : n}
                  </span>
                  <span className="pg-step-lbl">{label}</span>
                </div>
                {n < 4 && <div className={`pg-step-line${done ? " done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* ------ MAIN BODY ------ */}
        <div className="pg-body">
          <div className="pg-card">

            {/* --- STEP 1: Paper Info --- */}
            {step === 1 && (
              <div className="pg-section">
                <h2 className="pg-section-title">📋 Paper Information</h2>
                <p className="pg-section-desc">Set the basic details for your exam paper.</p>

                <div className="pg-grid-2">
                  <div className="pg-field">
                    <label className="pg-label">Paper Title <span className="pg-opt">(optional)</span></label>
                    <input
                      className="pg-input"
                      placeholder="e.g. Annual Exam 2025"
                      value={config.title}
                      onChange={(e) => setField("title", e.target.value)}
                    />
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Subject <span className="pg-req">*</span></label>
                    <select className="pg-select" value={config.subject} onChange={(e) => setField("subject", e.target.value)}>
                      <option value="">— Select Subject —</option>
                      {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Class / Grade <span className="pg-req">*</span></label>
                    <select className="pg-select" value={config.className} onChange={(e) => setField("className", e.target.value)}>
                      <option value="">— Select Class —</option>
                      {CLASSES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Board / University <span className="pg-req">*</span></label>
                    <select className="pg-select" value={config.board} onChange={(e) => setField("board", e.target.value)}>
                      <option value="">— Select Board —</option>
                      {BOARDS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Duration (hours)</label>
                    <input className="pg-input" type="number" min="1" max="6" value={config.duration} onChange={(e) => setField("duration", e.target.value)} />
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Total Marks</label>
                    <input className="pg-input" type="number" min="20" max="200" value={config.totalMarks} onChange={(e) => setField("totalMarks", e.target.value)} />
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Language</label>
                    <select className="pg-select" value={config.language} onChange={(e) => setField("language", e.target.value)}>
                      <option>English</option>
                      <option>Urdu</option>
                      <option>Bilingual (EN + UR)</option>
                    </select>
                  </div>
                  <div className="pg-field">
                    <label className="pg-label">Difficulty Level</label>
                    <div className="pg-diff-row">
                      {(["easy","medium","hard","mixed"] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          className={`pg-diff-btn${config.difficulty === d ? " active" : ""}`}
                          onClick={() => setField("difficulty", d)}
                        >
                          {d === "easy" ? "🟢" : d === "medium" ? "🟡" : d === "hard" ? "🔴" : "🎯"} {d.charAt(0).toUpperCase() + d.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 2: Question Types --- */}
            {step === 2 && (
              <div className="pg-section">
                <h2 className="pg-section-title">❓ Question Types</h2>
                <p className="pg-section-desc">Choose what types of questions to include and set counts & marks.</p>

                <div className="pg-qtype-list">
                  {(Object.entries(Q_TYPE_META) as [QuestionType, typeof Q_TYPE_META[QuestionType]][]).map(([type, meta]) => {
                    const qt = config.questionTypes[type];
                    return (
                      <div key={type} className={`pg-qtype-card${qt.enabled ? " enabled" : ""}`}>
                        <div className="pg-qtype-top">
                          <div className="pg-qtype-info">
                            <span className="pg-qtype-icon">{meta.icon}</span>
                            <div>
                              <p className="pg-qtype-label">{meta.label}</p>
                              <p className="pg-qtype-desc">{meta.desc}</p>
                            </div>
                          </div>
                          <label className="pg-toggle">
                            <input
                              type="checkbox"
                              checked={qt.enabled}
                              onChange={(e) => setQType(type, "enabled", e.target.checked)}
                            />
                            <span className="pg-toggle-slider" />
                          </label>
                        </div>

                        {qt.enabled && (
                          <div className="pg-qtype-fields">
                            <div className="pg-qtype-field">
                              <label>No. of Questions</label>
                              <input
                                type="number" min={1} max={50}
                                className="pg-mini-input"
                                value={qt.count}
                                onChange={(e) => setQType(type, "count", +e.target.value)}
                              />
                            </div>
                            <div className="pg-qtype-field">
                              <label>Marks Each</label>
                              <input
                                type="number" min={1} max={20}
                                className="pg-mini-input"
                                value={qt.marks}
                                onChange={(e) => setQType(type, "marks", +e.target.value)}
                              />
                            </div>
                            <div className="pg-qtype-total">
                              = <strong>{qt.count * qt.marks}</strong> marks
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Marks summary */}
                <div className="pg-marks-bar">
                  <span>Calculated Total: <strong style={{ color: totalCalc > +config.totalMarks ? "#f43f5e" : "#22c55e" }}>{totalCalc}</strong> / {config.totalMarks} marks</span>
                  {totalCalc !== +config.totalMarks && (
                    <span className="pg-marks-warn">
                      {totalCalc > +config.totalMarks ? "⚠ Over by " + (totalCalc - +config.totalMarks) : "⚠ Under by " + (+config.totalMarks - totalCalc)} marks
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* --- STEP 3: Options --- */}
            {step === 3 && (
              <div className="pg-section">
                <h2 className="pg-section-title">⚙️ Paper Options</h2>
                <p className="pg-section-desc">Fine-tune formatting and extra settings.</p>

                <div className="pg-options-grid">
                  <label className="pg-checkbox-card">
                    <input type="checkbox" checked={config.includeInstructions} onChange={(e) => setField("includeInstructions", e.target.checked)} />
                    <div>
                      <p className="pg-cb-label">Include Instructions Section</p>
                      <p className="pg-cb-desc">General instructions at the top of the paper</p>
                    </div>
                  </label>
                  <label className="pg-checkbox-card">
                    <input type="checkbox" checked={config.includeLogo} onChange={(e) => setField("includeLogo", e.target.checked)} />
                    <div>
                      <p className="pg-cb-label">Include School / Institute Logo</p>
                      <p className="pg-cb-desc">Logo placeholder in the header</p>
                    </div>
                  </label>
                </div>

                <div className="pg-field" style={{ marginTop: 24 }}>
                  <label className="pg-label">Custom Instructions <span className="pg-opt">(optional)</span></label>
                  <textarea
                    className="pg-textarea"
                    placeholder="e.g. Attempt all questions. Mobile phones not allowed. Write clearly..."
                    rows={4}
                    value={config.customInstructions}
                    onChange={(e) => setField("customInstructions", e.target.value)}
                  />
                </div>

                {/* Summary box */}
                <div className="pg-summary">
                  <p className="pg-summary-title">📄 Paper Summary</p>
                  <div className="pg-summary-grid">
                    <div className="pg-summary-item"><span>Subject</span><strong>{config.subject || "—"}</strong></div>
                    <div className="pg-summary-item"><span>Class</span><strong>{config.className || "—"}</strong></div>
                    <div className="pg-summary-item"><span>Board</span><strong>{config.board || "—"}</strong></div>
                    <div className="pg-summary-item"><span>Duration</span><strong>{config.duration}h</strong></div>
                    <div className="pg-summary-item"><span>Total Marks</span><strong>{config.totalMarks}</strong></div>
                    <div className="pg-summary-item"><span>Difficulty</span><strong style={{ textTransform:"capitalize" }}>{config.difficulty}</strong></div>
                    <div className="pg-summary-item"><span>Language</span><strong>{config.language}</strong></div>
                    <div className="pg-summary-item">
                      <span>Question Types</span>
                      <strong>{Object.values(config.questionTypes).filter(v=>v.enabled).length} active</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- STEP 4: Generate --- */}
            {step === 4 && (
              <div className="pg-section pg-generate-section">
                {!generating && !generated && (
                  <>
                    <div className="pg-gen-icon">🚀</div>
                    <h2 className="pg-gen-heading">Ready to Generate!</h2>
                    <p className="pg-gen-sub">
                      Our AI will create a professional {config.subject} paper for {config.className} — {config.board}.
                    </p>
                    <button className="pg-gen-btn" onClick={handleGenerate}>
                      <span>⚡</span> Generate Paper Now
                    </button>
                  </>
                )}

                {generating && (
                  <div className="pg-generating">
                    <div className="pg-spinner" />
                    <h2 className="pg-gen-heading">AI is crafting your paper…</h2>
                    <div className="pg-gen-steps">
                      {["Analyzing syllabus & board pattern","Selecting questions by difficulty","Balancing marks distribution","Formatting professional layout","Final quality check"].map((s, i) => (
                        <div key={i} className="pg-gen-step">
                          <span className="pg-gen-step-dot" style={{ animationDelay: `${i * 0.5}s` }} />
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {generated && !generating && (
                  <div className="pg-done">
                    <div className="pg-done-icon">✅</div>
                    <h2 className="pg-gen-heading">Paper Generated!</h2>
                    <p className="pg-gen-sub">Your {config.subject} paper is ready for download or editing.</p>
                    <div className="pg-done-actions">
                      <button className="pg-dl-btn pg-dl-pdf">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        Download PDF
                      </button>
                      <button className="pg-dl-btn pg-dl-word">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Download Word
                      </button>
                      <button className="pg-dl-btn pg-dl-edit" onClick={() => { setGenerated(false); setStep(1); setConfig(DEFAULT_CONFIG); }}>
                        ↺ New Paper
                      </button>
                    </div>
                    {/* Preview block */}
                    <div className="pg-preview-box">
                      <div className="pg-preview-header">
                        <strong>{config.board}</strong>
                        <span>{config.className} — {config.subject}</span>
                        <span>Total Marks: {config.totalMarks} | Time: {config.duration} Hour(s)</span>
                      </div>
                      <div className="pg-preview-body">
                        {Object.entries(config.questionTypes)
                          .filter(([, v]) => v.enabled)
                          .map(([type, v], i) => (
                            <div key={type} className="pg-preview-section">
                              <p className="pg-preview-section-title">
                                Section {String.fromCharCode(65 + i)} — {Q_TYPE_META[type as QuestionType].label}
                                <span> ({v.count} × {v.marks} = {v.count * v.marks} marks)</span>
                              </p>
                              {Array.from({ length: Math.min(v.count, 3) }).map((_, qi) => (
                                <p key={qi} className="pg-preview-q">
                                  Q{qi + 1}. <span className="pg-preview-placeholder">[AI-generated {Q_TYPE_META[type as QuestionType].label.toLowerCase()} question for {config.subject}]</span>
                                </p>
                              ))}
                              {v.count > 3 && <p className="pg-preview-more">… +{v.count - 3} more questions</p>}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------ NAVIGATION BUTTONS ------ */}
            {!generating && !generated && (
              <div className="pg-nav-row">
                {step > 1 && (
                  <button className="pg-btn-back" onClick={() => setStep((s) => (s - 1) as Step)}>
                    ← Back
                  </button>
                )}
                <div style={{ flex: 1 }} />
                {step < 4 ? (
                  <button
                    className="pg-btn-next"
                    disabled={!canGoNext()}
                    onClick={() => setStep((s) => (s + 1) as Step)}
                  >
                    Next Step →
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════
const PAGE_CSS = `
:root {
  --cyan: #00d4ff;
  --purple: #a855f7;
  --pink: #f43f5e;
  --green: #22c55e;
  --bg: #09090e;
  --surface: #111117;
  --surface2: #16161e;
  --border: rgba(255,255,255,0.06);
  --text: #dde1ea;
  --muted: #52596b;
  --tr: 0.18s ease;
}

.pg-root {
  min-height: 100vh; background: var(--bg);
  padding: 28px 32px 60px;
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
}

/* HEADER */
.pg-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
}
.pg-header-left { display: flex; align-items: center; gap: 14px; }
.pg-header-icon {
  width: 48px; height: 48px; border-radius: 14px;
  background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15));
  border: 1px solid rgba(0,212,255,0.2);
  display: flex; align-items: center; justify-content: center;
  color: var(--cyan);
}
.pg-title { font-size: 22px; font-weight: 800; margin: 0; color: var(--text); }
.pg-subtitle { font-size: 13px; color: var(--muted); margin: 2px 0 0; }
.pg-header-right { display: flex; gap: 24px; }
.pg-stat { text-align: center; }
.pg-stat-num { display: block; font-size: 20px; font-weight: 800; background: linear-gradient(120deg, var(--cyan), var(--purple)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.pg-stat-lbl { font-size: 11px; color: var(--muted); }

/* STEPS */
.pg-steps {
  display: flex; align-items: center;
  margin-bottom: 24px; gap: 0;
}
.pg-step-wrap { display: flex; align-items: center; flex: 1; }
.pg-step-wrap:last-child { flex: none; }
.pg-step {
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap;
}
.pg-step-num {
  width: 28px; height: 28px; border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--surface2);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: var(--muted);
  flex-shrink: 0; transition: all var(--tr);
}
.pg-step.active .pg-step-num {
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  border-color: transparent; color: #fff;
}
.pg-step.done .pg-step-num { background: var(--green); border-color: transparent; color: #fff; }
.pg-step-lbl { font-size: 12.5px; color: var(--muted); transition: color var(--tr); }
.pg-step.active .pg-step-lbl { color: var(--cyan); font-weight: 600; }
.pg-step.done .pg-step-lbl { color: var(--green); }
.pg-step-line {
  flex: 1; height: 1.5px; background: var(--border);
  margin: 0 10px; transition: background var(--tr);
}
.pg-step-line.done { background: var(--green); }

/* CARD */
.pg-body { }
.pg-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
}

/* SECTION */
.pg-section { }
.pg-section-title { font-size: 17px; font-weight: 700; margin: 0 0 4px; }
.pg-section-desc { font-size: 13px; color: var(--muted); margin: 0 0 22px; }

/* GRID / FIELDS */
.pg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media(max-width:600px){ .pg-grid-2 { grid-template-columns: 1fr; } }
.pg-field { display: flex; flex-direction: column; gap: 6px; }
.pg-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.6px; }
.pg-req { color: var(--pink); }
.pg-opt { color: var(--muted); font-weight: 400; text-transform: none; letter-spacing: 0; }
.pg-input, .pg-select, .pg-textarea {
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 9px; padding: 10px 12px;
  color: var(--text); font-size: 13.5px; outline: none;
  transition: border-color var(--tr);
  font-family: inherit;
}
.pg-input:focus, .pg-select:focus, .pg-textarea:focus { border-color: rgba(0,212,255,0.4); }
.pg-select option { background: #1a1a24; }
.pg-textarea { resize: vertical; }

/* DIFFICULTY BUTTONS */
.pg-diff-row { display: flex; gap: 8px; flex-wrap: wrap; }
.pg-diff-btn {
  padding: 7px 12px; border-radius: 8px;
  border: 1px solid var(--border); background: var(--surface2);
  color: var(--muted); font-size: 12.5px; cursor: pointer;
  transition: all var(--tr);
}
.pg-diff-btn.active { border-color: var(--cyan); color: var(--cyan); background: rgba(0,212,255,0.08); }

/* QUESTION TYPES */
.pg-qtype-list { display: flex; flex-direction: column; gap: 10px; }
.pg-qtype-card {
  border: 1px solid var(--border); border-radius: 12px;
  padding: 14px 16px; background: var(--surface2);
  transition: border-color var(--tr);
}
.pg-qtype-card.enabled { border-color: rgba(0,212,255,0.25); }
.pg-qtype-top { display: flex; align-items: center; justify-content: space-between; }
.pg-qtype-info { display: flex; align-items: center; gap: 12px; }
.pg-qtype-icon { font-size: 18px; color: var(--purple); width: 28px; text-align: center; }
.pg-qtype-label { font-size: 14px; font-weight: 600; margin: 0; }
.pg-qtype-desc { font-size: 11.5px; color: var(--muted); margin: 2px 0 0; }
.pg-qtype-fields {
  display: flex; align-items: center; gap: 16px;
  margin-top: 12px; padding-top: 12px;
  border-top: 1px solid var(--border);
  flex-wrap: wrap;
}
.pg-qtype-field { display: flex; align-items: center; gap: 8px; }
.pg-qtype-field label { font-size: 12px; color: var(--muted); white-space: nowrap; }
.pg-mini-input {
  width: 60px; background: var(--surface); border: 1px solid var(--border);
  border-radius: 7px; padding: 5px 8px; color: var(--text);
  font-size: 13px; outline: none; text-align: center;
}
.pg-mini-input:focus { border-color: rgba(0,212,255,0.4); }
.pg-qtype-total { font-size: 13px; color: var(--muted); }
.pg-qtype-total strong { color: var(--cyan); }

/* TOGGLE */
.pg-toggle { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
.pg-toggle input { opacity: 0; width: 0; height: 0; }
.pg-toggle-slider {
  position: absolute; inset: 0;
  background: var(--border); border-radius: 22px;
  cursor: pointer; transition: background var(--tr);
}
.pg-toggle-slider::after {
  content: ''; position: absolute;
  width: 16px; height: 16px; border-radius: 50%;
  background: #fff; left: 3px; top: 3px;
  transition: transform var(--tr);
}
.pg-toggle input:checked + .pg-toggle-slider { background: var(--cyan); }
.pg-toggle input:checked + .pg-toggle-slider::after { transform: translateX(18px); }

/* MARKS BAR */
.pg-marks-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 10px; padding: 12px 16px;
  margin-top: 16px; font-size: 13.5px; gap: 12px; flex-wrap: wrap;
}
.pg-marks-warn { color: #f59e0b; font-size: 12.5px; }

/* OPTIONS STEP */
.pg-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media(max-width:600px){ .pg-options-grid { grid-template-columns: 1fr; } }
.pg-checkbox-card {
  display: flex; align-items: flex-start; gap: 12px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 12px; padding: 14px; cursor: pointer;
  transition: border-color var(--tr);
}
.pg-checkbox-card input[type=checkbox] { accent-color: var(--cyan); width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
.pg-checkbox-card:has(input:checked) { border-color: rgba(0,212,255,0.3); }
.pg-cb-label { font-size: 13.5px; font-weight: 600; margin: 0 0 3px; }
.pg-cb-desc { font-size: 12px; color: var(--muted); margin: 0; }

/* SUMMARY */
.pg-summary {
  background: rgba(0,212,255,0.04);
  border: 1px solid rgba(0,212,255,0.15);
  border-radius: 12px; padding: 18px;
  margin-top: 22px;
}
.pg-summary-title { font-size: 13.5px; font-weight: 700; margin: 0 0 14px; }
.pg-summary-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
@media(max-width:600px){ .pg-summary-grid { grid-template-columns: 1fr 1fr; } }
.pg-summary-item { display: flex; flex-direction: column; gap: 3px; }
.pg-summary-item span { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.pg-summary-item strong { font-size: 13.5px; color: var(--text); }

/* GENERATE STEP */
.pg-generate-section { text-align: center; padding: 20px 0 10px; }
.pg-gen-icon { font-size: 56px; margin-bottom: 16px; }
.pg-gen-heading { font-size: 24px; font-weight: 800; margin: 0 0 8px; }
.pg-gen-sub { font-size: 14px; color: var(--muted); margin: 0 0 28px; }
.pg-gen-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 36px; border-radius: 12px;
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  border: none; color: #fff; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: transform var(--tr), box-shadow var(--tr);
  box-shadow: 0 0 30px rgba(0,212,255,0.25);
}
.pg-gen-btn:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(0,212,255,0.4); }

/* Spinner */
.pg-generating { padding: 20px 0; }
.pg-spinner {
  width: 52px; height: 52px; border-radius: 50%;
  border: 3px solid rgba(0,212,255,0.15);
  border-top-color: var(--cyan);
  animation: spin 0.8s linear infinite;
  margin: 0 auto 24px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.pg-gen-steps { display: flex; flex-direction: column; gap: 8px; align-items: center; }
.pg-gen-step {
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; color: var(--muted);
}
.pg-gen-step-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--cyan); opacity: 0;
  animation: dotPop 2.5s infinite;
}
@keyframes dotPop {
  0%,100%{opacity:0;} 50%{opacity:1;}
}

/* Done */
.pg-done { }
.pg-done-icon { font-size: 52px; margin-bottom: 14px; }
.pg-done-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 28px; }
.pg-dl-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 11px 22px; border-radius: 10px;
  font-size: 13.5px; font-weight: 600; cursor: pointer;
  border: 1px solid; transition: all var(--tr);
}
.pg-dl-pdf { background: rgba(244,63,94,0.1); border-color: rgba(244,63,94,0.4); color: #f43f5e; }
.pg-dl-pdf:hover { background: rgba(244,63,94,0.18); }
.pg-dl-word { background: rgba(0,212,255,0.1); border-color: rgba(0,212,255,0.4); color: var(--cyan); }
.pg-dl-word:hover { background: rgba(0,212,255,0.18); }
.pg-dl-edit { background: var(--surface2); border-color: var(--border); color: var(--muted); }
.pg-dl-edit:hover { color: var(--text); }

/* Preview */
.pg-preview-box {
  text-align: left;
  background: #fff; color: #111;
  border-radius: 12px; padding: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  max-width: 680px; margin: 0 auto;
}
.pg-preview-header { border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
.pg-preview-header strong { display: block; font-size: 16px; font-weight: 800; }
.pg-preview-header span { display: block; font-size: 12.5px; color: #555; margin-top: 2px; }
.pg-preview-body { }
.pg-preview-section { margin-bottom: 16px; }
.pg-preview-section-title { font-size: 13.5px; font-weight: 700; margin: 0 0 6px; }
.pg-preview-section-title span { font-weight: 400; color: #555; font-size: 12px; }
.pg-preview-q { font-size: 12.5px; margin: 4px 0; color: #222; }
.pg-preview-placeholder { color: #999; font-style: italic; }
.pg-preview-more { font-size: 11.5px; color: #999; margin: 4px 0; }

/* NAV ROW */
.pg-nav-row {
  display: flex; align-items: center; margin-top: 28px;
  padding-top: 22px; border-top: 1px solid var(--border); gap: 12px;
}
.pg-btn-back {
  padding: 10px 22px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--surface2);
  color: var(--muted); font-size: 13.5px; cursor: pointer;
  transition: all var(--tr);
}
.pg-btn-back:hover { color: var(--text); }
.pg-btn-next {
  padding: 11px 28px; border-radius: 10px;
  background: linear-gradient(135deg, var(--cyan), var(--purple));
  border: none; color: #fff;
  font-size: 13.5px; font-weight: 700; cursor: pointer;
  transition: all var(--tr); box-shadow: 0 0 20px rgba(0,212,255,0.2);
}
.pg-btn-next:hover:not(:disabled) { box-shadow: 0 0 40px rgba(0,212,255,0.35); transform: translateY(-1px); }
.pg-btn-next:disabled { opacity: 0.4; cursor: not-allowed; }
`;