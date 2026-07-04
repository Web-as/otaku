import { useState } from 'react';
import { CreditCard, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { isStripeHostedCheckoutUrl } from '@/shared/stripe/safeStripeRedirect';

interface CheckoutFlowProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutFlow = ({ onSuccess, onCancel }: CheckoutFlowProps) => {
  const [selectedPlan, setSelectedPlan] = useState<'one_time' | 'subscription' | 'lifetime'>('one_time');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plans = [
    {
      id: 'one_time',
      name: 'One-Time Purchase',
      price: '€1',
      description: 'Lifetime access to current features',
      features: ['Full library access', 'AI assistant', 'All current features', 'One-time payment'],
    },
    {
      id: 'subscription',
      name: 'Monthly Subscription',
      price: '€5/mo',
      description: 'Ongoing access + new features',
      features: ['Everything in One-Time', 'Priority support', 'Early access to new features', 'Cancel anytime'],
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: '€50',
      description: 'Permanent access to all features',
      features: ['Everything in Subscription', 'Lifetime updates', 'VIP badge', 'Support development'],
    },
  ];

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create Stripe checkout session
      const response = await api.post('/api/v1/billing/checkout-session', {
        purchase_type: selectedPlan,
      });

      const { url } = response.data;

      if (!isStripeHostedCheckoutUrl(url)) {
        throw new Error('Invalid checkout URL returned by server');
      }

      window.location.assign(url);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create checkout session');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-gray-400">Select the plan that works best for you</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id as any)}
            className={`text-left p-6 rounded-lg border-2 transition ${
              selectedPlan === plan.id
                ? 'border-violet-500 bg-violet-500/10'
                : 'border-gray-800 bg-gray-900 hover:border-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <p className="text-2xl font-black text-violet-400">{plan.price}</p>
              </div>
              {selectedPlan === plan.id && (
                <div className="w-6 h-6 bg-violet-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
            <ul className="space-y-2">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
        >
          Cancel
        </button>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Continue to Payment
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutFlow;
