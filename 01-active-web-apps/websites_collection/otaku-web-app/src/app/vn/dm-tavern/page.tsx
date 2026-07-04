'use client';

import dynamic from 'next/dynamic';

const AgentVNScreen = dynamic(
  () => import('@/components/vn/AgentVNScreen').then(mod => mod.AgentVNScreen),
  { ssr: false }
);

export default function DMTavernPage() {
  return <AgentVNScreen initialSceneId="intro" />;
}
