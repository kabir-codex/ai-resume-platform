"use client";
import { useState } from "react";
import { jsPDF } from "jspdf";

type Question = { question: string; type: string; tip: string };

type InterviewSet = {
  id: string;
  role: string;
  questions: Question[];
  createdAt: string | Date;
};

export default function InterviewDetail({ interview }: { interview: InterviewSet }) {
  const [exporting, setExporting] = useState(false);

  function formatDate(dateStr: string | Date) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  async function handleExportPDF() {
    setExporting(true);
    try {
      const pdf = new jsPDF();
      let y = 20;

      pdf.setFontSize(24);
      pdf.setTextColor(79, 70, 229);
      pdf.text("ResumeIQ Interview Questions", 20, y);
      y += 10;

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Role: ${interview.role}`, 20, y);
      y += 6;
      pdf.text(`Generated: ${formatDate(interview.createdAt)}`, 20, y);
      y += 10;

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Questions: ${interview.questions.length}`, 20, y);
      y += 12;

      interview.questions.forEach((q, index) => {
        if (y > 250) {
          pdf.addPage();
          y = 20;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(79, 70, 229);
        pdf.text(`Question ${index + 1}`, 20, y);
        y += 7;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Type: ${q.type.charAt(0).toUpperCase() + q.type.slice(1)}`, 25, y);
        y += 6;

        pdf.setFontSize(11);
        pdf.setTextColor(50, 50, 50);
        const questionLines = pdf.splitTextToSize(q.question, 170);
        pdf.text(questionLines, 25, y);
        y += questionLines.length * 6 + 3;

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        const tipLines = pdf.splitTextToSize(`Tip: ${q.tip}`, 170);
        pdf.text(tipLines, 25, y);
        y += tipLines.length * 6 + 8;
      });

      pdf.save(`interview-questions-${interview.role.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{interview.role}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Generated on {formatDate(interview.createdAt)}</p>
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

      <div className="space-y-4">
        {interview.questions.map((q, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs uppercase font-semibold px-2 py-1 rounded ${getTypeColor(q.type)}`}>
                {q.type}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">Question {i + 1} of {interview.questions.length}</span>
            </div>
            <p className="font-medium mb-2 text-slate-900 dark:text-slate-50">{q.question}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">💡 {q.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}