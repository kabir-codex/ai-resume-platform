"use client";
import { useState } from "react";
import { useToast } from "@/components/Toast";

type Question = { question: string; type: string; tip: string };

export default function InterviewPage() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { showToast } = useToast();

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim()) return;
    setLoading(true);

    const res = await fetch("/api/interview/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      showToast(data.error || "Generation failed", "error");
      return;
    }
    setQuestions(data.questions);
    showToast("Interview questions generated!", "success");
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">Interview Question Generator</h1>
      <form onSubmit={generate} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 mb-8 flex gap-4">
        <input placeholder="Target role, e.g. Senior Backend Engineer" value={role}
          onChange={(e) => setRole(e.target.value)} className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50" required />
        <button type="submit" disabled={loading}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Generating..." : "Generate"}
        </button>
      </form>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs uppercase font-semibold text-brand-600 dark:text-brand-400">{q.type}</span>
            <p className="font-medium mt-1 text-slate-900 dark:text-slate-50">{q.question}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">💡 {q.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

