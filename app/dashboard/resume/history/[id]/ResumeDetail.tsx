"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";

type Resume = {
  id: string;
  fileName: string;
  createdAt: string;
  rawText: string;
  analysis: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    extractedSkills: string[];
  } | null;
};

export default function ResumeDetail({ resume }: { resume: Resume }) {
  const [exporting, setExporting] = useState(false);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  async function handleExportPDF() {
    setExporting(true);
    try {
      const pdf = new jsPDF();
      const analysis = resume.analysis;
      if (!analysis) return;

      let y = 20;
      pdf.setFontSize(24);
      pdf.setTextColor(79, 70, 229);
      pdf.text("ResumeIQ Analysis Report", 20, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`File: ${resume.fileName}`, 20, y);
      y += 6;
      pdf.text(`Analyzed: ${formatDate(resume.createdAt)}`, 20, y);
      y += 10;

      pdf.setFontSize(18);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Overall Score: ${analysis.score}/100`, 20, y);
      y += 12;

      const sections = [
        { title: "Strengths", items: analysis.strengths },
        { title: "Weaknesses", items: analysis.weaknesses },
        { title: "Suggestions", items: analysis.suggestions },
        { title: "Extracted Skills", items: analysis.extractedSkills },
      ];

      sections.forEach((section) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFontSize(14);
        pdf.setTextColor(79, 70, 229);
        pdf.text(section.title, 20, y);
        y += 8;

        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 50);
        section.items.forEach((item) => {
          if (y > 270) {
            pdf.addPage();
            y = 20;
          }
          const lines = pdf.splitTextToSize(`• ${item}`, 170);
          pdf.text(lines, 25, y);
          y += lines.length * 6 + 2;
        });
        y += 4;
      });

      pdf.save(`resume-analysis-${resume.fileName.replace(/\.[^/.]+$/, "")}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  if (!resume.analysis) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-red-600 dark:text-red-400">No analysis data available for this resume.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{resume.fileName}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Analyzed on {formatDate(resume.createdAt)}</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
        >
          {exporting ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Exporting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export PDF
            </>
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Overall score</p>
          <p className={`text-5xl font-extrabold ${getScoreColor(resume.analysis.score)}`}>
            {resume.analysis.score}/100
          </p>
        </div>

        <Section title="Strengths" items={resume.analysis.strengths} iconColor="text-green-600 dark:text-green-400" />
        <Section title="Weaknesses" items={resume.analysis.weaknesses} iconColor="text-red-600 dark:text-red-400" />
        <Section title="Suggestions" items={resume.analysis.suggestions} iconColor="text-blue-600 dark:text-blue-400" />
        <Section title="Extracted Skills" items={resume.analysis.extractedSkills} iconColor="text-purple-600 dark:text-purple-400" />
      </div>
    </div>
  );
}

function Section({ title, items, iconColor }: { title: string; items: string[]; iconColor: string }) {
  return (
    <div>
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-slate-900 dark:text-slate-50">
        <span className={`${iconColor}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></span>
        {title}
      </h3>
      <ul className="list-disc list-inside text-sm text-slate-700 dark:text-slate-300 space-y-2">
        {items.map((it, i) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}