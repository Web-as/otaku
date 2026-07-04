export interface PersonalBlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  category: 'Review' | 'Thoughts' | 'Guide' | 'List' | 'Analysis';
  status: 'draft' | 'published' | 'private';
  createdAt: string;
  updatedAt: string;
  views?: number;
  likes?: number;
}

export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
  totalLikes: number;
}
