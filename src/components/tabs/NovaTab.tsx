import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Crown } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useUpgrade } from '../../contexts/UpgradeContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO string so it survives JSON round-trip
}

interface UserContext {
  firstName: string;
  addictions: string[];
  daysClean: number;
  quitDate: string;
  myWhy: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HISTORY_KEY = 'newu_nova_history';
const MSG_COUNT_KEY = 'nova_message_count';
const MSG_DATE_KEY  = 'nova_message_date';
const FREE_LIMIT    = 10;

function getTodayISO() { return new Date().toISOString().slice(0, 10); }

function loadTodayCount(): number {
  try {
    if (localStorage.getItem(MSG_DATE_KEY) !== getTodayISO()) return 0;
    return parseInt(localStorage.getItem(MSG_COUNT_KEY) || '0', 10);
  } catch { return 0; }
}

function incrementTodayCount(): number {
  try {
    const today = getTodayISO();
    const stored = localStorage.getItem(MSG_DATE_KEY);
    const prev = stored === today ? parseInt(localStorage.getItem(MSG_COUNT_KEY) || '0', 10) : 0;
    const next = prev + 1;
    localStorage.setItem(MSG_DATE_KEY, today);
    localStorage.setItem(MSG_COUNT_KEY, String(next));
    return next;
  } catch { return 0; }
}

function loadUserContext(): UserContext {
  let firstName = '';
  let addictions: string[] = [];
  let daysClean = 0;
  let quitDate = '';
  let myWhy = '';

  try {
    const details = localStorage.getItem('personal_details');
    if (details) {
      const d = JSON.parse(details);
      firstName = d.firstName || '';
    }
  } catch {}

  try {
    const onboarding = localStorage.getItem('onboardingData');
    if (onboarding) {
      const o = JSON.parse(onboarding);
      addictions = o.addictions || [];
      myWhy = o.myWhy || '';
      if (o.quitDate) {
        quitDate = o.quitDate;
        daysClean = Math.max(
          0,
          Math.floor((Date.now() - new Date(o.quitDate).getTime()) / (1000 * 60 * 60 * 24))
        );
      }
    }
  } catch {}

  return { firstName, addictions, daysClean, quitDate, myWhy };
}

function buildSystemPrompt(ctx: UserContext): string {
  const base = `You are Nova, a warm and compassionate AI companion for someone on their addiction recovery journey. You are not a therapist or clinical tool — you are a caring friend who has been through it. You know the user's journey, celebrate their wins, and support them through cravings without judgment. Never be preachy. Never shame. Always warm, honest and human. Keep responses concise — 2-4 sentences max unless the user needs more.`;

  const lines: string[] = [];

  if (ctx.firstName) lines.push(`The user's name is ${ctx.firstName}.`);
  if (ctx.addictions.length) lines.push(`They are recovering from: ${ctx.addictions.join(', ')}.`);
  if (ctx.daysClean > 0) lines.push(`They are currently ${ctx.daysClean} day(s) clean.`);
  if (ctx.quitDate) lines.push(`Their quit date was ${new Date(ctx.quitDate).toLocaleDateString()}.`);
  if (ctx.myWhy) lines.push(`Their core reason for quitting ("My Why"): "${ctx.myWhy}".`);

  return lines.length > 0
    ? `${base}\n\nUser context:\n${lines.join('\n')}`
    : base;
}

function generateWelcome(ctx: UserContext): string {
  const name = ctx.firstName ? ` ${ctx.firstName}` : '';
  if (ctx.daysClean > 0) {
    return `Hey${name} 💙 ${ctx.daysClean} day${ctx.daysClean === 1 ? '' : 's'} — that's real. I'm here whenever you need to talk. How are you feeling today?`;
  }
  return `Hey${name} 💙 I'm Nova, your recovery companion. I'm here for you on the good days, the hard days, and everything in between. How are you doing right now?`;
}

function loadHistory(): Message[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as Message[];
  } catch {}
  return [];
}

