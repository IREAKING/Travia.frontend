import { api } from './api';
import type { LoginRequest, AuthResponse, RegisterRequest, OTPRequest, ChangePasswordRequest, ApiResponse } from '../types';

// User login
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login/user', credentials);
  console.log('Login response:', response.data);
  return response.data;
};

// Admin login
export const loginAdmin = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login/admin', credentials);
  return response.data;
};

// Supplier login
export const loginSupplier = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login/supplier', credentials);
  return response.data;
};

// Register - Step 1: Submit registration form
export const register = async (data: RegisterRequest): Promise<{ message: string; email: string }> => {
  const response = await api.post('/auth/createUserForm', data);
  return response.data;
};

// Register - Step 2: Verify OTP
export const verifyOTP = async (data: OTPRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/createUser', data);
  return response.data;
};

// Logout
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear all auth data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    const { tokenManager } = await import('./tokenManager');
    tokenManager.clearAuth();
  }
};

// Refresh token
export const refreshToken = async (): Promise<void> => {
  try {
    await api.post('/auth/refresh');
  } catch (error) {
    console.error('Refresh token error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  // Check if user data and access token exist
  const user = localStorage.getItem('user');
  const accessToken = localStorage.getItem('accessToken');
  return !!(user && accessToken);
};

// Store auth data
export const storeAuthData = (data: AuthResponse) => {
  // Store user data
  localStorage.setItem('user', JSON.stringify(data.user));
  
  // Store tokens in localStorage
  if (data.tokens) {
    localStorage.setItem('accessToken', data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.tokens.refreshToken);
  }
};

// OAuth URL helper
export const getOAuthUrl = (provider: 'google'): string => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  return `${baseUrl}/auth/oauth/${provider}`;
};

// Change password
export const changePassword = async (data: ChangePasswordRequest): Promise<{ message: string }> => {
  const response = await api.put<ApiResponse<{ message: string }>>('/auth/changePassword', data);
  // Backend trả về { message: "..." } hoặc { message: "...", data: {...} }
  return { message: response.data.message || 'Đổi mật khẩu thành công' };
};

export const authService = {
  loginUser,
  loginAdmin,
  loginSupplier,
  register,
  verifyOTP,
  logout,
  refreshToken,
  getCurrentUser,
  isAuthenticated,
  storeAuthData,
  getOAuthUrl,
  changePassword,
};
