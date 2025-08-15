export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  skills?: string[];
  bio?: string;
  exp?: number; // JWT expiration
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  user: string;
  tags: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  user: string;
  replies: Comment[];
}

export interface Bookmark {
  _id: string;
  resource: { [key: string]: any };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface FeedState {
  posts: Post[];
  page: number;
  hasMore: boolean;
}

export interface CacheState {
  bookmarks: Bookmark[];
  trending: any[];
}

export interface NotificationState {
  count: number;
  messages: string[];
}