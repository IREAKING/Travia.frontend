import { api } from './api';
import type { 
  AdminSummary,
  RevenueByMonth,
  RevenueByDay,
  RevenueByYear,
  BookingsByDayOfWeek,
  UserGrowthByMonth,
  UserGrowthByDay,
  TopBookedTour,
  AdminSupplierOption,
  AdminDashboardOverviewByMonthAndYear,
  AdminChartRevenueTrend,
  AdminChartCategoryDistribution,
  AdminChartTopSuppliers,
  AdminChartBookingStatusStats,
  AdminCustomerGrowthMonthlyReport,
  AdminTopActiveUser,
  Supplier,
  ApiResponse 
} from '../types';

export const adminService = {
  // ========== Dashboard Overview ==========
  
  // Get dashboard overview by month and year
  getDashboardOverviewByMonthAndYear: async (month: number, year: number): Promise<AdminDashboardOverviewByMonthAndYear> => {
    const response = await api.get<ApiResponse<AdminDashboardOverviewByMonthAndYear>>('/admin/getDashboardOverviewByMonthAndYear', {
      params: { month, year }
    });
    return response.data.data;
  },

  // Get supplier options
  getSupplierOptions: async (): Promise<AdminSupplierOption[]> => {
    const response = await api.get<ApiResponse<AdminSupplierOption[]>>('/admin/supplierOptions');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },


  // Legacy summary endpoint (for backwards compatibility)
  getSummary: async (): Promise<AdminSummary> => {
    const response = await api.get<ApiResponse<AdminSummary>>('/admin/getAdminSummary');
    return response.data.data;
  },

  // ========== User Statistics ==========
  

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


  // ========== Tour Statistics ==========
  
  // Get top booked tours
  getTopBookedTours: async (limit = 10): Promise<TopBookedTour[]> => {
    const response = await api.get<ApiResponse<TopBookedTour[]>>('/admin/getTopBookedTours', {
      params: { limit },
    });
    return response.data.data;
  },



  // ========== Revenue Analytics ==========
  
  // Get revenue by day (last 30 days)
  getRevenueByDay: async (year?: number, month?: number, nhaCungCapId?: string): Promise<RevenueByDay[]> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    if (nhaCungCapId) params.nha_cung_cap_id = nhaCungCapId;
    const response = await api.get<ApiResponse<RevenueByDay[]>>('/admin/getRevenueByDay', { params });
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    // Map backend field names to frontend format
    return data.map(item => ({
      date: item.ngay || item.date,
      ngay: item.ngay || item.date,
      revenue: item.doanh_thu || item.revenue,
      doanh_thu: item.doanh_thu || item.revenue,
      so_booking: item.so_booking || item.booking_count || 0,
      booking_count: item.so_booking || item.booking_count || 0,
    }));
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
  
  // Get bookings by day of week
  getBookingsByDayOfWeek: async (): Promise<BookingsByDayOfWeek[]> => {
    const response = await api.get<ApiResponse<BookingsByDayOfWeek[]>>('/admin/getBookingsByDayOfWeek');
    return response.data.data;
  },


  // Legacy endpoint
  getBookingsByMonth: async (year: number): Promise<{ month: number; count: number }[]> => {
    const response = await api.get<ApiResponse<{ month: number; count: number }[]>>(
      '/admin/getBookingsByMonth',
      { params: { year } }
    );
    return response.data.data;
  },

  // ========== Chart Endpoints ==========
  
  // Get revenue trend chart (Line Chart)
  getChartRevenueTrend: async (year?: number, month?: number): Promise<AdminChartRevenueTrend[]> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get<ApiResponse<AdminChartRevenueTrend[]>>('/admin/chartRevenueTrend', { params });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Get category distribution chart (Pie/Donut Chart)
  getChartCategoryDistribution: async (year?: number, month?: number): Promise<AdminChartCategoryDistribution[]> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get<ApiResponse<AdminChartCategoryDistribution[]>>('/admin/chartCategoryDistribution', { params });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Get top suppliers chart (Bar Chart)
  getChartTopSuppliers: async (year?: number, month?: number): Promise<AdminChartTopSuppliers[]> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get<ApiResponse<AdminChartTopSuppliers[]>>('/admin/chartTopSuppliers', { params });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Get booking status stats chart (Stacked Bar Chart)
  getChartBookingStatusStats: async (year?: number, month?: number): Promise<AdminChartBookingStatusStats[]> => {
    const params: any = {};
    if (year) params.year = year;
    if (month) params.month = month;
    const response = await api.get<ApiResponse<AdminChartBookingStatusStats[]>>('/admin/chartBookingStatusStats', { params });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // ========== Supplier Management ==========
  
  // Get all suppliers (admin)
  getAllSuppliers: async (xacThuc?: boolean, dangHoatDong?: boolean): Promise<Supplier[]> => {
    const params: any = {};
    if (xacThuc !== undefined) {
      params.xac_thuc = xacThuc;
    }
    if (dangHoatDong !== undefined) {
      params.dang_hoat_dong = dangHoatDong;
    }
    const response = await api.get<ApiResponse<Supplier[]>>('/admin/suppliers', { params });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Get supplier by ID (admin)
  getSupplierByID: async (id: string): Promise<Supplier> => {
    const response = await api.get<ApiResponse<Supplier>>(`/admin/suppliers/${id}`);
    return response.data.data;
  },

  // Approve supplier (admin)
  approveSupplier: async (id: string): Promise<Supplier> => {
    const response = await api.put<ApiResponse<Supplier>>(`/admin/suppliers/approve/${id}`);
    return response.data.data;
  },

  // Reject supplier (admin)
  rejectSupplier: async (id: string): Promise<Supplier> => {
    const response = await api.put<ApiResponse<Supplier>>(`/admin/suppliers/reject/${id}`);
    return response.data.data;
  },

  // Soft delete supplier (admin)
  softDeleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`/admin/suppliers/soft-delete/${id}`);
  },

  // Restore supplier (admin)
  restoreSupplier: async (id: string): Promise<Supplier> => {
    const response = await api.put<ApiResponse<Supplier>>(`/admin/suppliers/restore/${id}`);
    return response.data.data;
  },

  // ========== Customer Management ==========
  
  // Get customer growth monthly report
  getCustomerGrowthMonthlyReport: async (year?: number): Promise<AdminCustomerGrowthMonthlyReport[]> => {
    const params: any = {};
    if (year !== undefined) {
      params.year = year;
    }
    const response = await api.get<ApiResponse<AdminCustomerGrowthMonthlyReport[]>>('/admin/customers/adminCustomerGrowthMonthlyReport', { params });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Get top active users
  getTopActiveUsers: async (limit: number = 10): Promise<AdminTopActiveUser[]> => {
    const response = await api.get<ApiResponse<AdminTopActiveUser[]>>('/admin/customers/getTopActiveUsers', {
      params: { limit }
    });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },
};
