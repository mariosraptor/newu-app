import { useState } from 'react';
import { X } from 'lucide-react';
import { BreathingExercise } from './BreathingExercise';

type EmergencyState = 'check-in' | 'craving' | 'anxious' | 'gave-in' | 'moment';

export function EmergencyModal({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<EmergencyState>('check-in');
  const [showBreathing, setShowBreathing] = useState(false);

  if (showBreathing) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-3xl max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#6A7A9A] hover:text-[#1A1A2A] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <BreathingExercise onComplete={onClose} />
        </div>
      </div>
    );
  }

  if (state === 'check-in') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#6A7A9A] hover:text-[#1A1A2A] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1A1A2A] mb-2">
              Hey. We're here.
            </h2>
            <p className="text-[#6A7A9A]">How are you feeling right now?</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setState('craving')}
              className="w-full p-4 bg-[#F8F9FC] hover:bg-[#EEF2FF] text-[#1A1A2A] rounded-xl transition-colors text-left"
            >
              I'm having a craving
            </button>
            <button
              onClick={() => setState('anxious')}
              className="w-full p-4 bg-[#F8F9FC] hover:bg-[#EEF2FF] text-[#1A1A2A] rounded-xl transition-colors text-left"
            >
              I'm feeling anxious or stressed
            </button>
            <button
              onClick={() => setState('gave-in')}
              className="w-full p-4 bg-[#F8F9FC] hover:bg-[#EEF2FF] text-[#1A1A2A] rounded-xl transition-colors text-left"
            >
              I already gave in and I need support
            </button>
            <button
              onClick={() => setState('moment')}
              className="w-full p-4 bg-[#F8F9FC] hover:bg-[#EEF2FF] text-[#1A1A2A] rounded-xl transition-colors text-left"
            >
              I just need a moment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'craving') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#6A7A9A] hover:text-[#1A1A2A] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1A1A2A] mb-2">
              This will pass
            </h2>
            <p className="text-[#6A7A9A]">
              Cravings last exactly 90 seconds if you don't feed them.
              <br />
              Breathe with us.
            </p>
          </div>

          <button
            onClick={() => setShowBreathing(true)}
            className="w-full py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors"
          >
            Start 90-Second Breathing
          </button>
        </div>
      </div>
    );
  }

  if (state === 'anxious') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#6A7A9A] hover:text-[#1A1A2A] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1A1A2A] mb-2">
              Let's reset your nervous system
            </h2>
            <p className="text-[#6A7A9A]">
              This breathing exercise will help calm your stress response.
            </p>
          </div>

          <button
            onClick={() => setShowBreathing(true)}
            className="w-full py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors"
          >
            Start Breathing Exercise
          </button>
        </div>
      </div>
    );
  }

  if (state === 'gave-in') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#6A7A9A] hover:text-[#1A1A2A] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1A1A2A] mb-4">
              One moment does not define your journey
            </h2>
            <p className="text-[#6A7A9A] mb-4">
              You reached for help. That makes you stronger, not weaker.
            </p>
            <p className="text-[#1A1A2A] font-medium">
              Your new streak starts right now.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors"
            >
              Reset My Journey
            </button>
            <button
              onClick={() => setState('moment')}
              className="w-full py-4 bg-[#F8F9FC] text-[#2A5ACA] font-semibold rounded-xl hover:bg-[#EEF2FF] transition-colors"
            >
              Take a Moment First
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'moment') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#6A7A9A] hover:text-[#1A1A2A] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1A1A2A] mb-2">
              Take the time you need
            </h2>
            <p className="text-[#6A7A9A]">
              Sometimes we just need to pause and breathe.
            </p>
          </div>

          <button
            onClick={() => setShowBreathing(true)}
            className="w-full py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors mb-3"
          >
            2-Minute Meditation
          </button>

          <button
            onClick={onClose}
            className="w-full py-4 bg-[#F8F9FC] text-[#2A5ACA] font-semibold rounded-xl hover:bg-[#EEF2FF] transition-colors"
          >
            I'm Ready to Continue
          </button>
        </div>
      </div>
    );
  }

  return null;
}
