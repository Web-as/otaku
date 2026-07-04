"use client";

import ScannerPage from '../../../page_components/ScannerPage';
import SubscriptionGate from '../../../components/membership/SubscriptionGate';

export default function Page() {
  return (
    <SubscriptionGate required="library_pass" context="scanner">
      <ScannerPage />
    </SubscriptionGate>
  );
}

