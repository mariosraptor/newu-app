import { useState, useEffect, useRef } from 'react';
import { Waves, Play, Pause, Brain, BookOpen } from 'lucide-react';

interface CBTExercise {
  id: string;
  title: string;
  description: string;
  steps: string[];
  duration: string;
}

const cbtLibrary: CBTExercise[] = [
  {
    id: '1',
    title: 'Thought Reframing',
    description: 'Challenge and reframe automatic negative thoughts',
    duration: '60 seconds',
    steps: [
      'Identify the negative thought',
      'Ask: Is this 100% true?',
      'Find evidence against it',
      'Create a balanced alternative thought',
    ],
  },
  {
    id: '2',
    title: 'Urge Surfing',
    description: 'Ride the wave of cravings without acting',
    duration: '90 seconds',
    steps: [
      'Notice the craving without judgment',
      'Observe where you feel it in your body',
      'Imagine it as a wave that rises and falls',
      'Watch it peak and naturally decline',
    ],
  },
  {
    id: '3',
    title: 'Cost-Benefit Analysis',
    description: 'Rational decision-making in the moment',
    duration: '45 seconds',
    steps: [
      'List 3 costs of giving in',
      'List 3 benefits of resisting',
      'Which side weighs more?',
      'Make the logical choice',
    ],
  },
  {
    id: '4',
    title: 'Future Self Visualization',
    description: 'Connect with your goal identity',
    duration: '60 seconds',
    steps: [
      'Close your eyes',
      'Picture yourself 90 days clean',
      'Feel the pride and freedom',
      'Ask: What would that person do right now?',
    ],
  },
];

export function WellnessHubTab() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frequency, setFrequency] = useState<'alpha' | 'beta'>('alpha');
  const [selectedExercise, setSelectedExercise] = useState<CBTExercise | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    if (isPlaying) {
      startBinauralBeats();
    } else {
      stopBinauralBeats();
    }

    return () => {
      stopBinauralBeats();
    };
  }, [isPlaying, frequency]);

  const startBinauralBeats = async () => {
    stopBinauralBeats();

    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Mobile browsers start AudioContext in 'suspended' state — must resume after user gesture
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const baseFrequency = 200;
      const binauralBeatFreq = frequency === 'alpha' ? 10 : 20;

      const leftOscillator = audioContext.createOscillator();
      const rightOscillator = audioContext.createOscillator();
      const leftGain = audioContext.createGain();
      const rightGain = audioContext.createGain();
      const merger = audioContext.createChannelMerger(2);

      leftOscillator.type = 'sine';
      rightOscillator.type = 'sine';
      leftOscillator.frequency.value = baseFrequency;
      rightOscillator.frequency.value = baseFrequency + binauralBeatFreq;

      leftGain.gain.value = 0.3;
      rightGain.gain.value = 0.3;

      leftOscillator.connect(leftGain);
      rightOscillator.connect(rightGain);
      leftGain.connect(merger, 0, 0);
      rightGain.connect(merger, 0, 1);
      merger.connect(audioContext.destination);

      leftOscillator.start();
      rightOscillator.start();

      leftOscillatorRef.current = leftOscillator;
      rightOscillatorRef.current = rightOscillator;
    } catch (err) {
      console.error('Failed to start audio:', err);
      setIsPlaying(false);
    }
  };

  const stopBinauralBeats = () => {
    try {
      if (leftOscillatorRef.current) {
        leftOscillatorRef.current.stop();
        leftOscillatorRef.current = null;
      }
      if (rightOscillatorRef.current) {
        rightOscillatorRef.current.stop();
        rightOscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } catch {}
  };

  const toggleFrequency = (freq: 'alpha' | 'beta') => {
    if (frequency === freq && isPlaying) {
      setIsPlaying(false);
    } else {
      setFrequency(freq);
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white mb-2">Wellness Hub</h1>
          <p className="text-white/70">Neural optimization tools and cognitive training</p>
        </div>

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
                {frequency === 'alpha' && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
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
                {frequency === 'beta' && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
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
                    className={`flex-1 rounded-sm ${
                      frequency === 'alpha' ? 'bg-blue-500' : 'bg-green-500'
                    } animate-pulse`}
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-white/60 text-xs mt-4">
            Use headphones for optimal binaural beat effect. Listen for 10-20 minutes.
          </div>
        </div>

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
            {cbtLibrary.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => setSelectedExercise(exercise)}
                className="w-full text-left bg-white/10 hover:bg-white/20 rounded-xl p-4 transition-all border border-white/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">{exercise.title}</div>
                  <BookOpen className="w-5 h-5 text-white/60" />
                </div>
                <div className="text-white/70 text-sm mb-2">{exercise.description}</div>
                <div className="text-blue-400 text-xs">{exercise.duration}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedExercise && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="bg-[#001F3F] border border-white/20 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-medium text-lg">{selectedExercise.title}</div>
                <div className="text-white/60 text-sm">{selectedExercise.duration}</div>
              </div>
            </div>

            <p className="text-white/90 mb-6">{selectedExercise.description}</p>

            <div className="space-y-4 mb-6">
              {selectedExercise.steps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-white/90 text-sm">{step}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedExercise(null)}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
