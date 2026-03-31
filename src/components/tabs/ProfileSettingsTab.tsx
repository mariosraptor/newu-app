import { useState, useEffect, useRef } from 'react';
import { User, LogOut, Shield, Bell, Crown, Camera, Save, Share2, Copy, Users, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useStealth } from '../../contexts/StealthContext';

// ─── World countries ───────────────────────────────────────────────────────────

const WORLD_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
  "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
  "Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada",
  "Central African Republic","Chad","Chile","China","Colombia","Comoros",
  "Congo (DRC)","Congo (Republic)","Costa Rica","Croatia","Cuba","Cyprus",
  "Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia",
  "Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia",
  "Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran",
  "Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan",
  "Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho",
  "Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
  "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania",
  "Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro",
  "Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
  "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia",
  "Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea",
  "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino",
  "São Tomé and Príncipe","Saudi Arabia","Senegal","Serbia","Seychelles",
  "Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia",
  "South Africa","South Korea","South Sudan","Spain","Sri Lanka","Sudan",
  "Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
  "Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia",
  "Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu",
  "Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe",
];

// ─── Notification helpers ──────────────────────────────────────────────────────

interface NotifPrefs {
  enabled: boolean;
  time: string;          // "HH:MM"
  lastShownDate: string; // "YYYY-MM-DD"
}

const NOTIF_KEY = 'newu_notif_prefs';

function loadNotifPrefs(): NotifPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw) as NotifPrefs;
  } catch {}
  return { enabled: false, time: '09:00', lastShownDate: '' };
}

function saveNotifPrefs(prefs: NotifPrefs) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs)); } catch {}
}

function getQuitDate(): string | null {
  try {
    const raw = localStorage.getItem('onboardingData');
    if (raw) { const d = JSON.parse(raw); return d.quitDate ?? null; }
  } catch {}
  return null;
}

export function checkAndSendDailyNotification() {
  try {
    if (!('Notification' in window)) return;
    const prefs = loadNotifPrefs();
    if (!prefs.enabled || Notification.permission !== 'granted') return;

    const today = new Date().toISOString().split('T')[0];
    if (prefs.lastShownDate === today) return;

    const [h, m] = prefs.time.split(':').map(Number);
    const now = new Date();
    if (now.getHours() < h || (now.getHours() === h && now.getMinutes() < m)) return;

    const quitDate = getQuitDate();
    const daysClean = quitDate
      ? Math.max(0, Math.floor((Date.now() - new Date(quitDate).getTime()) / 86_400_000))
      : 0;

    const messages = [
      `Day ${daysClean} — You're still here. That takes courage. 💙`,
      `Your body has been healing for ${daysClean} day${daysClean !== 1 ? 's' : ''}. Keep going. 🌱`,
      `Nova is thinking of you. How are you feeling today?`,
      `${daysClean} day${daysClean !== 1 ? 's' : ''} strong. You're doing something remarkable. ⭐`,
      `Check in with yourself today. ${daysClean} days and counting. Keep going.`,
    ];

    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000);
    const body = messages[dayOfYear % messages.length];

    new Notification('NewU — Daily Check-in', { body, icon: '/favicon.ico' });

    prefs.lastShownDate = today;
    saveNotifPrefs(prefs);
  } catch {}
}

// ─── Profile settings component ───────────────────────────────────────────────

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

const deriveDisplayName = (details: PersonalDetails, emailFallback: string): string => {
  if (details.firstName.trim()) {
    return details.lastName.trim()
      ? `${details.firstName.trim()} ${details.lastName.trim()}`
      : details.firstName.trim();
  }
  return emailFallback;
};

