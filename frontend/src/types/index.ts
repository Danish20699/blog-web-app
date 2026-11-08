export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  bio?: string | null;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface Blog {
  id: number;
  title: string;
  content: string;
  author_id: number;
  likes_count: number;
  comments_count: number;
}

export interface Comment {
  id: number;
  text: string;
  commenter_id: number;
  blog_id: number;
}

export interface CreateBlogPayload {
  title: string;
  content: string;
}

export interface CreateCommentPayload {
  text: string;
}
