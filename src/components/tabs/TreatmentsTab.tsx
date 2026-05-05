import { useState, useRef, useEffect } from 'react';
import {
  Lock, Crown, ChevronDown, ChevronUp, ChevronRight,
  Brain, Leaf, Mic, Play, Pause, X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUpgrade } from '../../contexts/UpgradeContext';
import { supabase } from '../../lib/supabase';

// ─── Exercise types & data ─────────────────────────────────────────────────────

type ExerciseId =
  | 'reframing'
  | 'urge-surfing'
  | 'cost-benefit'
  | 'future-self'
  | 'motivational-interviewing'
  | 'contingency-management';

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
  { id: 'reframing', title: 'Thought Reframing', tagline: 'Challenge automatic negative thoughts', readTime: '~3 min', color: 'text-blue-300', bgColor: 'bg-blue-500/15', borderColor: 'border-blue-500/35', progressColor: 'bg-blue-400' },
  { id: 'urge-surfing', title: 'Urge Surfing', tagline: 'Ride the wave without acting on it', readTime: '~3 min', color: 'text-cyan-300', bgColor: 'bg-cyan-500/15', borderColor: 'border-cyan-500/35', progressColor: 'bg-cyan-400' },
  { id: 'cost-benefit', title: 'Cost-Benefit Analysis', tagline: 'Honest clarity in under 2 minutes', readTime: '~2 min', color: 'text-amber-300', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/35', progressColor: 'bg-amber-400' },
  { id: 'future-self', title: 'Future Self Visualization', tagline: "Meet the person you're becoming", readTime: '~4 min', color: 'text-purple-300', bgColor: 'bg-purple-500/15', borderColor: 'border-purple-500/35', progressColor: 'bg-purple-400' },
  { id: 'motivational-interviewing', title: 'Motivational Interviewing', tagline: 'Find your own reasons to change', readTime: '~4 min', color: 'text-green-300', bgColor: 'bg-green-500/15', borderColor: 'border-green-500/35', progressColor: 'bg-green-400' },
  { id: 'contingency-management', title: 'Contingency Management', tagline: 'Reward every win. Build the habit.', readTime: '~3 min', color: 'text-rose-300', bgColor: 'bg-rose-500/15', borderColor: 'border-rose-500/35', progressColor: 'bg-rose-400' },
];

// ─── Eastern Wisdom data ───────────────────────────────────────────────────────

interface EasternTechnique {
  id: string; icon: string; kanji: string; title: string;
  subtitle: string; tagline: string; content: string; practice: string;
}

const EASTERN_TECHNIQUES: EasternTechnique[] = [
  { id: 'kaizen', icon: '📈', kanji: '改善', title: 'KAIZEN', subtitle: 'Continuous Improvement', tagline: '1% better every day', content: "Cold turkey fails 95% of the time. Kaizen works differently — small, incremental improvements compound into transformation. Instead of 'I will never smoke again', say 'Today I will smoke one less cigarette.' Then one less again tomorrow. The brain accepts small changes. It resists dramatic ones. Your addiction was built one small habit at a time. It will be dismantled the same way.", practice: 'Identify ONE small reduction you can make today. Not tomorrow. Today.' },
  { id: 'ikigai', icon: '🌸', kanji: '生き甲斐', title: 'IKIGAI', subtitle: 'Finding Your Purpose', tagline: 'Fill the void with something that matters', content: "Every addiction fills a void — boredom, pain, emptiness, disconnection. Ikigai asks: what is your reason for being? The intersection of what you love, what you're good at, what the world needs, and what you can be paid for. When you find your Ikigai, the addiction loses its grip because the void is filled with something real.", practice: "Write down: 3 things you love. 3 things you're good at. 3 ways you could help others. Look for the overlap." },
  { id: 'naikan', icon: '🪞', kanji: '内観', title: 'NAIKAN THERAPY', subtitle: 'Honest Self-Reflection', tagline: 'See yourself clearly without judgment', content: "Used in Japanese hospitals and prisons, Naikan asks three questions about every relationship in your life: What did I receive? What did I give? What trouble did I cause? This structured reflection breaks through denial — the addiction's greatest weapon — by replacing self-pity with honest accountability. Not guilt. Clarity.", practice: 'Spend 5 minutes reflecting on one relationship affected by your addiction. Answer the three questions honestly.' },
  { id: 'gaman', icon: '🏔️', kanji: '我慢', title: 'GAMAN', subtitle: 'Enduring with Dignity', tagline: "Observe the craving. Don't react to it.", content: "Gaman is the Japanese art of enduring the seemingly unbearable with patience and dignity. When a craving hits, Gaman says: observe it. Feel it fully. Don't fight it, don't feed it. Just watch it like a cloud passing. Cravings peak at 20 minutes and always pass. Gaman is the practice of outlasting them without losing your dignity.", practice: "Next craving — sit still. Set a timer for 20 minutes. Watch the craving like you're watching a film. You are not the craving. You are the observer." },
  { id: 'wabisabi', icon: '🏺', kanji: '侘寂', title: 'WABI-SABI', subtitle: 'Embracing Imperfection', tagline: "A relapse is not failure. It's part of the story.", content: "Wabi-Sabi is the Japanese acceptance of imperfection and impermanence. In recovery, perfectionism kills more people than relapses do. The belief that 'one slip means I've failed completely' is what causes people to give up entirely. Wabi-Sabi reframes: a crack in a bowl is filled with gold. A relapse is not the end of your story. It is part of it.", practice: 'If you slip: write down one thing you learned from it. That is your gold.' },
  { id: 'darc', icon: '🏯', kanji: 'ダルク', title: 'DARC', subtitle: 'Community as Medicine', tagline: 'You cannot do this alone. You were never meant to.', content: "DARC (Drug Addiction Rehabilitation Center) is Japan's most successful peer-led recovery model. The core insight: addiction is a disease of disconnection. The cure is connection. Not with therapists or doctors primarily — but with others who have been where you are and come back. Community is not a supplement to recovery. It is the recovery.", practice: 'Reach out to ONE person today. A friend, family member, or someone in a recovery community. Connection is medicine.' },
];

// ─── Botanical data ────────────────────────────────────────────────────────────

interface BotanicalProtocol {
  id: string; addiction: string; herb: string;
  description: string; dosage: string; science: string; ritual: string;
}

