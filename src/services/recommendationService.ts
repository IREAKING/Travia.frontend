import { api } from './api';
import type { ApiResponse } from '../types';
import type { GetAllTour } from '../types/tour';

// Interface cho lưu lịch sử xem tour
export interface TrackTourViewRequest {
  tour_id: number;
  thoi_luong_xem_giay: number;
}

export interface TrackTourViewResponse {
  message: string;
}

// Interface cho tour gợi ý
export interface RecommendedToursResponse {
  message: string;
  data: GetAllTour[];
  method: string;
}

// Interface cho tour tương tự
export interface SimilarToursResponse {
  message: string;
  data: GetAllTour[];
  note?: string;
  tour_embedding_id?: number;
}

// Interface cho tour gợi ý bằng AI
export interface AIRecommendedToursResponse {
  message: string;
  data: {
    tours: GetAllTour[];
    ai_recommendation: string;
  };
  method: string;
}

export const recommendationService = {
  // Lưu lịch sử xem tour
  trackTourView: async (request: TrackTourViewRequest): Promise<TrackTourViewResponse> => {
    try {
      const response = await api.post<ApiResponse<TrackTourViewResponse>>(
        '/recommendation/track-view',
        request
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error tracking tour view:', error);
      throw error;
    }
  },

  // Lấy danh sách tour được gợi ý
  getRecommendedTours: async (
    method: 'preferences' | 'destinations' | 'history' | 'ai' = 'preferences',
    limit: number = 10,
    offset: number = 0
  ): Promise<RecommendedToursResponse | AIRecommendedToursResponse> => {
    try {
      const response = await api.get<ApiResponse<RecommendedToursResponse | AIRecommendedToursResponse>>(
        '/recommendation/tours',
        {
          params: {
            method,
            limit,
            offset,
          },
        }
      );
      // Backend trả về { message, data, method }
      // response.data là ApiResponse wrapper, response.data.data là actual data
      // Nhưng cần giữ lại cấu trúc để component có thể phân biệt AI vs normal
      if (response.data && response.data.data) {
        // response.data.data đã là RecommendedToursResponse hoặc AIRecommendedToursResponse
        return response.data.data as RecommendedToursResponse | AIRecommendedToursResponse;
      }
      // Fallback: nếu không có data, trả về empty với cấu trúc đúng
      if (method === 'ai') {
        return {
          message: 'Không có tour gợi ý',
          data: {
            tours: [],
            ai_recommendation: '',
          },
          method: method,
        } as AIRecommendedToursResponse;
      }
      return {
        message: 'Không có tour gợi ý',
        data: [],
        method: method,
      } as RecommendedToursResponse;
    } catch (error: any) {
      console.error('Error getting recommended tours:', error);
      throw error;
    }
  },

  // Lấy tour tương tự
  getSimilarTours: async (
    tourId: number,
    limit: number = 5
  ): Promise<SimilarToursResponse> => {
    try {
      const response = await api.get<ApiResponse<SimilarToursResponse>>(
        `/recommendation/similar/${tourId}`,
        {
          params: {
            limit,
          },
        }
      );
      return response.data.data;
    } catch (error: any) {
      console.error('Error getting similar tours:', error);
      throw error;
    }
  },
};

