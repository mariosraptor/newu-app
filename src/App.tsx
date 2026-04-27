import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StealthProvider } from './contexts/StealthContext';
import { AuthScreen } from './components/auth/AuthScreen';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { SplashScreen } from './components/SplashScreen';
import { MainApp } from './components/MainApp';
import { UpgradeProvider } from './contexts/UpgradeContext';
import { UpgradeModal } from './components/UpgradeModal';

function AppContent() {
  const { user, loading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [showSplash, setShowSplash] = useState(true);

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

  return <MainApp />;
}

function App() {
  return (
    <AuthProvider>
      <StealthProvider>
        <AppContent />
      </StealthProvider>
    </AuthProvider>
  );
}

export default App;
