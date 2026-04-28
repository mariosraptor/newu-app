import { useState, useEffect } from 'react';
import { Crown, Lock, Check, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useUpgrade } from '../../contexts/UpgradeContext';

type AddictionGroup = 'smoking' | 'alcohol' | 'sugar' | 'dopamine';

interface Milestone {
  minutes: number;
  timeLabel: string;
  description: string;
}

const MILESTONES: Record<AddictionGroup, Milestone[]> = {
  smoking: [
    { minutes: 20,     timeLabel: '20 min',   description: 'Blood pressure & heart rate normalize' },
    { minutes: 480,    timeLabel: '8 hours',   description: 'Oxygen levels normalize in blood' },
    { minutes: 1440,   timeLabel: '1 day',     description: 'Heart attack risk begins to drop' },
    { minutes: 4320,   timeLabel: '3 days',    description: 'Breathing easier, airways open' },
    { minutes: 20160,  timeLabel: '2 weeks',   description: 'Circulation improves significantly' },
    { minutes: 43200,  timeLabel: '1 month',   description: 'Lung function improves by up to 30%' },
    { minutes: 525600, timeLabel: '1 year',    description: 'Heart disease risk cut in half' },
  ],
  alcohol: [
    { minutes: 1440,   timeLabel: '24 hours',  description: 'Liver begins active repair' },
    { minutes: 4320,   timeLabel: '3 days',    description: 'Sleep quality improves, anxiety drops' },
    { minutes: 10080,  timeLabel: '1 week',    description: 'Skin hydration returns, eyes clearer' },
    { minutes: 43200,  timeLabel: '1 month',   description: 'Liver fat reduces significantly' },
    { minutes: 129600, timeLabel: '3 months',  description: 'Cognitive function and memory improve' },
    { minutes: 525600, timeLabel: '1 year',    description: 'Liver nearly fully regenerated' },
  ],
  sugar: [
    { minutes: 4320,   timeLabel: '3 days',    description: 'Blood sugar levels stabilize' },
    { minutes: 10080,  timeLabel: '1 week',    description: 'Energy levels even out, no more crashes' },
    { minutes: 20160,  timeLabel: '2 weeks',   description: 'Skin clarity begins to improve' },
    { minutes: 43200,  timeLabel: '1 month',   description: 'Reduced inflammation, better digestion' },
    { minutes: 129600, timeLabel: '3 months',  description: 'Sustained energy, cravings gone' },
  ],
  dopamine: [
    { minutes: 4320,   timeLabel: '3 days',    description: 'Dopamine receptors begin resetting' },
    { minutes: 10080,  timeLabel: '1 week',    description: 'Sleep quality improves dramatically' },
    { minutes: 20160,  timeLabel: '2 weeks',   description: 'Focus and attention span increases' },
    { minutes: 43200,  timeLabel: '1 month',   description: 'Anxiety significantly reduced' },
    { minutes: 129600, timeLabel: '3 months',  description: 'Brain rewired, new habits formed' },
    { minutes: 525600, timeLabel: '1 year',    description: 'Reward system fully recalibrated' },
  ],
};

function getGroup(addictions: string[]): AddictionGroup {
  const a = addictions.map(x => x.toLowerCase());
  if (a.some(x => ['smoking', 'vaping', 'snus', 'nicotine'].includes(x))) return 'smoking';
  if (a.includes('alcohol')) return 'alcohol';
  if (a.includes('sugar')) return 'sugar';
  return 'dopamine';
}

function getDisplayName(addictions: string[]): string {
  const map: Record<string, string> = {
    smoking: 'Smoking', vaping: 'Vaping', snus: 'Snus', alcohol: 'Alcohol',
    sugar: 'Sugar', socialmedia: 'Social Media', social_media: 'Social Media',
    gambling: 'Gambling', porn: 'Porn',
  };
  if (!addictions.length) return 'Recovery';
  const key = addictions[0].toLowerCase().replace(/ /g, '_');
  return map[key] ?? (addictions[0].charAt(0).toUpperCase() + addictions[0].slice(1));
}

function countdown(mins: number): string {
  if (mins < 60) return `${Math.ceil(mins)} min`;
  if (mins < 1440) return `${Math.ceil(mins / 60)}h`;
  const days = Math.ceil(mins / 1440);
  if (days < 14) return `${days} day${days !== 1 ? 's' : ''}`;
  const weeks = Math.ceil(mins / 10080);
  if (weeks < 8) return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  const months = Math.ceil(mins / 43200);
  return `${months} month${months !== 1 ? 's' : ''}`;
}

