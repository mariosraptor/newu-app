import { useState, useEffect } from 'react';
import { Plus, Dumbbell, Music, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Activity {
  id: string;
  activity_type: string;
  activity_name: string;
  duration_minutes: number | null;
  vitality_points: number;
  logged_at: string;
}

const ACTIVITY_TYPES = [
  { id: 'gym', label: 'Gym/Workout', icon: '💪' },
  { id: 'walking', label: 'Walking', icon: '🚶' },
  { id: 'running', label: 'Running', icon: '🏃' },
  { id: 'meditation', label: 'Meditation', icon: '🧘' },
  { id: 'frequency', label: 'Frequency Listening', icon: '🎵' },
  { id: 'tea', label: 'Herbal Tea', icon: '🍵' },
  { id: 'cold_shower', label: 'Cold Shower', icon: '🚿' },
  { id: 'healthy_meal', label: 'Healthy Meal', icon: '🥗' },
  { id: 'sleep', label: 'Quality Sleep', icon: '😴' },
  { id: 'social', label: 'Positive Social', icon: '👥' },
  { id: 'creative', label: 'Creative Activity', icon: '🎨' },
  { id: 'custom', label: 'Other', icon: '⭐' },
];

const FREQUENCIES = [
  {
    id: '432hz',
    name: '432 Hz - Nature Alignment',
    description: 'Nature alignment, calm, stress reduction',
    color: 'from-green-500 to-teal-500',
  },
  {
    id: '528hz',
    name: '528 Hz - Cellular Healing',
    description: 'Cellular healing, transformation',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '396hz',
    name: '396 Hz - Fear Release',
    description: 'Fear and anxiety release',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: '963hz',
    name: '963 Hz - Clarity',
    description: 'Clarity and higher awareness',
    color: 'from-yellow-500 to-orange-500',
  },
];

export function WellnessTab() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: '',
    name: '',
    duration: '',
  });
  const [vitalityScore, setVitalityScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrequency, setCurrentFrequency] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(20);

    if (data) {
      setActivities(data);
      const total = data.reduce((sum, a) => sum + a.vitality_points, 0);
      setVitalityScore(total);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newActivity.type) return;

    const activityType = ACTIVITY_TYPES.find((t) => t.id === newActivity.type);
    const name = newActivity.name || activityType?.label || 'Activity';

    const { error } = await supabase.from('activities').insert({
      user_id: user.id,
      activity_type: newActivity.type,
      activity_name: name,
      duration_minutes: newActivity.duration ? parseInt(newActivity.duration) : null,
      vitality_points: 10,
    });

    if (!error) {
      setNewActivity({ type: '', name: '', duration: '' });
      setShowAddForm(false);
      loadActivities();
    }
  };

  const handlePlayFrequency = (frequencyId: string) => {
    if (isPlaying && currentFrequency === frequencyId) {
      setIsPlaying(false);
      setCurrentFrequency(null);
    } else {
      setIsPlaying(true);
      setCurrentFrequency(frequencyId);
    }
  };

  const todayActivities = activities.filter((a) => {
    const activityDate = new Date(a.logged_at).toDateString();
    const today = new Date().toDateString();
    return activityDate === today;
  });

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-bold text-[#1A1A2A]">My Wellness</h1>
          <p className="text-[#6A7A9A]">Fill your life with what's better</p>
        </div>

        <div className="bg-gradient-to-br from-[#2A5ACA] to-[#1f4ba3] rounded-3xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Vitality Score</h2>
          </div>
          <div className="text-5xl font-bold mb-1">{vitalityScore}</div>
          <p className="text-white/80 text-sm">
            {todayActivities.length} activities today
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Music className="w-6 h-6 text-[#2A5ACA]" />
            <h2 className="text-lg font-semibold text-[#1A1A2A]">
              Frequency Healing
            </h2>
          </div>
          <p className="text-sm text-[#6A7A9A] mb-4">
            Calming frequencies for healing and transformation
          </p>

          <div className="space-y-3">
            {FREQUENCIES.map((freq) => (
              <button
                key={freq.id}
                onClick={() => handlePlayFrequency(freq.id)}
                className={`w-full p-4 rounded-xl transition-all ${
                  isPlaying && currentFrequency === freq.id
                    ? `bg-gradient-to-r ${freq.color} text-white shadow-md`
                    : 'bg-[#F8F9FC] text-[#1A1A2A] hover:bg-[#EEF2FF]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {isPlaying && currentFrequency === freq.id ? '⏸️' : '▶️'}
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">{freq.name}</div>
                    <div
                      className={`text-sm ${
                        isPlaying && currentFrequency === freq.id
                          ? 'text-white/80'
                          : 'text-[#6A7A9A]'
                      }`}
                    >
                      {freq.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {isPlaying && (
            <div className="mt-4 p-3 bg-[#EEF2FF] rounded-xl text-center">
              <p className="text-sm text-[#2A5ACA] font-medium">
                Note: Audio playback is simulated for demo purposes
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full py-4 bg-[#2ABA7A] text-white font-semibold rounded-xl hover:bg-[#1A8A5A] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Log Activity
        </button>

        {showAddForm && (
          <form
            onSubmit={handleAddActivity}
            className="bg-white rounded-3xl p-6 shadow-sm space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                Activity Type
              </label>
              <select
                value={newActivity.type}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, type: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                required
              >
                <option value="">Select activity...</option>
                {ACTIVITY_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            {newActivity.type === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                  Activity Name
                </label>
                <input
                  type="text"
                  value={newActivity.name}
                  onChange={(e) =>
                    setNewActivity({ ...newActivity, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                  placeholder="What did you do?"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1A1A2A] mb-2">
                Duration (minutes, optional)
              </label>
              <input
                type="number"
                min="0"
                value={newActivity.duration}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, duration: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#F8F9FC] border-2 border-transparent rounded-xl focus:outline-none focus:border-[#2A5ACA] transition-colors"
                placeholder="0"
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
                className="flex-1 py-3 bg-[#2ABA7A] text-white font-semibold rounded-xl hover:bg-[#1A8A5A] transition-colors"
              >
                Log Activity
              </button>
            </div>
          </form>
        )}

        {activities.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A2A]">Recent Activities</h2>
            {activities.map((activity) => {
              const activityType = ACTIVITY_TYPES.find(
                (t) => t.id === activity.activity_type
              );
              const isToday =
                new Date(activity.logged_at).toDateString() ===
                new Date().toDateString();

              return (
                <div
                  key={activity.id}
                  className={`p-4 rounded-xl ${
                    isToday ? 'bg-[#EEF2FF] border-2 border-[#2A5ACA]' : 'bg-white'
                  } shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{activityType?.icon || '⭐'}</div>
                      <div>
                        <div className="font-semibold text-[#1A1A2A]">
                          {activity.activity_name}
                        </div>
                        <div className="text-sm text-[#6A7A9A]">
                          {new Date(activity.logged_at).toLocaleString()}
                          {activity.duration_minutes &&
                            ` • ${activity.duration_minutes} min`}
                        </div>
                      </div>
                    </div>
                    <div className="text-[#2ABA7A] font-semibold">
                      +{activity.vitality_points}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activities.length === 0 && (
          <div className="bg-white rounded-3xl p-12 shadow-sm text-center">
            <Dumbbell className="w-16 h-16 text-[#6A7A9A] mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold text-[#1A1A2A] mb-2">
              Start Building Vitality
            </h3>
            <p className="text-[#6A7A9A]">
              Log positive activities and watch your vitality score grow
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
