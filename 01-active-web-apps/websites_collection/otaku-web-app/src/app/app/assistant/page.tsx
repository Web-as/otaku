"use client";

import AssistantPage from '../../../page_components/AssistantPage';
import { useAuth } from '../../../contexts/AuthContext';
import { useState } from 'react';
import CheckoutModal from '../../../components/auth/CheckoutModal';

export default function Page() {
  const { user, upgradeToPremium } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  
  const userTier = user?.tier || 'free';

  const handleUpgrade = () => setShowCheckout(true);
  const executeUpgrade = async () => {
    try {
      const paymentToken = `tok_${Math.random().toString(36).substr(2, 9)}`;
      await upgradeToPremium(paymentToken);
      setShowCheckout(false);
    } catch (error: any) {
      console.error(error);
      alert('Upgrade failed');
    }
  };

  return (
    <>
      <AssistantPage userTier={userTier} onUpgrade={handleUpgrade} />
      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} onComplete={executeUpgrade} />
    </>
  );
}

