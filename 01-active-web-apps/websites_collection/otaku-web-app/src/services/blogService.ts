// Blog Service - Handles both mock data and database persistence
import { getBlogPosts as getMockPosts } from '@/mockData';
import { 
  getPublishedBlogPosts, 
  getBlogPostBySlug,
  createBlogPost as createBlogPostDB,
  updateBlogPost as updateBlogPostDB,
  deleteBlogPost as deleteBlogPostDB,
  getUserBlogPosts,
  getUserProfile,
  type BlogPost as DBBlogPost
} from '../../../shared/supabase';
import type { BlogPost } from '../types';

// Flag to switch between mock data and database
// Controlled by environment variable VITE_USE_SUPABASE
import { envFlag } from '../../../shared/utils/runtimeEnv';

const USE_DATABASE = true;

const authorNameCache = new Map<string, string>();

async function resolveAuthorName(authorId: string): Promise<string> {
  if (authorNameCache.has(authorId)) return authorNameCache.get(authorId)!;
  try {
    const profile = await getUserProfile(authorId);
    const name = profile?.display_name || profile?.email?.split('@')[0] || 'Author';
    authorNameCache.set(authorId, name);
    return name;
  } catch {
    return 'Author';
  }
}

// Convert DB post to app BlogPost format
const convertDBPost = (dbPost: DBBlogPost, author = 'Author'): BlogPost => ({
  id: dbPost.id || '',
  title: dbPost.title,
  excerpt: dbPost.excerpt || '',
  content: dbPost.content,
  author,
  date: dbPost.published_at || dbPost.created_at || new Date().toISOString(),
  category: dbPost.category || 'Uncategorized',
  tags: dbPost.tags || [],
  image: dbPost.cover_image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
  readTime: dbPost.read_time || '5 min read',
});

// Get all published blog posts
export const getBlogPosts = async (): Promise<BlogPost[]> => {
  if (!USE_DATABASE) {
    return getMockPosts();
  }

  try {
    const dbPosts = await getPublishedBlogPosts();
    return Promise.all(
      dbPosts.map(async (p) => convertDBPost(p, await resolveAuthorName(p.author_id))),
    );
  } catch (error) {
    console.error('Failed to fetch blog posts from database:', error);
    return getMockPosts(); // Fallback to mock data
  }
};

// Get single blog post by ID/slug
export const getBlogPost = async (id: string): Promise<BlogPost | null> => {
  if (!USE_DATABASE) {
    return getMockPosts().find(p => p.id === id) || null;
  }

  try {
    const dbPost = await getBlogPostBySlug(id);
    return dbPost ? convertDBPost(dbPost) : null;
  } catch (error) {
    console.error('Failed to fetch blog post:', error);
    return null;
  }
};

// Create new blog post (requires authentication)
export const createBlogPost = async (
  authorId: string,
  post: Omit<BlogPost, 'id' | 'date'>
): Promise<BlogPost> => {
  if (!USE_DATABASE) {
    throw new Error('Database not configured. Cannot create posts with mock data.');
  }

  const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const dbPost = await createBlogPostDB({
    author_id: authorId,
    title: post.title,
    slug,
    excerpt: post.excerpt || '',
    content: post.content || '',
    category: post.category || 'Uncategorized',
    tags: post.tags || [],
    cover_image: post.image || '',
    read_time: post.readTime || '5 min read',
    published: true,
  });

  return convertDBPost(dbPost);
};

// Update existing blog post
export const updateBlogPost = async (
  postId: string,
  updates: Partial<BlogPost>
): Promise<BlogPost> => {
  if (!USE_DATABASE) {
    throw new Error('Database not configured. Cannot update posts with mock data.');
  }

  const dbPost = await updateBlogPostDB(postId, {
    title: updates.title,
    excerpt: updates.excerpt,
    content: updates.content,
    category: updates.category,
    tags: updates.tags,
    cover_image: updates.image,
    read_time: updates.readTime,
  });

  return convertDBPost(dbPost);
};

// Delete blog post
export const deleteBlogPost = async (postId: string): Promise<void> => {
  if (!USE_DATABASE) {
    throw new Error('Database not configured. Cannot delete posts with mock data.');
  }

  await deleteBlogPostDB(postId);
};

// Get user's blog posts (including drafts)
export const getUserPosts = async (userId: string): Promise<BlogPost[]> => {
  if (!USE_DATABASE) {
    throw new Error('Database not configured. Cannot fetch user posts with mock data.');
  }

  const dbPosts = await getUserBlogPosts(userId);
  return dbPosts.map(p => convertDBPost(p));
};

// Enable database mode (call after Supabase is configured)
export const enableDatabaseMode = () => {
  console.log('✅ Blog service switched to database mode');
  // In production, you'd set this via environment variable
  // For now, manually change USE_DATABASE flag above
};
