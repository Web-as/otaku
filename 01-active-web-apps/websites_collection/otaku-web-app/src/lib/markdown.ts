import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export interface PostMetadata {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  readTime: string;
  rating?: number;
  type?: 'review' | 'news';
}

export interface Post extends PostMetadata {
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'content/posts');

export function getAllPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    };
  });
}

export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    const { data, content } = matter(fileContents);

    return {
      slug,
      content,
      title: data.title || '',
      excerpt: data.excerpt || '',
      author: data.author || 'Editor',
      date: data.date || new Date().toISOString().slice(0, 10),
      category: data.category || 'News',
      tags: data.tags || [],
      image: data.image || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
      readTime: data.readTime || '5 min',
      rating: data.rating,
      type: data.type,
    };
  } catch (e) {
    return null;
  }
}

export function getAllPosts(): PostMetadata[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map(({ slug }) => getPostBySlug(slug))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  
  return posts.map(({ content, ...meta }) => meta);
}
