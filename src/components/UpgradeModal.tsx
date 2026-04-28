import { useState } from 'react';
import { Crown, X, Check, Sparkles, Zap, Leaf, TrendingUp, Brain, Shield, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
  onClose: () => void;
}

const MONTHLY_PRICE_ID = import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID as string;
const YEARLY_PRICE_ID = import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID as string;

const features = [
  { icon: Leaf, text: 'Botanical Apothecary — 50+ herbal protocols' },
  { icon: TrendingUp, text: 'AI Body Evolution Simulator' },
  { icon: Brain, text: 'Priority Nova AI responses' },
  { icon: Zap, text: 'Advanced progress analytics' },
  { icon: Shield, text: 'Smartwatch gesture detection' },
];

export function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { user } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [error, setError] = useState('');

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    if (!user) return;
    setLoadingPlan(plan);
    setError('');

    const priceId = plan === 'monthly' ? MONTHLY_PRICE_ID : YEARLY_PRICE_ID;

    try {
      const res = await fetch('/.netlify/functions/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center z-[60] p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-[#001a35] to-[#001F3F] border border-white/20 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[96vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-2">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/40 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">7-Day Free Trial</span>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-yellow-500/30">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">Unlock NewU Pro</h2>
            <p className="text-white/55 text-sm">Start free for 7 days · Cancel anytime</p>
          </div>
        </div>

        {/* Feature list */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 gap-2">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <div className="w-6 h-6 bg-green-500/15 rounded-md flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-white/80 text-sm flex-1">{text}</span>
                <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-white/10" />

        {/* Plan cards */}
        <div className="px-6 py-4 space-y-3">

          {/* Monthly card */}
          <div className="relative bg-white/5 border border-white/15 rounded-2xl p-5 hover:bg-white/8 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full mb-2">
                  <span className="text-blue-400 text-[11px] font-semibold">Most Flexible</span>
                </div>
                <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Monthly</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-3xl font-bold">$6.99</span>
                  <span className="text-white/50 text-sm">/ month</span>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/15 rounded-lg">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-[11px] font-medium">7-day free trial</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCheckout('monthly')}
              disabled={loadingPlan !== null}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {loadingPlan === 'monthly' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting…
                </span>
              ) : (
                'Start Monthly Trial — $6.99/mo'
              )}
            </button>
          </div>

          {/* Yearly card — highlighted */}
          <div className="relative bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-2 border-yellow-500/50 rounded-2xl p-5 shadow-lg shadow-yellow-500/10">
            {/* Best value badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/30">
                <Star className="w-3 h-3 text-white fill-white" />
                <span className="text-white text-[11px] font-bold tracking-wide uppercase">Best Value · Save 40%</span>
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            </div>

            <div className="flex items-start justify-between mb-4 mt-1">
              <div>
                <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Yearly</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-white text-3xl font-bold">$49.99</span>
                  <span className="text-white/50 text-sm">/ year</span>
                </div>
                <div className="text-yellow-400 text-xs font-medium mt-0.5">$4.17 / month · save $33.89</div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-[11px] font-medium">7-day free trial</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCheckout('yearly')}
              disabled={loadingPlan !== null}
              className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/30"
            >
              {loadingPlan === 'yearly' ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 fill-white" />
                  Start Yearly Trial — $49.99/yr
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Error & fine print */}
        <div className="px-6 pb-6 pt-1">
          {error && (
            <div className="mb-3 px-4 py-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          <p className="text-center text-white/35 text-xs">
            7 days free on both plans · No charge until trial ends · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