const BOTANICAL_PROTOCOLS: BotanicalProtocol[] = [
  { id: '1', addiction: 'Smoking', herb: 'Lobelia (Indian Tobacco)', description: 'Contains lobeline, which mimics nicotine without addiction', dosage: '50-100mg capsule during cravings', science: 'Binds to nicotinic receptors, reducing withdrawal symptoms by 40-60%', ritual: 'Take with deep breathing. Hold smoke craving for 90 seconds while lobeline works.' },
  { id: '2', addiction: 'Smoking', herb: 'Mullein Leaf Tea', description: 'Lung repair herb that mimics the ritual of smoking', dosage: '1 cup, 3x daily', science: 'Expectorant properties clear tar buildup. Saponins reduce inflammation.', ritual: 'Brew slowly, inhale steam deeply. Meditate on lung restoration.' },
  { id: '3', addiction: 'Alcohol', herb: 'Kudzu Root Extract', description: 'Reduces alcohol cravings and binge drinking behavior', dosage: '1-2g before situations with alcohol', science: 'Puerarin and daidzin modulate GABA and dopamine, reducing desire by 50%', ritual: 'Take 30min before social events. Visualize sober confidence.' },
  { id: '4', addiction: 'Alcohol', herb: 'Milk Thistle + NAC', description: 'Liver regeneration and glutathione restoration', dosage: 'Milk Thistle 300mg + NAC 600mg, 2x daily', science: 'Silymarin protects hepatocytes. NAC restores glutathione depleted by ethanol.', ritual: 'Morning dose with lemon water. Evening dose with gratitude for body healing.' },
  { id: '5', addiction: 'Social Media', herb: 'Ashwagandha + L-Theanine', description: 'Reduces cortisol and anxiety that drives compulsive scrolling', dosage: 'Ashwagandha 300mg + L-Theanine 200mg, morning', science: 'Cortisol reduction of 28%. Alpha brain waves increase calm focus.', ritual: 'Take before first phone check. Replace scroll with 5-min breathwork.' },
  { id: '6', addiction: 'Smoking', herb: 'Black Pepper Essential Oil', description: 'Inhalation reduces cigarette cravings instantly', dosage: '2-3 deep inhales from bottle during cravings', science: 'Caryophyllene activates CB2 receptors, mimicking nicotine throat sensation', ritual: 'Carry in pocket. When craving hits, 10 deep inhales + cold water.' },
  { id: '7', addiction: 'Vaping', herb: 'NAC (N-Acetyl Cysteine)', description: 'Repairs lung tissue damaged by vaping aerosols. Restores glutathione.', dosage: '600mg twice daily', science: 'Breaks down acrolein deposits in airways', ritual: 'Morning and evening with water. Visualise airways clearing.' },
  { id: '8', addiction: 'Sugar', herb: 'Gymnema Sylvestre', description: 'Blocks sweet taste receptors, reducing sugar cravings instantly', dosage: '400mg before meals', science: 'Gymnemic acids temporarily block sweetness perception', ritual: 'Take 20 min before meals. Notice how less appealing sweet food becomes.' },
  { id: '9', addiction: 'Gambling', herb: 'Rhodiola Rosea + Magnesium Glycinate', description: 'Reduces impulsivity and dopamine-seeking behaviour', dosage: 'Rhodiola 200mg morning + Magnesium 400mg evening', science: 'Adaptogens regulate HPA axis stress response. Magnesium calms overactive reward circuits', ritual: 'Morning dose before any financial decisions. Evening dose with journaling.' },
  { id: '10', addiction: 'Porn', herb: 'Ashwagandha + Saffron', description: 'Rebalances dopamine and reduces compulsive sexual behaviour', dosage: 'Ashwagandha 300mg + Saffron 30mg daily', science: 'KSM-66 ashwagandha reduces cortisol 28%. Saffron modulates serotonin pathways', ritual: 'Take with breakfast. Replace urge with 20 pushups and cold water.' },
];

// ─── Detox protocols ───────────────────────────────────────────────────────────

interface DetoxSymptom {
  period: string; label: string;
  intensity: 'low' | 'medium' | 'high' | 'critical';
  description: string; howTo: string;
}

interface DetoxProtocol {
  id: string; title: string; icon: string;
  isCritical?: boolean; timeline: DetoxSymptom[]; medicalNote: string;
}

const DETOX_PROTOCOLS: DetoxProtocol[] = [
  {
    id: 'smoking', title: 'Smoking / Nicotine', icon: '🚬',
    timeline: [
      { period: 'Hours 1–4', label: 'First cravings', intensity: 'high', description: 'Nicotine leaves your bloodstream. Cravings feel intense but peak quickly.', howTo: 'NRT (patch/gum), deep breathing, cold water, distraction techniques' },
      { period: 'Days 1–3', label: 'Irritability & headaches', intensity: 'high', description: 'Peak withdrawal. Brain adjusting to no nicotine.', howTo: 'Exercise, herbal tea, ibuprofen if needed, NAC supplement' },
      { period: 'Week 1–2', label: 'Cravings reduce', intensity: 'medium', description: 'Physical withdrawal easing. Habit triggers remain.', howTo: 'Identify trigger situations, replace with deep breathing or a walk' },
      { period: 'Week 3+', label: 'New normal', intensity: 'low', description: 'Most physical symptoms gone. Psychological habits remain.', howTo: 'CBT for habit patterns, continue avoiding high-risk situations' },
    ],
    medicalNote: 'Nicotine withdrawal is uncomfortable but not medically dangerous. OTC NRT products (patches, gum) are safe and approximately double quit rates.',
  },
  {
    id: 'alcohol', title: 'Alcohol', icon: '🍺', isCritical: true,
    timeline: [
      { period: '6–12 hrs', label: 'Anxiety & sweating', intensity: 'medium', description: 'First signs as blood alcohol drops. Brain looking for GABA from alcohol.', howTo: 'Stay cool, hydrate with electrolytes, rest in safe environment' },
      { period: '12–48 hrs', label: 'Tremors & insomnia', intensity: 'high', description: 'Peak physical symptoms as nervous system rebalances.', howTo: 'Rest, electrolytes, magnesium glycinate, seek medical support' },
      { period: 'Days 2–5', label: 'Severe risk window', intensity: 'critical', description: 'Hallucinations or seizures possible in heavy daily drinkers.', howTo: '⚠️ SEEK EMERGENCY CARE if experiencing hallucinations, seizures, or confusion' },
      { period: 'Week 2+', label: 'Post-acute symptoms', intensity: 'medium', description: 'Mood instability, sleep issues, anxiety can persist for weeks.', howTo: 'Regular sleep schedule, NAC supplement, therapy, peer support' },
    ],
    medicalNote: '⚠️ CRITICAL: Alcohol withdrawal can be life-threatening for heavy daily drinkers. If you drink large amounts daily, please seek medical supervision BEFORE stopping.',
  },
  {
    id: 'sugar', title: 'Sugar / Processed Food', icon: '🍭',
    timeline: [
      { period: 'Day 1–2', label: 'Headaches & fatigue', intensity: 'medium', description: 'Blood sugar adjusting. Brain missing its quick dopamine source.', howTo: 'Stay hydrated, eat complex carbs, healthy fats (avocado, nuts)' },
      { period: 'Day 3 (PEAK)', label: 'Intense cravings', intensity: 'high', description: 'Cravings peak as dopamine pathways demand their usual hit.', howTo: 'Gymnema Sylvestre supplement, berries, dark chocolate 85%+, L-glutamine' },
      { period: 'Days 1–5', label: 'Mood swings', intensity: 'medium', description: 'Serotonin and dopamine adjusting without the sugar spikes.', howTo: 'Protein at every meal, magnesium glycinate, regular eating schedule' },
      { period: 'Week 2+', label: 'Energy stabilises', intensity: 'low', description: 'Natural energy returning. Blood sugar finding its baseline.', howTo: 'Continue whole foods, fermented foods for gut health' },
    ],
    medicalNote: 'Sugar withdrawal is not medically dangerous but can feel intense. Symptoms typically resolve within 1–2 weeks.',
  },
  {
    id: 'behavioral', title: 'Social Media / Porn / Gambling', icon: '📱',
    timeline: [
      { period: 'Day 1–3', label: 'Restlessness & anxiety', intensity: 'medium', description: 'Dopamine system expecting its usual stimulation.', howTo: 'Cardio exercise, cold showers, journaling, structured schedule' },
      { period: 'Days 1–7', label: 'Boredom & emptiness', intensity: 'medium', description: "Brain hasn't yet found new dopamine sources.", howTo: 'Schedule activities in advance, social connection, learn something new' },
      { period: 'Week 1–2', label: 'Strongest urges (FOMO)', intensity: 'high', description: 'Peak psychological cravings as the habit cycle seeks resolution.', howTo: 'Accountability partner, delete apps from phone, inform household' },
      { period: 'Week 3+', label: 'Brain fog lifting', intensity: 'low', description: 'Prefrontal cortex recovering. Clarity and motivation returning.', howTo: 'Maintain consistent routine, deepen new hobbies, celebrate milestones' },
    ],
    medicalNote: 'Behavioral addictions involve the same dopamine pathways as substance addictions. CBT and accountability partners significantly improve outcomes.',
  },
];

