import { useState } from 'react';
import { Cigarette, Wine, CandyOff, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface OnboardingData {
  addictions: string[];
  myWhy: string;
  triggers: string[];
  customTriggers: string[];
  quitDate: Date;
  dailyCosts: Record<string, number>;
}

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

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
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

  const addictions = [
    { id: 'smoking', label: 'Smoking', icon: Cigarette },
    { id: 'vaping', label: 'Vaping', icon: Zap },
    { id: 'snus', label: 'Snus', icon: CandyOff },
    { id: 'alcohol', label: 'Alcohol', icon: Wine },
  ];

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
      setData({
        ...data,
        customTriggers: [...data.customTriggers, customTrigger.trim()],
      });
      setCustomTrigger('');
    }
  };

  const handleComplete = () => {
    if (!user) return;

    setLoading(true);

    try {
      // Store onboarding data in localStorage for now
      const onboardingData = {
        userId: user.id,
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

      // Navigate to main app immediately
      setTimeout(() => {
        setLoading(false);
        onComplete();
      }, 500);
    } catch (error) {
      console.error('Onboarding error:', error);
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1A1A2A] mb-4">
              Choose Your Journey
            </h1>
            <p className="text-lg text-[#6A7A9A]">
              Select which addiction(s) you want to address
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {addictions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => toggleAddiction(id)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  data.addictions.includes(id)
                    ? 'bg-[#2A5ACA] border-[#2A5ACA] text-white'
                    : 'bg-white border-gray-200 text-[#1A1A2A] hover:border-[#2A5ACA]'
                }`}
              >
                <Icon className="w-8 h-8 mb-3 mx-auto" />
                <div className="font-semibold">{label}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={data.addictions.length === 0}
            className="w-full py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1A1A2A] mb-4">Your Why</h1>
            <p className="text-lg text-[#6A7A9A]">
              What does your new self look like?
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6">
            <textarea
              value={data.myWhy}
              onChange={(e) => setData({ ...data, myWhy: e.target.value })}
              className="w-full h-48 px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors resize-none"
              placeholder="Write freely about your vision for your new life..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 bg-white text-[#2A5ACA] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!data.myWhy.trim()}
              className="flex-1 py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] overflow-y-auto p-6">
        <div className="w-full max-w-2xl mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1A1A2A] mb-4">
              Trigger Mapping
            </h1>
            <p className="text-lg text-[#6A7A9A]">
              What usually triggers your habit?
            </p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-[#1A1A2A] mb-3">
                Emotional Triggers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PRESET_TRIGGERS.emotional.map((trigger) => (
                  <button
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      data.triggers.includes(trigger)
                        ? 'bg-[#2A5ACA] text-white'
                        : 'bg-white text-[#1A1A2A] hover:bg-gray-50'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1A1A2A] mb-3">
                Situational Triggers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PRESET_TRIGGERS.situational.map((trigger) => (
                  <button
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      data.triggers.includes(trigger)
                        ? 'bg-[#2A5ACA] text-white'
                        : 'bg-white text-[#1A1A2A] hover:bg-gray-50'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1A1A2A] mb-3">
                Social Triggers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PRESET_TRIGGERS.social.map((trigger) => (
                  <button
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      data.triggers.includes(trigger)
                        ? 'bg-[#2A5ACA] text-white'
                        : 'bg-white text-[#1A1A2A] hover:bg-gray-50'
                    }`}
                  >
                    {trigger}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-[#1A1A2A] mb-3">
                Add Custom Trigger
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomTrigger()}
                  className="flex-1 px-4 py-3 bg-white border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                  placeholder="Add your own trigger..."
                />
                <button
                  onClick={addCustomTrigger}
                  className="px-6 py-3 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors"
                >
                  Add
                </button>
              </div>
              {data.customTriggers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.customTriggers.map((trigger) => (
                    <div
                      key={trigger}
                      className="px-4 py-2 bg-[#2A5ACA] text-white rounded-lg"
                    >
                      {trigger}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-4 bg-white text-[#2A5ACA] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#1A1A2A] mb-4">
              Set Your Quit Date
            </h1>
            <p className="text-lg text-[#6A7A9A]">When does your new life begin?</p>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                Quit Date & Time
              </label>
              <input
                type="datetime-local"
                value={data.quitDate.toISOString().slice(0, 16)}
                onChange={(e) =>
                  setData({ ...data, quitDate: new Date(e.target.value) })
                }
                className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
              />
            </div>

            <div className="space-y-4">
              <p className="font-medium text-[#1A1A2A]">Daily Cost (helps track savings)</p>
              {data.addictions.map((addiction) => (
                <div key={addiction}>
                  <label className="block text-sm text-[#6A7A9A] mb-2 capitalize">
                    {addiction} - Daily cost ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.dailyCosts[addiction] || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        dailyCosts: {
                          ...data.dailyCosts,
                          [addiction]: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                    placeholder="0.00"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setStep(3)}
              className="flex-1 py-4 bg-white text-[#2A5ACA] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Begin Your Journey'}
            </button>
          </div>

          <div className="mt-8 p-6 bg-white rounded-2xl text-center">
            <p className="text-lg font-medium text-[#1A1A2A]">
              You don't need willpower. You need identity.
            </p>
            <p className="text-[#6A7A9A] mt-2">
              From today — you are someone new.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
