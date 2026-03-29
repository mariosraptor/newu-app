import { useState, useEffect } from 'react';
import { Plus, Target, DollarSign, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface BucketItem {
  id: string;
  title: string;
  description: string | null;
  cost: number;
  currency: string;
  is_achieved: boolean;
  achieved_at: string | null;
}

interface Journey {
  id: string;
  quit_datetime: string;
  daily_cost: number;
}

export function DreamsTab() {
  const { user } = useAuth();
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', description: '', cost: '' });

  useEffect(() => {
    if (user) {
      loadBucketItems();
      calculateSavings();
    }
  }, [user]);

  const loadBucketItems = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bucket_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBucketItems(data);
    }
  };

  const calculateSavings = async () => {
    if (!user) return;

    const { data: journeys } = await supabase
      .from('journeys')
      .select('quit_datetime, daily_cost')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (journeys && journeys.length > 0) {
      const earliestQuit = journeys.reduce((earliest, j) => {
        const quitTime = new Date(j.quit_datetime).getTime();
        return quitTime < earliest ? quitTime : earliest;
      }, new Date(journeys[0].quit_datetime).getTime());

      const hoursSince = (Date.now() - earliestQuit) / (1000 * 60 * 60);
      const saved = journeys.reduce((sum, j) => {
        return sum + (j.daily_cost * hoursSince) / 24;
      }, 0);

      setTotalSaved(saved);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newItem.title || !newItem.cost) return;

    const { error } = await supabase.from('bucket_items').insert({
      user_id: user.id,
      title: newItem.title,
      description: newItem.description || null,
      cost: parseFloat(newItem.cost),
      currency: 'USD',
    });

    if (!error) {
      setNewItem({ title: '', description: '', cost: '' });
      setShowAddForm(false);
      loadBucketItems();
    }
  };

  const handleAchieveItem = async (itemId: string) => {
    await supabase
      .from('bucket_items')
      .update({ is_achieved: true, achieved_at: new Date().toISOString() })
      .eq('id', itemId);

    loadBucketItems();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this dream?')) return;

    await supabase.from('bucket_items').delete().eq('id', itemId);
    loadBucketItems();
  };

  const getProgress = (cost: number) => {
    return Math.min((totalSaved / cost) * 100, 100);
  };

  const achievedItems = bucketItems.filter((item) => item.is_achieved);
  const activeItems = bucketItems.filter((item) => !item.is_achieved);

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-bold text-[#1A1A2A]">My Dreams</h1>
          <p className="text-[#6A7A9A]">Your savings make dreams real</p>
        </div>

        <div className="bg-gradient-to-br from-[#2ABA7A] to-[#1A8A5A] rounded-3xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Total Saved</h2>
          </div>
          <div className="text-5xl font-bold mb-1">${totalSaved.toFixed(2)}</div>
          <p className="text-white/80 text-sm">Every day adds to your dreams</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add New Dream
        </button>

        {showAddForm && (
          <form onSubmit={handleAddItem} className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                What's your dream?
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                placeholder="e.g., Weekend in Paris"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                Description (optional)
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors resize-none"
                placeholder="Tell more about this dream..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newItem.cost}
                onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                placeholder="0.00"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 bg-[#F8F9FC] text-[#6A7A9A] font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors"
              >
                Add Dream
              </button>
            </div>
          </form>
        )}

        {activeItems.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A2A]">Active Dreams</h2>
            {activeItems.map((item) => {
              const progress = getProgress(item.cost);
              const isAffordable = totalSaved >= item.cost;

              return (
                <div key={item.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#1A1A2A] mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-[#6A7A9A] mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="w-4 h-4 text-[#2A5ACA]" />
                        <span className="font-semibold text-[#1A1A2A]">
                          ${item.cost.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isAffordable && (
                        <button
                          onClick={() => handleAchieveItem(item.id)}
                          className="p-2 bg-[#2ABA7A] text-white rounded-lg hover:bg-[#1A8A5A] transition-colors"
                          title="Mark as achieved"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 bg-gray-100 text-[#6A7A9A] rounded-lg hover:bg-gray-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6A7A9A]">Progress</span>
                      <span className="font-semibold text-[#2A5ACA]">
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-[#F8F9FC] rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isAffordable
                            ? 'bg-[#2ABA7A]'
                            : 'bg-gradient-to-r from-[#2A5ACA] to-[#1f4ba3]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {isAffordable && (
                      <p className="text-sm text-[#2ABA7A] font-semibold text-center pt-1">
                        You can afford this dream now!
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {achievedItems.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A2A]">Achieved Dreams</h2>
            {achievedItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-[#2ABA7A] to-[#1A8A5A] rounded-2xl p-5 shadow-sm text-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-5 h-5" />
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="text-sm text-white/80 mb-2">{item.description}</p>
                    )}
                    <p className="text-sm text-white/80">
                      Achieved: {new Date(item.achieved_at!).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {bucketItems.length === 0 && (
          <div className="bg-white rounded-3xl p-12 shadow-sm text-center">
            <Target className="w-16 h-16 text-[#6A7A9A] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[#1A1A2A] mb-2">
              Start Building Your Dreams
            </h3>
            <p className="text-[#6A7A9A]">
              Add dreams to your bucket list and watch your savings bring them to life
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
