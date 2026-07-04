"use server";

import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';
import type { Post, PostMetadata } from './postTypes';

function fileSlugFromPath(filepath: string): string {
  const base = filepath.split(/[\/\\]/).pop() ?? '';
  return base.replace(/\.md$/i, '');
}

function parsePostFile(filepath: string, raw: string): Post | null {
  const { data, content } = matter(raw);
  const d = data as Record<string, unknown>;
  const fileSlug = fileSlugFromPath(filepath);
  const slug = typeof d.slug === 'string' && d.slug.length > 0 ? d.slug : fileSlug;
  const title = typeof d.title === 'string' ? d.title : '';
  if (!title || !slug) return null;

  const tags = Array.isArray(d.tags)
    ? (d.tags.filter(t => typeof t === 'string') as string[])
    : [];

  const post: Post = {
    title,
    slug,
    excerpt: typeof d.excerpt === 'string' ? d.excerpt : '',
    author: typeof d.author === 'string' ? d.author : 'Editor',
    date: typeof d.date === 'string' ? d.date : new Date().toISOString().slice(0, 10),
    category: typeof d.category === 'string' ? d.category : 'News',
    tags,
    image:
      typeof d.image === 'string'
        ? d.image
        : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
    readTime: typeof d.readTime === 'string' ? d.readTime : '5 min',
    content: content.trim(),
  };
  return post;
}

function loadAllPostsFromDisk(): Post[] {
  const posts: Post[] = [];
  try {
    const postsDirectory = path.join(process.cwd(), 'content', 'posts');
    if (fs.existsSync(postsDirectory)) {
      const filenames = fs.readdirSync(postsDirectory);
      for (const filename of filenames) {
        if (filename.endsWith('.md')) {
          const filePath = path.join(postsDirectory, filename);
          const raw = fs.readFileSync(filePath, 'utf8');
          const p = parsePostFile(filePath, raw);
          if (p) posts.push(p);
        }
      }
    }
  } catch (err) {
    console.error('Error loading posts:', err);
  }
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getAllPosts(): Promise<PostMetadata[]> {
  const allPosts = loadAllPostsFromDisk();
  return allPosts.map(({ content: _c, ...metadata }) => metadata);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const allPosts = loadAllPostsFromDisk();
  return allPosts.find(p => p.slug === slug) ?? null;
}

export async function getPostsByCategory(category: string): Promise<PostMetadata[]> {
  const allPosts = loadAllPostsFromDisk();
  return allPosts
    .filter(p => p.category === category)
    .map(({ content: _c, ...metadata }) => metadata);
}

export async function getPostsByTag(tag: string): Promise<PostMetadata[]> {
  const allPosts = loadAllPostsFromDisk();
  return allPosts
    .filter(p => p.tags.includes(tag))
    .map(({ content: _c, ...metadata }) => metadata);
}
