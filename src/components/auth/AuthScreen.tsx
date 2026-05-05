import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Sparkles, ChevronDown, Star } from 'lucide-react';

// ─── Daily motto ───────────────────────────────────────────────────────────────

const DAILY_MOTTOS = [
  "Every morning you wake up clean is a victory worth celebrating.",
  "You are not your past. You are your next decision.",
  "The version of you that never quit is still in there.",
  "One day at a time. That's all it takes.",
  "Your future self is cheering you on right now.",
  "Healing isn't linear. But it's always worth it.",
  "You didn't come this far to only come this far.",
  "The hardest step is always the first one. You already took it.",
  "Every craving you resist makes you stronger.",
  "Today is day one of the rest of your life.",
];

function getDailyMotto(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return DAILY_MOTTOS[dayOfYear % DAILY_MOTTOS.length];
}

// ─── Pre-computed star positions (deterministic, no re-renders) ────────────────

const STARS = Array.from({ length: 38 }, (_, i) => ({
  top:     `${((i * 37 + 11) % 97) + 1}%`,
  left:    `${((i * 53 + 7)  % 97) + 1}%`,
  size:    ([2, 1.5, 1, 1.5, 2] as const)[i % 5],
  opacity: ([0.18, 0.32, 0.12, 0.28, 0.22] as const)[i % 5],
  dur:     3 + (i % 4) * 0.9,
  delay:   (i % 7) * 0.45,
}));

// ─── Typewriter hook ───────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 45, startDelay = 900) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    setDone(false);
    const timeout = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ─── Scroll-reveal component ───────────────────────────────────────────────────

function Reveal({
  children,
  delay = 0,
  className = '',
  from = 'bottom',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: 'bottom' | 'left' | 'right';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.disconnect(); } },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden =
    from === 'left'  ? 'opacity-0 -translate-x-8' :
    from === 'right' ? 'opacity-0 translate-x-8'  :
                       'opacity-0 translate-y-8';

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${vis ? 'opacity-100 translate-x-0 translate-y-0' : hidden} ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Auth error helper ─────────────────────────────────────────────────────────

function friendlyAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes('rate') || msg.includes('too many') || msg.includes('over_email_send_rate_limit'))
    return 'Too many attempts. Please wait a few minutes and try again.';
  if (msg.includes('invalid login') || msg.includes('invalid credentials'))
    return 'Incorrect email or password.';
  if (msg.includes('user already registered') || msg.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (msg.includes('password') && msg.includes('6'))
    return 'Password must be at least 6 characters.';
  return message;
}

// ─── Auth form ─────────────────────────────────────────────────────────────────