function saveHistory(messages: Message[]) {
  try {
    // Keep the last 100 messages to avoid quota issues
    const trimmed = messages.slice(-100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NovaTab() {
  const { user } = useAuth();
  const { openUpgradeModal } = useUpgrade();
  const [isPremium, setIsPremium] = useState(false);
  const [todayCount, setTodayCount] = useState(loadTodayCount);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) checkPremium();
  }, [user]);

  const checkPremium = async () => {
    if (!user) return;
    const { data } = await supabase.from('subscription_status').select('is_premium').eq('user_id', user.id).maybeSingle();
    setIsPremium(data?.is_premium || false);
  };

  // Initialise: load persisted history or show welcome
  useEffect(() => {
    const history = loadHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      const ctx = loadUserContext();
      const welcome: Message = {
        id: 'welcome',
        role: 'assistant',
        content: generateWelcome(ctx),
        timestamp: new Date().toISOString(),
      };
      setMessages([welcome]);
    }
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    if (!isPremium && todayCount >= FREE_LIMIT) return;

    const userText = input.trim();
    setInput('');
    const newCount = incrementTodayCount();
    setTodayCount(newCount);

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toISOString(),
    };

    // Build API history: exclude the static welcome message, include all real turns
    const apiMessages: Anthropic.MessageParam[] = [
      ...messages
        .filter((m) => m.id !== 'welcome' && m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userText },
    ];

    // Add the user message and an empty Nova placeholder
    const novaId = `a-${Date.now()}`;
    const novaPlaceholder: Message = {
      id: novaId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    const withUserMsg = [...messages, userMsg, novaPlaceholder];
    setMessages(withUserMsg);
    setIsStreaming(true);

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

    if (!apiKey) {
      const errMsg: Message = {
        ...novaPlaceholder,
        content: "I can't connect right now — VITE_ANTHROPIC_API_KEY is not set. Add it to your .env file and restart.",
      };
      const final = withUserMsg.map((m) => (m.id === novaId ? errMsg : m));
      setMessages(final);
      saveHistory(final);
      setIsStreaming(false);
      return;
    }

    try {
      const client = new Anthropic({
        apiKey,
        dangerouslyAllowBrowser: true,
      });

      const ctx = loadUserContext();
      let fullText = '';

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: buildSystemPrompt(ctx),
        messages: apiMessages,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          fullText += event.delta.text;
          setMessages((prev) =>
            prev.map((m) => (m.id === novaId ? { ...m, content: fullText } : m))
          );
        }
      }

      // Persist after streaming completes
      const finalMessages = withUserMsg.map((m) =>
        m.id === novaId ? { ...m, content: fullText || "I'm here. What's on your mind?" } : m
      );
      setMessages(finalMessages);
      saveHistory(finalMessages);
    } catch (err) {
      console.error('Nova error:', err);
      const errorContent =
        err instanceof Anthropic.AuthenticationError
          ? 'Invalid API key. Check your VITE_ANTHROPIC_API_KEY in .env.'
          : err instanceof Anthropic.RateLimitError
          ? "I'm getting a lot of messages right now. Give me a moment and try again."
          : "Something went wrong on my end. Try again in a second.";

      const errFinal = withUserMsg.map((m) =>
        m.id === novaId ? { ...m, content: errorContent } : m
      );
      setMessages(errFinal);
      saveHistory(errFinal);
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const quickActions = [
    { label: "I'm craving right now", query: "I'm having a craving right now. Help me get through it." },
    { label: 'How am I doing?', query: 'How am I doing on my recovery journey?' },
    { label: 'I had a slip', query: "I gave in and slipped. I feel terrible about it." },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#001F3F] to-[#003366]">
      {/* Header */}
      <div className="bg-[#001F3F] border-b border-white/10 px-4 py-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">Nova</h1>
            <p className="text-white/50 text-xs">Your recovery companion · Always here</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Nova avatar */}
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 mb-1 shadow-sm shadow-blue-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white/10 backdrop-blur-sm text-white border border-white/10 rounded-bl-sm'
                }`}
              >
                {message.content ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                ) : (
                  /* Typing indicator */
                  <div className="flex items-center gap-1 py-1">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                <div className="text-[10px] opacity-40 mt-1 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 bg-[#001F3F]/95 backdrop-blur-lg border-t border-white/10 px-4 py-4 pb-24">
        <div className="max-w-2xl mx-auto">

          {/* Free limit reached banner */}
          {!isPremium && todayCount >= FREE_LIMIT ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 text-center">
              <p className="text-white/80 text-sm font-medium mb-1">Daily limit reached</p>
              <p className="text-white/50 text-xs mb-4 leading-relaxed">
                You've used your {FREE_LIMIT} free messages today. Upgrade to NewU Pro for unlimited Nova conversations.
              </p>
              <button
                onClick={openUpgradeModal}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" /> Upgrade to Pro — Unlimited Nova
              </button>
            </div>
          ) : (
            <>
              {/* Free usage counter */}
              {!isPremium && (
                <div className="flex justify-end mb-2">
                  <span className="text-white/30 text-[10px]">{FREE_LIMIT - todayCount} free messages remaining today</span>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => { setInput(action.query); inputRef.current?.focus(); }}
                    disabled={isStreaming}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white/80 text-xs rounded-full whitespace-nowrap transition-all border border-white/10 flex-shrink-0"
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Text input */}
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Talk to Nova..."
                  disabled={isStreaming}
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-400/60 disabled:opacity-50 transition-colors"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isStreaming}
                  className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-400 disabled:bg-white/10 disabled:text-white/30 text-white rounded-2xl transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
