import React, { useState, useEffect, useRef } from "react";
import { api, streamChat, Reading } from "../api/client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { MessageSquare, Lightbulb, Send, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

export function Tutor() {
  const [readings, setReadings]     = useState<Reading[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [messages, setMessages]     = useState<Message[]>([]);
  const [input, setInput]           = useState("");
  const [streaming, setStreaming]   = useState(false);
  const [loadingReadings, setLR]    = useState(true);
  const [coldCall, setColdCall]     = useState(false);
  const [strict, setStrict]         = useState(false);
  const [error, setError]           = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.readings.list().then((r) => {
      setReadings(r);
      if (r.length > 0) setSelectedId(r[0].id);
    }).finally(() => setLR(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedReading = readings.find((r) => r.id === selectedId);

  const sendMessage = async (overrideContent?: string, isHint = false) => {
    const content = overrideContent !== undefined ? overrideContent : input.trim();
    if (!selectedId) return;
    const userMessage: Message | null = content ? { role: "user", content } : null;
    const nextMessages: Message[] = userMessage ? [...messages, userMessage] : messages;
    if (userMessage) setMessages(nextMessages);
    setInput("");
    setStreaming(true);
    setError("");
    let assistantContent = "";
    setMessages((prev) => [...(userMessage ? prev : prev), { role: "assistant", content: "" }]);
    try {
      await streamChat(
        { readingId: selectedId, messages: nextMessages, coldCallMode: coldCall, strictMode: strict, hintRequested: isHint },
        (chunk) => {
          assistantContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: assistantContent };
            return updated;
          });
        },
        () => setStreaming(false),
        (err) => { setError(err); setStreaming(false); }
      );
    } catch (e: unknown) {
      setError((e as Error).message);
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        value ? "bg-law-700/30 border-law-700 text-law-300" : "bg-gray-800/60 border-gray-700 text-gray-400 hover:text-gray-200"
      }`}
    >
      {value ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}{label}
    </button>
  );

  if (loadingReadings) return <div className="flex justify-center items-center h-screen"><Spinner label="Loading readings..." /></div>;

  return (
    <div className="flex flex-col h-screen">
      <div className="shrink-0 px-6 py-4 border-b border-gray-800 bg-gray-950 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-law-400">
          <MessageSquare size={20} />
          <span className="font-semibold text-gray-100">Socratic Tutor</span>
        </div>
        <select
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-law-500"
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setMessages([]); }}
        >
          {readings.length === 0 && <option value="">No readings — add one first</option>}
          {readings.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
        </select>
        {selectedReading && <Badge label={selectedReading.course} variant="course" />}
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <Toggle label="Cold Call" value={coldCall} onChange={() => setColdCall((v) => !v)} />
          <Toggle label="Strict IRAC" value={strict} onChange={() => setStrict((v) => !v)} />
          <Button variant="secondary" size="sm" onClick={() => sendMessage("", false)} disabled={!selectedId}>
            <RefreshCw size={14} />{messages.length === 0 ? "Start Session" : "Restart"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <MessageSquare size={40} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-gray-400">Ready to be cold-called?</p>
            <p className="text-sm mt-2 max-w-sm mx-auto">Select a reading above and click <span className="text-law-400">Start Session</span>.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user" ? "bg-law-700 text-white rounded-br-sm" : "bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700"
            }`}>
              {msg.role === "assistant" && <p className="text-xs text-law-400 font-semibold mb-1.5 uppercase tracking-wide">Professor</p>}
              <div className="whitespace-pre-wrap">{msg.content}
                {streaming && i === messages.length - 1 && msg.role === "assistant" && (
                  <span className="inline-block w-1.5 h-4 bg-law-400 ml-0.5 animate-pulse rounded-sm" />
                )}
              </div>
            </div>
          </div>
        ))}
        {error && <div className="text-center"><p className="text-sm text-red-400 bg-red-900/20 px-4 py-2 rounded-lg inline-block">{error}</p></div>}
        <div ref={bottomRef} />
      </div>

      {messages.length > 0 && (
        <div className="shrink-0 border-t border-gray-800 bg-gray-950 px-4 py-4">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <div className="flex-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-law-500">
              <textarea
                rows={3}
                className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 resize-none focus:outline-none placeholder-gray-500"
                placeholder="Answer the professor... (Enter to send, Shift+Enter for newline)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" variant="secondary" onClick={() => sendMessage("", true)} disabled={streaming}>
                <Lightbulb size={14} /> Hint
              </Button>
              <Button size="sm" onClick={() => sendMessage()} disabled={streaming || !input.trim()} loading={streaming}>
                <Send size={14} /> Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
