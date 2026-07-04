"use client";

import React, { Suspense, useState } from 'react';
import AppLayout from '../../layouts/AppLayout';
import { useAuth } from '../../contexts/AuthContext';
import CheckoutModal from '../../components/auth/CheckoutModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import AppMembershipPrompts from '../../components/membership/AppMembershipPrompts';

export default function AppRouteLayout({ children }: { children: React.ReactNode }) {
  const { user, upgradeToPremium } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  
  const userTier = user?.tier || 'free';

  const handleUpgrade = () => {
    setShowCheckout(true);
  };

  const executeUpgrade = async () => {
    try {
      const paymentToken = `tok_${Math.random().toString(36).substr(2, 9)}`;
      await upgradeToPremium(paymentToken);
      setShowCheckout(false);
      
      const element = document.createElement("a");
      const file = new Blob([`License: OTK-${Math.floor(Math.random() * 999999)}`], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = "Gildija_License.txt";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error: any) {
      console.error('Upgrade failed:', error);
      alert(error.message || 'Upgrade failed. Please try again.');
    }
  };

  return (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <AppMembershipPrompts />
      </Suspense>
      <AppLayout userTier={userTier} onUpgrade={handleUpgrade}>
        {children}
      </AppLayout>
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        onComplete={executeUpgrade} 
      />
    </ProtectedRoute>
  );
}
