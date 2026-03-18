export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  authorName: string;
  readingTimeMinutes: number;
  featured: boolean;
  published: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
};

export type BlogDraft = {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  authorName?: string;
  readingTimeMinutes?: number;
  featured?: boolean;
  published: boolean;
  publishedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
};

export type BlogOverview = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  featuredPosts: number;
  totalViews: number;
  topTags: Array<{ tag: string; count: number }>;
};

export type VisitorAnalytics = {
  totalVisits: number;
  uniqueVisitors: number;
  pageViews: Record<string, number>;
  dailyVisits: Record<string, number>;
  lastVisitAt: string;
};
