import { api } from './api';
import type { 
  Tour, 
  TourCategory, 
  ApiResponse,
  FilterToursParams,
  SearchToursParams
} from '../types';
import type { GetAllTour } from '../types/tour';

export const tourService = {
  // Get all tour categories
  getAllCategories: async (): Promise<TourCategory[]> => {
    try {
      const response = await api.get<ApiResponse<TourCategory[]>>('/tour/categories');
      console.log('Categories API Response:', response.data);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get all tours
  getAllTours: async (): Promise<GetAllTour[]> => {
    try {
      const response = await api.get<ApiResponse<GetAllTour[]>>('/tour/');
      console.log('Tours API Response:', response.data);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching tours:', error);
      return [];
    }
  },

  // Get tour by ID
  getTourById: async (id: number): Promise<Tour> => {
    try {
      const response = await api.get<ApiResponse<Tour>>(`/tour/${id}`);
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching tour:', error);
      throw error;
    }
  },

  // Filter tours
  filterTours: async (params: FilterToursParams): Promise<Tour[]> => {
    try {
      const response = await api.get<ApiResponse<Tour[]>>('/tour/filter', { params });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error filtering tours:', error);
      return [];
    }
  },

  // Search tours with advanced params
  searchTours: async (params: SearchToursParams): Promise<GetAllTour[]> => {
    try {
      const response = await api.get<ApiResponse<GetAllTour[]>>('/tour/search', {
        params: {
          query: params.query || undefined,
          diem_den_id: params.diem_den_id || undefined,
          diem_den_ten: params.diem_den_ten || undefined,
          so_ngay_min: params.so_ngay_min || undefined,
          so_ngay_max: params.so_ngay_max || undefined,
          so_dem_min: params.so_dem_min || undefined,
          so_dem_max: params.so_dem_max || undefined,
          limit: params.limit || 20,
          offset: params.offset || 0,
        },
      });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error searching tours:', error);
      return [];
    }
  },
};

