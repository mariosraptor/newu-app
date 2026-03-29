import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Calendar, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useStealth } from '../../contexts/StealthContext';

export function DashboardTab() {
  const { user } = useAuth();
  const { getTerminology } = useStealth();
  const [loading, setLoading] = useState(true);
  const [systemStability, setSystemStability] = useState(0);
  const [dopaminePoints, setDopaminePoints] = useState(0);
  const [daysClean, setDaysClean] = useState(0);
  const [nextMilestone, setNextMilestone] = useState('24 hours');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: journey } = await supabase
        .from('journeys')
        .select('quit_datetime')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (journey) {
        const quitDate = new Date(journey.quit_datetime);
        const now = new Date();
        const diffMs = now.getTime() - quitDate.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        setDaysClean(days);

        const stability = Math.min(100, Math.floor((days / 90) * 100));
        setSystemStability(stability);

        if (days < 1) setNextMilestone('24 hours');
        else if (days < 3) setNextMilestone('3 days');
        else if (days < 7) setNextMilestone('1 week');
        else if (days < 30) setNextMilestone('1 month');
        else if (days < 90) setNextMilestone('90 days');
        else setNextMilestone('6 months');
      }

      const { data: points } = await supabase.rpc('get_total_dopamine_points', {
        p_user_id: user.id,
      });

      if (points !== null) {
        setDopaminePoints(points);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-light text-white mb-2">System Status</h1>
          <p className="text-white/70">Performance Optimization Dashboard</p>
        </div>

        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-white/80 text-sm uppercase tracking-wider mb-4">
                {getTerminology('Sobriety')} Percentage
              </h2>
              <div className="relative w-48 h-48 mx-auto">
                <svg className="transform -rotate-90 w-48 h-48">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="#00D9FF"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(systemStability / 100) * 552.92} 552.92`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-light text-white">{systemStability}%</div>
                    <div className="text-white/60 text-sm mt-1">Stable</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-white/70 text-sm">
              System baseline established {daysClean} days ago
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-xl mb-4 mx-auto">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-white mb-1">{dopaminePoints}</div>
              <div className="text-white/60 text-sm">Dopamine Bank</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl mb-4 mx-auto">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-white mb-1">{daysClean}</div>
              <div className="text-white/60 text-sm">Days Online</div>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-medium">Next Milestone</div>
                <div className="text-white/60 text-sm">{nextMilestone}</div>
              </div>
            </div>
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (daysClean % 30) * 3.33)}%` }}
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h3 className="text-white font-medium mb-4">Bio-Clock Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Circadian Reset</span>
              <span className="text-green-400">Optimal</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Neural Adaptation</span>
              <span className="text-blue-400">In Progress</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Dopamine Regulation</span>
              <span className="text-yellow-400">Calibrating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
