import React, { useState } from 'react';
import { Save, X, Eye, Image as ImageIcon, Tag, FolderOpen } from 'lucide-react';
import { validateBlogPost, sanitizeHTML, isValidURL } from '@/shared/utils/validation';
import type { BlogPost } from '@/types';

interface PostEditorProps {
  post?: BlogPost;
  onSave: (post: Omit<BlogPost, 'id' | 'date'>) => Promise<void>;
  onCancel: () => void;
}

const PostEditor: React.FC<PostEditorProps> = ({ post, onSave, onCancel }) => {
  const [title, setTitle] = useState(post?.title || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || 'Review');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(post?.image || '');
  const [readTime, setReadTime] = useState(post?.readTime || '5 min read');
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Review', 'News', 'Deep Dive', 'Community', 'Guide', 'Opinion'];

  const handleAddTag = () => {
    const sanitized = sanitizeHTML(tagInput.trim());
    if (sanitized && !tags.includes(sanitized)) {
      setTags([...tags, sanitized]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = async () => {
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!excerpt.trim()) {
      setError('Excerpt is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (image && !isValidURL(image)) {
      setError('Invalid image URL');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        title: sanitizeHTML(title),
        excerpt: sanitizeHTML(excerpt),
        content: content, // Don't sanitize content - allow HTML
        author: 'Author', // Will be set by service
        category,
        tags,
        image: image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
        readTime,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save post');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 text-stone-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-stone-100">
          {post ? 'Edit Post' : 'Create New Post'}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 border border-amber-900/40 rounded-lg hover:bg-slate-800"
          >
            <Eye className="w-4 h-4" />
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 border border-amber-900/40 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-900/20 border border-rose-500/40 rounded-lg text-rose-200">
          {error}
        </div>
      )}

      {preview ? (
        /* Preview Mode */
        <div className="bg-slate-900 rounded-xl border border-amber-900/30 shadow-lg p-8">
          {image && (
            <img
              src={image}
              alt={title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-200 rounded-full text-sm font-medium">
              {category}
            </span>
            <span className="text-stone-500 text-sm">{readTime}</span>
          </div>
          <h1 className="text-4xl font-bold text-stone-100 mb-4">{title || 'Untitled'}</h1>
          <p className="text-xl text-stone-400 mb-6">{excerpt || 'No excerpt'}</p>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-stone-200 text-base leading-relaxed border border-amber-900/30 rounded-lg p-4 bg-slate-800">
              {content || 'No content'}
            </pre>
            <p className="mt-4 text-xs text-stone-500">
              Preview shows raw HTML/Markdown. Published rendering should use a sanitized pipeline server-side.
            </p>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-800 text-stone-300 rounded-full text-sm border border-amber-900/30">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-amber-900/40 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-lg"
              placeholder="Enter post title..."
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Excerpt *
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900 border border-amber-900/40 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="Brief description of the post..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Content * (Supports HTML)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-4 py-3 bg-slate-900 border border-amber-900/40 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent font-mono text-sm"
              placeholder="Write your post content here... (HTML supported)"
            />
          </div>

          {/* Category & Read Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                <FolderOpen className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-amber-900/40 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Read Time
              </label>
              <input
                type="text"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-amber-900/40 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="5 min read"
              />
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Cover Image URL
            </label>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-amber-900/40 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
            {image && isValidURL(image) && (
              <img
                src={image}
                alt="Preview"
                className="mt-3 w-full h-48 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 bg-slate-900 border border-amber-900/40 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                placeholder="Add a tag..."
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-amber-500/20 text-amber-200 rounded-full text-sm flex items-center gap-2 border border-amber-700/40"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-amber-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEditor;
