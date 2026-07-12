"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Zap,
  FileText,
  BookOpen,
  Layers,
  Award,
  Settings,
  Grid3X3,
  Sparkles,
  CheckCircle2,
  X,
  RotateCcw,
  GraduationCap,
  Atom,
  BookMarked,
  ListChecks,
  ChevronUp,
  ChevronRight,
} from "lucide-react";
import { ninthPhysicsChapters, Topic } from "@/data/ninthPhysicsChapters";
import {
  SQ_PRESETS as SQ_ENGINE_PRESETS,
  SQ_MODE_ORDER,
  SQ_MODE_LABELS,
  sqTotalMarks,
  sqTotalAttempts,
  type SqMode,
  type SqSectionDef,
} from "@/lib/sq-engine";
import {
  LQ_PRESETS as LQ_ENGINE_PRESETS,
  LQ_MODE_ORDER,
  LQ_MODE_LABELS,
  lqTotalMarks,
  lqEstTime,
  lqTotalFromSections,
  type LqMode,
  type LqSectionDef,
} from "@/lib/lq-engine";

const P = {
  bg: "#F7F8FA",
  bgPanel: "#FFFFFF",
  bgElevated: "#F1F3F6",
  bgHover: "rgba(15,23,42,0.04)",
  border: "rgba(15,23,42,0.08)",
  borderStrong: "rgba(15,23,42,0.16)",
  borderActive: "rgba(37,99,235,0.45)",
  steel: "#64748B",
  blue: "#2563EB",
  purple: "#7C3AED",
  gradient: "linear-gradient(135deg,#2563EB,#7C3AED)",
  text: "#1F2937",
  textMuted: "#374151",
  textDim: "rgba(31,41,55,0.72)",
  success: "#059669",
  danger: "#DC2626",
};

const CLASS_SUBJECTS: Record<string, string[]> = {
  "Class 5": ["Maths","English","Urdu","Science","Islamiat","S.Studies"],
  "Class 6": ["Maths","English","Urdu","Science","Islamiat","S.Studies"],
  "Class 7": ["Maths","English","Urdu","Science","Islamiat","S.Studies"],
  "Class 8": ["Maths","English","Urdu","Science","Islamiat","S.Studies"],
  "Class 9": ["Physics","Chemistry","Biology","Maths","English","Urdu","Islamiat","Computer"],
  "Class 10": ["Physics","Chemistry","Biology","Maths","English","Urdu","Islamiat","Computer"],
  "Class 11": ["Physics","Chemistry","Biology","Maths","English","Urdu","Islamiat","Computer","Economics"],
  "Class 12": ["Physics","Chemistry","Biology","Maths","English","Urdu","Islamiat","Computer","Economics"],
};

const SUBJECT_ICONS: Record<string, string> = {
  Physics:"⚛️", Chemistry:"🧪", Biology:"🧬", Maths:"∑",
  English:"A", Urdu:"ا", Islamiat:"☪", Computer:"💻",
  Science:"🔭", "S.Studies":"🌍", Economics:"₨",
};

const SQ_PRESETS = SQ_ENGINE_PRESETS;
const LQ_PRESETS = LQ_ENGINE_PRESETS;

type HybridGroup = 'quick_strict' | 'chapter_monthly' | 'grand_halfbook' | 'ultimate_bise';
interface HybridPreset {
  id: string; group: HybridGroup; label: string; desc: string; tag: string;
  marks: number; time: number; mcq: number;
  sq: { given: number; attempt: number }[];
  lq: { given: number; attempt: number; pairing: boolean }[];
}
const HYBRID_GROUPS: { id: HybridGroup; label: string }[] = [
  { id:'quick_strict', label:'Quick / Strict' },
  { id:'chapter_monthly', label:'Chapter / Monthly' },
  { id:'grand_halfbook', label:'Grand / Half-Book' },
  { id:'ultimate_bise', label:'Ultimate BISE' },
];
const HYBRID_PRESETS: HybridPreset[] = [
  { id:'h_mini20', group:'quick_strict', label:'Mini 20M', desc:'5 MCQ + 3 SQ + 1 LQ (a+b)', tag:'No choice',
    marks:20, time:25, mcq:5, sq:[{given:3,attempt:3}], lq:[{given:1,attempt:1,pairing:true}] },
  { id:'h_concept25', group:'quick_strict', label:'Concept 25M', desc:'6 MCQ + 5 SQ + 1 LQ (a+b)', tag:'No choice',
    marks:25, time:30, mcq:6, sq:[{given:5,attempt:5}], lq:[{given:1,attempt:1,pairing:true}] },
  { id:'h_daily30', group:'quick_strict', label:'Daily 30M', desc:'7 MCQ + 7 SQ + 1 LQ (a+b)', tag:'No choice',
    marks:30, time:35, mcq:7, sq:[{given:7,attempt:7}], lq:[{given:1,attempt:1,pairing:true}] },
  { id:'h_weekly35', group:'quick_strict', label:'Weekly 35M', desc:'10 MCQ + 8 SQ + 1 LQ (a+b)', tag:'No choice',
    marks:35, time:40, mcq:10, sq:[{given:8,attempt:8}], lq:[{given:1,attempt:1,pairing:true}] },
  { id:'h_chapter30', group:'chapter_monthly', label:'Chapter Std 30M', desc:'11 MCQ · SQ 8->5 · 1 LQ (a+b)', tag:'With choice',
    marks:30, time:40, mcq:11, sq:[{given:8,attempt:5}], lq:[{given:2,attempt:1,pairing:true}] },
  { id:'h_smart35', group:'chapter_monthly', label:'Smart Monthly 35M', desc:'10 MCQ · SQ 10->8 · 1 LQ (a+b)', tag:'With choice',
    marks:35, time:45, mcq:10, sq:[{given:10,attempt:8}], lq:[{given:2,attempt:1,pairing:true}] },
  { id:'h_term40', group:'chapter_monthly', label:'Term Intro 40M', desc:'15 MCQ · SQ 12->8 · 1 LQ (a+b)', tag:'With choice',
    marks:40, time:50, mcq:15, sq:[{given:12,attempt:8}], lq:[{given:2,attempt:1,pairing:true}] },
  { id:'h_quarter45', group:'chapter_monthly', label:'Quarter Book 45M', desc:'15 MCQ · SQ 10->6 · 2 LQ composites', tag:'With choice',
    marks:45, time:60, mcq:15, sq:[{given:10,attempt:6}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_half40', group:'grand_halfbook', label:'Half Board 40M', desc:'10 MCQ · SQ 8->6 · 2 LQ composites', tag:'Board replica',
    marks:40, time:55, mcq:10, sq:[{given:8,attempt:6}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_grand50', group:'grand_halfbook', label:'Grand Test 50M', desc:'12 MCQ · 2 SQ sec 7->5 each · 2 LQ composites', tag:'Board replica',
    marks:50, time:70, mcq:12, sq:[{given:7,attempt:5},{given:7,attempt:5}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_preboard60', group:'grand_halfbook', label:'Pre-Board 60M', desc:'12 MCQ · 2 SQ sec (10->7 & 10->8) · 2 LQ composites', tag:'Board replica',
    marks:60, time:80, mcq:12, sq:[{given:10,attempt:7},{given:10,attempt:8}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_full60', group:'ultimate_bise', label:'BISE FULL BOARD 60M', desc:'12 MCQ · 3 SQ sec 8->5 · 2 LQ composites', tag:'★ Crown Jewel',
    marks:60, time:85, mcq:12, sq:[{given:8,attempt:5},{given:8,attempt:5},{given:8,attempt:5}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_strict60', group:'ultimate_bise', label:'Board Strict 60M', desc:'12 MCQ · SQ 15->15 · 2 LQ (no choice)', tag:'No choice',
    marks:60, time:80, mcq:12, sq:[{given:15,attempt:15}], lq:[{given:2,attempt:2,pairing:true}] },
  { id:'h_concept50', group:'ultimate_bise', label:'Board Concept 50M', desc:'14 MCQ · SQ 12->9 · 2 LQ composites', tag:'Concept focus',
    marks:50, time:65, mcq:14, sq:[{given:12,attempt:9}], lq:[{given:3,attempt:2,pairing:true}] },
  { id:'h_elite60', group:'ultimate_bise', label:'Elite Custom 60M', desc:'10 MCQ · 2 SQ sec 10->8 each · 2 LQ composites', tag:'Elite',
    marks:60, time:85, mcq:10, sq:[{given:10,attempt:8},{given:10,attempt:8}], lq:[{given:3,attempt:2,pairing:true}] },
];

interface BoardPreset {
  id: string; label: string; template: 'punjab' | 'federal';
  totalMarks: number; mcq: number;
  sqSections: { given: number; attempt: number }[];
  sqMarksPerQ: number; lqGiven: number; lqAttempt: number; lqMarksPerQ: number;
  desc?: string;
}
const PUNJAB_BOARD_BASE: Omit<BoardPreset, 'id' | 'label'> = {
  template:'punjab', totalMarks:60, mcq:12,
  sqSections:[{given:8,attempt:5},{given:8,attempt:5},{given:8,attempt:5}],
  sqMarksPerQ:2, lqGiven:3, lqAttempt:2, lqMarksPerQ:9,
};
const PUNJAB_BOARDS: { id: string; label: string }[] = [
  { id:'bp_lhr', label:'BISE Lahore' },
  { id:'bp_guj', label:'BISE Gujranwala' },
  { id:'bp_fsd', label:'BISE Faisalabad' },
  { id:'bp_mtn', label:'BISE Multan' },
  { id:'bp_sgd', label:'BISE Sargodha' },
  { id:'bp_rwp', label:'BISE Rawalpindi' },
  { id:'bp_dgk', label:'BISE D.G.Khan' },
  { id:'bp_swl', label:'BISE Sahiwal' },
];
const FEDERAL_BOARD: BoardPreset = {
  id:'bp_fbise', label:'FBISE Federal', template:'federal', totalMarks:65,
  mcq:12, sqSections:[{given:15,attempt:11}], sqMarksPerQ:3,
  lqGiven:3, lqAttempt:2, lqMarksPerQ:10,
  desc:'SLO-Based (Sec A·B·C)',
};
function getBoardPresets(): BoardPreset[] {
  return [...PUNJAB_BOARDS.map(b => ({...b, ...PUNJAB_BOARD_BASE})), FEDERAL_BOARD];
}

const CLASSES = Object.keys(CLASS_SUBJECTS);

type Phase = "mcq"|"sq"|"lq"|"hybrid"|"board"|"custom";

interface LiveConfig {
  mcq: number;
  sq: number;
  lq: number;
  totalMarks: number;
  estTime: number;
  selectionLabel: string;
}

interface Particle { id:number; x:number; y:number; angle:number; color:string }
function useParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const burst = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const colors = [P.blue, P.purple, P.steel];
    const ps: Particle[] = Array.from({length:8}, (_,i) => ({
      id: Date.now()+i, x: cx, y: cy, angle: (i/8)*360, color: colors[i%colors.length],
    }));
    setParticles(ps);
    setTimeout(() => setParticles([]), 700);
  }, []);
  return { particles, burst };
}

function FlipNum({ value }: { value: number }) {
  const [display, setDisplay] = useState(value);
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (value === display) return;
    setFlip(true);
    const t = setTimeout(() => { setDisplay(value); setFlip(false); }, 160);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <span style={{
      display:"inline-block", transition:"transform 0.16s ease, opacity 0.16s",
      transform: flip ? "translateY(-4px)" : "translateY(0)", opacity: flip ? 0 : 1,
      color: P.text, fontWeight:600, fontVariantNumeric:"tabular-nums", fontSize:15,
    }}>{display}</span>
  );
}

function Toast({ msg, onDone }: { msg:string; onDone:()=>void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return ()=>clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)",
      background: P.gradient, color:"#fff", padding:"11px 22px", borderRadius:10,
      fontWeight:500, fontSize:14, zIndex:9999, boxShadow:"0 8px 24px rgba(0,0,0,0.4)",
      animation:"toastIn 0.25s ease",
    }}>{msg}</div>
  );
}

