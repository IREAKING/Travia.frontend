// Blog service for frontend
// File: src/services/blogService.ts

import { api } from './api';

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
  tom_tat?: string | null;
  noi_dung?: string;
  anh_dai_dien?: string | null;
  tac_gia_id?: string;
  danh_muc?: string | null;
  tu_khoa?: string[];
  luot_xem?: number | null;
  luot_thich?: number | null;
  trang_thai?: string | null;
  noi_bat?: boolean | null;
  ngay_dang?: string | null;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
  ten_tac_gia?: string | null;
  email_tac_gia?: string | null;
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

// ========== ADMIN INTERFACES ==========
export interface CreateBlogRequest {
  tieu_de: string;
  slug?: string;
  tom_tat?: string;
  noi_dung: string;
  anh_dai_dien?: string;
  danh_muc?: string;
  tu_khoa?: string[];
  trang_thai: string;
  noi_bat?: boolean;
  ngay_dang?: string;
}

export interface UpdateBlogRequest {
  tieu_de?: string;
  slug?: string;
  tom_tat?: string;
  noi_dung?: string;
  anh_dai_dien?: string;
  danh_muc?: string;
  tu_khoa?: string[];
  trang_thai?: string;
  noi_bat?: boolean;
  ngay_dang?: string;
}

export interface BlogStats {
  tong_so_da_dang?: number;
  tong_so_nhap?: number;
  tong_so_luu_tru?: number;
  tong_so_noi_bat?: number;
  tong_luot_xem?: number;
  tong_luot_thich?: number;
  so_bai_trong_30_ngay?: number;
}

// ========== AI INTERFACES ==========
export interface GenerateBlogContentRequest {
  topic: string;
  blog_type?: string; // kinh_nghiem, dia_diem, huong_dan, tin_tuc, review
  additional_context?: string;
}

export interface GenerateBlogContentResponse {
  title: string;
  summary: string;
  content: string;
}

export interface GenerateTitleSuggestionsRequest {
  topic: string;
  count?: number;
}

export interface GenerateTitleSuggestionsResponse {
  titles: string[];
}

export interface CreateBlogWithAIRequest {
  topic: string;
  blog_type?: string;
  additional_context?: string;
  anh_dai_dien?: string;
  danh_muc?: string;
  tu_khoa?: string[];
  trang_thai?: string;
  noi_bat?: boolean;
  ngay_dang?: string;
}

export interface BlogAIHistory {
  id: number;
  blog_id: number;
  prompt: string;
  phan_hoi_ai?: string | null;
  mo_hinh_ai?: string | null;
  so_luong_token?: number | null;
  ngay_tao: string;
}

export const blogService = {
  // ========== PUBLIC ENDPOINTS ==========
  
  // Get published blog posts with pagination
  getPublishedPosts: async (limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
    try {
      const response = await api.get<{ status: string; code: number; data: BlogPost[] }>('/blog/posts', {
        params: { limit, offset }
      });
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  },

  // Get featured blog posts
  getFeaturedPosts: async (limit: number = 5): Promise<BlogPost[]> => {
    try {
      const response = await api.get<{ status: string; code: number; data: BlogPost[] }>('/blog/featured', {
        params: { limit }
      });
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  },

  // Get blog post by slug
  getPostBySlug: async (slug: string): Promise<BlogPost> => {
    try {
      const response = await api.get<{ status: string; code: number; data: BlogPost }>(`/blog/posts/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      throw error;
    }
  },

  // Search blog posts
  searchPosts: async (query: string, limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
    try {
      const response = await api.get<{ status: string; code: number; data: BlogPost[] }>('/blog/search', {
        params: { q: query, limit, offset }
      });
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error searching blog posts:', error);
      return [];
    }
  },

  // Get posts by category
  getPostsByCategory: async (category: string, limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
    try {
      const response = await api.get<{ status: string; code: number; data: BlogPost[] }>(`/blog/category/${category}`, {
        params: { limit, offset }
      });
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
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

  // ========== ADMIN ENDPOINTS ==========

  // Get all blogs for admin (with pagination)
  getAllBlogs: async (limit: number = 10, offset: number = 0): Promise<BlogPost[]> => {
    try {
      const response = await api.get<{ message: string; data: BlogPost[] }>('/blog/admin', {
        params: { limit, offset }
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching all blogs:', error);
      throw error;
    }
  },

  // Get blog by ID for admin
  getBlogById: async (id: number): Promise<BlogPost> => {
    try {
      const response = await api.get<{ message: string; data: BlogPost }>(`/blog/admin/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      throw error;
    }
  },

  // Create blog
  createBlog: async (data: CreateBlogRequest): Promise<BlogPost> => {
    try {
      const response = await api.post<{ message: string; data: BlogPost }>('/blog/admin', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  },

  // Update blog
  updateBlog: async (id: number, data: UpdateBlogRequest): Promise<BlogPost> => {
    try {
      const response = await api.put<{ message: string; data: BlogPost }>(`/blog/admin/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  },

  // Delete blog
  deleteBlog: async (id: number): Promise<void> => {
    try {
      await api.delete(`/blog/admin/${id}`);
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  },

  // Get blog statistics
  getBlogStats: async (): Promise<BlogStats> => {
    try {
      const response = await api.get<{ message: string; data: BlogStats }>('/blog/admin/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching blog stats:', error);
      throw error;
    }
  },

  // ========== AI ENDPOINTS ==========

  // Generate blog content with AI
  generateBlogContent: async (data: GenerateBlogContentRequest): Promise<GenerateBlogContentResponse> => {
    try {
      const response = await api.post<{ message: string; data: GenerateBlogContentResponse }>('/blog/admin/ai/generate', data);
      return response.data.data;
    } catch (error) {
      console.error('Error generating blog content:', error);
      throw error;
    }
  },

  // Generate title suggestions with AI
  generateTitleSuggestions: async (data: GenerateTitleSuggestionsRequest): Promise<string[]> => {
    try {
      const response = await api.post<{ message: string; data: GenerateTitleSuggestionsResponse }>('/blog/admin/ai/titles', data);
      return response.data.data.titles;
    } catch (error) {
      console.error('Error generating title suggestions:', error);
      throw error;
    }
  },

  // Create blog with AI
  createBlogWithAI: async (data: CreateBlogWithAIRequest): Promise<BlogPost> => {
    try {
      const response = await api.post<{ message: string; data: BlogPost }>('/blog/admin/ai/create', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating blog with AI:', error);
      throw error;
    }
  },

  // Get blog AI history
  getBlogAIHistory: async (blogId: number): Promise<BlogAIHistory[]> => {
    try {
      const response = await api.get<{ message: string; data: BlogAIHistory[] }>(`/blog/admin/${blogId}/ai-history`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching blog AI history:', error);
      throw error;
    }
  },
};
