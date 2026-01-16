import { api } from './api';

/**
 * Service để tương tác với API điểm đến (destination)
 */

export interface Country {
  id: number;
  quoc_gia?: string | null;
}

export interface Province {
  id: number;
  tinh?: string | null;
}

export interface City {
  id: number;
  ten: string;
}

export interface PopularDestination {
  id: number;
  ten: string;
  tinh?: string | null;
  quoc_gia?: string | null;
  khu_vuc?: string | null;
  mo_ta?: string | null;
  anh?: string | null;
  vi_do?: any;
  kinh_do?: any;
  so_luong_tour: number;
}

export interface TopPopularDestination {
  id: number;
  ten: string;
  tinh?: string | null;
  quoc_gia?: string | null;
  khu_vuc?: string | null;
  mo_ta?: string | null;
  anh?: string | null;
  vi_do?: any;
  kinh_do?: any;
  so_luong_tour: number;
  so_tour_noi_bat: number;
}

export interface Destination {
  id: number;
  ten: string;
  tinh?: string | null;
  quoc_gia?: string | null;
  khu_vuc?: string | null;
  iso2?: string | null;
  iso3?: string | null;
  mo_ta?: string | null;
  anh?: string | null;
  vi_do?: any;
  kinh_do?: any;
  ngay_tao?: string | null;
  ngay_cap_nhat?: string | null;
}

export interface CreateDestinationRequest {
  ten: string;
  quoc_gia?: string | null;
  khu_vuc?: string | null;
  mo_ta?: string | null;
  anh?: string | null;
  vi_do?: number | null;
  kinh_do?: number | null;
}

export const destinationService = {
  /**
   * Lấy danh sách tất cả quốc gia
   * GET /destination/country
   */
  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await api.get<{ message: string; data: Country[] }>('/destination/country');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách tỉnh/thành theo quốc gia
   * GET /destination/province/:country
   */
  getProvincesByCountry: async (country: string): Promise<Province[]> => {
    try {
      const response = await api.get<{ message: string; data: Province[] }>(
        `/destination/province/${encodeURIComponent(country)}`
      );
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách thành phố theo tỉnh/thành
   * GET /destination/city/:province
   */
  getCitiesByProvince: async (province: string): Promise<City[]> => {
    try {
      const response = await api.get<{ message: string; data: City[] }>(
        `/destination/city/${encodeURIComponent(province)}`
      );
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách điểm đến phổ biến nhất
   * GET /destination/popular?limit=10
   */
  getPopularDestinations: async (limit: number = 10): Promise<PopularDestination[]> => {
    try {
      const response = await api.get<{ message: string; data: PopularDestination[] }>(
        '/destination/popular',
        {
          params: { limit }
        }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      return [];
    }
  },

  /**
   * Lấy top điểm đến phổ biến nhất với thông tin chi tiết
   * GET /destination/top?limit=10
   */
  getTopPopularDestinations: async (limit: number = 10): Promise<TopPopularDestination[]> => {
    try {
      const response = await api.get<{ message: string; data: TopPopularDestination[] }>(
        '/destination/top',
        {
          params: { limit }
        }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching top popular destinations:', error);
      return [];
    }
  },

  /**
   * Lấy thông tin điểm đến theo ID
   * GET /destination/:id
   */
  getDestinationById: async (id: number): Promise<Destination> => {
    try {
      const response = await api.get<{ message: string; data: Destination }>(
        `/destination/${id}`
      );
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching destination:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tours theo điểm đến
   * GET /destination/:id/tours?limit=10&offset=0
   */
  getToursByDestination: async (id: number, limit: number = 10, offset: number = 0): Promise<any[]> => {
    try {
      const response = await api.get<{ message: string; data: any[] }>(
        `/destination/${id}/tours`,
        {
          params: { limit, offset }
        }
      );
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching tours by destination:', error);
      return [];
    }
  },

  /**
   * Tạo điểm đến mới (cần quyền admin)
   * POST /destination/createDestination
   */
  createDestination: async (data: CreateDestinationRequest): Promise<any> => {
    try {
      const response = await api.post<{ message: string; data: any }>(
        '/destination/createDestination',
        data
      );
      return response.data?.data;
    } catch (error) {
      console.error('Error creating destination:', error);
      throw error;
    }
  },

  /**
   * Cập nhật hình ảnh cho điểm đến (cần quyền admin)
   * PUT /destination/:id/image
   */
  updateDestinationImage: async (id: number, imageUrl: string): Promise<Destination> => {
    try {
      const response = await api.put<{ message: string; data: Destination }>(
        `/destination/${id}/image`,
        { anh: imageUrl }
      );
      return response.data?.data;
    } catch (error) {
      console.error('Error updating destination image:', error);
      throw error;
    }
  }
};
