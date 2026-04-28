import { useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Selfie {
  day: number;
  date: string;
  imageData: string;
}

export function ProgressTab() {
  const { user } = useAuth();
  const [selfies, setSelfies] = useState<Selfie[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysClean, setDaysClean] = useState(0);
  const [selectedSelfie, setSelectedSelfie] = useState<Selfie | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const { data: journeyData } = await supabase
      .from('journeys')
      .select('quit_datetime')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (journeyData) {
      const quitDate = new Date(journeyData.quit_datetime);
      const diffMs = Date.now() - quitDate.getTime();
      setDaysClean(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    } else {
      // Fallback to localStorage
      try {
        const raw = localStorage.getItem('onboardingData');
        if (raw) {
          const od = JSON.parse(raw);
          if (od.quitDate) {
            const diffMs = Date.now() - new Date(od.quitDate).getTime();
            setDaysClean(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
          }
        }
      } catch (_) { /* ignore */ }
    }

    loadSelfies();
    setLoading(false);
  };

  const loadSelfies = () => {
    const storedSelfies = localStorage.getItem('newu_selfies');
    if (storedSelfies) {
      try {
        const selfiesArray: Selfie[] = JSON.parse(storedSelfies);
        selfiesArray.sort((a, b) => b.day - a.day);
        setSelfies(selfiesArray);
      } catch (e) {
        console.error('Failed to parse selfies from localStorage:', e);
        setSelfies([]);
      }
    } else {
      setSelfies([]);
    }
  };

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newSelfie: Selfie = {
        day: daysClean,
        date: new Date().toLocaleDateString(),
        imageData: base64,
      };

      const storedSelfies = localStorage.getItem('newu_selfies');
      let selfiesArray: Selfie[] = [];
      if (storedSelfies) {
        try {
          selfiesArray = JSON.parse(storedSelfies);
        } catch (_) { /* ignore */ }
      }

      selfiesArray.unshift(newSelfie);
      localStorage.setItem('newu_selfies', JSON.stringify(selfiesArray));
      loadSelfies();
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
    };

    reader.readAsDataURL(file);
  };

  const deleteSelfie = (day: number) => {
    const storedSelfies = localStorage.getItem('newu_selfies');
    if (!storedSelfies) return;

    try {
      const selfiesArray: Selfie[] = JSON.parse(storedSelfies);
      const filteredSelfies = selfiesArray.filter((s) => s.day !== day);
      localStorage.setItem('newu_selfies', JSON.stringify(filteredSelfies));
      loadSelfies();
      setSelectedSelfie(null);
    } catch (e) {
      console.error('Failed to delete selfie:', e);
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
          <h1 className="text-3xl font-light text-white mb-2">Progress Visualization</h1>
          <p className="text-white/70">Track your physical transformation</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
          <label className="flex items-center justify-center gap-3 cursor-pointer">
            <input type="file" accept="image/*" onChange={handleSelfieUpload} className="hidden" />
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-medium">Capture Progress Selfie</div>
              <div className="text-white/60 text-sm">Day {daysClean}</div>
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-medium">Your Progress Timeline</h3>
          {selfies.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 text-center">
              <Camera className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/70">No selfies yet. Start documenting your journey today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {selfies.map((selfie) => (
                <div
                  key={selfie.day}
                  onClick={() => setSelectedSelfie(selfie)}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-3 border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
                >
                  <img
                    src={selfie.imageData}
                    alt={`Day ${selfie.day}`}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <div className="text-white text-sm font-medium">Day {selfie.day}</div>
                  <div className="text-white/60 text-xs">{selfie.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedSelfie && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSelfie(null)}
        >
          <div
            className="bg-[#001F3F] border border-white/20 rounded-2xl p-4 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-white font-medium text-lg">Day {selectedSelfie.day}</div>
                <div className="text-white/60 text-sm">{selectedSelfie.date}</div>
              </div>
              <button
                onClick={() => setSelectedSelfie(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={selectedSelfie.imageData}
              alt={`Day ${selectedSelfie.day}`}
              className="w-full aspect-square object-cover rounded-xl mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => deleteSelfie(selectedSelfie.day)}
                className="flex-1 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-all"
              >
                Delete Photo
              </button>
              <button
                onClick={() => setSelectedSelfie(null)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
