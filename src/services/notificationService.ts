import { api } from './api';
import type { ApiResponse } from '../types';

// Notification Types
export interface Notification {
  id: number;
  nguoi_dung_id: string;
  tieu_de?: string;
  noi_dung?: string;
  loai?: 'booking' | 'payment' | 'system' | 'promotion';
  lien_ket?: string;
  da_doc?: boolean;
  ngay_tao?: string;
}

export interface GetNotificationsResponse {
  data: Notification[];
  unread_count: number;
  pagination: {
    limit: number;
    offset: number;
  };
}

export interface MarkAsReadResponse {
  message: string;
  data: Notification;
}

/**
 * Notification Service - Tích hợp tất cả endpoint thông báo từ backend
 */
export const notificationService = {
  /**
   * Lấy thông báo của người dùng
   * GET /notifications?limit=20&offset=0
   * 
   * @param limit - Số lượng kết quả
   * @param offset - Offset
   * @returns Promise<GetNotificationsResponse>
   */
  getMyNotifications: async (limit: number = 20, offset: number = 0): Promise<GetNotificationsResponse> => {
    const response = await api.get<GetNotificationsResponse>('/notifications', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Lấy thông báo chưa đọc
   * GET /notifications/unread?limit=20&offset=0
   * 
   * @param limit - Số lượng kết quả
   * @param offset - Offset
   * @returns Promise<Notification[]>
   */
  getUnreadNotifications: async (limit: number = 20, offset: number = 0): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications/unread', {
      params: { limit, offset },
    });
    return response.data.data || [];
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   * GET /notifications/count
   * 
   * @returns Promise<number>
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ unread_count: number }>('/notifications/count');
    return response.data.unread_count || 0;
  },

  /**
   * Đánh dấu thông báo đã đọc
   * PUT /notifications/:id/read
   * 
   * @param id - ID thông báo
   * @returns Promise<MarkAsReadResponse>
   */
  markAsRead: async (id: number): Promise<MarkAsReadResponse> => {
    const response = await api.put<ApiResponse<Notification>>(`/notifications/${id}/read`);
    return {
      message: response.data.message || 'Đánh dấu đã đọc thành công',
      data: response.data.data,
    };
  },

  /**
   * Đánh dấu tất cả thông báo đã đọc
   * PUT /notifications/read-all
   * 
   * @returns Promise<{ message: string }>
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/notifications/read-all');
    return response.data;
  },
};

