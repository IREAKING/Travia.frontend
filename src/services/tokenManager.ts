/**
 * Token Manager
 * Handles token refresh logic và retry failed requests
 */

import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

interface QueueItem {
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}

class TokenManager {
  private isRefreshing = false;
  private failedQueue: QueueItem[] = [];

  /**
   * Process failed request queue after successful refresh
   */
  private processQueue(error: Error | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else {
        promise.resolve();
      }
    });

    this.failedQueue = [];
  }

  /**
   * Setup axios interceptors for automatic token refresh
   */
  setupInterceptors(axiosInstance: AxiosInstance, refreshCallback: () => Promise<void>) {
    // Response interceptor
    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Skip refresh for login/register/public endpoints and payment endpoints (for debugging)
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
                               originalRequest?.url?.includes('/auth/register') ||
                               originalRequest?.url?.includes('/auth/createUser') ||
                               originalRequest?.url?.includes('/auth/refresh');
        
        // TEMPORARILY: Skip auto-redirect for payment endpoints to allow debugging
        const isPaymentEndpoint = originalRequest?.url?.includes('/payment/vnpay/create');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          if (this.isRefreshing) {
            // Add to queue if refresh is already in progress
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return axiosInstance(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Call refresh token API
            await refreshCallback();
            
            // Refresh successful - process queue
            this.processQueue();
            
            // Update Authorization header with new token before retry
            const newAccessToken = localStorage.getItem('accessToken');
            if (newAccessToken) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              } else {
                originalRequest.headers = {
                  Authorization: `Bearer ${newAccessToken}`,
                } as any;
              }
              console.log('✅ Updated Authorization header with new token for retry');
            } else {
              console.error('❌ No new accessToken found after refresh, cannot retry');
              throw new Error('No access token available after refresh');
            }
            
            // Retry original request
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed - process queue with error
            this.processQueue(refreshError as Error);
            
            // Clear auth data and redirect to login
            this.handleAuthFailure();
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Other errors or already retried
        if (error.response?.status === 401 && originalRequest._retry) {
          // TEMPORARILY: Skip auto-redirect for payment endpoints
          if (!isPaymentEndpoint) {
            this.handleAuthFailure();
          } else {
            console.log('⚠️ Payment endpoint 401 - skipping auto-redirect for debugging');
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure() {
    // Clear all auth data
    localStorage.removeItem('user');
    localStorage.removeItem('supplier');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login if not already there
    const currentPath = window.location.pathname;
    const publicPaths = ['/login', '/register', '/admin/login', '/supplier/login', '/'];
    
    // Skip auto-redirect for payment pages - let component handle it
    if (currentPath.startsWith('/payment/') || currentPath.startsWith('/booking/')) {
      console.log('⚠️ Payment/Booking page detected - skipping auto-redirect, letting component handle it');
      console.log('Current path:', currentPath);
      return; // Don't redirect, let the component handle it
    }
    
    if (!publicPaths.includes(currentPath)) {
      // Preserve intended destination for redirect after login
      const intendedPath = currentPath !== '/login' ? currentPath : null;
      if (intendedPath) {
        sessionStorage.setItem('redirectAfterLogin', intendedPath);
      }
      
      // Determine which login page based on current path
      if (currentPath.startsWith('/admin')) {
        window.location.href = '/admin/login';
      } else if (currentPath.startsWith('/supplier')) {
        window.location.href = '/supplier/login';
      } else {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Clear auth data completely
   */
  clearAuth() {
    localStorage.removeItem('user');
    localStorage.removeItem('supplier');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('redirectAfterLogin');
  }

  /**
   * Get redirect path after login
   */
  getRedirectPath(): string | null {
    const path = sessionStorage.getItem('redirectAfterLogin');
    if (path) {
      sessionStorage.removeItem('redirectAfterLogin');
    }
    return path;
  }
}

export const tokenManager = new TokenManager();

