import { Calendar, Eye, Heart, Edit, Trash2, Lock, FileText } from 'lucide-react';
import type { PersonalBlogPost } from '@/types';

interface BlogPostCardProps {
  post: PersonalBlogPost;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-900/30 border-green-500/30 text-green-300';
      case 'draft': return 'bg-yellow-900/30 border-yellow-500/30 text-yellow-300';
      case 'private': return 'bg-gray-900/30 border-gray-500/30 text-gray-300';
      default: return 'bg-gray-900/30 border-gray-500/30 text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Review': return 'bg-pink-900/50 text-pink-300 border-pink-500/30';
      case 'Thoughts': return 'bg-purple-900/50 text-purple-300 border-purple-500/30';
      case 'Guide': return 'bg-green-900/50 text-green-300 border-green-500/30';
      case 'List': return 'bg-blue-900/50 text-blue-300 border-blue-500/30';
      case 'Analysis': return 'bg-violet-900/50 text-violet-300 border-violet-500/30';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-violet-500 transition-all duration-300 shadow-lg hover:shadow-violet-900/20">
      {/* Cover Image */}
      {post.coverImage && (
        <div className="h-48 bg-gray-800 relative overflow-hidden">
          <img 
            src={post.coverImage} 
            alt={post.title}
            className="w-full h-full object-cover opacity-80 hover:scale-105 transition duration-500"
          />
          <div className="absolute top-3 right-3 flex gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(post.status)}`}>
              {post.status === 'private' && <Lock className="w-3 h-3 inline mr-1" />}
              {post.status === 'draft' && <FileText className="w-3 h-3 inline mr-1" />}
              {post.status.toUpperCase()}
            </span>
          </div>
          <div className="absolute bottom-3 left-3">
            <span className={`px-2 py-1 rounded text-xs font-bold border ${getCategoryColor(post.category)}`}>
              {post.category}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 hover:text-violet-400 transition-colors line-clamp-2 cursor-pointer">
          {post.title}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((tag: string) => (
            <span 
              key={tag}
              className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded border border-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
            {post.status === 'published' && (
              <>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.likes || 0}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit?.(post.id)}
              className="p-2 hover:bg-violet-600 text-gray-400 hover:text-white rounded transition"
              title="Edit post"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete?.(post.id)}
              className="p-2 hover:bg-red-600 text-gray-400 hover:text-white rounded transition"
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;
