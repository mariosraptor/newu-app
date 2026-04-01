import { useState, useEffect, useRef, useMemo } from 'react';
import { TrendingUp, Zap, Calendar, Award, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useStealth } from '../../contexts/StealthContext';

// ─── Milestone definitions ────────────────────────────────────────────────────

const MILESTONES = [
  { days: 1,   label: '1 Day' },
  { days: 3,   label: '3 Days' },
  { days: 7,   label: '1 Week' },
  { days: 14,  label: '2 Weeks' },
  { days: 21,  label: '21 Days' },
  { days: 30,  label: '1 Month' },
  { days: 90,  label: '3 Months' },
  { days: 180, label: '6 Months' },
  { days: 365, label: '1 Year' },
];

const MILESTONE_MESSAGES: Record<number, string> = {
  1:   "One whole day. The hardest one is done. The rest get easier from here.",
  3:   "Three days. Your body has cleared most of the toxins. That's real.",
  7:   "One week. You have more willpower than you ever gave yourself credit for.",
  14:  "Two weeks. Your brain's reward pathways are actively rewiring.",
  21:  "21 days. This is where new identities are built.",
  30:  "One month. Thirty days of showing up for yourself. Every single one.",
  90:  "Three months. Your lung capacity has measurably improved. You can feel it.",
  180: "Six months. Half a year of choosing your future self.",
  365: "One year. You are someone completely new. You did it.",
};

// ─── Health timeline ──────────────────────────────────────────────────────────

const HEALTH_EVENTS = [
  { minutes: 20,      label: '20 min',   event: 'Heart rate and blood pressure begin to drop' },
  { minutes: 480,     label: '8 hrs',    event: 'Carbon monoxide in your blood drops by half' },
  { minutes: 1440,    label: '1 day',    event: 'Risk of heart attack starts to fall' },
  { minutes: 2880,    label: '2 days',   event: 'Nerve endings regenerating. Taste & smell return.' },
  { minutes: 4320,    label: '3 days',   event: 'Breathing easier. Lung capacity expanding.' },
  { minutes: 20160,   label: '2 weeks',  event: 'Circulation significantly improved' },
  { minutes: 43200,   label: '1 month',  event: 'Lung function improving. Less coughing.' },
  { minutes: 129600,  label: '3 months', event: 'Lung capacity up 30%. Energy rising.' },
  { minutes: 259200,  label: '6 months', event: 'Sleep, mood & energy markedly better' },
  { minutes: 525600,  label: '1 year',   event: 'Risk of heart disease halved' },
  { minutes: 2628000, label: '5 years',  event: 'Stroke risk same as someone who never smoked' },
  { minutes: 5256000, label: '10 years', event: 'Lung cancer risk dropped by 50%' },
];

// ─── Stats computation ────────────────────────────────────────────────────────

interface Stats {
  daysClean: number;
  minutesClean: number;
  sobrietyPercent: number;
  dopaminePoints: number;
  nextMilestoneLabel: string;
  milestoneProgress: number;
}

function computeStats(quitDateStr: string): Stats {
  const quitDate = new Date(quitDateStr);
  const diffMs   = Date.now() - quitDate.getTime();
  const days     = diffMs / (1000 * 60 * 60 * 24);
  const daysClean = Math.max(0, Math.floor(days));
  const minutesClean = Math.max(0, diffMs / 60000);

  const sobrietyPercent = Math.min(100, parseFloat(((days / 365) * 100).toFixed(1)));
  const dopaminePoints  = daysClean * 10;

  const next     = MILESTONES.find(m => m.days > daysClean) ?? MILESTONES[MILESTONES.length - 1];
  const prevDays = [...MILESTONES].reverse().find(m => m.days <= daysClean)?.days ?? 0;
  const milestoneProgress = next.days <= daysClean
    ? 100
    : Math.min(100, ((daysClean - prevDays) / (next.days - prevDays)) * 100);

  return { daysClean, minutesClean, sobrietyPercent, dopaminePoints, nextMilestoneLabel: next.label, milestoneProgress };
}

