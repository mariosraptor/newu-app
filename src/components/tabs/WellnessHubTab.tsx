import { useState, useRef, useEffect, useRef } from 'react';
import { Waves, Play, Pause, Brain, X, ChevronRight, ChevronDown, ChevronUp, Crown, Lock , ChevronUp, ChevronDown, Lock, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUpgrade } from '../../contexts/UpgradeContext';
import { supabase } from '../../lib/supabase';

// ─── Exercise definitions ──────────────────────────────────────────────────────

type ExerciseId = 'reframing' | 'urge-surfing' | 'cost-benefit' | 'future-self';

interface ExerciseMeta {
  id: ExerciseId;
  title: string;
  tagline: string;
  readTime: string;
  color: string;
  bgColor: string;
  borderColor: string;
  progressColor: string;
}

const EXERCISES: ExerciseMeta[] = [
  {
    id: 'reframing',
    title: 'Thought Reframing',
    tagline: 'Challenge automatic negative thoughts',
    readTime: '~3 min read',
    color: 'text-blue-300',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/35',
    progressColor: 'bg-blue-400',
  },
  {
    id: 'urge-surfing',
    title: 'Urge Surfing',
    tagline: 'Ride the wave without acting on it',
    readTime: '~3 min read',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/35',
    progressColor: 'bg-cyan-400',
  },
  {
    id: 'cost-benefit',
    title: 'Cost-Benefit Analysis',
    tagline: 'Honest clarity in under 2 minutes',
    readTime: '~2 min read',
    color: 'text-amber-300',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/35',
    progressColor: 'bg-amber-400',
  },
  {
    id: 'future-self',
    title: 'Future Self Visualization',
    tagline: 'Meet the person you\'re becoming',
    readTime: '~4 min read',
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/35',
    progressColor: 'bg-purple-400',
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    setScrollProgress(scrollable > 0 ? Math.min(100, (el.scrollTop / scrollable) * 100) : 100);
  };

  // If content fits without scrolling, mark complete immediately
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 4) setScrollProgress(100);
  }, []);

  const done = scrollProgress >= 95;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#000d1a] via-[#000f20] to-[#001530]"
      onScroll={handleScroll}
    >
      {/* Sticky header */}
      <div className="sticky top-0 z-10 px-5 pt-safe-top pt-5 pb-3 bg-gradient-to-b from-[#000d1a] via-[#000d1a]/98 to-[#000d1a]/0">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium tracking-widest uppercase opacity-60 ${exercise.color}`}>
            {exercise.readTime}
          </span>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Scroll progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${exercise.progressColor}`}
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/25 mt-1.5">
          <span>{exercise.title}</span>
          <span>{Math.round(scrollProgress)}% read</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-2 max-w-lg mx-auto w-full">
        {exercise.id === 'reframing'    && <ThoughtReframingContent />}
        {exercise.id === 'urge-surfing' && <UrgeSurfingContent />}
        {exercise.id === 'cost-benefit' && <CostBenefitContent />}
        {exercise.id === 'future-self'  && <FutureSelfContent />}
      </div>

      {/* Bottom close button */}
      <div className="px-5 pb-16 pt-6 max-w-lg mx-auto w-full">
        <button
          onClick={onClose}
          className={`w-full py-4 rounded-2xl font-semibold text-white transition-all ${
            done
              ? `${exercise.progressColor} hover:opacity-90 shadow-lg`
              : 'bg-white/10 hover:bg-white/15'
          }`}
        >
          {done ? 'Done — I feel better' : 'Close'}
        </button>
      </div>
    </div>
  );
}

// ─── Thought Reframing ─────────────────────────────────────────────────────────

