import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Plus, Check, Trash2 } from 'lucide-react';
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

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    // Load goals from localStorage
    try {
      const storedGoals = localStorage.getItem('newu_goals');
      if (storedGoals) {
        setBucketItems(JSON.parse(storedGoals));
      }
    } catch {
      setBucketItems([]);
    }

    // Read journey data from localStorage onboardingData
    try {
      const stored = localStorage.getItem('onboardingData');
      if (stored) {
        const onboarding = JSON.parse(stored);
        const quitDateStr = onboarding.quitDate;
        const dailyCosts = onboarding.dailyCosts || {};
        const totalDailyCost = Object.values(dailyCosts).reduce(
          (sum: number, v) => sum + Number(v),
          0
        );
        if (quitDateStr && totalDailyCost > 0) {
          const days = Math.max(
            0,
            Math.floor(
              (Date.now() - new Date(quitDateStr).getTime()) / (1000 * 60 * 60 * 24)
            )
          );
          setDaysClean(days);
          setDailyCost(totalDailyCost);
          setTotalSaved(days * totalDailyCost);
        }
      }
    } catch (e) {
      console.error('Failed to load savings data:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = (goals: BucketItem[]) => {
    try {
      localStorage.setItem('newu_goals', JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save goals:', e);
    }
    setBucketItems(goals);
  };

  const addBucketItem = () => {
    const title = newItem.title.trim();
    const cost = parseFloat(newItem.cost);

    if (!title || isNaN(cost) || cost <= 0) return;

    const newGoal: BucketItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title,
      description: '',
      cost,
      currency: 'USD',
      is_achieved: false,
    };

    let existing: BucketItem[] = [];
    try {
      const stored = localStorage.getItem('newu_goals');
      if (stored) existing = JSON.parse(stored);
    } catch {}

    saveGoals([newGoal, ...existing]);
    setNewItem({ title: '', cost: '' });
    setShowAddModal(false);
  };

  const toggleAchieved = (id: string) => {
    const updated = bucketItems.map((g) =>
      g.id === id ? { ...g, is_achieved: !g.is_achieved } : g
    );
    saveGoals(updated);
  };

  const deleteGoal = (id: string) => {
    saveGoals(bucketItems.filter((g) => g.id !== id));
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

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <div className="text-green-400 text-sm uppercase tracking-wider mb-2">Total Saved</div>
            <div className="text-5xl font-light text-white mb-2">${totalSaved.toFixed(2)}</div>
            <div className="text-white/70 text-sm">
              {daysClean} days × ${dailyCost.toFixed(2)}/day
            </div>
          </div>
        </div>

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
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="text-white font-medium text-lg mb-1 truncate">{item.title}</div>
                      <div className="text-white/60 text-sm">${item.cost.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleAchieved(item.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          item.is_achieved
                            ? 'bg-green-500 text-white'
                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                        }`}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteGoal(item.id)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
                  inputMode="decimal"
                  value={newItem.cost}
                  onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                  placeholder="399.99"
                  min="0.01"
                  step="0.01"
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
                disabled={!newItem.title.trim() || !newItem.cost || parseFloat(newItem.cost) <= 0}
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