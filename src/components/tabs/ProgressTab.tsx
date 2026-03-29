import { useState, useEffect, useRef } from 'react';
import { Camera, TrendingUp, Crown, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Selfie {
  id: string;
  day: number;
  date: string;
  imageData: string;
}

// Compress image to JPEG at reduced size to avoid localStorage quota issues
const compressImage = (file: File, maxWidth = 800): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

export function ProgressTab() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [selfies, setSelfies] = useState<Selfie[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysClean, setDaysClean] = useState(0);
  const [selectedSelfie, setSelectedSelfie] = useState<Selfie | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [subData, journeyData] = await Promise.all([
        supabase.from('subscription_status').select('is_premium').eq('user_id', user.id).maybeSingle(),
        supabase
          .from('journeys')
          .select('quit_datetime')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle(),
      ]);

      setIsPremium(subData.data?.is_premium || false);

      if (journeyData.data) {
        const quitDate = new Date(journeyData.data.quit_datetime);
        const diffMs = Date.now() - quitDate.getTime();
        setDaysClean(Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24))));
      }
    } catch (e) {
      console.error('Failed to load progress data:', e);
    } finally {
      loadSelfies();
      setLoading(false);
    }
  };

  const loadSelfies = () => {
    try {
      const stored = localStorage.getItem('newu_selfies');
      if (stored) {
        const arr: Selfie[] = JSON.parse(stored);
        arr.sort((a, b) => b.day - a.day);
        setSelfies(arr);
      } else {
        setSelfies([]);
      }
    } catch {
      setSelfies([]);
    }
  };

  const handleSelfieUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Reset input so same file can be re-selected later
    if (fileInputRef.current) fileInputRef.current.value = '';

    try {
      const base64 = await compressImage(file);

      const newSelfie: Selfie = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        day: daysClean,
        date: new Date().toLocaleDateString(),
        imageData: base64,
      };

      let selfiesArray: Selfie[] = [];
      try {
        const stored = localStorage.getItem('newu_selfies');
        if (stored) selfiesArray = JSON.parse(stored);
      } catch {}

      selfiesArray.unshift(newSelfie);

      try {
        localStorage.setItem('newu_selfies', JSON.stringify(selfiesArray));
      } catch {
        // Quota exceeded — drop the oldest selfie and retry once
        selfiesArray = [newSelfie, ...selfiesArray.slice(1, -1)];
        try {
          localStorage.setItem('newu_selfies', JSON.stringify(selfiesArray));
        } catch (storageErr) {
          console.error('Storage quota exceeded even after pruning:', storageErr);
        }
      }

      loadSelfies();
    } catch (err) {
      console.error('Failed to process image:', err);
    }
  };

  const deleteSelfie = (id: string) => {
    try {
      const stored = localStorage.getItem('newu_selfies');
      if (!stored) return;
      const filtered: Selfie[] = JSON.parse(stored).filter((s: Selfie) => s.id !== id);
      localStorage.setItem('newu_selfies', JSON.stringify(filtered));
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
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleSelfieUpload}
              className="hidden"
            />
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="text-white font-medium">Capture Progress Selfie</div>
              <div className="text-white/60 text-sm">Day {daysClean}</div>
            </div>
          </label>
        </div>

        {!isPremium && (
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-6 h-6 text-yellow-400" />
              <div className="text-yellow-400 font-medium">Premium Feature</div>
            </div>
            <p className="text-white/90 text-sm mb-4">
              Upgrade to NewU Pro to unlock AI-powered transformation animations showing your body's
              recovery vs. deterioration timeline.
            </p>
            <button className="w-full py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg text-sm font-medium">
              Unlock AI Transformations
            </button>
          </div>
        )}

        {isPremium && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-6">
            <h3 className="text-white font-medium mb-4">AI Body Evolution Simulator</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <div className="text-red-400 text-sm font-medium mb-2">Continued Use Path</div>
                <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-red-400 transform rotate-180" />
                </div>
                <div className="text-white/60 text-xs mt-2">Shows projected decline</div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="text-green-400 text-sm font-medium mb-2">Recovery Path</div>
                <div className="aspect-square bg-white/5 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                </div>
                <div className="text-white/60 text-xs mt-2">Shows projected improvement</div>
              </div>
            </div>
            <div className="text-center text-white/60 text-xs mt-4">
              AI analysis placeholder - Upload more selfies to generate comparison
            </div>
          </div>
        )}

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
                  key={selfie.id}
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
                onClick={() => deleteSelfie(selectedSelfie.id)}
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