function ThoughtReframingContent() {
  return (
    <div className="space-y-10 pb-4">

      <Section label="Introduction">
        <BigQuote>Your thoughts aren't facts.</BigQuote>
        <Para>They feel real. They feel urgent. But thoughts are just mental events — patterns your brain fires automatically, often shaped by stress, fear, and old experience. You don't have to believe every thought you have.</Para>
        <Para>This exercise will help you slow down, question the thought, and find a truer, kinder perspective.</Para>
      </Section>

      <Section label="What are cognitive distortions?">
        <Para>Cognitive distortions are systematic errors in thinking — the brain's shortcuts that go wrong under stress. In recovery, they're especially common because your brain is literally rewiring itself, and old neural pathways still shout loudly.</Para>
        <Para>Here are three you'll likely recognise:</Para>

        <DistortionCard
          name="Catastrophising"
          emoji="⚡"
          what="Assuming the worst possible outcome is inevitable."
          example={`"I had one slip. I've ruined everything. I'll never be able to quit."`}
          truth={`One slip is one moment. It's data, not destiny. Every person who has ever recovered has had setbacks. They are part of the process, not proof that you've failed.`}
        />

        <DistortionCard
          name="Black-and-white thinking"
          emoji="⬛"
          what="Seeing things in absolutes — all good or all bad, nothing in between."
          example={`"If I'm not completely clean 100% of the time, I'm a total failure."`}
          truth={`Recovery is not a binary. Every day you don't use is a win. Progress is rarely a straight line, and struggling doesn't cancel out everything you've built.`}
        />

        <DistortionCard
          name="Mind reading"
          emoji="🧠"
          what="Believing you know what others are thinking — usually something negative."
          example={`"Everyone knows I'm struggling. They're disappointed in me. They think I'm weak."`}
          truth={`Most people are too focused on their own lives to judge yours. And the people who love you? They want you to succeed. They're likely more proud than you think.`}
        />
      </Section>

      <Section label="The reframing exercise">
        <Para>Go through these steps in your head right now. Take your time with each one.</Para>

        <Step number={1} color="blue" label="Name the thought">
          Say the automatic negative thought plainly and simply. Don't dress it up. What is the exact thought your mind keeps circling back to? Name it like you'd say it to a friend.
        </Step>

        <Step number={2} color="blue" label="Put it on trial">
          Is this thought 100% true? What's the actual evidence for it? What evidence exists against it? If you wrote this thought down and had to defend it in a court of law — would it hold up?
        </Step>

        <Step number={3} color="blue" label="Find the middle ground">
          What's a more balanced, realistic version of this thought? Not toxic positivity — just accuracy. What would you say to a close friend if they came to you with this exact thought?
        </Step>

        <Step number={4} color="blue" label="Say it out loud (or in your head)">
          Replace the automatic thought with the balanced one. Repeat it. Your brain learns through repetition — this is you teaching it a new response.
        </Step>
      </Section>

      <ClosingQuote accent="blue">
        You are not your thoughts.{'\n'}You are the one observing them.{'\n'}And that observer — the one stepping back right now — that's the real you.
      </ClosingQuote>

      <Affirmation>
        "I notice my thoughts without being controlled by them. I can choose which thoughts to believe."
      </Affirmation>
    </div>
  );
}

// ─── Urge Surfing ──────────────────────────────────────────────────────────────

