import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle, Plus, X, BookOpen, Flame } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useStealth } from '../../contexts/StealthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Trigger {
  id: string;
  category: string;
  name: string;
  activation_count: number;
  resistance_count: number;
}

interface CravingEntry {
  id: string;
  timestamp: string;
  triggerName: string;
  intensity: number; // 1–5
  notes: string;
  resisted: boolean;
}

const CRAVING_JOURNAL_KEY = 'newu_craving_journal';

type CategoryKey = 'emotional' | 'situational' | 'social';

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_TRIGGERS: Record<CategoryKey, string[]> = {
  emotional: ['Stress', 'Anxiety', 'Boredom', 'Loneliness', 'Anger'],
  situational: ['After Meals', 'Driving', 'Break Time', 'Morning Coffee', 'Social Events'],
  social: ['Friends Smoking', 'Bar/Party', 'Work Pressure', 'Family Tension', 'Dating'],
};

const SELECTED_KEY = 'newu_selected_triggers';
const CUSTOM_KEY   = 'newu_custom_triggers';

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadSelectedTriggers(): Record<CategoryKey, string[]> {
  try {
    const raw = localStorage.getItem(SELECTED_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { emotional: [], situational: [], social: [] };
}

function saveSelectedTriggers(data: Record<CategoryKey, string[]>) {
  try { localStorage.setItem(SELECTED_KEY, JSON.stringify(data)); } catch {}
}

function loadCustomTriggers(): Record<CategoryKey, string[]> {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { emotional: [], situational: [], social: [] };
}

function saveCustomTriggers(data: Record<CategoryKey, string[]>) {
  try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(data)); } catch {}
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TriggerMapperTab() {
  const { user } = useAuth();
  const { getTerminology } = useStealth();

  // Supabase trigger records (for logging stats)
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [loading, setLoading] = useState(true);

  // Category tab
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('emotional');

  // localStorage state
  const [selectedTriggers, setSelectedTriggers] = useState<Record<CategoryKey, string[]>>(
    () => loadSelectedTriggers()
  );
  const [customTriggers, setCustomTriggers] = useState<Record<CategoryKey, string[]>>(
    () => loadCustomTriggers()
  );

  // Craving journal
  const [cravingJournal, setCravingJournal] = useState<CravingEntry[]>(() => {
    try { const r = localStorage.getItem(CRAVING_JOURNAL_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
  });
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalTrigger, setJournalTrigger] = useState('');
  const [journalIntensity, setJournalIntensity] = useState(3);
  const [journalNotes, setJournalNotes] = useState('');
  const [journalResisted, setJournalResisted] = useState<boolean | null>(null);

  // "Add Yours +" inline input
  const [addingCategory, setAddingCategory] = useState<CategoryKey | null>(null);
  const [newTriggerName, setNewTriggerName] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);

  // Log modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  const [wasResisted, setWasResisted] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) loadTriggers();
    else setLoading(false);
  }, [user]);

  // Focus the inline input when it opens
  useEffect(() => {
    if (addingCategory) {
      setTimeout(() => addInputRef.current?.focus(), 50);
    }
  }, [addingCategory]);

  // ─── Supabase ───────────────────────────────────────────────────────────────

  const loadTriggers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('triggers')
      .select('*')
      .eq('user_id', user.id)
      .order('activation_count', { ascending: false });
    if (data) setTriggers(data);
    setLoading(false);
  };

  const getOrCreateSupabaseTrigger = async (category: string, name: string): Promise<Trigger | null> => {
    if (!user) return null;

    const existing = triggers.find((t) => t.name === name && t.category === category);
    if (existing) return existing;

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
      setTriggers((prev) => [...prev, data]);
      return data;
    }
    return null;
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

  // ─── Preset toggle ──────────────────────────────────────────────────────────

  const togglePreset = (category: CategoryKey, name: string) => {
    const current = selectedTriggers[category];
    const updated = current.includes(name)
      ? current.filter((n) => n !== name)
      : [...current, name];
    const next = { ...selectedTriggers, [category]: updated };
    setSelectedTriggers(next);
    saveSelectedTriggers(next);
  };

  // ─── Craving journal ────────────────────────────────────────────────────────

  const allActiveTriggerNames = [
    ...(Object.keys(PRESET_TRIGGERS) as CategoryKey[]).flatMap(cat => selectedTriggers[cat]),
    'Other',
  ];

  const saveJournalEntry = () => {
    if (journalResisted === null) return;
    const entry: CravingEntry = {
      id: `c-${Date.now()}`,
      timestamp: new Date().toISOString(),
      triggerName: journalTrigger || 'Unspecified',
      intensity: journalIntensity,
      notes: journalNotes.trim(),
      resisted: journalResisted,
    };
    const updated = [entry, ...cravingJournal].slice(0, 100);
    setCravingJournal(updated);
    try { localStorage.setItem(CRAVING_JOURNAL_KEY, JSON.stringify(updated)); } catch {}
    setShowJournalModal(false);
    setJournalTrigger('');
    setJournalIntensity(3);
    setJournalNotes('');
    setJournalResisted(null);
  };

  // ─── Custom trigger actions ─────────────────────────────────────────────────

  const openAddInput = (category: CategoryKey) => {
    setAddingCategory(category);
    setNewTriggerName('');
  };

  const confirmAddCustom = () => {
    const name = newTriggerName.trim();
    if (!name || !addingCategory) return;

    // Avoid duplicates with presets or existing custom
    const allExisting = [
      ...PRESET_TRIGGERS[addingCategory],
      ...customTriggers[addingCategory],
    ];
    if (allExisting.some((n) => n.toLowerCase() === name.toLowerCase())) {
      setAddingCategory(null);
      setNewTriggerName('');
      return;
    }

    const next = {
      ...customTriggers,
      [addingCategory]: [...customTriggers[addingCategory], name],
    };
    setCustomTriggers(next);
    saveCustomTriggers(next);

    // Auto-select the newly added custom trigger
    const nextSelected = {
      ...selectedTriggers,
      [addingCategory]: [...selectedTriggers[addingCategory], name],
    };
    setSelectedTriggers(nextSelected);
    saveSelectedTriggers(nextSelected);

    setAddingCategory(null);
    setNewTriggerName('');
  };

  const deleteCustomTrigger = (category: CategoryKey, name: string) => {
    const next = {
      ...customTriggers,
      [category]: customTriggers[category].filter((n) => n !== name),
    };
    setCustomTriggers(next);
    saveCustomTriggers(next);

    // Also deselect if it was selected
    const nextSelected = {
      ...selectedTriggers,
      [category]: selectedTriggers[category].filter((n) => n !== name),
    };
    setSelectedTriggers(nextSelected);
    saveSelectedTriggers(nextSelected);
  };

  // ─── Log modal opener ───────────────────────────────────────────────────────

  const openLogModal = async (category: CategoryKey, name: string) => {
    if (!user) return;
    const trigger = await getOrCreateSupabaseTrigger(category, name);
    if (trigger) {
      setSelectedTrigger(trigger);
      setShowLogModal(true);
    }
  };

  // ─── Derived active triggers (for "Your Active Triggers" section) ────────────

  const activeTriggers: { category: CategoryKey; name: string }[] = (
    Object.keys(PRESET_TRIGGERS) as CategoryKey[]
  ).flatMap((cat) =>
    selectedTriggers[cat].map((name) => ({ category: cat, name }))
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

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

        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(Object.keys(PRESET_TRIGGERS) as CategoryKey[]).map((cat) => (
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

        {/* Trigger chip grid */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-white font-medium mb-4">
            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Triggers
          </h2>
          <div className="flex flex-wrap gap-2">

            {/* Preset chips — toggleable */}
            {PRESET_TRIGGERS[selectedCategory].map((name) => {
              const isSelected = selectedTriggers[selectedCategory].includes(name);
              return (
                <button
                  key={name}
                  onClick={() => togglePreset(selectedCategory, name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-green-500/30 text-green-300 border border-green-500/50'
                      : 'bg-white/10 text-white/80 border border-white/10 hover:bg-white/20'
                  }`}
                >
                  {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                  {name}
                </button>
              );
            })}

            {/* Custom chips */}
            {customTriggers[selectedCategory].map((name) => {
              const isSelected = selectedTriggers[selectedCategory].includes(name);
              return (
                <div
                  key={name}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    isSelected
                      ? 'bg-green-500/30 text-green-300 border-green-500/50'
                      : 'bg-white/10 text-white/80 border-white/10'
                  }`}
                >
                  <button
                    onClick={() => togglePreset(selectedCategory, name)}
                    className="flex items-center gap-1.5"
                  >
                    {isSelected && <CheckCircle className="w-3.5 h-3.5" />}
                    {name}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCustomTrigger(selectedCategory, name);
                    }}
                    className="ml-1 text-white/40 hover:text-red-400 transition-colors"
                    aria-label={`Remove ${name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Inline add input or "Add Yours +" button */}
            {addingCategory === selectedCategory ? (
              <div className="flex items-center gap-1">
                <input
                  ref={addInputRef}
                  type="text"
                  value={newTriggerName}
                  onChange={(e) => setNewTriggerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmAddCustom();
                    if (e.key === 'Escape') {
                      setAddingCategory(null);
                      setNewTriggerName('');
                    }
                  }}
                  placeholder="Trigger name..."
                  maxLength={40}
                  className="px-3 py-2 bg-white/15 border border-blue-400/60 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none w-36"
                />
                <button
                  onClick={confirmAddCustom}
                  disabled={!newTriggerName.trim()}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-400 disabled:bg-white/10 disabled:text-white/30 text-white text-sm rounded-lg transition-all"
                >
                  Save
                </button>
                <button
                  onClick={() => { setAddingCategory(null); setNewTriggerName(''); }}
                  className="p-2 text-white/40 hover:text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAddInput(selectedCategory)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white/5 border border-dashed border-white/30 text-white/50 hover:bg-white/10 hover:text-white/80 hover:border-white/50 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Yours +
              </button>
            )}
          </div>
        </div>

        {/* Your Active Triggers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-medium">Your Active {getTerminology('Triggers')}</h2>
            <button
              onClick={() => {
                setJournalTrigger(allActiveTriggerNames[0] || 'Other');
                setShowJournalModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-medium rounded-full hover:bg-orange-500/30 transition-all"
            >
              <Flame className="w-3.5 h-3.5" />
              Log a Craving
            </button>
          </div>
          {activeTriggers.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <AlertTriangle className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/70">No triggers selected yet. Tap any chip above to add them.</p>
            </div>
          ) : (
            activeTriggers.map(({ category, name }) => {
              const record = triggers.find((t) => t.name === name && t.category === category);
              const activationCount = record?.activation_count ?? 0;
              const resistanceCount = record?.resistance_count ?? 0;
              const resistanceRate =
                activationCount > 0 ? Math.round((resistanceCount / activationCount) * 100) : 0;

              return (
                <div
                  key={`${category}-${name}`}
                  onClick={() => openLogModal(category, name)}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium">{name}</div>
                      <div className="text-white/60 text-sm capitalize">{category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-light text-white">{resistanceRate}%</div>
                      <div className="text-white/60 text-xs">Resistance</div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className="text-white/60">
                      Activated: <span className="text-white">{activationCount}</span>
                    </div>
                    <div className="text-white/60">
                      Resisted: <span className="text-green-400">{resistanceCount}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Craving journal entries */}
        {cravingJournal.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-white/50" />
              <h2 className="text-white/70 text-sm font-medium">Craving Journal</h2>
            </div>
            <div className="space-y-3">
              {cravingJournal.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white/8 rounded-2xl p-4 border border-white/10"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-white text-sm font-medium">{entry.triggerName}</span>
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < entry.intensity ? 'bg-orange-400' : 'bg-white/15'}`}
                          />
                        ))}
                        <span className="text-white/40 text-xs ml-1">intensity</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        entry.resisted
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {entry.resisted ? 'Resisted' : 'Gave in'}
                      </span>
                      <div className="text-white/30 text-xs mt-1.5">
                        {new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        {' · '}
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-white/45 text-xs leading-relaxed mt-2 italic">
                      "{entry.notes}"
                    </p>
                  )}
                </div>
              ))}
              {cravingJournal.length > 5 && (
                <p className="text-center text-white/30 text-xs">
                  +{cravingJournal.length - 5} more entries
                </p>
              )}
            </div>
          </div>
        )}
      </div>{/* end max-w-2xl */}

      {/* Craving Journal Modal */}
      {showJournalModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#001F3F] border border-white/20 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-light text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Log a Craving
              </h3>
              <button
                onClick={() => setShowJournalModal(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Trigger */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">What triggered it?</label>
                <select
                  value={journalTrigger}
                  onChange={(e) => setJournalTrigger(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-400/60"
                >
                  {allActiveTriggerNames.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Intensity */}
              <div>
                <label className="text-white/60 text-sm mb-3 block">
                  How intense was it? <span className="text-orange-300 font-medium">{journalIntensity}/5</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setJournalIntensity(n)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        journalIntensity >= n
                          ? 'bg-orange-500/30 text-orange-300 border border-orange-500/50'
                          : 'bg-white/8 text-white/30 border border-white/10'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Did you resist? */}
              <div>
                <label className="text-white/60 text-sm mb-3 block">Did you resist?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setJournalResisted(true)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      journalResisted === true
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-white/20 bg-white/10 hover:border-green-500/50'
                    }`}
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                    <div className="text-white text-sm font-medium">Yes — I held</div>
                  </button>
                  <button
                    onClick={() => setJournalResisted(false)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      journalResisted === false
                        ? 'border-red-500 bg-red-500/20'
                        : 'border-white/20 bg-white/10 hover:border-red-500/50'
                    }`}
                  >
                    <X className="w-6 h-6 text-red-400 mx-auto mb-1" />
                    <div className="text-white text-sm font-medium">No — I gave in</div>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">Notes (optional)</label>
                <textarea
                  value={journalNotes}
                  onChange={(e) => setJournalNotes(e.target.value)}
                  placeholder="What was happening? How did you handle it? Be honest with yourself…"
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-blue-400/60 resize-none h-24"
                />
              </div>

              <button
                onClick={saveJournalEntry}
                disabled={journalResisted === null}
                className="w-full py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-white/10 disabled:text-white/40 text-white rounded-xl font-medium transition-all"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Event Modal */}
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
