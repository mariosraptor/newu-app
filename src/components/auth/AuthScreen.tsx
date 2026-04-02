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
    setResetError('');
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin,
      });
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
                    onClick={() => { setForgotMode(true); setResetEmail(email); setResetError(''); setResetSent(false); }}
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

const FEATURES = [
  {
    icon: '🧠',
    title: 'Nova AI Companion',
    desc: 'Your personal recovery companion. Available 24/7. Never judges. Always listens.',
  },
  {
    icon: '📊',
    title: 'Real-time Tracking',
    desc: 'Watch your days, money saved, and health recovery update in real time.',
  },
  {
    icon: '🆘',
    title: 'Emergency Support',
    desc: 'One tap when you need help most. Breathing exercises, grounding tools, instant calm.',
  },
  {
    icon: '🌿',
    title: 'Wellness Hub',
    desc: 'CBT exercises, binaural frequencies, and science-backed tools for your mind.',
  },
  {
    icon: '💰',
    title: 'Savings Goals',
    desc: "See exactly how much money you're saving and what dream you can buy with it.",
  },
  {
    icon: '📸',
    title: 'Progress Tracking',
    desc: 'Document your transformation with selfies and milestone celebrations.',
  },
];

const TESTIMONIALS = [
  { quote: "I tried 6 times before NewU. Day 94 now.", name: "James", age: 34 },
  { quote: "Nova talked me through my worst craving at 3am. I didn't give in.", name: "Sarah", age: 28 },
  { quote: "I've saved €847 in 3 months. Booking my first holiday.", name: "Nikos", age: 41 },
];

function LandingPage({ onSignUp, onSignIn }: { onSignUp: () => void; onSignIn: () => void }) {
  const motto = getDailyMotto();

  return (
    <div className="min-h-screen bg-[#000d1a] overflow-x-hidden">

      {/* ── SECTION 1: Hero ─────────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center relative bg-gradient-to-b from-[#000d1a] via-[#001533] to-[#001F3F]">

        {/* Logo */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/15 rounded-3xl mb-5 border border-blue-400/20 shadow-2xl shadow-blue-500/20">
            <Sparkles className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-blue-400/70 text-sm font-medium tracking-widest uppercase">NewU</p>
        </div>

        {/* Headline */}
        <div className="mb-8 max-w-sm">
          <h1 className="text-5xl font-light text-white leading-tight mb-4">
            Become<br />Someone New.
          </h1>
          <p className="text-white/50 text-lg font-light leading-relaxed">
            The strength you need is already inside you.
          </p>
        </div>

        {/* Daily motto card */}
        <div className="max-w-xs mx-auto mb-10">
          <div className="relative px-6 py-5 rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/8 to-blue-600/5 shadow-inner">
            {/* Soft glow */}
            <div className="absolute inset-0 rounded-2xl bg-blue-400/5 blur-xl -z-10" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 mx-auto mb-3 animate-pulse" />
            <p className="text-white/65 text-sm italic font-light leading-relaxed">
              "{motto}"
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="w-full max-w-xs space-y-3 mb-16">
          <button
            onClick={onSignUp}
            className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-blue-500/35 text-base"
          >
            Begin Your Journey
          </button>
          <button
            onClick={onSignIn}
            className="w-full py-4 bg-white/8 hover:bg-white/12 text-white/75 font-medium rounded-2xl transition-all border border-white/15 text-base"
          >
            I'm Already on My Journey
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25">
          <span className="text-xs tracking-wide">Scroll to discover</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* ── SECTION 2: Features ─────────────────────────────────────────────── */}
      <section className="px-5 py-20 bg-gradient-to-b from-[#001F3F] to-[#001a35]">
        <div className="max-w-lg mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-light text-white mb-3">
              Everything you need to transform
            </h2>
            <p className="text-white/45 leading-relaxed">
              Science-backed tools. Human warmth. Real results.
            </p>
          </FadeIn>

          <div className="space-y-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 70}>
                <div className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5">
                  <span className="text-3xl flex-shrink-0 mt-0.5">{f.icon}</span>
                  <div>
                    <h3 className="text-white font-medium mb-1">{f.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 3: Social proof ──────────────────────────────────────────── */}
      <section className="px-5 py-20 bg-gradient-to-b from-[#001a35] to-[#000f25]">
        <div className="max-w-lg mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-light text-white mb-3">You are not alone</h2>
            <p className="text-white/45">Thousands are on this journey with you right now.</p>
          </FadeIn>

          <div className="space-y-4">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={t.name} delay={i * 90}>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-white/80 text-base italic font-light leading-relaxed mb-4">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <span className="text-blue-300 text-xs font-medium">{t.name[0]}</span>
                    </div>
                    <p className="text-white/35 text-sm">— {t.name}, {t.age}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Final CTA ─────────────────────────────────────────────── */}
      <section className="px-5 py-28 bg-gradient-to-b from-[#000f25] to-[#000a1a]">
        <div className="max-w-sm mx-auto text-center">
          <FadeIn>
            <h2 className="text-3xl font-light text-white mb-4 leading-tight">
              Your journey starts with<br />one decision.
            </h2>
            <p className="text-white/40 mb-10 text-base">That decision is right now.</p>
            <button
              onClick={onSignUp}
              className="w-full py-5 bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white font-semibold rounded-2xl transition-all shadow-2xl shadow-blue-500/35 text-lg mb-4"
            >
              Become Someone New
            </button>
            <button
              onClick={onSignIn}
              className="text-white/35 hover:text-white/55 text-sm transition-colors"
            >
              Already started? Sign in
            </button>
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
