import { apiClient } from './client';
import { User, AuthToken, Blog, Comment, CreateBlogPayload, CreateCommentPayload } from '../types';

export const api = {
  auth: {
    login: async (credentials: URLSearchParams): Promise<AuthToken> =>
      apiClient('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: credentials.toString(),
        auth: false,
        isFormData: true,
      }),

    register: async (data: Record<string, any>): Promise<User> =>
      apiClient('/user', { method: 'POST', body: JSON.stringify(data), auth: false }),

    getMe: async (): Promise<User> =>
      apiClient('/user/me', { method: 'GET', auth: true }),
  },

  blogs: {
    list: async (): Promise<Blog[]> =>
      apiClient('/blogs', { method: 'GET', auth: false }),

    get: async (id: number): Promise<Blog> =>
      apiClient(`/blog/${id}`, { method: 'GET', auth: false }),

    create: async (data: CreateBlogPayload): Promise<Blog> =>
      apiClient('/blog', { method: 'POST', body: JSON.stringify(data) }),

    delete: async (id: number): Promise<{ message: string }> =>
      apiClient(`/blog/${id}`, { method: 'DELETE' }),

    toggleLike: async (id: number): Promise<{ message: string; liked: boolean }> =>
      apiClient(`/blog/${id}/like`, { method: 'POST' }),

    listComments: async (blogId: number): Promise<Comment[]> =>
      apiClient(`/blog/${blogId}/comments`, { method: 'GET', auth: false }),

    addComment: async (blogId: number, data: CreateCommentPayload): Promise<Comment> =>
      apiClient(`/blog/${blogId}/comment`, { method: 'POST', body: JSON.stringify(data) }),
  },
};
