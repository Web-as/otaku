import { useState } from 'react';
import { X, Save } from 'lucide-react';
import type { PersonalBlogPost } from '@/types';

type PostCategory = PersonalBlogPost['category'];
type PostStatus = PersonalBlogPost['status'];

interface PostEditorProps {
  post?: PersonalBlogPost;
  onSave: (data: {
    title: string;
    excerpt?: string;
    content: string;
    cover_image?: string;
    status: PostStatus;
    category?: PostCategory;
    tags?: string[];
  }) => Promise<void>;
  onClose: () => void;
}

const PostEditor = ({ post, onSave, onClose }: PostEditorProps) => {
  const [title, setTitle] = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');
  const [category, setCategory] = useState<PostCategory>(post?.category ?? 'Thoughts');
  const [tags, setTags] = useState(post?.tags?.join(', ') || '');
  const [status, setStatus] = useState<PostStatus>(post?.status ?? 'draft');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave({
        title,
        excerpt,
        content,
        cover_image: coverImage || undefined,
        status,
        category,
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card border border-[#26262a] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">
            {post ? 'Edit Post' : 'New Post'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#050505]/50 border border-[#26262a] text-white px-4 py-3 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
              placeholder="Enter post title..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full bg-[#050505]/50 border border-[#26262a] text-white px-4 py-3 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition resize-none"
              placeholder="Short description..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full bg-[#050505]/50 border border-[#26262a] text-white px-4 py-3 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition resize-none font-mono text-sm"
              placeholder="Write your post content..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Cover Image URL
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full bg-[#050505]/50 border border-[#26262a] text-white px-4 py-3 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full bg-[#050505]/50 border border-[#26262a] text-white px-4 py-3 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
              >
                <option value="Review">Review</option>
                <option value="Thoughts">Thoughts</option>
                <option value="Guide">Guide</option>
                <option value="List">List</option>
                <option value="Analysis">Analysis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PostStatus)}
                className="w-full bg-[#050505]/50 border border-[#26262a] text-white px-4 py-3 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
              >
                <option value="draft">Draft</option>
                <option value="private">Private</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full bg-[#050505]/50 border border-[#26262a] text-white px-4 py-3 rounded-lg focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition"
              placeholder="anime, review, personal"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#0a0a0c] hover:bg-[#1a1a2e] text-gray-300 font-semibold rounded-lg transition border border-[#26262a]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostEditor;
