import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, Sparkles, Trash2, Bot, ChevronDown } from "lucide-react";
import "./ChatbotWidget.css";

// ─── Gemini config ────────────────────────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-3-flash-preview";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ─── System prompts ───────────────────────────────────────────────────────────
const SYSTEM_PROMPTS = {
  admin: `You are an intelligent AI assistant for CCS (College of Computer Studies) administrators.
You help with:
- Quick summaries of sit-in records and student activity
- Guidance on managing student reservations (approve, reject, check-in, cancel)
- Tips on generating reports and interpreting analytics
- Managing lab software, announcements, and testimonials
- System navigation and best practices

STRICT SCOPE LIMITATION:
- You are ONLY authorized to discuss topics related to the CCS Sit-In Monitoring System.
- If a user asks about general knowledge, programming outside this system's context, personal advice, or any topic not listed above, you MUST politely decline.
- Response for out-of-scope: "I'm sorry, I can only assist with questions regarding the CCS Sit-In System."

Keep answers extremely concise, professional, and action-oriented. Use ONLY plain text paragraphs with a maximum of 3 sentences. NEVER use tables, bullet points, bolding, or any markdown formatting. If you need to list items or steps, write them as a single short paragraph using commas.`,

  student: `You are a friendly AI assistant for CCS (College of Computer Studies) students.
You help with:
- How to book or cancel a laboratory reservation
- Checking lab availability and seat selection
- Understanding sit-in session limits and history
- Navigating the student portal (dashboard, announcements, history, feedback)
- General lab rules and regulations

STRICT SCOPE LIMITATION:
- You are ONLY authorized to discuss topics related to the CCS Sit-In Monitoring System.
- If a user asks about general knowledge, homework help (unless related to sit-in rules), personal advice, or any topic not listed above, you MUST politely decline.
- Response for out-of-scope: "I'm sorry, but I am specifically trained to help with CCS Sit-In System queries only."

Be warm, encouraging, and use simple language. Use ONLY plain text paragraphs with a maximum of 3 sentences. NEVER use tables, bullet points, bolding, or any markdown formatting. Present all information as standard sentences in a brief narrative format.`,
};

// ─── Quick prompts ────────────────────────────────────────────────────────────
const QUICK_PROMPTS = {
  admin: [
    { label: "How to View Today's Activity", icon: "📊" },
    { label: "How to Approve Reservations", icon: "✅" },
    { label: "How to Export Reports", icon: "📄" },
    { label: "How to Manage Lab Software", icon: "💾" },
  ],
  student: [
    { label: "How to Book a Lab", icon: "🖥️" },
    { label: "How many sessions do I have left?", icon: "🎟️" },
    { label: "What are the lab rules?", icon: "📋" },
    { label: "How to View My History", icon: "📅" },
  ],
};

// ─── Utilities ────────────────────────────────────────────────────────────────
function getUserRole() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.role === "admin" ? "admin" : "student";
}
function getUserFirstName() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.first_name || "there";
}
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function RenderMarkdown({ text }) {
  const lines = text.split("\n");
  return (
    <span className="cb-markdown">
      {lines.map((line, li) => {
        // Bullet list
        if (line.match(/^[-*]\s/)) {
          return (
            <span key={li} className="cb-md-bullet">
              <span className="cb-md-dot">•</span>
              <InlineText text={line.replace(/^[-*]\s/, "")} />
              {li < lines.length - 1 && "\n"}
            </span>
          );
        }
        return (
          <span key={li}>
            <InlineText text={line} />
            {li < lines.length - 1 && "\n"}
          </span>
        );
      })}
    </span>
  );
}

