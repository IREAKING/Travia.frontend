import { api } from './api';

export interface FavoriteTour {
  id: number;
  nguoi_dung_id: string;
  tour_id: number;
  ngay_tao?: string;
}

export interface CreateFavoriteRequest {
  tour_id: number;
}

export interface DeleteFavoriteRequest {
  tour_id: number;
}

export interface GetFavoriteToursResponse {
  message: string;
  favoriteTours: FavoriteTour[];
}

class FavoriteService {
  /**
   * Thêm tour vào danh sách yêu thích
   */
  async addFavorite(tourId: number): Promise<{ message: string; favoriteTour: FavoriteTour }> {
    const response = await api.post<{ message: string; favoriteTour: FavoriteTour }>('/favorite/', {
      tour_id: tourId,
    });
    return response.data;
  }

  /**
   * Xóa tour khỏi danh sách yêu thích
   */
  async removeFavorite(tourId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/favorite/', {
      data: {
        tour_id: tourId,
      },
    });
    return response.data;
  }

  /**
   * Lấy danh sách tour yêu thích
   */
  async getFavorites(): Promise<FavoriteTour[]> {
    const response = await api.get<GetFavoriteToursResponse>('/favorite/');
    return response.data.favoriteTours || [];
  }

  /**
   * Kiểm tra tour có trong danh sách yêu thích không
   */
  async checkFavorite(tourId: number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.tour_id === tourId);
    } catch (error) {
      console.error('Error checking favorite:', error);
      return false;
    }
  }
}

export const favoriteService = new FavoriteService();

