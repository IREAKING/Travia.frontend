import { api } from './api';
import type { 
  AdminSummary,
  RevenueByMonth,
  RevenueByDay,
  RevenueByYear,
  BookingsByStatus,
  BookingsByDayOfWeek,
  TopTour,
  DashboardOverview,
  DashboardOverviewWithComparison,
  UserStatsByRole,
  UserGrowthByMonth,
  UserGrowthByDay,
  NewUsersToday,
  TopActiveUser,
  TopBookedTour,
  ToursCreatedByMonth,
  TourPriceDistribution,
  RecentBooking,
  ApiResponse 
} from '../types';

export const adminService = {
  // ========== Dashboard Overview ==========
  
  // Get basic dashboard overview
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await api.get<ApiResponse<DashboardOverview>>('/admin/getDashboardOverview');
    return response.data.data;
  },

  // Get dashboard overview with month-over-month comparison
  getDashboardOverviewWithComparison: async (): Promise<DashboardOverviewWithComparison> => {
    const response = await api.get<ApiResponse<DashboardOverviewWithComparison>>('/admin/getDashboardOverviewWithComparison');
    return response.data.data;
  },

  // Legacy summary endpoint (for backwards compatibility)
  getSummary: async (): Promise<AdminSummary> => {
    const response = await api.get<ApiResponse<AdminSummary>>('/admin/getAdminSummary');
    return response.data.data;
  },

  // ========== User Statistics ==========
  
  // Get user counts by role
  getUserStatsByRole: async (): Promise<UserStatsByRole[]> => {
    const response = await api.get<ApiResponse<UserStatsByRole[]>>('/admin/getUserStatsByRole');
    return response.data.data;
  },

  // Get user growth by month (last 12 months)
  getUserGrowthByMonth: async (): Promise<UserGrowthByMonth[]> => {
    const response = await api.get<ApiResponse<UserGrowthByMonth[]>>('/admin/getUserGrowthByMonth');
    return response.data.data;
  },

  // Get user growth by day (last 30 days)
  getUserGrowthByDay: async (): Promise<UserGrowthByDay[]> => {
    const response = await api.get<ApiResponse<UserGrowthByDay[]>>('/admin/getUserGrowthByDay');
    return response.data.data;
  },

  // Get new users count for today
  getNewUsersToday: async (): Promise<NewUsersToday> => {
    const response = await api.get<ApiResponse<NewUsersToday>>('/admin/getNewUsersToday');
    return response.data.data;
  },

  // Get top active users by booking count
  getTopActiveUsers: async (): Promise<TopActiveUser[]> => {
    const response = await api.get<ApiResponse<TopActiveUser[]>>('/admin/getTopActiveUsers');
    return response.data.data;
  },

  // Legacy endpoints for backwards compatibility
  getNewUsersByMonth: async (year: number): Promise<{ month: number; count: number }[]> => {
    const response = await api.get<ApiResponse<{ month: number; count: number }[]>>(
      '/admin/getNewUsersByMonth',
      { params: { year } }
    );
    return response.data.data;
  },

  getUserGrowth: async (from: string, to: string): Promise<{ date: string; count: number }[]> => {
    const response = await api.get<ApiResponse<{ date: string; count: number }[]>>(
      '/admin/getUserGrowth',
      { params: { from, to } }
    );
    return response.data.data;
  },

  getTopCustomers: async (limit = 10): Promise<TopActiveUser[]> => {
    const response = await api.get<ApiResponse<TopActiveUser[]>>('/admin/getTopCustomers', {
      params: { limit },
    });
    return response.data.data;
  },

  // ========== Tour Statistics ==========
  
  // Get top booked tours
  getTopBookedTours: async (limit = 10): Promise<TopBookedTour[]> => {
    const response = await api.get<ApiResponse<TopBookedTour[]>>('/admin/getTopBookedTours', {
      params: { limit },
    });
    return response.data.data;
  },

  // Get tours created by month
  getToursCreatedByMonth: async (): Promise<ToursCreatedByMonth[]> => {
    const response = await api.get<ApiResponse<ToursCreatedByMonth[]>>('/admin/getToursCreatedByMonth');
    return response.data.data;
  },

  // Get tour price distribution
  getTourPriceDistribution: async (): Promise<TourPriceDistribution[]> => {
    const response = await api.get<ApiResponse<TourPriceDistribution[]>>('/admin/getTourPriceDistribution');
    return response.data.data;
  },

  // Legacy endpoint
  getTopTours: async (limit = 10): Promise<TopTour[]> => {
    const response = await api.get<ApiResponse<TopTour[]>>('/admin/getTopToursByBookings', {
      params: { limit },
    });
    return response.data.data;
  },

  // ========== Revenue Analytics ==========
  
  // Get revenue by day (last 30 days)
  getRevenueByDay: async (): Promise<RevenueByDay[]> => {
    const response = await api.get<ApiResponse<RevenueByDay[]>>('/admin/getRevenueByDay');
    return response.data.data;
  },

  // Get revenue by month (last 12 months)
  getRevenueByMonth: async (year?: number): Promise<RevenueByMonth[]> => {
    const params = year ? { year } : {};
    const response = await api.get<ApiResponse<RevenueByMonth[]>>('/admin/getRevenueByMonth', { params });
    return response.data.data;
  },

  // Get revenue by year
  getRevenueByYear: async (year?: number): Promise<RevenueByYear[]> => {
    const params = year ? { year } : {};
    const response = await api.get<ApiResponse<RevenueByYear[]>>('/admin/getRevenueByYear', { params });
    return response.data.data;
  },

  // Legacy endpoint
  getRevenueByDateRange: async (from: string, to: string): Promise<{ revenue: number }> => {
    const response = await api.get<ApiResponse<{ revenue: number }>>('/admin/getRevenueByDateRange', {
      params: { from, to },
    });
    return response.data.data;
  },

  // ========== Booking Analytics ==========
  
  // Get bookings by status
  getBookingsByStatus: async (): Promise<BookingsByStatus[]> => {
    const response = await api.get<ApiResponse<BookingsByStatus[]>>('/admin/getBookingsByStatus');
    return response.data.data;
  },

  // Get bookings by day of week
  getBookingsByDayOfWeek: async (): Promise<BookingsByDayOfWeek[]> => {
    const response = await api.get<ApiResponse<BookingsByDayOfWeek[]>>('/admin/getBookingsByDayOfWeek');
    return response.data.data;
  },

  // Get recent bookings
  getRecentBookings: async (limit = 10): Promise<RecentBooking[]> => {
    const response = await api.get<ApiResponse<any[]>>('/admin/getRecentBookings', {
      params: { limit },
    });
    // Map backend response to frontend format
    return (response.data.data || []).map((item: any) => ({
      id: item.id,
      booking_id: item.id,
      user_name: item.ten_khach_hang || item.user_name || 'N/A',
      tour_title: item.ten_tour || item.tour_title || 'N/A',
      tong_gia: item.tong_tien || item.total_amount || 0,
      total_amount: item.tong_tien || item.total_amount || 0,
      trang_thai: typeof item.trang_thai === 'string' 
        ? item.trang_thai 
        : (item.trang_thai?.trang_thai_dat_cho || item.trang_thai?.TrangThaiDatCho || ''),
      status: typeof item.trang_thai === 'string' 
        ? item.trang_thai 
        : (item.trang_thai?.trang_thai_dat_cho || item.trang_thai?.TrangThaiDatCho || ''),
      ngay_dat: item.ngay_dat || item.created_at || new Date().toISOString(),
      created_at: item.ngay_dat || item.created_at || new Date().toISOString(),
    }));
  },

  // Legacy endpoint
  getBookingsByMonth: async (year: number): Promise<{ month: number; count: number }[]> => {
    const response = await api.get<ApiResponse<{ month: number; count: number }[]>>(
      '/admin/getBookingsByMonth',
      { params: { year } }
    );
    return response.data.data;
  },
};
