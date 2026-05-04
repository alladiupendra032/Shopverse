import { useState, useRef, useEffect, useCallback } from 'react';
import './RagChatWidget.css';

/* ── Config ──────────────────────────────────────────────── */
// POST /chat  →  { answer: string, sources: { file, chunk_id }[] }
const RAG_API_URL =
  import.meta.env.VITE_RAG_API_URL || 'http://127.0.0.1:8000';

const SUGGESTIONS = [
  '🛍️ What products do you have?',
  '📦 How does shipping work?',
  '↩️ What is the return policy?',
  '💳 What payment methods are accepted?',
];

/* ── Helpers ─────────────────────────────────────────────── */
const getSessionId = () => {
  let id = sessionStorage.getItem('rcw_session_id');
  if (!id) {
    id = `rcw_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('rcw_session_id', id);
  }
  return id;
};

const formatTime = (d) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Human-friendly label from a filename like "03_faq.md" */
const fileLabel = (file) =>
  file
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    .replace(/^\d+_/, '')
    .replace(/\.[^.]+$/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Map HTTP status codes → friendly messages */
const httpErrorMessage = (status) => {
  if (status === 400) return "Please enter a valid question.";
  if (status === 401) return "Not authorized to use the assistant.";
  if (status === 429) return "Too many requests — please wait a moment and try again.";
  if (status >= 500) return "The assistant is temporarily unavailable. Please try again shortly.";
  return `Unexpected error (${status}). Please try again.`;
};

/* ── Inline SVG Icons ────────────────────────────────────── */
const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <circle cx="8"  cy="16" r="1.2" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="16" r="1.2" fill="currentColor" stroke="none"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6"  x2="6"  y2="18"/>
    <line x1="6"  y1="6"  x2="18" y2="18"/>
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" style={{ width: 11, height: 11 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
);

/* ── Main Widget ─────────────────────────────────────────── */
export default function RagChatWidget() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [messages,  setMessages]  = useState([]);
  // message shape: { id, role, text, time, sources?, error? }
  const [input,     setInput]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastQuery, setLastQuery] = useState('');

  const bottomRef  = useRef(null);
  const textareaRef= useRef(null);
  const panelRef   = useRef(null);
  const sessionId  = useRef(getSessionId());

  /* ── Auto-scroll ─────────────────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  /* ── Focus on open ───────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 60);
      setHasUnread(false);
    }
  }, [isOpen]);

  /* ── Close panel with exit animation ─────────────────── */
  const closePanel = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 200);
  }, []);

  /* ── Click outside ───────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        const launcher = document.getElementById('rcw-launcher-btn');
        if (!launcher?.contains(e.target)) closePanel();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closePanel]);

  /* ── Escape key ──────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') closePanel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, closePanel]);

  /* ── Textarea auto-resize ────────────────────────────── */
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  /* ── Send message ─────────────────────────────────────── */
  const sendMessage = useCallback(async (overrideQuery) => {
    const query = (overrideQuery ?? input).trim();
    if (!query || loading) return;

    setLastQuery(query);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Append user bubble
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', text: query, time: formatTime(new Date()) },
    ]);
    setLoading(true);

    try {
      const res = await fetch(`${RAG_API_URL}/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query }),
      });

      if (!res.ok) {
        let detail = httpErrorMessage(res.status);
        try { const j = await res.json(); detail = j.detail || j.error || detail; } catch(_) {}
        throw Object.assign(new Error(detail), { isHttp: true, status: res.status });
      }

      const data = await res.json();
      // API contract: { answer: string, sources: { file, chunk_id }[] }
      const answer  = data.answer  || 'No response received.';
      const sources = Array.isArray(data.sources) ? data.sources : [];

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', text: answer, time: formatTime(new Date()), sources },
      ]);

      if (!isOpen) setHasUnread(true);

    } catch (err) {
      const isNetwork = err.message === 'Failed to fetch';
      const text = isNetwork
        ? 'Could not reach the assistant — check that the RAG service is running and try again.'
        : err.message;

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', text, time: formatTime(new Date()), error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const toggleOpen = () => isOpen ? closePanel() : setIsOpen(true);
  const canSend = input.trim().length > 0 && !loading;

  /* ── Render ───────────────────────────────────────────── */
  return (
    <>
      {/* ── Panel ── */}
      {isOpen && (
        <div
          ref={panelRef}
          className={`rcw-panel${isClosing ? ' rcw-panel--closing' : ''}`}
          role="dialog"
          aria-label="AI Shopping Assistant"
          aria-modal="true"
        >
          {/* Header */}
          <div className="rcw-header">
            <div className="rcw-avatar"><BotIcon /></div>
            <div className="rcw-header-info">
              <div className="rcw-header-name">AI Shopping Assistant</div>
              <div className="rcw-header-status">
                <span className="rcw-status-dot"/>
                Online · Pinecone + Groq RAG
              </div>
            </div>
            <button className="rcw-close-btn" onClick={closePanel} aria-label="Close chat">
              <CloseIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="rcw-messages" role="log" aria-live="polite" aria-relevant="additions">

            {/* Welcome / empty state */}
            {messages.length === 0 && (
              <div className="rcw-welcome">
                <div className="rcw-welcome-icon"><SparkleIcon /></div>
                <h3>Hey there! 👋</h3>
                <p>
                  Ask me anything about our products, shipping, payments,
                  returns, or your orders.
                </p>
                <div className="rcw-suggestions">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="rcw-chip" onClick={() => sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages list */}
            {messages.map((msg) =>
              msg.error ? (
                /* Error bubble */
                <div key={msg.id} className="rcw-error-msg">
                  <AlertIcon />
                  <span>
                    {msg.text}
                    {' '}
                    <button className="rcw-retry-btn" onClick={() => sendMessage(lastQuery)}>
                      Retry
                    </button>
                  </span>
                </div>
              ) : (
                /* Normal bubble */
                <div key={msg.id} className={`rcw-msg rcw-msg--${msg.role}`}>
                  <div className="rcw-bubble">{msg.text}</div>

                  {/* Sources (assistant only) */}
                  {msg.role === 'assistant' && msg.sources?.length > 0 && (
                    <div className="rcw-sources">
                      {/* Deduplicate by file */}
                      {[...new Map(msg.sources.map(s => [s.file, s])).values()].map((src) => (
                        <span key={src.file} className="rcw-source-chip">
                          <FileIcon />
                          {fileLabel(src.file)}
                        </span>
                      ))}
                    </div>
                  )}

                  <span className="rcw-msg-time">{msg.time}</span>
                </div>
              )
            )}

            {/* Typing indicator */}
            {loading && (
              <div className="rcw-typing" aria-label="Assistant is typing">
                <span className="rcw-typing-dot"/>
                <span className="rcw-typing-dot"/>
                <span className="rcw-typing-dot"/>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="rcw-input-area">
            <textarea
              ref={textareaRef}
              className="rcw-textarea"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              rows={1}
              aria-label="Message input"
              maxLength={1000}
            />
            <button
              className="rcw-send-btn"
              onClick={() => sendMessage()}
              disabled={!canSend}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>

          <div className="rcw-footer-hint">
            Powered by <span>Pinecone + Groq</span> · Enter to send
          </div>
        </div>
      )}

      {/* ── Launcher ── */}
      <button
        id="rcw-launcher-btn"
        className={`rcw-launcher${isOpen ? ' rcw-launcher--open' : ''}`}
        onClick={toggleOpen}
        aria-label={isOpen ? 'Close chat' : 'Open AI shopping assistant'}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {isOpen ? <CloseIcon /> : <BotIcon />}
        {hasUnread && !isOpen && (
          <span className="rcw-unread-badge" aria-label="New message"/>
        )}
      </button>
    </>
  );
}
