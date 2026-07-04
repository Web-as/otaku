import React from 'react';
import { Check, Sparkles, Lock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface PricingPageProps {
  onUpgrade: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onUpgrade }) => {
  const freeFeatures = [
    'Basic anime library',
    'Random chaotic view',
    'Simple search (title only)',
    'Limited to 50 items',
  ];

  const premiumFeatures = [
    'Unlimited anime library',
    'Organized & filtered views',
    'Advanced search & filters',
    'Sort by 9+ criteria',
    'Group by studio/genre/year',
    'Library statistics',
    'AI assistant access',
    'Community features',
    'Device sync',
    'Priority support',
  ];

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-400">
            Library Pass (~€2.50/mo) unlocks the member stacks. VIP is buyable; Super User is earn-only.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="relative">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-bold mb-2">€0</div>
              <p className="text-gray-400">Forever free</p>
            </div>

            <ul className="space-y-3 mb-8">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Button variant="outline" fullWidth disabled>
              Current Plan
            </Button>
          </Card>

          {/* Premium Tier */}
          <Card className="relative border-2 border-violet-500">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-1 rounded-full text-sm font-semibold">
                BEST VALUE
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-2">
                €1
                <span className="text-lg text-gray-400 font-normal">.00</span>
              </div>
              <p className="text-gray-400">One-time payment</p>
            </div>

            <ul className="space-y-3 mb-8">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="primary"
              fullWidth
              icon={Sparkles}
              onClick={onUpgrade}
            >
              Upgrade Now
            </Button>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <Card>
              <h3 className="font-bold text-lg mb-2">Can I buy Super User?</h3>
              <p className="text-gray-400">
                No. Super User unlocks only through your anime tracking career — milestones on the Membership hub.
              </p>
            </Card>

            <Card>
              <h3 className="font-bold text-lg mb-2">Can I try before buying?</h3>
              <p className="text-gray-400">
                Absolutely! The free tier lets you experience the platform. When you're ready for full organization and features, upgrade for just €1.
              </p>
            </Card>

            <Card>
              <h3 className="font-bold text-lg mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">
                We accept all major credit cards, PayPal, and various local payment methods through our secure payment processor.
              </p>
            </Card>

            <Card>
              <h3 className="font-bold text-lg mb-2">Can I get a refund?</h3>
              <p className="text-gray-400">
                Yes! We offer a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
