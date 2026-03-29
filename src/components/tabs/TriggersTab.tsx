import { useState, useEffect } from 'react';
import { Brain, TrendingUp, BookOpen, Pause } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Trigger {
  id: string;
  category: string;
  name: string;
  activation_count: number;
  resistance_count: number;
}

export function TriggersTab() {
  const { user } = useAuth();
  const [triggers, setTriggers] = useState<Trigger[]>([]);

  useEffect(() => {
    if (user) {
      loadTriggers();
    }
  }, [user]);

  const loadTriggers = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('triggers')
      .select('*')
      .eq('user_id', user.id)
      .order('activation_count', { ascending: false });

    if (data) {
      setTriggers(data);
    }
  };

  const getCategoryColor = (category: string) => {
    if (category === 'emotional') return 'from-purple-500 to-pink-500';
    if (category === 'situational') return 'from-blue-500 to-cyan-500';
    return 'from-green-500 to-teal-500';
  };

  const getResistanceRate = (trigger: Trigger) => {
    if (trigger.activation_count === 0) return 0;
    return Math.round((trigger.resistance_count / trigger.activation_count) * 100);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-bold text-[#1A1A2A]">My Triggers</h1>
          <p className="text-[#6A7A9A]">Understanding is power</p>
        </div>

        <div className="bg-gradient-to-br from-[#2A5ACA] to-[#1f4ba3] rounded-3xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Trigger Awareness</h2>
          </div>
          <p className="text-white/90 leading-relaxed">
            Between trigger and action there is a space. In that space is your power.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Pause className="w-6 h-6 text-[#2A5ACA]" />
            <h2 className="text-lg font-semibold text-[#1A1A2A]">
              The Pause Practice
            </h2>
          </div>
          <p className="text-sm text-[#6A7A9A] mb-4">
            When a craving hits, pause for 90 seconds. Use the emergency button to
            breathe through it.
          </p>
          <div className="p-4 bg-[#EEF2FF] rounded-xl">
            <ol className="space-y-2 text-sm text-[#1A1A2A]">
              <li>1. Notice the craving without judgment</li>
              <li>2. Take a deep breath</li>
              <li>3. Observe the sensation in your body</li>
              <li>4. Remember: it will pass in 90 seconds</li>
              <li>5. Choose your response consciously</li>
            </ol>
          </div>
        </div>

        {triggers.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A2A]">Your Trigger Map</h2>
            {triggers.map((trigger) => {
              const resistanceRate = getResistanceRate(trigger);

              return (
                <div key={trigger.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(
                            trigger.category
                          )}`}
                        >
                          {trigger.category}
                        </span>
                      </div>
                      <h3 className="font-semibold text-[#1A1A2A]">
                        {trigger.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#2A5ACA]">
                        {resistanceRate}%
                      </div>
                      <div className="text-xs text-[#6A7A9A]">Resistance</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-2 bg-[#F8F9FC] rounded-lg">
                      <div className="text-[#6A7A9A]">Activated</div>
                      <div className="font-semibold text-[#1A1A2A]">
                        {trigger.activation_count} times
                      </div>
                    </div>
                    <div className="p-2 bg-[#F8F9FC] rounded-lg">
                      <div className="text-[#6A7A9A]">Resisted</div>
                      <div className="font-semibold text-[#2ABA7A]">
                        {trigger.resistance_count} times
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 shadow-sm text-center">
            <Brain className="w-16 h-16 text-[#6A7A9A] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[#1A1A2A] mb-2">
              Your Triggers Are Mapped
            </h3>
            <p className="text-[#6A7A9A]">
              As you encounter triggers, your awareness will grow here
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-6 h-6 text-[#2A5ACA]" />
            <h2 className="text-lg font-semibold text-[#1A1A2A]">
              Identity Statement
            </h2>
          </div>
          <p className="text-sm text-[#6A7A9A] mb-4">
            Repeat this daily to reinforce your new identity
          </p>
          <div className="p-6 bg-gradient-to-br from-[#EEF2FF] to-[#F8F9FC] rounded-2xl border-2 border-[#2A5ACA]">
            <p className="text-lg font-medium text-[#1A1A2A] text-center leading-relaxed">
              I am not someone who needs this habit.
              <br />I am someone who chooses freedom.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