function Stepper({ value, onChange, min=0, max=100, compact }:
  { value:number; onChange:(v:number)=>void; min?:number; max?:number; compact?:boolean }) {
  const s = compact ? { w:24, h:24, font:14, minW:22, gap:4 } : { w:32, h:32, font:18, minW:30, gap:6 };
  return (
    <div style={{ display:"flex", alignItems:"center", gap:s.gap }}>
      <button onClick={() => onChange(Math.max(min, value-1))} style={{
        width:s.w, height:s.h, borderRadius:6, border:`1px solid ${P.border}`,
        background:P.bgElevated, color:P.text, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:s.font, fontWeight:600, lineHeight:1,
      }}>−</button>
      <span style={{ minWidth:s.minW, textAlign:"center", color:P.text, fontWeight:700, fontSize:s.font - 2, lineHeight:1 }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value+1))} style={{
        width:s.w, height:s.h, borderRadius:6, border:`1px solid ${P.border}`,
        background:P.bgElevated, color:P.text, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:s.font, fontWeight:600, lineHeight:1,
      }}>+</button>
    </div>
  );
}

interface OptionBoxProps {
  label: string; sub?: string; selected: boolean;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  wide?: boolean;
}
function OptionBox({ label, sub, selected, onClick, wide }: OptionBoxProps) {
  const [hover, setHover] = useState(false);
  return (
    <div role="button" tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key==="Enter" && onClick(e as unknown as React.MouseEvent<HTMLElement>)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position:"relative", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", gap:3,
        cursor:"pointer", userSelect:"none",
        padding: wide ? "10px 18px" : "9px 12px",
        minWidth: wide ? 120 : 78,
        borderRadius:12,
        border:`1.5px solid ${selected ? 'rgba(99,102,241,0.5)' : (hover ? 'rgba(148,163,184,0.4)' : 'rgba(148,163,184,0.2)')}`,
        background: selected
          ? "linear-gradient(135deg, rgba(238,242,255,0.9), rgba(255,255,255,0.8))"
          : (hover ? "rgba(248,250,252,0.9)" : "rgba(255,255,255,0.5)"),
        transition:"all 0.25s ease",
        transform: hover && !selected ? "translateY(-1px)" : "none",
        boxShadow: selected
          ? "0 4px 12px rgba(99,102,241,0.12), 0 0 0 1px rgba(99,102,241,0.15)"
          : (hover ? "0 4px 12px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.03)"),
      }}>
      <span style={{
        fontSize:14, fontWeight: selected ? 700 : 500,
        color: selected ? '#1e293b' : (hover ? '#1e293b' : P.textMuted),
      }}>{label}</span>
      {sub && <span style={{ fontSize:11, color:P.textDim, fontWeight:500 }}>{sub}</span>}
      {selected && (
        <div style={{
          position:"absolute", top:4, right:4, width:16, height:16, borderRadius:"50%",
          background:P.gradient, display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 2px 6px rgba(37,99,235,0.3)",
        }}><CheckCircle2 size={10} color="#fff"/></div>
      )}
    </div>
  );
}

