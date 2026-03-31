import { useState, useEffect, useRef } from 'react';
import { Waves, Play, Pause, Brain, X, ChevronRight } from 'lucide-react';

// ─── Exercise content definitions ─────────────────────────────────────────────

type ExerciseId = 'reframing' | 'urge-surfing' | 'cost-benefit' | 'future-self';

interface ExerciseMeta {
  id: ExerciseId;
  title: string;
  tagline: string;
  duration: number; // seconds
  durationLabel: string;
  color: string;       // Tailwind text colour
  bgColor: string;     // Tailwind bg colour
  borderColor: string; // Tailwind border colour
}

const EXERCISES: ExerciseMeta[] = [
  {
    id: 'reframing',
    title: 'Thought Reframing',
    tagline: 'Challenge automatic negative thoughts',
    duration: 60,
    durationLabel: '60 seconds',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
  },
  {
    id: 'urge-surfing',
    title: 'Urge Surfing',
    tagline: 'Ride the wave without acting on it',
    duration: 90,
    durationLabel: '90 seconds',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
  },
  {
    id: 'cost-benefit',
    title: 'Cost-Benefit Analysis',
    tagline: 'Honest clarity in 45 seconds',
    duration: 45,
    durationLabel: '45 seconds',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
  },
  {
    id: 'future-self',
    title: 'Future Self Visualization',
    tagline: 'Meet the person you\'re becoming',
    duration: 60,
    durationLabel: '60 seconds',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/40',
  },
];

// ─── Full-screen exercise modal ────────────────────────────────────────────────