// ─── Support programs ──────────────────────────────────────────────────────────

const SUPPORT_PROGRAMS = [
  {
    id: 'smart', title: 'SMART Recovery', icon: '🧠',
    tagline: 'Science-based alternative to 12-step. Self-empowerment focused.',
    content: "SMART Recovery (Self-Management and Recovery Training) uses CBT, Motivational Interviewing, and REBT to help people overcome addictions. Unlike 12-step programs, it doesn't use labels like 'addict' and focuses on self-empowerment. Free meetings worldwide, both in-person and online.",
    highlights: ['Based on CBT and evidence-based psychology', '4-Point Program: Motivation, Urges, Thoughts, Lifestyle', 'No "higher power" requirement', 'Free meetings worldwide — smartrecovery.org'],
  },
  {
    id: 'aana', title: 'AA / NA', icon: '🤝',
    tagline: 'Peer support network. 12-step community. Available worldwide.',
    content: "Alcoholics Anonymous and Narcotics Anonymous are the world's largest peer support networks. The 12-step model has helped millions achieve lasting sobriety. Built on community, accountability, and a spiritual (not necessarily religious) framework. Free meetings in almost every city on earth.",
    highlights: ["World's largest recovery community", 'Free meetings available 24/7 globally', 'Sponsor relationship for 1-on-1 support', 'Proven track record since 1935'],
  },
  {
    id: 'therapy', title: 'Behavioral Therapy', icon: '💬',
    tagline: 'CBT, Motivational Interviewing, Contingency Management explained.',
    content: "Professional behavioral therapy is the gold standard for addiction treatment. Three modalities have the strongest evidence: CBT identifies and changes thinking patterns; Motivational Interviewing resolves ambivalence about change; Contingency Management uses reward systems to reinforce sobriety.",
    highlights: ['CBT: 60% reduction in relapse rates', 'Motivational Interviewing: 50% increase in treatment retention', 'Contingency Management: highest evidence for stimulant/gambling', 'Many therapists offer sliding scale fees'],
  },
];

// ─── Free section teaser cards ─────────────────────────────────────────────────

const TEASER_CARDS = [
  {
    title: 'Behavioural Therapy Basics',
    preview: 'Learn how CBT can rewire your brain in 21 days. Used by 94% of successful recovery programs.',
    hook: 'Discover the 3 cognitive distortions that drive 80% of cravings — and exactly how to dismantle them.',
  },
  {
    title: 'Your Detox Timeline',
    preview: "Know exactly what your body goes through in the first 72 hours. Prepare. Don't be scared.",
    hook: 'Hour-by-hour guide to what happens when you quit — and the natural remedies that make each stage bearable.',
  },
  {
    title: 'The 3 Triggers Nobody Talks About',
    preview: 'The hidden psychological triggers that cause 80% of relapses. Identify yours before they find you.',
    hook: 'The social trigger. The emotional trigger. The one that happens when things are going WELL. Understand all three.',
  },
];

// ─── Voice meditation data ─────────────────────────────────────────────────────

const MEDITATION_SENTENCES = [
  "Close your eyes if you can.",
  "Take a slow breath in... and let it go.",
  "You showed up today. That matters more than you know.",
  "Your brain is healing right now, in this moment.",
  "Every hour clean is your body choosing you.",
  "You are not your addiction. You never were.",
  "The version of you that never quit... is still here.",
  "Breathe in... and out.",
  "You have survived every hard day so far. Every single one.",
  "That is not luck. That is strength.",
  "The cravings will pass. They always do.",
  "You don't have to fight them. Just outlast them.",
  "Picture the person you are becoming.",
  "They wake up with energy. With clarity. With pride.",
  "That person is not far away.",
  "They are just a few more days ahead of you.",
  "Keep going.",
  "You are doing something most people never do.",
  "You are choosing yourself.",
  "One breath at a time.",
  "One day at a time.",
  "You've got this.",
  "Nova is proud of you.",
];

const PREFERRED_VOICE_NAMES = ['Samantha', 'Karen', 'Moira', 'Fiona', 'Victoria', 'Allison', 'Susan', 'Kate'];

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  for (const name of PREFERRED_VOICE_NAMES) {
    const v = voices.find(v => v.name.includes(name));
    if (v) return v;
  }
  return (
    voices.find(v => v.lang === 'en-GB') ??
    voices.find(v => v.lang === 'en-AU') ??
    voices.find(v => v.lang.startsWith('en')) ??
    voices[0]
  );
}

const MOOD_RESPONSES: Record<string, string> = {
  calm:      "That stillness you feel? It's yours. You didn't borrow it from anything. It came from inside you. Hold onto it.",
  stronger:  "Good. Because you are. Every time you pause and breathe instead of reaching — that's you getting stronger. I see it.",
  emotional: "That's okay. Sometimes healing feels like release. Let it come. You're safe here, and I'm right here with you.",
};

const SPEED_OPTIONS = [
  { label: '0.75×', value: 0.75 },
  { label: '1×',    value: 1.0  },
  { label: '1.25×', value: 1.25 },
];

// ─── Shared exercise sub-components ───────────────────────────────────────────

function ESec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-white/35 text-[10px] uppercase tracking-widest font-medium mb-4">{label}</p>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function BigQuote({ children }: { children: React.ReactNode }) {
  return <p className="text-white text-2xl font-light leading-relaxed whitespace-pre-line">{children}</p>;
}

function Para({ children }: { children: React.ReactNode }) {
  return <p className="text-white/70 text-base leading-relaxed font-light">{children}</p>;
}

type StepColor = 'blue' | 'cyan' | 'amber' | 'purple' | 'green' | 'rose';

