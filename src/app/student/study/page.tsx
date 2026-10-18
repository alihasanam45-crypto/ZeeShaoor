"use client";

import { useState, useEffect } from "react";

const CLASSES = ["5","6","7","8","9","10","11","12"];

export default function StudyPage() {
  const [classLevel, setClassLevel] = useState("9");
  const [subject,    setSubject]    = useState("Physics");
  const [chapter,    setChapter]    = useState("");
  const [chapters,   setChapters]   = useState<string[]>([]);
  const [questions,  setQuestions]  = useState<any[]>([]);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(false);
  const [activeQ,    setActiveQ]    = useState<string | null>(null);

  // Chapters load karo
  useEffect(() => {
    if (!classLevel || !subject) return;
    setLoading(true);
    fetch(`/api/student/questions?classLevel=${classLevel}&subject=${subject}`)
      .then(r => r.json())
      .then(res => {
        setChapters(res.chapters || []);
        setQuestions(res.data || []);
        setChapter("");
      })
      .finally(() => setLoading(false));
  }, [classLevel, subject]);

  // Chapter filter
  useEffect(() => {
    if (!classLevel || !subject) return;
    const url = `/api/student/questions?classLevel=${classLevel}&subject=${subject}`
      + (chapter ? `&chapter=${encodeURIComponent(chapter)}` : "");
    fetch(url)
      .then(r => r.json())
      .then(res => setQuestions(res.data || []));
  }, [chapter]);

  const filtered = questions.filter(q =>
    q.questionText.toLowerCase().includes(search.toLowerCase())
  );

  const mcqs   = filtered.filter(q => q.questionType === "MCQ");
  const shorts = filtered.filter(q => q.questionType === "Short");
  const longs  = filtered.filter(q => q.questionType === "Long");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Study Material</h1>
          <p className="text-gray-500 text-sm mt-1">
            Class 5–12 Punjab Board — Questions & Notes
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6 flex flex-wrap gap-3">
          <select
            value={classLevel}
            onChange={e => setClassLevel(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CLASSES.map(c => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Subject (e.g. Physics)"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={chapter}
            onChange={e => setChapter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          >
            <option value="">— Sab Chapters —</option>
            {chapters.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search question..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
          />
        </div>

        {loading && (
          <div className="text-center py-10 text-gray-400">Loading...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            Koi question nahi mila
          </div>
        )}

        {/* MCQs */}
        {mcqs.length > 0 && (
          <Section title="MCQ Questions" count={mcqs.length} color="blue">
            {mcqs.map((q, i) => (
              <MCQCard
                key={q._id}
                q={q}
                index={i + 1}
                active={activeQ === q._id}
                onToggle={() => setActiveQ(activeQ === q._id ? null : q._id)}
              />
            ))}
          </Section>
        )}

        {/* Short */}
        {shorts.length > 0 && (
          <Section title="Short Questions" count={shorts.length} color="green">
            {shorts.map((q, i) => (
              <ShortLongCard key={q._id} q={q} index={i + 1}
                active={activeQ === q._id}
                onToggle={() => setActiveQ(activeQ === q._id ? null : q._id)}
              />
            ))}
          </Section>
        )}

        {/* Long */}
        {longs.length > 0 && (
          <Section title="Long Questions" count={longs.length} color="purple">
            {longs.map((q, i) => (
              <ShortLongCard key={q._id} q={q} index={i + 1}
                active={activeQ === q._id}
                onToggle={() => setActiveQ(activeQ === q._id ? null : q._id)}
              />
            ))}
          </Section>
        )}

      </div>
    </div>
  );
}

// ------ Section wrapper ------
function Section({ title, count, color, children }: any) {
  const colors: any = {
    blue:   "bg-blue-50 text-blue-700",
    green:  "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
  };
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-semibold text-gray-700">{title}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color]}`}>
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

// ------ MCQ Card ------
function MCQCard({ q, index, active, onToggle }: any) {
  return (
    <div
      onClick={onToggle}
      className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="flex gap-2">
        <span className="text-blue-500 font-bold text-sm min-w-[24px]">
          Q{index}.
        </span>
        <div className="flex-1">
          <p className="text-gray-800 text-sm font-medium">{q.questionText}</p>

          {active && (
            <div className="mt-3 space-y-2">
              {q.options?.map((opt: string, i: number) => (
                <div
                  key={i}
                  className={`px-3 py-2 rounded-lg text-sm border ${
                    opt === q.correctAnswer
                      ? "bg-green-50 border-green-400 text-green-700 font-medium"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  {String.fromCharCode(65 + i)}. {opt}
                </div>
              ))}
              <div className="mt-2 text-xs text-gray-400">
                Chapter: {q.chapter} • Difficulty: {q.difficulty}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ------ Short / Long Card ------
function ShortLongCard({ q, index, active, onToggle }: any) {
  return (
    <div
      onClick={onToggle}
      className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
    >
      <div className="flex gap-2">
        <span className="text-green-600 font-bold text-sm min-w-[24px]">
          Q{index}.
        </span>
        <div className="flex-1">
          <p className="text-gray-800 text-sm font-medium">{q.questionText}</p>
          {active && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-gray-500 mb-1 font-medium">Answer:</p>
              <p className="text-gray-700 text-sm">{q.correctAnswer}</p>
              <p className="mt-2 text-xs text-gray-400">
                Chapter: {q.chapter} • Difficulty: {q.difficulty}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}