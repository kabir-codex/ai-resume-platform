"use client";
import { useState } from "react";
import { useToast } from "@/components/Toast";

type AnalysisResult = {
  resumeId: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  extractedSkills: string[];
};

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { showToast } = useToast();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/resume/analyze", { method: "POST", body: formData });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      showToast(data.error || "Analysis failed", "error");
      return;
    }
    setResult(data);
    showToast("Resume analyzed successfully!", "success");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">AI Resume Analyzer</h1>
      <form onSubmit={handleUpload} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-8 flex items-center gap-4">
        <input type="file" accept=".pdf,.txt" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-slate-600 dark:text-slate-400" />
        <button type="submit" disabled={!file || loading}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {result && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Overall score</p>
            <p className="text-4xl font-extrabold text-brand-600 dark:text-brand-400">{result.score}/100</p>
          </div>
          <Section title="Strengths" items={result.strengths} />
          <Section title="Weaknesses" items={result.weaknesses} />
          <Section title="Suggestions" items={result.suggestions} />
          <Section title="Extracted skills" items={result.extractedSkills} />
        </div>
      )}
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-50">{title}</h3>
      <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-1">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

