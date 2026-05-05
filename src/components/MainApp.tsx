import { useState } from 'react';
import { Gauge, AlertTriangle, Leaf, TrendingUp, DollarSign, Brain, Cpu, User, Activity } from 'lucide-react';
import { DashboardTab } from './tabs/DashboardTab';
import { TriggerMapperTab } from './tabs/TriggerMapperTab';
import { BotanicalTab } from './tabs/BotanicalTab';
import { ProgressTab } from './tabs/ProgressTab';
import { SavingsTab } from './tabs/SavingsTab';
import { WellnessHubTab } from './tabs/WellnessHubTab';
import { NovaTab } from './tabs/NovaTab';
import { ProfileSettingsTab } from './tabs/ProfileSettingsTab';
import { BodyTransformationTab } from './tabs/BodyTransformationTab';
import { EmergencyButton } from './emergency/EmergencyButton';
import { SomaticResetModal } from './emergency/SomaticResetModal';
import { useStealth } from '../contexts/StealthContext';

type Tab = 'dashboard' | 'triggers' | 'botanical' | 'progress' | 'savings' | 'wellness' | 'nova' | 'profile' | 'body';

export function MainApp() {
  const { appDisplayName, getTerminology } = useStealth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showEmergency, setShowEmergency] = useState(false);

  const tabs = [
    { id: 'dashboard' as Tab, icon: Gauge, label: 'Dashboard' },
    { id: 'triggers' as Tab, icon: AlertTriangle, label: getTerminology('Triggers') },
    { id: 'progress' as Tab, icon: TrendingUp, label: 'Progress' },
    { id: 'savings' as Tab, icon: DollarSign, label: 'Savings' },
    { id: 'wellness' as Tab, icon: Brain, label: 'Wellness' },
    { id: 'botanical' as Tab, icon: Leaf, label: 'Botanical' },
    { id: 'body' as Tab, icon: Activity, label: 'Body' },
    { id: 'nova' as Tab, icon: Cpu, label: 'Nova' },
    { id: 'profile' as Tab, icon: User, label: 'Settings' },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#001F3F]">
      <div className="bg-[#001F3F] border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white text-xl font-light tracking-wide">{appDisplayName}</h1>
        </div>
      </div>

      <EmergencyButton onClick={() => setShowEmergency(true)} />

      {activeTab === 'dashboard' && <DashboardTab />}
      {activeTab === 'triggers' && <TriggerMapperTab />}
      {activeTab === 'botanical' && <BotanicalTab />}
      {activeTab === 'progress' && <ProgressTab />}
      {activeTab === 'savings' && <SavingsTab />}
      {activeTab === 'wellness' && <WellnessHubTab />}
      {activeTab === 'nova' && <NovaTab />}
      {activeTab === 'body' && <BodyTransformationTab />}
      {activeTab === 'profile' && <ProfileSettingsTab />}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#001F3F] border-t border-white/10 px-2 py-2 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex justify-between items-center gap-1">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center justify-center px-2 py-2 rounded-xl transition-all min-w-[60px] ${
                activeTab === id
                  ? 'text-blue-400 bg-blue-500/20'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showEmergency && <SomaticResetModal onClose={() => setShowEmergency(false)} />}
    </div>
  );
}
