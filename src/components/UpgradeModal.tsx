import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Crown, Check } from 'lucide-react';
import { useUpgrade } from '../contexts/UpgradeContext';
import { useAuth } from '../contexts/AuthContext';

export function UpgradeModal() {
  const { isUpgradeOpen, closeUpgradeModal } = useUpgrade();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  if (!isUpgradeOpen) return null;

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan);
    const priceId = plan === 'monthly'
      ? import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID
      : import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID;
    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user?.id, userEmail: user?.email }),
      });
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setLoading(null);
    }
  };

  const features = [
    'Unlimited Nova AI conversations',
    'Full CBT Exercise Library',
    'Binaural frequency player',
    'Botanical Apothecary',
    'Unlimited savings goals',
    'Unlimited progress selfies',
    'AI body transformation visuals',
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#001F3F] to-[#003366] rounded-t-3xl sm:rounded-3xl w-full max-w-lg p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <h2 className="text-white text-xl font-bold">Unlock NewU Pro</h2>
          </div>
          <button onClick={closeUpgradeModal} className="text-white/60 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 space-y-2">
          {features.map(f => (
            <div key={f} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-white/80 text-sm">{f}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
            <div className="text-white/60 text-xs mb-1">MONTHLY</div>
            <div className="text-white text-2xl font-bold">$6.99</div>
            <div className="text-white/60 text-xs mb-3">per month</div>
            <div className="text-xs text-blue-400 mb-3">7-day free trial</div>
            <button
              onClick={() => handleCheckout('monthly')}
              disabled={loading !== null}
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              {loading === 'monthly' ? '...' : 'Start Trial'}
            </button>
          </div>

          <div className="bg-yellow-500/20 rounded-2xl p-4 border border-yellow-500/40 relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">BEST VALUE</div>
            <div className="text-yellow-400 text-xs mb-1">YEARLY</div>
            <div className="text-white text-2xl font-bold">$49.99</div>
            <div className="text-white/60 text-xs mb-1">per year</div>
            <div className="text-green-400 text-xs mb-1">Save 40%</div>
            <div className="text-xs text-blue-400 mb-2">7-day free trial</div>
            <button
              onClick={() => handleCheckout('yearly')}
              disabled={loading !== null}
              className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            >
              {loading === 'yearly' ? '...' : 'Start Trial'}
            </button>
          </div>
        </div>

        <p className="text-white/40 text-xs text-center">Cancel anytime. No commitment.</p>
      </div>
    </div>,
    document.body
  );
}
