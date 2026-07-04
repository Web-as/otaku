'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Crown, Sparkles, User } from 'lucide-react';
import type { BlogProfileTier } from '@/shared/blog/profileTheme';
import { getBlogProfileTheme } from '@/shared/blog/profileTheme';

interface BlogTierBadgeProps {
  tier: BlogProfileTier;
  userId?: string;
  className?: string;
}

export default function BlogTierBadge({ tier, userId, className = '' }: BlogTierBadgeProps) {
  const theme = getBlogProfileTheme(tier);
  const Icon =
    tier === 'super_user' ? Sparkles : tier === 'vip' ? Crown : tier === 'pass_holder' ? CreditCard : User;

  const badge = (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${theme.badgeClass} ${className}`}
    >
      <Icon className="w-3 h-3" />
      {theme.shortLabel}
    </span>
  );

  if (userId) {
    return (
      <Link href={`/blog/author/${userId}`} className="hover:opacity-90 transition">
        {badge}
      </Link>
    );
  }
  return badge;
}
