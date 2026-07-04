"use client";

import QuestsPage from '../../../page_components/QuestsPage';
import SubscriptionGate from '../../../components/membership/SubscriptionGate';

export default function Page() {
  return (
    <SubscriptionGate required="library_pass" context="quests">
      <QuestsPage />
    </SubscriptionGate>
  );
}

