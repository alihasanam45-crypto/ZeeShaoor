"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export const dynamic = 'force-dynamic'

export default function AIPaperChecker() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("SYSTEM HALT: No answer file detected for evaluation.");
      return;
    }

    setEvaluating(true);
    setError("");
    setResult(null);

    // Simulated AI Evaluation Delay
    setTimeout(() => {
      setEvaluating(false);
      setResult({
        score: "85%",
        grade: "A",
        feedback: "Excellent understanding of core concepts. Minor grammatical errors in Section B.",
        strengths: ["Logical flow", "Accurate formulas", "Clear handwriting"],
        improvements: ["Elaborate on definitions", "Check spelling in final paragraph"],
      });
    }, 3000);

    // TODO: Connect to actual backend AI evaluation route
    // const formData = new FormData();
    // formData.append("file", file);
    // const res = await fetch("/api/evaluate", { method: "POST", body: formData });
    // const data = await res.json();
    // setResult(data);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8 border-b border-[#333] pb-6">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#10b981]">
          AI Neural Paper Checker
        </h1>
        <p className="text-[#888] text-sm mt-2">
          Upload your attempted exam. Our AI engine will analyze, score, and provide targeted feedback instantly.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* UPLOAD PANEL */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
          <h2 className="text-lg font-bold mb-4 text-[#FAFAFA] flex items-center gap-2">
            <span>📤</span> Submission Terminal
          </h2>
          
          <form onSubmit={handleEvaluation} className="space-y-6">
            <div className="border-2 border-dashed border-[#333] rounded-lg p-8 text-center hover:border-[#00f0ff] transition-colors bg-[#111]">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center h-full">
                <span className="text-4xl mb-2">📄</span>
                <span className="text-sm font-medium text-[#00f0ff] hover:underline">Click to browse or drag & drop</span>
                <span className="text-xs text-[#777] mt-1">PDF, JPG, or PNG (Max 10MB)</span>
              </label>
            </div>

            {file && (
              <div className="bg-[#1a1a24] border border-[#333] p-3 rounded flex justify-between items-center">
                <span className="text-xs text-[#ddd] truncate mr-2">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-[#ff4444] text-xs font-bold">REMOVE</button>
              </div>
            )}

            {error && <p className="text-xs text-[#ff4444] font-mono">{error}</p>}

            <button 
              type="submit" 
              disabled={evaluating || !file}
              className="w-full bg-gradient-to-r from-[#00f0ff] to-[#10b981] text-black font-bold p-4 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {evaluating ? "ANALYZING NEURAL PATTERNS..." : "INITIATE EVALUATION"}
            </button>
          </form>
        </div>

        {/* RESULTS PANEL */}
        <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.05)] flex flex-col">
          <h2 className="text-lg font-bold mb-4 text-[#FAFAFA] flex items-center gap-2">
            <span>📊</span> Evaluation Matrix
          </h2>

          <div className="flex-1 bg-[#111] border border-[#333] rounded-lg p-6 overflow-y-auto">
            {evaluating ? (
              <div className="h-full flex flex-col items-center justify-center text-[#00f0ff] font-mono text-sm space-y-4 animate-pulse">
                <span>SCANNING DOCUMENT...</span>
                <span>EXTRACTING TEXT...</span>
                <span>MATCHING KNOWLEDGE BASE...</span>
              </div>
            ) : !result ? (
              <div className="h-full flex items-center justify-center text-[#444] font-mono text-sm text-center">
                AWAITING SUBMISSION FOR NEURAL ANALYSIS.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b border-[#333] pb-4">
                  <div>
                    <p className="text-xs text-[#888] font-bold tracking-widest uppercase mb-1">Final Score</p>
                    <p className="text-4xl font-extrabold text-[#10b981]">{result.score}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#888] font-bold tracking-widest uppercase mb-1">Grade</p>
                    <p className="text-2xl font-bold text-[#FAFAFA]">{result.grade}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#00f0ff] mb-2">AI Synopsis</h3>
                  <p className="text-sm text-[#ccc] leading-relaxed bg-[#1a1a24] p-3 rounded border border-[#222]">
                    {result.feedback}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#10b981] uppercase mb-2">Strengths</h3>
                    <ul className="text-xs text-[#aaa] space-y-1 list-disc pl-4">
                      {result.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#ff4444] uppercase mb-2">Areas to Improve</h3>
                    <ul className="text-xs text-[#aaa] space-y-1 list-disc pl-4">
                      {result.improvements.map((imp: string, i: number) => <li key={i}>{imp}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}