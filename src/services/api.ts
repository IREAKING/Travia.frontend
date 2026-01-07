import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { tokenManager } from './tokenManager';
// 'https://travia-backend-363518914287.asia-southeast1.run.app/api' || 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://travia-backend-363518914287.asia-southeast1.run.app/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false, // No longer using cookies
      timeout: 30000, // 30 seconds timeout
    });

    // Request interceptor - add Authorization header from localStorage
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Debug: Log full URL
        const fullUrl = `${config.baseURL}${config.url}`;
        console.log('📤 API Request:', config.method?.toUpperCase(), fullUrl);
        
        // Get access token from localStorage
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
          // Debug logging for protected endpoints
          const protectedPaths = ['/booking/create', '/booking/add-passengers', '/booking/my-bookings', '/payment/'];
          const isProtected = protectedPaths.some(path => config.url?.includes(path));
          if (isProtected) {
            console.log('🔐 Adding Authorization header for:', fullUrl);
            console.log('Token length:', accessToken.length);
            console.log('Token preview:', accessToken.substring(0, 20) + '...');
          }
        } else {
          // Log warning if no token for protected endpoints
          const protectedPaths = ['/booking/create', '/booking/add-passengers', '/booking/my-bookings', '/payment/'];
          const isProtected = protectedPaths.some(path => config.url?.includes(path));
          if (isProtected) {
            console.error('❌ No accessToken found for protected endpoint:', fullUrl);
            console.error('localStorage accessToken:', localStorage.getItem('accessToken'));
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup token manager interceptors for auto-refresh
    tokenManager.setupInterceptors(
      this.axiosInstance,
      this.refreshToken.bind(this)
    );
  }

  /**
   * Refresh access token
   * Called automatically by tokenManager when 401 occurs
   */
  private async refreshToken(): Promise<void> {
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token found');
      }

      // Call refresh endpoint with refresh token in body
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: refreshToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update tokens in localStorage
      if (response.data.tokens) {
        localStorage.setItem('accessToken', response.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.tokens.refreshToken);
        console.log('✅ Token refreshed successfully');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  }

  getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const apiService = new ApiService();
export const api = apiService.getInstance();

