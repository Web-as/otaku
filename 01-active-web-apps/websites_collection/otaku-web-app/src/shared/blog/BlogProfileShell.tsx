import React, { type ReactNode } from 'react';
import { CreditCard, Crown, Sparkles, User } from 'lucide-react';
import type { BlogProfileTheme } from './profileTheme';

export interface BlogProfileIdentity {
  displayName: string;
  username?: string;
  bio?: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  joinDate?: string;
  chips?: string[];
}

interface BlogProfileShellProps {
  theme: BlogProfileTheme;
  identity: BlogProfileIdentity;
  stats?: { label: string; value: string | number; icon?: ReactNode }[];
  children: ReactNode;
  /** Viewing own profile vs another member */
  isOwner?: boolean;
  footer?: ReactNode;
}

function TierIcon({ tier }: { tier: BlogProfileTheme['tier'] }) {
  if (tier === 'super_user') return <Sparkles className="w-3.5 h-3.5" />;
  if (tier === 'vip') return <Crown className="w-3.5 h-3.5" />;
  if (tier === 'pass_holder') return <CreditCard className="w-3.5 h-3.5" />;
  return <User className="w-3.5 h-3.5" />;
}

export function BlogProfileShell({
  theme,
  identity,
  stats = [],
  children,
  isOwner = false,
  footer,
}: BlogProfileShellProps) {
  const initial = identity.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      className={`max-w-3xl mx-auto space-y-6 ${theme.shellClass}`}
      style={theme.cssVars as React.CSSProperties}
      data-blog-tier={theme.tier}
    >
      <header className={theme.headerClass}>
        {theme.headerGlowClass ? <div className={theme.headerGlowClass} aria-hidden /> : null}
        <div className="relative flex flex-col sm:flex-row items-start gap-5">
          {identity.avatarUrl ? (
            <img
              src={identity.avatarUrl}
              alt=""
              className={`w-20 h-20 rounded-full object-cover flex-shrink-0 ${theme.avatarRingClass}`}
            />
          ) : (
            <div
              className={`w-20 h-20 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-bold text-white ${theme.avatarRingClass}`}
              style={{ backgroundColor: identity.avatarColor ?? '#6366f1' }}
            >
              {initial}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white truncate">{identity.displayName}</h1>
              {identity.username && (
                <span className="text-gray-500 text-sm">@{identity.username}</span>
              )}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${theme.badgeClass}`}
              >
                <TierIcon tier={theme.tier} />
                {theme.shortLabel}
              </span>
            </div>
            <p className={`text-xs ${theme.accentTextClass} mb-2`}>{theme.label}</p>
            {identity.bio && <p className="text-gray-400 text-sm leading-relaxed">{identity.bio}</p>}
            {theme.description && (
              <p className="text-[11px] text-gray-500 mt-2 max-w-prose">{theme.description}</p>
            )}
            {identity.chips && identity.chips.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {identity.chips.map(c => (
                  <span
                    key={c}
                    className={`text-xs px-2 py-0.5 rounded-full border ${theme.borderAccentClass} bg-black/20 text-gray-300`}
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
            {identity.joinDate && (
              <p className="text-xs text-gray-600 mt-3">
                {isOwner ? 'Your ' : ''}Member since{' '}
                {new Date(identity.joinDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            )}
          </div>
        </div>
      </header>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon }) => (
            <div key={label} className={theme.statCardClass}>
              {icon && <div className="flex justify-center mb-1 opacity-80">{icon}</div>}
              <div className={`text-2xl font-bold ${theme.accentTextClass}`}>{value}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      <div className={theme.cardClass}>{children}</div>

      {footer}
    </div>
  );
}
