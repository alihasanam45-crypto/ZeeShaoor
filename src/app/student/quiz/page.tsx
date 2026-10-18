"use client";

import { useState, useEffect } from "react";
import { CLASS_SUBJECT_MATRIX } from "@/lib/subjects";

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  chapter: string;
  difficulty: string;
}

type Phase = "setup" | "quiz" | "result";

export default function QuizPage() {
  const [phase, setPhase]           = useState<Phase>("setup");
  const [classLevel, setClassLevel] = useState("9");
  const [subject, setSubject]       = useState("");
  const [chapter, setChapter]       = useState("all");
  const [chapters, setChapters]     = useState<string[]>([]);
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [current, setCurrent]       = useState(0);
  const [selected, setSelected]     = useState<string | null>(null);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft]     = useState(300);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const subjects = CLASS_SUBJECT_MATRIX[classLevel] || [];

  // Subject reset when class changes
  useEffect(() => {
    setSubject(subjects[0] || "");
    setChapter("all");
    setChapters([]);
  }, [classLevel]);

  // Load chapters when subject changes
  useEffect(() => {
    if (!subject || !classLevel) return;
    fetch(`/api/student/questions?classLevel=${classLevel}&subject=${encodeURIComponent(subject)}&type=MCQ`)
      .then(r => r.json())
      .then(res => {
        const chaps: string[] = res.chapters || [];
        setChapters(chaps);
        setChapter("all");
      });
  }, [subject, classLevel]);

  // Timer
  useEffect(() => {
    if (phase !== "quiz") return;
    if (timeLeft <= 0) { finishQuiz(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor =
    timeLeft <= 60  ? "text-red-600" :
    timeLeft <= 120 ? "text-amber-500" : "text-green-600";

  async function startQuiz() {
    setLoading(true);
    setError("");
    try {
      let url = `/api/student/questions?classLevel=${classLevel}&subject=${encodeURIComponent(subject)}&type=MCQ`;
      if (chapter !== "all") url += `&chapter=${encodeURIComponent(chapter)}`;

      const res  = await fetch(url);
      const data = await res.json();
      const all: Question[] = data.data || [];

      if (all.length === 0) {
        setError("Is selection mein MCQ questions nahi mile.");
        setLoading(false);
        return;
      }

      const shuffled = [...all].sort(() => Math.random() - 0.5).slice(0, 5);
      setQuestions(shuffled);
      setCurrent(0);
      setAnswers({});
      setSelected(null);
      setTimeLeft(300);
      setPhase("quiz");
    } catch {
      setError("Questions load nahi hue.");
    }
    setLoading(false);
  }

  function selectAnswer(opt: string) {
    if (selected) return;
    setSelected(opt);
    setAnswers(prev => ({ ...prev, [questions[current]._id]: opt }));
  }

  function nextQuestion() {
    if (current + 1 >= questions.length) finishQuiz();
    else { setCurrent(c => c + 1); setSelected(null); }
  }

  function finishQuiz() { setPhase("result"); }

  const score   = questions.filter(q => answers[q._id] === q.correctAnswer).length;
  const percent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  // ------ SETUP SCREEN ------
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">⚡</div>
            <h1 className="text-2xl font-bold text-slate-800">Daily Quiz</h1>
            <p className="text-slate-500 text-sm mt-1">5 questions · 5 minutes · Streak linked</p>
          </div>

          <div className="space-y-4">
            {/* Class */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Class</label>
              <select
                value={classLevel}
                onChange={e => setClassLevel(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              >
                {Object.keys(CLASS_SUBJECT_MATRIX).map(c => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
              >
                {subjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            {chapters.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Chapter <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <select
                  value={chapter}
                  onChange={e => setChapter(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="all">📚 Poori Book (sab chapters)</option>
                  {chapters.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              onClick={startQuiz}
              disabled={loading || !subject}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              {loading ? "Loading..." : "Quiz Shuru Karo →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------ QUIZ SCREEN ------
  if (phase === "quiz") {
    const q = questions[current];
    return (
      <div className="min-h-screen bg-slate-100 p-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-600">
              Q <span className="text-slate-900">{current + 1}</span> / {questions.length}
            </span>
            <span className={`text-2xl font-bold font-mono ${timerColor}`}>
              {String(minutes).padStart(2,"0")}:{String(seconds).padStart(2,"0")}
            </span>
            <span className="text-sm text-slate-500">{subject}</span>
          </div>

          {/* Progress */}
          <div className="w-full bg-slate-200 rounded-full h-2 mb-5">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-4">

            {/* Chapter + difficulty */}
            <div className="flex gap-2 mb-4">
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                {q.chapter}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                q.difficulty === "Easy"   ? "bg-green-100 text-green-700" :
                q.difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
                                            "bg-red-100 text-red-700"
              }`}>
                {q.difficulty}
              </span>
            </div>

            {/* Question */}
            <p className="text-slate-800 font-semibold text-base leading-relaxed mb-5">
              {q.questionText}
            </p>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let cls = "border-2 border-slate-200 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50";
                if (selected) {
                  if (opt === q.correctAnswer) {
                    cls = "border-2 border-green-500 bg-green-50 text-green-800";
                  } else if (opt === selected) {
                    cls = "border-2 border-red-400 bg-red-50 text-red-800";
                  } else {
                    cls = "border-2 border-slate-100 bg-slate-50 text-slate-400";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(opt)}
                    disabled={!!selected}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${cls}`}
                  >
                    <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                    {selected && opt === q.correctAnswer && (
                      <span className="ml-auto text-green-600 font-bold text-base">✓</span>
                    )}
                    {selected && opt === selected && opt !== q.correctAnswer && (
                      <span className="ml-auto text-red-500 font-bold text-base">✗</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {selected && (
              <div className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium ${
                selected === q.correctAnswer
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {selected === q.correctAnswer
                  ? "✓ Bohat acha! Sahi jawab."
                  : `✗ Galat. Sahi jawab: ${q.correctAnswer}`}
              </div>
            )}
          </div>

          {/* Next / Skip */}
          {selected ? (
            <button
              onClick={nextQuestion}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {current + 1 >= questions.length ? "Result Dekho →" : "Agla Sawal →"}
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="w-full text-slate-400 text-sm py-2 hover:text-slate-600"
            >
              Skip karo
            </button>
          )}
        </div>
      </div>
    );
  }

  // ------ RESULT SCREEN ------
  const grade =
    percent >= 80 ? { label: "Zabardast!", color: "text-green-700", bg: "bg-green-50", border: "border-green-200", emoji: "🏆" } :
    percent >= 60 ? { label: "Acha hai!",  color: "text-blue-700",  bg: "bg-blue-50",  border: "border-blue-200",  emoji: "👍" } :
    percent >= 40 ? { label: "Theek hai",  color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", emoji: "📚" } :
                    { label: "Mehnat karo",color: "text-red-700",   bg: "bg-red-50",   border: "border-red-200",   emoji: "💪" };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md">

        {/* Score circle */}
        <div className={`${grade.bg} border ${grade.border} rounded-2xl p-6 text-center mb-6`}>
          <div className="text-5xl mb-2">{grade.emoji}</div>
          <div className={`text-4xl font-bold ${grade.color}`}>{percent}%</div>
          <div className={`text-sm font-semibold ${grade.color} mt-1`}>{grade.label}</div>
          <div className="text-slate-500 text-sm mt-2">{score} / {questions.length} sahi jawab</div>
          <div className="text-slate-400 text-xs mt-1">{subject} · Class {classLevel}</div>
        </div>

        {/* Review */}
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {questions.map((q, i) => {
            const ok = answers[q._id] === q.correctAnswer;
            return (
              <div key={q._id} className={`p-3 rounded-xl text-sm border ${
                ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}>
                <div className="flex gap-2">
                  <span className={`font-bold shrink-0 ${ok ? "text-green-600" : "text-red-500"}`}>
                    {ok ? "✓" : "✗"}
                  </span>
                  <div>
                    <p className="text-slate-700 font-medium">{q.questionText}</p>
                    {!ok && (
                      <p className="text-red-600 text-xs mt-0.5">
                        Sahi: {q.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setPhase("setup")}
            className="flex-1 border-2 border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Dobara Khelein
          </button>
          <button
            onClick={() => window.location.href = "/student/study"}
            className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            Study Material
          </button>
        </div>
      </div>
    </div>
  );
}