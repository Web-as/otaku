import React from 'react';
import Link from 'next/link';
import { Star, Heart, MessageSquare, CheckCircle, Send, AlertTriangle } from 'lucide-react';
import type { MiniPost } from '@/shared/types/miniPost';
import { isValidURL } from '@/shared/utils/validation';
import { UserBadge } from '@/shared/components/UserBadge';
import LibrarianCommentThread from './LibrarianCommentThread';

interface MiniPostCardProps {
  post: MiniPost;
  onLike?: (postId: string) => void;
}

const MiniPostCard: React.FC<MiniPostCardProps> = ({ post, onLike }) => {
  const getTypeIcon = () => {
    switch (post.type) {
      case 'status_update':
        return <CheckCircle className="w-4 h-4 text-indigo-300" />;
      case 'rating':
        return <Star className="w-4 h-4 text-amber-400" />;
      case 'quick_review':
        return <MessageSquare className="w-4 h-4 text-violet-300" />;
      case 'recommendation':
        return <Send className="w-4 h-4 text-emerald-300" />;
    }
  };

  const getTypeLabel = () => {
    switch (post.type) {
      case 'status_update':
        return 'Status Update';
      case 'rating':
        return 'Rating';
      case 'quick_review':
        return 'Quick Review';
      case 'recommendation':
        return 'Recommendation';
    }
  };

  const getTypeColor = () => {
    switch (post.type) {
      case 'status_update':
        return 'bg-indigo-900/20 border-indigo-700/40';
      case 'rating':
        return 'bg-amber-900/20 border-amber-700/40';
      case 'quick_review':
        return 'bg-violet-900/20 border-violet-700/40';
      case 'recommendation':
        return 'bg-emerald-900/20 border-emerald-700/40';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`border-2 rounded-xl p-4 ${getTypeColor()} transition-all hover:shadow-md`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {post.anime_cover && isValidURL(post.anime_cover) && (
          <img
            src={post.anime_cover}
            alt={post.anime_title}
            className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {getTypeIcon()}
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              {getTypeLabel()}
            </span>
            {post.spoiler && (
              <span className="flex items-center gap-1 text-xs text-rose-300">
                <AlertTriangle className="w-3 h-3" />
                Spoiler
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/blog/author/${post.user_id}`}
              className="font-semibold text-stone-100 hover:text-violet-400 transition"
            >
              {post.author_name}
            </Link>
            <UserBadge badge="pre_registered" size="sm" />
            <span className="text-xs text-stone-500">{formatDate(post.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Anime Title */}
      <div className="mb-2">
        <span className="text-sm text-stone-400">about </span>
        <span className="font-bold text-stone-100">{post.anime_title}</span>
      </div>

      {/* Rating (if applicable) */}
      {post.rating && post.rating > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1 px-3 py-1 bg-slate-900 rounded-full border border-amber-500/40">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-stone-100">{post.rating}</span>
            <span className="text-sm text-stone-400">/10</span>
          </div>
        </div>
      )}

      {/* Status (if applicable) */}
      {post.status && post.episodes_watched !== undefined && post.total_episodes && (
        <div className="mb-2 text-sm text-stone-400">
          Progress: <span className="font-semibold text-stone-100">
            {post.episodes_watched}/{post.total_episodes} episodes
          </span>
        </div>
      )}

      {/* Content */}
      <p className="text-stone-100 leading-relaxed mb-3">{post.content}</p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag: any) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-900 rounded-full text-xs text-stone-400 border border-amber-900/30"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <LibrarianCommentThread postId={post.id} />

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-amber-900/30">
        <button
          onClick={() => onLike?.(post.id)}
          className="flex items-center gap-2 text-sm text-stone-400 hover:text-rose-300 transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span>{post.likes || 0}</span>
        </button>
        <span className="text-xs text-stone-500">
          From Anime Tracker
        </span>
      </div>
    </div>
  );
};

export default MiniPostCard;