function TopicChip({ label, selected, onClick }: { label:string; selected:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} style={{
      textAlign:"left", padding:"4px 8px", borderRadius:5,
      border:`1px solid ${selected ? P.borderActive : "transparent"}`,
      background: selected ? "rgba(74,158,202,0.10)" : "transparent",
      color: selected ? P.text : P.textDim,
      fontSize:11.5, fontWeight: selected ? 500 : 400,
      cursor:"pointer", width:"100%",
      display:"flex", alignItems:"center", gap:5,
      transition:"all 0.1s",
    }}>
      <span style={{
        width:12, height:12, borderRadius:3, flexShrink:0,
        border:`1.5px solid ${selected?P.blue:P.border}`,
        background: selected ? P.gradient : "transparent",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>{selected && <CheckCircle2 size={8} color="#fff"/>}</span>
      <span style={{ lineHeight:1.2 }}>{label}</span>
    </button>
  );
}

interface SelectCardProps {
  icon: React.ReactNode; label: string; value: string; disabled?: boolean;
  options: { key:string; label:string; icon?:string }[];
  onSelect: (key:string) => void;
}
function SelectCard({ icon, label, value, disabled, options, onSelect, compact }: SelectCardProps & { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  if (compact && value) {
    return (
      <button onClick={() => setOpen(o=>!o)} style={{
        position:"relative", width:"100%", display:"flex", alignItems:"center", gap:8,
        padding:"8px 12px", borderRadius:9, border:`1px solid ${P.border}`,
        background:P.bgElevated, cursor:"pointer", textAlign:"left",
      }}>
        <span style={{ color:P.steel, display:"flex", flexShrink:0 }}>{icon}</span>
        <span style={{ fontSize:10, color:P.textDim, flexShrink:0 }}>{label}:</span>
        <span style={{ fontSize:13, fontWeight:600, color:P.text, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{value}</span>
        <ChevronDown size={13} color={P.textMuted} style={{ flexShrink:0 }}/>
        {open && (
          <div onClick={e=>e.stopPropagation()} style={{
            position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:30,
            background:P.bgElevated, border:`1px solid ${P.border}`, borderRadius:9,
            padding:5, maxHeight:280, overflowY:"auto", boxShadow:"0 12px 32px rgba(0,0,0,0.15)",
          }}>
            {options.map(opt => (
              <button key={opt.key} onClick={() => { onSelect(opt.key); setOpen(false); }} style={{
                display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left",
                padding:"9px 10px", borderRadius:6, border:"none",
                background: value===opt.label ? "rgba(37,99,235,0.10)" : "transparent",
                color: value===opt.label ? P.text : P.textMuted, fontSize:14, cursor:"pointer",
              }}>{opt.icon && <span>{opt.icon}</span>}{opt.label}</button>
            ))}
          </div>
        )}
      </button>
    );
  }

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button
        onClick={() => !disabled && setOpen(o=>!o)}
        title={value}
        style={{
          width:"100%", display:"flex", alignItems:"flex-start", gap:9,
          padding:"11px 12px", borderRadius:9,
          border:`1.5px solid ${open ? P.borderActive : P.border}`,
          background: P.bgElevated, color: value ? P.text : P.textDim,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1, transition:"all 0.15s", textAlign:"left",
        }}>
        <span style={{ color:P.steel, display:"flex", marginTop:2, flexShrink:0 }}>{icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:11, color:P.textDim, marginBottom:2 }}>{label}</div>
          <div style={{ fontSize:14, fontWeight:600, lineHeight:1.35, wordBreak:"break-word" }}>
            {value || `Select ${label.toLowerCase()}`}
          </div>
        </div>
        <ChevronDown size={14} style={{ transform:open?"rotate(180deg)":"none", transition:"transform 0.15s", flexShrink:0, marginTop:3 }}/>
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 4px)", left:0, right:0, zIndex:30,
          background:P.bgElevated, border:`1px solid ${P.border}`, borderRadius:9,
          padding:5, maxHeight:280, overflowY:"auto",
          boxShadow:"0 12px 32px rgba(0,0,0,0.5)",
        }}>
          {options.length===0 && (
            <div style={{ padding:"9px 10px", fontSize:13, color:P.textDim }}>Nothing to select</div>
          )}
          {options.map(opt => (
            <button key={opt.key}
              onClick={() => { onSelect(opt.key); setOpen(false); }}
              style={{
                display:"flex", alignItems:"center", gap:8, width:"100%", textAlign:"left",
                padding:"9px 10px", borderRadius:6, border:"none",
                background: value===opt.label ? "rgba(74,158,202,0.14)" : "transparent",
                color: value===opt.label ? P.text : P.textMuted,
                fontSize:14, cursor:"pointer", lineHeight:1.35,
              }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(139,149,168,0.08)")}
              onMouseLeave={e=>(e.currentTarget.style.background=value===opt.label?"rgba(74,158,202,0.14)":"transparent")}
            >{opt.icon && <span style={{ flexShrink:0 }}>{opt.icon}</span>}<span>{opt.label}</span></button>
          ))}
        </div>
      )}
    </div>
  );
}

