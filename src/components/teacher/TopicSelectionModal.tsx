"use client";

import React, { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { usePalette, type Palette } from "@/components/theme/ThemeProvider";
import type { Topic } from "@/data/ninthPhysicsChapters";

interface TopicSelectionModalProps {
  chapterName: string;
  topics: Topic[];
  initiallySelectedIds: string[];
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
}

function Check({ checked, P }: { checked: boolean; P: Palette }) {
  return (
    <span style={{
      width: 15, height: 15, borderRadius: 4, flexShrink: 0,
      border: `1.5px solid ${checked ? P.blue : P.border}`,
      background: checked ? P.gradient : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
    }}>
      {checked && <CheckCircle2 size={10} color="#fff" />}
    </span>
  );
}

function Row({ topic, checked, onToggle, P }: {
  topic: Topic; checked: boolean; onToggle: () => void; P: Palette;
}) {
  return (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 10,
      width: "100%", padding: "8px 10px", borderRadius: 8,
      border: "none", background: checked ? "rgba(74,158,202,0.07)" : "transparent",
      cursor: "pointer", textAlign: "left", transition: "background 0.12s",
      overflow: "hidden",
    }}>
      <Check checked={checked} P={P} />
      <span style={{
        fontSize: 13, color: checked ? P.text : P.textDim, lineHeight: 1.35,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        minWidth: 0,
      }}>
        {topic.id} {topic.name}
      </span>
    </button>
  );
}

export default function TopicSelectionModal({
  chapterName, topics, initiallySelectedIds, onConfirm, onClose,
}: TopicSelectionModalProps) {
  const P = usePalette();

  const [checked, setChecked] = useState<Set<string>>(() => {
    if (initiallySelectedIds.length > 0) return new Set(initiallySelectedIds);
    return new Set(topics.map(t => t.id));
  });

  const count = checked.size;
  const allChecked = count === topics.length;

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: P.bgElevated, border: `1px solid ${P.border}`,
        borderRadius: 12, boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
        width: "100%", maxWidth: 480, maxHeight: "80vh",
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: `1px solid ${P.border}`,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: P.text }}>
            {chapterName}
          </span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: "none",
            background: P.glassCard, color: P.textMuted, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Select all toggle — spans full width above the grid */}
        <div style={{ padding: "6px 18px", borderBottom: `1px solid ${P.border}` }}>
          <button onClick={() => setChecked(allChecked ? new Set() : new Set(topics.map(t => t.id)))} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "4px 0",
            border: "none", background: "transparent", cursor: "pointer",
            color: P.text, fontSize: 12.5, fontWeight: 500,
          }}>
            <Check checked={allChecked} P={P} />
            Select all topics
          </button>
        </div>

        {/* Topic grid — 2 columns */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "6px 10px",
          maxHeight: "60vh",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            columnGap: 24, rowGap: 6,
          }}>
            {topics.map(t => (
              <Row key={t.id} topic={t} checked={checked.has(t.id)} onToggle={() => toggle(t.id)} P={P} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 18px", borderTop: `1px solid ${P.border}`,
          display: "flex", justifyContent: "flex-end",
        }}>
          <button onClick={() => onConfirm(Array.from(checked))} style={{
            padding: "10px 28px", borderRadius: 9, border: "none",
            background: P.purple, color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: "pointer", letterSpacing: 0.3,
            boxShadow: "0 4px 14px rgba(168,85,247,0.35)",
          }}>
            Done — {count} topic{count !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
