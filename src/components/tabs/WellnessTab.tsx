import { useState, useEffect } from 'react';
import { Plus, Dumbbell, Music, TrendingUp, ChevronDown, ChevronUp, Crown, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUpgrade } from '../../contexts/UpgradeContext';
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

interface EasternTechnique {
  id: string;
  icon: string;
  kanji: string;
  title: string;
  subtitle: string;
  tagline: string;
  content: string;
  practice: string;
}

const EASTERN_TECHNIQUES: EasternTechnique[] = [
  {
    id: 'kaizen',
    icon: '📈',
    kanji: '改善',
    title: 'KAIZEN',
    subtitle: 'Continuous Improvement',
    tagline: '1% better every day',
    content: "Cold turkey fails 95% of the time. Kaizen works differently — small, incremental improvements compound into transformation. Instead of 'I will never smoke again', say 'Today I will smoke one less cigarette.' Then one less again tomorrow. The brain accepts small changes. It resists dramatic ones. Your addiction was built one small habit at a time. It will be dismantled the same way.",
    practice: 'Identify ONE small reduction you can make today. Not tomorrow. Today.',
  },
  {
    id: 'ikigai',
    icon: '🌸',
    kanji: '生き甲斐',
    title: 'IKIGAI',
    subtitle: 'Finding Your Purpose',
    tagline: 'Fill the void with something that matters',
    content: "Every addiction fills a void — boredom, pain, emptiness, disconnection. Ikigai asks: what is your reason for being? The intersection of what you love, what you're good at, what the world needs, and what you can be paid for. When you find your Ikigai, the addiction loses its grip because the void is filled with something real.",
    practice: 'Write down: 3 things you love. 3 things you\'re good at. 3 ways you could help others. Look for the overlap.',
  },
  {
    id: 'naikan',
    icon: '🪞',
    kanji: '内観',
    title: 'NAIKAN THERAPY',
    subtitle: 'Honest Self-Reflection',
    tagline: 'See yourself clearly without judgment',
    content: "Used in Japanese hospitals and prisons, Naikan asks three questions about every relationship in your life: What did I receive? What did I give? What trouble did I cause? This structured reflection breaks through denial — the addiction's greatest weapon — by replacing self-pity with honest accountability. Not guilt. Clarity.",
    practice: 'Spend 5 minutes reflecting on one relationship affected by your addiction. Answer the three questions honestly.',
  },
  {
    id: 'gaman',
    icon: '🏔️',
    kanji: '我慢',
    title: 'GAMAN',
    subtitle: 'Enduring with Dignity',
    tagline: 'Observe the craving. Don\'t react to it.',
    content: "Gaman is the Japanese art of enduring the seemingly unbearable with patience and dignity. When a craving hits, Gaman says: observe it. Feel it fully. Don't fight it, don't feed it. Just watch it like a cloud passing. Cravings peak at 20 minutes and always pass. Gaman is the practice of outlasting them without losing your dignity.",
    practice: 'Next craving — sit still. Set a timer for 20 minutes. Watch the craving like you\'re watching a film. You are not the craving. You are the observer.',
  },
  {
    id: 'wabisabi',
    icon: '🏺',
    kanji: '侘寂',
    title: 'WABI-SABI',
    subtitle: 'Embracing Imperfection',
    tagline: 'A relapse is not failure. It\'s part of the story.',
    content: "Wabi-Sabi is the Japanese acceptance of imperfection and impermanence. In recovery, perfectionism kills more people than relapses do. The belief that 'one slip means I've failed completely' is what causes people to give up entirely. Wabi-Sabi reframes: a crack in a bowl is filled with gold. A relapse is not the end of your story. It is part of it.",
    practice: 'If you slip: write down one thing you learned from it. That is your gold.',
  },
  {
    id: 'darc',
    icon: '🏯',
    kanji: 'ダルク',
    title: 'DARC',
    subtitle: 'Community as Medicine',
    tagline: 'You cannot do this alone. You were never meant to.',
    content: "DARC (Drug Addiction Rehabilitation Center) is Japan's most successful peer-led recovery model. The core insight: addiction is a disease of disconnection. The cure is connection. Not with therapists or doctors primarily — but with others who have been where you are and come back. Community is not a supplement to recovery. It is the recovery.",
    practice: 'Reach out to ONE person today. A friend, family member, or someone in a recovery community. Connection is medicine.',
  },
];