function ExerciseModal({
  exercise,
  onClose,
}: {
  exercise: ExerciseMeta;
  onClose: () => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((s) => Math.min(s + 1, exercise.duration));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [exercise.duration]);

  const progress = Math.min(100, (elapsed / exercise.duration) * 100);
  const remaining = exercise.duration - elapsed;
  const remainingLabel =
    remaining > 0
      ? remaining === 1
        ? '1 second'
        : `${remaining} seconds`
      : 'Complete ✓';

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#000d1a] to-[#001a33] flex flex-col overflow-y-auto">
      {/* Top bar: progress + close */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className={`text-xs font-medium tracking-widest uppercase ${exercise.color} opacity-70`}>
            {exercise.durationLabel} exercise
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              exercise.id === 'reframing'    ? 'bg-blue-400' :
              exercise.id === 'urge-surfing' ? 'bg-cyan-400' :
              exercise.id === 'cost-benefit' ? 'bg-amber-400' :
              'bg-purple-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-white/30 mt-1.5">
          <span>{exercise.title}</span>
          <span>{remainingLabel}</span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-5 py-4 max-w-lg mx-auto w-full">
        {exercise.id === 'reframing'    && <ThoughtReframingContent />}
        {exercise.id === 'urge-surfing' && <UrgeSurfingContent />}
        {exercise.id === 'cost-benefit' && <CostBenefitContent />}
        {exercise.id === 'future-self'  && <FutureSelfContent />}
      </div>

      {/* Bottom close */}
      <div className="flex-shrink-0 px-5 pb-10 pt-4 max-w-lg mx-auto w-full">
        <button
          onClick={onClose}
          className={`w-full py-4 rounded-2xl font-medium text-white transition-all ${
            progress >= 100
              ? exercise.id === 'reframing'    ? 'bg-blue-500 hover:bg-blue-400' :
                exercise.id === 'urge-surfing' ? 'bg-cyan-500 hover:bg-cyan-400' :
                exercise.id === 'cost-benefit' ? 'bg-amber-500 hover:bg-amber-400' :
                'bg-purple-500 hover:bg-purple-400'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          {progress >= 100 ? 'Done — I feel better' : 'Close'}
        </button>
      </div>
    </div>
  );
}

// ─── Thought Reframing content ─────────────────────────────────────────────────

function ThoughtReframingContent() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Introduction</p>
        <p className="text-white text-2xl font-light leading-relaxed">
          Your thoughts aren't facts.
        </p>
        <p className="text-white/70 text-lg font-light leading-relaxed mt-2">
          Let's challenge them.
        </p>
      </div>

      <div className="space-y-5">
        <Step number={1} color="bg-blue-500/30 text-blue-300" label="Notice the thought">
          What is the automatic negative thought you're having right now? Say it plainly, without judgment. Just name it.
        </Step>

        <Step number={2} color="bg-blue-500/30 text-blue-300" label="Challenge it">
          Is this thought 100% true? What evidence do you actually have against it? Has it been wrong before?
        </Step>

        <Step number={3} color="bg-blue-500/30 text-blue-300" label="Reframe it">
          What would you say to a close friend who was having this exact thought? Say that to yourself instead.
        </Step>
      </div>

      <ClosingQuote>
        You are not your thoughts.{'\n'}You are the one observing them.
      </ClosingQuote>
    </div>
  );
}

// ─── Urge Surfing content ──────────────────────────────────────────────────────

function UrgeSurfingContent() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Introduction</p>
        <p className="text-white text-2xl font-light leading-relaxed">
          Cravings are waves.
        </p>
        <p className="text-white/70 text-lg font-light leading-relaxed mt-2">
          They peak and pass. You don't have to act on them.
        </p>
      </div>

      <div className="space-y-5">
        <Step number={1} color="bg-cyan-500/30 text-cyan-300" label="Notice the urge">
          Without judgment, notice the craving. Where do you feel it in your body? Chest, throat, stomach? Just observe it.
        </Step>

        <Step number={2} color="bg-cyan-500/30 text-cyan-300" label="Breathe into it">
          Give it a shape. A colour. A temperature. Is it sharp or dull? Hot or cold? Keep breathing slowly.
        </Step>

        <Step number={3} color="bg-cyan-500/30 text-cyan-300" label="Watch it peak">
          The urge is reaching its maximum right now. Like a wave at its highest point — it cannot hold this height. It will begin to fall.
        </Step>

        <Step number={4} color="bg-cyan-500/30 text-cyan-300" label="You surfed it">
          The wave passed. It always does. You didn't act on it. You just stayed present and let it move through you.
        </Step>
      </div>

      <ClosingQuote>
        Every urge you surf makes the next one easier.
      </ClosingQuote>
    </div>
  );
}

// ─── Cost-Benefit Analysis content ────────────────────────────────────────────

function CostBenefitContent() {
  const costs = [
    'Your health — slowly eroded',
    'Relationships — trust and presence',
    'Money — spent on something harmful',
    'Self-respect — the hardest to rebuild',
    'Sleep — stolen from you night by night',
    'Energy — dimmed every single day',
  ];

  const benefits = [
    'More money, building up every week',
    'Clearer mind, sharper thoughts',
    'Better sleep, waking up rested',
    'Pride in yourself — you kept the promise',
    'Fully present for people you love',
    'Your body healing, quietly, every day',
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Introduction</p>
        <p className="text-white text-2xl font-light leading-relaxed">
          Let's be honest with yourself.
        </p>
        <p className="text-white/70 text-lg font-light leading-relaxed mt-2">
          Just for 45 seconds.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Costs column */}
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Costs of using
          </p>
          <ul className="space-y-2.5">
            {costs.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-red-400/60 text-sm mt-0.5 flex-shrink-0">—</span>
                <span className="text-white/70 text-sm leading-snug">{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Benefits column */}
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
          <p className="text-green-300 text-xs font-semibold uppercase tracking-widest mb-4">
            Benefits of staying clean
          </p>
          <ul className="space-y-2.5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-green-400 text-sm mt-0.5 flex-shrink-0">✓</span>
                <span className="text-white/70 text-sm leading-snug">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ClosingQuote>
        The short-term relief is never worth the long-term cost.{'\n'}You already know this.
      </ClosingQuote>
    </div>
  );
}

// ─── Future Self Visualization content ────────────────────────────────────────

function FutureSelfContent() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Introduction</p>
        <p className="text-white text-2xl font-light leading-relaxed">
          Close your eyes.{'\n'}Take a breath.
        </p>
        <p className="text-white/70 text-lg font-light leading-relaxed mt-2">
          Meet the person you're becoming.
        </p>
      </div>

      <div className="space-y-6">
        <Paragraph>
          Picture yourself one year from now — completely free. How do you look? How do you carry yourself? Take a moment to really see it.
        </Paragraph>

        <Paragraph>
          You wake up with energy. Your skin is clear. Your mind is sharp in the mornings. You don't reach for anything to feel okay. You already feel okay.
        </Paragraph>

        <Paragraph>
          The people you love look at you differently. There's something in their eyes — relief, maybe. Pride, definitely. And when you look at yourself in the mirror, you feel it too.
        </Paragraph>

        <Paragraph>
          That person is not a fantasy. That person is not out of reach. That person is you — if you stay the course today. Just today.
        </Paragraph>
      </div>

      <ClosingQuote>
        One day at a time.{'\n'}Starting now.
      </ClosingQuote>
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function Step({
  number,
  label,
  color,
  children,
}: {
  number: number;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${color.split(' ')[0]}`}
      >
        <span className={`text-sm font-semibold ${color.split(' ')[1]}`}>{number}</span>
      </div>
      <div>
        <p className="text-white font-medium mb-1">{label}</p>
        <p className="text-white/65 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/80 text-base leading-relaxed font-light">{children}</p>
  );
}

