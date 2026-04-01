import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

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

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const motto = getDailyMotto();

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 150),   // logo
      setTimeout(() => setPhase(2), 850),   // tagline
      setTimeout(() => setPhase(3), 1550),  // motto
      setTimeout(() => onComplete(), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-[#000d1a] via-[#001533] to-[#001F3F] flex flex-col items-center justify-center z-50 px-8">

      {/* Logo & name */}
      <div
        className={`text-center mb-5 transition-all duration-700 ${
          phase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <div className="relative inline-block mb-6">
          {/* Outer glow ring */}
          <div className={`absolute inset-0 rounded-3xl bg-blue-500/20 blur-xl transition-opacity duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`} />
          <div className="relative w-24 h-24 bg-blue-500/15 rounded-3xl flex items-center justify-center border border-blue-400/25 shadow-2xl shadow-blue-500/20">
            <Sparkles className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        <h1 className="text-white text-5xl font-light tracking-widest">NewU</h1>
      </div>

      {/* Tagline */}
      <div
        className={`text-center mb-10 transition-all duration-700 ${
          phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <p className="text-white/55 text-lg font-light tracking-wide">
          Become someone new.
        </p>
      </div>

      {/* Daily motto */}
      <div
        className={`max-w-xs text-center transition-all duration-700 ${
          phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/40 mx-auto mb-3 animate-pulse" />
        <p className="text-white/30 text-sm italic font-light leading-relaxed">
          "{motto}"
        </p>
      </div>

      {/* Footer */}
      <div
        className={`absolute bottom-10 transition-all duration-700 ${
          phase >= 3 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p className="text-white/15 text-xs tracking-wide">
          Powered by your self love.
        </p>
      </div>
    </div>
  );
}
