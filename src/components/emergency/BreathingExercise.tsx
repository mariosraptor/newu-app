import { useState, useEffect } from 'react';

export function BreathingExercise({ onComplete }: { onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState(90);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [phaseTimer, setPhaseTimer] = useState(4);

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, []);

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhaseTimer((prev) => {
        if (prev <= 1) {
          setPhase((currentPhase) => {
            if (currentPhase === 'inhale') return 'hold';
            if (currentPhase === 'hold') return 'exhale';
            return 'inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(phaseInterval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setTimeout(() => {
        onComplete();
      }, 2000);
    }
  }, [timeLeft, onComplete]);

  const getPhaseColor = () => {
    if (phase === 'inhale') return 'bg-blue-500';
    if (phase === 'hold') return 'bg-purple-500';
    return 'bg-green-500';
  };

  const getPhaseText = () => {
    if (phase === 'inhale') return 'Breathe In';
    if (phase === 'hold') return 'Hold';
    return 'Breathe Out';
  };

  if (timeLeft === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-4xl mb-4">✨</div>
        <h3 className="text-2xl font-bold text-[#1A1A2A] mb-2">
          You did it
        </h3>
        <p className="text-[#6A7A9A]">The craving has passed.</p>
      </div>
    );
  }

  return (
    <div className="p-12">
      <div className="text-center mb-8">
        <div className="text-6xl font-bold text-[#1A1A2A] mb-2">{timeLeft}</div>
        <p className="text-[#6A7A9A]">seconds remaining</p>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div
          className={`w-48 h-48 rounded-full ${getPhaseColor()} flex items-center justify-center transition-all duration-1000 ${
            phase === 'inhale' ? 'scale-110' : phase === 'exhale' ? 'scale-90' : 'scale-100'
          }`}
        >
          <div className="text-center text-white">
            <div className="text-2xl font-bold mb-2">{getPhaseText()}</div>
            <div className="text-5xl font-bold">{phaseTimer}</div>
          </div>
        </div>
      </div>

      <p className="text-center text-[#6A7A9A] text-sm">
        Follow the circle. Breathe in as it grows, hold, then breathe out as it shrinks.
      </p>
    </div>
  );
}