export function WellnessTab() {
  const { user } = useAuth();
  const { openUpgradeModal } = useUpgrade();
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
  const [isPremium, setIsPremium] = useState(false);
  const [expandedTechnique, setExpandedTechnique] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadActivities();
      checkPremiumStatus();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('subscription_status')
      .select('is_premium')
      .eq('user_id', user.id)
      .maybeSingle();
    setIsPremium(data?.is_premium || false);
  };

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

        {/* ── Eastern Recovery Methods ─────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden shadow-xl">

          {/* Section header */}
          <div className="bg-gradient-to-br from-[#0d1f3c] to-[#001a35] p-6 relative overflow-hidden">
            {/* Enso decoration */}
            <svg
              width="80" height="80"
              viewBox="0 0 80 80"
              className="absolute right-4 top-4 opacity-10 pointer-events-none"
              aria-hidden="true"
            >
              <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="3"
                strokeDasharray="180 40" strokeLinecap="round"
                transform="rotate(-30 40 40)" />
            </svg>

            <div className="flex items-start gap-3 mb-3">
              <span className="text-3xl leading-none">🏯</span>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight">Eastern Wisdom</h2>
                <p className="text-white/45 text-xs mt-0.5">Ancient Japanese methods proven by modern science</p>
              </div>
            </div>

            <div className="flex gap-1.5 text-base opacity-35 select-none">
              {'🌸 🌸 🌸 🌸 🌸'.split(' ').map((b, i) => (
                <span key={i}>{b}</span>
              ))}
            </div>
          </div>

          {/* Premium gate */}
          {!isPremium ? (
            <div className="bg-[#001a35] p-8 text-center border-t border-white/5">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-white/30" />
              </div>
              <h3 className="text-white font-semibold mb-1">Premium Feature</h3>
              <p className="text-white/40 text-sm mb-5 leading-relaxed">
                Unlock 6 science-backed Japanese recovery methods
              </p>
              <button
                onClick={openUpgradeModal}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Unlock with Pro
              </button>
            </div>
          ) : (
            <div className="bg-[#001a35] divide-y divide-white/5">
              {EASTERN_TECHNIQUES.map((technique) => {
                const isExpanded = expandedTechnique === technique.id;
                return (
                  <div key={technique.id}>
                    <button
                      onClick={() => setExpandedTechnique(isExpanded ? null : technique.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/5 transition-colors"
                    >
                      {/* Icon + kanji */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-2xl">
                          {technique.icon}
                        </div>
                        <span className="absolute -bottom-0.5 -right-1 text-[9px] text-white/20 font-medium select-none leading-none">
                          {technique.kanji}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-wrap mb-0.5">
                          <span className="text-white text-sm font-bold tracking-wider">{technique.title}</span>
                          <span className="text-white/25 text-[10px]">·</span>
                          <span className="text-white/40 text-[11px]">{technique.subtitle}</span>
                        </div>
                        <p className="text-amber-400/70 text-xs italic">{technique.tagline}</p>
                      </div>

                      <div className="text-white/30 flex-shrink-0 ml-2">
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5">
                        <p className="text-white/65 text-sm leading-relaxed mb-4">
                          {technique.content}
                        </p>
                        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
                          <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                            Practice
                          </p>
                          <p className="text-amber-200/80 text-sm leading-relaxed">
                            {technique.practice}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer blossoms */}
          <div className="bg-[#001218] px-5 py-3 flex justify-center gap-2 text-base opacity-15 select-none">
            {'🌸 🌸 🌸 🌸 🌸'.split(' ').map((b, i) => (
              <span key={i}>{b}</span>
            ))}
          </div>
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
