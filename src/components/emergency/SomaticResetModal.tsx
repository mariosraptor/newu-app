import { useState, useEffect } from 'react';
import { X, Snowflake, Wind, Eye } from 'lucide-react';
import { useStealth } from '../../contexts/StealthContext';

type ResetStep = 'cold-shock' | 'vagus-breath' | 'sensory-lock' | 'complete';

export function SomaticResetModal({ onClose }: { onClose: () => void }) {
  const { getTerminology } = useStealth();
  const [step, setStep] = useState<ResetStep>('cold-shock');
  const [breathCount, setBreathCount] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [sensoryChecks, setSensoryChecks] = useState({
    see: false,
    touch: false,
    hear: false,
    smell: false,
    ground: false,
  });

  useEffect(() => {
    if (step === 'vagus-breath') {
      startBreathingCycle();
    }
  }, [step, breathCount]);

  const startBreathingCycle = () => {
    if (breathCount >= 5) {
      setStep('sensory-lock');
      return;
    }

    setBreathPhase('inhale');
    setTimeout(() => {
      setBreathPhase('hold');
      setTimeout(() => {
        setBreathPhase('exhale');
        setTimeout(() => {
          setBreathCount((prev) => prev + 1);
        }, 8000);
      }, 4000);
    }, 4000);
  };

  const toggleSensoryCheck = (key: keyof typeof sensoryChecks) => {
    setSensoryChecks((prev) => ({ ...prev, [key]: !prev[key] }));
    const allChecked = Object.values({ ...sensoryChecks, [key]: !sensoryChecks[key] }).every((v) => v);
    if (allChecked) {
      setTimeout(() => setStep('complete'), 500);
    }
  };

  if (step === 'cold-shock') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#001F3F] border-2 border-cyan-500 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Snowflake className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-light text-white mb-2">Step 1: Cold Shock</h2>
            <p className="text-white/70 text-sm">Activate your nervous system override</p>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 mb-6">
            <div className="text-white font-medium mb-4">Execute immediately:</div>
            <ol className="text-white/90 space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold">1.</span>
                <span>Run COLD water on your wrists for 30 seconds</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold">2.</span>
                <span>Splash ice-cold water on your face 3 times</span>
              </li>
              <li className="flex gap-3">
                <span className="text-cyan-400 font-bold">3.</span>
                <span>Hold an ice cube until your nervous system shifts</span>
              </li>
            </ol>
          </div>

          <div className="text-white/60 text-xs mb-6 text-center">
            Cold temperature interrupts the {getTerminology('craving').toLowerCase()} neural pathway
          </div>

          <button
            onClick={() => setStep('vagus-breath')}
            className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-xl transition-all"
          >
            Done → Next Step
          </button>
        </div>
      </div>
    );
  }

  if (step === 'vagus-breath') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#001F3F] border-2 border-blue-500 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wind className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-light text-white mb-2">Step 2: Vagus Nerve Breath</h2>
            <p className="text-white/70 text-sm">4-4-8 method for parasympathetic activation</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-8 mb-6">
            <div className="text-center">
              <div className="text-blue-400 text-sm uppercase tracking-wider mb-4">
                {breathPhase === 'inhale' && 'Breathe In'}
                {breathPhase === 'hold' && 'Hold'}
                {breathPhase === 'exhale' && 'Breathe Out'}
              </div>
              <div className="relative w-32 h-32 mx-auto">
                <div
                  className={`w-full h-full rounded-full transition-all duration-1000 ${
                    breathPhase === 'inhale'
                      ? 'bg-blue-500/40 scale-110'
                      : breathPhase === 'hold'
                      ? 'bg-blue-500/60 scale-100'
                      : 'bg-blue-500/20 scale-75'
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-4xl font-light">
                    {breathPhase === 'inhale' && '4'}
                    {breathPhase === 'hold' && '4'}
                    {breathPhase === 'exhale' && '8'}
                  </div>
                </div>
              </div>
              <div className="text-white/60 text-sm mt-4">
                Cycle {breathCount + 1} of 5
              </div>
            </div>
          </div>

          <div className="text-white/60 text-xs text-center">
            Extended exhale triggers the calming response
          </div>
        </div>
      </div>
    );
  }

  if (step === 'sensory-lock') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#001F3F] border-2 border-purple-500 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-light text-white mb-2">Step 3: Sensory Lock</h2>
            <p className="text-white/70 text-sm">5-4-3-2-1 grounding technique</p>
          </div>

          <div className="space-y-3 mb-6">
            <button
              onClick={() => toggleSensoryCheck('see')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                sensoryChecks.see
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/20 bg-white/10 hover:border-purple-500/50'
              }`}
            >
              <div className="text-white font-medium mb-1">5 things you can SEE</div>
              <div className="text-white/60 text-sm">Look around and name them</div>
            </button>

            <button
              onClick={() => toggleSensoryCheck('touch')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                sensoryChecks.touch
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/20 bg-white/10 hover:border-purple-500/50'
              }`}
            >
              <div className="text-white font-medium mb-1">4 things you can TOUCH</div>
              <div className="text-white/60 text-sm">Feel textures around you</div>
            </button>

            <button
              onClick={() => toggleSensoryCheck('hear')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                sensoryChecks.hear
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/20 bg-white/10 hover:border-purple-500/50'
              }`}
            >
              <div className="text-white font-medium mb-1">3 things you can HEAR</div>
              <div className="text-white/60 text-sm">Listen to sounds nearby</div>
            </button>

            <button
              onClick={() => toggleSensoryCheck('smell')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                sensoryChecks.smell
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/20 bg-white/10 hover:border-purple-500/50'
              }`}
            >
              <div className="text-white font-medium mb-1">2 things you can SMELL</div>
              <div className="text-white/60 text-sm">Notice scents in the air</div>
            </button>

            <button
              onClick={() => toggleSensoryCheck('ground')}
              className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                sensoryChecks.ground
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-white/20 bg-white/10 hover:border-purple-500/50'
              }`}
            >
              <div className="text-white font-medium mb-1">1 thing to GROUND yourself</div>
              <div className="text-white/60 text-sm">Take a deep breath</div>
            </button>
          </div>

          <div className="text-white/60 text-xs text-center">
            Tap each when complete to anchor in the present moment
          </div>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-[#001F3F] border-2 border-green-500 rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-white mb-2">System Reset Complete</h2>
            <p className="text-white/70 text-sm">Neural baseline recalibrated</p>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
            <div className="text-white/90 text-sm space-y-2">
              <p>✓ Nervous system override activated</p>
              <p>✓ Parasympathetic response engaged</p>
              <p>✓ Present-moment awareness restored</p>
            </div>
          </div>

          <div className="text-center text-white/70 mb-6">
            <p className="mb-2">The {getTerminology('craving').toLowerCase()} has passed.</p>
            <p className="text-green-400 font-medium">You maintained system integrity.</p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
