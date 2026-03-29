import { useState, useEffect } from 'react';
import { LogOut, Award, DollarSign, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Profile {
  display_name: string;
  emergency_contact: string | null;
}

interface Journey {
  id: string;
  addiction_type: string;
  quit_datetime: string;
  my_why: string;
  daily_cost: number;
}

export function ProfileTab() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadJourneys();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
  };

  const loadJourneys = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('journeys')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (data && data.length > 0) {
      setJourneys(data);

      const earliestQuit = data.reduce((earliest, j) => {
        const quitTime = new Date(j.quit_datetime).getTime();
        return quitTime < earliest ? quitTime : earliest;
      }, new Date(data[0].quit_datetime).getTime());

      const daysSince = Math.floor(
        (Date.now() - earliestQuit) / (1000 * 60 * 60 * 24)
      );
      setTotalDays(daysSince);

      const hoursSince = (Date.now() - earliestQuit) / (1000 * 60 * 60);
      const saved = data.reduce((sum, j) => {
        return sum + (j.daily_cost * hoursSince) / 24;
      }, 0);
      setTotalSaved(saved);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <div className="w-20 h-20 bg-gradient-to-br from-[#2A5ACA] to-[#1f4ba3] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
            {profile?.display_name?.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A2A]">
            {profile?.display_name || 'User'}
          </h1>
          <p className="text-[#6A7A9A]">{user?.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <Clock className="w-8 h-8 text-[#2A5ACA] mx-auto mb-2" />
            <div className="text-3xl font-bold text-[#1A1A2A]">{totalDays}</div>
            <div className="text-sm text-[#6A7A9A] mt-1">Days Free</div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <DollarSign className="w-8 h-8 text-[#2ABA7A] mx-auto mb-2" />
            <div className="text-3xl font-bold text-[#1A1A2A]">
              ${totalSaved.toFixed(0)}
            </div>
            <div className="text-sm text-[#6A7A9A] mt-1">Saved</div>
          </div>
        </div>

        {journeys.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1A1A2A] mb-4">
              Active Journeys
            </h2>
            <div className="space-y-3">
              {journeys.map((journey) => (
                <div
                  key={journey.id}
                  className="p-4 bg-[#F8F9FC] rounded-xl"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[#1A1A2A] capitalize">
                      {journey.addiction_type}
                    </span>
                    <span className="text-sm text-[#6A7A9A]">
                      Since{' '}
                      {new Date(journey.quit_datetime).toLocaleDateString()}
                    </span>
                  </div>
                  {journey.my_why && (
                    <p className="text-sm text-[#6A7A9A] italic">
                      "{journey.my_why.slice(0, 100)}
                      {journey.my_why.length > 100 ? '...' : ''}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {journeys.length > 0 && journeys[0].my_why && (
          <div className="bg-gradient-to-br from-[#2A5ACA] to-[#1f4ba3] rounded-3xl p-6 shadow-sm text-white">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6" />
              <h2 className="text-lg font-semibold">My Why</h2>
            </div>
            <p className="text-white/90 leading-relaxed">
              {journeys[0].my_why}
            </p>
            <p className="text-white/70 text-sm mt-4 italic">
              This is your anchor. Your reason. Your north star.
            </p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#1A1A2A] mb-4">
            Account Settings
          </h2>

          <div className="space-y-3">
            <div className="p-4 bg-[#F8F9FC] rounded-xl">
              <label className="block text-sm font-medium text-[#1A1A2A] mb-1">
                Email
              </label>
              <p className="text-[#6A7A9A]">{user?.email}</p>
            </div>

            {profile?.emergency_contact && (
              <div className="p-4 bg-[#F8F9FC] rounded-xl">
                <label className="block text-sm font-medium text-[#1A1A2A] mb-1">
                  Emergency Contact
                </label>
                <p className="text-[#6A7A9A]">{profile.emergency_contact}</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-4 bg-[#E84A3A] text-white font-semibold rounded-xl hover:bg-[#d43b2c] transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>

        <div className="text-center pt-4">
          <p className="text-sm text-[#6A7A9A] italic">
            "You are already someone new. You just need time to catch up with
            yourself."
          </p>
          <p className="text-xs text-[#6A7A9A] mt-2">— Nova</p>
        </div>
      </div>
    </div>
  );
}