function ClosingQuote({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-white/20 pl-5 py-1">
      <p className="text-white/90 text-base italic leading-relaxed whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}

// ─── Main tab component ────────────────────────────────────────────────────────

export function WellnessHubTab() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState<'alpha' | 'beta'>('alpha');
  const [activeExercise, setActiveExercise] = useState<ExerciseMeta | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isPlaying) {
      startBinauralBeats();
    } else {
      stopBinauralBeats();
    }
    return () => { stopBinauralBeats(); };
  }, [isPlaying, frequency]);

  const startBinauralBeats = async () => {
    stopBinauralBeats();
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') await audioContext.resume();

      const baseFrequency = 200;
      const binauralBeatFreq = frequency === 'alpha' ? 10 : 20;

      const leftOscillator  = audioContext.createOscillator();
      const rightOscillator = audioContext.createOscillator();
      const leftGain  = audioContext.createGain();
      const rightGain = audioContext.createGain();
      const merger    = audioContext.createChannelMerger(2);

      leftOscillator.type  = 'sine';
      rightOscillator.type = 'sine';
      leftOscillator.frequency.value  = baseFrequency;
      rightOscillator.frequency.value = baseFrequency + binauralBeatFreq;
      leftGain.gain.value  = 0.3;
      rightGain.gain.value = 0.3;

      leftOscillator.connect(leftGain);
      rightOscillator.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);
      merger.connect(audioContext.destination);

      leftOscillator.start();
      rightOscillator.start();
      leftOscillatorRef.current  = leftOscillator;
      rightOscillatorRef.current = rightOscillator;
    } catch (err) {
      console.error('Failed to start audio:', err);
      setIsPlaying(false);
    }
  };

  const stopBinauralBeats = () => {
    try {
      leftOscillatorRef.current?.stop();
      leftOscillatorRef.current = null;
      rightOscillatorRef.current?.stop();
      rightOscillatorRef.current = null;
      audioContextRef.current?.close();
      audioContextRef.current = null;
    } catch {}
  };

  const toggleFrequency = (freq: 'alpha' | 'beta') => {
    if (frequency === freq && isPlaying) setIsPlaying(false);
    else { setFrequency(freq); setIsPlaying(true); }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Wellness Hub</h1>
          <p className="text-white/70">Neural optimization tools and cognitive training</p>
        </div>

        {/* Binaural Beats */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Waves className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-medium">Binaural Frequency Player</h2>
              <p className="text-white/60 text-sm">Brainwave entrainment therapy</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => toggleFrequency('alpha')}
              className={`p-4 rounded-xl border-2 transition-all ${
                frequency === 'alpha' && isPlaying
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-white/20 bg-white/10 hover:border-blue-500/50'
              }`}
            >
              <div className="text-blue-400 font-medium mb-1">10Hz Alpha</div>
              <div className="text-white/70 text-sm mb-3">Calm Focus</div>
              <div className="flex items-center justify-center gap-2 text-white text-sm">
                {frequency === 'alpha' && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {frequency === 'alpha' && isPlaying ? 'Playing' : 'Play'}
              </div>
            </button>
            <button
              onClick={() => toggleFrequency('beta')}
              className={`p-4 rounded-xl border-2 transition-all ${
                frequency === 'beta' && isPlaying
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-white/20 bg-white/10 hover:border-green-500/50'
              }`}
            >
              <div className="text-green-400 font-medium mb-1">20Hz Beta</div>
              <div className="text-white/70 text-sm mb-3">Active Focus</div>
              <div className="flex items-center justify-center gap-2 text-white text-sm">
                {frequency === 'beta' && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {frequency === 'beta' && isPlaying ? 'Playing' : 'Play'}
              </div>
            </button>
          </div>

          {isPlaying && (
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white text-sm">
                  {frequency === 'alpha' ? '10Hz Alpha Waves' : '20Hz Beta Waves'}
                </div>
                <button onClick={() => setIsPlaying(false)} className="text-white/70 hover:text-white text-sm">
                  Stop
                </button>
              </div>
              <div className="flex gap-1 h-8 items-end">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${frequency === 'alpha' ? 'bg-blue-500' : 'bg-green-500'} animate-pulse`}
                    style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-white/60 text-xs mt-4">
            Use headphones for optimal binaural beat effect. Listen for 10–20 minutes.
          </div>
        </div>

        {/* CBT Library */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-medium">CBT Exercise Library</h2>
              <p className="text-white/60 text-sm">1-minute cognitive interventions</p>
            </div>
          </div>

          <div className="space-y-3">
            {EXERCISES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setActiveExercise(ex)}
                className={`w-full text-left rounded-2xl p-4 border transition-all hover:bg-white/5 ${ex.bgColor} ${ex.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium mb-0.5 ${ex.color}`}>{ex.title}</div>
                    <div className="text-white/55 text-sm">{ex.tagline}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-white/30 text-xs">{ex.durationLabel}</span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen exercise modal */}
      {activeExercise && (
        <ExerciseModal
          exercise={activeExercise}
          onClose={() => setActiveExercise(null)}
        />
      )}
    </div>
  );
}
