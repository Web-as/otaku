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
}

export interface Post extends PostMetadata {
  content: string;
}