function UrgeSurfingContent() {
  return (
    <div className="space-y-10 pb-4">

      <Section label="Introduction">
        <BigQuote>Cravings are waves.{'\n'}They peak and pass.</BigQuote>
        <Para>You don't have to act on them. You never have to act on them. You just have to survive them — and every minute you do, the next craving becomes smaller.</Para>
      </Section>

      <Section label="The science (this will help)">
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5">
          <p className="text-cyan-300 text-sm font-semibold uppercase tracking-wider mb-3">Research shows:</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold mt-0.5 flex-shrink-0">→</span>
              <p className="text-white/75 text-sm leading-relaxed">Cravings peak within <strong className="text-white">15–20 minutes</strong> and then begin to subside — even if you do nothing.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold mt-0.5 flex-shrink-0">→</span>
              <p className="text-white/75 text-sm leading-relaxed">Acting on a craving <strong className="text-white">strengthens</strong> the neural pathway. Surfing it and letting it pass <strong className="text-white">weakens</strong> it.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-cyan-400 font-bold mt-0.5 flex-shrink-0">→</span>
              <p className="text-white/75 text-sm leading-relaxed">Each time you ride a craving without giving in, the next one is <strong className="text-white">measurably less intense</strong>.</p>
            </li>
          </ul>
        </div>
        <Para>You are literally changing your brain right now by reading this instead of giving in.</Para>
      </Section>

      <Section label="Body scan — where does it live?">
        <Para>Close your eyes if you can. Take a slow breath. Now ask yourself — where in your body do you feel this craving?</Para>

        <Step number={1} color="cyan" label="Find it">
          Scan from your head down to your feet. Chest tightness? Throat tension? A restlessness in your hands or legs? A hollow feeling in your stomach? There's no wrong answer. Just notice.
        </Step>

        <Step number={2} color="cyan" label="Describe it">
          Give it properties. What shape is it? Round, sharp, spreading? What temperature — hot, cold, neutral? Is it getting bigger, smaller, staying still? You're not fighting it. You're observing it like a scientist.
        </Step>

        <Step number={3} color="cyan" label="Breathe into it">
          With each breath, imagine you're breathing directly into the place where you feel the craving. Not to push it away — just to be with it. You can hold something uncomfortable without being destroyed by it.
        </Step>
      </Section>

      <Section label="4-7-8 Breathing">
        <Para>This breathing technique activates your parasympathetic nervous system — it physiologically reduces anxiety and craving intensity within minutes.</Para>

        <div className="space-y-3">
          {[
            { label: "Breathe IN", count: "4 seconds", color: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300", desc: "Through your nose. Slow and controlled." },
            { label: "HOLD", count: "7 seconds", color: "bg-indigo-500/20 border-indigo-500/30 text-indigo-300", desc: "Don't strain. Let your body be still." },
            { label: "Breathe OUT", count: "8 seconds", color: "bg-blue-500/20 border-blue-500/30 text-blue-300", desc: "Through your mouth, completely emptying your lungs." },
          ].map((b) => (
            <div key={b.label} className={`flex items-center gap-4 rounded-2xl p-4 border ${b.color.split(' ').slice(0,2).join(' ')}`}>
              <div className={`text-xs font-bold uppercase tracking-wider ${b.color.split(' ')[2]} min-w-[80px]`}>{b.label}</div>
              <div className="flex-1">
                <div className="text-white font-semibold text-lg">{b.count}</div>
                <div className="text-white/50 text-xs mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <Para>Do this cycle 3–4 times. By the end, the craving will have changed. Not necessarily gone, but changed — and you will have proven to yourself that you are larger than it.</Para>
      </Section>

      <Section label="Watch it peak">
        <Para>You're at the hardest part now. The craving is near its peak. This is where it feels most real, most urgent, most impossible to ignore.</Para>
        <Para>Stay with it. Don't run. Don't give in. Just watch it like you'd watch a wave at the beach — it rises, reaches its full height, and then — always — it begins to fall.</Para>
        <Para>The wave cannot hold its height. It's against the laws of physics. And this craving cannot hold its intensity. It's against the laws of neuroscience.</Para>
      </Section>

      <ClosingQuote accent="cyan">
        Every urge you surf makes the next one easier.{'\n'}You are bigger than this craving.{'\n'}You always have been.
      </ClosingQuote>

      <Affirmation>
        "I am bigger than this craving. I let it pass through me like a wave — and I am still standing."
      </Affirmation>
    </div>
  );
}

// ─── Cost-Benefit Analysis ─────────────────────────────────────────────────────

function CostBenefitContent() {
  const categories = [
    {
      cat: 'Health',
      icon: '❤️',
      cost: 'Lungs filling with toxins. Heart working harder. Sleep disrupted. Immune system suppressed. Years quietly being subtracted.',
      benefit: 'Lungs beginning to heal within 48 hours. Blood pressure dropping. Circulation improving. Your body doing exactly what it was designed to do — recover.',
    },
    {
      cat: 'Financial',
      icon: '💰',
      cost: 'Smokers spend an average of $3,000–$5,000 per year on cigarettes alone. Over 5 years, that\'s $15,000–$25,000. Over 10 years — a car. A holiday every year. A life changed.',
      benefit: 'Every day clean, money stays in your pocket. Not in a manufacturer\'s profit margin. Not funding the industry that marketed addiction to you when you were young.',
    },
    {
      cat: 'Relationships',
      icon: '👥',
      cost: 'Disappearing for smoke breaks. The smell. The irritability during withdrawal. Missing moments because you needed to use. People who love you watching and worrying.',
      benefit: 'Being fully present. No need to sneak away. No apology smell. The people who love you noticing. You noticing them — clearly, without the fog.',
    },
    {
      cat: 'Emotional',
      icon: '🧘',
      cost: 'The cycle of temporary relief followed by guilt, shame, and the craving returning stronger. Anxiety between uses. The internal bargaining. The self-betrayal.',
      benefit: 'Genuine calm — not chemical calm. Emotions that are real and yours. Pride that doesn\'t come with a hangover. Waking up without regret.',
    },
    {
      cat: 'Self-respect',
      icon: '⭐',
      cost: 'A quiet internal voice that says: "You said you\'d stop. You didn\'t. You can\'t." The way you avoid thinking about it too hard because it hurts.',
      benefit: 'Looking at yourself differently. Keeping a promise to yourself — maybe for the first time in years. That feeling is not nothing. That feeling is everything.',
    },
  ];

  return (
    <div className="space-y-10 pb-4">

      <Section label="Introduction">
        <BigQuote>Let's be honest with yourself.</BigQuote>
        <Para>Not in a harsh, self-critical way. Just with clear eyes — the way you would look at a situation for someone you love. What does the ledger actually say?</Para>
      </Section>

      <Section label="The honest ledger">
        {categories.map((c) => (
          <div key={c.cat} className="rounded-2xl overflow-hidden border border-white/10 mb-4">
            <div className="px-4 py-2.5 bg-white/8 flex items-center gap-2 border-b border-white/10">
              <span className="text-base">{c.icon}</span>
              <span className="text-white font-semibold text-sm">{c.cat}</span>
            </div>
            <div className="grid grid-cols-2">
              <div className="p-4 border-r border-white/10 bg-red-500/5">
                <p className="text-red-300/80 text-[10px] font-semibold uppercase tracking-wider mb-2">Cost of using</p>
                <p className="text-white/65 text-xs leading-relaxed">{c.cost}</p>
              </div>
              <div className="p-4 bg-green-500/5">
                <p className="text-green-300/80 text-[10px] font-semibold uppercase tracking-wider mb-2">Benefit of stopping</p>
                <p className="text-white/65 text-xs leading-relaxed">{c.benefit}</p>
              </div>
            </div>
          </div>
        ))}
      </Section>

      <Section label="The real numbers">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          {[
            { stat: "$15,000+", label: "spent on cigarettes over 5 years (average smoker)" },
            { stat: "10 years", label: "added to average life expectancy after quitting" },
            { stat: "48 hours", label: "for nerve endings to start regenerating after stopping" },
            { stat: "3×", label: "higher success rate when using structured tools vs. willpower alone" },
          ].map((s) => (
            <div key={s.stat} className="flex items-center gap-4">
              <div className="text-2xl font-light text-amber-300 min-w-[90px]">{s.stat}</div>
              <div className="text-white/55 text-sm leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </Section>

      <ClosingQuote accent="amber">
        The short-term relief is never worth the long-term cost.{'\n'}You already know this.{'\n'}That's why you're here.
      </ClosingQuote>

      <Affirmation>
        "Every time I choose not to use, I am voting for the person I want to become."
      </Affirmation>
    </div>
  );
}

// ─── Future Self Visualization ─────────────────────────────────────────────────

function FutureSelfContent() {
  return (
    <div className="space-y-10 pb-4">

      <Section label="Before you begin">
        <BigQuote>Close your eyes.{'\n'}Take a breath.{'\n'}Meet the person you're becoming.</BigQuote>
        <Para>This is a guided visualization. Read slowly. Let your mind actually build these images. You might feel something unexpected. That's the point.</Para>
      </Section>

      <Section label="One year from now — morning">
        <Para>It's morning. You wake up.</Para>
        <Para>Your first thought isn't about using. It's just… a morning. Peaceful. You notice light coming through the window. Your body feels different — lighter, cleaner, more yours.</Para>
        <Para>You don't reach for anything. You don't need to. You're okay already. You've been okay for a long time now. It's starting to feel normal — this feeling of being okay without chemical help. It's extraordinary, actually, how ordinary it feels.</Para>
        <Para>You sit up. You breathe. The air feels clean.</Para>
      </Section>

      <Section label="The mirror">
        <Para>You walk to the bathroom and look in the mirror.</Para>
        <Para>Your skin is clearer. Your eyes are brighter — actually bright, without that slight dulling you'd forgotten was even there. You look rested. You look like yourself — maybe a version of yourself you haven't seen in years.</Para>
        <Para>You look at your own eyes and you feel something you used to feel only rarely: self-respect. Not arrogance. Just a quiet, solid kind of respect. You said you would do this. You did this.</Para>
        <Para>Let yourself stand with that for a moment.</Para>
      </Section>

      <Section label="The people you love">
        <Para>Picture someone important to you. A partner, a child, a parent, a friend — whoever comes to mind first.</Para>
        <Para>Picture them looking at you. Not with worry, the way they used to sometimes. With pride. With relief. With a kind of joy they may not even fully express but that you can see.</Para>
        <Para>You are present with them now. Fully present — not half-somewhere-else, not counting the hours, not needing to disappear. You're here. Completely here.</Para>
        <Para>They can feel it. People always can feel when you're truly present. It's the most generous thing you can give someone you love.</Para>
      </Section>

      <Section label="The clarity">
        <Para>Your mind is sharper now. Not dramatically — not like a movie montage. Just… clearer. You think through problems more easily. You remember things. You have ideas that actually land.</Para>
        <Para>The mental fog that you'd gotten so used to you forgot it was fog — it's gone. This is what your brain actually feels like without the noise. It's quieter. And in that quiet, you've found yourself again.</Para>
        <Para>The person you are when you're free.</Para>
      </Section>

      <Section label="Coming back">
        <Para>Slowly bring yourself back to right now.</Para>
        <Para>That person — the one you just visited — is not a fantasy. They are not a reward for being good enough or trying hard enough. That person is the inevitable result of the next decision you make. And the one after that. And the one after that.</Para>
        <Para>They are already being built. Right now, in this moment, you are building them.</Para>
      </Section>

      <ClosingQuote accent="purple">
        One day at a time.{'\n'}Starting now.
      </ClosingQuote>

      <Affirmation>
        "I am not someone who needs this anymore. I am someone new."
      </Affirmation>
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-white/35 text-[10px] uppercase tracking-widest font-medium mb-4">{label}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function BigQuote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white text-2xl font-light leading-relaxed whitespace-pre-line">{children}</p>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-white/70 text-base leading-relaxed font-light">{children}</p>
  );
}

function Step({
  number,
  label,
  color,
  children,
}: {
  number: number;
  label: string;
  color: 'blue' | 'cyan' | 'amber' | 'purple';
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    blue:   'bg-blue-500/25 text-blue-300',
    cyan:   'bg-cyan-500/25 text-cyan-300',
    amber:  'bg-amber-500/25 text-amber-300',
    purple: 'bg-purple-500/25 text-purple-300',
  };
  const [bg, txt] = styles[color].split(' ');
  return (
    <div className="flex gap-4">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${bg}`}>
        <span className={`text-sm font-semibold ${txt}`}>{number}</span>
      </div>
      <div>
        <p className="text-white font-medium mb-1">{label}</p>
        <p className="text-white/60 text-sm leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function DistortionCard({
  name,
  emoji,
  what,
  example,
  truth,
}: {
  name: string;
  emoji: string;
  what: string;
  example: string;
  truth: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <p className="text-white font-semibold">{name}</p>
      </div>
      <p className="text-white/50 text-sm italic">{what}</p>
      <div>
        <p className="text-red-300/70 text-xs uppercase tracking-wider font-medium mb-1">The thought</p>
        <p className="text-white/65 text-sm italic leading-relaxed">"{example}"</p>
      </div>
      <div>
        <p className="text-green-300/70 text-xs uppercase tracking-wider font-medium mb-1">The truth</p>
        <p className="text-white/70 text-sm leading-relaxed">{truth}</p>
      </div>
    </div>
  );
}

function ClosingQuote({ children, accent }: { children: React.ReactNode; accent: string }) {
  const borderColor =
    accent === 'blue'   ? 'border-blue-400/30' :
    accent === 'cyan'   ? 'border-cyan-400/30'  :
    accent === 'amber'  ? 'border-amber-400/30' :
    'border-purple-400/30';
  return (
    <div className={`border-l-2 ${borderColor} pl-5 py-2`}>
      <p className="text-white/85 text-lg font-light italic leading-relaxed whitespace-pre-line">
        {children}
      </p>
    </div>
  );
}

function Affirmation({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center px-4 py-6">
      <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Affirmation</p>
      <p className="text-white text-base font-light italic leading-relaxed">{children}</p>
    </div>
  );
}

// ─── Eastern Wisdom data ──────────────────────────────────────────────────────

interface EasternTechnique {
  id: string;
  icon: string;
  kanji: string;
  title: string;
  subtitle: string;
  tagline: string;
  content: string;
  practice: string;
}

const EASTERN_TECHNIQUES: EasternTechnique[] = [
  {
    id: 'kaizen',
    icon: '📈',
    kanji: '改善',
    title: 'KAIZEN',
    subtitle: 'Continuous Improvement',
    tagline: '1% better every day',
    content: "Cold turkey fails 95% of the time. Kaizen works differently — small, incremental improvements compound into transformation. Instead of 'I will never smoke again', say 'Today I will smoke one less cigarette.' Then one less again tomorrow. The brain accepts small changes. It resists dramatic ones. Your addiction was built one small habit at a time. It will be dismantled the same way.",
    practice: 'Identify ONE small reduction you can make today. Not tomorrow. Today.',
  },
  {
    id: 'ikigai',
    icon: '🌸',
    kanji: '生き甲斐',
    title: 'IKIGAI',
    subtitle: 'Finding Your Purpose',
    tagline: 'Fill the void with something that matters',
    content: "Every addiction fills a void — boredom, pain, emptiness, disconnection. Ikigai asks: what is your reason for being? The intersection of what you love, what you're good at, what the world needs, and what you can be paid for. When you find your Ikigai, the addiction loses its grip because the void is filled with something real.",
    practice: "Write down: 3 things you love. 3 things you're good at. 3 ways you could help others. Look for the overlap.",
  },
  {
    id: 'naikan',
    icon: '🪞',
    kanji: '内観',
    title: 'NAIKAN THERAPY',
    subtitle: 'Honest Self-Reflection',
    tagline: 'See yourself clearly without judgment',
    content: "Used in Japanese hospitals and prisons, Naikan asks three questions about every relationship in your life: What did I receive? What did I give? What trouble did I cause? This structured reflection breaks through denial — the addiction's greatest weapon — by replacing self-pity with honest accountability. Not guilt. Clarity.",
    practice: 'Spend 5 minutes reflecting on one relationship affected by your addiction. Answer the three questions honestly.',
  },
  {
    id: 'gaman',
    icon: '🏔️',
    kanji: '我慢',
    title: 'GAMAN',
    subtitle: 'Enduring with Dignity',
    tagline: "Observe the craving. Don't react to it.",
    content: "Gaman is the Japanese art of enduring the seemingly unbearable with patience and dignity. When a craving hits, Gaman says: observe it. Feel it fully. Don't fight it, don't feed it. Just watch it like a cloud passing. Cravings peak at 20 minutes and always pass. Gaman is the practice of outlasting them without losing your dignity.",
    practice: "Next craving — sit still. Set a timer for 20 minutes. Watch the craving like you're watching a film. You are not the craving. You are the observer.",
  },
  {
    id: 'wabisabi',
    icon: '🏺',
    kanji: '侘寂',
    title: 'WABI-SABI',
    subtitle: 'Embracing Imperfection',
    tagline: "A relapse is not failure. It's part of the story.",
    content: "Wabi-Sabi is the Japanese acceptance of imperfection and impermanence. In recovery, perfectionism kills more people than relapses do. The belief that 'one slip means I've failed completely' is what causes people to give up entirely. Wabi-Sabi reframes: a crack in a bowl is filled with gold. A relapse is not the end of your story. It is part of it.",
    practice: 'If you slip: write down one thing you learned from it. That is your gold.',
  },
  {
    id: 'darc',
    icon: '🏯',
    kanji: 'ダルク',
    title: 'DARC',
    subtitle: 'Community as Medicine',
    tagline: 'You cannot do this alone. You were never meant to.',
    content: "DARC (Drug Addiction Rehabilitation Center) is Japan's most successful peer-led recovery model. The core insight: addiction is a disease of disconnection. The cure is connection. Not with therapists or doctors primarily — but with others who have been where you are and come back. Community is not a supplement to recovery. It is the recovery.",
    practice: 'Reach out to ONE person today. A friend, family member, or someone in a recovery community. Connection is medicine.',
  },
];

// ─── Main tab component ────────────────────────────────────────────────────────

export function WellnessHubTab() {
  const { user } = useAuth();
  const { openUpgradeModal } = useUpgrade();
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState<'alpha' | 'beta'>('alpha');
  const [activeExercise, setActiveExercise] = useState<ExerciseMeta | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isPlaying) startBinauralBeats();
    else stopBinauralBeats();
    return () => { stopBinauralBeats(); };
  }, [isPlaying, frequency]);

  useEffect(() => {
    if (user) checkPremiumStatus();
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subscription_status')
      .select('is_premium')
      .eq('user_id', user.id)
      .maybeSingle();
    setIsPremium(data?.is_premium || false);
  };

  const startBinauralBeats = async () => {
    stopBinauralBeats();
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const base = 200;
      const beat = frequency === 'alpha' ? 10 : 20;
      const L = ctx.createOscillator();
      const R = ctx.createOscillator();
      const gL = ctx.createGain();
      const gR = ctx.createGain();
      const merger = ctx.createChannelMerger(2);

      L.type = R.type = 'sine';
      L.frequency.value = base;
      R.frequency.value = base + beat;
      gL.gain.value = gR.gain.value = 0.3;

      L.connect(gL); R.connect(gR);
      gL.connect(merger, 0, 0); gR.connect(merger, 0, 1);
      merger.connect(ctx.destination);

      L.start(); R.start();
      leftOscillatorRef.current = L;
      rightOscillatorRef.current = R;
    } catch (err) {
      console.error('Failed to start audio:', err);
      setIsPlaying(false);
    }
  };

  const stopBinauralBeats = () => {
    try {
      leftOscillatorRef.current?.stop(); leftOscillatorRef.current = null;
      rightOscillatorRef.current?.stop(); rightOscillatorRef.current = null;
      audioContextRef.current?.close(); audioContextRef.current = null;
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
              className={`p-4 rounded-xl border-2 transition-all ${frequency === 'alpha' && isPlaying ? 'border-blue-500 bg-blue-500/20' : 'border-white/20 bg-white/10 hover:border-blue-500/50'}`}
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
              className={`p-4 rounded-xl border-2 transition-all ${frequency === 'beta' && isPlaying ? 'border-green-500 bg-green-500/20' : 'border-white/20 bg-white/10 hover:border-green-500/50'}`}
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
                <div className="text-white text-sm">{frequency === 'alpha' ? '10Hz Alpha Waves' : '20Hz Beta Waves'}</div>
                <button onClick={() => setIsPlaying(false)} className="text-white/70 hover:text-white text-sm">Stop</button>
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
              <p className="text-white/60 text-sm">Guided cognitive interventions</p>
            </div>
          </div>

          <div className="space-y-3">
            {EXERCISES.map((ex) => (
              <button
                key={ex.id}
                onClick={() => setActiveExercise(ex)}
                className={`w-full text-left rounded-2xl p-4 border transition-all hover:brightness-110 ${ex.bgColor} ${ex.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium mb-0.5 ${ex.color}`}>{ex.title}</div>
                    <div className="text-white/50 text-sm">{ex.tagline}</div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className="text-white/30 text-xs">{ex.readTime}</span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Eastern Wisdom ─────────────────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden mt-8">

          {/* Header */}
          <div className="bg-gradient-to-br from-[#0d1f3c] to-[#001a35] p-6 relative overflow-hidden">
            <svg
              width="80" height="80" viewBox="0 0 80 80"
              className="absolute right-4 top-4 opacity-10 pointer-events-none"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="3"
                strokeDasharray="180 40" strokeLinecap="round" transform="rotate(-30 40 40)" />
            </svg>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl leading-none">🏯</span>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">Eastern Wisdom</h2>
                <p className="text-white/45 text-xs mt-0.5">Ancient Japanese methods proven by modern science</p>
              </div>
            </div>
            <div className="flex gap-1.5 text-base opacity-35 select-none">
              {'🌸 🌸 🌸 🌸 🌸'.split(' ').map((b, i) => <span key={i}>{b}</span>)}
            </div>
          </div>

          {/* Premium gate */}
          {!isPremium ? (
            <div className="bg-[#001a35] p-8 text-center border-t border-white/5">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-white/30" />
              </div>
              <h3 className="text-white font-semibold mb-1">Premium Feature</h3>
              <p className="text-white/40 text-sm mb-5 leading-relaxed">
                Unlock 6 science-backed Japanese recovery methods
              </p>
              <button
                onClick={openUpgradeModal}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Unlock with Pro
              </button>
            </div>
          ) : (
            <div className="bg-[#001a35] divide-y divide-white/5">
              {EASTERN_TECHNIQUES.map((technique) => {
                const isExpanded = expandedTechnique === technique.id;
                return (
                  <div key={technique.id}>
                    <button
                      onClick={() => setExpandedTechnique(isExpanded ? null : technique.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-2xl">
                          {technique.icon}
                        </div>
                        <span className="absolute -bottom-0.5 -right-1 text-[9px] text-white/20 font-medium select-none leading-none">
                          {technique.kanji}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap mb-0.5">
                          <span className="text-white text-sm font-bold tracking-wider">{technique.title}</span>
                          <span className="text-white/25 text-[10px]">·</span>
                          <span className="text-white/40 text-[11px]">{technique.subtitle}</span>
                        </div>
                        <p className="text-amber-400/70 text-xs italic">{technique.tagline}</p>
                      </div>
                      <div className="text-white/30 flex-shrink-0 ml-2">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5">
                        <p className="text-white/65 text-sm leading-relaxed mb-4">{technique.content}</p>
                        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
                          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2">Practice</p>
                          <p className="text-amber-200/80 text-sm leading-relaxed">{technique.practice}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer blossoms */}
          <div className="bg-[#001218] px-5 py-3 flex justify-center gap-2 text-base opacity-15 select-none">
            {'🌸 🌸 🌸 🌸 🌸'.split(' ').map((b, i) => <span key={i}>{b}</span>)}
          </div>
        </div>

      </div>


        {/* Eastern Wisdom Section */}
        <div className="bg-gradient-to-b from-[#0a1628] to-[#001a35] rounded-2xl overflow-hidden border border-white/10 mb-4">
          <div className="relative px-5 pt-5 pb-4 overflow-hidden">
            <svg width="80" height="80" className="absolute right-4 top-4 opacity-10 pointer-events-none">
              <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="3" strokeDasharray="180 40" strokeLinecap="round" transform="rotate(-30 40 40)" />
            </svg>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl leading-none">🏯</span>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">Eastern Wisdom</h2>
                <p className="text-white/45 text-xs mt-0.5">Ancient Japanese methods proven by modern science</p>
              </div>
            </div>
            <div className="flex gap-1.5 text-base opacity-35 select-none">
              {'🌸 🌸 🌸 🌸 🌸'.split(' ').map((b, i) => <span key={i}>{b}</span>)}
            </div>
          </div>
          <div className="bg-[#001a35] divide-y divide-white/5">
            {EASTERN_TECHNIQUES.map((technique) => {
              const isExpanded = expandedTechnique === technique.id;
              return (
                <div key={technique.id}>
                  <button
                    onClick={() => setExpandedTechnique(isExpanded ? null : technique.id)}
                    className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-2xl">
                        {technique.icon}
                      </div>
                      <span className="absolute -bottom-0.5 -right-1 text-[9px] text-white/20 font-medium select-none leading-none">{technique.kanji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap mb-0.5">
                        <span className="text-white text-sm font-bold tracking-wider">{technique.title}</span>
                        <span className="text-white/25 text-[10px]">·</span>
                        <span className="text-white/40 text-[11px]">{technique.subtitle}</span>
                      </div>
                      <p className="text-amber-400/70 text-xs italic">{technique.tagline}</p>
                    </div>
                    <div className="text-white/30 flex-shrink-0 ml-2">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5">
                      <p className="text-white/65 text-sm leading-relaxed mb-4">{technique.content}</p>
                      <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
                        <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2">Practice</p>
                        <p className="text-amber-200/80 text-sm leading-relaxed">{technique.practice}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="bg-[#001218] px-5 py-3 flex justify-center gap-2 text-base opacity-15 select-none">
            {'🌸 🌸 🌸 🌸 🌸'.split(' ').map((b, i) => <span key={i}>{b}</span>)}
          </div>
        </div>
      {activeExercise && (
        <ExerciseModal
          exercise={activeExercise}
          onClose={() => setActiveExercise(null)}
        />
      )}
    </div>
  );
}
