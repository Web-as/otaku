"use client";

import PricingPage from '@/page_components/PricingPage';
import { useState } from 'react';
import CheckoutModal from '@/components/auth/CheckoutModal';

export default function Page() {
  const [showCheckout, setShowCheckout] = useState(false);

  const handleUpgrade = () => setShowCheckout(true);
  const executeUpgrade = async () => {
    // Add logic here
    setShowCheckout(false);
  };

  return (
    <>
      <PricingPage onUpgrade={handleUpgrade} />
      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} onComplete={executeUpgrade} />
    </>
  );
}

