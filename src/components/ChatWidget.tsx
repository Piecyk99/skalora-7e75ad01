import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader } from "lucide-react";

const WELCOME = {
  role: "assistant" as const,
  text: "Cześć! Jestem asystentem SKALORA. Zanim skieruję Cię do właściwej osoby z naszego zespołu — jak mam się do Ciebie zwracać?",
};

interface Message {
  role: "user" | "assistant";
  text: string;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) setPulse(false);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    // Simulate response (no backend)
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: "Dziękuję! Aby uzyskać pełną odpowiedź, wypełnij formularz konsultacji poniżej — odezwiemy się w ciągu 24 godzin." }]);
      setLoading(false);
    }, 1200);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <>
      {open && (
        <div data-testid="chat-window" className="fixed right-5 z-[10001] w-[360px] max-w-[calc(100vw-20px)] flex flex-col rounded-2xl overflow-hidden" style={{ bottom: "calc(72px + 8px)", background: "#0A0A14", border: "1px solid rgba(0,240,255,0.15)", boxShadow: "0 0 60px rgba(0,240,255,0.08), 0 30px 60px rgba(0,0,0,0.6)", height: "min(480px, calc(100vh - 180px))", maxHeight: "calc(100dvh - 180px)" }}>
          <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(138,43,226,0.08) 100%)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)" }}>
                <Bot size={18} className="text-[#030305]" />
              </div>
              <div>
                <div className="font-outfit font-bold text-white text-sm">Asystent SKALORA</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-zinc-500 font-manrope">Online teraz</span>
                </div>
              </div>
            </div>
            <button data-testid="chat-close" onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition-colors p-1"><X size={18} /></button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: "none" }}>
            {messages.map((msg, i) => (
              <div key={i} data-testid={`chat-message-${i}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-manrope leading-relaxed ${msg.role === "user" ? "rounded-br-sm text-white" : "rounded-bl-sm text-zinc-200"}`} style={{ background: msg.role === "user" ? "linear-gradient(135deg, #00C8D4 0%, #7B2FBE 100%)" : "rgba(255,255,255,0.05)", border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <Loader size={14} className="text-cyan-400 animate-spin" />
                  <span className="text-xs text-zinc-500 font-manrope">Piszę...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 pb-2 flex-shrink-0">
            <button data-testid="chat-form-shortcut" onClick={() => scrollTo("contact")} className="w-full text-xs text-cyan-400 font-manrope py-2 rounded-xl hover:bg-white/5 transition-colors border border-white/5 text-center">Przejdź do formularza konsultacji</button>
          </div>

          <div className="px-4 pb-4 pt-2 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-end gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <textarea ref={inputRef} data-testid="chat-input" rows={1} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey} placeholder="Napisz wiadomość..." className="flex-1 bg-transparent text-white text-sm font-manrope resize-none outline-none leading-relaxed" style={{ maxHeight: "80px", caretColor: "#00F0FF" }} />
              <button data-testid="chat-send" onClick={sendMessage} disabled={!input.trim() || loading} className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30" style={{ background: input.trim() && !loading ? "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)" : "rgba(255,255,255,0.08)" }}>
                <Send size={14} className="text-[#030305]" />
              </button>
            </div>
          </div>
        </div>
      )}

      <button data-testid="chat-toggle" onClick={() => setOpen((v) => !v)} className="fixed bottom-24 md:bottom-6 right-5 z-[10001] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style={{ background: open ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #00F0FF 0%, #8A2BE2 100%)", boxShadow: open ? "none" : "0 0 30px rgba(0,240,255,0.35), 0 8px 30px rgba(0,0,0,0.4)" }} aria-label={open ? "Zamknij czat" : "Otwórz asystenta SKALORA"}>
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={24} className="text-[#030305]" />}
        {pulse && !open && <span className="absolute inset-0 rounded-full animate-ping" style={{ background: "rgba(0,240,255,0.3)" }} />}
      </button>
    </>
  );
}
