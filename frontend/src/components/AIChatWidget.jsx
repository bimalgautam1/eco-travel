import React, { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SUGGESTIONS = [
  'Which mode is cheapest for my route?',
  'Is the AQI safe for cycling today?',
  'How much CO₂ have I saved this week?',
  'What is the greenest commute option?',
  'Compare metro vs auto for 10 km.',
];

const MODE_ICONS = { user: '👤', assistant: '🌱' };

export default function AIChatWidget({ context = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hi! I\'m EcoRoute AI 🌿 Ask me anything about your commute — costs, carbon, routes, or green travel tips!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isStreaming) return;

    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    // Append empty assistant message that we'll stream into
    const assistantIndex = newMessages.length;
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    const token = localStorage.getItem('ecoroute_token');

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          context,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error('Stream unavailable');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.text) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[assistantIndex] = {
                  role: 'assistant',
                  content: updated[assistantIndex].content + parsed.text,
                };
                return updated;
              });
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = {
            role: 'assistant',
            content: '⚠️ Could not reach EcoRoute AI. Please check your connection and try again.',
          };
          return updated;
        });
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared! 🌿 What would you like to know about your commute?',
      },
    ]);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        id="ai-chat-toggle"
        onClick={() => setIsOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center text-white text-2xl transition-all duration-300 cursor-pointer
          ${isOpen
            ? 'bg-gradient-to-br from-slate-700 to-slate-800 rotate-45 scale-95'
            : 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:scale-110 hover:shadow-emerald-500/40'
          }`}
        title="EcoRoute AI Assistant"
        aria-label="Toggle AI chat"
      >
        {isOpen ? '✕' : '🤖'}
        {/* Pulse ring when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl bg-emerald-400 animate-ping opacity-20 pointer-events-none" />
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
        style={{ maxHeight: '520px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-base shadow-md">
              🤖
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">EcoRoute AI</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                {isStreaming ? 'Thinking…' : 'Online · LLaMA 3.3-70B'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            >
              🗑️
            </button>
            <button
              onClick={() => setIsOpen(false)}
              title="Close"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: '280px', maxHeight: '340px' }}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5
                ${msg.role === 'user' ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                {MODE_ICONS[msg.role]}
              </div>
              <div
                className={`max-w-[80%] text-xs leading-relaxed rounded-xl px-3 py-2.5
                  ${msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-200 rounded-tl-none'
                  }
                  ${msg.content === '' ? 'min-w-[40px]' : ''}`}
              >
                {msg.content === '' && isStreaming ? (
                  <span className="flex gap-1 py-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && !isStreaming && (
          <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {SUGGESTIONS.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s)}
                className="flex-shrink-0 text-[10px] bg-slate-800 hover:bg-emerald-900/50 border border-slate-700 hover:border-emerald-700 text-slate-300 hover:text-emerald-300 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="px-3 py-3 border-t border-slate-800 flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about routes, costs, carbon…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-600 text-slate-200 placeholder-slate-500 text-xs rounded-xl px-3 py-2.5 resize-none focus:outline-none transition-colors"
            style={{ maxHeight: '80px', overflowY: 'auto' }}
          />
          {isStreaming ? (
            <button
              onClick={stopStreaming}
              className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-500 flex items-center justify-center text-white text-base flex-shrink-0 transition-all cursor-pointer"
              title="Stop"
            >
              ■
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white text-base flex-shrink-0 transition-all cursor-pointer shadow-md"
              title="Send"
            >
              ➤
            </button>
          )}
        </div>
      </div>
    </>
  );
}
