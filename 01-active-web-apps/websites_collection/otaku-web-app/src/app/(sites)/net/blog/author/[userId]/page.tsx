'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { BlogProfileShell } from '@/shared/blog/BlogProfileShell';
import { themeFromProfile } from '@/shared/blog/profileTheme';
import { getUserProfile } from '@/shared/supabase/database';
import { fetchAdmissionCard } from '@/shared/membership/inventory';
import { resolveMembershipStage } from '@/shared/membership/ladder';
import { getCurrentUser } from '@/lib/firebase';
import '@/styles/blogProfile.css';

const DEMO: Record<string, { role: string; membership_stage: string; library_subscription_active: boolean; name: string; user: string; bio: string }> = {
  guest: { role: 'guest', membership_stage: 'guest', library_subscription_active: false, name: 'Guest Writer', user: 'guest_writer', bio: 'Registered guest — Library Pass unlocks the card-holder skin.' },
  pass: { role: 'user', membership_stage: 'pass_holder', library_subscription_active: true, name: 'Card Holder', user: 'library_pass', bio: 'Library Admission Card active.' },
  vip: { role: 'vip', membership_stage: 'vip', library_subscription_active: true, name: 'VIP Columnist', user: 'vip_librarian', bio: 'VIP flair on admission card.' },
  super: { role: 'super_user', membership_stage: 'super_user', library_subscription_active: true, name: 'Super User', user: 'super_archivist', bio: 'Earned Super User — never sold.' },
};

export default function BlogAuthorPage() {
  const params = useParams();
  const userId = typeof params.userId === 'string' ? params.userId : '';
  const [loading, setLoading] = useState(true);
  const [identity, setIdentity] = useState<{
    displayName: string;
    username: string;
    bio: string;
    joinDate?: string;
    chips: string[];
    theme: ReturnType<typeof themeFromProfile>;
  } | null>(null);
  const isOwner = getCurrentUser()?.uid === userId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (DEMO[userId]) {
          const d = DEMO[userId];
          const theme = themeFromProfile({
            role: d.role as 'guest',
            membership_stage: d.membership_stage as 'guest',
            library_subscription_active: d.library_subscription_active,
          }, d.library_subscription_active);
          if (!cancelled) {
            setIdentity({
              displayName: d.name,
              username: d.user,
              bio: d.bio,
              joinDate: '2025-01-01',
              chips: [],
              theme,
            });
          }
          return;
        }
        const profile = await getUserProfile(userId);
        if (!profile) {
          if (!cancelled) setIdentity(null);
          return;
        }
        const card = await fetchAdmissionCard(userId).catch(() => null);
        const status = resolveMembershipStage(profile, card, 0, true);
        const theme = themeFromProfile(profile, status.hasValidPass);
        if (!cancelled) {
          setIdentity({
            displayName: profile.display_name || profile.email?.split('@')[0] || 'Member',
            username: profile.email?.split('@')[0] || userId.slice(0, 8),
            bio: profile.active_title || 'Otaku Network blogger',
            joinDate: profile.created_at,
            chips: profile.badges ?? [],
            theme,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return <p className="text-center py-20 text-stone-400">Loading profile…</p>;
  }

  if (!identity) {
    return (
      <div className="text-center py-20 text-stone-400">
        <p className="mb-4">Author not found</p>
        <Link href="/blog" className="text-violet-400 hover:underline">
          Back to blog
        </Link>
        <p className="text-xs mt-6 text-stone-600">
          Demo: /blog/author/guest · pass · vip · super
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/blog" className="inline-flex items-center gap-2 text-stone-400 hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Gazette
      </Link>
      <BlogProfileShell
        theme={identity.theme}
        identity={{
          displayName: identity.displayName,
          username: identity.username,
          bio: identity.bio,
          joinDate: identity.joinDate,
          chips: identity.chips,
        }}
        isOwner={isOwner}
        stats={[
          { label: 'Tier', value: identity.theme.shortLabel, icon: <FileText className="w-4 h-4" /> },
          { label: 'Posts', value: '—' },
          { label: 'Views', value: '—' },
        ]}
      >
        <p className="text-stone-400 text-sm">
          {isOwner
            ? 'This is how other readers see your blog profile. Upgrade membership to change your skin.'
            : 'Profile appearance reflects Library Pass, VIP, or earned Super User status.'}
        </p>
      </BlogProfileShell>
    </div>
  );
}
