import { useState, useEffect, useRef } from 'react';
import { Activity, Camera, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { healthTimeline } from '../../lib/healthTimeline';

export function BodyTab() {
  const { user } = useAuth();
  const [journeys, setJourneys] = useState<any[]>([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (user) {
      loadJourneys();
    }
  }, [user]);

  const loadJourneys = async () => {
    if (!user) return;

    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      const data = JSON.parse(onboardingData);
      const quitTime = new Date(data.quitDate).getTime();
      const hours = (Date.now() - quitTime) / (1000 * 60 * 60);
      setTimeElapsed(hours);
      setJourneys([{
        addiction_type: data.addictions.join(', '),
        quit_datetime: data.quitDate,
        is_active: true
      }]);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        setCapturedImage(imageData);
        localStorage.setItem('lastSelfie', imageData);
        localStorage.setItem('lastSelfieDate', new Date().toISOString());
        stopCamera();
      }
    }
  };

  useEffect(() => {
    const savedSelfie = localStorage.getItem('lastSelfie');
    if (savedSelfie) {
      setCapturedImage(savedSelfie);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const addictionTypes = journeys.map((j) => j.addiction_type);
  const relevantMilestones = healthTimeline.filter((m) =>
    m.addictionTypes.some((type) => addictionTypes.includes(type))
  );

  const achievedMilestones = relevantMilestones.filter((m) => m.hours <= timeElapsed);
  const upcomingMilestones = relevantMilestones.filter((m) => m.hours > timeElapsed);

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2 pt-4">
          <h1 className="text-3xl font-bold text-[#1A1A2A]">My Body</h1>
          <p className="text-[#6A7A9A]">Watch yourself heal</p>
        </div>

        <div className="bg-gradient-to-br from-[#2ABA7A] to-[#1A8A5A] rounded-3xl p-6 shadow-sm text-white">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-6 h-6" />
            <h2 className="text-lg font-semibold">Body Healing</h2>
          </div>
          <div className="text-5xl font-bold mb-1">
            {achievedMilestones.length}
          </div>
          <p className="text-white/80 text-sm">
            Milestones achieved • {upcomingMilestones.length} more ahead
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Camera className="w-6 h-6 text-[#2A5ACA]" />
            <h2 className="text-lg font-semibold text-[#1A1A2A]">
              Transformation Selfie
            </h2>
          </div>
          <div className="aspect-square bg-[#F8F9FC] rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="Transformation selfie"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Camera className="w-16 h-16 text-[#6A7A9A] mx-auto mb-3 opacity-50" />
                <p className="text-[#6A7A9A]">
                  Take weekly selfies to track your transformation
                </p>
              </div>
            )}
          </div>
          <button
            onClick={startCamera}
            className="w-full py-3 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors"
          >
            {capturedImage ? 'Take New Selfie' : 'Take Selfie'}
          </button>
        </div>

        {achievedMilestones.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A2A]">
              Achieved Milestones
            </h2>
            {achievedMilestones.reverse().slice(0, 5).map((milestone, index) => (
              <div
                key={index}
                className="bg-[#EEF2FF] border-2 border-[#2ABA7A] rounded-2xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#2ABA7A] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">✓</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A1A2A] mb-1">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-[#6A7A9A]">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {upcomingMilestones.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#1A1A2A]">Coming Up</h2>
            {upcomingMilestones.slice(0, 3).map((milestone, index) => (
              <div key={index} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#F8F9FC] border-2 border-[#2A5ACA] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#2A5ACA] text-lg">→</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1A1A2A] mb-1">
                      {milestone.title}
                    </h3>
                    <p className="text-sm text-[#6A7A9A]">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[#1A1A2A]">
                  Take Selfie
                </h2>
                <button
                  onClick={stopCamera}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-[#6A7A9A]" />
                </button>
              </div>

              <div className="relative aspect-square bg-black rounded-2xl overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <button
                onClick={capturePhoto}
                className="w-full py-4 bg-[#2A5ACA] text-white font-semibold rounded-xl hover:bg-[#1f4ba3] transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
