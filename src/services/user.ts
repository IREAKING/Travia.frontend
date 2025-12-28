import { api } from './api';
import type { ApiResponse, User } from '../types';

export interface UserDetail extends User {
  tong_dat_cho?: number;
  tong_dat_cho_da_thanh_toan?: number;
  tong_dat_cho_dang_cho_xac_nhan?: number;
  ngay_cap_nhat?: string;
  ngay_tao?: string;
}

export interface UpdateUserRequest {
  full_name: string;
  email: string;
  phone?: string | null;
}

export const userService = {
  // Lấy thông tin user theo ID (với thống kê)
  getUserById: async (id: string): Promise<UserDetail> => {
    const response = await api.get<ApiResponse<UserDetail>>(`/auth/getUserById/${id}`);
    return response.data.data;
  },
  // Cập nhật thông tin user (lấy user ID từ JWT token)
  updateUser: async (userData: UpdateUserRequest): Promise<User> => {
    const response = await api.put<ApiResponse<User>>(`/auth/updateUser`, userData);
    return response.data.data;
  },
};