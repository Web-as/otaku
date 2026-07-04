import { Crown, Shield, Star, Sparkles, Award, Zap } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface BadgePillProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
}

const BadgePill = ({ badge, size = 'md' }: BadgePillProps) => {
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, any> = {
      '👑': Crown,
      '⚡': Zap,
      '🛡️': Shield,
      '💫': Sparkles,
      '🌟': Star,
      '💎': Award,
      '⭐': Star,
    };
    const IconComponent = iconMap[iconName] || Star;
    return <IconComponent className={sizeClasses.icon} />;
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
    },
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClasses.container}`}
      style={{
        backgroundColor: `${badge.color}20`,
        borderColor: badge.color,
        borderWidth: '1px',
        color: badge.color,
      }}
      title={badge.description}
    >
      {getIcon(badge.icon)}
      <span>{badge.name}</span>
    </div>
  );
};

export default BadgePill;
