import React from 'react';
import AIAssistant from '../components/features/AIAssistant';
import { UserTier } from '../types/types';
import LockedFeature from '../components/ui/LockedFeature';

interface AssistantPageProps {
  userTier: UserTier;
  onUpgrade: () => void;
}

const AssistantPage: React.FC<AssistantPageProps> = ({ userTier, onUpgrade }) => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        
        <LockedFeature
          isLocked={userTier === 'free'}
          onUpgrade={onUpgrade}
          message="Upgrade to Premium to chat with your AI anime assistant"
        >
          <AIAssistant />
        </LockedFeature>
      </div>
    </div>
  );
};

export default AssistantPage;
