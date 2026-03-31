import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Smart AI Response Engine ────────────────────────────────────────────────
const SYSTEM_CONTEXT = `You are EduBot, a friendly and knowledgeable AI study assistant for EduFlow — 
an online learning platform. Help students with:
- Explaining concepts in Data Science, Web Development, Python, JavaScript, Machine Learning, UI/UX Design
- Answering course-related doubts
- Providing study tips and learning resources
- Encouraging and motivating students
Keep responses concise, clear, and encouraging. Use markdown formatting when helpful.`;

// Fallback responses when no API key is available
const FALLBACK_RESPONSES = {
  python: [
    "Great Python question! 🐍 Python is one of the most versatile languages. Are you asking about a specific concept like lists, functions, classes, or libraries like NumPy/Pandas?",
    "Python tip: Use list comprehensions instead of loops for cleaner code. For example: `[x*2 for x in range(10)]` instead of a for loop. What specific Python topic are you working on?",
  ],
  javascript: [
    "JavaScript is the language of the web! 🌐 Key concepts include: closures, promises, async/await, and the event loop. Which area are you stuck on?",
    "For JS doubts, remember: `let` and `const` are block-scoped while `var` is function-scoped. Always prefer `const` when the value won't change. What's your specific question?",
  ],
  'machine learning': [
    "Machine Learning is fascinating! 🤖 The core steps are: Data Preprocessing → Model Selection → Training → Evaluation → Tuning. Which step are you working on?",
    "ML tip: Always split your data into train/validation/test sets. Use cross-validation to avoid overfitting. What algorithm or concept are you trying to understand?",
  ],
  'data science': [
    "Data Science combines stats, programming, and domain knowledge! 📊 Are you working with Pandas, visualization (Matplotlib/Seaborn), or a specific algorithm?",
    "For data analysis: always start with EDA (Exploratory Data Analysis). Check nulls, distributions, and correlations before modeling. What dataset or problem are you exploring?",
  ],
  html: [
    "HTML is the skeleton of every webpage! 🏗️ Remember semantic tags like `<header>`, `<main>`, `<section>`, and `<article>` improve accessibility and SEO. What HTML concept do you need help with?",
  ],
  css: [
    "CSS makes the web beautiful! 🎨 Flexbox and Grid are the modern layout tools. Use `display: flex` for 1D layouts and `display: grid` for 2D. What are you trying to style?",
  ],
  react: [
    "React is all about components and state! ⚛️ Key concepts: useState for local state, useEffect for side effects, and props to pass data down. What React concept confuses you?",
    "React tip: Keep components small and focused. If a component does too many things, break it into smaller ones. What specific issue are you facing?",
  ],
  'node': [
    "Node.js lets you run JavaScript on the server! 🟢 Express.js is the most popular framework for building APIs. Are you building a REST API or working with databases?",
  ],
  algorithm: [
    "Algorithms are the backbone of CS! 🧠 For interview prep, master: Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and Sorting algorithms. Which one are you studying?",
  ],
  study: [
    "Great study habits: 📚\n1. Use the Pomodoro technique (25 min focus, 5 min break)\n2. Teach concepts to others (Feynman technique)\n3. Practice with real projects\n4. Review notes within 24 hours\n\nWhich subject are you studying?",
  ],
  help: [
    "I'm EduBot, your AI study assistant! 🤖✨ I can help you with:\n• **Python, JavaScript, React, Node.js**\n• **Data Science & Machine Learning**\n• **HTML, CSS, UI/UX Design**\n• **Study tips & learning strategies**\n• **Algorithm & problem-solving**\n\nWhat subject do you need help with?",
  ],
};

const DEFAULT_RESPONSES = [
  "That's a great question! 💡 Could you provide more details about what specifically you're trying to understand? The more context you give, the better I can help!",
  "Interesting topic! Let me help you break it down. Can you tell me which course or module this relates to?",
  "Learning is a journey! 🚀 To give you the best answer, could you clarify what part is confusing you? Is it a concept, syntax error, or logic problem?",
  "I'm here to help! Give me a bit more context about your question and I'll do my best to explain it clearly. What have you tried so far?",
];

const GREETINGS = ['hi', 'hello', 'hey', 'hii', 'helo', 'good morning', 'good evening', 'good afternoon'];

function findResponse(message) {
  const lower = message.toLowerCase();

  // Greeting
  if (GREETINGS.some(g => lower.includes(g))) {
    return "Hello! 👋 I'm **EduBot**, your AI study assistant! I'm here to help you with your courses, doubts, and learning journey. What would you like to learn today?";
  }

  // Keyword matching
  for (const [keyword, responses] of Object.entries(FALLBACK_RESPONSES)) {
    if (lower.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }

  // Default
  return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
}

// ─── Simple Markdown renderer (bold, code) ───────────────────────────────────
function renderMarkdown(text) {
  // Bold: **text**
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.88em">$1</code>');
  // Newlines
  html = html.replace(/\n/g, '<br/>');
  return html;
}

// ─── Quick Prompt Suggestions ─────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "Explain Python lists",
  "What is Machine Learning?",
  "React hooks explained",
  "CSS Flexbox vs Grid",
  "Study tips for exams",
];

