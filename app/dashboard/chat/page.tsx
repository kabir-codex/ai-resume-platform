"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/Toast";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/chat");
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages.map((m: any) => ({ role: m.role, content: m.content })));
          }
        }
      } catch {
        // Ignore errors, start with empty history
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const newMessages: Msg[] = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, history: messages }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } else {
      showToast(data.error || "Failed to send message", "error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[70vh]">
      <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-50">Career Coach Chat</h1>
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3 mb-4">
        {loadingHistory && (
          <div className="space-y-3">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse" />
          </div>
        )}
        {!loadingHistory && messages.length === 0 && (
          <p className="text-slate-400 dark:text-slate-500 text-sm">Ask about your resume, interview prep, or career strategy.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span className={`inline-block px-4 py-2 rounded-2xl text-sm ${
              m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            }`}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-slate-400 dark:text-slate-500 text-sm">Thinking...</p>}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..." className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-50" disabled={loading} />
        <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-700" disabled={loading}>
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