export function ProfileSettingsTab() {
  const { user } = useAuth();
  const { stealthMode, appDisplayName, toggleStealthMode } = useStealth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  // Notification state
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(() => loadNotifPrefs());
  const [notifMessage, setNotifMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  // Check and send daily notification on tab open
  useEffect(() => {
    checkAndSendDailyNotification();
  }, []);

  const loadData = async () => {
    if (!user) return;

    const emailFallback = user.email?.split('@')[0] || 'User';

    let details = personalDetails;
    try {
      const stored = localStorage.getItem('personal_details');
      if (stored) {
        details = JSON.parse(stored) as PersonalDetails;
        setPersonalDetails(details);
      }
    } catch {}

    const storedPhoto = localStorage.getItem('profile_photo');
    if (storedPhoto) setProfilePhoto(storedPhoto);

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();

      if (details.firstName.trim()) {
        setDisplayName(deriveDisplayName(details, emailFallback));
      } else if (profileData?.display_name) {
        setDisplayName(profileData.display_name);
      } else {
        setDisplayName(emailFallback);
      }
    } catch {
      setDisplayName(deriveDisplayName(details, emailFallback));
    }

    try {
      const { data: subData } = await supabase
        .from('subscription_status')
        .select('is_premium')
        .eq('user_id', user.id)
        .maybeSingle();
      setIsPremium(subData?.is_premium || false);
    } catch {}

    setLoading(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (photoInputRef.current) photoInputRef.current.value = '';

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setProfilePhoto(base64);
      try { localStorage.setItem('profile_photo', base64); } catch {}
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDetails = async () => {
    try { localStorage.setItem('personal_details', JSON.stringify(personalDetails)); } catch {}

    const emailFallback = user?.email?.split('@')[0] || 'User';
    const newName = deriveDisplayName(personalDetails, emailFallback);
    setDisplayName(newName);

    if (user && personalDetails.firstName.trim()) {
      try {
        await supabase
          .from('profiles')
          .update({ display_name: newName })
          .eq('id', user.id);
      } catch {}
    }

    setSaveMessage('Details saved!');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  // ─── Notifications ───────────────────────────────────────────────────────────

  const handleToggleNotifications = async (enable: boolean) => {
    if (!('Notification' in window)) {
      setNotifMessage({ text: "Your browser doesn't support notifications.", type: 'error' });
      return;
    }

    if (enable) {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const updated = { ...notifPrefs, enabled: true };
        setNotifPrefs(updated);
        saveNotifPrefs(updated);
        setNotifMessage({
          text: `Daily check-ins enabled for ${formatTime(updated.time)}. See you tomorrow 💙`,
          type: 'success',
        });
        // Show a preview notification immediately
        try {
          new Notification('NewU — Notifications enabled!', {
            body: "You'll receive a daily check-in at your chosen time.",
            icon: '/favicon.ico',
          });
        } catch {}
      } else if (permission === 'denied') {
        setNotifMessage({
          text: "Notifications blocked by your browser. To enable: tap the lock icon in your address bar → Notifications → Allow.",
          type: 'error',
        });
      } else {
        setNotifMessage({
          text: 'Permission dismissed. Tap the toggle again when you\'re ready.',
          type: 'info',
        });
      }
    } else {
      const updated = { ...notifPrefs, enabled: false };
      setNotifPrefs(updated);
      saveNotifPrefs(updated);
      setNotifMessage(null);
    }
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...notifPrefs, time };
    setNotifPrefs(updated);
    saveNotifPrefs(updated);
    if (notifPrefs.enabled) {
      setNotifMessage({ text: `Daily check-in time updated to ${formatTime(time)} 💙`, type: 'success' });
      setTimeout(() => setNotifMessage(null), 3000);
    }
  };

  function formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  // ─── Clipboard / share ───────────────────────────────────────────────────────

  const handleCopyInviteLink = async () => {
    const inviteText = `I'm using NewU to become someone new. Join me at ${window.location.origin}`;
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteText);
        copied = true;
      }
    } catch {}

    if (!copied) {
      try {
        const ta = document.createElement('textarea');
        ta.value = inviteText;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {}
    }

    if (copied) {
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } else {
      alert(`Copy this link:\n\n${inviteText}`);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent("I'm using NewU to become someone new. Join me!");
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#001F3F]">
        <div className="text-white">Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Profile header */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full overflow-hidden border-2 border-blue-500/30">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-400" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center border-2 border-[#001F3F] cursor-pointer transition-all">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Camera className="w-4 h-4 text-white" />
            </label>
          </div>
          <h1 className="text-2xl font-light text-white mb-1">{displayName}</h1>
          <p className="text-white/60 text-sm">{user?.email}</p>
          <p className="text-white/40 text-xs mt-1">Tap the camera icon to change photo</p>
          {isPremium && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-full mt-4">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-medium">NewU Pro</span>
            </div>
          )}
        </div>

        <div className="space-y-4">

          {/* Refer a Friend */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="text-white font-medium">Refer a Friend</h2>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-white/70 text-sm">Help others on their journey to transformation</p>
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
                  Copied to clipboard!
                </div>
              )}
            </div>
          </div>

          {/* Personal Details */}
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
                      inputMode="decimal"
                      value={personalDetails.height}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, height: parseFloat(e.target.value) || 0 })}
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
                      inputMode="decimal"
                      value={personalDetails.weight}
                      onChange={(e) => setPersonalDetails({ ...personalDetails, weight: parseFloat(e.target.value) || 0 })}
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
                  {WORLD_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveDetails}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
              >
                <Save className="w-5 h-5" />
                Save Personal Details
              </button>
              {saveMessage && (
                <div className="text-center py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium">
                  {saveMessage}
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Security */}
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
              <div className={`w-12 h-7 rounded-full transition-all ${stealthMode ? 'bg-purple-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-all ${stealthMode ? 'ml-6' : 'ml-1'}`} />
              </div>
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <Bell className="w-5 h-5 text-blue-400" />
              <h2 className="text-white font-medium">Daily Notifications</h2>
            </div>

            {/* Toggle row */}
            <button
              onClick={() => handleToggleNotifications(!notifPrefs.enabled)}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">Daily Check-ins</div>
                  <div className="text-white/60 text-sm">
                    {notifPrefs.enabled
                      ? `Enabled · ${formatTime(notifPrefs.time)}`
                      : 'Get a daily motivational reminder'}
                  </div>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full transition-all ${notifPrefs.enabled ? 'bg-blue-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full mt-1 transition-all ${notifPrefs.enabled ? 'ml-6' : 'ml-1'}`} />
              </div>
            </button>

            {/* Time picker — shown when enabled */}
            {notifPrefs.enabled && (
              <div className="px-4 pb-4">
                <label className="text-white/60 text-sm mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Notification time
                </label>
                <input
                  type="time"
                  value={notifPrefs.time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-blue-400 text-base"
                />
                <p className="text-white/35 text-xs mt-2">
                  Messages like: "Day X — You're still here. That takes courage."
                </p>
              </div>
            )}

            {/* Feedback message */}
            {notifMessage && (
              <div
                className={`mx-4 mb-4 px-4 py-3 rounded-xl text-sm leading-relaxed ${
                  notifMessage.type === 'success'
                    ? 'bg-green-500/15 text-green-300 border border-green-500/20'
                    : notifMessage.type === 'error'
                    ? 'bg-red-500/15 text-red-300 border border-red-500/20'
                    : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                }`}
              >
                {notifMessage.text}
              </div>
            )}
          </div>

          {/* Premium upgrade */}
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
              <button className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all">
                Upgrade Now — $39.99/year
              </button>
            </div>
          )}

          {/* Sign Out */}
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
            <p>NewU v1.0 — Neuro-Optimization Suite</p>
            <p className="mt-1">Built for performance engineers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
