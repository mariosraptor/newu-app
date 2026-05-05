import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Sparkles, ChevronDown } from 'lucide-react';

// ─── Daily rotating motto ──────────────────────────────────────────────────────

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

// ─── Fade-in on scroll ─────────────────────────────────────────────────────────

function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Auth form (sign up / sign in / forgot password) ─────────────────────────

function friendlyAuthError(message: string): string {
  const msg = message.toLowerCase();
  if (
    msg.includes('rate') ||
    msg.includes('too many') ||
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('email rate')
  ) {
    return 'Too many attempts. Please wait a few minutes and try again.';
  }
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (msg.includes('password') && msg.includes('6')) {
    return 'Password must be at least 6 characters.';
  }
  return message;
}

function AuthForm({
  defaultMode,
  onBack,
}: {
  defaultMode: 'signup' | 'signin';
  onBack: () => void;
}) {
  const [isSignUp, setIsSignUp] = useState(defaultMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot password state
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
    console.log('[ForgotPassword] form submitted, email:', resetEmail);
    setResetError('');
    setResetLoading(true);
    try {
      console.log('[ForgotPassword] calling supabase.auth.resetPasswordForEmail...');
      const { data, error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: 'https://newu-app.netlify.app',
      });
      console.log('[ForgotPassword] response → data:', data, 'error:', error);
      if (error) throw error;
      console.log('[ForgotPassword] success — showing confirmation');
      setResetSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred';
      console.error('[ForgotPassword] caught error:', msg);
      setResetError(friendlyAuthError(msg));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000d1a] via-[#001F3F] to-[#002a52] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={forgotMode ? () => setForgotMode(false) : onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-8 transition-colors"
        >
          ← {forgotMode ? 'Back to Sign In' : 'Back'}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-5 border border-blue-500/30">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-light text-white mb-1">NewU</h1>
          <p className="text-white/50 text-sm">Become Someone New</p>
        </div>

        {/* ── Forgot password panel ── */}
        {forgotMode ? (
          <div className="bg-white/8 backdrop-blur-lg rounded-3xl border border-white/15 p-6">
            <h2 className="text-white font-medium text-lg mb-1">Reset your password</h2>
            <p className="text-white/50 text-sm mb-5">
              Enter your email and we'll send you a reset link.
            </p>

            {resetSent ? (
              <div className="p-4 bg-green-500/15 border border-green-500/30 rounded-xl text-sm text-green-300 text-center leading-relaxed">
                Check your email for a password reset link.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/70 transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                {resetError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-sm text-red-300">
                    {resetError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
                >
                  {resetLoading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ── Sign up / sign in panel ── */
          <div className="bg-white/8 backdrop-blur-lg rounded-3xl border border-white/15 p-6">
            <div className="flex mb-6 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm ${
                  isSignUp ? 'bg-blue-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all text-sm ${
                  !isSignUp ? 'bg-blue-500 text-white shadow-sm' : 'text-white/50 hover:text-white/80'
                }`}
              >
                Sign In
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/70 transition-colors"
                    placeholder="Enter your name"
                    required={isSignUp}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/70 transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/70 transition-colors"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      console.log('[ForgotPassword] link clicked, switching to reset mode');
                      setForgotMode(true);
                      setResetEmail(email);
                      setResetError('');
                      setResetSent(false);
                    }}
                    className="mt-2 text-xs text-blue-400/70 hover:text-blue-400 transition-colors"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 mt-2"
              >
                {loading ? 'Please wait…' : isSignUp ? 'Begin Your Journey' : 'Welcome Back'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Landing page ──────────────────────────────────────────────────────────────

const STATS = [
  "30,000+ days of sobriety tracked",
  "94% of users feel stronger after 30 days",
  "Built by someone who's been there",
];

const PREVIEW_CARDS = [
  {
    icon: '🤖',
    title: 'Nova AI',
    desc: 'Your personal companion. Available 3am. Never judges.',
    gradient: 'from-blue-500/15 to-blue-600/8',
    border: 'border-blue-500/20',
  },
  {
    icon: '🫀',
    title: 'Body Science',
    desc: "See exactly what's happening inside your body right now.",
    gradient: 'from-purple-500/15 to-purple-600/8',
    border: 'border-purple-500/20',
  },
  {
    icon: '🏯',
    title: 'Eastern Wisdom',
    desc: 'Ancient Japanese methods proven by modern neuroscience.',
    gradient: 'from-amber-500/15 to-amber-600/8',
    border: 'border-amber-500/20',
  },
];

function LandingPage({ onSignUp, onSignIn }: { onSignUp: () => void; onSignIn: () => void }) {
  const motto = getDailyMotto();
  const [statIndex, setStatIndex] = useState(0);
  const [statVisible, setStatVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatVisible(false);
      setTimeout(() => {
        setStatIndex(i => (i + 1) % STATS.length);
        setStatVisible(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#000d1a] overflow-x-hidden">

      {/* ── SECTION 1: Hero (no buttons) ────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center relative bg-gradient-to-b from-[#000d1a] via-[#001533] to-[#001F3F]">

        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/15 rounded-3xl mb-5 border border-blue-400/20 shadow-2xl shadow-blue-500/20">
            <Sparkles className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-blue-400/70 text-xs font-medium tracking-widest uppercase">NewU</p>
        </div>

        {/* Headline */}
        <div className="mb-6 max-w-sm">
          <h1 className="text-4xl font-light text-white leading-tight mb-3">
            The person you want<br />to be is waiting.
          </h1>
          <p className="text-white/50 text-lg font-light">
            NewU helps you find them.
          </p>
        </div>

        {/* Daily motto */}
        <div className="max-w-xs mx-auto mb-8">
          <div className="relative px-6 py-4 rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/8 to-blue-600/5">
            <div className="absolute inset-0 rounded-2xl bg-blue-400/5 blur-xl -z-10" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 mx-auto mb-2 animate-pulse" />
            <p className="text-white/60 text-sm italic font-light leading-relaxed">
              "{motto}"
            </p>
          </div>
        </div>

        {/* Rotating stats */}
        <div className="h-8 flex items-center justify-center">
          <p
            className="text-blue-300/70 text-sm font-medium transition-opacity duration-500"
            style={{ opacity: statVisible ? 1 : 0 }}
          >
            ✦ {STATS[statIndex]}
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30">
          <span className="text-xs tracking-wide">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ── SECTION 2: Feature preview cards ────────────────────────────────── */}
      <section className="py-16 bg-gradient-to-b from-[#001F3F] to-[#001228]">
        <FadeIn className="text-center mb-8 px-5">
          <p className="text-white/40 text-xs tracking-widest uppercase font-medium mb-2">What's inside</p>
          <h2 className="text-2xl font-light text-white">Everything you need</h2>
        </FadeIn>

        <div className="overflow-x-auto -mx-0 px-5">
          <div className="flex gap-4 pb-3" style={{ width: 'max-content', paddingRight: '20px' }}>
            {PREVIEW_CARDS.map((card) => (
              <div
                key={card.title}
                className={`w-64 flex-shrink-0 bg-gradient-to-br ${card.gradient} border ${card.border} rounded-2xl p-6`}
              >
                <span className="text-3xl block mb-4">{card.icon}</span>
                <h3 className="text-white font-semibold text-base mb-2">{card.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-4 gap-2">
          {PREVIEW_CARDS.map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/25" />
          ))}
        </div>
      </section>

      {/* ── SECTION 3: CTA at the very bottom ───────────────────────────────── */}
      <section className="px-5 py-28 bg-gradient-to-b from-[#001228] to-[#000a1a]">
        <div className="max-w-sm mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl font-light text-white mb-3 leading-tight">
              Your journey starts<br />with one decision.
            </h2>
            <p className="text-white/35 mb-10 text-sm">That decision is right now.</p>
            <div className="space-y-3">
              <button
                onClick={onSignUp}
                className="w-full py-5 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold rounded-2xl transition-all shadow-2xl shadow-blue-500/35 text-lg"
              >
                Begin Your Journey
              </button>
              <button
                onClick={onSignIn}
                className="w-full py-4 bg-white/8 hover:bg-white/12 text-white/65 font-medium rounded-2xl transition-all border border-white/15 text-base"
              >
                I'm Already on My Journey
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function AuthScreen() {
  const [view, setView] = useState<'landing' | 'signup' | 'signin'>('landing');

  if (view === 'signup' || view === 'signin') {
    return (
      <AuthForm
        defaultMode={view}
        onBack={() => setView('landing')}
      />
    );
  }

  return (
    <LandingPage
      onSignUp={() => setView('signup')}
      onSignIn={() => setView('signin')}
    />
  );
}
