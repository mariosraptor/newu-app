import { useState, useEffect } from 'react';
import { User, LogOut, Shield, Bell, Crown, Camera, Save, Share2, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useStealth } from '../../contexts/StealthContext';
import { useUpgrade } from '../../contexts/UpgradeContext';

interface PersonalDetails {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  height: number;
  heightUnit: 'cm' | 'ft';
  weight: number;
  weightUnit: 'kg' | 'lbs';
  country: string;
}

export function ProfileSettingsTab() {
  const { user } = useAuth();
  const { stealthMode, appDisplayName, toggleStealthMode } = useStealth();
  const { openUpgradeModal } = useUpgrade();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    firstName: '',
    lastName: '',
    gender: 'Prefer not to say',
    dateOfBirth: '',
    height: 170,
    heightUnit: 'cm',
    weight: 70,
    weightUnit: 'kg',
    country: 'United States',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [profileData, subData] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
      supabase.from('subscription_status').select('is_premium').eq('user_id', user.id).maybeSingle(),
    ]);

    if (profileData.data && profileData.data.display_name) {
      setDisplayName(profileData.data.display_name);
    } else {
      setDisplayName(user.email?.split('@')[0] || 'User');
    }

    const storedPhoto = localStorage.getItem('profile_photo');
    if (storedPhoto) {
      setProfilePhoto(storedPhoto);
    }

    const storedDetails = localStorage.getItem('personal_details');
    if (storedDetails) {
      setPersonalDetails(JSON.parse(storedDetails));
    }

    setIsPremium(subData.data?.is_premium || false);
    setLoading(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfilePhoto(base64);
      localStorage.setItem('profile_photo', base64);
    };

    reader.readAsDataURL(file);
  };

  const handleSaveDetails = () => {
    localStorage.setItem('personal_details', JSON.stringify(personalDetails));
    alert('Personal details saved!');
  };

  const handleCopyInviteLink = async () => {
    const appUrl = window.location.origin;
    const inviteText = `I wanted to share something that's genuinely helping me. NewU is a recovery app that uses science, AI and real support tools to help people break addictions. If you or someone you know is struggling — this could change everything. Download it here at ${appUrl}`;

    try {
      await navigator.clipboard.writeText(inviteText);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareWhatsApp = () => {
    const whatsappText = encodeURIComponent("I wanted to share something that's genuinely helping me. NewU is a recovery app that uses science, AI and real support tools to help people break addictions. If you or someone you know is struggling — this could change everything. Download it here!");
    window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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
          <label className="relative inline-block cursor-pointer group">
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden border-2 border-blue-500/30 group-hover:border-blue-500 transition-all">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-blue-400" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
          </label>
          <h1 className="text-2xl font-light text-white mb-1">{displayName}</h1>
          <p className="text-white/60 text-sm">{user?.email}</p>
          {isPremium && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-full mt-4">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">NewU Pro</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-white font-medium">Personal Details</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">First Name</label>
                  <input
                    type="text"
                    value={personalDetails.firstName}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Last Name</label>
                  <input
                    type="text"
                    value={personalDetails.lastName}
                    onChange={(e) => setPersonalDetails({ ...personalDetails, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Gender</label>
                <select
                  value={personalDetails.gender}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, gender: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Date of Birth</label>
                <input
                  type="date"
                  value={personalDetails.dateOfBirth}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Height</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={personalDetails.height}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, height: parseFloat(e.target.value) })}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={personalDetails.heightUnit}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, heightUnit: e.target.value as 'cm' | 'ft' })}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="cm">cm</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Weight</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={personalDetails.weight}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, weight: parseFloat(e.target.value) })}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                    <select
                      value={personalDetails.weightUnit}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, weightUnit: e.target.value as 'kg' | 'lbs' })}
                      className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white/70 text-sm mb-2 block">Country</label>
                <select
                  value={personalDetails.country}
                  onChange={(e) => setPersonalDetails({ ...personalDetails, country: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Spain">Spain</option>
                  <option value="Italy">Italy</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                onClick={handleSaveDetails}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
              >
                <Save className="w-5 h-5" />
                Save Personal Details
              </button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-white font-medium">Privacy & Security</h2>
            </div>

            <button
              onClick={toggleStealthMode}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Stealth Mode</div>
                  <div className="text-white/60 text-sm">
                    {stealthMode ? `App shows as "${appDisplayName}"` : 'Currently disabled'}
                  </div>
                </div>
              </div>
              <div
                className={`w-12 h-7 rounded-full transition-all ${
                  stealthMode ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full mt-1 transition-all ${
                    stealthMode ? 'ml-6' : 'ml-1'
                  }`}
                />
              </div>
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-white font-medium">Notifications</h2>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Daily Check-ins</div>
                  <div className="text-white/60 text-sm">Remind me to log my progress</div>
                </div>
              </div>
              <div className="w-12 h-7 bg-white/20 rounded-full">
                <div className="w-5 h-5 bg-white rounded-full mt-1 ml-1" />
              </div>
            </div>
          </div>

          {!isPremium && (
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-6 h-6 text-yellow-400" />
                <h3 className="text-white font-medium text-lg">Upgrade to NewU Pro</h3>
              </div>
              <ul className="text-white/90 text-sm space-y-2 mb-6">
                <li>✓ Botanical Apothecary access</li>
                <li>✓ AI Body Transformation visuals</li>
                <li>✓ Advanced analytics & insights</li>
                <li>✓ Smartwatch gesture detection</li>
                <li>✓ Priority Nova AI responses</li>
              </ul>
              <button
                onClick={() => {
                  console.log('[ProfileSettingsTab] upgrade button clicked');
                  openUpgradeModal();
                }}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-medium transition-all"
              >
                Start Free Trial — Upgrade to Pro
              </button>
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-white font-medium">Help a Friend</h2>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-white/70 text-sm mb-4">
                Help others on their journey to transformation
              </p>
              <button
                onClick={handleCopyInviteLink}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
              >
                <Copy className="w-5 h-5" />
                Copy Invite Link
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all"
              >
                <Share2 className="w-5 h-5" />
                Share via WhatsApp
              </button>
              {showCopiedMessage && (
                <div className="text-center py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                  Copied!
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <button
              onClick={handleSignOut}
              className="w-full p-4 flex items-center gap-3 hover:bg-red-500/10 transition-all"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-left">
                <div className="text-red-400 font-medium">Sign Out</div>
                <div className="text-white/60 text-sm">Log out of your account</div>
              </div>
            </button>
          </div>

          <div className="text-center text-white/40 text-xs mt-8">
            <p>NewU v1.0 - Neuro-Optimization Suite</p>
            <p className="mt-1">Built for performance engineers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