// ─── Main Component ───────────────────────────────────────────────────────────
const AIChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hi! 👋 I'm **EduBot**, your AI study assistant. Ask me anything about your courses, concepts, or learning journey!",
      time: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 100);
  };

  const sendMessage = async (text) => {
    const msgText = (text || input).trim();
    if (!msgText) return;

    const userMsg = { id: Date.now(), role: 'user', text: msgText, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking delay (0.8–1.8s)
    const delay = 800 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, delay));

    const botReply = findResponse(msgText);
    setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', text: botReply, time: new Date() }]);
    setIsTyping(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Only show for logged-in students (or everyone if you prefer)
  if (!user) return null;

  return (
    <>
      {/* ── Floating Bubble ── */}
      <button
        id="ai-chatbot-toggle"
        onClick={() => setIsOpen(o => !o)}
        aria-label="Open AI Study Assistant"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '62px',
          height: '62px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(99,102,241,0.55)',
          zIndex: 10000,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.7)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.55)'; }}
      >
        {isOpen ? <X size={26} color="white" /> : <MessageCircle size={26} color="white" />}

        {/* Pulse ring */}
        {!isOpen && (
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(99,102,241,0.4)',
            animation: 'chatPulse 2s ease-out infinite',
          }} />
        )}
      </button>

      {/* ── Chat Panel ── */}
      <div
        id="ai-chatbot-panel"
        style={{
          position: 'fixed',
          bottom: '6.5rem',
          right: '2rem',
          width: 'clamp(320px, 90vw, 420px)',
          height: '560px',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'rgba(15, 15, 30, 0.92)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99,102,241,0.3)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          zIndex: 9999,
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.92)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.4rem',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))',
          borderBottom: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', gap: '0.85rem',
          flexShrink: 0,
        }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}>
            <Bot size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>EduBot</p>
              <Sparkles size={14} color="#a78bfa" />
            </div>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>AI Study Assistant • Always online</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: 'auto', padding: '1.2rem',
            display: 'flex', flexDirection: 'column', gap: '0.85rem',
          }}
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '0.6rem',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                background: msg.role === 'bot' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {msg.role === 'bot'
                  ? <Bot size={16} color="white" />
                  : <User size={16} color="rgba(255,255,255,0.8)" />}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: '78%' }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: msg.role === 'bot' ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                  background: msg.role === 'bot'
                    ? 'rgba(99,102,241,0.15)'
                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: msg.role === 'bot' ? '1px solid rgba(99,102,241,0.2)' : 'none',
                  fontSize: '0.875rem',
                  color: 'rgba(255,255,255,0.92)',
                  lineHeight: 1.55,
                }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                />
                <p style={{
                  fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)',
                  marginTop: '4px',
                  textAlign: msg.role === 'user' ? 'right' : 'left',
                }}>
                  {formatTime(msg.time)}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Bot size={16} color="white" />
              </div>
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '4px 18px 18px 18px',
                background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#a78bfa',
                    animation: `chatBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            style={{
              position: 'absolute', bottom: '80px', right: '14px',
              background: 'rgba(99,102,241,0.8)', border: 'none', borderRadius: '50%',
              width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            <ChevronDown size={16} color="white" />
          </button>
        )}

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div style={{
            padding: '0 1.2rem 0.75rem',
            display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
          }}>
            {QUICK_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                style={{
                  background: 'rgba(99,102,241,0.12)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: '20px', padding: '0.3rem 0.75rem',
                  fontSize: '0.72rem', color: '#a78bfa',
                  cursor: 'pointer', transition: 'background 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{
          padding: '0.9rem 1.2rem',
          borderTop: '1px solid rgba(99,102,241,0.15)',
          display: 'flex', gap: '0.6rem', alignItems: 'flex-end',
          background: 'rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}>
          <textarea
            ref={inputRef}
            id="chatbot-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your doubt..."
            rows={1}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '14px',
              padding: '0.65rem 1rem',
              color: 'white',
              fontSize: '0.875rem',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              lineHeight: 1.4,
              maxHeight: '100px',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          />
          <button
            id="chatbot-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: input.trim() && !isTyping
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.06)',
              border: 'none', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, transform 0.1s',
              flexShrink: 0,
            }}
            onMouseDown={e => { if (input.trim()) e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Send size={18} color={input.trim() && !isTyping ? 'white' : 'rgba(255,255,255,0.3)'} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes chatPulse {
          0%   { transform: scale(1); opacity: 0.7; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
};

export default AIChatbot;