function InlineText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`"))
          return <code key={i} className="cb-inline-code">{part.slice(1, -1)}</code>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="cb-msg-row cb-msg-row--bot">
      <div className="cb-avatar cb-avatar--bot"><Bot size={13} /></div>
      <div className="cb-bubble cb-bubble--bot cb-bubble--typing">
        <span className="cb-dot" />
        <span className="cb-dot" />
        <span className="cb-dot" />
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, firstName }) {
  const isUser = msg.role === "user";
  return (
    <div className={`cb-msg-row ${isUser ? "cb-msg-row--user" : "cb-msg-row--bot"}`}>
      {!isUser && (
        <div className="cb-avatar cb-avatar--bot"><Bot size={13} /></div>
      )}
      <div className={`cb-bubble ${isUser ? "cb-bubble--user" : "cb-bubble--bot"}`}>
        <RenderMarkdown text={msg.content} />
        <span className="cb-time">{formatTime(msg.timestamp)}</span>
      </div>
      {isUser && (
        <div className="cb-avatar cb-avatar--user">
          {firstName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

// ─── Main widget ──────────────────────────────────────────────────────────────
export default function ChatbotWidget() {
  const role      = getUserRole();
  const firstName = getUserFirstName();

  const [isOpen,    setIsOpen]    = useState(false);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const messagesRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef    = useRef(null);

  // Greeting
  useEffect(() => {
    setMessages([{
      id: "greeting",
      role: "assistant",
      content: `Hey **${firstName}!** 👋 I'm your CCS AI Assistant.\nHow can I help you today?`,
      timestamp: new Date(),
    }]);
  }, [firstName]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Show scroll-to-bottom button
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const onScroll = () => {
      const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollBtn(fromBottom > 80);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen]);

  const sendMessage = useCallback(async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages
      .filter(m => m.id !== "greeting")
      .map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
    history.push({ role: "user", parts: [{ text }] });

    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPTS[role] }] },
          contents: history,
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "API error");
      const reply = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No response received.";
      setMessages(prev => [...prev, { id: Date.now() + 1, role: "assistant", content: reply, timestamp: new Date() }]);
      if (!isOpen) setHasUnread(true);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: `⚠️ **Error:** ${err.message}\nPlease check your API key or try again.`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, role, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{
      id: "greeting",
      role: "assistant",
      content: `Hey **${firstName}!** 👋 Starting fresh. What can I help you with?`,
      timestamp: new Date(),
    }]);
  };

  return (
    <>
      {/* ── FAB ── */}
      <button
        id="chatbot-fab"
        onClick={() => { setIsOpen(o => !o); setHasUnread(false); }}
        className={`cb-fab ${isOpen ? "cb-fab--active" : ""}`}
        aria-label="Toggle AI Assistant"
      >
        <div className="cb-fab-ring" />
        <span className="cb-fab-icon">
          {isOpen ? <X size={20} /> : <Sparkles size={20} />}
        </span>
        {!isOpen && hasUnread && <span className="cb-fab-badge" />}
        {!isOpen && <span className="cb-fab-tooltip">AI Assistant</span>}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="cb-window" role="dialog" aria-label="CCS AI Assistant">

          {/* Header */}
          <div className="cb-header">
            <div className="cb-header-glow" />
            <div className="cb-header-left">
              <div className="cb-header-orb">
                <Bot size={18} />
                <span className="cb-orb-pulse" />
              </div>
              <div>
                <p className="cb-header-name">CCS AI Assistant</p>
                <p className="cb-header-sub">
                  <span className={`cb-status-dot ${loading ? "cb-status-dot--thinking" : ""}`} />
                  {loading ? "Thinking…" : "Online · Always here to help"}
                </p>
              </div>
            </div>
            <div className="cb-header-right">
              <button onClick={clearChat} className="cb-hbtn" title="Clear chat">
                <Trash2 size={14} />
              </button>
              <button onClick={() => setIsOpen(false)} className="cb-hbtn cb-hbtn--close" title="Close">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="cb-messages" ref={messagesRef}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} firstName={firstName} />
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll-to-bottom */}
          {showScrollBtn && (
            <button className="cb-scroll-btn" onClick={scrollToBottom} aria-label="Scroll to bottom">
              <ChevronDown size={16} />
            </button>
          )}

          {/* Quick prompts */}
          {messages.length === 1 && !loading && (
            <div className="cb-quick">
              <p className="cb-quick-label">✨ Try asking</p>
              <div className="cb-quick-grid">
                {QUICK_PROMPTS[role].map(q => (
                  <button
                    key={q.label}
                    onClick={() => sendMessage(q.label)}
                    className="cb-quick-btn"
                    disabled={loading}
                  >
                    <span className="cb-quick-icon">{q.icon}</span>
                    <span>{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="cb-input-wrap">
            <div className="cb-input-row">
              <textarea
                ref={inputRef}
                id="chatbot-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about CCS Sit-In…"
                rows={1}
                disabled={loading}
                className="cb-input"
                aria-label="Message input"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="cb-send"
                aria-label="Send"
              >
                {loading
                  ? <span className="cb-send-spinner" />
                  : <Send size={16} />
                }
              </button>
            </div>
            <p className="cb-footer-note">Powered by Gemini · Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      )}
    </>
  );
}
