import { useState } from 'react';

// ─── Addiction definitions ─────────────────────────────────────────────────────

interface AddictionDef {
  id: string;
  emoji: string;
  label: string;
  description: string;
  costRequired: boolean;
  costPlaceholder: string;
}

const ADDICTIONS: AddictionDef[] = [
  {
    id: 'smoking',
    emoji: '🚬',
    label: 'Smoking',
    description: 'Break free from nicotine',
    costRequired: true,
    costPlaceholder: 'e.g. 10.00',
  },
  {
    id: 'vaping',
    emoji: '💨',
    label: 'Vaping',
    description: 'Quit the vape for good',
    costRequired: true,
    costPlaceholder: 'e.g. 5.00',
  },
  {
    id: 'alcohol',
    emoji: '🍷',
    label: 'Alcohol',
    description: 'Take back control',
    costRequired: true,
    costPlaceholder: 'e.g. 15.00',
  },
  {
    id: 'sugar',
    emoji: '🍬',
    label: 'Sugar',
    description: 'Reset your relationship with food',
    costRequired: false,
    costPlaceholder: 'e.g. 3.00 (optional)',
  },
  {
    id: 'social-media',
    emoji: '📱',
    label: 'Social Media',
    description: 'Reclaim your time and attention',
    costRequired: false,
    costPlaceholder: 'e.g. 0.00 (optional)',
  },
  {
    id: 'porn',
    emoji: '🔞',
    label: 'Porn',
    description: 'Rewire your mind',
    costRequired: false,
    costPlaceholder: 'e.g. 0.00 (optional)',
  },
  {
    id: 'gambling',
    emoji: '🎰',
    label: 'Gambling',
    description: 'Break the cycle',
    costRequired: true,
    costPlaceholder: 'e.g. 20.00',
  },
];

const PRESET_TRIGGERS = {
  emotional: [
    'Stress or anxiety',
    'Loneliness',
    'Boredom',
    'Sadness',
    'Feeling unsatisfied',
    'Insecurity',
    'Low self-worth',
  ],
  situational: [
    'After meals',
    'With coffee',
    'Social situations',
    'Bars or parties',
    'Certain times of day',
    'Bad news (bills, arguments)',
    'Social media scrolling',
  ],
  social: [
    'Peer pressure',
    'Social anxiety',
    'Being around others who use',
  ],
};

// ─── Onboarding data ───────────────────────────────────────────────────────────

