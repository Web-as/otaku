"use client";

import dynamic from 'next/dynamic';

const CommunityPage = dynamic(
  () => import('../../../page_components/CommunityPage'),
  { ssr: false, loading: () => <div className="p-6 text-gray-500 font-mono">Loading community...</div> }
);

export default function CommunityClient() {
  return <CommunityPage />;
}
