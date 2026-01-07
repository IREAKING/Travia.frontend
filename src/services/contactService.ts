import { api } from './api';
import type { ApiResponse } from '../types';

// Contact Types
export interface Contact {
  id: number;
  ho_ten: string;
  email: string;
  so_dien_thoai?: string;
  tieu_de: string;
  noi_dung: string;
  nguoi_dung_id?: string;
  trang_thai?: string;
  da_doc?: boolean;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
  ten_nguoi_dung?: string;
  email_nguoi_dung?: string;
}

export interface CreateContactRequest {
  ho_ten: string;
  email: string;
  so_dien_thoai?: string;
  tieu_de: string;
  noi_dung: string;
}

export interface CreateContactResponse {
  message: string;
  data: Contact;
}

export interface GetContactsResponse {
  data: Contact[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface UpdateContactStatusRequest {
  trang_thai: 'moi' | 'dang_xu_ly' | 'da_phan_hoi' | 'da_dong';
  da_doc?: boolean;
}

export interface UpdateContactStatusResponse {
  message: string;
  data: Contact;
}

export interface MarkAsReadResponse {
  message: string;
  data: Contact;
}

/**
 * Contact Service - Tích hợp tất cả endpoint liên hệ từ backend
 */
export const contactService = {
  /**
   * Tạo liên hệ mới (công khai, không cần auth)
   * POST /contact
   * 
   * @param data - Thông tin liên hệ
   * @returns Promise<CreateContactResponse>
   */
  createContact: async (data: CreateContactRequest): Promise<CreateContactResponse> => {
    const response = await api.post<ApiResponse<Contact>>('/contact', data);
    return {
      message: response.data.message || 'Gửi liên hệ thành công',
      data: response.data.data,
    };
  },

  /**
   * Lấy tất cả liên hệ (Admin only)
   * GET /contact?limit=20&offset=0
   * 
   * @param limit - Số lượng kết quả
   * @param offset - Offset
   * @returns Promise<GetContactsResponse>
   */
  getAllContacts: async (limit: number = 20, offset: number = 0): Promise<GetContactsResponse> => {
    const response = await api.get<{ data: Contact[]; pagination: { total: number; limit: number; offset: number } }>('/contact', {
      params: { limit, offset },
    });
    
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {
        total: 0,
        limit,
        offset,
      },
    };
  },

  /**
   * Lấy liên hệ theo ID (Admin only)
   * GET /contact/:id
   * 
   * @param id - ID liên hệ
   * @returns Promise<Contact>
   */
  getContactById: async (id: number): Promise<Contact> => {
    const response = await api.get<ApiResponse<Contact>>(`/contact/${id}`);
    return response.data.data;
  },

  /**
   * Cập nhật trạng thái liên hệ (Admin only)
   * PUT /contact/:id/status
   * 
   * @param id - ID liên hệ
   * @param data - Thông tin cập nhật
   * @returns Promise<UpdateContactStatusResponse>
   */
  updateContactStatus: async (
    id: number,
    data: UpdateContactStatusRequest
  ): Promise<UpdateContactStatusResponse> => {
    const response = await api.put<ApiResponse<Contact>>(`/contact/${id}/status`, data);
    return {
      message: response.data.message || 'Cập nhật trạng thái thành công',
      data: response.data.data,
    };
  },

  /**
   * Lấy liên hệ theo trạng thái (Admin only)
   * GET /contact/status/:status?limit=20&offset=0
   * 
   * @param status - Trạng thái (moi, dang_xu_ly, da_phan_hoi, da_dong)
   * @param limit - Số lượng kết quả
   * @param offset - Offset
   * @returns Promise<GetContactsResponse>
   */
  getContactsByStatus: async (
    status: 'moi' | 'dang_xu_ly' | 'da_phan_hoi' | 'da_dong',
    limit: number = 20,
    offset: number = 0
  ): Promise<GetContactsResponse> => {
    const response = await api.get<{ data: Contact[]; pagination: { total: number; limit: number; offset: number } }>(`/contact/status/${status}`, {
      params: { limit, offset },
    });
    
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {
        total: 0,
        limit,
        offset,
      },
    };
  },

  /**
   * Lấy danh sách liên hệ chưa đọc (Admin only)
   * GET /contact/unread?limit=20&offset=0
   * 
   * @param limit - Số lượng kết quả
   * @param offset - Offset
   * @returns Promise<Contact[]>
   */
  getUnreadContacts: async (limit: number = 20, offset: number = 0): Promise<Contact[]> => {
    const response = await api.get<ApiResponse<Contact[]>>('/contact/unread', {
      params: { limit, offset },
    });
    return response.data.data || [];
  },

  /**
   * Đánh dấu liên hệ đã đọc (Admin only)
   * PUT /contact/:id/read
   * 
   * @param id - ID liên hệ
   * @returns Promise<MarkAsReadResponse>
   */
  markContactAsRead: async (id: number): Promise<MarkAsReadResponse> => {
    const response = await api.put<ApiResponse<Contact>>(`/contact/${id}/read`);
    return {
      message: response.data.message || 'Đánh dấu đã đọc thành công',
      data: response.data.data,
    };
  },

  /**
   * Tạo phản hồi cho liên hệ (Admin only)
   * POST /contact/:id/response
   * 
   * @param contactId - ID liên hệ
   * @param noiDung - Nội dung phản hồi
   * @returns Promise<CreateContactResponseResponse>
   */
  createContactResponse: async (contactId: number, noiDung: string): Promise<CreateContactResponseResponse> => {
    try {
      console.log('Sending contact response:', { contactId, noiDungLength: noiDung.length });
      
      const response = await api.post<ApiResponse<ContactResponse>>(`/contact/${contactId}/response`, {
        noi_dung: noiDung,
      });
      
      console.log('Contact response received:', response.data);
      
      // Handle both response formats
      if (response.data && response.data.data) {
        return {
          message: response.data.message || 'Phản hồi đã được gửi thành công',
          data: response.data.data,
        };
      } else if (response.data) {
        // If data is directly in response
        return {
          message: response.data.message || 'Phản hồi đã được gửi thành công',
          data: response.data as any,
        };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Error in createContactResponse:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Lấy danh sách phản hồi của liên hệ (Admin only)
   * GET /contact/:id/responses
   * 
   * @param contactId - ID liên hệ
   * @returns Promise<ContactResponse[]>
   */
  getContactResponses: async (contactId: number): Promise<ContactResponse[]> => {
    const response = await api.get<ApiResponse<ContactResponse[]>>(`/contact/${contactId}/responses`);
    return response.data.data || [];
  },
};

// Contact Response Types
export interface ContactResponse {
  id: number;
  lien_he_id: number;
  nguoi_phan_hoi_id: string;
  noi_dung: string;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
  ten_nguoi_phan_hoi?: string;
  email_nguoi_phan_hoi?: string;
}

export interface CreateContactResponseResponse {
  message: string;
  data: ContactResponse;
}