function EStep({ number, label, color, children }: { number: number; label: string; color: StepColor; children: React.ReactNode }) {
  const styles: Record<StepColor, string> = {
    blue:   'bg-blue-500/25 text-blue-300',
    cyan:   'bg-cyan-500/25 text-cyan-300',
    amber:  'bg-amber-500/25 text-amber-300',
    purple: 'bg-purple-500/25 text-purple-300',
    green:  'bg-green-500/25 text-green-300',
    rose:   'bg-rose-500/25 text-rose-300',
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

function DistortionCard({ name, emoji, what, example, truth }: { name: string; emoji: string; what: string; example: string; truth: string }) {
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
  const border =
    accent === 'blue' ? 'border-blue-400/30' :
    accent === 'cyan' ? 'border-cyan-400/30' :
    accent === 'amber' ? 'border-amber-400/30' :
    accent === 'green' ? 'border-green-400/30' :
    accent === 'rose' ? 'border-rose-400/30' :
    'border-purple-400/30';
  return (
    <div className={`border-l-2 ${border} pl-5 py-2`}>
      <p className="text-white/85 text-lg font-light italic leading-relaxed whitespace-pre-line">{children}</p>
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

// ─── Exercise content ──────────────────────────────────────────────────────────

function ThoughtReframingContent() {
  return (
    <div className="space-y-10 pb-4">
      <ESec label="Introduction">
        <BigQuote>Your thoughts aren't facts.</BigQuote>
        <Para>They feel real. They feel urgent. But thoughts are just mental events — patterns your brain fires automatically, often shaped by stress, fear, and old experience. You don't have to believe every thought you have.</Para>
        <Para>This exercise will help you slow down, question the thought, and find a truer, kinder perspective.</Para>
      </ESec>
      <ESec label="What are cognitive distortions?">
        <Para>Cognitive distortions are systematic errors in thinking — the brain's shortcuts that go wrong under stress. In recovery, they're especially common because your brain is literally rewiring itself.</Para>
        <DistortionCard name="Catastrophising" emoji="⚡" what="Assuming the worst possible outcome is inevitable." example="I had one slip. I've ruined everything. I'll never be able to quit." truth="One slip is one moment. It's data, not destiny. Every person who has ever recovered has had setbacks. They are part of the process, not proof that you've failed." />
        <DistortionCard name="Black-and-white thinking" emoji="⬛" what="Seeing things in absolutes — all good or all bad, nothing in between." example="If I'm not completely clean 100% of the time, I'm a total failure." truth="Recovery is not a binary. Every day you don't use is a win. Progress is rarely a straight line, and struggling doesn't cancel out everything you've built." />
        <DistortionCard name="Mind reading" emoji="🧠" what="Believing you know what others are thinking — usually something negative." example="Everyone knows I'm struggling. They think I'm weak." truth="Most people are too focused on their own lives to judge yours. The people who love you are likely more proud than you think." />
      </ESec>
      <ESec label="The reframing exercise">
        <EStep number={1} color="blue" label="Name the thought">Say the automatic negative thought plainly and simply. Don't dress it up. What is the exact thought your mind keeps circling back to?</EStep>
        <EStep number={2} color="blue" label="Put it on trial">Is this thought 100% true? What's the actual evidence for it? What evidence exists against it?</EStep>
        <EStep number={3} color="blue" label="Find the middle ground">What's a more balanced, realistic version of this thought? Not toxic positivity — just accuracy.</EStep>
        <EStep number={4} color="blue" label="Say it out loud">Replace the automatic thought with the balanced one. Repeat it. Your brain learns through repetition.</EStep>
      </ESec>
      <ClosingQuote accent="blue">You are not your thoughts.{'\n'}You are the one observing them.{'\n'}And that observer is the real you.</ClosingQuote>
      <Affirmation>"I notice my thoughts without being controlled by them. I can choose which thoughts to believe."</Affirmation>
    </div>
  );
}

function UrgeSurfingContent() {
  return (
    <div className="space-y-10 pb-4">
      <ESec label="Introduction">
        <BigQuote>Cravings are waves.{'\n'}They peak and pass.</BigQuote>
        <Para>You don't have to act on them. You never have to act on them. You just have to survive them — and every minute you do, the next craving becomes smaller.</Para>
      </ESec>
      <ESec label="The science">
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-5">
          <p className="text-cyan-300 text-sm font-semibold uppercase tracking-wider mb-3">Research shows:</p>
          <ul className="space-y-3">
            {[
              'Cravings peak within 15–20 minutes and then begin to subside — even if you do nothing.',
              'Acting on a craving strengthens the neural pathway. Surfing it and letting it pass weakens it.',
              'Each time you ride a craving without giving in, the next one is measurably less intense.',
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-0.5 flex-shrink-0">→</span>
                <p className="text-white/75 text-sm leading-relaxed">{f}</p>
              </li>
            ))}
          </ul>
        </div>
      </ESec>
      <ESec label="Body scan — where does it live?">
        <EStep number={1} color="cyan" label="Find it">Scan from head to feet. Chest tightness? Throat tension? Restlessness in your hands? A hollow feeling in your stomach? Just notice.</EStep>
        <EStep number={2} color="cyan" label="Describe it">Give it properties. What shape? What temperature? Is it growing or shrinking? You're not fighting it. You're observing it like a scientist.</EStep>
        <EStep number={3} color="cyan" label="Breathe into it">With each breath, imagine you're breathing directly into the place where you feel the craving. Not to push it away — just to be with it.</EStep>
      </ESec>
      <ESec label="4-7-8 Breathing">
        <div className="space-y-3">
          {[
            { label: 'Breathe IN', count: '4 seconds', desc: 'Through your nose. Slow and controlled.', cls: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300' },
            { label: 'HOLD', count: '7 seconds', desc: "Don't strain. Let your body be still.", cls: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300' },
            { label: 'Breathe OUT', count: '8 seconds', desc: 'Through your mouth, completely emptying your lungs.', cls: 'bg-blue-500/20 border-blue-500/30 text-blue-300' },
          ].map((b) => (
            <div key={b.label} className={`flex items-center gap-4 rounded-2xl p-4 border ${b.cls.split(' ').slice(0, 2).join(' ')}`}>
              <div className={`text-xs font-bold uppercase tracking-wider ${b.cls.split(' ')[2]} min-w-[80px]`}>{b.label}</div>
              <div className="flex-1">
                <div className="text-white font-semibold text-lg">{b.count}</div>
                <div className="text-white/50 text-xs mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </ESec>
      <ClosingQuote accent="cyan">Every urge you surf makes the next one easier.{'\n'}You are bigger than this craving.{'\n'}You always have been.</ClosingQuote>
      <Affirmation>"I am bigger than this craving. I let it pass through me like a wave — and I am still standing."</Affirmation>
    </div>
  );
}

function CostBenefitContent() {
  const categories = [
    { cat: 'Health', icon: '❤️', cost: 'Lungs filling with toxins. Heart working harder. Sleep disrupted. Immune system suppressed. Years quietly being subtracted.', benefit: 'Lungs beginning to heal within 48 hours. Blood pressure dropping. Your body doing exactly what it was designed to do — recover.' },
    { cat: 'Financial', icon: '💰', cost: "Smokers spend an average of $3,000–$5,000 per year. Over 5 years, that's $15,000–$25,000.", benefit: "Every day clean, money stays in your pocket. Not in a manufacturer's profit margin." },
    { cat: 'Relationships', icon: '👥', cost: 'Disappearing for breaks. The smell. The irritability. Missing moments because you needed to use. People who love you watching and worrying.', benefit: 'Being fully present. No need to sneak away. The people who love you noticing. You noticing them — clearly, without the fog.' },
    { cat: 'Emotional', icon: '🧘', cost: 'The cycle of temporary relief followed by guilt, shame, and the craving returning stronger. The internal bargaining. The self-betrayal.', benefit: "Genuine calm — not chemical calm. Emotions that are real and yours. Waking up without regret." },
    { cat: 'Self-respect', icon: '⭐', cost: "A quiet internal voice that says: 'You said you'd stop. You didn't. You can't.'", benefit: "Looking at yourself differently. Keeping a promise to yourself — maybe for the first time in years. That feeling is everything." },
  ];
  return (
    <div className="space-y-10 pb-4">
      <ESec label="Introduction">
        <BigQuote>Let's be honest with yourself.</BigQuote>
        <Para>Not in a harsh, self-critical way. Just with clear eyes. What does the ledger actually say?</Para>
      </ESec>
      <ESec label="The honest ledger">
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
      </ESec>
      <ClosingQuote accent="amber">The short-term relief is never worth the long-term cost.{'\n'}You already know this.{'\n'}That's why you're here.</ClosingQuote>
      <Affirmation>"Every time I choose not to use, I am voting for the person I want to become."</Affirmation>
    </div>
  );
}

function FutureSelfContent() {
  return (
    <div className="space-y-10 pb-4">
      <ESec label="Before you begin">
        <BigQuote>Close your eyes.{'\n'}Take a breath.{'\n'}Meet the person you're becoming.</BigQuote>
        <Para>This is a guided visualization. Read slowly. Let your mind actually build these images. You might feel something unexpected. That's the point.</Para>
      </ESec>
      <ESec label="One year from now — morning">
        <Para>It's morning. You wake up. Your first thought isn't about using. It's just… a morning. Peaceful.</Para>
        <Para>You don't reach for anything. You don't need to. You're okay already. You've been okay for a long time now.</Para>
      </ESec>
      <ESec label="The mirror">
        <Para>You walk to the bathroom and look in the mirror. Your skin is clearer. Your eyes are brighter — actually bright, without that slight dulling you'd forgotten was even there.</Para>
        <Para>You look at your own eyes and feel something you used to feel only rarely: self-respect. Not arrogance. Just a quiet, solid kind of respect. You said you would do this. You did this.</Para>
      </ESec>
      <ESec label="The people you love">
        <Para>Picture someone important to you. Picture them looking at you — not with worry, the way they used to sometimes. With pride. With a kind of joy they may not even fully express but that you can see.</Para>
        <Para>You are present with them now. Fully present. They can feel it. People always can feel when you're truly present.</Para>
      </ESec>
      <ESec label="Coming back">
        <Para>That person — the one you just visited — is not a fantasy. They are the inevitable result of the next decision you make. And the one after that. They are already being built. Right now.</Para>
      </ESec>
      <ClosingQuote accent="purple">One day at a time.{'\n'}Starting now.</ClosingQuote>
      <Affirmation>"I am not someone who needs this anymore. I am someone new."</Affirmation>
    </div>
  );
}

function MotivationalInterviewingContent() {
  return (
    <div className="space-y-10 pb-4">
      <ESec label="Introduction">
        <BigQuote>The most powerful motivation{'\n'}comes from inside you.</BigQuote>
        <Para>Not from your doctor. Not from your family. Not from shame. The science is clear: people change — and stay changed — when they articulate their own reasons, in their own words.</Para>
      </ESec>
      <ESec label="Understanding ambivalence">
        <Para>You want to quit. You don't want to quit. Both are true. This is not weakness — it is the universal human experience of change. Ambivalence is not the enemy. Ignoring it is.</Para>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
          <p className="text-green-300 text-sm font-semibold uppercase tracking-wider mb-3">Research says:</p>
          <ul className="space-y-3">
            {[
              'People who articulate their own reasons for change are 3× more likely to succeed than those responding to external pressure.',
              'The act of saying your reason out loud (or writing it) significantly strengthens motivation.',
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">→</span>
                <p className="text-white/75 text-sm leading-relaxed">{f}</p>
              </li>
            ))}
          </ul>
        </div>
      </ESec>
      <ESec label="The DARN exercise">
        <Para>This four-part reflection helps you hear your own motivation. Take your time. Be honest.</Para>
        <EStep number={1} color="green" label="Desire — What do you want?">In plain language: what do you actually want for yourself? Not what you should want, or what others want for you. What do you, in your honest heart, want your life to look like?</EStep>
        <EStep number={2} color="green" label="Ability — What tells you that you can?">Find evidence from your own past that you have the capacity to change. A week you went without. A moment you chose differently. Small proof still counts.</EStep>
        <EStep number={3} color="green" label="Reasons — List your own why">Write 5 specific reasons that matter to YOU. Not general reasons — your reasons. Not 'health' — 'I want to run with my kids without getting winded.'</EStep>
        <EStep number={4} color="green" label="Need — What is the cost of not changing?">Honestly: what do you lose if nothing changes? Not in a guilt-driven way — just clearly. Name the cost. Say it plainly. Then sit with it.</EStep>
      </ESec>
      <ESec label="The discrepancy">
        <Para>MI works by revealing the gap between who you are now and who you want to be. Not to make you feel bad — but to use that gap as fuel.</Para>
        <Para>Ask yourself: "On a scale of 1–10, how important is change to me right now?" Then ask: "What would make it one number higher?" Your answer is your next step.</Para>
      </ESec>
      <ClosingQuote accent="green">You already know why you want this.{'\n'}You just needed to hear yourself say it.</ClosingQuote>
      <Affirmation>"My reasons are mine. They are real. They are enough."</Affirmation>
    </div>
  );
}

function ContingencyManagementContent() {
  return (
    <div className="space-y-10 pb-4">
      <ESec label="Introduction">
        <BigQuote>Your brain learns through{'\n'}celebration.</BigQuote>
        <Para>Dopamine isn't just the "pleasure chemical." It's the learning chemical. Every time you experience reward after a behavior, your brain wires that behavior in more deeply. Your addiction used this against you. Now we use it for you.</Para>
      </ESec>
      <ESec label="The science">
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5">
          <p className="text-rose-300 text-sm font-semibold uppercase tracking-wider mb-3">Research findings:</p>
          <ul className="space-y-3">
            {[
              'Contingency Management has the highest evidence base for stimulant addiction and gambling of any behavioral intervention.',
              'Participants who receive immediate rewards are 2× as likely to remain abstinent at 6 months.',
              "The reward doesn't need to be large. Immediacy matters more than size.",
            ].map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-rose-400 font-bold mt-0.5 flex-shrink-0">→</span>
                <p className="text-white/75 text-sm leading-relaxed">{f}</p>
              </li>
            ))}
          </ul>
        </div>
      </ESec>
      <ESec label="Your reward ladder">
        <div className="space-y-3">
          {[
            { milestone: 'Every clean day', reward: "Small reward: your favorite coffee, a song, 10 minutes of something you love", cls: 'border-white/15 bg-white/5' },
            { milestone: '7-day streak', reward: "Meaningful reward: a movie, a meal out, something you've been delaying", cls: 'border-blue-500/25 bg-blue-500/8' },
            { milestone: '30 days', reward: "Significant reward: something you've wanted for a while. You earned it.", cls: 'border-amber-500/25 bg-amber-500/8' },
            { milestone: '3 months', reward: "Life-changing reward: plan a trip, make a purchase, mark it in the world", cls: 'border-green-500/25 bg-green-500/8' },
          ].map((item) => (
            <div key={item.milestone} className={`rounded-xl p-4 border ${item.cls}`}>
              <p className="text-white text-sm font-semibold mb-1">{item.milestone}</p>
              <p className="text-white/55 text-xs leading-relaxed">{item.reward}</p>
            </div>
          ))}
        </div>
      </ESec>
      <ESec label="Make it visible">
        <EStep number={1} color="rose" label="The jar method">Get a jar. Put one marble or coin in it every clean day. Watch it fill. Brains respond powerfully to visible, tangible evidence of progress.</EStep>
        <EStep number={2} color="rose" label="The celebration ritual">Choose a tiny ritual for every clean day — a fist bump, a note in a journal, a checkmark on a calendar. Do it every time. Ritual creates neural groove.</EStep>
        <EStep number={3} color="rose" label="Tell someone">Share a milestone with one person. Social recognition activates the same reward circuits as the substance did. Use it.</EStep>
      </ESec>
      <ClosingQuote accent="rose">You are not bribing yourself.{'\n'}You are teaching your brain{'\n'}a new definition of reward.</ClosingQuote>
      <Affirmation>"Every win deserves celebration. I celebrate every win."</Affirmation>
    </div>
  );
}

// ─── Exercise full-screen modal ────────────────────────────────────────────────

function ExerciseModal({ exercise, onClose }: { exercise: ExerciseMeta; onClose: () => void }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight - el.clientHeight;
    setScrollProgress(scrollable > 0 ? Math.min(100, (el.scrollTop / scrollable) * 100) : 100);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el && el.scrollHeight <= el.clientHeight + 4) setScrollProgress(100);
  }, []);

  const done = scrollProgress >= 95;

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-[#000d1a] via-[#000f20] to-[#001530]" onScroll={handleScroll}>
      <div className="sticky top-0 z-10 px-5 pt-6 pb-3 bg-gradient-to-b from-[#000d1a] via-[#000d1a]/98 to-[#000d1a]/0">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium tracking-widest uppercase opacity-60 ${exercise.color}`}>{exercise.readTime}</span>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${exercise.progressColor}`} style={{ width: `${scrollProgress}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-white/25 mt-1.5">
          <span>{exercise.title}</span>
          <span>{Math.round(scrollProgress)}% read</span>
        </div>
      </div>
      <div className="px-5 py-2 max-w-lg mx-auto w-full">
        {exercise.id === 'reframing'                  && <ThoughtReframingContent />}
        {exercise.id === 'urge-surfing'               && <UrgeSurfingContent />}
        {exercise.id === 'cost-benefit'               && <CostBenefitContent />}
        {exercise.id === 'future-self'                && <FutureSelfContent />}
        {exercise.id === 'motivational-interviewing'  && <MotivationalInterviewingContent />}
        {exercise.id === 'contingency-management'     && <ContingencyManagementContent />}
      </div>
      <div className="px-5 pb-16 pt-6 max-w-lg mx-auto w-full">
        <button onClick={onClose} className={`w-full py-4 rounded-2xl font-semibold text-white transition-all ${done ? `${exercise.progressColor} hover:opacity-90 shadow-lg` : 'bg-white/10 hover:bg-white/15'}`}>
          {done ? 'Done — I feel better' : 'Close'}
        </button>
      </div>
    </div>
  );
}

// ─── Nova Voice Journey ────────────────────────────────────────────────────────

function VoiceVisualization({ isPremium, openUpgradeModal }: { isPremium: boolean; openUpgradeModal: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'paused' | 'done'>('idle');
  const [currentSentence, setCurrentSentence] = useState(0);
  const [rate, setRate] = useState(0.78);
  const [mood, setMood] = useState<string | null>(null);
  const sentenceRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Controls whether the sentence loop should keep going
  const isActiveRef = useRef(false);
  // Holds the 800ms gap timeout so we can cancel it on stop/pause
  const gapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks which sentence index the loop is currently on (mutable, no re-render)
  const idxRef = useRef(0);

  const cancelGap = () => {
    if (gapTimerRef.current) { clearTimeout(gapTimerRef.current); gapTimerRef.current = null; }
  };

  // Auto-scroll the highlighted sentence into view
  useEffect(() => {
    sentenceRefs.current[currentSentence]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [currentSentence]);

  // Preload voices on mount + cleanup on unmount
  useEffect(() => {
    window.speechSynthesis?.getVoices();
    const onVC = () => window.speechSynthesis.getVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', onVC);
    return () => {
      isActiveRef.current = false;
      cancelGap();
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.removeEventListener('voiceschanged', onVC);
    };
  }, []);

  // Speak one sentence, then wait 800ms and speak the next
  const speakFrom = (startIdx: number, speakRate: number) => {
    window.speechSynthesis.cancel();
    cancelGap();
    isActiveRef.current = true;
    idxRef.current = startIdx;

    const speakNext = () => {
      if (!isActiveRef.current) return;
      const i = idxRef.current;
      if (i >= MEDITATION_SENTENCES.length) {
        isActiveRef.current = false;
        setCurrentSentence(MEDITATION_SENTENCES.length - 1);
        setPhase('done');
        return;
      }

      setCurrentSentence(i);

      const utt = new SpeechSynthesisUtterance(MEDITATION_SENTENCES[i]);
      utt.rate = speakRate;
      utt.pitch = 1.0;
      utt.volume = 1.0;
      const voice = pickVoice();
      if (voice) utt.voice = voice;

      utt.onend = () => {
        if (!isActiveRef.current) return;
        idxRef.current = i + 1;
        // 800ms natural pause between sentences
        gapTimerRef.current = setTimeout(speakNext, 800);
      };

      utt.onerror = (e) => {
        const err = (e as SpeechSynthesisErrorEvent).error;
        if (err !== 'interrupted' && err !== 'canceled') {
          isActiveRef.current = false;
          setPhase('idle');
        }
      };

      window.speechSynthesis.speak(utt);
    };

    speakNext();
  };

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;
    if (phase === 'paused') {
      // Resume from the sentence that was paused on
      speakFrom(idxRef.current, rate);
      setPhase('playing');
      return;
    }
    idxRef.current = 0;
    speakFrom(0, rate);
    setPhase('playing');
    setMood(null);
  };

  const handlePause = () => {
    isActiveRef.current = false;
    cancelGap();
    window.speechSynthesis.cancel();
    setPhase('paused');
    // idxRef.current already points to the current sentence
  };

  const handleStop = () => {
    isActiveRef.current = false;
    cancelGap();
    window.speechSynthesis.cancel();
    setPhase('idle');
    setCurrentSentence(0);
    idxRef.current = 0;
  };

  const handleSpeedChange = (newRate: number) => {
    setRate(newRate);
    if (phase === 'playing') {
      const resumeAt = idxRef.current;
      isActiveRef.current = false;
      cancelGap();
      window.speechSynthesis.cancel();
      setTimeout(() => { speakFrom(resumeAt, newRate); }, 120);
    }
  };

  if (!isPremium) {
    return (
      <div className="bg-[#001a35] p-8 text-center">
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-white/30" />
        </div>
        <h3 className="text-white font-semibold mb-1">Premium Feature</h3>
        <p className="text-white/40 text-sm mb-5 leading-relaxed">Unlock Nova's guided voice meditation journeys</p>
        <button onClick={openUpgradeModal} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
          <Crown className="w-4 h-4" /> Unlock with Pro
        </button>
      </div>
    );
  }

  const isActive = phase === 'playing';

  return (
    <div className="px-5 pb-8 pt-2">

      {/* Pulsing cyan circle */}
      <div className="flex justify-center mb-6">
        <div className="relative flex items-center justify-center w-36 h-36">
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping"
                style={{ animationDuration: '2.5s' }} />
              <div className="absolute inset-3 rounded-full bg-cyan-500/10 animate-pulse"
                style={{ animationDuration: '2s' }} />
              <div className="absolute inset-6 rounded-full bg-cyan-500/15 animate-pulse"
                style={{ animationDuration: '1.5s', animationDelay: '0.3s' }} />
            </>
          )}
          <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
            isActive
              ? 'bg-cyan-500/25 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/30'
              : 'bg-white/10 border border-white/15'
          }`}>
            <Mic className={`w-8 h-8 transition-colors duration-500 ${isActive ? 'text-cyan-400' : 'text-white/40'}`} />
          </div>
        </div>
      </div>

      {/* Controls row */}
      {phase !== 'done' && (
        <div className="flex items-center justify-center gap-4 mb-5">
          {phase === 'playing' ? (
            <button onClick={handlePause}
              className="w-14 h-14 rounded-full bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center hover:bg-cyan-500/30 transition-all">
              <Pause className="w-5 h-5 text-cyan-400" />
            </button>
          ) : (
            <button onClick={handlePlay}
              className="w-14 h-14 rounded-full bg-cyan-500 flex items-center justify-center shadow-xl shadow-cyan-500/40 hover:bg-cyan-400 transition-all">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </button>
          )}
          {phase !== 'idle' && (
            <button onClick={handleStop}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 transition-all">
              <X className="w-3.5 h-3.5 text-white/50" />
            </button>
          )}
        </div>
      )}

      {/* Speed control */}
      <div className="flex justify-center gap-2 mb-6">
        {SPEED_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => handleSpeedChange(s.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
              rate === s.value
                ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300'
                : 'bg-white/8 border-white/15 text-white/40 hover:text-white/65'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Script with sentence highlighting */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-6">
        <div className="px-4 py-2.5 border-b border-white/8 flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive ? 'bg-cyan-400 animate-pulse' : 'bg-white/20'}`} />
          <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">
            {phase === 'idle' ? 'Guided Meditation · Nova' : phase === 'done' ? 'Complete' : 'Now Speaking'}
          </p>
        </div>
        <div className="max-h-52 overflow-y-auto px-4 py-3 space-y-2" style={{ scrollbarWidth: 'none' }}>
          {MEDITATION_SENTENCES.map((s, i) => (
            <div
              key={i}
              ref={el => { sentenceRefs.current[i] = el; }}
              className={`text-sm leading-relaxed transition-all duration-300 rounded-lg px-2 py-1 ${
                i === currentSentence && phase !== 'idle'
                  ? 'text-cyan-200 bg-cyan-500/15 font-medium'
                  : i < currentSentence && phase !== 'idle'
                  ? 'text-white/25 line-through'
                  : 'text-white/55'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Emotion picker after completion */}
      {phase === 'done' && !mood && (
        <div className="bg-cyan-500/8 border border-cyan-500/20 rounded-2xl p-5">
          <p className="text-white font-medium text-center mb-1">How are you feeling after this?</p>
          <p className="text-white/35 text-xs text-center mb-5">There's no wrong answer.</p>
          <div className="flex gap-3">
            {[
              { emoji: '😌', label: 'Calm',     key: 'calm' },
              { emoji: '💪', label: 'Stronger', key: 'stronger' },
              { emoji: '😢', label: 'Emotional', key: 'emotional' },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => setMood(opt.key)}
                className="flex-1 py-3.5 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 text-white text-xs transition-all"
              >
                <span className="block text-2xl mb-1.5">{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => { setPhase('idle'); setCurrentSentence(0); setMood(null); }}
            className="mt-4 w-full text-xs text-white/30 hover:text-white/50 transition-colors">
            Listen again
          </button>
        </div>
      )}

      {/* Nova response */}
      {mood && (
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/8 border border-cyan-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-cyan-300/80 text-[10px] font-semibold uppercase tracking-wider mb-1.5">Nova</p>
              <p className="text-white/80 text-sm leading-relaxed">
                {MOOD_RESPONSES[mood] ?? "I'm here with you. Whatever you felt — it's valid."}
              </p>
            </div>
          </div>
          <button onClick={() => { setPhase('idle'); setCurrentSentence(0); setMood(null); }}
            className="mt-4 w-full text-xs text-white/30 hover:text-white/50 transition-colors">
            Listen again
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Premium section accordion ─────────────────────────────────────────────────

type PSection = 'cbt' | 'eastern' | 'detox' | 'support' | 'botanical' | 'voice';

function SectionHeader({ label, icon, open, onToggle }: { label: string; icon: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-white font-semibold text-sm">{label}</span>
      </div>
      {open ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
    </button>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function TreatmentsTab() {
  const { user } = useAuth();
  const { openUpgradeModal } = useUpgrade();
  // Instant unlock from cache — Pro users never see the lock screen
  const cachedPremium = localStorage.getItem('newu_is_premium');
  const [isPremium, setIsPremium] = useState(cachedPremium === 'true');
  const [loading, setLoading] = useState(cachedPremium !== 'true');
  const [activeExercise, setActiveExercise] = useState<ExerciseMeta | null>(null);
  const [openSection, setOpenSection] = useState<PSection | null>('cbt');
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);
  const [expandedDetox, setExpandedDetox] = useState<string | null>(null);
  const [expandedSupport, setExpandedSupport] = useState<string | null>(null);
  const [expandedBotanical, setExpandedBotanical] = useState<string | null>(null);

  useEffect(() => {
    checkPremium();
  }, [user]);

  const checkPremium = async () => {
    const cached = localStorage.getItem('newu_is_premium');
    if (cached === 'true') { setIsPremium(true); setLoading(false); }

    if (!user) { setLoading(false); return; }
    const { data } = await supabase.from('subscription_status').select('is_premium').eq('user_id', user.id).maybeSingle();
    const premium = data?.is_premium || false;
    setIsPremium(premium);
    localStorage.setItem('newu_is_premium', premium.toString());
    setLoading(false);
  };

  const toggle = (s: PSection) => setOpenSection(prev => prev === s ? null : s);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center bg-[#001F3F]"><p className="text-white/40 text-sm">Loading…</p></div>;
  }

  const intensityColor: Record<DetoxSymptom['intensity'], string> = {
    low: 'bg-green-500/20 text-green-300 border-green-500/25',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/25',
    high: 'bg-red-500/20 text-red-300 border-red-500/25',
    critical: 'bg-red-600/30 text-red-200 border-red-500/50',
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#000d1a] pb-24">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-5 pt-8 pb-6 text-center">
        <h1 className="text-3xl font-light text-white mb-1">Treatment Library</h1>
        <p className="text-white/45 text-sm">Science-backed recovery protocols</p>
        {/* Debug: tap to toggle premium for testing */}
        <button
          onClick={() => {
            const next = !isPremium;
            setIsPremium(next);
            localStorage.setItem('newu_is_premium', String(next));
          }}
          className={`mt-3 px-3 py-1 rounded-full text-[10px] font-semibold border transition-all ${
            isPremium
              ? 'bg-yellow-500/15 border-yellow-500/25 text-yellow-400'
              : 'bg-red-500/15 border-red-500/25 text-red-400'
          }`}
        >
          {isPremium ? '✓ Pro active' : '✗ Free — tap to unlock'} (debug)
        </button>
      </div>

      {/* ── FREE: Getting Started ────────────────────────────── */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-green-400/80 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">Free</span>
          <span className="text-white/40 text-xs">Getting Started</span>
        </div>
        <div className="space-y-3">
          {TEASER_CARDS.map((card) => (
            <div key={card.title} className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <div className="p-5">
                <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed mb-4">{card.preview}</p>
                {/* Blurred hook */}
                <div className="relative mb-4">
                  <p className="text-white/60 text-xs leading-relaxed select-none blur-sm">{card.hook}</p>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#001F3F]/20 pointer-events-none" />
                </div>
                <button
                  onClick={openUpgradeModal}
                  className="w-full py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Crown className="w-3.5 h-3.5" /> Unlock Full Content
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PREMIUM section ──────────────────────────────────── */}
      <div className="px-4 mb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">Pro</span>
          <span className="text-white/40 text-xs">Full Treatment Library</span>
        </div>
      </div>

      {!isPremium ? (
        <div className="mx-4 bg-white/5 border border-white/10 rounded-2xl p-8 text-center mb-8">
          <div className="w-14 h-14 bg-yellow-500/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-7 h-7 text-yellow-400" />
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Unlock All Treatments</h2>
          <p className="text-white/45 text-sm mb-6 leading-relaxed">
            6 CBT exercises · Eastern Wisdom · Detox guide · Support programs · Botanical protocols · Voice visualization
          </p>
          <button onClick={openUpgradeModal} className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
            <Crown className="w-4 h-4" /> Start Free Trial — Upgrade to Pro
          </button>
        </div>
      ) : (
        <div className="mx-4 rounded-2xl overflow-hidden border border-white/10 bg-white/5 mb-8 divide-y divide-white/8">

          {/* A: CBT Exercise Library */}
          <div>
            <SectionHeader label="CBT Exercise Library" icon={<div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"><Brain className="w-4 h-4 text-blue-400" /></div>} open={openSection === 'cbt'} onToggle={() => toggle('cbt')} />
            {openSection === 'cbt' && (
              <div className="px-5 pb-5 space-y-2">
                {EXERCISES.map((ex) => (
                  <button key={ex.id} onClick={() => setActiveExercise(ex)} className={`w-full text-left rounded-2xl p-4 border transition-all hover:brightness-110 ${ex.bgColor} ${ex.borderColor}`}>
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
            )}
          </div>

          {/* B: Eastern Wisdom */}
          <div>
            <SectionHeader label="Eastern Wisdom" icon={<span className="text-xl">🏯</span>} open={openSection === 'eastern'} onToggle={() => toggle('eastern')} />
            {openSection === 'eastern' && (
              <div className="divide-y divide-white/5">
                {EASTERN_TECHNIQUES.map((t) => {
                  const exp = expandedTechnique === t.id;
                  return (
                    <div key={t.id}>
                      <button onClick={() => setExpandedTechnique(exp ? null : t.id)} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl">{t.icon}</div>
                          <span className="absolute -bottom-0.5 -right-1 text-[8px] text-white/20 font-medium select-none">{t.kanji}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-1.5 flex-wrap mb-0.5">
                            <span className="text-white text-sm font-bold tracking-wider">{t.title}</span>
                            <span className="text-white/40 text-[11px]">{t.subtitle}</span>
                          </div>
                          <p className="text-amber-400/70 text-xs italic">{t.tagline}</p>
                        </div>
                        {exp ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
                      </button>
                      {exp && (
                        <div className="px-5 pb-5">
                          <p className="text-white/65 text-sm leading-relaxed mb-4">{t.content}</p>
                          <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
                            <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2">Practice</p>
                            <p className="text-amber-200/80 text-sm leading-relaxed">{t.practice}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* C: Detox & Withdrawal Guide */}
          <div>
            <SectionHeader label="Detox & Withdrawal Guide" icon={<span className="text-xl">🔬</span>} open={openSection === 'detox'} onToggle={() => toggle('detox')} />
            {openSection === 'detox' && (
              <div className="px-5 pb-5 space-y-2">
                <p className="text-white/45 text-xs leading-relaxed mb-4">What to expect and how to get through it. <span className="text-amber-400/80">Always consult a doctor for severe symptoms.</span></p>
                {DETOX_PROTOCOLS.map((protocol) => {
                  const exp = expandedDetox === protocol.id;
                  return (
                    <div key={protocol.id} className="rounded-xl overflow-hidden border border-white/10">
                      <button onClick={() => setExpandedDetox(exp ? null : protocol.id)} className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{protocol.icon}</span>
                          <span className="text-white font-medium text-sm">{protocol.title}</span>
                          {protocol.isCritical && <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Medical</span>}
                        </div>
                        {exp ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                      </button>
                      {exp && (
                        <div className="px-4 pb-4 bg-white/3">
                          <div className="space-y-3 mb-4">
                            {protocol.timeline.map((sym) => (
                              <div key={sym.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div>
                                    <p className="text-white text-sm font-medium">{sym.label}</p>
                                    <p className="text-white/40 text-xs">{sym.period}</p>
                                  </div>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex-shrink-0 ${intensityColor[sym.intensity]}`}>{sym.intensity}</span>
                                </div>
                                <p className="text-white/60 text-xs leading-relaxed mb-2">{sym.description}</p>
                                <div className="bg-blue-500/10 border border-blue-500/15 rounded-lg p-2.5">
                                  <p className="text-blue-300/80 text-[10px] font-bold uppercase tracking-wider mb-1">How to manage</p>
                                  <p className="text-white/65 text-xs leading-relaxed">{sym.howTo}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className={`rounded-xl p-3 border ${protocol.isCritical ? 'bg-red-500/10 border-red-500/25' : 'bg-white/5 border-white/10'}`}>
                            <p className={`text-xs leading-relaxed ${protocol.isCritical ? 'text-red-200/90' : 'text-white/50'}`}>{protocol.medicalNote}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* D: Support Programs */}
          <div>
            <SectionHeader label="Support Programs" icon={<span className="text-xl">🤝</span>} open={openSection === 'support'} onToggle={() => toggle('support')} />
            {openSection === 'support' && (
              <div className="px-5 pb-5 space-y-2">
                {SUPPORT_PROGRAMS.map((prog) => {
                  const exp = expandedSupport === prog.id;
                  return (
                    <div key={prog.id} className="rounded-xl overflow-hidden border border-white/10">
                      <button onClick={() => setExpandedSupport(exp ? null : prog.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-colors">
                        <span className="text-xl flex-shrink-0">{prog.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{prog.title}</p>
                          <p className="text-white/40 text-xs leading-snug mt-0.5">{prog.tagline}</p>
                        </div>
                        {exp ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
                      </button>
                      {exp && (
                        <div className="px-4 pb-4 bg-white/3">
                          <p className="text-white/65 text-sm leading-relaxed mb-4">{prog.content}</p>
                          <div className="space-y-2">
                            {prog.highlights.map((h) => (
                              <div key={h} className="flex items-start gap-2">
                                <span className="text-blue-400 text-xs mt-0.5 flex-shrink-0">✓</span>
                                <p className="text-white/60 text-xs leading-relaxed">{h}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* E: Botanical Protocols */}
          <div>
            <SectionHeader label="Botanical Protocols" icon={<div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center"><Leaf className="w-4 h-4 text-green-400" /></div>} open={openSection === 'botanical'} onToggle={() => toggle('botanical')} />
            {openSection === 'botanical' && (
              <div className="px-5 pb-5 space-y-2">
                <p className="text-white/40 text-xs mb-4 leading-relaxed">Science-backed herbal interventions. Always consult a healthcare professional before starting supplements.</p>
                {BOTANICAL_PROTOCOLS.map((p) => {
                  const exp = expandedBotanical === p.id;
                  return (
                    <div key={p.id} className="rounded-xl overflow-hidden border border-white/10">
                      <button onClick={() => setExpandedBotanical(exp ? null : p.id)} className="w-full flex items-start justify-between px-4 py-3.5 text-left hover:bg-white/5 transition-colors">
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-green-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">{p.addiction}</p>
                          <p className="text-white font-medium text-sm">{p.herb}</p>
                          <p className="text-white/45 text-xs mt-0.5">{p.description}</p>
                        </div>
                        {exp ? <ChevronUp className="w-4 h-4 text-white/30 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0 mt-1" />}
                      </button>
                      {exp && (
                        <div className="px-4 pb-4 bg-white/3 space-y-3">
                          <div className="bg-white/8 rounded-lg p-3">
                            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">Dosage</p>
                            <p className="text-white/80 text-xs">{p.dosage}</p>
                          </div>
                          <div>
                            <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-1">The Science</p>
                            <p className="text-white/60 text-xs leading-relaxed">{p.science}</p>
                          </div>
                          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                            <p className="text-purple-300/80 text-[10px] uppercase tracking-wider font-semibold mb-1">Ritual Framework</p>
                            <p className="text-white/65 text-xs leading-relaxed italic">{p.ritual}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* F: Voice Guided Visualization */}
          <div>
            <SectionHeader label="Nova's Voice Journey" icon={<div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"><Mic className="w-4 h-4 text-blue-400" /></div>} open={openSection === 'voice'} onToggle={() => toggle('voice')} />
            {openSection === 'voice' && (
              <div>
                <div className="px-5 pt-2 pb-2">
                  <p className="text-white/45 text-xs leading-relaxed">A 5-minute guided visualization narrated by Nova. Find a quiet place, close your eyes, and listen.</p>
                </div>
                <VoiceVisualization isPremium={isPremium} openUpgradeModal={openUpgradeModal} />
              </div>
            )}
          </div>

        </div>
      )}

      {activeExercise && <ExerciseModal exercise={activeExercise} onClose={() => setActiveExercise(null)} />}
    </div>
  );
}
