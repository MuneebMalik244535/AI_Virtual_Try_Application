import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { MessageCircle, X, Send, Loader2, Sparkles, ShoppingBag } from 'lucide-react';
import { MascotAssistant } from './MascotAssistant';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface Product {
  id: number;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  products?: Product[];
}

const QUICK_PROMPTS = [
  '🕴️ Wedding guest outfit under $300',
  '💼 Smart office look for summer',
  '🌶️ Bold & colorful casual fit',
  '❄️ Cozy winter layers under $200',
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm **LUXE**, your personal AI stylist 👗✨ Tell me what occasion you're dressing for, your budget, and I'll pick real outfits from our store just for you!",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  
  // Mascot state machine input bindings
  const [isTalking, setIsTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHappy, setIsHappy] = useState(false);
  const [isPointing, setIsPointing] = useState(false);
  const [triggerWave, setTriggerWave] = useState(false);
  const [triggerCelebrate, setTriggerCelebrate] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger wave when opening the panel
  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
      setShowPulse(false);
      
      // Wave greeting on open
      setTriggerWave(true);
      const timer = setTimeout(() => setTriggerWave(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dynamically set isPointing when product recommendations are shown
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg &&
      lastMsg.role === 'assistant' &&
      lastMsg.products &&
      lastMsg.products.length > 0 &&
      !isLoading &&
      !isTalking
    ) {
      setIsPointing(true);
    } else {
      setIsPointing(false);
    }
  }, [messages, isLoading, isTalking]);

  const sendMessage = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || isLoading) return;

    const newUserMsg: Message = { role: 'user', content: msgText };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setIsLoading(true);
    setIsHappy(false);

    try {
      // Build history for multi-turn (exclude the initial greeting)
      const history = messages.slice(1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText, history }),
      });
      const data = await res.json();

      const reply = data.reply || "Sorry, I couldn't understand that. Try again!";
      const products = data.products || [];

      // Add empty assistant message for typewriter styling effect
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
      setIsTalking(true);

      let currentLength = 0;
      const interval = setInterval(() => {
        currentLength += 4; // Type 4 characters at a time for speed and fluid animations
        
        if (currentLength >= reply.length) {
          clearInterval(interval);
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'assistant', content: reply, products };
            return copy;
          });
          setIsTalking(false);

          // Celebrate if product recommendations are found
          if (products.length > 0) {
            setIsHappy(true);
            setTriggerCelebrate(true);
            setTimeout(() => setTriggerCelebrate(false), 800);
          } else {
            setIsHappy(true);
            setTimeout(() => setIsHappy(false), 2000);
          }
        } else {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { 
              role: 'assistant', 
              content: reply.slice(0, currentLength) + '▎' 
            };
            return copy;
          });
        }
      }, 25);

    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "⚠️ Connection error. Make sure the backend is running!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render markdown bold helper
  const renderText = (text: string) =>
    text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith('**') ? <strong key={i} className="font-bold text-yellow-300">{part.slice(2, -2)}</strong> : part
    );

  return (
    <>
      {/* Floating Trigger Button & enticement Mascot */}
      <div 
        className={`fixed bottom-6 right-6 z-50 flex flex-col items-center transition-all duration-500 origin-bottom-right ${
          isOpen ? 'scale-75 opacity-0 pointer-events-none' : 'scale-100 opacity-100 pointer-events-auto'
        }`}
      >
        {/* Enticing mascot sitting on top of the button */}
        <div 
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => {
            setTriggerWave(true);
            setTimeout(() => setTriggerWave(false), 600);
          }}
          className="w-20 h-20 mb-[-12px] cursor-pointer hover:scale-110 active:scale-95 transition-all duration-300 filter drop-shadow-md"
        >
          <MascotAssistant
            size={80}
            triggerWave={triggerWave}
            isHappy={true}
          />
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          aria-label="Open AI Chat Stylist"
        >
          <MessageCircle className="w-6 h-6 animate-pulse" />
          {/* Pulse ring */}
          {showPulse && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{ border: '2px solid var(--accent)', opacity: 0.6 }}
            />
          )}
          {/* Badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
            <Sparkles className="w-3 h-3" style={{ color: 'var(--accent)' }} />
          </span>
        </button>
      </div>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col w-[390px] max-w-[calc(100vw-24px)] rounded-3xl shadow-2xl overflow-hidden border transition-all duration-500 origin-bottom-right ${
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto'
            : 'scale-90 opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'var(--bg-primary)',
          borderColor: 'var(--border-color)',
          height: '600px',
        }}
      >
        {/* Header containing animated mascot */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          <div className="flex items-center gap-3">
            {/* Live animated Mascot Assistant */}
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-visible cursor-pointer"
                 onClick={() => {
                   setTriggerWave(true);
                   setTimeout(() => setTriggerWave(false), 600);
                 }}>
              <MascotAssistant
                size={54}
                isTalking={isTalking}
                isThinking={isLoading}
                isListening={isListening}
                isHappy={isHappy}
                isPointing={isPointing}
                isLoading={isLoading}
                triggerWave={triggerWave}
                triggerCelebrate={triggerCelebrate}
              />
            </div>
            <div>
              <p className="text-white font-bold text-sm">LUXE AI Stylist</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                <p className="text-white/80 text-xs">Online · Powered by Groq</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] space-y-2">
                {/* Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'rounded-br-sm text-white'
                      : 'rounded-bl-sm border'
                  }`}
                  style={
                    msg.role === 'user'
                      ? { background: 'var(--accent)', color: 'var(--accent-text)' }
                      : { background: 'var(--bg-secondary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }
                  }
                >
                  {renderText(msg.content)}
                </div>

                {/* Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none animate-fade-in-up">
                    {msg.products.map((p) => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex-shrink-0 w-28 rounded-xl overflow-hidden border transition-transform hover:scale-105"
                        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}
                      >
                        <div className="w-full h-28 bg-neutral-100 overflow-hidden">
                          <img
                            src={p.image_url || `https://picsum.photos/seed/${p.id}/200/200`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-[10px] font-semibold leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                            {p.name}
                          </p>
                          <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--accent)' }}>
                            ${p.price.toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm border"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ background: 'var(--accent)', animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>
                  Styling for you…
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-[11px] px-3 py-1.5 rounded-full border transition-all hover:scale-105 cursor-pointer"
                style={{
                  borderColor: 'var(--accent)',
                  color: 'var(--accent)',
                  background: 'transparent',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div
          className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => setIsListening(true)}
            onBlur={() => setIsListening(false)}
            placeholder="Ask me to style an outfit…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
            style={{ color: 'var(--text-primary)' }}
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
