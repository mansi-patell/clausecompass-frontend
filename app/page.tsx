"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://clausecompass-backend.onrender.com/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setAnalysis(data.analysis);
      setSessionId(data.session_id);
      setChatMessages([]);
    } catch (err) {
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !sessionId) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch(`https://clausecompass-backend.onrender.com/chat/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMsg }),
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const riskColor = (level: string) => {
    if (level === "high") return "border-red-400 bg-red-50";
    if (level === "medium") return "border-yellow-400 bg-yellow-50";
    return "border-green-400 bg-green-50";
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">ClauseCompass</h1>
        <p className="text-slate-600 mb-8">Upload a contract and get a plain-English risk breakdown.</p>

        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mb-4 block"
          />
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-slate-900 text-white px-5 py-2 rounded-md disabled:opacity-40"
          >
            {loading ? "Analyzing..." : "Analyze Contract"}
          </button>
          {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
        </div>

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
                <span className="text-sm text-slate-500">Document type</span>
                <h2 className="text-xl font-semibold text-slate-900 capitalize">{analysis.document_type}</h2>
                <span className="text-sm text-slate-500">
                  Overall risk: <span className="font-medium capitalize">{analysis.overall_risk_score}</span>
                </span>
              </div>

              <h3 className="text-lg font-semibold mb-3">Clauses</h3>
              <div className="space-y-3 mb-8">
                {analysis.clauses.map((c: any, i: number) => (
                  <div key={i} className={`border rounded-lg p-4 ${riskColor(c.risk_level)}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-slate-900">{c.clause_text}</span>
                      <span className="text-xs uppercase font-semibold text-slate-600">{c.risk_level}</span>
                    </div>
                    <p className="text-sm text-slate-700">{c.explanation}</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-semibold mb-3">Missing Protections</h3>
              <div className="space-y-3">
                {analysis.missing_protections.map((m: any, i: number) => (
                  <div key={i} className="border border-slate-300 rounded-lg p-4 bg-slate-100">
                    <span className="font-medium text-slate-900">{m.protection}</span>
                    <p className="text-sm text-slate-700">{m.why_it_matters}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col h-150 sticky top-8">
              <h3 className="text-lg font-semibold mb-3">Ask about this contract</h3>
              <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-slate-400">Ask a question, e.g. "What happens if I pay rent late?"</p>
                )}
                {chatMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg text-sm whitespace-pre-wrap ${
                      m.role === "user" ? "bg-slate-900 text-white ml-8" : "bg-slate-100 text-slate-800 mr-8"
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {chatLoading && <div className="text-sm text-slate-400">Thinking...</div>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder="Ask a question..."
                  className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
                />
                <button
                  onClick={handleSendChat}
                  disabled={chatLoading}
                  className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}