interface GridModalProps {
  open: boolean; onClose: () => void;
  selectedClass: string; selectedSubject: string; selectedChapter: string;
  onClassChange: (c:string)=>void; onSubjectChange: (s:string)=>void; onChapterChange: (ch:string)=>void;
  onApply: () => void;
}
function GridModal({ open, onClose, selectedClass, selectedSubject, selectedChapter, onClassChange, onSubjectChange, onChapterChange, onApply }: GridModalProps) {
  const [step, setStep] = useState<"class"|"subject"|"chapter">("class");
  const { particles, burst } = useParticles();
  const subjects = selectedClass ? CLASS_SUBJECTS[selectedClass] || [] : [];

  const chapters = useMemo(() => {
    if (selectedClass==="Class 9" && selectedSubject==="Physics") {
      return ninthPhysicsChapters.map(c => ({ id:`ch${c.id}`, label:`Ch ${c.id}: ${c.name}` }));
    }
    return [];
  }, [selectedClass, selectedSubject]);

  useEffect(() => { if (open) setStep("class"); }, [open]);

  const stepDone = (s:"class"|"subject"|"chapter") => {
    if (s==="class") return !!selectedClass;
    if (s==="subject") return !!selectedSubject;
    return !!selectedChapter;
  };

  const handleApplyClick = (e: React.MouseEvent<HTMLElement>) => {
    burst(e);
    setTimeout(onApply, 250);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position:"fixed", inset:0, zIndex:40, background:"rgba(6,6,12,0.7)",
        backdropFilter: open ? "blur(6px)" : "none",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none", transition:"opacity 0.25s",
      }}/>
      <div style={{
        position:"fixed", left:"50%", top:"50%", zIndex:50,
        width:640, maxWidth:"92vw", maxHeight:"85vh",
        background:P.bgPanel, border:`1px solid ${P.border}`, borderRadius:14,
        boxShadow:"0 20px 60px rgba(0,0,0,0.55)",
        display:"flex", flexDirection:"column",
        transform: open ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.96)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition:"all 0.25s ease", overflow:"hidden",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:`1px solid ${P.border}`, flexShrink:0 }}>
          <span style={{ fontSize:16, fontWeight:600, color:P.text }}>Select paper scope</span>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:7, border:`1px solid ${P.border}`, background:"transparent", color:P.textMuted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><X size={16}/></button>
        </div>

        <div style={{ display:"flex", alignItems:"center", padding:"12px 20px", flexShrink:0, gap:4 }}>
          {(["class","subject","chapter"] as const).map((s,i) => (
            <React.Fragment key={s}>
              <button onClick={() => (s!=="chapter" || stepDone("subject")) && setStep(s)} style={{
                display:"flex", alignItems:"center", gap:6, padding:"5px 11px", borderRadius:20,
                border:"none", cursor:"pointer",
                background: step===s ? "rgba(74,158,202,0.15)" : "transparent",
                color: step===s ? P.blue : (stepDone(s) ? P.steel : P.textDim),
                fontWeight: step===s ? 600 : 400, fontSize:13,
              }}>
                {stepDone(s) ? <CheckCircle2 size={14} color={P.success}/> : <span style={{ width:14, height:14, borderRadius:"50%", border:`1.5px solid ${step===s?P.blue:P.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color:P.textDim }}>{i+1}</span>}
                {s==="class"?"Class":s==="subject"?"Subject":"Chapter"}
              </button>
              {i<2 && <div style={{ flex:1, height:1, background: stepDone(s) ? P.blue : P.border }}/>}
            </React.Fragment>
          ))}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"0 20px 20px" }}>
          {step==="class" && (
            <div>
              <p style={{ fontSize:12, color:P.textDim, marginBottom:10, fontWeight:500, letterSpacing:0.5 }}>SELECT CLASS</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {CLASSES.map(c => (
                  <button key={c} onClick={() => { onClassChange(c); setStep("subject"); }} style={{
                    padding:"11px 18px", borderRadius:9,
                    border:`1.5px solid ${selectedClass===c ? P.borderActive : P.border}`,
                    background: selectedClass===c ? "rgba(74,158,202,0.10)" : P.bgElevated,
                    color: selectedClass===c ? P.text : P.textMuted,
                    fontWeight: selectedClass===c ? 600 : 400, cursor:"pointer", fontSize:14,
                  }}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {step==="subject" && selectedClass && (
            <div>
              <p style={{ fontSize:12, color:P.textDim, marginBottom:10, fontWeight:500, letterSpacing:0.5 }}>SELECT SUBJECT - {selectedClass}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {subjects.map(s => (
                  <button key={s} onClick={() => { onSubjectChange(s); setStep("chapter"); }} style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                    padding:"15px 20px", borderRadius:10,
                    border:`1.5px solid ${selectedSubject===s ? P.borderActive : P.border}`,
                    background: selectedSubject===s ? "rgba(74,158,202,0.10)" : P.bgElevated,
                    cursor:"pointer",
                  }}>
                    <span style={{ fontSize:19, color:P.blue }}>{SUBJECT_ICONS[s]||"🔸"}</span>
                    <span style={{ fontSize:13, fontWeight:500, color: selectedSubject===s ? P.text : P.textMuted }}>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step==="chapter" && selectedSubject && (
            <div>
              <p style={{ fontSize:12, color:P.textDim, marginBottom:10, fontWeight:500, letterSpacing:0.5 }}>SELECT CHAPTER - {selectedSubject}</p>
              {chapters.length > 0 ? (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  <button onClick={() => onChapterChange("mix")} style={{
                    padding:"9px 16px", borderRadius:20,
                    border:`1.5px solid ${selectedChapter==="mix" ? P.borderActive : P.border}`,
                    background: selectedChapter==="mix" ? P.gradient : "transparent",
                    color: selectedChapter==="mix" ? "#fff" : P.textDim,
                    fontWeight:600, fontSize:13, cursor:"pointer",
                  }}>Mix all</button>
                  {chapters.map(ch => (
                    <button key={ch.id} onClick={() => onChapterChange(ch.id)} style={{
                      padding:"9px 14px", borderRadius:9, fontSize:13,
                      border:`1.5px solid ${selectedChapter===ch.id ? P.borderActive : P.border}`,
                      background: selectedChapter===ch.id ? "rgba(74,158,202,0.10)" : P.bgElevated,
                      color: selectedChapter===ch.id ? P.text : P.textMuted, cursor:"pointer",
                    }}>{ch.label}</button>
                  ))}
                </div>
              ) : (
                <p style={{ color:P.textDim, fontSize:14 }}>Chapter data coming soon...</p>
              )}
            </div>
          )}
        </div>

        {selectedClass && selectedSubject && (
          <div style={{ padding:"14px 20px", borderTop:`1px solid ${P.border}`, flexShrink:0, position:"relative" }}>
            <div role="button" tabIndex={0} onClick={handleApplyClick} style={{
              position:"relative", overflow:"hidden", display:"flex", alignItems:"center",
              justifyContent:"center", gap:8, padding:"13px 24px", borderRadius:10,
              background: P.gradient, color:"#fff", fontWeight:600, fontSize:15, cursor:"pointer",
            }}>
              <CheckCircle2 size={17}/>
              Apply - {selectedClass} · {selectedSubject}
              {selectedChapter ? ` · ${selectedChapter==="mix"?"Mix":(chapters.find(c=>c.id===selectedChapter)?.label||selectedChapter)}` : ""}
            </div>
            {particles.map(p => (
              <div key={p.id} style={{
                position:"absolute", left:p.x, top:p.y, width:5, height:5, borderRadius:"50%",
                background:p.color, animation:`particleBurst 0.7s ease-out forwards`,
                transform:`rotate(${p.angle}deg)`, pointerEvents:"none",
              }}/>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ModeTabs<T extends string>({ order, labels, active, onChange }:
  { order: readonly T[]; labels: Record<T,string>; active: T; onChange:(m:T)=>void }) {
  return (
    <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
      {order.map(m => (
        <button key={m} onClick={(e) => { e.stopPropagation(); onChange(m); }} style={{
          padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer",
          border:`1px solid ${active===m ? P.borderActive : P.border}`,
          background: active===m ? "rgba(74,158,202,0.12)" : "transparent",
          color: active===m ? P.text : P.textMuted,
        }}>{labels[m]}</button>
      ))}
    </div>
  );
}

function boardPills(bp: BoardPreset) {
  const sqAtt = bp.sqSections.reduce((s,sec)=>s+sec.attempt,0);
  const sqMarks = sqAtt * bp.sqMarksPerQ;
  const sameShape = bp.sqSections.every(s => s.given===bp.sqSections[0].given && s.attempt===bp.sqSections[0].attempt);
  const sqPillLabel = sameShape
    ? `${bp.sqSections.length} Part${bp.sqSections.length>1?"s":""} SQ (${bp.sqSections[0].attempt}/${bp.sqSections[0].given}) (${sqMarks}M)`
    : `SQ ${sqAtt} of ${bp.sqSections.reduce((s,sec)=>s+sec.given,0)} (${sqMarks}M)`;
  const lqMarks = bp.lqAttempt * bp.lqMarksPerQ;
  return {
    mcqPill: `${bp.mcq} MCQs (${bp.mcq}M)`,
    sqPill: sqPillLabel,
    lqPill: `${bp.lqAttempt}/${bp.lqGiven} LQs (${lqMarks}M)`,
  };
}

// ---------------------------------------------------------------------------------------------------------------------------------------
// Accordion row — collapsed shows name + one-line summary,
// clicking expands the full options below.
// ---------------------------------------------------------------------------------------------------------------------------------------
interface AccordionRowProps {
  icon: React.ReactNode; label: string; summary: string;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}
function AccordionRow({ icon, label, summary, open, onToggle, children }: AccordionRowProps) {
  return (
    <div style={{
      border:`1.5px solid ${open ? P.borderActive : P.border}`, borderRadius:12,
      background: open ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
      overflow:"hidden", transition:"all 0.15s",
    }}>
      <div onClick={onToggle} style={{
        display:"flex", alignItems:"center", gap:10, padding:"11px 14px", cursor:"pointer",
      }}>
        <div style={{
          width:30, height:30, borderRadius:8, flexShrink:0,
          background: open ? P.gradient : P.bgElevated,
          display:"flex", alignItems:"center", justifyContent:"center",
          color: open ? "#fff" : P.steel,
        }}>{icon}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <span style={{ fontSize:13.5, fontWeight:700, color: open ? P.text : P.textMuted }}>{label}</span>
          {!open && <span style={{ fontSize:11.5, color:P.textDim, marginLeft:8 }}>{summary}</span>}
        </div>
        {open ? <ChevronUp size={15} color={P.blue}/> : <ChevronDown size={15} color={P.textMuted}/>}
      </div>
      {open && (
        <div style={{ padding:"0 14px 14px" }} onClick={e => e.stopPropagation()}>
          {children}
        </div>
      )}
    </div>
  );
}

export default function GeneratorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status==="unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  const [gridOpen, setGridOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState("Class 9");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const [mcqCount, setMcqCount] = useState(10);

  const [sqPattern, setSqPattern] = useState<string>("flex_choice_topical_quiz");
  const [sqMode, setSqMode] = useState<SqMode>("flexible_choice");
  const [sqSections, setSqSections] = useState<SqSectionDef[]>([{ label:"All", given:5, attempt:5 } as SqSectionDef]);
  const [sqBalance, setSqBalance] = useState({ easy:30, medium:40, hard:30, knowledge:35, comprehension:40, application:25, theory:70, numerical:30 });

  const [lqMode, setLqMode] = useState<LqMode>("bise_pattern");
  const [lqPattern, setLqPattern] = useState<string>("lq_bise_full");
  const [lqSections, setLqSections] = useState<{ label:string; given:number; attempt:number; abPairing:boolean }[]>([]);

  const [hybridGroup, setHybridGroup] = useState<HybridGroup>("quick_strict");
  const [hybridPreset, setHybridPreset] = useState<string>("h_mini20");

  const [boardPattern, setBoardPattern] = useState<string>("bp_lhr");

  const [customMcq, setCustomMcq] = useState(10);
  const [customSq, setCustomSq] = useState(5);
  const [customLq, setCustomLq] = useState(3);
  const [customChoice, setCustomChoice] = useState(false);
  const [customDiagram, setCustomDiagram] = useState(false);

  const [activePhase, setActivePhase] = useState<Phase>("mcq");
  const [openSection, setOpenSection] = useState<Phase | null>("mcq");
  const [templateTab, setTemplateTab] = useState<"hybrid"|"board">("hybrid");
  const [toast, setToast] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genPulse, setGenPulse] = useState(false);

  const toggleSection = (p: Phase) => {
    setActivePhase(p);
    setOpenSection(prev => prev===p ? null : p);
  };

  useEffect(() => {
    const t = setInterval(() => { setGenPulse(true); setTimeout(() => setGenPulse(false), 500); }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const map: Record<string, Phase> = { "1":"mcq", "2":"sq", "3":"lq", "4":"hybrid", "5":"board", "6":"custom" };
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      if (map[e.key]) toggleSection(map[e.key]);
      if (e.key==="g" || e.key==="G") handleGenerate();
      if (e.key==="Escape") setGridOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const chapters = useMemo(() => {
    if (selectedClass==="Class 9" && selectedSubject==="Physics") {
      return ninthPhysicsChapters.map(c => ({ id:`ch${c.id}`, label:`Ch ${c.id}: ${c.name}`, data: c }));
    }
    return [];
  }, [selectedClass, selectedSubject]);

  const topics: Topic[] = useMemo(() => {
    if (selectedClass==="Class 9" && selectedSubject==="Physics") {
      if (selectedChapters.length === 0) return [];
      const all: Topic[] = [];
      selectedChapters.forEach(chId => {
        const chNum = parseInt(chId.replace("ch",""));
        const found = ninthPhysicsChapters.find(c => c.id===chNum);
        if (found?.topics) all.push(...found.topics);
      });
      return all;
    }
    return [];
  }, [selectedClass, selectedSubject, selectedChapters]);

  useEffect(() => {
    setSelectedTopics(prev => {
      const validIds = new Set<string>();
      chapters.forEach(ch => ch.data?.topics.forEach(t => validIds.add(t.id)));
      return prev.filter(id => validIds.has(id));
    });
  }, [chapters]);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  };

  const getLiveConfig = useCallback((): LiveConfig => {
    let mcq=0, sq=0, lq=0, totalMarks=0, estTime=0, selectionLabel="";
    switch(activePhase) {
      case "mcq":
        mcq=mcqCount; totalMarks=mcqCount; estTime=Math.round(mcqCount*1.2);
        selectionLabel=`MCQ ×${mcqCount}`; break;
      case "sq": {
        const preset = SQ_PRESETS.find(p=>p.id===sqPattern);
        const sections = sqMode==="custom_builder" ? sqSections : (preset?.sections||[{label:"All",given:0,attempt:0}]);
        sq = sections.reduce((s,sec)=>s+sec.attempt,0);
        totalMarks = sqTotalMarks(sections); estTime = sq*5;
        selectionLabel=`SQ - ${preset?.label||"Custom"}`; break;
      }
      case "lq": {
        const preset = LQ_PRESETS.find(p=>p.id===lqPattern);
        if (lqMode==="custom_builder" && lqSections.length > 0) {
          const agg = lqTotalFromSections(lqSections.map(s => ({ label:s.label, given:s.given, attempt:s.attempt, enforcePairing:s.abPairing })));
          lq = agg.totalAttempt;
          totalMarks = agg.totalMarks;
          estTime = agg.totalAttempt * 10;
          selectionLabel=`LQ - Custom (${lqSections.length} sections)`; break;
        }
        const given = preset?.given||3;
        const attempt = preset?.attempt||2;
        const pairing = preset?.enforcePairing??true;
        lq = attempt;
        totalMarks = lqTotalMarks(given, attempt, pairing);
        estTime = lqEstTime(given, attempt, pairing);
        selectionLabel=`LQ - ${preset?.label||""}`; break;
      }
      case "hybrid": {
        const hp=HYBRID_PRESETS.find(p=>p.id===hybridPreset);
        if (!hp) { mcq=0; sq=0; lq=0; totalMarks=0; estTime=0; selectionLabel="Hybrid - Select"; break; }
        mcq=hp.mcq;
        sq=hp.sq.reduce((s,sec)=>s+sec.attempt,0);
        lq=hp.lq.reduce((s,sec)=>s+sec.attempt,0);
        totalMarks=hp.marks||(mcq+sq*2+lq*9);
        estTime=hp.time||(mcq*1+sq*5+lq*10);
        selectionLabel=`Hybrid - ${hp.label||""}`; break;
      }
      case "board": {
        const bp = getBoardPresets().find(p => p.id === boardPattern);
        if (!bp) { mcq=0; sq=0; lq=0; totalMarks=0; estTime=0; selectionLabel="Board - Select"; break; }
        mcq = bp.mcq;
        const sqAttempt = bp.sqSections.reduce((s,sec)=>s+sec.attempt,0);
        const sqGiven = bp.sqSections.reduce((s,sec)=>s+sec.given,0);
        sq = sqGiven;
        lq = bp.lqAttempt;
        totalMarks = bp.mcq + sqAttempt * bp.sqMarksPerQ + bp.lqAttempt * bp.lqMarksPerQ;
        estTime = bp.mcq + sqGiven * 2 + bp.lqGiven * 5;
        selectionLabel = `Board - ${bp.label}`; break;
      }
      case "custom":
        mcq=customMcq; sq=customSq; lq=customLq;
        totalMarks=customMcq+customSq*3+customLq*5; estTime=customMcq+customSq*5+customLq*10;
        selectionLabel="Custom Paper"; break;
    }
    return { mcq, sq, lq, totalMarks, estTime, selectionLabel };
  }, [activePhase, mcqCount, sqPattern, sqMode, sqSections, sqBalance, lqPattern, lqMode, lqSections, hybridPreset, hybridGroup, boardPattern, customMcq, customSq, customLq]);

  const live = getLiveConfig();

  // ------ Summary strings for collapsed accordion rows ------
  const sqPresetForSummary = SQ_PRESETS.find(p=>p.id===sqPattern);
  const sqSummary = sqMode==="custom_builder"
    ? `Custom · ${sqSections[0]?.given||0}→${sqSections[0]?.attempt||0}`
    : `${sqPresetForSummary?.label||"—"} · ${sqPresetForSummary ? sqTotalAttempts(sqPresetForSummary.sections) : 0} Qs`;
  const lqPresetForSummary = LQ_PRESETS.find(p=>p.id===lqPattern);
  const lqSummary = lqMode==="custom_builder"
    ? `Custom · ${lqSections.length} section${lqSections.length!==1?"s":""}`
    : `${lqPresetForSummary?.label||"—"} · ${lqPresetForSummary?.given||0}→${lqPresetForSummary?.attempt||0}`;
  const customSummary = `${customMcq} MCQ · ${customSq} SQ · ${customLq} LQ`;

  const handleGenerate = async () => {
    if (!selectedClass||!selectedSubject) { setToast("Please select Class and Subject first"); return; }
    setGenerating(true);
    try {
      const cfg = getLiveConfig();
      const bp = getBoardPresets().find(p => p.id === boardPattern);
      const payload = {
        class: selectedClass, subject: selectedSubject,
        chapter: selectedChapters[0] || "mix", topics: selectedTopics,
        phase: activePhase,
        mcqCount: cfg.mcq, sqCount: cfg.sq, lqCount: cfg.lq,
        sqConfig: {
          mode: sqMode,
          sections: sqMode==="custom_builder" ? sqSections : (SQ_PRESETS.find(p=>p.id===sqPattern)?.sections||[]),
          pattern: sqPattern,
          balance: sqBalance,
        },
        lqConfig: {
          mode: lqMode,
          pattern: lqPattern,
          sections: lqMode==="custom_builder" ? lqSections : [],
          given: lqMode==="custom_builder" ? (lqSections.reduce((s,sec)=>s+sec.given,0)) : (LQ_PRESETS.find(p=>p.id===lqPattern)?.given||3),
          attempt: lqMode==="custom_builder" ? (lqSections.reduce((s,sec)=>s+sec.attempt,0)) : (LQ_PRESETS.find(p=>p.id===lqPattern)?.attempt||2),
          enforcePairing: lqMode==="custom_builder" ? lqSections.some(s=>s.abPairing) : (LQ_PRESETS.find(p=>p.id===lqPattern)?.enforcePairing??true),
        },
        hybridPreset, hybridPresetMeta: HYBRID_PRESETS.find(p=>p.id===hybridPreset),
        boardConfig: bp ? {
          boardId: bp.id, boardLabel: bp.label, template: bp.template,
          totalMarks: bp.totalMarks, mcq: bp.mcq,
          sqTotalGiven: bp.sqSections.reduce((s,sec)=>s+sec.given,0),
          sqSections: bp.sqSections,
          sqMarksPerQ: bp.sqMarksPerQ,
          lqGiven: bp.lqGiven, lqAttempt: bp.lqAttempt, lqMarksPerQ: bp.lqMarksPerQ,
        } : null,
        customChoice, customDiagram,
      };
      const res = await fetch("/api/generator", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem("generatorData", JSON.stringify({ ...payload, result: data.data }));
        router.push("/teacher/paper");
      } else {
        setToast(data.error || "Generation failed");
      }
    } catch {
      setToast("Network error. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const subjects = selectedClass ? CLASS_SUBJECTS[selectedClass] || [] : [];

  const styleTag = `
    @keyframes toastIn { from{transform:translateX(-50%) translateY(16px);opacity:0;} to{transform:translateX(-50%) translateY(0);opacity:1;} }
    @keyframes particleBurst { 0%{opacity:1;transform:rotate(var(--a,0deg)) translateX(0);} 100%{opacity:0;transform:rotate(var(--a,0deg)) translateX(46px);} }
    @keyframes genPulse { 0%{box-shadow:0 0 0 0 rgba(74,158,202,0.5);} 100%{box-shadow:0 0 0 10px rgba(74,158,202,0);} }
    ::-webkit-scrollbar{width:5px;height:5px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:${P.border};border-radius:4px;}
    @keyframes spin{to{transform:rotate(360deg);}}
  `;

  if (status === "loading") {
    return (
      <div style={{ minHeight:"100vh", background:P.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:36, height:36, borderRadius:"50%", border:`3px solid ${P.border}`, borderTopColor:P.blue, animation:"spin 0.8s linear infinite" }}/>
      </div>
    );
  }

  return (
    <div style={{ height:"100vh", background:P.bg, display:"flex", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color:P.text, overflow:"hidden" }}>
      <style>{styleTag}</style>

      {/* ------ SIDEBAR ------ */}
      <aside style={{
        width:280, flexShrink:0, background:P.bgPanel, borderRight:`1px solid ${P.border}`,
        display:"flex", flexDirection:"column", overflow:"hidden",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"18px 16px 15px", background:"#0a0a14", flexShrink:0 }}>
          <img src="/logo.png" alt="ZeeShaoor.pk" style={{ width:36, height:36, objectFit:"contain", flexShrink:0 }}/>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#FFFFFF", whiteSpace:"nowrap" }}>ZeeShaoor.pk</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>Paper Generator</div>
          </div>
        </div>

        <div style={{ padding:16, display:"flex", flexDirection:"column", gap:10, borderBottom:`1px solid ${P.border}`, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:11, color:P.textDim, letterSpacing:0.5, fontWeight:600 }}>
              {!selectedClass ? "SELECT CLASS" : !selectedSubject ? "SELECT SUBJECT" : "SCOPE"}
            </span>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setGridOpen(true)} style={{
                display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:6,
                border:`1px solid ${P.borderActive}`, background:"rgba(37,99,235,0.06)",
                color:P.blue, cursor:"pointer", fontSize:11, fontWeight:600,
              }}><Grid3X3 size={13}/> Guided setup</button>
              {(selectedClass||selectedSubject||selectedChapters.length>0) && (
                <button onClick={() => { setSelectedClass(""); setSelectedSubject(""); setSelectedChapters([]); setSelectedTopics([]); }} title="Reset" style={{
                  width:26, height:26, borderRadius:6, border:`1px solid ${P.border}`, background:"transparent",
                  color:P.textMuted, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                }}><RotateCcw size={12}/></button>
              )}
            </div>
          </div>

          {!selectedClass ? (
            <SelectCard icon={<GraduationCap size={16}/>} label="Class" value={selectedClass}
              options={CLASSES.map(c => ({ key:c, label:c }))}
              onSelect={c => { setSelectedClass(c); setSelectedSubject(""); setSelectedChapters([]); setSelectedTopics([]); }}
            />
          ) : !selectedSubject ? (
            <SelectCard icon={<Atom size={16}/>} label="Subject" value={selectedSubject}
              options={subjects.map(s => ({ key:s, label:s, icon:SUBJECT_ICONS[s]||"🔸" }))}
              onSelect={s => { setSelectedSubject(s); setSelectedChapters([]); }}
            />
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              <SelectCard icon={<GraduationCap size={16}/>} label="Class" value={selectedClass} compact
                options={CLASSES.map(c => ({ key:c, label:c }))}
                onSelect={c => { setSelectedClass(c); setSelectedSubject(""); setSelectedChapters([]); setSelectedTopics([]); }}
              />
              <SelectCard icon={<Atom size={16}/>} label="Subject" value={selectedSubject} compact
                options={subjects.map(s => ({ key:s, label:s, icon:SUBJECT_ICONS[s]||"🔸" }))}
                onSelect={s => { setSelectedSubject(s); setSelectedChapters([]); }}
              />
            </div>
          )}
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"10px 12px" }}>
          {!selectedSubject ? (
            <p style={{ fontSize:12, color:P.textDim, lineHeight:1.4 }}>Select a subject to see chapters & topics here.</p>
          ) : (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <BookMarked size={11} color={P.textDim}/>
                  <span style={{ fontSize:10, color:P.textDim, letterSpacing:0.5, fontWeight:600 }}>CHAPTERS & TOPICS</span>
                </div>
                <span style={{ fontSize:10, color:P.blue, fontWeight:600 }}>
                  {selectedTopics.length}/{ninthPhysicsChapters.reduce((s,ch)=>s+ch.topics.length,0)} topics
                </span>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                {chapters.map(ch => {
                  const chData = ch.data;
                  const chapterTopics: Topic[] = chData?.topics || [];
                  const chId = ch.id;
                  const checked = selectedChapters.includes(chId);
                  const allTopicsInChapter = chapterTopics.length > 0 && chapterTopics.every(t => selectedTopics.includes(t.id));

                  return (
                    <div key={chId}>
                      <button onClick={() => {
                        setSelectedChapters(prev => {
                          if (checked) {
                            setSelectedTopics(st => st.filter(id => !chapterTopics.some(t => t.id === id)));
                            return prev.filter(c => c !== chId);
                          }
                          setSelectedTopics(st => [...st, ...chapterTopics.map(t => t.id).filter(id => !st.includes(id))]);
                          return [...prev, chId];
                        });
                      }} style={{
                        textAlign:"left", padding:"5px 8px", borderRadius:5,
                        border:`1px solid ${checked ? P.borderActive : "transparent"}`,
                        background: checked ? "rgba(74,158,202,0.10)" : "transparent",
                        color: checked ? P.text : P.textDim,
                        fontSize:11.5, fontWeight: checked ? 600 : 400,
                        cursor:"pointer", width:"100%", display:"flex", alignItems:"center", gap:5,
                      }}>
                        <span style={{
                          width:12, height:12, borderRadius:3, flexShrink:0,
                          border:`1.5px solid ${checked?P.blue:P.border}`,
                          background: checked ? P.gradient : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>{checked && <CheckCircle2 size={8} color="#fff"/>}</span>
                        <span style={{ flex:1 }}>{ch.label}</span>
                        {checked && chapterTopics.length > 0 && (
                          <span style={{ fontSize:9.5, color:P.blue, fontWeight:600 }}>
                            {chapterTopics.filter(t=>selectedTopics.includes(t.id)).length}/{chapterTopics.length}
                          </span>
                        )}
                        <span style={{ color:P.steel, fontSize:10, transition:"transform 0.15s", transform: checked ? "rotate(0deg)" : "rotate(-90deg)" }}>▼</span>
                      </button>

                      {checked && chapterTopics.length > 0 && (
                        <div style={{
                          marginLeft:18, paddingLeft:8, borderLeft:`2px solid rgba(74,158,202,0.2)`,
                          display:"flex", flexDirection:"column", gap:1, marginBottom:4, marginTop:2,
                        }}>
                          <TopicChip label="All topics in this chapter" selected={allTopicsInChapter} onClick={() => {
                            setSelectedTopics(st => {
                              const ids = chapterTopics.map(t => t.id);
                              return allTopicsInChapter ? st.filter(id => !ids.includes(id)) : [...st, ...ids.filter(id => !st.includes(id))];
                            });
                          }}/>
                          {chapterTopics.map(t => (
                            <TopicChip key={t.id} label={t.name} selected={selectedTopics.includes(t.id)} onClick={() => toggleTopic(t.id)}/>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ------ MAIN ------ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

        <div style={{
          height:52, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"0 20px", borderBottom:`1px solid ${P.border}`, background:P.bgPanel,
        }}>
          <div style={{ fontSize:13, color:P.textDim, display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
            Building a paper for
            {!selectedClass ? (
              <span style={{ color:P.textDim }}>—</span>
            ) : (
              <>
                <span onClick={() => { setSelectedClass(""); setSelectedSubject(""); setSelectedChapters([]); setSelectedTopics([]); }} style={{
                  display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:4,
                  background:"rgba(74,158,202,0.10)", color:P.text, fontWeight:600, fontSize:12.5,
                  cursor:"pointer", border:"1px solid rgba(74,158,202,0.2)",
                }}><GraduationCap size={12}/>{selectedClass}</span>
                {selectedSubject && (
                  <>
                    <ChevronRight size={11} color={P.textDim}/>
                    <span onClick={() => { setSelectedSubject(""); setSelectedChapters([]); }} style={{
                      display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:4,
                      background:"rgba(74,158,202,0.10)", color:P.text, fontWeight:600, fontSize:12.5,
                      cursor:"pointer", border:"1px solid rgba(74,158,202,0.2)",
                    }}><Atom size={12}/>{selectedSubject}</span>
                  </>
                )}
                {selectedChapters.length > 0 && selectedChapters.map((ch, chi) => (
                  <React.Fragment key={ch}>
                    {chi > 0 && <ChevronRight size={11} color={P.textDim}/>}
                    <span onClick={() => setSelectedChapters(prev => prev.filter(c => c !== ch))} style={{
                      display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px", borderRadius:4,
                      background:"rgba(74,158,202,0.10)", color:P.text, fontWeight:600, fontSize:12.5,
                      cursor:"pointer", border:"1px solid rgba(74,158,202,0.2)",
                    }}><BookMarked size={12}/>{ch==="mix"?"Mix all":(chapters.find(c=>c.id===ch)?.label||ch)}</span>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:9, fontSize:13, color:P.textMuted }}>
            <div style={{
              width:28, height:28, borderRadius:"50%", background:P.gradient,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"#fff",
            }}>{(session?.user as any)?.name?.[0]?.toUpperCase()||"A"}</div>
            <span style={{ color:P.text, fontWeight:500 }}>{(session?.user as any)?.name||"Teacher"}</span>
            <div style={{ width:6, height:6, borderRadius:"50%", background:P.success }}/>
          </div>
        </div>

        {/* ------ Accordion phase area ------ */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16, padding:"16px 20px 90px", overflowY:"auto" }}>

          {/* Group 1: Question Types */}
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            <span style={{ fontSize:11, color:P.textDim, letterSpacing:0.5, fontWeight:600, marginBottom:6 }}>QUESTION TYPES</span>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>

              <AccordionRow icon={<Zap size={16}/>} label="MCQ" summary={`${mcqCount} MCQs`}
                open={openSection==="mcq"} onToggle={() => toggleSection("mcq")}>
                <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                  {[10, 15, 20, 30, 50].map(n => (
                    <OptionBox key={n} label={`${n}`} sub="MCQs" selected={mcqCount===n}
                      onClick={() => setMcqCount(n)}/>
                  ))}
                  <div style={{ display:"flex", alignItems:"center", gap:8, borderLeft:`1px solid ${P.border}`, paddingLeft:12 }}>
                    <span style={{ fontSize:12, color:P.textDim }}>Custom:</span>
                    <Stepper value={mcqCount} onChange={setMcqCount} min={1} max={100}/>
                  </div>
                </div>
              </AccordionRow>

              <AccordionRow icon={<FileText size={16}/>} label="Short Q" summary={sqSummary}
                open={openSection==="sq"} onToggle={() => toggleSection("sq")}>
                <div style={{ display:"flex", flexDirection:"column", gap:8, width:"100%" }}>
                  <ModeTabs order={SQ_MODE_ORDER} labels={SQ_MODE_LABELS} active={sqMode}
                    onChange={(m) => {
                      setSqMode(m);
                      const first = SQ_PRESETS.find(p=>p.mode===m);
                      if (first) setSqPattern(first.id);
                    }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    {SQ_PRESETS.filter(p=>p.mode===sqMode).map(p => (
                      <OptionBox key={p.id} label={p.label} sub={p.desc} selected={sqPattern===p.id}
                        onClick={() => setSqPattern(p.id)}/>
                    ))}
                    {sqMode==="custom_builder" && (
                      <div style={{ display:"flex", alignItems:"center", gap:14, borderLeft:`1px solid ${P.border}`, paddingLeft:12 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:12, color:P.textDim }}>Given:</span>
                          <Stepper value={sqSections[0]?.given||5}
                            onChange={v => setSqSections([{ label:"All", given:v, attempt: Math.min(sqSections[0]?.attempt||v, v) } as SqSectionDef])}
                            min={1} max={40}/>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontSize:12, color:P.textDim }}>Attempt:</span>
                          <Stepper value={sqSections[0]?.attempt||5}
                            onChange={v => setSqSections([{ label:"All", given: sqSections[0]?.given||v, attempt: Math.min(v, sqSections[0]?.given||v) } as SqSectionDef])}
                            min={1} max={sqSections[0]?.given||40}/>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionRow>

              <AccordionRow icon={<BookOpen size={16}/>} label="Long Q" summary={lqSummary}
                open={openSection==="lq"} onToggle={() => toggleSection("lq")}>
                <div style={{ display:"flex", flexDirection:"column", gap:8, width:"100%" }}>
                  <ModeTabs order={LQ_MODE_ORDER} labels={LQ_MODE_LABELS} active={lqMode}
                    onChange={(m) => {
                      setLqMode(m);
                      const first = LQ_PRESETS.find(p=>p.mode===m);
                      if (first) setLqPattern(first.id);
                    }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                    {LQ_PRESETS.filter(p=>p.mode===lqMode).map(p => (
                      <OptionBox key={p.id} label={p.label} sub={`${p.given}→${p.attempt}`} selected={lqPattern===p.id}
                        onClick={() => setLqPattern(p.id)}/>
                    ))}
                  </div>
                  {lqMode==="custom_builder" && (
                    <div style={{ display:"flex", flexDirection:"column", gap:6, borderTop:`1px solid ${P.border}`, paddingTop:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:11, color:P.textDim, fontWeight:600 }}>Parts:</span>
                        <button disabled={lqSections.length >= 4} onClick={() => setLqSections(prev => [...prev, {
                          label:`Section ${String.fromCharCode(65+prev.length)}`, given:2, attempt:1, abPairing:true }])} style={{
                          padding:"3px 10px", borderRadius:5, border:`1px solid ${lqSections.length >= 4 ? P.border : P.borderActive}`,
                          background: lqSections.length >= 4 ? "transparent" : "rgba(37,99,235,0.08)",
                          color: lqSections.length >= 4 ? P.textDim : P.blue, cursor: lqSections.length >= 4 ? "not-allowed" : "pointer",
                          fontSize:11, fontWeight:600, opacity: lqSections.length >= 4 ? 0.5 : 1,
                        }}>+ Add</button>
                        {lqSections.length > 0 && (
                          <button onClick={() => setLqSections(prev => prev.slice(0,-1))} style={{
                            padding:"3px 8px", borderRadius:5, border:`1px solid ${P.border}`,
                            background:"transparent", color:P.textDim, cursor:"pointer", fontSize:11,
                          }}>Remove</button>
                        )}
                        {lqSections.length >= 4 && <span style={{ fontSize:10, color:P.textDim, fontStyle:"italic" }}>Max 4</span>}
                        {lqSections.length > 0 && <span style={{ fontSize:10, color:P.blue, fontWeight:600 }}>{lqSections.length}/4</span>}
                      </div>
                      {lqSections.map((sec, i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:10, fontSize:11 }}>
                          <span style={{ color:P.textMuted, minWidth:70 }}>{sec.label}</span>
                          <span style={{ color:P.textDim }}>Given:</span>
                          <Stepper compact value={sec.given} min={1} max={10}
                            onChange={v => setLqSections(prev => prev.map((s,idx)=> idx===i ? {...s, given:v, attempt:Math.min(s.attempt,v)} : s))}/>
                          <span style={{ color:P.textDim }}>Attempt:</span>
                          <Stepper compact value={sec.attempt} min={1} max={sec.given}
                            onChange={v => setLqSections(prev => prev.map((s,idx)=> idx===i ? {...s, attempt:v} : s))}/>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionRow>

              <AccordionRow icon={<Settings size={16}/>} label="Custom" summary={customSummary}
                open={openSection==="custom"} onToggle={() => toggleSection("custom")}>
                <div style={{ display:"flex", alignItems:"center", gap:2, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5, padding:"0 6px" }}>
                    <span style={{ fontSize:11, color:P.textDim, fontWeight:600, minWidth:28 }}>MCQ</span>
                    <Stepper value={customMcq} onChange={setCustomMcq} min={0} max={100} compact/>
                  </div>
                  <div style={{ width:1, height:20, background:P.border }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:5, padding:"0 6px" }}>
                    <span style={{ fontSize:11, color:P.textDim, fontWeight:600, minWidth:24 }}>SQ</span>
                    <Stepper value={customSq} onChange={setCustomSq} min={0} max={30} compact/>
                  </div>
                  <div style={{ width:1, height:20, background:P.border }}/>
                  <div style={{ display:"flex", alignItems:"center", gap:5, padding:"0 6px" }}>
                    <span style={{ fontSize:11, color:P.textDim, fontWeight:600, minWidth:24 }}>LQ</span>
                    <Stepper value={customLq} onChange={setCustomLq} min={0} max={20} compact/>
                  </div>
                  <div style={{ width:1, height:24, background:P.border, margin:"0 4px" }}/>
                  {[
                    { label:"Choice", val:customChoice, set:setCustomChoice },
                    { label:"Diagram", val:customDiagram, set:setCustomDiagram },
                  ].map(({ label, val, set }) => (
                    <button key={label}
                      onClick={() => set(!val)}
                      style={{
                        display:"flex", alignItems:"center", gap:4,
                        padding:"5px 8px", borderRadius:6, cursor:"pointer",
                        border:`1.5px solid ${val ? 'rgba(37,99,235,0.5)' : 'transparent'}`,
                        background: val ? "rgba(74,158,202,0.10)" : "transparent",
                        color: val ? P.blue : P.textDim, fontSize:11, fontWeight:500,
                        transition:"all 0.15s",
                      }}>
                      <span style={{
                        width:12, height:12, borderRadius:3,
                        border:`1.5px solid ${val?P.blue:P.border}`,
                        background: val ? P.gradient : "transparent",
                        display:"flex", alignItems:"center", justifyContent:"center",
                        flexShrink:0,
                      }}>{val && <CheckCircle2 size={7} color="#fff"/>}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </AccordionRow>

              <AccordionRow icon={<Layers size={16}/>} label="Hybrid"
                summary={HYBRID_PRESETS.find(p=>p.id===hybridPreset)?.label||""}
                open={openSection==="hybrid"} onToggle={() => { setActivePhase("hybrid"); toggleSection("hybrid"); }}>
                <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginBottom:10 }}>
                  {HYBRID_GROUPS.map(g => (
                    <button key={g.id} onClick={() => { setHybridGroup(g.id);
                      const first = HYBRID_PRESETS.find(p=>p.group===g.id); if (first) setHybridPreset(first.id); }}
                      style={{
                        padding:"5px 12px", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer",
                        border:`1px solid ${hybridGroup===g.id ? P.borderActive : P.border}`,
                        background: hybridGroup===g.id ? "rgba(74,158,202,0.12)" : "transparent",
                        color: hybridGroup===g.id ? P.text : P.textMuted,
                      }}>{g.label}</button>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:6 }}>
                  {HYBRID_PRESETS.filter(p=>p.group===hybridGroup).map(p => {
                    const selected = hybridPreset===p.id;
                    return (
                      <div key={p.id} onClick={() => setHybridPreset(p.id)} style={{
                        display:"flex", flexDirection:"column", gap:2, cursor:"pointer",
                        padding:"9px 12px", borderRadius:8,
                        border:`1.5px solid ${selected ? P.borderActive : P.border}`,
                        background: selected ? "rgba(74,158,202,0.10)" : "transparent",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontSize:13, fontWeight:700, color:selected?P.text:P.textMuted }}>{p.label}</span>
                          <span style={{ fontSize:11, color:P.blue, fontWeight:600 }}>{p.marks}M</span>
                        </div>
                        <span style={{ fontSize:10, color:P.textDim, lineHeight:1.3 }}>{p.desc}</span>
                        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                          <span style={{ fontSize:8, padding:"1px 6px", borderRadius:4, background:"rgba(74,158,202,0.10)",
                            color:P.blue, fontWeight:600 }}>{p.tag}</span>
                          <span style={{ fontSize:9, color:P.textDim }}>{p.time}min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </AccordionRow>

              <AccordionRow icon={<Award size={16}/>} label="Board"
                summary={getBoardPresets().find(p=>p.id===boardPattern)?.label||""}
                open={openSection==="board"} onToggle={() => { setActivePhase("board"); toggleSection("board"); }}>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:6 }}>
                  {getBoardPresets().filter(p=>p.template==="punjab").map(p => {
                    const sel = boardPattern===p.id;
                    const pills = boardPills(p);
                    return (
                      <div key={p.id} onClick={() => setBoardPattern(p.id)} style={{
                        display:"flex", flexDirection:"column", gap:6, cursor:"pointer",
                        padding:"9px 12px", borderRadius:10,
                        border:`1.5px solid ${sel ? P.borderActive : P.border}`,
                        background: sel ? "rgba(74,158,202,0.08)" : "transparent",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontSize:13, fontWeight:700, color:sel?P.text:P.textMuted }}>🏛️ {p.label}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:P.gradient, padding:"2px 9px", borderRadius:20 }}>{p.totalMarks}M</span>
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"rgba(37,99,235,0.10)", color:P.blue }}>{pills.mcqPill}</span>
                          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"rgba(124,58,237,0.10)", color:P.purple }}>{pills.sqPill}</span>
                        </div>
                        <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"rgba(220,38,38,0.08)", color:P.danger, width:"fit-content" }}>{pills.lqPill}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize:10, fontWeight:600, color:P.textDim, letterSpacing:"0.5px", textTransform:"uppercase", marginTop:8, marginBottom:4 }}>Federal board</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:6 }}>
                  {getBoardPresets().filter(p=>p.template==="federal").map(p => {
                    const sel = boardPattern===p.id;
                    const pills = boardPills(p);
                    return (
                      <div key={p.id} onClick={() => setBoardPattern(p.id)} style={{
                        display:"flex", flexDirection:"column", gap:6, cursor:"pointer",
                        padding:"9px 12px", borderRadius:10,
                        border:`1.5px solid ${sel ? P.blue : "rgba(37,99,235,0.35)"}`,
                        background: sel ? "rgba(37,99,235,0.10)" : "rgba(37,99,235,0.04)",
                      }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <span style={{ fontSize:13, fontWeight:700, color:sel?P.text:P.textMuted }}>
                            🏛️ {p.label} {p.desc && <span style={{ fontSize:9, padding:"1px 6px", borderRadius:4, background:"rgba(37,99,235,0.15)", color:P.blue, fontWeight:700 }}>SLO</span>}
                          </span>
                          <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:P.gradient, padding:"2px 9px", borderRadius:20 }}>{p.totalMarks}M</span>
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"rgba(37,99,235,0.10)", color:P.blue }}>{pills.mcqPill}</span>
                          <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"rgba(124,58,237,0.10)", color:P.purple }}>{pills.sqPill}</span>
                        </div>
                        <span style={{ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:5, background:"rgba(220,38,38,0.08)", color:P.danger, width:"fit-content" }}>{pills.lqPill}</span>
                      </div>
                    );
                  })}
                </div>
              </AccordionRow>
            </div>
          </div>
        </div>

        {/* Floating bottom dock */}
        <div style={{
          height:56, display:"flex", alignItems:"center",
          position:"fixed", bottom:14, left:"50%", transform:"translateX(-50%)",
          width:"calc(100% - 32px)", maxWidth:1140,
          background:"rgba(255,255,255,0.85)",
          backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)",
          border:"1px solid rgba(226,232,240,0.5)",
          borderRadius:16,
          boxShadow:"0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(15,23,42,0.04)",
          padding:"0 12px", gap:0, zIndex:50,
        }}>
          {[{ label:"MCQ", val:live.mcq }, { label:"SQ", val:live.sq }, { label:"LQ", val:live.lq }].map((s) => (
            <div key={s.label} style={{ display:"flex", alignItems:"center", gap:5, padding:"0 12px", borderRight:`1px solid ${P.border}` }}>
              <span style={{ fontSize:11, color:P.textDim, fontWeight:500 }}>{s.label}:</span>
              <FlipNum value={s.val}/>
            </div>
          ))}
          <div style={{ padding:"0 12px", borderRight:`1px solid ${P.border}` }}>
            <span style={{ fontSize:11, color:P.textDim, fontWeight:500 }}>Total: </span>
            <FlipNum value={live.totalMarks}/><span style={{ fontSize:11, color:P.textDim }}> marks</span>
          </div>
          <div style={{ padding:"0 12px", borderRight:`1px solid ${P.border}` }}>
            <span style={{ fontSize:11, color:P.textDim, fontWeight:500 }}>Est. Time: </span>
            <FlipNum value={live.estTime}/><span style={{ fontSize:11, color:P.textDim }}> min</span>
          </div>
          <div style={{ flex:1, padding:"0 12px", fontSize:11, color:P.textDim, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {live.selectionLabel}
          </div>

          <div role="button" tabIndex={0} onClick={() => !generating && handleGenerate()} style={{
            display:"flex", alignItems:"center", gap:8, padding:"0 24px", height:40, borderRadius:10,
            background: generating ? "rgba(74,158,202,0.2)" : P.gradient,
            color:"#fff", fontWeight:600, fontSize:14, cursor: generating ? "not-allowed" : "pointer",
            animation: genPulse && !generating ? "genPulse 0.9s ease" : "none",
            flexShrink:0, boxShadow:"0 4px 16px rgba(37,99,235,0.3)",
          }}>
            {generating ? (
              <>
                <div style={{ width:14, height:14, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", animation:"spin 0.8s linear infinite" }}/>
                Generating...
              </>
            ) : (
              <><Sparkles size={15}/>Generate Paper</>
            )}
          </div>
        </div>
      </div>

      <GridModal
        open={gridOpen}
        onClose={() => setGridOpen(false)}
        selectedClass={selectedClass} selectedSubject={selectedSubject} selectedChapter={selectedChapters[0] || ""}
        onClassChange={c => { setSelectedClass(c); setSelectedSubject(""); setSelectedChapters([]); setSelectedTopics([]); }}
        onSubjectChange={s => { setSelectedSubject(s); setSelectedChapters([]); }}
        onChapterChange={ch => setSelectedChapters(prev => prev.includes(ch) ? prev.filter(c=>c!==ch) : [...prev, ch])}
        onApply={() => setGridOpen(false)}
      />

      {toast && <Toast msg={toast} onDone={() => setToast("")}/>}
    </div>
  );
}