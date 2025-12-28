import { api } from './api';
// import type { ApiResponse } from '../types';

export interface CreateVNPayPaymentRequest {
  booking_id: number;
  return_url?: string;
}

export interface CreateVNPayPaymentResponse {
  payment_url: string;
  transaction_code: string;
  booking_id: number;
  message?: string;
}

/**
 * Payment Service - Tích hợp tất cả endpoint thanh toán từ backend
 */
class PaymentService {
  /**
   * Tạo URL thanh toán VNPay
   * POST /payment/vnpay/create
   * 
   * @param bookingId - ID của booking cần thanh toán
   * @param returnUrl - URL để VNPay redirect về sau khi thanh toán (optional)
   * @returns Promise<CreateVNPayPaymentResponse>
   */
  async createVNPayPayment(
    bookingId: number,
    returnUrl?: string
  ): Promise<CreateVNPayPaymentResponse> {
    const defaultReturnUrl = `${window.location.origin}/payment/vnpay/return`;
    
    try {
      const response = await api.post<CreateVNPayPaymentResponse>(
        '/payment/vnpay/create',
        {
          booking_id: bookingId,
          return_url: returnUrl || defaultReturnUrl,
        }
      );
      
      // Backend trả về trực tiếp object: { payment_url, transaction_code, booking_id }
      return response.data;
    } catch (error: any) {
      // Xử lý lỗi từ backend
      if (error?.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  }

  /**
   * Redirect đến VNPay payment page
   * 
   * @param paymentUrl - URL thanh toán từ VNPay
   */
  redirectToVNPay(paymentUrl: string): void {
    if (!paymentUrl) {
      throw new Error('Payment URL is required');
    }
    window.location.href = paymentUrl;
  }

  /**
   * Xử lý VNPay Return Callback
   * GET /payment/vnpay/return
   * 
   * Note: Endpoint này được VNPay gọi trực tiếp, không cần gọi từ frontend
   * Frontend chỉ cần đọc query params từ URL redirect
   */
  parseVNPayReturnParams(): {
    status: 'success' | 'failed';
    booking_id?: number;
    transaction_code?: string;
    error_code?: string;
    error?: string;
  } {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status') === 'success' ? 'success' : 'failed';
    const bookingId = params.get('booking_id') ? parseInt(params.get('booking_id')!) : undefined;
    const transactionCode = params.get('transaction_code') || undefined;
    const errorCode = params.get('error_code') || undefined;
    const error = params.get('error') || undefined;

    return {
      status,
      booking_id: bookingId,
      transaction_code: transactionCode,
      error_code: errorCode,
      error,
    };
  }
}

export const paymentService = new PaymentService();

