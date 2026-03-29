import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Heart, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getRelevantMilestones } from '../../lib/healthTimeline';

interface Journey {
  id: string;
  addiction_type: string;
  quit_datetime: string;
  daily_cost: number;
  currency: string;
  my_why: string;
}

const SCIENCE_FACTS = [
  'Your brain is physically rewiring through neuroplasticity. Every day of NewU reshapes neural pathways.',
  "A craving lasts exactly 90 seconds if you don't feed it. Just breathe for 90 seconds.",
  'Your HRV (Heart Rate Variability) is improving. Your nervous system is measurably healing.',
  'Dopamine receptors are healing. Your brain chemistry is restoring to normal.',
  'Your skin cells are regenerating faster without toxins. The glow is real.',
  'Sleep quality improves dramatically after quitting. REM sleep increases by up to 30%.',
  'Your immune system is strengthening. White blood cell count normalizes.',
  'Lung capacity can increase by 30% within just one month of quitting.',
];

export function HomeTab() {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [timeStats, setTimeStats] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [totalSaved, setTotalSaved] = useState(0);
  const [scienceFact] = useState(SCIENCE_FACTS[Math.floor(Math.random() * SCIENCE_FACTS.length)]);
  const [mood, setMood] = useState<string | null>(null);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadJourneys();
      loadTodayCheckin();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateTimeStats();
    }, 1000);

    return () => clearInterval(interval);
  }, [journeys]);

  const loadJourneys = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (data) {
      setJourneys(data);
    }
  };

  const loadTodayCheckin = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('checkin_date', today)
      .maybeSingle();

    setTodayCheckin(data);
    if (data) {
      setMood(data.mood);
    }
  };

  const updateTimeStats = () => {
    if (journeys.length === 0) return;

    const earliestQuit = journeys.reduce((earliest, j) => {
      const quitTime = new Date(j.quit_datetime).getTime();
      return quitTime < earliest ? quitTime : earliest;
    }, new Date(journeys[0].quit_datetime).getTime());

    const now = Date.now();
    const diff = now - earliestQuit;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeStats({ days, hours, minutes, seconds });

    const totalHours = diff / (1000 * 60 * 60);
    const saved = journeys.reduce((sum, j) => {
      return sum + (j.daily_cost * totalHours) / 24;
    }, 0);
    setTotalSaved(saved);
  };

  const handleMoodSelect = async (selectedMood: string) => {
    if (!user) return;

    setMood(selectedMood);

    const today = new Date().toISOString().split('T')[0];

    if (todayCheckin) {
      await supabase
        .from('daily_checkins')
        .update({ mood: selectedMood })
        .eq('id', todayCheckin.id);
    } else {
      const { data } = await supabase
        .from('daily_checkins')
        .insert({
          user_id: user.id,
          mood: selectedMood,
          checkin_date: today,
        })
        .select()
        .single();

      setTodayCheckin(data);
    }
  };

  const getHealthProgress = () => {
    if (journeys.length === 0) return null;

    const earliestQuit = journeys.reduce((earliest, j) => {
      const quitTime = new Date(j.quit_datetime).getTime();
      return quitTime < earliest ? quitTime : earliest;
    }, new Date(journeys[0].quit_datetime).getTime());

    const hoursSince = (Date.now() - earliestQuit) / (1000 * 60 * 60);
    const addictionTypes = journeys.map((j) => j.addiction_type);

    return getRelevantMilestones(hoursSince, addictionTypes);
  };

  const healthProgress = getHealthProgress();

  const moods = [
    { id: 'strong', label: 'Strong', emoji: '💪', color: 'bg-[#2ABA7A]' },
    { id: 'good', label: 'Good', emoji: '😊', color: 'bg-[#2A5ACA]' },
    { id: 'struggling', label: 'Struggling', emoji: '😔', color: 'bg-[#F59E0B]' },
    { id: 'need_help', label: 'Need Help', emoji: '🆘', color: 'bg-[#E84A3A]' },
  ];

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-bold text-[#1A1A2A]">Your Journey</h1>
          <p className="text-[#6A7A9A]">Every second is progress</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
          <h2 className="text-lg font-semibold text-[#6A7A9A] mb-4">Time Free</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-4xl font-bold text-[#2A5ACA]">{timeStats.days}</div>
              <div className="text-sm text-[#6A7A9A] mt-1">Days</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2A5ACA]">{timeStats.hours}</div>
              <div className="text-sm text-[#6A7A9A] mt-1">Hours</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2A5ACA]">{timeStats.minutes}</div>
              <div className="text-sm text-[#6A7A9A] mt-1">Minutes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#2A5ACA]">{timeStats.seconds}</div>
              <div className="text-sm text-[#6A7A9A] mt-1">Seconds</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2ABA7A] to-[#1A8A5A] rounded-3xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Money Saved</h2>
          </div>
          <div className="text-5xl font-bold mb-1">${totalSaved.toFixed(2)}</div>
          <p className="text-white/80 text-sm">Your dreams are getting closer</p>
        </div>

        {healthProgress && (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-6 h-6 text-[#E84A3A]" />
              <h2 className="text-lg font-semibold text-[#1A1A2A]">Health Recovery</h2>
            </div>

            {healthProgress.current && (
              <div className="mb-4 p-4 bg-[#EEF2FF] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-[#2ABA7A] rounded-full"></div>
                  <span className="text-sm font-semibold text-[#2ABA7A]">Current</span>
                </div>
                <p className="font-semibold text-[#1A1A2A] mb-1">
                  {healthProgress.current.title}
                </p>
                <p className="text-sm text-[#6A7A9A]">{healthProgress.current.description}</p>
              </div>
            )}

            {healthProgress.next && (
              <div className="p-4 bg-[#F8F9FC] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-[#2A5ACA] rounded-full"></div>
                  <span className="text-sm font-semibold text-[#2A5ACA]">Coming Next</span>
                </div>
                <p className="font-semibold text-[#1A1A2A] mb-1">{healthProgress.next.title}</p>
                <p className="text-sm text-[#6A7A9A]">{healthProgress.next.description}</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A1A2A] mb-4">How are you feeling today?</h2>
          <div className="grid grid-cols-2 gap-3">
            {moods.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMoodSelect(m.id)}
                className={`p-4 rounded-xl transition-all ${
                  mood === m.id
                    ? `${m.color} text-white shadow-md`
                    : 'bg-[#F8F9FC] text-[#1A1A2A] hover:bg-[#EEF2FF]'
                }`}
              >
                <div className="text-3xl mb-2">{m.emoji}</div>
                <div className="font-semibold text-sm">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#2A5ACA] to-[#1f4ba3] rounded-3xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Science Says</h2>
          </div>
          <p className="text-white/90 leading-relaxed">{scienceFact}</p>
        </div>

        {timeStats.days >= 1 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
            <Award className="w-12 h-12 text-[#F59E0B] mx-auto mb-3" />
            <h3 className="text-xl font-bold text-[#1A1A2A] mb-2">
              {timeStats.days} Day{timeStats.days !== 1 ? 's' : ''} Strong
            </h3>
            <p className="text-[#6A7A9A]">You are becoming someone new</p>
          </div>
        )}
      </div>
    </div>
  );
}
