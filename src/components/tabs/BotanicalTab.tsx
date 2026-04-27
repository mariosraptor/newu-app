import { useState, useEffect } from 'react';
import { useUpgrade } from '../../contexts/UpgradeContext';
import { Leaf, Lock, Crown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface BotanicalProtocol {
  id: string;
  addiction: string;
  herb: string;
  description: string;
  dosage: string;
  science: string;
  ritual: string;
}

const botanicalDatabase: BotanicalProtocol[] = [
  {
    id: '1',
    addiction: 'Nicotine',
    herb: 'Lobelia (Indian Tobacco)',
    description: 'Contains lobeline, which mimics nicotine without addiction',
    dosage: '50-100mg capsule during cravings',
    science: 'Binds to nicotinic receptors, reducing withdrawal symptoms by 40-60%',
    ritual: 'Take with deep breathing. Hold smoke craving for 90 seconds while lobeline works.',
  },
  {
    id: '2',
    addiction: 'Nicotine',
    herb: 'Mullein Leaf Tea',
    description: 'Lung repair herb that mimics the ritual of smoking',
    dosage: '1 cup, 3x daily',
    science: 'Expectorant properties clear tar buildup. Saponins reduce inflammation.',
    ritual: 'Brew slowly, inhale steam deeply. Meditate on lung restoration.',
  },
  {
    id: '3',
    addiction: 'Alcohol',
    herb: 'Kudzu Root Extract',
    description: 'Reduces alcohol cravings and binge drinking behavior',
    dosage: '1-2g before situations with alcohol',
    science: 'Puerarin and daidzin modulate GABA and dopamine, reducing desire by 50%',
    ritual: 'Take 30min before social events. Visualize sober confidence.',
  },
  {
    id: '4',
    addiction: 'Alcohol',
    herb: 'Milk Thistle + NAC',
    description: 'Liver regeneration and glutathione restoration',
    dosage: 'Milk Thistle 300mg + NAC 600mg, 2x daily',
    science: 'Silymarin protects hepatocytes. NAC restores glutathione depleted by ethanol.',
    ritual: 'Morning dose with lemon water. Evening dose with gratitude for body healing.',
  },
  {
    id: '5',
    addiction: 'Social Media',
    herb: 'Ashwagandha + L-Theanine',
    description: 'Reduces cortisol and anxiety that drives compulsive scrolling',
    dosage: 'Ashwagandha 300mg + L-Theanine 200mg, morning',
    science: 'Cortisol reduction of 28%. Alpha brain waves increase calm focus.',
    ritual: 'Take before first phone check. Replace scroll with 5-min breathwork.',
  },
  {
    id: '6',
    addiction: 'Nicotine',
    herb: 'Black Pepper Essential Oil',
    description: 'Inhalation reduces cigarette cravings instantly',
    dosage: '2-3 deep inhales from bottle during cravings',
    science: 'Caryophyllene activates CB2 receptors, mimicking nicotine throat sensation',
    ritual: 'Carry in pocket. When craving hits, 10 deep inhales + cold water.',
  },
];

export function BotanicalTab() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const { openUpgradeModal } = useUpgrade();
  const [loading, setLoading] = useState(true);
  const [selectedProtocol, setSelectedProtocol] = useState<BotanicalProtocol | null>(null);

  useEffect(() => {
    if (user) {
      checkPremiumStatus();
    }
  }, [user]);

  const checkPremiumStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('subscription_status')
      .select('is_premium')
      .eq('user_id', user.id)
      .maybeSingle();

    setIsPremium(data?.is_premium || false);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#001F3F]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-light text-white mb-2">Botanical Apothecary</h1>
            <p className="text-white/70 mb-6">Science-backed herbal interventions</p>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <Lock className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-white mb-3">Premium Feature</h2>
              <p className="text-white/70 mb-6">
                Access our complete database of botanical protocols, including dosing guides, scientific
                research, and ritual frameworks.
              </p>
              <div className="bg-white/10 rounded-xl p-4 mb-6">
                <div className="text-white font-medium mb-2">NewU Pro includes:</div>
                <ul className="text-white/70 text-sm space-y-2 text-left">
                  <li>• 50+ Botanical Protocols</li>
                  <li>• Personalized Herbal Stacks</li>
                  <li>• AI Body Transformation Visuals</li>
                  <li>• Advanced Progress Analytics</li>
                  <li>• Smartwatch Integration</li>
                </ul>
              </div>
              <button onClick={openUpgradeModal} className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all">
                Upgrade to NewU Pro - $39.99/year
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#001F3F] to-[#003366] pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-light text-white">Botanical Apothecary</h1>
          </div>
          <p className="text-white/70">Evidence-based natural interventions</p>
        </div>

        <div className="space-y-4">
          {botanicalDatabase.map((protocol) => (
            <div
              key={protocol.id}
              onClick={() => setSelectedProtocol(protocol)}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-5 border border-white/20 cursor-pointer hover:bg-white/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-green-400 text-sm font-medium mb-1">{protocol.addiction}</div>
                  <div className="text-white font-medium text-lg">{protocol.herb}</div>
                </div>
                <Leaf className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-white/70 text-sm">{protocol.description}</p>
            </div>
          ))}
        </div>
      </div>

      {selectedProtocol && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedProtocol(null)}
        >
          <div
            className="bg-[#001F3F] border border-white/20 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-green-400 text-sm">{selectedProtocol.addiction}</div>
                  <div className="text-white font-medium text-xl">{selectedProtocol.herb}</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-white/60 text-sm mb-2 uppercase tracking-wider">Description</div>
                <div className="text-white">{selectedProtocol.description}</div>
              </div>

              <div>
                <div className="text-white/60 text-sm mb-2 uppercase tracking-wider">Dosage Protocol</div>
                <div className="text-white bg-white/10 rounded-xl p-4">{selectedProtocol.dosage}</div>
              </div>

              <div>
                <div className="text-white/60 text-sm mb-2 uppercase tracking-wider">The Science</div>
                <div className="text-white/90 text-sm">{selectedProtocol.science}</div>
              </div>

              <div>
                <div className="text-white/60 text-sm mb-2 uppercase tracking-wider">Ritual Framework</div>
                <div className="text-white/90 text-sm italic bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                  {selectedProtocol.ritual}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedProtocol(null)}
              className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
