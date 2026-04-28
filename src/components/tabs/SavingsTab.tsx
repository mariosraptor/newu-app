import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Plus, Check, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BucketItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  currency: string;
  is_achieved: boolean;
}

export function SavingsTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [dailyCost, setDailyCost] = useState(0);
  const [daysClean, setDaysClean] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', cost: '' });
  const [editingDailyCost, setEditingDailyCost] = useState(false);
  const [dailyCostInput, setDailyCostInput] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load bucket list goals
    const storedGoals = localStorage.getItem('newu_goals');
    if (storedGoals) {
      try {
        const goals = JSON.parse(storedGoals);
        console.log('SavingsTab: loaded goals from localStorage:', goals);
        setBucketItems(goals);
      } catch (e) {
        console.error('SavingsTab: failed to parse goals from localStorage:', e);
        setBucketItems([]);
      }
    } else {
      setBucketItems([]);
    }

    // ── Step 1: Try Supabase ──────────────────────────────────────────────────
    console.log('[SavingsTab] querying Supabase journeys for user', user.id);
    const { data: journeyData, error: journeyError } = await supabase
      .from('journeys')
      .select('quit_datetime, daily_cost')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    console.log('[SavingsTab] Supabase result →', { journeyData, journeyError });

    if (!journeyError && journeyData && journeyData.quit_datetime) {
      const parsedDailyCost = parseFloat(String(journeyData.daily_cost ?? 0));
      const days = Math.floor(
        (Date.now() - new Date(journeyData.quit_datetime).getTime()) / (1000 * 60 * 60 * 24)
      );
      console.log('[SavingsTab] Supabase path → days:', days, 'daily_cost:', parsedDailyCost, 'total:', days * parsedDailyCost);
      setDaysClean(days);
      setDailyCost(parsedDailyCost);
      setTotalSaved(days * parsedDailyCost);
      setLoading(false);
      return;
    }

    // ── Step 2: Fall back to localStorage['onboardingData'] ──────────────────
    // OnboardingFlow.tsx saves:  { quitDate: ISO string, dailyCosts: { smoking: 15 } }
    // We read:                   onboarding.quitDate  +  onboarding.dailyCosts
    console.log('[SavingsTab] no Supabase data — reading localStorage["onboardingData"]');
    const rawOnboarding = localStorage.getItem('onboardingData');
    console.log('[SavingsTab] raw onboardingData string:', rawOnboarding);

    if (rawOnboarding) {
      try {
        const onboarding = JSON.parse(rawOnboarding);
        console.log('[SavingsTab] parsed onboardingData:', JSON.stringify(onboarding, null, 2));

        // Key used by OnboardingFlow: "quitDate"
        const quitDateStr: string = onboarding.quitDate;
        console.log('[SavingsTab] quitDate value:', quitDateStr, '| type:', typeof quitDateStr);

        // Key used by OnboardingFlow: "dailyCosts" (object: { smoking: 15.5 })
        const dailyCostsMap: Record<string, number> = onboarding.dailyCosts ?? {};
        console.log('[SavingsTab] dailyCosts value:', JSON.stringify(dailyCostsMap));

        const totalDailyCost = Object.values(dailyCostsMap).reduce(
          (sum, v) => sum + (parseFloat(String(v)) || 0),
          0
        );
        console.log('[SavingsTab] computed totalDailyCost:', totalDailyCost);

        if (quitDateStr) {
          const quitMs = new Date(quitDateStr).getTime();
          const days = Math.floor((Date.now() - quitMs) / (1000 * 60 * 60 * 24));
          console.log('[SavingsTab] days clean:', days, '| total saved:', days * totalDailyCost);
          setDaysClean(days);
          setDailyCost(totalDailyCost);
          setTotalSaved(days * totalDailyCost);
        } else {
          console.warn('[SavingsTab] quitDate is missing from onboardingData');
        }
      } catch (e) {
        console.error('[SavingsTab] failed to parse onboardingData:', e);
      }
    } else {
      console.warn('[SavingsTab] localStorage["onboardingData"] is null — no journey data anywhere');
    }

    setLoading(false);
  };

  const saveDailyCost = () => {
    const parsed = parseFloat(dailyCostInput);
    if (isNaN(parsed) || parsed < 0) return;

    // Persist back into onboardingData so future loads pick it up
    const rawOnboarding = localStorage.getItem('onboardingData');
    if (rawOnboarding) {
      try {
        const onboarding = JSON.parse(rawOnboarding);
        const addictions: string[] = onboarding.addictions ?? ['default'];
        const key = addictions[0] ?? 'default';
        onboarding.dailyCosts = { [key]: parsed };
        localStorage.setItem('onboardingData', JSON.stringify(onboarding));
        console.log('[SavingsTab] saved daily cost', parsed, 'back to onboardingData');
      } catch (e) {
        console.error('[SavingsTab] failed to update onboardingData:', e);
      }
    }

    setDailyCost(parsed);
    setTotalSaved(daysClean * parsed);
    setEditingDailyCost(false);
    setDailyCostInput('');
  };

  const addBucketItem = () => {
    if (!user || !newItem.title || !newItem.cost) {
      console.log('Missing required fields:', { title: newItem.title, cost: newItem.cost });
      return;
    }

    console.log('Adding new goal:', newItem);

    const newGoal: BucketItem = {
      id: Date.now().toString(),
      title: newItem.title,
      description: '',
      cost: parseFloat(newItem.cost),
      currency: 'USD',
      is_achieved: false,
    };

    const storedGoals = localStorage.getItem('newu_goals');
    let goals: BucketItem[] = [];

    if (storedGoals) {
      try {
        goals = JSON.parse(storedGoals);
      } catch (e) {
        console.error('Failed to parse existing goals:', e);
      }
    }

    goals.unshift(newGoal);
    localStorage.setItem('newu_goals', JSON.stringify(goals));
    console.log('Saved goals to localStorage:', goals);

    setBucketItems(goals);
    setNewItem({ title: '', cost: '' });
    setShowAddModal(false);
  };

  const toggleAchieved = (item: BucketItem) => {
    console.log('Toggling achieved status for:', item);

    const storedGoals = localStorage.getItem('newu_goals');
    if (!storedGoals) return;

    try {
      const goals: BucketItem[] = JSON.parse(storedGoals);
      const updatedGoals = goals.map((goal) =>
        goal.id === item.id ? { ...goal, is_achieved: !goal.is_achieved } : goal
      );

      localStorage.setItem('newu_goals', JSON.stringify(updatedGoals));
      console.log('Updated goals in localStorage:', updatedGoals);
      setBucketItems(updatedGoals);
    } catch (e) {
      console.error('Failed to toggle achieved status:', e);
    }
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
          <h1 className="text-3xl font-light text-white mb-2">Savings Capital</h1>
          <p className="text-white/70">Track the financial freedom you're building</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-8 mb-4">
          <div className="text-center">
            <div className="text-green-400 text-sm uppercase tracking-wider mb-2">Total Saved</div>
            <div className="text-5xl font-light text-white mb-2">${totalSaved.toFixed(2)}</div>
            <div className="text-white/70 text-sm flex items-center justify-center gap-2">
              {daysClean} days × ${dailyCost.toFixed(2)}/day
              <button
                onClick={() => { setEditingDailyCost(true); setDailyCostInput(dailyCost > 0 ? String(dailyCost) : ''); }}
                className="text-white/40 hover:text-white/70 transition-colors"
                title="Edit daily cost"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Inline daily cost editor — shown when cost is 0 or user clicks edit */}
        {(dailyCost === 0 || editingDailyCost) && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6">
            <p className="text-yellow-400 text-sm font-medium mb-3">
              {dailyCost === 0
                ? 'Set your daily cost to track savings accurately'
                : 'Update your daily cost'}
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={dailyCostInput}
                  onChange={(e) => setDailyCostInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveDailyCost()}
                  placeholder="e.g. 15.00"
                  className="w-full pl-7 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-500 text-sm"
                  autoFocus
                />
              </div>
              <button
                onClick={saveDailyCost}
                className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-white rounded-xl text-sm font-semibold transition-all"
              >
                Save
              </button>
              {editingDailyCost && dailyCost > 0 && (
                <button
                  onClick={() => setEditingDailyCost(false)}
                  className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-medium text-lg">Your Bucket List</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>

        {bucketItems.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
            <DollarSign className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <p className="text-white/70 mb-4">No savings goals yet. What will you reward yourself with?</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all"
            >
              Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bucketItems.map((item) => {
              const progress = Math.min(100, (totalSaved / item.cost) * 100);
              return (
                <div
                  key={item.id}
                  className={`bg-white/10 backdrop-blur-lg rounded-2xl p-5 border transition-all ${
                    item.is_achieved
                      ? 'border-green-500/50 bg-green-500/10'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="text-white font-medium text-lg mb-1">{item.title}</div>
                      <div className="text-white/60 text-sm">${item.cost.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => toggleAchieved(item)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        item.is_achieved
                          ? 'bg-green-500 text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>

                  {!item.is_achieved && (
                    <>
                      <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">{progress.toFixed(1)}% funded</span>
                        <span className="text-green-400 font-medium">
                          ${Math.min(totalSaved, item.cost).toFixed(2)} / ${item.cost.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {item.is_achieved && (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      Goal Achieved!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#001F3F] border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-light text-white mb-6">Add Savings Goal</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white/70 text-sm mb-2 block">What do you want?</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  placeholder="e.g., Sony WH-1000XM5 Headphones"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Target Cost (USD)</label>
                <input
                  type="number"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                  placeholder="399.99"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({ title: '', cost: '' });
                }}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={addBucketItem}
                disabled={!newItem.title || !newItem.cost}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/40 text-white rounded-xl font-medium transition-all"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
