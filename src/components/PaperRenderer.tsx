"use client";
import React, {
  useMemo, useState, useCallback, useEffect, useRef,
} from 'react';
import QRCode from 'react-qr-code';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// INTERFACES
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
interface PaperProps {
  paperData: { mcqs: any[]; shortQuestions: any[]; longQuestions: any[] };
  metadata: { class: string; subject: string; totalQuestions: number; chapter?: string };
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// FIELD HELPERS — all CSV column name variants handled
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const getText = (q: any): string =>
  q.questionText || q.QuestionText || q.question || q.Question || '';

// FIX: parse "D | Newton" CSV format — returns display string
const getAnswer = (q: any): string => {
  const raw: string =
    q.correct_answer || q.correctAnswer || q.CorrectOption ||
    q.answer || q.AnswerText || q.Answer || '';
  if (raw.includes('|')) {
    // "D | Newton" → show the value part for display; letter used separately
    return raw.split('|')[1]?.trim() || raw.split('|')[0]?.trim() || raw;
  }
  return raw;
};

// FIX: returns the letter (A/B/C/D) from "D | Newton" format
const getAnswerLetter = (q: any): string => {
  const raw: string =
    q.correct_answer || q.correctAnswer || q.CorrectOption ||
    q.answer || q.AnswerText || q.Answer || '';
  if (raw.includes('|')) return raw.split('|')[0]?.trim() || '';
  return raw.length === 1 ? raw.toUpperCase() : raw.substring(0, 1).toUpperCase();
};

// FIX: fallback for CSV-sourced data with separate A/B/C/D columns
const getOpts = (q: any): string[] =>
  q.options ||
  [q.A || q.option_a, q.B || q.option_b, q.C || q.option_c, q.D || q.option_d].filter(Boolean);

const getChapter = (q: any): string => q.chapter || q.Chapter || 'General';

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// FIX: substr → substring (deprecated)
const genId = () => Math.random().toString(36).substring(2, 11).toUpperCase();

const BLOOM_COLORS: Record<string, string> = {
  Remember: '#3b82f6', Understand: '#10b981', Apply: '#f59e0b',
  Analyze: '#ef4444', Evaluate: '#8b5cf6', Create: '#ec4899',
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// DEFAULT SETTINGS
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const DEFAULT_SETTINGS = {
  medium:           'English Medium' as 'Dual Medium' | 'Urdu Medium' | 'English Medium',
  borderWith:       [] as string[],
  removeQuestions:  [] as string[],
  pageBreak:        'Yes' as 'Yes' | 'No',
  perPage:          '1 Test' as '1 Test' | '2 Test',
  fontUrdu:         25,
  fontEnglish:      14,
  fontEquation:     13,
  spacingMCQ:       10,
  spacingSQ:        18,
  spacingLQ:        22,
  watermarkText:    'MASTER KEY',
  headerTemplate:   'classic' as 'classic' | 'modern' | 'elite' | 'simple',
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// CHAPTER COVERAGE BAR
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ChapterCoverageBar({ mcqs, shortQuestions, longQuestions }: any) {
  const all = [...mcqs, ...shortQuestions, ...longQuestions];
  const total = all.length;
  if (total === 0) return null;
  const counts: Record<string, number> = {};
  all.forEach(q => { const c = getChapter(q); counts[c] = (counts[c] || 0) + 1; });
  const colors = ['#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#dc2626'];
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ fontSize: '9px', fontWeight: '700', color: '#666', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chapter Coverage</div>
      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        {Object.entries(counts).map(([ch, cnt], i) => (
          <div key={ch} title={`${ch}: ${cnt}Qs (${Math.round(cnt / total * 100)}%)`}
            style={{ width: `${cnt / total * 100}%`, background: colors[i % colors.length] }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '3px', flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([ch, cnt], i) => (
          <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '8px', color: '#555' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: colors[i % colors.length], flexShrink: 0 }} />
            {ch.length > 20 ? ch.substring(0, 18) + '…' : ch}: {cnt} ({Math.round(cnt / total * 100)}%)
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// BUBBLE SHEET
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function BubbleSheet({ mcqs, paperCode, variant }: any) {
  return (
    <div className="print-matrix" style={{ width: '210mm', backgroundColor: '#fff', padding: '12mm 18mm', fontFamily: '"Times New Roman", serif', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', marginTop: '20px' }}>
      <div style={{ borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: '900', letterSpacing: '1px' }}>ZEESHAOOR.PK — MCQ BUBBLE SHEET</div>
          <div style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>
            Paper: <strong>{paperCode}</strong> | Variant: <strong style={{ color: variant === 'B' ? '#dc2626' : '#16a34a' }}>{variant}</strong>
            &nbsp;|&nbsp; Fill bubbles with BLACK pen only. Pencil NOT allowed.
          </div>
        </div>
        <div style={{ fontSize: '10px', textAlign: 'right' }}>
          <div>Student: _____________________________</div>
          <div style={{ marginTop: '3px' }}>Roll No: ____________ | Class: _______</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '7px 10px' }}>
        {mcqs.map((_: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <strong style={{ minWidth: '20px', textAlign: 'right', fontSize: '10px' }}>{i + 1}.</strong>
            {['A', 'B', 'C', 'D'].map(opt => (
              <div key={opt} style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 'bold' }}>{opt}</div>
            ))}
          </div>
        ))}
      </div>
      {/* FIX: Added "Use this sheet only" phrase from Code 2 */}
      <div style={{ marginTop: '10px', borderTop: '1px dashed #bbb', paddingTop: '5px', fontSize: '8px', color: '#888', textAlign: 'center' }}>
        Cutting/overwriting = WRONG answer | Use this sheet only | ZeeShaoor.pk | {paperCode}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ANSWER KEY
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function AnswerKey({ mcqs, shortQuestions, longQuestions, paperCode }: any) {
  return (
    <div className="print-matrix" style={{ width: '210mm', backgroundColor: '#fff', padding: '14mm 20mm', fontFamily: '"Times New Roman", serif', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', marginTop: '20px', border: '3px solid #dc2626' }}>
      <div style={{ background: '#dc2626', color: '#fff', margin: '-14mm -20mm 16px -20mm', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: '900', letterSpacing: '2px' }}>🔑 MASTER ANSWER KEY — TEACHER ONLY</div>
        <div style={{ fontSize: '10px' }}>{paperCode}</div>
      </div>
      {mcqs.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Section A — MCQ Keys</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px' }}>
            {mcqs.map((q: any, i: number) => {
              const opts = getOpts(q);
              const ansLetter = getAnswerLetter(q);
              const ansVal = getAnswer(q);
              // FIX: Try letter match first, then value match
              const ansIdx = opts.findIndex((o: string) => o === ansVal);
              const displayLabel = ansLetter || (ansIdx >= 0 ? ['A', 'B', 'C', 'D'][ansIdx] : '?');
              return (
                <div key={i} style={{ fontSize: '11px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <strong style={{ minWidth: '18px' }}>{i + 1}.</strong>
                  <span style={{ background: '#dcfce7', border: '1.5px solid #16a34a', borderRadius: '4px', padding: '1px 7px', fontWeight: 'bold', color: '#16a34a' }}>{displayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {shortQuestions.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Section B — Short Answer Keys</div>
          {shortQuestions.map((q: any, i: number) => (
            <div key={i} style={{ marginBottom: '8px', fontSize: '11px' }}>
              <strong>Q{i + 1}.</strong> {getText(q)}
              <div style={{ marginTop: '2px', padding: '3px 8px', background: '#fef9c3', borderLeft: '3px solid #ca8a04', fontSize: '10px' }}>
                <strong>Key Points:</strong> {getAnswer(q) || '(Refer to textbook)'}
              </div>
            </div>
          ))}
        </div>
      )}
      {longQuestions.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 'bold', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Section C — Long Answer Keys</div>
          {longQuestions.map((q: any, i: number) => (
            <div key={i} style={{ marginBottom: '10px', fontSize: '11px' }}>
              <strong>Q{i + 1}.</strong> {getText(q)}
              <div style={{ marginTop: '2px', padding: '3px 8px', background: '#fef9c3', borderLeft: '3px solid #ca8a04', fontSize: '10px' }}>
                <strong>Key Points:</strong> {getAnswer(q) || '(Refer to textbook)'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// PARENT COPY — Code 2's improved layout with student/date fields + footer
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function ParentCopy({ mcqs, shortQuestions, longQuestions, metadata, paperCode }: any) {
  return (
    <div className="print-matrix" style={{ width: '210mm', minHeight: '297mm', backgroundColor: '#fff', padding: '16mm 20mm', fontFamily: '"Times New Roman", serif', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', marginTop: '20px' }}>
      <div style={{ borderBottom: '2px solid #7c3aed', paddingBottom: '10px', marginBottom: '16px' }}>
        {/* FIX: Code 2's layout — title left, student/date right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: '900', margin: '0 0 2px 0', color: '#7c3aed' }}>ZeeShaoor.pk — PARENT COPY</h1>
            <div style={{ fontSize: '9px', color: '#888', fontStyle: 'italic' }}>For home review — No marks shown</div>
            <div style={{ fontSize: '10px', marginTop: '5px' }}>
              <strong>Class:</strong> {metadata.class} &nbsp;|&nbsp;
              <strong>Subject:</strong> {metadata.subject} &nbsp;|&nbsp;
              <strong>Code:</strong> {paperCode}
            </div>
          </div>
          <div style={{ fontSize: '10px', textAlign: 'right', color: '#555' }}>
            <div>Student: ________________________</div>
            <div style={{ marginTop: '3px' }}>Date: ______________</div>
          </div>
        </div>
        <div style={{ marginTop: '8px', padding: '5px 10px', background: '#faf5ff', borderLeft: '3px solid #7c3aed', fontSize: '9px', color: '#6d28d9', fontStyle: 'italic' }}>
          Dear Parents, please go through these questions with your child at home. This strengthens their learning. ❤️
        </div>
      </div>
      {mcqs.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>Multiple Choice Questions</div>
          {mcqs.map((q: any, i: number) => <div key={i} style={{ marginBottom: '6px', fontSize: '11px' }}><strong>{i + 1}.</strong> {getText(q)}</div>)}
        </div>
      )}
      {shortQuestions.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>Short Questions</div>
          {shortQuestions.map((q: any, i: number) => <div key={i} style={{ marginBottom: '6px', fontSize: '11px' }}><strong>{i + 1}.</strong> {getText(q)}</div>)}
        </div>
      )}
      {longQuestions.length > 0 && (
        <div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '6px', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb', paddingBottom: '3px' }}>Long Questions</div>
          {longQuestions.map((q: any, i: number) => <div key={i} style={{ marginBottom: '6px', fontSize: '11px' }}><strong>{i + 1}.</strong> {getText(q)}</div>)}
        </div>
      )}
      {/* FIX: Code 2's bottom footer text */}
      <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #000', fontSize: '8px', color: '#999', textAlign: 'center' }}>
        ZeeShaoor.pk | Helping children grow beyond exams | {paperCode}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// SMART SWAP MODAL
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function SwapModal({ questions, currentIndex, sectionLabel, onSwap, onClose }: {
  questions: any[]; currentIndex: number; sectionLabel: string;
  onSwap: (from: number, to: number) => void; onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const chapters = Array.from(new Set(questions.map(getChapter)));
  const [filterChapter, setFilterChapter] = useState<string>('All');

  const filtered = questions.map((q, i) => ({ q, i }))
    .filter(({ i }) => i !== currentIndex)
    .filter(({ q }) => filterChapter === 'All' || getChapter(q) === filterChapter);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={onClose}>
      <div style={{ background: 'linear-gradient(160deg,#0f0f18,#0a0a12)', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '18px', width: '100%', maxWidth: '580px', maxHeight: '82vh', display: 'flex', flexDirection: 'column', boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(168,85,247,0.15)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: '#fff', letterSpacing: '0.5px' }}>⇄ SMART SWAP</div>
              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '3px' }}>{sectionLabel} · Q{currentIndex + 1} — select a question to swap with</div>
            </div>
            <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#9ca3af', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '10px', fontSize: '12px', color: '#d8b4fe' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#a78bfa', display: 'block', marginBottom: '3px' }}>SELECTED (Q{currentIndex + 1})</span>
            {getText(questions[currentIndex]).slice(0, 120)}{getText(questions[currentIndex]).length > 120 ? '…' : ''}
          </div>
          {chapters.length > 1 && (
            <div style={{ display: 'flex', gap: '5px', marginTop: '10px', flexWrap: 'wrap' }}>
              {['All', ...chapters].map(ch => (
                <button key={ch} onClick={() => setFilterChapter(ch)}
                  style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '20px', border: filterChapter === ch ? '1px solid rgba(168,85,247,0.6)' : '1px solid rgba(255,255,255,0.08)', background: filterChapter === ch ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)', color: filterChapter === ch ? '#d8b4fe' : '#6b7280', cursor: 'pointer', fontWeight: '600' }}>
                  {ch.length > 18 ? ch.slice(0, 16) + '…' : ch}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {filtered.length === 0 && <div style={{ color: '#4b5563', fontSize: '12px', textAlign: 'center', marginTop: '30px' }}>No other questions in this filter.</div>}
          {filtered.map(({ q, i }) => {
            const isSel = selected === i;
            return (
              <div key={i} onClick={() => setSelected(i)}
                style={{ padding: '10px 14px', borderRadius: '10px', border: isSel ? '1px solid rgba(168,85,247,0.65)' : '1px solid rgba(255,255,255,0.07)', background: isSel ? 'rgba(168,85,247,0.14)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: isSel ? '6px solid #a855f7' : '2px solid rgba(255,255,255,0.18)', flexShrink: 0, marginTop: '1px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: isSel ? '#a78bfa' : '#4b5563', fontWeight: '700', marginBottom: '3px' }}>Q{i + 1} · {getChapter(q)}</div>
                  <div style={{ fontSize: '12px', color: isSel ? '#e5e7eb' : '#9ca3af', lineHeight: '1.5' }}>{getText(q).slice(0, 110)}{getText(q).length > 110 ? '…' : ''}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '12px 22px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#9ca3af', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
          <button disabled={selected === null}
            onClick={() => { if (selected !== null) { onSwap(currentIndex, selected); onClose(); } }}
            style={{ flex: 2, padding: '10px', background: selected !== null ? 'linear-gradient(135deg,#a855f7,#6366f1)' : 'rgba(255,255,255,0.04)', border: 'none', borderRadius: '10px', color: selected !== null ? '#fff' : '#4b5563', fontSize: '13px', fontWeight: '800', cursor: selected !== null ? 'pointer' : 'not-allowed', boxShadow: selected !== null ? '0 4px 15px rgba(168,85,247,0.3)' : 'none' }}>
            ⇄ Swap Q{currentIndex + 1} ↔ {selected !== null ? `Q${selected + 1}` : '?'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// SETTINGS MODAL
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function SettingsModal({ settings, onChange, onClose }: {
  settings: typeof DEFAULT_SETTINGS;
  onChange: (s: typeof DEFAULT_SETTINGS) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState({ ...settings });
  const set = (k: string, v: any) => setLocal(p => ({ ...p, [k]: v }));

  const SLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: '9px', fontWeight: '800', color: '#6b7280', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px', marginTop: '14px', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{children}</div>
  );

  const RadioRow = ({ label, options, value, onSelect }: any) => (
    <div style={{ marginBottom: '10px' }}>
      {label && <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '6px' }}>{label}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {options.map((opt: string) => (
          <label key={opt} onClick={() => onSelect(opt)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', background: value === opt ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.03)', border: value === opt ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: value === opt ? '5px solid #a855f7' : '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: value === opt ? '#d8b4fe' : '#9ca3af', fontWeight: value === opt ? '600' : '400' }}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  const CheckPill = ({ label, checked, onToggle }: any) => (
    <button onClick={onToggle} style={{ padding: '5px 12px', borderRadius: '20px', border: checked ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.08)', background: checked ? 'rgba(168,85,247,0.18)' : 'rgba(255,255,255,0.04)', color: checked ? '#d8b4fe' : '#6b7280', fontSize: '11px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: checked ? '#a855f7' : 'transparent', border: checked ? 'none' : '2px solid rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', flexShrink: 0 }}>{checked ? '✓' : ''}</span>
      {label}
    </button>
  );

  const NumStepper = ({ label, value, onDec, onInc, color = '#fff', min = 8, max = 40 }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button onClick={() => onDec(Math.max(min, value - 1))} style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ width: '32px', textAlign: 'center', fontWeight: '800', fontSize: '14px', color }}>{value}</span>
        <button onClick={() => onInc(Math.min(max, value + 1))} style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>
    </div>
  );

  const toggleArr = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '12px' }}
      onClick={onClose}>
      <div style={{ background: 'linear-gradient(180deg,#0f0f16,#0a0a10)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '16px', width: '300px', maxHeight: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 50px rgba(168,85,247,0.12)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '900', color: '#fff' }}>⚙️ PAPER SETTINGS</div>
            <div style={{ fontSize: '10px', color: 'rgba(168,85,247,0.7)', marginTop: '2px' }}>Configure paper layout & format</div>
          </div>
          <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#9ca3af', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '6px 20px 16px' }}>
          <SLabel>Medium</SLabel>
          <RadioRow options={['Dual Medium', 'Urdu Medium', 'English Medium']} value={local.medium} onSelect={(v: any) => set('medium', v)} />

          <SLabel>Border With</SLabel>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
            {['MCQs', 'SQs', 'LQs'].map(item => (
              <CheckPill key={item} label={item} checked={local.borderWith.includes(item)}
                onToggle={() => set('borderWith', toggleArr(local.borderWith, item))} />
            ))}
          </div>

          <SLabel>Remove Sections</SLabel>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
            {['MCQs', 'SQs', 'LQs'].map(item => (
              <CheckPill key={item} label={item} checked={local.removeQuestions.includes(item)}
                onToggle={() => set('removeQuestions', toggleArr(local.removeQuestions, item))} />
            ))}
          </div>

          <SLabel>Page Break Between Sections</SLabel>
          <RadioRow options={['Yes', 'No']} value={local.pageBreak} onSelect={(v: any) => set('pageBreak', v)} />

          <SLabel>Per Page Test</SLabel>
          <RadioRow options={['1 Test', '2 Test']} value={local.perPage} onSelect={(v: any) => set('perPage', v)} />

          <SLabel>Font Size</SLabel>
          <NumStepper label="Urdu" value={local.fontUrdu} onDec={(v: number) => set('fontUrdu', v)} onInc={(v: number) => set('fontUrdu', v)} color="#60a5fa" />
          <NumStepper label="English" value={local.fontEnglish} onDec={(v: number) => set('fontEnglish', v)} onInc={(v: number) => set('fontEnglish', v)} color="#34d399" />
          <NumStepper label="Equation" value={local.fontEquation} onDec={(v: number) => set('fontEquation', v)} onInc={(v: number) => set('fontEquation', v)} color="#fbbf24" />

          <SLabel>Line Spacing</SLabel>
          <NumStepper label="MCQs" value={local.spacingMCQ} onDec={(v: number) => set('spacingMCQ', v)} onInc={(v: number) => set('spacingMCQ', v)} color="#a78bfa" min={4} max={40} />
          <NumStepper label="Short Qs" value={local.spacingSQ} onDec={(v: number) => set('spacingSQ', v)} onInc={(v: number) => set('spacingSQ', v)} color="#a78bfa" min={4} max={50} />
          <NumStepper label="Long Qs" value={local.spacingLQ} onDec={(v: number) => set('spacingLQ', v)} onInc={(v: number) => set('spacingLQ', v)} color="#a78bfa" min={4} max={60} />

          <SLabel>Watermark Text</SLabel>
          <input type="text" value={local.watermarkText} onChange={e => set('watermarkText', e.target.value)}
            placeholder="e.g. MASTER KEY"
            style={{ width: '100%', background: 'rgba(0,0,0,0.5)', color: '#e5e7eb', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', marginBottom: '4px' }} />

          <SLabel>Header Template</SLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {[
              { id: 'classic', label: 'Classic Board', desc: 'Pakistani board style' },
              { id: 'modern', label: 'Modern Clean', desc: 'Minimal professional' },
              { id: 'elite', label: 'Elite Premium', desc: 'High-end design' },
              { id: 'simple', label: 'Simple', desc: 'Clean & minimal' },
            ].map(t => (
              <button key={t.id} onClick={() => set('headerTemplate', t.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '8px', border: local.headerTemplate === t.id ? '1px solid rgba(168,85,247,0.5)' : '1px solid rgba(255,255,255,0.07)', background: local.headerTemplate === t.id ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', color: local.headerTemplate === t.id ? '#d8b4fe' : '#e5e7eb', fontWeight: '600' }}>{t.label}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '1px' }}>{t.desc}</div>
                </div>
                {local.headerTemplate === t.id && <span style={{ color: '#a855f7', fontSize: '14px' }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button onClick={() => setLocal({ ...DEFAULT_SETTINGS })} style={{ flex: 1, padding: '9px', background: '#dc2626', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>RESET</button>
          <button onClick={() => { onChange(local); onClose(); }} style={{ flex: 1, padding: '9px', background: 'linear-gradient(135deg,#16a34a,#15803d)', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Save</button>
          <button onClick={onClose} style={{ flex: 1, padding: '9px', background: '#d97706', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// PAPER HEADER — all 4 templates, all bugs fixed
// FIX: zIndex:1 on all headers (prevents watermark overlap)
// FIX: totalMarks respects removeQuestions setting via props
// FIX: marks table uses dynamic marksPerShort/marksPerLong (no hardcoding)
// FIX: Modern template now has proper Obtained box AND marks table
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function PaperHeader({ template, metadata, paperCode, matrixId, totalMarks, mcqs, shortQuestions, longQuestions, showAnswers, showExpectedTime, showCoverage, qrValue, marksPerShort, marksPerLong, watermarkText, settings }: any) {
  const totalQs = mcqs.length + shortQuestions.length + longQuestions.length;
  const showMCQs = !settings.removeQuestions.includes('MCQs');
  const showSQs  = !settings.removeQuestions.includes('SQs');
  const showLQs  = !settings.removeQuestions.includes('LQs');

  const SectionPills = () => (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
      {showMCQs && mcqs.length > 0 && <span style={{ fontSize: '9px', fontWeight: '700', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '2px 8px', borderRadius: '20px' }}>MCQ ×{mcqs.length} = {mcqs.length}M</span>}
      {showSQs && shortQuestions.length > 0 && <span style={{ fontSize: '9px', fontWeight: '700', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 8px', borderRadius: '20px' }}>Short ×{shortQuestions.length} = {shortQuestions.length * marksPerShort}M</span>}
      {showLQs && longQuestions.length > 0 && <span style={{ fontSize: '9px', fontWeight: '700', background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 8px', borderRadius: '20px' }}>Long ×{longQuestions.length} = {longQuestions.length * marksPerLong}M</span>}
      <span style={{ fontSize: '9px', fontWeight: '700', background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)', padding: '2px 8px', borderRadius: '20px' }}>Total: {totalMarks}M</span>
    </div>
  );

  // FIX: Dynamic marks — no hardcoded 2 or 5
  const MarksTable = () => (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', border: '1px solid #999', marginTop: '8px' }}>
      <thead>
        <tr style={{ background: '#1e1b4b', color: '#fff' }}>
        {(['Section', 'Questions', 'Marks Each', 'Total Marks', 'Marks Obtained']).map(h => (
            <th key={h} style={{ border: '1px solid #999', padding: '3px 6px', textAlign: 'center', fontWeight: '700' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {showMCQs && mcqs.length > 0 && (
          <tr>
            <td style={{ border: '1px solid #999', padding: '2px 6px' }}>A — MCQs</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>{mcqs.length}</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>1</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center', fontWeight: 'bold' }}>{mcqs.length}</td>
            
            <td style={{ border: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td>
          </tr>
        )}
        {showSQs && shortQuestions.length > 0 && (
          <tr>
            <td style={{ border: '1px solid #999', padding: '2px 6px' }}>B — Short</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>{shortQuestions.length}</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>{marksPerShort}</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center', fontWeight: 'bold' }}>{shortQuestions.length * marksPerShort}</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td>
          </tr>
        )}
        {showLQs && longQuestions.length > 0 && (
          <tr>
            <td style={{ border: '1px solid #999', padding: '2px 6px' }}>C — Long</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>{longQuestions.length}</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>{marksPerLong}</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center', fontWeight: 'bold' }}>{longQuestions.length * marksPerLong}</td>
            <td style={{ border: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td>
          </tr>
        )}
        <tr style={{ fontWeight: 'bold', background: '#f9fafb' }}>
          <td style={{ border: '1px solid #999', padding: '2px 6px' }}>TOTAL</td>
          <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>{totalQs}</td>
          <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>—</td>
          <td style={{ border: '1px solid #999', padding: '2px 6px', textAlign: 'center' }}>{totalMarks}</td>
          <td style={{ border: '1px solid #999', padding: '2px 6px' }}>&nbsp;</td>
        </tr>
      </tbody>
    </table>
  );

  if (template === 'classic') return (
    <div style={{ borderBottom: '3px double #000', paddingBottom: '10px', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ fontSize: '9px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Board of Intermediate & Secondary Education</div>
        <h1 style={{ fontSize: '18px', fontWeight: '900', margin: '2px 0', letterSpacing: '2px', textTransform: 'uppercase' }}>ZeeShaoor.pk</h1>
        <div style={{ fontSize: '9px', color: '#666', fontStyle: 'italic' }}>Advanced Academic Assessment System</div>
      </div>
      <SectionPills />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderTop: '1px solid #000', paddingTop: '8px' }}>
        <div style={{ fontSize: '11px', lineHeight: '1.8' }}>
          <div><strong>Class / Grade:</strong> {metadata.class} &nbsp;&nbsp; <strong>Subject:</strong> {metadata.subject}</div>
          <div><strong>Chapter:</strong> {metadata.chapter || '—'} &nbsp;&nbsp; <strong>Total Marks:</strong> <strong style={{ color: '#1e1b4b' }}>{totalMarks}</strong></div>
          <div><strong>Time Allowed:</strong> {Math.round(totalMarks * 1.5)} min &nbsp;&nbsp; <strong>Code:</strong> <span style={{ fontWeight: '900', color: '#7c3aed', fontFamily: 'monospace' }}>{paperCode}</span></div>
          <div><strong>Student:</strong> _____________________________ <strong>Roll#:</strong> ___________</div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: '12px' }}>
          <div style={{ padding: '3px', border: '2px solid #000', display: 'inline-block' }}>
            <QRCode value={qrValue} size={64} level="H" />
          </div>
          <div style={{ fontSize: '7px', fontFamily: 'monospace', color: '#666', marginTop: '2px' }}>{matrixId}</div>
        </div>
      </div>
      <MarksTable />
      {showCoverage && <ChapterCoverageBar mcqs={mcqs} shortQuestions={shortQuestions} longQuestions={longQuestions} />}
      {showAnswers && <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '5px', fontSize: '10px' }}>⚠ {watermarkText} — TEACHER USE ONLY</div>}
    </div>
  );

  if (template === 'modern') return (
    <div style={{ marginBottom: '14px', position: 'relative', zIndex: 1 }}>
      <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', color: '#fff', margin: '-16mm -20mm 12px -20mm', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '900', margin: '0 0 2px 0', letterSpacing: '1px' }}>ZeeShaoor.pk</h1>
          <div style={{ fontSize: '9px', opacity: 0.8, letterSpacing: '2px', textTransform: 'uppercase' }}>Academic Assessment System</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '11px', lineHeight: '1.6' }}>
          <div><strong>{metadata.class}</strong> | {metadata.subject}</div>
          <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '900', color: '#c4b5fd' }}>{paperCode}</div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>Total: {totalMarks} Marks</div>
        </div>
        <div style={{ padding: '3px', background: '#fff', marginLeft: '12px' }}>
          <QRCode value={qrValue} size={56} level="H" />
        </div>
      </div>
      <SectionPills />
      {/* FIX: Modern now has student fields + separate Obtained box (Code 2 improvement) */}
      <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginBottom: '8px' }}>
        <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px' }}>
          <div style={{ fontSize: '8px', color: '#888', textTransform: 'uppercase', marginBottom: '2px' }}>Student Name</div>
          <div style={{ borderBottom: '1px solid #000', height: '16px' }}></div>
        </div>
        <div style={{ width: '90px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px' }}>
          <div style={{ fontSize: '8px', color: '#888', textTransform: 'uppercase', marginBottom: '2px' }}>Roll No</div>
          <div style={{ borderBottom: '1px solid #000', height: '16px' }}></div>
        </div>
        <div style={{ width: '80px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 10px' }}>
          <div style={{ fontSize: '8px', color: '#888', textTransform: 'uppercase', marginBottom: '2px' }}>Date</div>
          <div style={{ borderBottom: '1px solid #000', height: '16px' }}></div>
        </div>
        <div style={{ border: '2px solid #7c3aed', borderRadius: '6px', padding: '6px 14px', textAlign: 'center', background: '#faf5ff', flexShrink: 0 }}>
          <div style={{ fontSize: '8px', color: '#7c3aed', fontWeight: 'bold', textTransform: 'uppercase' }}>Total</div>
          <div style={{ fontSize: '16px', fontWeight: '900', color: '#7c3aed', lineHeight: '1' }}>{totalMarks}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '6px 14px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '8px', color: '#888', textTransform: 'uppercase' }}>Obtained</div>
          <div style={{ fontSize: '18px', fontWeight: '900', color: '#374151', lineHeight: '1', borderBottom: '1px solid #000', minWidth: '40px' }}>&nbsp;</div>
        </div>
      </div>
      <MarksTable />
      {showCoverage && <ChapterCoverageBar mcqs={mcqs} shortQuestions={shortQuestions} longQuestions={longQuestions} />}
      {showAnswers && <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '10px', marginTop: '4px' }}>⚠ {watermarkText} — TEACHER ONLY</div>}
      <div style={{ borderBottom: '2px solid #1e1b4b', marginTop: '8px' }} />
    </div>
  );

  if (template === 'elite') return (
    <div style={{ marginBottom: '14px', position: 'relative', zIndex: 1 }}>
      <div style={{ border: '2px solid #000', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ background: '#000', color: '#fff', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '900', letterSpacing: '3px', textTransform: 'uppercase' }}>ZeeShaoor</span>
            <span style={{ fontSize: '16px', fontWeight: '900', color: '#a855f7', letterSpacing: '3px' }}>.PK</span>
            <div style={{ fontSize: '8px', color: '#999', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '1px' }}>Elite Academic Assessment</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '900', fontFamily: 'monospace', color: '#a855f7' }}>{paperCode}</div>
            <div style={{ fontSize: '8px', color: '#999' }}>{matrixId}</div>
          </div>
          <div style={{ background: '#fff', padding: '3px' }}>
            <QRCode value={qrValue} size={55} level="H" />
          </div>
        </div>
        <div style={{ padding: '8px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', borderTop: '1px solid #e5e7eb' }}>
          {[
            { label: 'Class', value: metadata.class },
            { label: 'Subject', value: metadata.subject },
            { label: 'Chapter', value: metadata.chapter || '—' },
            { label: 'Total Marks', value: String(totalMarks), highlight: true },
            { label: 'Time Allowed', value: `${Math.round(totalMarks * 1.5)} min` },
            { label: 'Total Questions', value: String(totalQs) },
          ].map(item => (
            <div key={item.label} style={{ fontSize: '10px' }}>
              <div style={{ color: '#888', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
              <div style={{ fontWeight: '900', color: (item as any).highlight ? '#7c3aed' : '#000', fontSize: (item as any).highlight ? '13px' : '11px' }}>{item.value}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#f9fafb', padding: '6px 14px', display: 'flex', gap: '10px', borderTop: '1px solid #e5e7eb', fontSize: '10px' }}>
          <div style={{ flex: 2 }}>Student: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '140px' }}>&nbsp;</span></div>
          <div style={{ flex: 1 }}>Roll#: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '70px' }}>&nbsp;</span></div>
          <div style={{ flex: 1 }}>Date: <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '70px' }}>&nbsp;</span></div>
          <div style={{ background: '#7c3aed', color: '#fff', padding: '1px 8px', borderRadius: '3px', fontWeight: 'bold', flexShrink: 0 }}>Obtained: ______</div>
        </div>
      </div>
      <SectionPills />
      <MarksTable />
      {showCoverage && <ChapterCoverageBar mcqs={mcqs} shortQuestions={shortQuestions} longQuestions={longQuestions} />}
      {showAnswers && <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '10px', marginTop: '4px' }}>⚠ {watermarkText} — DO NOT DISTRIBUTE</div>}
    </div>
  );

  // simple
  return (
    <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '14px', position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 2px 0' }}>ZeeShaoor.pk</h1>
          <div style={{ fontSize: '11px', lineHeight: '1.7', marginTop: '5px' }}>
            <div><strong>Class:</strong> {metadata.class} &nbsp; <strong>Subject:</strong> {metadata.subject} &nbsp; <strong>Code:</strong> <strong style={{ color: '#7c3aed', fontFamily: 'monospace' }}>{paperCode}</strong></div>
            <div><strong>Marks:</strong> {totalMarks} &nbsp; <strong>Chapter:</strong> {metadata.chapter || '—'}</div>
            <div><strong>Student:</strong> ________________________ &nbsp; <strong>Roll#:</strong> ___________</div>
          </div>
        </div>
        <div style={{ padding: '3px', border: '2px solid #000', flexShrink: 0 }}>
          <QRCode value={qrValue} size={60} level="H" />
        </div>
      </div>
      <SectionPills />
      <MarksTable />
      {showCoverage && <ChapterCoverageBar mcqs={mcqs} shortQuestions={shortQuestions} longQuestions={longQuestions} />}
      {showAnswers && <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '10px', marginTop: '4px' }}>⚠ {watermarkText}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// QUESTION CONTROLS
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function QControls({ index, total, onSwap, onUp, onDown, onDelete }: any) {
  return (
    <div className="no-print" style={{ display: 'flex', gap: '3px', flexShrink: 0, alignSelf: 'flex-start', marginLeft: '6px' }}>
      <button onClick={onSwap} title="Smart swap"
        style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '4px', cursor: 'pointer', color: '#818cf8', fontWeight: '800' }}>⇄</button>
      <button onClick={onUp} disabled={index === 0}
        style={{ fontSize: '10px', padding: '2px 6px', background: index === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.09)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#374151' : '#818cf8', opacity: index === 0 ? 0.35 : 1 }}>↑</button>
      <button onClick={onDown} disabled={index === total - 1}
        style={{ fontSize: '10px', padding: '2px 6px', background: index === total - 1 ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.09)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', cursor: index === total - 1 ? 'not-allowed' : 'pointer', color: index === total - 1 ? '#374151' : '#818cf8', opacity: index === total - 1 ? 0.35 : 1 }}>↓</button>
      <button onClick={onDelete}
        style={{ fontSize: '10px', padding: '2px 6px', background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.28)', borderRadius: '4px', cursor: 'pointer', color: '#f87171', fontWeight: '800' }}>✕</button>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// SINGLE PAPER
// FIX: isLandscapeHalf properly handled (Code 2)
// FIX: totalMarks respects removeQuestions
// FIX: Page 1 in footer (Code 2)
// FIX: configurable watermark text
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function SinglePaper({
  mcqs, shortQuestions, longQuestions, metadata, matrixId, paperCode,
  showAnswers, isVariantB, showExpectedTime, showCoverage, teacherNotes,
  settings, marksPerShort, marksPerLong, zoom, onSwap, onUp, onDown, onDelete,
  isLandscapeHalf,
}: any) {
  const showMCQs = !settings.removeQuestions.includes('MCQs');
  const showSQs  = !settings.removeQuestions.includes('SQs');
  const showLQs  = !settings.removeQuestions.includes('LQs');

  // FIX: totalMarks respects removeQuestions — only counts visible sections
  const totalMarks =
    (showMCQs ? mcqs.length : 0) +
    (showSQs ? shortQuestions.length * marksPerShort : 0) +
    (showLQs ? longQuestions.length * marksPerLong : 0);

  const displayMcqs = isVariantB
    ? shuffle(mcqs).map((q: any) => ({ ...q, _opts: shuffle(getOpts(q)) }))
    : mcqs;

  const qrValue = [
  'ZeeShaoor.pk — Verified Paper',
  `Code: ${paperCode}`,
  `Class: ${metadata.class}`,
  `Subject: ${metadata.subject}`,
  `Total Marks: ${totalMarks}`,
  `Generated: ${new Date().toLocaleDateString('en-PK')}`,
].join('\n');
  const fontSz  = isLandscapeHalf ? 11 : (settings.medium === 'Urdu Medium' ? settings.fontUrdu : settings.fontEnglish);
  const fontFam = settings.medium === 'Urdu Medium'
    ? '"Jameel Noori Nastaleeq","Noto Nastaliq Urdu",serif'
    : '"Times New Roman",Times,serif';
  const isRtl   = settings.medium === 'Urdu Medium';

  const borderMCQ = settings.borderWith.includes('MCQs');
  const borderSQ  = settings.borderWith.includes('SQs');
  const borderLQ  = settings.borderWith.includes('LQs');

  const paperStyle: React.CSSProperties = isLandscapeHalf ? {
    width: '148mm', minHeight: '210mm', backgroundColor: '#fff', color: '#000',
    padding: '8mm 10mm', fontFamily: fontFam, fontSize: `${fontSz}px`,
    position: 'relative', display: 'flex', flexDirection: 'column',
    border: '1px solid #000',
  } : {
    width: '210mm', minHeight: '297mm', backgroundColor: '#fff', color: '#000',
    padding: '16mm 20mm', fontFamily: fontFam, fontSize: `${fontSz}px`,
    direction: isRtl ? 'rtl' : 'ltr', position: 'relative',
    display: 'flex', flexDirection: 'column',
    transform: `scale(${(zoom || 100) / 100})`, transformOrigin: 'top center',
    boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
    transition: 'transform 0.2s ease',
  };

  return (
    <div id={isVariantB ? 'paper-B' : 'paper-A'} className="print-matrix" style={paperStyle}>
      {showAnswers && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(-45deg)', fontSize: isLandscapeHalf ? '60px' : '90px', fontWeight: '900', color: 'rgba(220,38,38,0.04)', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 0, userSelect: 'none' }}>
          {settings.watermarkText}
        </div>
      )}
      {isVariantB && (
        <div style={{ position: 'absolute', top: '5mm', right: '5mm', background: '#dc2626', color: '#fff', padding: '2px 10px', fontSize: '10px', fontWeight: 'bold', borderRadius: '3px', zIndex: 10 }}>VARIANT B</div>
      )}

      {/* FIX: zIndex:1 on content so watermark stays behind */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <PaperHeader
          template={settings.headerTemplate}
          metadata={metadata}
          paperCode={isVariantB ? paperCode + '-B' : paperCode}
          matrixId={matrixId}
          totalMarks={totalMarks}
          mcqs={mcqs}
          shortQuestions={shortQuestions}
          longQuestions={longQuestions}
          showAnswers={showAnswers}
          showExpectedTime={showExpectedTime}
          showCoverage={showCoverage}
          qrValue={qrValue}
          marksPerShort={marksPerShort}
          marksPerLong={marksPerLong}
          watermarkText={settings.watermarkText}
          settings={settings}
        />
      </div>

      <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
       {/* MCQs */}
        {showMCQs && displayMcqs.length > 0 && (
          <div style={{ marginBottom: `${settings.spacingMCQ + 8}px`, border: borderMCQ ? '1px solid #000' : 'none', padding: borderMCQ ? '10px' : '0', borderRadius: borderMCQ ? '4px' : '0', ...(settings.pageBreak === 'Yes' ? { pageBreakAfter: 'always' as const } : {}) }}>
            <h2 style={{ fontSize: `${fontSz + 1}px`, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Section A: Multiple Choice ({mcqs.length} × 1 = {mcqs.length} Marks)</span>
              {showExpectedTime && <span style={{ fontSize: '9px', color: '#777', fontWeight: 'normal' }}>⏱ ~{mcqs.length}m</span>}
            </h2>
            {displayMcqs.map((q: any, i: number) => {
              const opts = q._opts || getOpts(q);
              const ansVal = getAnswer(q);
              const ansLetter = getAnswerLetter(q);
              const bloom = q.bloom_level || q.bloomLevel;
              return (
                <div key={i} style={{ marginBottom: `${settings.spacingMCQ}px`, pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                    <strong style={{ minWidth: '24px', flexShrink: 0 }}>Q{i + 1}.</strong>
                    <div style={{ flex: 1 }}>{getText(q)}</div>
                    {bloom && <span style={{ fontSize: '8px', padding: '1px 5px', borderRadius: '8px', background: BLOOM_COLORS[bloom] || '#999', color: '#fff', whiteSpace: 'nowrap', alignSelf: 'center', flexShrink: 0 }}>{bloom}</span>}
                    {!isVariantB && (
                      <QControls index={i} total={displayMcqs.length}
                        onSwap={() => onSwap('mcq', i)} onUp={() => onUp('mcq', i)} onDown={() => onDown('mcq', i)} onDelete={() => onDelete('mcq', i)} />
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', paddingLeft: '29px', marginTop: '5px' }}>
                    {opts.map((opt: string, oi: number) => {
                      const lbl = ['A', 'B', 'C', 'D'][oi];
                      const isCorrect = showAnswers && (opt === ansVal || lbl === ansLetter);
                      return (
                        <div key={oi} style={{ display: 'flex', alignItems: 'flex-start', padding: '2px 6px', background: isCorrect ? 'rgba(22,163,74,0.1)' : 'transparent', border: isCorrect ? '1px solid #16a34a' : '1px solid transparent', borderRadius: '3px' }}>
                          <strong style={{ marginRight: '4px', flexShrink: 0 }}>{lbl})</strong>
                          <span style={{ fontSize: `${settings.fontEquation}px` }}>{opt}</span>
                          {isCorrect && <span style={{ color: '#16a34a', marginLeft: '3px', flexShrink: 0 }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

   {/* ------ BUBBLE SHEET — MCQ ke neeche same paper pe ------ */}
            {mcqs.length > 0 && (
              <div style={{ marginTop: '20px', border: '1.5px solid #000', borderRadius: '6px', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ background: '#1e1b4b', color: '#fff', padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    ⭕ MCQ Answer Sheet
                  </div>
                  <div style={{ fontSize: '8px', color: '#c4b5fd', fontWeight: '700' }}>
                    Fill with BLACK pen only · Pencil NOT allowed
                  </div>
                </div>
                {/* Bubbles */}
                <div style={{ padding: '10px 14px', background: '#fafafa' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px 10px' }}>
                    {mcqs.map((_: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '3px 6px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '5px' }}>
                        <strong style={{ minWidth: '18px', fontSize: '9px', color: '#374151' }}>{i + 1}.</strong>
                        {['A','B','C','D'].map(opt => (
                          <div key={opt} style={{ width: '17px', height: '17px', borderRadius: '50%', border: '1.5px solid #1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: '800', color: '#1e1b4b' }}>{opt}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Footer */}
                <div style={{ background: '#f3f4f6', borderTop: '1px solid #e5e7eb', padding: '4px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '7px', color: '#6b7280', fontWeight: '600' }}>
                    ✂ Cutting/overwriting = WRONG answer
                  </div>
                  <div style={{ fontSize: '7px', color: '#6b7280', fontWeight: '600' }}>
                    One bubble per question only
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Short Qs */}
        {showSQs && shortQuestions.length > 0 && (
          <div style={{ marginBottom: `${settings.spacingSQ + 8}px`, border: borderSQ ? '1px solid #000' : 'none', padding: borderSQ ? '10px' : '0', borderRadius: borderSQ ? '4px' : '0', ...(settings.pageBreak === 'Yes' ? { pageBreakAfter: 'always' as const } : {}) }}>
            <h2 style={{ fontSize: `${fontSz + 1}px`, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Section B: Short Questions ({shortQuestions.length} × {marksPerShort} = {shortQuestions.length * marksPerShort} Marks)</span>
              {showExpectedTime && <span style={{ fontSize: '9px', color: '#777', fontWeight: 'normal' }}>⏱ ~{shortQuestions.length * 4}m</span>}
            </h2>
            {shortQuestions.map((q: any, i: number) => {
              const ans = getAnswer(q);
              return (
                <div key={i} style={{ marginBottom: `${settings.spacingSQ}px`, pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                    <strong style={{ minWidth: '24px', flexShrink: 0 }}>Q{i + 1}.</strong>
                    <div style={{ flex: 1 }}>{getText(q)}</div>
                    <QControls index={i} total={shortQuestions.length}
                      onSwap={() => onSwap('short', i)} onUp={() => onUp('short', i)} onDown={() => onDown('short', i)} onDelete={() => onDelete('short', i)} />
                  </div>
                  {showAnswers && ans ? (
                    <div style={{ marginTop: '3px', padding: '4px 10px', background: '#fffbeb', borderLeft: '3px solid #f59e0b', fontSize: `${fontSz - 1}px` }}><strong>Ans:</strong> {ans}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
        {/* Long Qs */}
        {showLQs && longQuestions.length > 0 && (
          <div style={{ marginBottom: `${settings.spacingLQ + 8}px`, border: borderLQ ? '1px solid #000' : 'none', padding: borderLQ ? '10px' : '0', borderRadius: borderLQ ? '4px' : '0' }}>
            <h2 style={{ fontSize: `${fontSz + 1}px`, fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1.5px solid #000', paddingBottom: '3px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Section C: Long Questions ({longQuestions.length} × {marksPerLong} = {longQuestions.length * marksPerLong} Marks)</span>
              {showExpectedTime && <span style={{ fontSize: '9px', color: '#777', fontWeight: 'normal' }}>⏱ ~{longQuestions.length * 10}m</span>}
            </h2>
            {longQuestions.map((q: any, i: number) => {
              const ans = getAnswer(q);
              return (
                <div key={i} style={{ marginBottom: `${settings.spacingLQ}px`, pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                    <strong style={{ minWidth: '24px', flexShrink: 0 }}>Q{i + 1}.</strong>
                    <div style={{ flex: 1 }}>{getText(q)}</div>
                    <QControls index={i} total={longQuestions.length}
                      onSwap={() => onSwap('long', i)} onUp={() => onUp('long', i)} onDown={() => onDown('long', i)} onDelete={() => onDelete('long', i)} />
                  </div>
                  {showAnswers && ans ? (
                    <div style={{ marginTop: '3px', padding: '4px 10px', background: '#fef2f2', borderLeft: '3px solid #ef4444', fontSize: `${fontSz - 1}px` }}><strong>Ans:</strong> {ans}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {teacherNotes && (
          <div className="no-print" style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(99,102,241,0.06)', border: '1.5px dashed #6366f1', borderRadius: '8px' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#6366f1', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>🗒 Teacher Notes (Private)</div>
            <div style={{ fontSize: '11px', color: '#374151', whiteSpace: 'pre-wrap' }}>{teacherNotes}</div>
          </div>
        )}
      </div>

      {/* FIX: Page 1 in footer + tagline + code (merged Code 1 + Code 2) */}
      <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1, fontSize: '8px', color: '#555' }}>
        <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Awakening Intellect, Anchoring Truth</div>
        <div style={{ fontFamily: 'monospace', color: '#aaa' }}>{isVariantB ? paperCode + '-B' : paperCode} | ZeeShaoor.pk</div>
        <div>Page 1</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// SIDEBAR TOGGLE SWITCH
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const ToggleSwitch = ({ val }: { val: boolean }) => (
  <div style={{ width: '34px', height: '20px', borderRadius: '10px', background: val ? '#a855f7' : 'rgba(255,255,255,0.12)', position: 'relative', flexShrink: 0, transition: 'background 0.2s', border: val ? 'none' : '1px solid rgba(255,255,255,0.12)', pointerEvents: 'none' }}>
    <div style={{ position: 'absolute', top: '3px', left: val ? '16px' : '3px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.2s' }} />
  </div>
);

const SBtnRow = ({ icon, label, active, onClick, shortcut }: any) => (
  <button onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 12px', background: active ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.02)', border: active ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '4px', gap: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '14px' }}>{icon}</span>
      <span style={{ fontSize: '11px', color: active ? '#d8b4fe' : '#9ca3af', fontWeight: '600' }}>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {shortcut && <span style={{ fontSize: '8px', color: '#4b5563', fontFamily: 'monospace', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '3px' }}>{shortcut}</span>}
      <ToggleSwitch val={active} />
    </div>
  </button>
);

const AccordionSection = ({ id, label, openSections, toggle, children }: any) => {
  const isOpen = openSections.includes(id);
  return (
    <div style={{ marginBottom: '4px' }}>
      <button onClick={() => toggle(id)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', cursor: 'pointer', marginBottom: isOpen ? '6px' : '0' }}>
        <span style={{ fontSize: '9px', fontWeight: '800', color: '#6b7280', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ color: '#4b5563', fontSize: '10px', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▾</span>
      </button>
      {isOpen && <div style={{ padding: '2px 0 6px 0' }}>{children}</div>}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// MARKS STEPPER (inline in sidebar)
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const MarksStepper = ({ label, value, setValue, color }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '4px' }}>
    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button onClick={() => setValue((v: number) => Math.max(1, v - 1))} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db', cursor: 'pointer', fontSize: '13px' }}>−</button>
      <span style={{ width: '28px', textAlign: 'center', fontWeight: '800', fontSize: '14px', color }}>{value}</span>
      <button onClick={() => setValue((v: number) => Math.min(20, v + 1))} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db', cursor: 'pointer', fontSize: '13px' }}>+</button>
    </div>
  </div>
);

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ZOOM STEPPER (inline in sidebar)
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const ZoomStepper = ({ zoom, setZoom }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '4px' }}>
    <span style={{ fontSize: '11px', color: '#9ca3af' }}>Preview Zoom</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <button onClick={() => setZoom((v: number) => Math.max(40, v - 5))} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db', cursor: 'pointer', fontSize: '13px' }}>−</button>
      <span style={{ width: '36px', textAlign: 'center', fontWeight: '800', fontSize: '13px', color: '#60a5fa' }}>{zoom}%</span>
      <button onClick={() => setZoom((v: number) => Math.min(150, v + 5))} style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#d1d5db', cursor: 'pointer', fontSize: '13px' }}>+</button>
    </div>
  </div>
);

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// MAIN EXPORT — PaperRenderer
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
export default function PaperRenderer({ paperData, metadata }: PaperProps) {
  const { mcqs: rawMcqs = [], shortQuestions: rawShort = [], longQuestions: rawLong = [] } = paperData;

  // Question state
  const [mcqs,    setMcqs]    = useState(rawMcqs);
  const [shortQs, setShortQs] = useState(rawShort);
  const [longQs,  setLongQs]  = useState(rawLong);

  // View toggles
  const [showAnswers,    setShowAnswers]    = useState(false);
  const [showBubble,     setShowBubble]     = useState(true);
  const [showAnswerKey,  setShowAnswerKey]  = useState(false);
  const [showVariantB,   setShowVariantB]   = useState(false);
  const [showParentCopy, setShowParentCopy] = useState(false);
  const [showTimeGuide,  setShowTimeGuide]  = useState(true);
  const [showCoverage,   setShowCoverage]   = useState(true);
  const [landscapeMode,  setLandscapeMode]  = useState(false);
  const [darkMode,       setDarkMode]       = useState(true);
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [printPreview,   setPrintPreview]   = useState(false);

  // Paper config
  const [marksPerShort,  setMarksPerShort]  = useState(2);
  const [marksPerLong,   setMarksPerLong]   = useState(5);
  const [teacherNotes,   setTeacherNotes]   = useState('');
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [settings,       setSettings]       = useState<typeof DEFAULT_SETTINGS>({ ...DEFAULT_SETTINGS });
  const [showSettings,   setShowSettings]   = useState(false);
  const [zoom,           setZoom]           = useState(100);

  // Sidebar accordion state — all sections open by default
  const [openSections, setOpenSections] = useState(['actions', 'sections', 'marks', 'display', 'paper']);

  // Swap modal
  const [swapModal, setSwapModal] = useState<{ section: 'mcq' | 'short' | 'long'; index: number } | null>(null);

  // FIX: substring not substr
  const matrixId  = useMemo(() => genId(), []);
  const paperCode = useMemo(() => `ZSH-${Date.now().toString(36).toUpperCase().slice(-6)}`, []);

  
  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem('zeeshaoor-paper-state', JSON.stringify({
        mcqs, shortQs, longQs, settings, marksPerShort, marksPerLong,
      }));
    } catch { /* ignore */ }
  }, [mcqs, shortQs, longQs, settings, marksPerShort, marksPerLong]);

  // ------ Keyboard shortcuts ------------------------------------------------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'p' || e.key === 'P') window.print();
      if (e.key === 'a' || e.key === 'A') setShowAnswers(v => !v);
      if (e.key === 'k' || e.key === 'K') setShowAnswerKey(v => !v);
      if (e.key === 's' || e.key === 'S') saveToStorage();
      if (e.key === 'Escape') setPrintPreview(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveToStorage]);

  // ------ Accordion toggle ------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const toggleSection = (id: string) =>
    setOpenSections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // ------ Question operations ---------------------------------------------------------------------------------------------------------------------------------------------------------
  const handleUp = useCallback((section: 'mcq' | 'short' | 'long', i: number) => {
    if (i === 0) return;
    if (section === 'mcq')   setMcqs(p => { const a = [...p]; [a[i], a[i-1]] = [a[i-1], a[i]]; return a; });
    if (section === 'short') setShortQs(p => { const a = [...p]; [a[i], a[i-1]] = [a[i-1], a[i]]; return a; });
    if (section === 'long')  setLongQs(p => { const a = [...p]; [a[i], a[i-1]] = [a[i-1], a[i]]; return a; });
  }, []);

  const handleDown = useCallback((section: 'mcq' | 'short' | 'long', i: number) => {
    if (section === 'mcq')   setMcqs(p => { if (i >= p.length-1) return p; const a = [...p]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
    if (section === 'short') setShortQs(p => { if (i >= p.length-1) return p; const a = [...p]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
    if (section === 'long')  setLongQs(p => { if (i >= p.length-1) return p; const a = [...p]; [a[i], a[i+1]] = [a[i+1], a[i]]; return a; });
  }, []);

  const handleDelete = useCallback((section: 'mcq' | 'short' | 'long', i: number) => {
    if (section === 'mcq')   setMcqs(p => p.filter((_, idx) => idx !== i));
    if (section === 'short') setShortQs(p => p.filter((_, idx) => idx !== i));
    if (section === 'long')  setLongQs(p => p.filter((_, idx) => idx !== i));
  }, []);

 const handleSwapConfirm = useCallback((from: number, to: number) => {
    if (!swapModal) return;
    const { section } = swapModal;
    if (section === 'mcq')   setMcqs(p => { const a = [...p]; [a[from], a[to]] = [a[to], a[from]]; return a; });
    if (section === 'short') setShortQs(p => { const a = [...p]; [a[from], a[to]] = [a[to], a[from]]; return a; });
    if (section === 'long')  setLongQs(p => { const a = [...p]; [a[from], a[to]] = [a[to], a[from]]; return a; });
  }, [swapModal]);

  // ------ Helper: open swap modal ------------------------------------------------------------------------------------------------------------------------------------------
  const handleSwapModal = useCallback((section: 'mcq' | 'short' | 'long', index: number) => {
    setSwapModal({ section, index });
  }, []);
  // FIX: totalMarks respects removeQuestions
  const showMCQs = !settings.removeQuestions.includes('MCQs');
  const showSQs  = !settings.removeQuestions.includes('SQs');
  const showLQs  = !settings.removeQuestions.includes('LQs');
  const totalMarks =
    (showMCQs ? mcqs.length : 0) +
    (showSQs ? shortQs.length * marksPerShort : 0) +
    (showLQs ? longQs.length * marksPerLong : 0);

  // ------ Colors ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const c = {
    bg:      darkMode ? '#09090b' : '#f0f4f8',
    sidebar: darkMode ? 'linear-gradient(180deg,#0f0f15 0%,#0a0a10 100%)' : 'linear-gradient(180deg,#ffffff,#f8fafc)',
    border:  darkMode ? 'rgba(168,85,247,0.18)' : 'rgba(0,0,0,0.08)',
    text:    darkMode ? '#e5e7eb' : '#111827',
    muted:   darkMode ? '#6b7280' : '#9ca3af',
  };

  // ------ What questions the swap modal shows ---------------------------------------------------------------------------------------------------------
  const swapQuestions = swapModal
    ? (swapModal.section === 'mcq' ? mcqs : swapModal.section === 'short' ? shortQs : longQs)
    : [];
  const swapLabel = swapModal
    ? (swapModal.section === 'mcq' ? 'MCQ' : swapModal.section === 'short' ? 'Short Q' : 'Long Q')
    : '';

  // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: c.bg, display: 'flex', transition: 'background 0.3s' }}>

      {/* ══════════ SIDEBAR ══════════ */}
      {sidebarOpen && (
        <div className="no-print" style={{ width: '260px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', background: c.sidebar, borderRight: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', zIndex: 200 }}>

          {/* Sidebar Header */}
          <div style={{ padding: '16px 16px 10px', borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '900', color: '#a855f7', letterSpacing: '1px' }}>ZSH PAPER ENGINE</div>
                <div style={{ fontSize: '9px', color: c.muted, marginTop: '2px' }}>{paperCode} · {totalMarks}M · {mcqs.length + shortQs.length + longQs.length}Qs</div>
              </div>
              <button onClick={() => setSidebarOpen(false)} style={{ width: '26px', height: '26px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${c.border}`, color: c.muted, cursor: 'pointer', fontSize: '12px' }}>✕</button>
            </div>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>

            {/* ACTIONS */}
            <AccordionSection id="actions" label="Actions" openSections={openSections} toggle={toggleSection}>
              <button onClick={() => window.print()}
                style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg,#a855f7,#6366f1)', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '12px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(168,85,247,0.3)', marginBottom: '6px', letterSpacing: '0.5px' }}>
               🖨️ PRINT / PDF &nbsp;<span style={{ fontFamily: 'monospace', fontSize: '9px', opacity: 0.7 }}>[P]</span>
              </button>
              <button onClick={saveToStorage}
                style={{ width: '100%', padding: '9px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: '9px', color: '#34d399', fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginBottom: '6px' }}>
                💾 Save State &nbsp;<span style={{ fontFamily: 'monospace', fontSize: '9px', opacity: 0.7 }}>[S]</span>
              </button>
              <button onClick={() => setPrintPreview(true)}
                style={{ width: '100%', padding: '9px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '9px', color: '#d8b4fe', fontSize: '12px', fontWeight: '700', cursor: 'pointer', marginBottom: '6px' }}>
                🔍 Print Preview
              </button>
              <button onClick={() => setShowSettings(true)}
                style={{ width: '100%', padding: '9px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.border}`, borderRadius: '9px', color: c.muted, fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                ⚙️ Paper Settings
              </button>
            </AccordionSection>

            {/* TOGGLES */}
            <AccordionSection id="sections" label="Include" openSections={openSections} toggle={toggleSection}>
              <SBtnRow icon="🔑" label="Show Answers" active={showAnswers} onClick={() => setShowAnswers(v => !v)} shortcut="A" />
              <SBtnRow icon="⭕" label="Bubble Sheet" active={showBubble} onClick={() => setShowBubble(v => !v)} />
              <SBtnRow icon="📋" label="Answer Key" active={showAnswerKey} onClick={() => setShowAnswerKey(v => !v)} shortcut="K" />
              <SBtnRow icon="🔄" label="Variant B" active={showVariantB} onClick={() => setShowVariantB(v => !v)} />
              <SBtnRow icon="👨‍👩‍👧" label="Parent Copy" active={showParentCopy} onClick={() => setShowParentCopy(v => !v)} />
              <SBtnRow icon="⏱" label="Time Guide" active={showTimeGuide} onClick={() => setShowTimeGuide(v => !v)} />
              <SBtnRow icon="📊" label="Coverage Bar" active={showCoverage} onClick={() => setShowCoverage(v => !v)} />
              <SBtnRow icon="📄" label="2-on-1 Landscape" active={landscapeMode} onClick={() => setLandscapeMode(v => !v)} />
              <SBtnRow icon="🗒" label="Teacher Notes" active={showNotesInput} onClick={() => setShowNotesInput(v => !v)} />
            </AccordionSection>

            {/* MARKS */}
            <AccordionSection id="marks" label="Marks Per Question" openSections={openSections} toggle={toggleSection}>
              <MarksStepper label="Short Q" value={marksPerShort} setValue={setMarksPerShort} color="#10b981" />
              <MarksStepper label="Long Q" value={marksPerLong} setValue={setMarksPerLong} color="#f59e0b" />
            </AccordionSection>

            {/* DISPLAY */}
            <AccordionSection id="display" label="Display" openSections={openSections} toggle={toggleSection}>
              <ZoomStepper zoom={zoom} setZoom={setZoom} />
              <SBtnRow icon={darkMode ? '🌙' : '☀️'} label={darkMode ? 'Dark Mode' : 'Light Mode'} active={darkMode} onClick={() => setDarkMode(v => !v)} />
            </AccordionSection>

            {/* PAPER INFO */}
            <AccordionSection id="paper" label="Paper Info" openSections={openSections} toggle={toggleSection}>
              <div style={{ padding: '8px 12px', background: 'rgba(168,85,247,0.06)', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.15)', fontSize: '10px', color: c.muted, lineHeight: '1.8' }}>
                <div><strong style={{ color: '#a855f7' }}>Code:</strong> {paperCode}</div>
                <div><strong style={{ color: '#a855f7' }}>Matrix ID:</strong> {matrixId}</div>
                <div><strong style={{ color: '#a855f7' }}>MCQs:</strong> {mcqs.length} × 1 = {mcqs.length}M</div>
                <div><strong style={{ color: '#10b981' }}>Short Qs:</strong> {shortQs.length} × {marksPerShort} = {shortQs.length * marksPerShort}M</div>
                <div><strong style={{ color: '#f59e0b' }}>Long Qs:</strong> {longQs.length} × {marksPerLong} = {longQs.length * marksPerLong}M</div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '4px', paddingTop: '4px' }}><strong style={{ color: '#a855f7', fontSize: '11px' }}>TOTAL: {totalMarks} Marks</strong></div>
              </div>
            </AccordionSection>

            {/* KEYBOARD SHORTCUTS */}
            <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: `1px solid ${c.border}`, fontSize: '9px', color: c.muted, lineHeight: '1.8', marginTop: '4px' }}>
              <div style={{ fontWeight: '800', color: '#4b5563', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Shortcuts</div>
              {[['P', 'Print / PDF'], ['A', 'Toggle Answers'], ['K', 'Toggle Key'], ['S', 'Save State'], ['Esc', 'Close Modal']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.07)', padding: '0 5px', borderRadius: '3px' }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Notes Input */}
          {showNotesInput && (
            <div style={{ padding: '10px 12px', borderTop: `1px solid ${c.border}`, flexShrink: 0 }}>
              <div style={{ fontSize: '9px', color: '#818cf8', fontWeight: '700', marginBottom: '5px', textTransform: 'uppercase' }}>🗒 Teacher Notes (Screen only)</div>
              <textarea value={teacherNotes} onChange={e => setTeacherNotes(e.target.value)}
                placeholder="Private notes — not printed on student paper..."
                style={{ width: '100%', minHeight: '70px', background: 'rgba(0,0,0,0.4)', color: '#e5e5e5', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '6px', padding: '7px', fontSize: '11px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>
      )}

      {/* ══════════ MAIN CONTENT ══════════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 24px 80px', overflowX: 'auto', position: 'relative' }}>

        {/* Collapsed sidebar toggle */}
        {!sidebarOpen && (
          <button className="no-print" onClick={() => setSidebarOpen(true)}
            style={{ position: 'fixed', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 300, width: '28px', height: '60px', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '0 8px 8px 0', cursor: 'pointer', color: '#a855f7', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</button>
        )}

        {/* Top status bar */}
        <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, marginBottom: '24px', width: '100%', maxWidth: '240mm', background: 'rgba(9,9,11,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '12px', padding: '10px 16px', boxShadow: '0 8px 40px rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', flexShrink: 0 }} />
          <span style={{ color: '#e5e5e5', fontSize: '11px', fontWeight: '800', letterSpacing: '1px' }}>PAPER READY</span>
          <span style={{ color: '#a855f7', fontSize: '11px', fontWeight: '900', fontFamily: 'monospace', background: 'rgba(168,85,247,0.1)', padding: '1px 8px', borderRadius: '8px' }}>{paperCode}</span>
          <span style={{ color: '#6b7280', fontSize: '10px' }}>{totalMarks}M · {mcqs.length + shortQs.length + longQs.length}Qs</span>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowAnswers(v => !v)} style={{ background: showAnswers ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)', color: showAnswers ? '#fcd34d' : '#d4d4d4', border: showAnswers ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
            {showAnswers ? '👁 HIDE KEY' : '🔑 SHOW KEY'}
          </button>
          <button onClick={() => window.print()} style={{ background: 'linear-gradient(90deg, #a855f7, #6366f1)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(168,85,247,0.35)' }}>
            🖨️ PRINT
          </button>
        </div>

        {/* ------ MAIN PAPER / LANDSCAPE 2-ON-1 ------ */}
        {landscapeMode ? (
          <div className="print-matrix landscape-sheet" style={{ display: 'flex', gap: '0', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginBottom: '24px' }}>
            <SinglePaper
              mcqs={mcqs} shortQuestions={shortQs} longQuestions={longQs}
              metadata={metadata} matrixId={matrixId} paperCode={paperCode}
              showAnswers={showAnswers} isVariantB={false}
              showExpectedTime={showTimeGuide} showCoverage={false}
              teacherNotes={teacherNotes} settings={settings}
              marksPerShort={marksPerShort} marksPerLong={marksPerLong}
              zoom={100} onSwap={handleSwapModal} onUp={handleUp} onDown={handleDown} onDelete={handleDelete}
              isLandscapeHalf={true}
            />
            <div style={{ width: '1px', background: '#000', flexShrink: 0 }} />
            <SinglePaper
              mcqs={mcqs} shortQuestions={shortQs} longQuestions={longQs}
              metadata={metadata} matrixId={matrixId} paperCode={paperCode}
              showAnswers={showAnswers} isVariantB={false}
              showExpectedTime={showTimeGuide} showCoverage={false}
              teacherNotes="" settings={settings}
              marksPerShort={marksPerShort} marksPerLong={marksPerLong}
              zoom={100} onSwap={handleSwapModal} onUp={handleUp} onDown={handleDown} onDelete={handleDelete}
              isLandscapeHalf={true}
            />
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <SinglePaper
              mcqs={mcqs} shortQuestions={shortQs} longQuestions={longQs}
              metadata={metadata} matrixId={matrixId} paperCode={paperCode}
              showAnswers={showAnswers} isVariantB={false}
              showExpectedTime={showTimeGuide} showCoverage={showCoverage}
              teacherNotes={teacherNotes} settings={settings}
              marksPerShort={marksPerShort} marksPerLong={marksPerLong}
              zoom={zoom} onSwap={handleSwapModal} onUp={handleUp} onDown={handleDown} onDelete={handleDelete}
              isLandscapeHalf={false}
            />
          </div>
        )}

        {/* ------ VARIANT B ------ */}
        {showVariantB && (
          <div style={{ marginBottom: '24px' }}>
            <div className="no-print" style={{ textAlign: 'center', marginBottom: '8px', fontSize: '10px', color: '#a855f7', fontWeight: '800', letterSpacing: '2px' }}>------ VARIANT B (ANTI-CHEAT) ------</div>
            <SinglePaper
              mcqs={mcqs} shortQuestions={shortQs} longQuestions={longQs}
              metadata={metadata} matrixId={matrixId} paperCode={paperCode}
              showAnswers={showAnswers} isVariantB={true}
              showExpectedTime={showTimeGuide} showCoverage={showCoverage}
              teacherNotes="" settings={settings}
              marksPerShort={marksPerShort} marksPerLong={marksPerLong}
              zoom={zoom} onSwap={handleSwapModal} onUp={handleUp} onDown={handleDown} onDelete={handleDelete}
              isLandscapeHalf={false}
            />
          </div>
        )}

        {/* ------ ANSWER KEY ------ */}
        {showAnswerKey && (
          <div style={{ marginBottom: '24px' }}>
            <div className="no-print" style={{ textAlign: 'center', marginBottom: '8px', fontSize: '10px', color: '#f87171', fontWeight: '800', letterSpacing: '2px' }}>------ MASTER ANSWER KEY ------</div>
            <AnswerKey mcqs={mcqs} shortQuestions={shortQs} longQuestions={longQs} paperCode={paperCode} />
          </div>
        )}

        {/* ------ PARENT COPY ------ */}
        {showParentCopy && (
          <div style={{ marginBottom: '24px' }}>
            <div className="no-print" style={{ textAlign: 'center', marginBottom: '8px', fontSize: '10px', color: '#34d399', fontWeight: '800', letterSpacing: '2px' }}>------ PARENT COPY ------</div>
            <ParentCopy mcqs={mcqs} shortQuestions={shortQs} longQuestions={longQs} metadata={metadata} paperCode={paperCode} />
          </div>
        )}
      </div>

      {/* ══ PRINT PREVIEW ══ */}
      {printPreview && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.97)', zIndex:3000, display:'flex', flexDirection:'column', alignItems:'center', overflowY:'auto', padding:'60px 20px 40px' }}>
          <div style={{ position:'fixed', top:0, left:0, right:0, height:'52px', background:'rgba(9,9,11,0.97)', borderBottom:'1px solid rgba(168,85,247,0.25)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', zIndex:3001 }}>
            <span style={{ fontSize:'11px', fontWeight:'800', color:'#d8b4fe', letterSpacing:'2px' }}>🔍 PRINT PREVIEW — Esc to close</span>
            <div style={{ display:'flex', gap:'8px' }}>
              <button onClick={() => window.print()} style={{ padding:'7px 18px', background:'linear-gradient(135deg,#a855f7,#6366f1)', border:'none', borderRadius:'8px', color:'#fff', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>🖨️ Print Now</button>
              <button onClick={() => setPrintPreview(false)} style={{ padding:'7px 16px', background:'#dc2626', border:'none', borderRadius:'8px', color:'#fff', fontSize:'12px', fontWeight:'700', cursor:'pointer' }}>✕ Close</button>
            </div>
          </div>
         <div className="print-preview-only" style={{ transform:'scale(0.72)', transformOrigin:'top center', marginTop:'10px' }}>
            <SinglePaper
              mcqs={mcqs} shortQuestions={shortQs} longQuestions={longQs}
              metadata={metadata} matrixId={matrixId} paperCode={paperCode}
              showAnswers={showAnswers} isVariantB={false}
              showExpectedTime={showTimeGuide} showCoverage={showCoverage}
              teacherNotes={teacherNotes} settings={settings}
              marksPerShort={marksPerShort} marksPerLong={marksPerLong}
              zoom={100} onSwap={() => {}} onUp={() => {}} onDown={() => {}} onDelete={() => {}}
              isLandscapeHalf={false}
            />
          </div>
        </div>
      )}

      {/* ══════════ MODALS ══════════ */}
      {showSettings && (
        <SettingsModal settings={settings} onChange={s => setSettings(s)} onClose={() => setShowSettings(false)} />
      )}
      {swapModal && (
        <SwapModal
          questions={swapQuestions}
          currentIndex={swapModal.index}
          sectionLabel={swapLabel}
          onSwap={handleSwapConfirm}
          onClose={() => setSwapModal(null)}
        />
      )}

      {/* ══════════ PRINT + FONT STYLES ══════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap');
        @media print {
          body * { visibility: hidden; }
          .print-matrix, .print-matrix * { visibility: visible; }
          .print-preview-only, .print-preview-only * { display: none !important; visibility: hidden !important; }
          .print-matrix { position: relative !important; box-shadow: none !important; margin: 0 auto !important; transform: none !important; }
          .landscape-sheet { width: 297mm !important; display: flex !important; flex-direction: row !important; }
          @page { size: A4 portrait; margin: 0; }
          aside { display: none !important; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      `}</style>
    </div>
  );
}