function AuthForm({ defaultMode, onBack }: { defaultMode: 'signup' | 'signin'; onBack: () => void }) {
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        if (!displayName.trim()) { setError('Please enter your name'); return; }
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      setError(friendlyAuthError(err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: 'https://newuapp.com' });
      console.log('[ForgotPassword]', data, error);
      if (error) throw error;
      setResetSent(true);
    } catch (err: unknown) {
      setResetError(friendlyAuthError(err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000d1a] via-[#001F3F] to-[#002a52] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button onClick={forgotMode ? () => setForgotMode(false) : onBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors">
          ← {forgotMode ? 'Back to Sign In' : 'Back'}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-5 border border-blue-500/30">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-light text-white mb-1">NewU</h1>
          <p className="text-white/50 text-sm">Become Someone New</p>
        </div>

        {forgotMode ? (
          <div className="bg-white/8 backdrop-blur-lg rounded-3xl border border-white/15 p-6">
            <h2 className="text-white font-medium text-lg mb-1">Reset your password</h2>
            <p className="text-white/50 text-sm mb-5">Enter your email and we'll send you a reset link.</p>
            {resetSent ? (
              <div className="p-4 bg-green-500/15 border border-green-500/30 rounded-xl text-sm text-green-300 text-center">Check your email for a password reset link.</div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Email</label>
                  <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/70 transition-colors" placeholder="your@email.com" required />
                </div>
                {resetError && <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-sm text-red-300">{resetError}</div>}
                <button type="submit" disabled={resetLoading} className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25">
                  {resetLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white/8 backdrop-blur-lg rounded-3xl border border-white/15 p-6">
            <div className="flex mb-6 bg-white/10 rounded-xl p-1">
              <button onClick={() => setIsSignUp(true)} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm ${isSignUp ? 'bg-blue-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}>Sign Up</button>
              <button onClick={() => setIsSignUp(false)} className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm ${!isSignUp ? 'bg-blue-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'}`}>Sign In</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Your Name</label>
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/70 transition-colors" placeholder="Enter your name" required={isSignUp} />
                </div>
              )}
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/70 transition-colors" placeholder="your@email.com" required />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/70 transition-colors" placeholder="••••••••" required minLength={6} />
                {!isSignUp && (
                  <button type="button" onClick={() => { setForgotMode(true); setResetEmail(email); setResetError(''); setResetSent(false); }} className="mt-2 text-xs text-blue-400/70 hover:text-blue-400 transition-colors">
                    Forgot your password?
                  </button>
                )}
              </div>
              {error && <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-sm text-red-300">{error}</div>}
              <button type="submit" disabled={loading} className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 mt-2">
                {loading ? 'Please wait…' : isSignUp ? 'Begin Your Journey' : 'Welcome Back'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cinematic Landing Page ────────────────────────────────────────────────────

const TESTIMONIALS = [
  { quote: "I tried 6 times before NewU. Day 94 now. Nova talked me through the worst night of my life.", name: "James", age: 34, city: "London" },
  { quote: "I didn't think an app could actually help. Then I hit my first month. I cried.", name: "Sarah", age: 28, city: "Toronto" },
  { quote: "I've saved €847 in 3 months. I'm booking the holiday I always promised myself.", name: "Nikos", age: 41, city: "Athens" },
];

const FEATURE_CARDS = [
  {
    icon: '🧠',
    title: 'Nova AI',
    desc: 'Your 3am companion. Never judges. Always listens. Knows your journey.',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)',
    glow: 'rgba(99, 102, 241, 0.35)',
    shimmerDelay: '0.2s',
  },
  {
    icon: '🫀',
    title: 'Body Science',
    desc: 'Watch your organs heal in real time. Science-backed. Day by day.',
    gradient: 'linear-gradient(135deg, #7f1d1d 0%, #c2410c 100%)',
    glow: 'rgba(239, 68, 68, 0.3)',
    shimmerDelay: '0.5s',
  },
  {
    icon: '🏯',
    title: 'Eastern Wisdom',
    desc: 'Kaizen. Ikigai. Gaman. Ancient methods. Modern results.',
    gradient: 'linear-gradient(135deg, #78350f 0%, #b45309 100%)',
    glow: 'rgba(245, 158, 11, 0.3)',
    shimmerDelay: '0.8s',
  },
];

const FLOATING_BADGES = [
  { text: 'Day 1 is the hardest. Day 2 gets easier.', anim: 'badge-float-1', delay: '0s', pos: 'left-4 top-[28%]' },
  { text: '94% feel stronger after 30 days',           anim: 'badge-float-2', delay: '0.6s', pos: 'right-4 top-[42%]' },
  { text: 'Your brain starts healing in 20 minutes',   anim: 'badge-float-3', delay: '1.2s', pos: 'left-6 top-[60%]' },
];

function LandingPage({ onSignUp, onSignIn }: { onSignUp: () => void; onSignIn: () => void }) {
  const motto = getDailyMotto();
  const { displayed, done } = useTypewriter("The person you want to be... is still in there.", 48, 1000);

  return (
    <>
      {/* ── Injected keyframes ───────────────────────────── */}
      <style>{`
        @keyframes aurora-1 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.45; }
          33%     { transform: translate(40px,-25px) scale(1.12); opacity: 0.65; }
          66%     { transform: translate(-20px,18px) scale(0.92); opacity: 0.3; }
        }
        @keyframes aurora-2 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.35; }
          40%     { transform: translate(-30px,28px) scale(1.18); opacity: 0.55; }
          70%     { transform: translate(18px,-12px) scale(0.88); opacity: 0.22; }
        }
        @keyframes aurora-3 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.22; }
          50%     { transform: translate(25px,30px) scale(1.25); opacity: 0.42; }
        }
        @keyframes aurora-4 {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.18; }
          45%     { transform: translate(-15px,-20px) scale(1.1); opacity: 0.35; }
        }
        @keyframes star-twinkle {
          0%,100% { opacity: var(--op); }
          50%     { opacity: calc(var(--op) * 0.3); }
        }
        @keyframes logo-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes badge-float-1 {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-10px); }
        }
        @keyframes badge-float-2 {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-7px); }
        }
        @keyframes badge-float-3 {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-13px); }
        }
        @keyframes cursor-blink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0; }
        }
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-160%) skewX(-20deg); }
          100% { transform: translateX(260%) skewX(-20deg); }
        }
        @keyframes glow-pulse {
          0%,100% { box-shadow: 0 0 24px rgba(59,130,246,0.55), 0 8px 32px rgba(59,130,246,0.3); }
          50%     { box-shadow: 0 0 48px rgba(59,130,246,0.85), 0 8px 56px rgba(59,130,246,0.5); }
        }
        @keyframes fade-up-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .shimmer-card { position: relative; overflow: hidden; }
        .shimmer-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.10) 50%, transparent 100%);
          transform: translateX(-160%) skewX(-20deg);
          animation: shimmer-sweep 1.2s ease-in-out var(--shimmer-delay, 0s) 1 forwards;
        }
      `}</style>

      <div className="bg-[#000912] overflow-x-hidden">

        {/* ══════════════════════════════════════════
            SECTION 1 — HERO
        ══════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center overflow-hidden">

          {/* Aurora background blobs */}
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-[500px] h-[400px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.5) 0%, transparent 70%)', animation: 'aurora-1 9s ease-in-out infinite' }} />
            <div className="absolute top-1/3 -left-32 w-[380px] h-[380px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(6,95,170,0.38) 0%, transparent 70%)', animation: 'aurora-2 13s ease-in-out infinite' }} />
            <div className="absolute bottom-1/3 right-1/4 w-[280px] h-[280px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(88,28,235,0.28) 0%, transparent 70%)', animation: 'aurora-3 10s ease-in-out infinite' }} />
            <div className="absolute top-2/3 right-1/3 w-[200px] h-[200px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.22) 0%, transparent 70%)', animation: 'aurora-4 7s ease-in-out infinite' }} />
            {/* Deep vignette at top */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#000912]/80 via-transparent to-[#000912]/60" />
          </div>

          {/* Star particles */}
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            {STARS.map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  top: s.top, left: s.left,
                  width: s.size, height: s.size,
                  ['--op' as string]: s.opacity,
                  opacity: s.opacity,
                  animation: `star-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Floating stat badges */}
          <div className="absolute inset-0 pointer-events-none select-none hidden sm:block" aria-hidden="true">
            {FLOATING_BADGES.map((b) => (
              <div
                key={b.text}
                className={`absolute ${b.pos} max-w-[160px]`}
                style={{ animation: `${b.anim} 4.5s ease-in-out ${b.delay} infinite` }}
              >
                <div className="px-3 py-1.5 rounded-full bg-white/8 border border-white/15 backdrop-blur-sm">
                  <p className="text-white/65 text-[10px] leading-tight">{b.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center max-w-sm w-full">

            {/* Logo with pulse ring */}
            <div className="relative mb-8">
              <div className="absolute inset-0 rounded-3xl border border-blue-400/30"
                style={{ animation: 'logo-ring 2.5s ease-out 0.5s infinite' }} />
              <div className="relative w-20 h-20 bg-blue-500/15 rounded-3xl flex items-center justify-center border border-blue-400/25 shadow-2xl shadow-blue-500/25"
                style={{ animation: 'fade-up-in 0.8s ease-out both' }}>
                <Sparkles className="w-10 h-10 text-blue-400" />
              </div>
            </div>

            <p className="text-blue-400/70 text-[10px] font-semibold tracking-[0.35em] uppercase mb-8"
              style={{ animation: 'fade-up-in 0.8s ease-out 0.2s both' }}>
              NewU
            </p>

            {/* Typewriter headline */}
            <div className="mb-7" style={{ animation: 'fade-up-in 0.8s ease-out 0.4s both' }}>
              <h1 className="text-3xl sm:text-4xl font-light text-white leading-tight min-h-[100px] flex items-center">
                <span>
                  {displayed}
                  {!done && (
                    <span className="inline-block w-[2px] h-8 bg-blue-400 ml-0.5 align-middle"
                      style={{ animation: 'cursor-blink 0.9s ease-in-out infinite' }} />
                  )}
                </span>
              </h1>
            </div>

            {/* Glowing motto card */}
            <div className="w-full mb-8" style={{ animation: 'fade-up-in 0.8s ease-out 0.6s both' }}>
              <div className="relative px-6 py-4 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.15) 0%, rgba(88,28,235,0.10) 100%)', border: '1px solid rgba(96,165,250,0.2)', boxShadow: '0 0 30px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 mx-auto mb-2.5 animate-pulse" />
                <p className="text-white/65 text-sm italic font-light leading-relaxed">
                  "{motto}"
                </p>
              </div>
            </div>

            {/* Mobile floating badges (inline, not absolute) */}
            <div className="flex flex-col gap-2 w-full mb-4 sm:hidden" style={{ animation: 'fade-up-in 0.8s ease-out 0.8s both' }}>
              {FLOATING_BADGES.map((b) => (
                <div key={b.text} className="px-3 py-1.5 rounded-full bg-white/8 border border-white/12 self-center">
                  <p className="text-white/55 text-[10px]">{b.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
            style={{ animation: 'fade-up-in 0.8s ease-out 1.8s both' }}>
            <span className="text-xs tracking-widest uppercase">Discover what's possible</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 2 — SOCIAL PROOF
        ══════════════════════════════════════════ */}
        <section className="relative px-5 py-24 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #000d1a 0%, #020d1f 100%)' }}>

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />

          <div className="relative max-w-lg mx-auto">
            <Reveal className="text-center mb-14">
              <p className="text-blue-400/60 text-xs font-semibold tracking-[0.3em] uppercase mb-3">Thousands recovered. One at a time.</p>
              <h2 className="text-3xl font-light text-white leading-tight">Real people.<br />Real stories.</h2>
            </Reveal>

            <div className="space-y-5">
              {TESTIMONIALS.map((t, i) => (
                <Reveal key={t.name} delay={i * 120} from={i % 2 === 0 ? 'left' : 'right'}>
                  <div className="rounded-2xl p-6 border border-white/10"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(8px)' }}>
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-white/85 text-base italic font-light leading-relaxed mb-5">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(139,92,246,0.3) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className="text-white/80 text-xs font-semibold">{t.name[0]}</span>
                      </div>
                      <p className="text-white/40 text-sm">— {t.name}, {t.age}, {t.city}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 3 — FEATURES
        ══════════════════════════════════════════ */}
        <section className="py-24 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #020d1f 0%, #020814 100%)' }}>

          <Reveal className="text-center mb-12 px-5">
            <p className="text-white/35 text-xs font-semibold tracking-[0.3em] uppercase mb-3">What's inside</p>
            <h2 className="text-3xl font-light text-white leading-tight">
              Everything you need<br />to become someone new
            </h2>
          </Reveal>

          {/* Horizontal scroll cards */}
          <div className="overflow-x-auto px-5 pb-4" style={{ scrollbarWidth: 'none' }}>
            <div className="flex gap-5" style={{ width: 'max-content', paddingRight: '20px' }}>
              {FEATURE_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="shimmer-card w-72 flex-shrink-0 rounded-2xl p-7"
                  style={{
                    background: card.gradient,
                    boxShadow: `0 8px 40px ${card.glow}`,
                    ['--shimmer-delay' as string]: card.shimmerDelay,
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  <span className="text-4xl block mb-5">{card.icon}</span>
                  <h3 className="text-white font-bold text-lg mb-2">{card.title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll dots */}
          <div className="flex justify-center gap-1.5 mt-5">
            {FEATURE_CARDS.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/25" />
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            SECTION 4 — FINAL CTA
        ══════════════════════════════════════════ */}
        <section className="relative px-5 py-32 overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #020814 0%, #000508 100%)' }}>

          {/* Dramatic background glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.15) 0%, transparent 70%)' }} />
          </div>

          <div className="relative max-w-sm mx-auto text-center">
            <Reveal>
              <p className="text-blue-400/60 text-xs font-semibold tracking-[0.3em] uppercase mb-5">Your moment is now</p>
              <h2 className="text-4xl font-light text-white leading-tight mb-4">
                Your next chapter<br />starts with one decision.
              </h2>
              <p className="text-white/40 text-lg mb-12 font-light">
                Not tomorrow. Not Monday. <span className="text-white/70">Now.</span>
              </p>

              <div className="space-y-4">
                <button
                  onClick={onSignUp}
                  className="w-full py-5 bg-blue-500 hover:bg-blue-400 active:scale-[0.98] text-white font-semibold rounded-2xl transition-all text-lg"
                  style={{ animation: 'glow-pulse 2.8s ease-in-out infinite' }}
                >
                  Begin Your Journey
                </button>
                <button
                  onClick={onSignIn}
                  className="w-full py-4 text-white/60 hover:text-white/85 font-medium rounded-2xl transition-all text-base border border-white/15 hover:border-white/30 hover:bg-white/5"
                >
                  I'm Already on My Journey
                </button>
              </div>

              <p className="text-white/25 text-xs mt-6 tracking-wide">
                Free to start. No credit card required.
              </p>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────────

export function AuthScreen() {
  const [view, setView] = useState<'landing' | 'signup' | 'signin'>('landing');

  if (view === 'signup' || view === 'signin') {
    return <AuthForm defaultMode={view} onBack={() => setView('landing')} />;
  }

  return <LandingPage onSignUp={() => setView('signup')} onSignIn={() => setView('signin')} />;
}
