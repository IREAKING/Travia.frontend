// Blog service for frontend
// File: src/services/blogService.ts

import { api } from './api';
import type { ApiResponse } from '../types';

export interface BlogCategory {
  id: number;
  ten: string;
  slug: string;
  mo_ta?: string;
  anh?: string;
  mau_sac: string;
}

export interface BlogPost {
  id: number;
  tieu_de: string;
  slug: string;
  tom_tat?: string;
  noi_dung?: string;
  anh_dai_dien?: string;
  luot_xem: number;
  luot_thich: number;
  ngay_cong_bo: string;
  danh_mac_ten?: string;
  danh_mac_slug?: string;
  danh_mac_mau?: string;
  tac_gia_ten?: string;
  tac_gia_email?: string;
}

export interface BlogTag {
  id: number;
  ten: string;
  slug: string;
  mau_sac: string;
}

export interface BlogComment {
  id: number;
  noi_dung: string;
  ngay_tao: string;
  nguoi_dung_ten: string;
  nguoi_dung_email: string;
  phan_hoi_id?: number;
}

export interface CreateBlogCommentRequest {
  noi_dung: string;
  phan_hoi_id?: number;
}

export const blogService = {
  // Get all blog categories
  getAllCategories: async (): Promise<BlogCategory[]> => {
    try {
      const response = await api.get<ApiResponse<BlogCategory[]>>('/blog/categories');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching blog categories:', error);
      return [];
    }
  },

  // Get published blog posts with pagination
  getPublishedPosts: async (limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
    try {
      const response = await api.get<ApiResponse<BlogPost[]>>('/blog/posts', {
        params: { limit, offset }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  },

  // Get featured blog posts
  getFeaturedPosts: async (limit: number = 5): Promise<BlogPost[]> => {
    try {
      const response = await api.get<ApiResponse<BlogPost[]>>('/blog/featured', {
        params: { limit }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  },

  // Get blog post by slug
  getPostBySlug: async (slug: string): Promise<BlogPost> => {
    try {
      const response = await api.get<ApiResponse<BlogPost>>(`/blog/posts/${slug}`);
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },

  // Search blog posts
  searchPosts: async (query: string, limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
    try {
      const response = await api.get<ApiResponse<BlogPost[]>>('/blog/search', {
        params: { q: query, limit, offset }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error searching blog posts:', error);
      return [];
    }
  },

  // Get posts by category
  getPostsByCategory: async (categorySlug: string, limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
    try {
      const response = await api.get<ApiResponse<BlogPost[]>>(`/blog/category/${categorySlug}`, {
        params: { limit, offset }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching posts by category:', error);
      return [];
    }
  },

  // Increment post view count
  incrementViews: async (postId: number): Promise<void> => {
    try {
      await api.post(`/blog/posts/${postId}/view`);
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  },

  // Get post comments
  getPostComments: async (postId: number): Promise<BlogComment[]> => {
    try {
      const response = await api.get<ApiResponse<BlogComment[]>>(`/blog/posts/${postId}/comments`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Create comment
  createComment: async (postId: number, data: CreateBlogCommentRequest): Promise<BlogComment> => {
    try {
      const response = await api.post<ApiResponse<BlogComment>>(`/blog/posts/${postId}/comments`, data);
      return response.data?.data;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  // Get all tags
  getAllTags: async (): Promise<BlogTag[]> => {
    try {
      const response = await api.get<ApiResponse<BlogTag[]>>('/blog/tags');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  },
};
