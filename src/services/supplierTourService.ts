import { api } from './api';
import type { ApiResponse, TourCategory, Destination } from '../types';

// Re-export Destination for convenience
export type { Destination };
import type { 
  CreateTourRequest,
  AnhTourInput as TourImage,
  DiaDiemTourInput as TourDestination,
  HoatDongTrongNgayInput as Activity,
  LichTrinhTourInput as Itinerary,
  CauHinhNhomTourInput as GroupConfig,
  LichKhoiHanhTourInput as Departure
} from '../types/tour';

// Re-export các types để giữ compatibility với code hiện tại
export type { 
  CreateTourRequest,
  TourImage,
  TourDestination,
  Activity,
  Itinerary,
  GroupConfig,
  Departure
};

export const supplierTourService = {
  // Get tour categories for dropdown
  getCategories: async (): Promise<TourCategory[]> => {
    try {
      const response = await api.get<ApiResponse<TourCategory[]>>('/tour/categories');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get destinations for dropdown
  getDestinations: async (): Promise<Destination[]> => {
    try {
      const response = await api.get<ApiResponse<Destination[]>>('/destination/getAllDestination');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return [];
    }
  },

  // Get destinations with pagination and search
  getDestinationsPaginated: async (params?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ destinations: Destination[]; total: number }> => {
    try {
      const limit = params?.limit || 20;
      const offset = params?.offset || 0;
      
      // Use the new optimized endpoint for tour creation
      const response = await api.get<ApiResponse<{
        destinations: Destination[];
        total: number;
        limit: number;
        offset: number;
        has_more: boolean;
      }>>('/destination/for-tour-creation', {
        params: {
          limit,
          offset,
          search: params?.search || '',
        }
      });

      const data = response.data?.data;
      return {
        destinations: data?.destinations || [],
        total: data?.total || 0
      };
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return { destinations: [], total: 0 };
    }
  },

  // Get destinations in hierarchical structure
  getDestinationsHierarchical: async (): Promise<Record<string, Record<string, Destination[]>>> => {
    try {
      const response = await api.get<ApiResponse<Record<string, Record<string, Destination[]>>>>('/destination/hierarchical');
      return response.data?.data || {};
    } catch (error) {
      console.error('Error fetching hierarchical destinations:', error);
      return {};
    }
  },

  // Get countries list
  getCountries: async (): Promise<string[]> => {
    try {
      const response = await api.get<ApiResponse<Array<{ id: number; quoc_gia: string | null }>>>(`/destination/country`);
      const data = response.data?.data || [];
      // Extract unique country names
      const countrySet = new Set<string>();
      data.forEach(item => {
        if (item.quoc_gia) {
          countrySet.add(item.quoc_gia);
        }
      });
      return Array.from(countrySet).sort();
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },

  // Get provinces by country
  getProvincesByCountry: async (country: string): Promise<Array<{ id: number; tinh: string | null }>> => {
    try {
      const response = await api.get<ApiResponse<Array<{ id: number; tinh: string | null }>>>(`/destination/province/${encodeURIComponent(country)}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  // Get cities by province
  getCitiesByProvince: async (province: string): Promise<Array<{ id: number; ten: string }>> => {
    try {
      const response = await api.get<ApiResponse<Array<{ id: number; ten: string }>>>(`/destination/city/${encodeURIComponent(province)}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },

  // Create new tour
  createTour: async (tourData: CreateTourRequest): Promise<any> => {
    try {
      // Validate tour data before sending
      if (!tourData.tieu_de || !tourData.tieu_de.trim()) {
        throw new Error('Tiêu đề tour không được để trống');
      }
      
      // nha_cung_cap_id không cần validate - backend sẽ tự động lấy từ JWT

      if (!tourData.hinh_anh_tours || tourData.hinh_anh_tours.length === 0) {
        throw new Error('Tour phải có ít nhất 1 ảnh');
      }

      console.log('🚀 Creating tour:', {
        title: tourData.tieu_de,
        days: tourData.so_ngay,
        nights: tourData.so_dem,
        images: tourData.hinh_anh_tours.length,
        destinations: tourData.dia_diem_tours?.length || 0,
        itineraries: tourData.lich_trinh_tours?.length || 0,
        departures: tourData.lich_khoi_hanh_tours?.length || 0,
      });

      const response = await api.post<ApiResponse<any>>('/tour/', tourData, {
        // Add timeout for large tour data (60 seconds)
        timeout: 60000,
      });
      
      const result = response.data?.data;
      
      console.log('✅ Tour created successfully:', {
        id: result?.id,
        title: result?.tieu_de,
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ Error creating tour:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      // Add more context to timeout errors
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Vui lòng thử lại sau.');
      }
      
      throw error;
    }
  },

  // Get supplier's tours
  getMyTours: async (limit = 10, offset = 0, trang_thai?: string): Promise<any[]> => {
    try {
      const params: any = { limit, offset };
      // Nếu trang_thai là 'all' hoặc undefined, gửi '' để lấy tất cả
      // Nếu có giá trị cụ thể, gửi giá trị đó
      params.trang_thai = trang_thai === 'all' || !trang_thai ? '' : trang_thai;
      const response = await api.get<ApiResponse<any[]>>('/supplier/tours/my', { params });
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching my tours:', error);
      return [];
    }
  },

  // Get tour by ID
  getTourById: async (tourId: number): Promise<any> => {
    try {
      const response = await api.get<ApiResponse<any>>(`/tour/${tourId}`);
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching tour:', error);
      throw error;
    }
  },

  // Update tour - matches UpdateTourRequest from backend
  updateTour: async (tourId: number, tourData: {
    tieu_de: string;
    mo_ta?: string;
    danh_muc_id?: number;
    so_ngay: number;
    so_dem?: number;
    gia_nguoi_lon: number;
    gia_tre_em: number;
    don_vi_tien_te?: string;
    trang_thai?: string;
    noi_bat?: boolean;
    nha_cung_cap_id: string; // UUID string
  }): Promise<any> => {
    try {
      console.log(`📡 API Request: PUT /tour/${tourId}`, tourData);
      const response = await api.put<ApiResponse<any>>(`/tour/${tourId}`, tourData);
      console.log('✅ API Response:', response.data);
      return response.data?.data;
    } catch (error: any) {
      console.error('❌ Error updating tour:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      throw error;
    }
  },

  // Update tour status only
  updateTourStatus: async (tourId: number, trang_thai: 'nhap' | 'cong_bo' | 'luu_tru'): Promise<any> => {
    try {
      const response = await api.put<ApiResponse<any>>(`/supplier/tours/update-status/${tourId}`, null, {
        params: { trang_thai }
      });
      return response.data?.data;
    } catch (error) {
      console.error('Error updating tour status:', error);
      throw error;
    }
  },

  // Update itinerary (lịch trình)
  updateItinerary: async (itineraryId: number, data: {
    ngay_thu?: number;
    tieu_de?: string;
    mo_ta?: string;
    gio_bat_dau?: string;
    gio_ket_thuc?: string;
    dia_diem?: string;
    thong_tin_luu_tru?: string;
  }): Promise<any> => {
    try {
      const response = await api.put<ApiResponse<any>>(`/departure/lich-trinh/${itineraryId}`, data);
      return response.data?.data;
    } catch (error) {
      console.error('Error updating itinerary:', error);
      throw error;
    }
  },

  // Update activity (hoạt động trong ngày)
  updateActivity: async (activityId: number, data: {
    ten?: string;
    gio_bat_dau?: string;
    gio_ket_thuc?: string;
    mo_ta?: string;
    thu_tu?: number;
  }): Promise<any> => {
    try {
      const response = await api.put<ApiResponse<any>>(`/departure/hoat-dong-trong-ngay/${activityId}`, data);
      return response.data?.data;
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  },

  // Delete tour
  deleteTour: async (tourId: number): Promise<void> => {
    try {
      await api.delete(`/tour/${tourId}`);
    } catch (error) {
      console.error('Error deleting tour:', error);
      throw error;
    }
  },

  // ==================== DEPARTURE MANAGEMENT ====================
  
  // Create departure
  createDeparture: async (departureData: {
    tour_id: number;
    ngay_khoi_hanh: string; // Format: YYYY-MM-DD
    ngay_ket_thuc: string; // Format: YYYY-MM-DD
    suc_chua: number;
    trang_thai?: string;
    huong_dan_vien_id?: string;
    gia_dac_biet?: number;
    ghi_chu?: string;
  }): Promise<any> => {
    try {
      const response = await api.post<ApiResponse<any>>('/departure/create', departureData);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error creating departure:', error);
      throw new Error(error.response?.data?.error || 'Không thể tạo lịch khởi hành');
    }
  },

  // Update departure
  updateDeparture: async (departureId: number, departureData: {
    ngay_khoi_hanh?: string;
    ngay_ket_thuc?: string;
    suc_chua?: number;
    trang_thai?: string;
    huong_dan_vien_id?: string;
    gia_dac_biet?: number;
    ghi_chu?: string;
  }): Promise<any> => {
    try {
      const response = await api.put<ApiResponse<any>>(`/departure/${departureId}`, departureData);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error updating departure:', error);
      throw new Error(error.response?.data?.error || 'Không thể cập nhật lịch khởi hành');
    }
  },

  // Delete departure
  deleteDeparture: async (departureId: number): Promise<void> => {
    try {
      await api.delete(`/departure/${departureId}`);
    } catch (error: any) {
      console.error('Error deleting departure:', error);
      throw new Error(error.response?.data?.error || 'Không thể xóa lịch khởi hành');
    }
  },

  // Cancel departure
  cancelDeparture: async (departureId: number): Promise<any> => {
    try {
      const response = await api.put<ApiResponse<any>>(`/departure/${departureId}/cancel`);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error canceling departure:', error);
      throw new Error(error.response?.data?.error || 'Không thể hủy lịch khởi hành');
    }
  },

  // Get departures by tour
  getDeparturesByTour: async (tourId: number): Promise<any[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/departure/tour/${tourId}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching departures:', error);
      return [];
    }
  },

  // ==================== DISCOUNT MANAGEMENT ====================
  
  // Create discount tour
  createDiscountTour: async (discountData: {
    tour_id: number;
    phan_tram: number; // Percentage (0-100)
    ngay_bat_dau: string; // Format: YYYY-MM-DD
    ngay_ket_thuc: string; // Format: YYYY-MM-DD
  }): Promise<any> => {
    try {
      const response = await api.post<ApiResponse<any>>('/tour/discount', discountData);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error creating discount tour:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Không thể tạo khuyến mãi tour');
    }
  },

  // Update discount tour
  updateDiscountTour: async (discountData: {
    id: number;
    tour_id: number;
    phan_tram: number; // Percentage (0-100)
    ngay_bat_dau: string; // Format: YYYY-MM-DD
    ngay_ket_thuc: string; // Format: YYYY-MM-DD
  }): Promise<any> => {
    try {
      const response = await api.put<ApiResponse<any>>('/tour/discount', discountData);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error updating discount tour:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Không thể cập nhật khuyến mãi tour');
    }
  },

  // Delete discount tour
  deleteDiscountTour: async (discountId: number, tourId?: number): Promise<void> => {
    try {
      // If tourId is provided, add it as query param (in case backend needs it)
      const url = tourId 
        ? `/tour/discount/${discountId}?tour_id=${tourId}`
        : `/tour/discount/${discountId}`;
      await api.delete(url);
    } catch (error: any) {
      console.error('Error deleting discount tour:', error);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Không thể xóa khuyến mãi tour');
    }
  },

  // Get discounts by tour ID
  getDiscountsByTour: async (tourId: number): Promise<any[]> => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/tour/discount/${tourId}`);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error fetching discounts:', error);
      // Return empty array if no discounts found or error
      return [];
    }
  },

  // ==================== TOUR IMAGE MANAGEMENT ====================
  
  // Add image to tour
  addTourImage: async (tourId: number, imageData: {
    duong_dan: string;
    mo_ta?: string;
    la_anh_chinh?: boolean;
    thu_tu_hien_thi?: number;
  }): Promise<any> => {
    try {
      const response = await api.post<ApiResponse<any>>(`/departure/add-hinh-anh/${tourId}`, imageData);
      return response.data?.data;
    } catch (error: any) {
      console.error('Error adding tour image:', error);
      throw new Error(error.response?.data?.error || 'Không thể thêm hình ảnh');
    }
  },

  // Delete image from tour
  deleteTourImage: async (imageId: number): Promise<void> => {
    try {
      await api.delete(`/departure/delete-hinh-anh/${imageId}`);
    } catch (error: any) {
      console.error('Error deleting tour image:', error);
      throw new Error(error.response?.data?.error || 'Không thể xóa hình ảnh');
    }
  },

  // ==================== TOUR DESTINATION MANAGEMENT ====================
  
  // Add destination to tour
  addTourDestination: async (tourId: number, destinationData: {
    diem_den_id: number;
    thu_tu_tham_quan?: number;
  }): Promise<void> => {
    try {
      await api.post(`/departure/add-tour-destination/${tourId}`, destinationData);
    } catch (error: any) {
      console.error('Error adding tour destination:', error);
      throw new Error(error.response?.data?.error || 'Không thể thêm điểm đến');
    }
  },

  // Delete destination from tour
  deleteTourDestination: async (tourId: number, diemDenId: number): Promise<void> => {
    try {
      await api.delete(`/departure/delete-tour-destination/${tourId}/${diemDenId}`);
    } catch (error: any) {
      console.error('Error deleting tour destination:', error);
      throw new Error(error.response?.data?.error || 'Không thể xóa điểm đến');
    }
  },
};
