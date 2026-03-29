import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useStealth } from '../../contexts/StealthContext';

interface Trigger {
  id: string;
  category: string;
  name: string;
  activation_count: number;
  resistance_count: number;
}

const presetTriggers = {
  emotional: ['Stress', 'Anxiety', 'Boredom', 'Loneliness', 'Anger'],
  situational: ['After Meals', 'Driving', 'Break Time', 'Morning Coffee', 'Social Events'],
  social: ['Friends Smoking', 'Bar/Party', 'Work Pressure', 'Family Tension', 'Dating'],
};

export function TriggerMapperTab() {
  const { user } = useAuth();
  const { getTerminology } = useStealth();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof presetTriggers>('emotional');
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  const [wasResisted, setWasResisted] = useState<boolean | null>(null);

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
    setLoading(false);
  };

  const addPresetTrigger = async (category: string, name: string) => {
    if (!user) return;

    const existing = triggers.find((t) => t.name === name && t.category === category);
    if (existing) return;

    const { data: journey } = await supabase
      .from('journeys')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    const { data, error } = await supabase
      .from('triggers')
      .insert({
        user_id: user.id,
        journey_id: journey?.id,
        category,
        name,
        is_custom: false,
      })
      .select()
      .single();

    if (data && !error) {
      setTriggers([...triggers, data]);
    }
  };

  const logTriggerEvent = async () => {
    if (!selectedTrigger || wasResisted === null || !user) return;

    await supabase.from('trigger_logs').insert({
      trigger_id: selectedTrigger.id,
      user_id: user.id,
      was_resisted: wasResisted,
    });

    await supabase
      .from('triggers')
      .update({
        activation_count: selectedTrigger.activation_count + 1,
        resistance_count: wasResisted
          ? selectedTrigger.resistance_count + 1
          : selectedTrigger.resistance_count,
      })
      .eq('id', selectedTrigger.id);

    if (wasResisted) {
      await supabase.from('dopamine_points').insert({
        user_id: user.id,
        points: 10,
        reason: `Resisted trigger: ${selectedTrigger.name}`,
        activity_reference: selectedTrigger.id,
      });
    }

    setShowLogModal(false);
    setSelectedTrigger(null);
    setWasResisted(null);
    loadTriggers();
  };

  const openLogModal = (trigger: Trigger) => {
    setSelectedTrigger(trigger);
    setShowLogModal(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#001F3F]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-white mb-2">{getTerminology('Trigger')} Map</h1>
          <p className="text-white/70">Track and analyze system interference patterns</p>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(Object.keys(presetTriggers) as Array<keyof typeof presetTriggers>).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-medium mb-4">Add {selectedCategory} triggers</h2>
          <div className="flex flex-wrap gap-2">
            {presetTriggers[selectedCategory].map((name) => {
              const isAdded = triggers.some((t) => t.name === name);
              return (
                <button
                  key={name}
                  onClick={() => !isAdded && addPresetTrigger(selectedCategory, name)}
                  disabled={isAdded}
                  className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    isAdded
                      ? 'bg-green-500/20 text-green-400 cursor-default'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {isAdded ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-white font-medium">Your Active {getTerminology('Triggers')}</h2>
          {triggers.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <AlertTriangle className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/70">No triggers added yet. Start by selecting some above.</p>
            </div>
          ) : (
            triggers.map((trigger) => {
              const resistanceRate =
                trigger.activation_count > 0
                  ? Math.round((trigger.resistance_count / trigger.activation_count) * 100)
                  : 0;
              return (
                <div
                  key={trigger.id}
                  onClick={() => openLogModal(trigger)}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium">{trigger.name}</div>
                      <div className="text-white/60 text-sm capitalize">{trigger.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-white">{resistanceRate}%</div>
                      <div className="text-white/60 text-xs">Resistance</div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="text-white/60">
                      Activated: <span className="text-white">{trigger.activation_count}</span>
                    </div>
                    <div className="text-white/60">
                      Resisted: <span className="text-green-400">{trigger.resistance_count}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showLogModal && selectedTrigger && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#001F3F] border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-light text-white">Log {getTerminology('Trigger')} Event</h3>
              <button
                onClick={() => {
                  setShowLogModal(false);
                  setSelectedTrigger(null);
                  setWasResisted(null);
                }}
                className="text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-white/70 mb-4">
                Did you resist the {getTerminology('trigger').toLowerCase()}: {selectedTrigger.name}?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setWasResisted(true)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    wasResisted === true
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-white/20 bg-white/10 hover:border-green-500/50'
                  }`}
                >
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-white font-medium">Yes</div>
                  <div className="text-white/60 text-xs">+10 points</div>
                </button>
                <button
                  onClick={() => setWasResisted(false)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    wasResisted === false
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-white/20 bg-white/10 hover:border-red-500/50'
                  }`}
                >
                  <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-white font-medium">No</div>
                  <div className="text-white/60 text-xs">{getTerminology('Calibration Error')}</div>
                </button>
              </div>
            </div>

            <button
              onClick={logTriggerEvent}
              disabled={wasResisted === null}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/40 text-white rounded-xl font-medium transition-all"
            >
              Log Event
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
