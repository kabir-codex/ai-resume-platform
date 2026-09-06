"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Question = { question: string; type: string; tip: string };

type InterviewSet = {
  id: string;
  role: string;
  questions: Question[];
  createdAt: string;
};

export default function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState<InterviewSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/interview/generate");
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews || []);
        }
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getTypeColor(type: string) {
    return type === "technical" 
      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" 
      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">Interview History</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Interview History</h1>
        <Link href="/dashboard/interview" className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700">
          Generate New Questions
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No interview questions generated yet.</p>
          <Link href="/dashboard/interview" className="text-brand-600 dark:text-brand-400 hover:underline">
            Generate your first set
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <Link
              key={interview.id}
              href={`/dashboard/interview/history/${interview.id}`}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-50">{interview.role}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{formatDate(interview.createdAt)}</p>
                  <div className="flex gap-2 mt-3">
                    {interview.questions.slice(0, 3).map((q, i) => (
                      <span key={i} className={`text-xs px-2 py-1 rounded ${getTypeColor(q.type)}`}>
                        {q.type}
                      </span>
                    ))}
                    {interview.questions.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                        +{interview.questions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Questions</p>
                  <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{interview.questions.length}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}