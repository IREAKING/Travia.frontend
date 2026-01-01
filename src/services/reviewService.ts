import { api } from './api';
import type { TourReview, ReviewsResponse } from '../types';

export interface CreateReviewRequest {
  tour_id?: number; // Deprecated - sử dụng dat_cho_id thay thế
  dat_cho_id: number; // ID của booking đã hoàn thành
  diem_danh_gia: number; // Điểm đánh giá từ 1-5
  tieu_de?: string; // Tiêu đề đánh giá (optional)
  noi_dung?: string; // Nội dung đánh giá (optional)
  hinh_anh_dinh_kem?: string[]; // Mảng URL ảnh đính kèm (optional)
  
  // Legacy fields (deprecated)
  diem_so?: number;
  binh_luan?: string;
  hinh_anh?: string[];
}

export const reviewService = {
  // Get reviews - API trả về trực tiếp data, không có wrapper
  getTourReviews: async (
    tourId: number
  ): Promise<ReviewsResponse> => {
    try {
      const response = await api.get<{ data: ReviewsResponse[] }>(
        `/tour/${tourId}/reviews`
      );
      
      // Kiểm tra response.data và response.data.data trước khi truy cập
      if (response?.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
        return response.data.data[0];
      }
      
      // Nếu response.data.data là một object trực tiếp (không phải array)
      if (response?.data?.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
        return response.data.data as ReviewsResponse;
      }
      
      // Trả về cấu trúc rỗng nếu không có dữ liệu
      return {
        thong_tin_danh_gia: [],
        tong_so_danh_gia: 0,
        diem_trung_binh: 0,
        so_luong_5_sao: 0,
        so_luong_4_sao: 0,
        so_luong_3_sao: 0,
        so_luong_2_sao: 0,
        so_luong_1_sao: 0,
      };
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Return empty data structure on error
      return {
        thong_tin_danh_gia: [],
        tong_so_danh_gia: 0,
        diem_trung_binh: 0,
        so_luong_5_sao: 0,
        so_luong_4_sao: 0,
        so_luong_3_sao: 0,
        so_luong_2_sao: 0,
        so_luong_1_sao: 0,
      };
    }
  },

  // Create new review (authenticated users only)
  // Sử dụng dat_cho_id để tạo đánh giá cho booking đã hoàn thành
  createReview: async (reviewData: CreateReviewRequest): Promise<TourReview> => {
    try {
      // Nếu có dat_cho_id, sử dụng endpoint mới
      if (reviewData.dat_cho_id) {
        const response = await api.post<{ data: TourReview; message: string }>(
          `/review/create`,
          {
            dat_cho_id: reviewData.dat_cho_id,
            diem_danh_gia: reviewData.diem_danh_gia,
            tieu_de: reviewData.tieu_de,
            noi_dung: reviewData.noi_dung,
            hinh_anh_dinh_kem: reviewData.hinh_anh_dinh_kem || reviewData.hinh_anh,
          }
        );
        return response.data.data;
      }
      
      // Legacy endpoint (deprecated)
      if (reviewData.tour_id) {
        const response = await api.post<{ data: TourReview }>(
          `/tour/${reviewData.tour_id}/reviews`,
          {
            diem_so: reviewData.diem_danh_gia || reviewData.diem_so,
            binh_luan: reviewData.noi_dung || reviewData.binh_luan,
            hinh_anh: reviewData.hinh_anh_dinh_kem || reviewData.hinh_anh,
          }
        );
        return response.data.data;
      }
      
      throw new Error('dat_cho_id hoặc tour_id là bắt buộc');
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Update review
  updateReview: async (reviewId: number, reviewData: Partial<CreateReviewRequest>): Promise<TourReview> => {
    try {
      const response = await api.put<{ data: TourReview }>(
        `/reviews/${reviewId}`,
        reviewData
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },

  // Delete review
  deleteReview: async (reviewId: number): Promise<void> => {
    try {
      await api.delete(`/reviews/${reviewId}`);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },

  // Check review status for a booking
  checkReviewStatus: async (datChoId: number): Promise<{ has_review: boolean }> => {
    try {
      const response = await api.get<{ data: { dat_cho_id: number; has_review: boolean } }>(
        `/review/check/${datChoId}`
      );
      return { has_review: response.data.data.has_review };
    } catch (error) {
      console.error('Error checking review status:', error);
      // Nếu lỗi, mặc định trả về false (chưa có review)
      return { has_review: false };
    }
  },
};