function getQuitDateFromLocalStorage(): string | null {
  try {
    const raw = localStorage.getItem('onboardingData');
    if (raw) { const d = JSON.parse(raw); return d.quitDate ?? null; }
  } catch {}
  return null;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const COLORS = ['#3B82F6','#06B6D4','#8B5CF6','#F59E0B','#10B981','#EC4899','#EF4444'];
  const pieces = useMemo(() =>
    Array.from({ length: 55 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 1.8,
      duration: 2.5 + Math.random() * 2,
      size: 5 + Math.random() * 8,
      round: Math.random() > 0.4,
    })),
  []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          85%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: 0,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.round ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Milestone overlay ────────────────────────────────────────────────────────

function MilestoneOverlay({ days, onClose }: { days: number; onClose: () => void }) {
  const milestoneLabel = MILESTONES.find(m => m.days === days)?.label ?? `${days} Days`;
  const message = MILESTONE_MESSAGES[days] ?? "Another milestone reached. You keep showing up.";

  return (
    <>
      <Confetti />
      <div className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6">
        <div className="bg-gradient-to-b from-[#001a35] to-[#002a52] border border-white/20 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="text-6xl mb-5 animate-bounce">🎉</div>
          <p className="text-blue-400/60 text-xs uppercase tracking-widest mb-2 font-medium">
            Milestone Reached
          </p>
          <h2 className="text-white text-4xl font-light mb-1">{milestoneLabel}</h2>
          <p className="text-white/50 text-sm mb-6">Clean</p>
          <div className="w-full h-px bg-white/10 mb-6" />
          <p className="text-white/80 text-base font-light leading-relaxed mb-8">
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/30"
          >
            Keep Going 💙
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Health timeline card ──────────────────────────────────────────────────────

function HealthTimeline({ minutesClean }: { minutesClean: number }) {
  const completedCount = HEALTH_EVENTS.filter(e => minutesClean >= e.minutes).length;
  const nextEvent = HEALTH_EVENTS.find(e => minutesClean < e.minutes);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
          <Heart className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-medium">Body Recovery Timeline</h3>
          <p className="text-white/50 text-xs mt-0.5">
            {completedCount} of {HEALTH_EVENTS.length} milestones reached
          </p>
        </div>
      </div>

      {/* Next event highlight */}
      {nextEvent && (
        <div className="mb-5 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-300/70 text-xs uppercase tracking-wider font-medium mb-1">Coming up · {nextEvent.label}</p>
          <p className="text-white/80 text-sm leading-relaxed">{nextEvent.event}</p>
        </div>
      )}

      {/* Events list */}
      <div className="space-y-3">
        {HEALTH_EVENTS.map((e, i) => {
          const done = minutesClean >= e.minutes;
          return (
            <div key={i} className="flex items-start gap-3">
              {/* Dot/check */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                done ? 'bg-green-500/20 border border-green-500/40' : 'bg-white/8 border border-white/15'
              }`}>
                {done
                  ? <span className="text-green-400 text-xs">✓</span>
                  : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs font-semibold ${done ? 'text-green-400/80' : 'text-white/30'}`}>
                    {e.label}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed mt-0.5 ${done ? 'text-white/70' : 'text-white/25'}`}>
                  {e.event}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardTab() {
  const { user } = useAuth();
  const { getTerminology } = useStealth();
  const [loading, setLoading] = useState(true);
  const [quitDate, setQuitDate] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    daysClean: 0,
    minutesClean: 0,
    sobrietyPercent: 0,
    dopaminePoints: 0,
    nextMilestoneLabel: '1 Day',
    milestoneProgress: 0,
  });
  const [celebrationDay, setCelebrationDay] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check milestone celebration
  const checkMilestone = (daysClean: number) => {
    const milestoneDay = MILESTONES.find(m => m.days === daysClean);
    if (!milestoneDay) return;

    try {
      const seen: number[] = JSON.parse(localStorage.getItem('newu_celebrated_milestones') || '[]');
      if (!seen.includes(daysClean)) {
        setCelebrationDay(daysClean);
        localStorage.setItem('newu_celebrated_milestones', JSON.stringify([...seen, daysClean]));
      }
    } catch {}
  };

  // Recalculate stats whenever quitDate changes and every 60s
  useEffect(() => {
    if (!quitDate) return;
    const refresh = () => {
      const s = computeStats(quitDate);
      setStats(s);
      checkMilestone(s.daysClean);
    };
    refresh();
    timerRef.current = setInterval(refresh, 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [quitDate]);

  // Load quit date: localStorage immediately, then Supabase
  useEffect(() => {
    const local = getQuitDateFromLocalStorage();
    if (local) {
      setQuitDate(local);
      setLoading(false);
    }

    if (user) {
      supabase
        .from('journeys')
        .select('quit_datetime')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.quit_datetime) setQuitDate(data.quit_datetime);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (!local) {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#001F3F]">
        <div className="text-white">Loading…</div>
      </div>
    );
  }

  const { daysClean, minutesClean, sobrietyPercent, dopaminePoints, nextMilestoneLabel, milestoneProgress } = stats;
  const RADIUS       = 88;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">

      {/* Milestone celebration overlay */}
      {celebrationDay !== null && (
        <MilestoneOverlay
          days={celebrationDay}
          onClose={() => setCelebrationDay(null)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white mb-2">System Status</h1>
          <p className="text-white/70">Performance Optimization Dashboard</p>
        </div>

        {/* Sobriety ring */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-white/80 text-sm uppercase tracking-wider mb-4">
                {getTerminology('Sobriety')} Percentage
              </h2>
              <div className="relative w-48 h-48 mx-auto">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle cx="96" cy="96" r={RADIUS} stroke="rgba(255,255,255,0.1)" strokeWidth="12" fill="none" />
                  <circle
                    cx="96" cy="96" r={RADIUS}
                    stroke="#00D9FF"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(sobrietyPercent / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-light text-white">{sobrietyPercent.toFixed(1)}%</div>
                    <div className="text-white/60 text-sm mt-1">of 365-day goal</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-white/70 text-sm">
              System baseline established {daysClean} day{daysClean !== 1 ? 's' : ''} ago
            </div>
          </div>
        </div>

        {/* Dopamine bank + Days online */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-xl mb-4 mx-auto">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-white mb-1">{dopaminePoints}</div>
              <div className="text-white/60 text-sm">Dopamine Bank</div>
              <div className="text-white/40 text-xs mt-1">+10 pts / day</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4 mx-auto">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-white mb-1">{daysClean}</div>
              <div className="text-white/60 text-sm">Days Online</div>
            </div>
          </div>
        </div>

        {/* Next milestone */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-medium">Next Milestone</div>
                <div className="text-white/60 text-sm">{nextMilestoneLabel}</div>
              </div>
            </div>
            <div className="text-right">
              <TrendingUp className="w-6 h-6 text-green-400 inline" />
              <div className="text-white/50 text-xs mt-1">{milestoneProgress.toFixed(0)}%</div>
            </div>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${milestoneProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40 mt-1">
            <span>Now</span>
            <span>{nextMilestoneLabel}</span>
          </div>
        </div>

        {/* Bio-clock */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h3 className="text-white font-medium mb-4">Bio-Clock Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Circadian Reset</span>
              <span className="text-green-400">Optimal</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Neural Adaptation</span>
              <span className="text-blue-400">In Progress</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Dopamine Regulation</span>
              <span className="text-yellow-400">Calibrating</span>
            </div>
          </div>
        </div>

        {/* Health timeline */}
        <HealthTimeline minutesClean={minutesClean} />
      </div>
    </div>
  );
}
