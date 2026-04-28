import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Crown, Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StealthProvider } from './contexts/StealthContext';
import { UpgradeProvider, useUpgrade } from './contexts/UpgradeContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { SplashScreen } from './components/SplashScreen';
import { MainApp } from './components/MainApp';
import { UpgradeModal } from './components/UpgradeModal';

function WelcomeProBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] p-6">
      <div className="bg-gradient-to-b from-[#001a35] to-[#001F3F] border border-yellow-500/30 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/40">
          <Crown className="w-10 h-10 text-white" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-400 text-xs font-semibold tracking-wider uppercase">Welcome to Pro</span>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-3">You're all set!</h2>
        <p className="text-white/70 text-sm leading-relaxed mb-6">
          Your 7-day free trial has started. Enjoy full access to Botanical Apothecary, AI
          transformation visuals, and all premium features.
        </p>
        <div className="space-y-2 text-sm text-white/60 mb-8">
          <div className="flex items-center gap-2 justify-center">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Botanical Apothecary unlocked
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            AI Body Evolution Simulator unlocked
          </div>
          <div className="flex items-center gap-2 justify-center">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            Priority Nova AI responses unlocked
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-yellow-500/25"
        >
          Start Exploring
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const { isUpgradeOpen, closeUpgradeModal } = useUpgrade();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [showUpgradedBanner, setShowUpgradedBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('upgraded') === 'true') {
      setShowUpgradedBanner(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    } else {
      setHasCompletedOnboarding(null);
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    setHasCompletedOnboarding(onboardingCompleted === 'true');
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading || (user && hasCompletedOnboarding === null)) {
    return (
      <div className="min-h-screen bg-[#001F3F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingFlow onComplete={() => setHasCompletedOnboarding(true)} />;
  }

  console.log('[AppContent] render — isUpgradeOpen:', isUpgradeOpen);

  return (
    <>
      <MainApp />
      {isUpgradeOpen && createPortal(
        <UpgradeModal onClose={closeUpgradeModal} />,
        document.body
      )}
      {showUpgradedBanner && createPortal(
        <WelcomeProBanner onDismiss={() => setShowUpgradedBanner(false)} />,
        document.body
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <StealthProvider>
        <UpgradeProvider>
          <AppContent />
        </UpgradeProvider>
      </StealthProvider>
    </AuthProvider>
  );
}

export default App;
