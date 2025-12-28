import { api } from './api';
import type { TourReview, ReviewsResponse } from '../types';

export interface CreateReviewRequest {
  tour_id: number;
  diem_so: number;
  binh_luan: string;
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
      // Backend trả về mảng với 1 phần tử
      return response.data.data[0] || {
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
  createReview: async (reviewData: CreateReviewRequest): Promise<TourReview> => {
    try {
      const response = await api.post<{ data: TourReview }>(
        `/tour/${reviewData.tour_id}/reviews`,
        reviewData
      );
      return response.data.data;
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
};

