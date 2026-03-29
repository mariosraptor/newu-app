import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface StealthContextType {
  stealthMode: boolean;
  appDisplayName: string;
  toggleStealthMode: () => void;
  getTerminology: (standard: string) => string;
}

const StealthContext = createContext<StealthContextType | undefined>(undefined);

const terminologyMap: Record<string, { standard: string; stealth: string }> = {
  dashboard: { standard: 'Dashboard', stealth: 'Work Dashboard' },
  craving: { standard: 'Craving', stealth: 'System Interference' },
  cravings: { standard: 'Cravings', stealth: 'System Interference' },
  relapse: { standard: 'Relapse', stealth: 'Calibration Error' },
  relapses: { standard: 'Relapses', stealth: 'Calibration Errors' },
  trigger: { standard: 'Trigger', stealth: 'System Alert' },
  triggers: { standard: 'Triggers', stealth: 'System Alerts' },
  recovery: { standard: 'Recovery', stealth: 'System Optimization' },
  sobriety: { standard: 'Sobriety', stealth: 'System Stability' },
};

export function StealthProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [stealthMode, setStealthMode] = useState(false);
  const [appDisplayName, setAppDisplayName] = useState('NewU');

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .select('stealth_mode, app_display_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setStealthMode(data.stealth_mode || false);
      setAppDisplayName(data.app_display_name || 'NewU');
    } else if (!error || error.code === 'PGRST116') {
      await supabase.from('user_preferences').insert({
        user_id: user.id,
        stealth_mode: false,
        app_display_name: 'Work Dashboard',
      });
    }
  };

  const toggleStealthMode = async () => {
    if (!user) return;

    const newStealthMode = !stealthMode;
    setStealthMode(newStealthMode);
    setAppDisplayName(newStealthMode ? 'Work Dashboard' : 'NewU');

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        stealth_mode: newStealthMode,
        app_display_name: newStealthMode ? 'Work Dashboard' : 'NewU',
      });
  };

  const getTerminology = (standard: string): string => {
    const key = standard.toLowerCase();
    const mapping = terminologyMap[key];
    if (!mapping) return standard;
    return stealthMode ? mapping.stealth : mapping.standard;
  };

  return (
    <StealthContext.Provider value={{ stealthMode, appDisplayName, toggleStealthMode, getTerminology }}>
      {children}
    </StealthContext.Provider>
  );
}

export function useStealth() {
  const context = useContext(StealthContext);
  if (context === undefined) {
    throw new Error('useStealth must be used within a StealthProvider');
  }
  return context;
}