interface OnboardingData {
  addictions: string[];
  myWhy: string;
  triggers: string[];
  customTriggers: string[];
  quitDate: Date;
  dailyCosts: Record<string, number>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    addictions: [],
    myWhy: '',
    triggers: [],
    customTriggers: [],
    quitDate: new Date(),
    dailyCosts: {},
  });
  const [customTrigger, setCustomTrigger] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleAddiction = (id: string) => {
    setData({
      ...data,
      addictions: data.addictions.includes(id)
        ? data.addictions.filter((a) => a !== id)
        : [...data.addictions, id],
    });
  };

  const toggleTrigger = (trigger: string) => {
    setData({
      ...data,
      triggers: data.triggers.includes(trigger)
        ? data.triggers.filter((t) => t !== trigger)
        : [...data.triggers, trigger],
    });
  };

  const addCustomTrigger = () => {
    if (customTrigger.trim() && !data.customTriggers.includes(customTrigger.trim())) {
      setData({ ...data, customTriggers: [...data.customTriggers, customTrigger.trim()] });
      setCustomTrigger('');
    }
  };

  const handleComplete = () => {
    setLoading(true);
    try {
      const onboardingData = {
        addictions: data.addictions,
        myWhy: data.myWhy,
        triggers: data.triggers,
        customTriggers: data.customTriggers,
        quitDate: data.quitDate.toISOString(),
        dailyCosts: data.dailyCosts,
        completedAt: new Date().toISOString(),
      };
      localStorage.setItem('onboardingData', JSON.stringify(onboardingData));
      localStorage.setItem('onboardingCompleted', 'true');
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      setLoading(false);
    }
  };

  // Determine which selected addictions require a cost
  const selectedDefs = ADDICTIONS.filter(a => data.addictions.includes(a.id));
  const requiredCostAddictions  = selectedDefs.filter(a => a.costRequired);
  const optionalCostAddictions  = selectedDefs.filter(a => !a.costRequired);

  // ─── Step 1: Choose your battles ─────────────────────────────────────────────

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000d1a] to-[#001F3F] overflow-y-auto p-6">
        <div className="w-full max-w-lg mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-white mb-3">Choose Your Journey</h1>
            <p className="text-white/55">Select which habits you want to leave behind</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {ADDICTIONS.map(({ id, emoji, label, description }) => {
              const selected = data.addictions.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => toggleAddiction(id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    selected
                      ? 'bg-blue-500/20 border-blue-500 text-white'
                      : 'bg-white/5 border-white/15 text-white/80 hover:border-white/35 hover:bg-white/8'
                  }`}
                >
                  <div className="text-3xl mb-2">{emoji}</div>
                  <div className="font-semibold text-sm mb-1">{label}</div>
                  <div className={`text-xs leading-snug ${selected ? 'text-blue-200/70' : 'text-white/40'}`}>
                    {description}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={data.addictions.length === 0}
            className="w-full py-4 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 2: Your Why ─────────────────────────────────────────────────────────

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000d1a] to-[#001F3F] flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-white mb-3">Your Why</h1>
            <p className="text-white/55">What does your life look like on the other side?</p>
          </div>

          <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-6 mb-6">
            <textarea
              value={data.myWhy}
              onChange={(e) => setData({ ...data, myWhy: e.target.value })}
              className="w-full h-48 px-4 py-3 bg-white/8 border border-white/15 rounded-xl focus:outline-none focus:border-blue-400/60 transition-colors resize-none text-white placeholder-white/25 text-sm leading-relaxed"
              placeholder="Write freely about the version of you that's waiting on the other side of this journey…"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 bg-white/8 border border-white/15 text-white/70 font-medium rounded-2xl hover:bg-white/12 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!data.myWhy.trim()}
              className="flex-1 py-4 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 3: Trigger Mapping ──────────────────────────────────────────────────

  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000d1a] to-[#001F3F] overflow-y-auto p-6">
        <div className="w-full max-w-lg mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-white mb-3">Trigger Mapping</h1>
            <p className="text-white/55">What usually triggers the urge?</p>
          </div>

          <div className="space-y-6 mb-8">
            {[
              { key: 'emotional', label: 'Emotional Triggers' },
              { key: 'situational', label: 'Situational Triggers' },
              { key: 'social', label: 'Social Triggers' },
            ].map(({ key, label }) => (
              <div key={key}>
                <h3 className="text-white font-medium mb-3">{label}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_TRIGGERS[key as keyof typeof PRESET_TRIGGERS].map((trigger) => (
                    <button
                      key={trigger}
                      onClick={() => toggleTrigger(trigger)}
                      className={`p-3 rounded-xl text-left text-sm transition-all ${
                        data.triggers.includes(trigger)
                          ? 'bg-blue-500/20 border border-blue-500/50 text-blue-200'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <h3 className="text-white font-medium mb-3">Add Your Own</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomTrigger()}
                  className="flex-1 px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-blue-400/60 text-sm"
                  placeholder="Type a custom trigger…"
                />
                <button
                  onClick={addCustomTrigger}
                  className="px-5 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-400 transition-all text-sm"
                >
                  Add
                </button>
              </div>
              {data.customTriggers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.customTriggers.map((t) => (
                    <div key={t} className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-200 rounded-lg text-sm">
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 bg-white/8 border border-white/15 text-white/70 font-medium rounded-2xl hover:bg-white/12 transition-all"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-4 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-400 transition-all"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Step 4: Quit date + daily costs ──────────────────────────────────────────

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#000d1a] to-[#001F3F] overflow-y-auto p-6">
        <div className="w-full max-w-lg mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-light text-white mb-3">Set Your Quit Date</h1>
            <p className="text-white/55">When does your new life begin?</p>
          </div>

          <div className="bg-white/8 backdrop-blur-sm border border-white/15 rounded-2xl p-6 mb-6 space-y-6">

            {/* Date/time picker */}
            <div>
              <label className="block text-white/60 text-sm mb-2">Quit Date & Time</label>
              <input
                type="datetime-local"
                value={data.quitDate.toISOString().slice(0, 16)}
                onChange={(e) => setData({ ...data, quitDate: new Date(e.target.value) })}
                className="w-full px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white focus:outline-none focus:border-blue-400/60 transition-colors"
              />
            </div>

            {/* Required costs */}
            {requiredCostAddictions.length > 0 && (
              <div className="space-y-4">
                <p className="text-white/70 text-sm font-medium">Daily cost — helps us track your savings</p>
                {requiredCostAddictions.map((addiction) => (
                  <div key={addiction.id}>
                    <label className="flex items-center gap-2 text-sm text-white/60 mb-2">
                      <span>{addiction.emoji}</span>
                      <span>{addiction.label}</span>
                      <span className="text-red-400/70 text-xs">required</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-white/50 text-sm">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={data.dailyCosts[addiction.id] || ''}
                        onChange={(e) =>
                          setData({
                            ...data,
                            dailyCosts: { ...data.dailyCosts, [addiction.id]: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="flex-1 px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white focus:outline-none focus:border-blue-400/60"
                        placeholder={addiction.costPlaceholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Optional costs */}
            {optionalCostAddictions.length > 0 && (
              <div className="space-y-4">
                <p className="text-white/50 text-sm font-medium">
                  Daily cost <span className="text-white/30">(optional — skip if not applicable)</span>
                </p>
                {optionalCostAddictions.map((addiction) => (
                  <div key={addiction.id}>
                    <label className="flex items-center gap-2 text-sm text-white/50 mb-2">
                      <span>{addiction.emoji}</span>
                      <span>{addiction.label}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-white/30 text-sm">$</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={data.dailyCosts[addiction.id] || ''}
                        onChange={(e) =>
                          setData({
                            ...data,
                            dailyCosts: { ...data.dailyCosts, [addiction.id]: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="flex-1 px-4 py-3 bg-white/8 border border-white/15 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-blue-400/60"
                        placeholder={addiction.costPlaceholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Validation: check required costs are filled */}
          {(() => {
            const missingRequired = requiredCostAddictions.filter(
              (a) => !data.dailyCosts[a.id] || data.dailyCosts[a.id] <= 0
            );
            const canContinue = missingRequired.length === 0;

            return (
              <>
                {!canContinue && (
                  <p className="text-amber-400/70 text-xs text-center mb-4">
                    Please enter a daily cost for: {missingRequired.map(a => a.label).join(', ')}
                  </p>
                )}
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 bg-white/8 border border-white/15 text-white/70 font-medium rounded-2xl hover:bg-white/12 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={loading || !canContinue}
                    className="flex-1 py-4 bg-blue-500 text-white font-semibold rounded-2xl hover:bg-blue-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
                  >
                    {loading ? 'Starting…' : 'Begin Your Journey'}
                  </button>
                </div>
              </>
            );
          })()}

          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
            <p className="text-white font-light text-lg leading-relaxed">
              You don't need willpower. You need identity.
            </p>
            <p className="text-white/45 mt-2 text-sm">From today — you are someone new.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
