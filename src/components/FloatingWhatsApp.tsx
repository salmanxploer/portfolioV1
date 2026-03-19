import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Send, Sparkles, X } from "lucide-react";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

const BOT_NAME = "Salman Assist AI";

const makeMessage = (role: "bot" | "user", text: string): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  role,
  text,
});

const FloatingWhatsApp = memo(function FloatingWhatsApp() {
  const phoneNumber = "8801717807127";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi%20Salman%2C%20I%27d%20like%20to%20discuss%20a%20project%20with%20you.`;
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuPinned, setIsMenuPinned] = useState(false);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi, I am Salman Assist AI. Ask me about services, timeline, or pricing.",
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);

  const showActions = isHovered || isMenuPinned || isBotOpen;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target || !shellRef.current) return;
      if (shellRef.current.contains(target)) return;
      setIsHovered(false);
      if (!isBotOpen) {
        setIsMenuPinned(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [isBotOpen]);

  const getBotReply = (text: string) => {
    const value = text.toLowerCase();

    if (value.includes("price") || value.includes("cost") || value.includes("budget")) {
      return "Project cost depends on scope, pages, and integrations. Salman usually shares a clear quote after understanding your goals. You can send your requirements and get a practical estimate quickly.";
    }
    if (value.includes("time") || value.includes("timeline") || value.includes("urgent")) {
      return "Typical timeline starts from a few days for small improvements to a few weeks for full builds. Urgent bug fixes and speed optimization can be prioritized.";
    }
    if (value.includes("wordpress") || value.includes("woocommerce") || value.includes("elementor")) {
      return "Salman specializes in WordPress front-end development, custom sections, performance optimization, and WooCommerce improvements focused on conversions.";
    }
    if (value.includes("seo") || value.includes("ranking") || value.includes("traffic")) {
      return "You can get technical SEO support like speed, structure, schema-ready pages, and content architecture. The focus is practical ranking growth with clean implementation.";
    }
    if (value.includes("react") || value.includes("frontend") || value.includes("ui")) {
      return "Salman builds modern React and frontend experiences with performance-first UX, clean component systems, and production-ready delivery.";
    }
    if (value.includes("contact") || value.includes("call") || value.includes("whatsapp")) {
      return "Best next step: message directly on WhatsApp from the green icon. You can also share project details and desired timeline in one message for a faster response.";
    }

    return "Salman Hafiz is a strong fit if you need WordPress and frontend work that is clean, modern, and conversion-focused. Share your project goal, and I will suggest the best next step.";
  };

  const quickPrompts = useMemo(() => ["WordPress help", "Timeline", "Pricing"], []);

  const getAssistantReply = async (message: string) => {
    const history = messages.slice(-8).map((entry) => ({ role: entry.role, text: entry.text }));
    const payload = { message, history };

    const tryEndpoint = async (url: string) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      const data = (() => {
        try {
          return raw ? JSON.parse(raw) : {};
        } catch {
          return { error: raw || "Non-JSON response" };
        }
      })();

      if (!response.ok) {
        throw new Error(data?.error || `Chat request failed at ${url} (${response.status}).`);
      }

      return String(data?.reply || "").trim();
    };

    try {
      return await tryEndpoint("/.netlify/functions/chat-assistant");
    } catch (firstError) {
      try {
        return await tryEndpoint("/api/chat-assistant");
      } catch (secondError) {
        try {
          if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
            return await tryEndpoint("http://localhost:3001/api/chat-assistant");
          }
        } catch (thirdError) {
          try {
            return await tryEndpoint("https://salmanhafiz.me/.netlify/functions/chat-assistant");
          } catch (fourthError) {
            const firstMessage = firstError instanceof Error ? firstError.message : "Unknown function error";
            const secondMessage = secondError instanceof Error ? secondError.message : "Unknown api error";
            const thirdMessage = thirdError instanceof Error ? thirdError.message : "Unknown local error";
            const fourthMessage = fourthError instanceof Error ? fourthError.message : "Unknown production fallback error";
            throw new Error(`${firstMessage} | ${secondMessage} | ${thirdMessage} | ${fourthMessage}`);
          }
        }

        const firstMessage = firstError instanceof Error ? firstError.message : "Unknown function error";
        const secondMessage = secondError instanceof Error ? secondError.message : "Unknown api error";
        throw new Error(`${firstMessage} | ${secondMessage}`);
      }
    }
  };

  const sendMessage = async (value: string) => {
    const normalized = value.trim();
    if (!normalized || isReplying) return;

    setMessages((prev) => [...prev, makeMessage("user", normalized)]);
    setInput("");
    setIsExpanded(true);

    setIsReplying(true);
    try {
      const aiReply = await getAssistantReply(normalized);
      setMessages((prev) => [...prev, makeMessage("bot", aiReply || getBotReply(normalized))]);
    } catch {
      setMessages((prev) => [
        ...prev,
        makeMessage(
          "bot",
          `${getBotReply(normalized)} If you want, message Salman directly on WhatsApp for an immediate response.`
        ),
      ]);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div
      ref={shellRef}
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isBotOpen ? (
        <div className="mb-3 w-[min(90vw,320px)] rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden relative z-30">
          <div className="px-3 py-2.5 border-b border-border/70 flex items-center justify-between gap-2 bg-background/50">
            <div className="flex items-center gap-2 min-w-0">
              <span className="h-7 w-7 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-foreground font-semibold truncate">{BOT_NAME}</p>
                <p className="text-[10px] text-muted-foreground font-mono">Buyer Assist</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="h-7 px-2 rounded-md border border-border text-[10px] text-muted-foreground hover:text-primary hover:border-primary/40"
                aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
              >
                {isExpanded ? "Mini" : "Full"}
              </button>
              <button
                type="button"
                onClick={() => setIsBotOpen(false)}
                className="h-7 w-7 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary/40 inline-flex items-center justify-center"
                aria-label="Close chatbot"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {isExpanded ? (
            <div className="px-2.5 py-2.5 max-h-[220px] overflow-auto space-y-1.5 bg-background/30">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[90%] px-2.5 py-1.5 rounded-lg text-[11px] leading-relaxed ${
                    message.role === "user"
                      ? "ml-auto bg-primary/15 border border-primary/30 text-foreground"
                      : "mr-auto bg-background/80 border border-border text-muted-foreground"
                  }`}
                >
                  {message.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="px-2.5 py-2 bg-background/30 border-b border-border/70">
              <p className="text-[10px] text-muted-foreground line-clamp-2">
                {messages[messages.length - 1]?.text || "Ask about services, timeline, or pricing."}
              </p>
            </div>
          )}

          {isExpanded ? (
            <div className="px-2.5 py-2 flex flex-wrap gap-1.5 border-t border-border/70 bg-background/60">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="text-[10px] px-2 py-1 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40"
                  disabled={isReplying}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <div className="p-2.5 border-t border-border/70 bg-background/80">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
              className="flex items-center gap-1.5"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask anything..."
                className="flex-1 h-9 px-2.5 rounded-md border border-border bg-background text-xs focus:outline-none focus:border-primary"
                disabled={isReplying}
              />
              <button
                type="submit"
                className="h-9 w-9 rounded-md border border-primary/40 text-primary hover:bg-primary/10 inline-flex items-center justify-center disabled:opacity-60"
                aria-label="Send message"
                disabled={isReplying}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            {isReplying ? <p className="mt-1.5 text-[10px] text-muted-foreground font-mono">Thinking...</p> : null}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 text-[10px] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            >
              Continue on WhatsApp
              <MessageCircle className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : null}

      <div className="absolute bottom-16 right-0 flex flex-col items-end gap-2 z-20">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open WhatsApp chat"
          className={`group/icon inline-flex items-center gap-2 transition-all duration-200 ${
            showActions ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <span className="px-2 py-1 rounded-md border border-border bg-card text-[11px] text-muted-foreground font-mono">WhatsApp</span>
          <span className="h-11 w-11 rounded-full bg-gradient-to-br from-green-400 to-green-600 border border-green-300/50 shadow-lg shadow-green-500/30 inline-flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-white" />
          </span>
        </a>

        <button
          type="button"
          onClick={() => {
            setIsBotOpen((prev) => {
              const next = !prev;
              if (next) {
                setIsExpanded(false);
              }
              return next;
            });
            setIsMenuPinned(true);
          }}
          aria-label="Open personal chatbot"
          className={`group/icon inline-flex items-center gap-2 transition-all duration-200 ${
            showActions ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-2 pointer-events-none"
          }`}
        >
          <span className="px-2 py-1 rounded-md border border-border bg-card text-[11px] text-muted-foreground font-mono">{BOT_NAME}</span>
          <span className="h-11 w-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border border-cyan-300/50 shadow-lg shadow-cyan-500/30 inline-flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </span>
        </button>
      </div>

      <button
        type="button"
        onClick={() => setIsMenuPinned((prev) => !prev)}
        className="relative w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/40
                   flex items-center justify-center transition-transform duration-200 hover:scale-105 border border-green-300/50 z-40"
        aria-label="Open chat actions"
      >
        <div className="absolute inset-0 rounded-full bg-green-500/40 blur-md" />
        <MessageCircle className="relative w-7 h-7 text-white" />
      </button>
    </div>
  );
});

export default FloatingWhatsApp;
