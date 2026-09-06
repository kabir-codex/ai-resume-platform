"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Analysis = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  extractedSkills: string[];
};

type Resume = {
  id: string;
  fileName: string;
  createdAt: string;
  analysis: Analysis | null;
};

export default function ResumeHistoryPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/resume/analyze");
        if (res.ok) {
          const data = await res.json();
          setResumes(data.resumes || []);
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

  function getScoreColor(score: number) {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">Resume History</h1>
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Resume History</h1>
        <Link href="/dashboard/resume" className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700">
          Analyze New Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No resume analyses yet.</p>
          <Link href="/dashboard/resume" className="text-brand-600 dark:text-brand-400 hover:underline">
            Analyze your first resume
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              href={`/dashboard/resume/history/${resume.id}`}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-50">{resume.fileName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{formatDate(resume.createdAt)}</p>
                </div>
                {resume.analysis && (
                  <div className="text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Score</p>
                    <p className={`text-3xl font-extrabold ${getScoreColor(resume.analysis.score)}`}>
                      {resume.analysis.score}/100
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}