// ── Glow sub-components (pure SVG) ──────────────────────────────────────────

function GreenOrgan({ cx, cy, rx, ry, dur = '2s' }: { cx: number; cy: number; rx: number; ry: number; dur?: string }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx * 1.8} ry={ry * 1.8} fill="#22c55e" fillOpacity="0.07" />
      <ellipse cx={cx} cy={cy} rx={rx * 1.35} ry={ry * 1.35} fill="#22c55e" fillOpacity="0.15" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#22c55e" fillOpacity="0.85">
        <animate attributeName="fill-opacity" values="0.6;1;0.6" dur={dur} repeatCount="indefinite" />
      </ellipse>
    </>
  );
}

function BlueOrgan({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx * 1.8} ry={ry * 1.8} fill="#3b82f6" fillOpacity="0.07" />
      <ellipse cx={cx} cy={cy} rx={rx * 1.35} ry={ry * 1.35} fill="#3b82f6" fillOpacity="0.15" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#3b82f6" fillOpacity="0.85">
        <animate attributeName="fill-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </ellipse>
    </>
  );
}

function GoldOrgan({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return (
    <>
      <ellipse cx={cx} cy={cy} rx={rx * 1.8} ry={ry * 1.8} fill="#f59e0b" fillOpacity="0.08" />
      <ellipse cx={cx} cy={cy} rx={rx * 1.35} ry={ry * 1.35} fill="#f59e0b" fillOpacity="0.18" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#f59e0b" fillOpacity="0.9">
        <animate attributeName="fill-opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" />
      </ellipse>
    </>
  );
}

function DimOrgan({ cx, cy, rx, ry }: { cx: number; cy: number; rx: number; ry: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="white" fillOpacity="0.12" />;
}

// ── Body SVG diagram ─────────────────────────────────────────────────────────

function BodyDiagram({ addictions, daysClean }: { addictions: string[]; daysClean: number }) {
  const a = addictions.map(x => x.toLowerCase());
  const isSmokingGroup = a.some(x => ['smoking', 'vaping', 'snus'].includes(x));
  const isAlcohol = a.includes('alcohol');

  const heartGlows  = daysClean >= 1;
  const lungsGlow   = daysClean >= 3 && isSmokingGroup;
  const brainGlows  = daysClean >= 7;
  const liverGlows  = daysClean >= 14 && isAlcohol;
  const fullGlow    = daysClean >= 90;
  const skinGlows   = daysClean >= 30;

  const outlineColor   = fullGlow ? '#f59e0b' : skinGlows ? '#fbbf24' : 'white';
  const outlineOpacity = fullGlow ? 0.5 : skinGlows ? 0.3 : 0.13;
  const fillOpacity    = fullGlow ? 0.18 : 0.09;
  const fillColor      = fullGlow ? '#f59e0b' : 'white';

  const bodyShapes = (
    <>
      <circle cx="90" cy="45" r="32" />
      <rect x="78" y="77" width="24" height="17" rx="4" />
      <rect x="46" y="90" width="88" height="12" rx="6" />
      <rect x="56" y="100" width="68" height="95" rx="10" />
      <rect x="28"  y="94"  width="24" height="72" rx="10" />
      <rect x="128" y="94"  width="24" height="72" rx="10" />
      <rect x="22"  y="162" width="22" height="60" rx="9" />
      <rect x="136" y="162" width="22" height="60" rx="9" />
      <rect x="58"  y="193" width="30" height="88" rx="10" />
      <rect x="92"  y="193" width="30" height="88" rx="10" />
      <rect x="59"  y="278" width="27" height="88" rx="9" />
      <rect x="94"  y="278" width="27" height="88" rx="9" />
    </>
  );

  return (
    <svg viewBox="0 0 180 390" className="w-full max-w-[170px] mx-auto">
      {/* Full-body aura at 90 days */}
      {fullGlow && (
        <ellipse cx="90" cy="195" rx="88" ry="196" fill="#f59e0b" fillOpacity="0.05">
          <animate attributeName="fill-opacity" values="0.03;0.08;0.03" dur="3s" repeatCount="indefinite" />
        </ellipse>
      )}

      {/* Silhouette fill */}
      <g fill={fillColor} fillOpacity={fillOpacity}>{bodyShapes}</g>

      {/* Silhouette outline */}
      <g fill="none" stroke={outlineColor} strokeOpacity={outlineOpacity} strokeWidth="1.5">
        {bodyShapes}
      </g>

      {/* Brain — blue after 7 days */}
      {fullGlow ? <GoldOrgan cx={90} cy={38} rx={20} ry={18} />
        : brainGlows ? <BlueOrgan cx={90} cy={38} rx={20} ry={18} />
        : <DimOrgan cx={90} cy={38} rx={20} ry={18} />}

      {/* Heart — green after 1 day */}
      {fullGlow ? <GoldOrgan cx={78} cy={124} rx={12} ry={13} />
        : heartGlows ? <GreenOrgan cx={78} cy={124} rx={12} ry={13} dur="1.2s" />
        : <DimOrgan cx={78} cy={124} rx={12} ry={13} />}

      {/* Left lung — green after 3 days (smoking/vaping) */}
      {fullGlow ? <GoldOrgan cx={69} cy={142} rx={9} ry={20} />
        : lungsGlow ? <GreenOrgan cx={69} cy={142} rx={9} ry={20} dur="2s" />
        : <DimOrgan cx={69} cy={142} rx={9} ry={20} />}

      {/* Right lung */}
      {fullGlow ? <GoldOrgan cx={111} cy={142} rx={9} ry={20} />
        : lungsGlow ? <GreenOrgan cx={111} cy={142} rx={9} ry={20} dur="2s" />
        : <DimOrgan cx={111} cy={142} rx={9} ry={20} />}

      {/* Liver — green after 14 days (alcohol) */}
      {fullGlow ? <GoldOrgan cx={111} cy={175} rx={15} ry={11} />
        : liverGlows ? <GreenOrgan cx={111} cy={175} rx={15} ry={11} dur="2.5s" />
        : <DimOrgan cx={111} cy={175} rx={15} ry={11} />}
    </svg>
  );
}

// ── Recovery percentage ring ──────────────────────────────────────────────────

function RecoveryCircle({ percent }: { percent: number }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - percent / 100);
  const color = percent >= 90 ? '#f59e0b' : percent >= 50 ? '#22c55e' : '#3b82f6';

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r={r} fill="none" stroke="white" strokeOpacity="0.1" strokeWidth="9" />
      <circle
        cx="60" cy="60" r={r}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="56" textAnchor="middle" fill="white" fontSize="22" fontWeight="bold" fontFamily="sans-serif">
        {percent}%
      </text>
      <text x="60" y="72" textAnchor="middle" fill="white" fillOpacity="0.45" fontSize="9" fontFamily="sans-serif">
        recovered
      </text>
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function BodyTransformationTab() {
  const { user } = useAuth();
  const { openUpgradeModal } = useUpgrade();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addictions, setAddictions] = useState<string[]>([]);
  const [minutesClean, setMinutesClean] = useState(0);
  const [daysClean, setDaysClean] = useState(0);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [subRes, journeyRes] = await Promise.all([
      supabase.from('subscription_status').select('is_premium').eq('user_id', user.id).maybeSingle(),
      supabase.from('journeys').select('quit_datetime, addiction_type').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
    ]);

    setIsPremium(subRes.data?.is_premium || false);

    if (journeyRes.data?.quit_datetime) {
      const mins = Math.max(0, (Date.now() - new Date(journeyRes.data.quit_datetime).getTime()) / 60000);
      setMinutesClean(mins);
      setDaysClean(Math.floor(mins / 1440));
      if (journeyRes.data.addiction_type) setAddictions([journeyRes.data.addiction_type]);
    } else {
      try {
        const raw = localStorage.getItem('onboardingData');
        if (raw) {
          const od = JSON.parse(raw);
          if (od.quitDate) {
            const mins = Math.max(0, (Date.now() - new Date(od.quitDate).getTime()) / 60000);
            setMinutesClean(mins);
            setDaysClean(Math.floor(mins / 1440));
          }
          if (od.addictions?.length) setAddictions(od.addictions);
        }
      } catch (_) { /* ignore */ }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#001F3F]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // ── Premium gate ────────────────────────────────────────────────────────────
  if (!isPremium) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-light text-white mb-2">Body Transformation</h1>
          <p className="text-white/70 mb-6">See exactly what's healing inside your body</p>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <Lock className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-3">Premium Feature</h2>
            <p className="text-white/70 mb-6">
              Unlock a real-time visual of your body's recovery — glowing organs, milestone timelines, and your personal recovery score.
            </p>
            <div className="bg-white/10 rounded-xl p-4 mb-6 text-left">
              <div className="text-white font-medium mb-3">What you'll see:</div>
              <ul className="text-white/70 text-sm space-y-2">
                <li>• Live body diagram with glowing organs</li>
                <li>• Recovery % score updating in real time</li>
                <li>• Addiction-specific healing milestones</li>
                <li>• Countdown to your next recovery milestone</li>
                <li>• Full body gold glow at 90 days clean</li>
              </ul>
            </div>
            <button
              onClick={() => {
                console.log('[BodyTransformationTab] upgrade button clicked');
                openUpgradeModal();
              }}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-medium transition-all"
            >
              Start Free Trial — Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Premium content ─────────────────────────────────────────────────────────
  const group = getGroup(addictions);
  const milestones = MILESTONES[group];
  const completed = milestones.filter(m => minutesClean >= m.minutes).length;
  const recoveryPercent = milestones.length > 0
    ? Math.min(99, Math.round((completed / milestones.length) * 100))
    : 0;

  const addictionLabel = getDisplayName(addictions);
  const a = addictions.map(x => x.toLowerCase());
  const isSmokingGroup = a.some(x => ['smoking', 'vaping', 'snus'].includes(x));
  const isAlcohol = a.includes('alcohol');
  const fullGlow = daysClean >= 90;
  const skinGlows = daysClean >= 30;

  const organLegend = [
    { label: 'Heart',  active: daysClean >= 1,                       color: 'green', show: true },
    { label: 'Lungs',  active: daysClean >= 3 && isSmokingGroup,      color: 'green', show: isSmokingGroup },
    { label: 'Brain',  active: daysClean >= 7,                       color: 'blue',  show: true },
    { label: 'Liver',  active: daysClean >= 14 && isAlcohol,          color: 'green', show: isAlcohol },
    { label: 'Skin',   active: skinGlows,                             color: 'yellow', show: true },
  ].filter(o => o.show);

  const nextMilestone = milestones.find(m => minutesClean < m.minutes);

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-light text-white mb-2">Body Transformation</h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full">
            <span className="text-white/60 text-sm">{addictionLabel}</span>
            <span className="text-white/25">·</span>
            <span className="text-green-400 text-sm font-semibold">Day {daysClean}</span>
          </div>
        </div>

        {/* Recovery ring + Body diagram side by side */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="flex flex-col items-center gap-1">
            <RecoveryCircle percent={recoveryPercent} />
            <span className="text-white/40 text-[11px] text-center leading-tight">
              {fullGlow ? '🌟 Full healing' : skinGlows ? 'Advanced' : 'In progress'}
            </span>
          </div>
          <BodyDiagram addictions={addictions} daysClean={daysClean} />
        </div>

        {/* Organ legend */}
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {organLegend.map(({ label, active, color }) => {
            const isActive = fullGlow || active;
            const activeColor = fullGlow
              ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
              : color === 'blue'
                ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                : 'bg-green-500/20 border-green-500/40 text-green-400';
            const dotColor = fullGlow ? 'bg-yellow-400' : color === 'blue' ? 'bg-blue-400' : 'bg-green-400';

            return (
              <div
                key={label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isActive ? activeColor : 'bg-white/5 border-white/10 text-white/35'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? dotColor : 'bg-white/20'}`} />
                {label}
              </div>
            );
          })}
        </div>

        {/* Next milestone callout */}
        {nextMilestone && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
            <div>
              <div className="text-blue-400 text-sm font-medium">
                Next milestone in {countdown(nextMilestone.minutes - minutesClean)}
              </div>
              <div className="text-white/50 text-xs mt-0.5">{nextMilestone.description}</div>
            </div>
          </div>
        )}

        {/* Milestones timeline */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h2 className="text-white/70 text-xs font-semibold uppercase tracking-widest">Recovery Timeline</h2>
          </div>
          <div className="divide-y divide-white/5">
            {milestones.map((m, i) => {
              const done = minutesClean >= m.minutes;
              const remaining = m.minutes - minutesClean;
              return (
                <div key={i} className={`flex items-start gap-4 px-5 py-4 ${done ? '' : 'opacity-55'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    done
                      ? 'bg-green-500/20 border border-green-500/40'
                      : 'bg-white/5 border border-white/15'
                  }`}>
                    {done
                      ? <Check className="w-4 h-4 text-green-400" />
                      : <Clock className="w-3.5 h-3.5 text-white/35" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-sm font-semibold ${done ? 'text-white' : 'text-white/45'}`}>
                        {m.timeLabel}
                      </span>
                      {done
                        ? <span className="text-green-400/60 text-xs flex-shrink-0">✓ reached</span>
                        : <span className="text-white/30 text-xs flex-shrink-0">in {countdown(remaining)}</span>}
                    </div>
                    <p className={`text-sm leading-snug ${done ? 'text-white/70' : 'text-white/30'}`}>
                      {m.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
