import React from 'react';
import { BADGE_DEFINITIONS, type BadgeType } from '../types/userBadges';

interface UserBadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const UserBadge: React.FC<UserBadgeProps> = ({ 
  badge, 
  size = 'md',
  showTooltip = true 
}) => {
  const badgeInfo = BADGE_DEFINITIONS[badge];
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${badgeInfo.color} text-white rounded-full font-semibold ${sizeClasses[size]} shadow-lg`}
      title={showTooltip ? badgeInfo.description : undefined}
    >
      <span>{badgeInfo.icon}</span>
      <span>{badgeInfo.title}</span>
    </span>
  );
};

interface UserTitleProps {
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

export const UserTitle: React.FC<UserTitleProps> = ({ title, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <span className={`text-gray-400 font-medium ${sizeClasses[size]}`}>
      {title}
    </span>
  );
};

interface UserBadgeListProps {
  badges: BadgeType[];
  maxDisplay?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const UserBadgeList: React.FC<UserBadgeListProps> = ({ 
  badges, 
  maxDisplay = 3,
  size = 'sm' 
}) => {
  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {displayBadges.map((badge) => (
        <UserBadge key={badge} badge={badge} size={size} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-gray-500 font-medium">
          +{remaining} more
        </span>
      )}
    </div>
  );
};

interface UserProfileCardProps {
  displayName: string;
  title?: string;
  badges?: BadgeType[];
  avatarUrl?: string;
  compact?: boolean;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({
  displayName,
  title,
  badges = [],
  avatarUrl,
  compact = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${compact ? 'py-2' : 'p-4 bg-gray-900 rounded-lg border border-gray-800'}`}>
      {/* Avatar */}
      <div className={`${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className={compact ? 'text-sm' : 'text-lg'}>
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-bold text-white truncate ${compact ? 'text-sm' : 'text-base'}`}>
            {displayName}
          </span>
          {badges.length > 0 && badges.includes('pre_registered' as BadgeType) && (
            <UserBadge badge="pre_registered" size="sm" />
          )}
        </div>
        {title && (
          <UserTitle title={title} size={compact ? 'sm' : 'md'} />
        )}
        {!compact && badges.length > 1 && (
          <div className="mt-2">
            <UserBadgeList badges={badges.filter(b => b !== 'pre_registered')} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
};
