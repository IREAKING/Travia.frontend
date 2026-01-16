import { api } from './api';
import type { 
  Supplier,
  CreateSupplierRequest,
  CreateSupplierResponse,
  ApiResponse,
  SupplierAndUser,
  SupplierDashboardOverview,
  SupplierRevenueByTimeRange,
  SupplierTopTour,
  SupplierBookingStatsByStatus,
  SupplierTourStatsByStatus,
  SupplierRevenueChart,
  SupplierCustomerStats,
  SupplierCancellationAnalysis,
  SupplierRatingAnalysis,
  SupplierUpcomingDeparture,
  SupplierRecentBooking,
  SupplierMonthlyComparison,
  SupplierBookingAdvanced,
  SupplierTourStatsByCategory,
  SupplierReviewStatistics,
  SupplierDetailedReview,
  SupplierOptionTour
} from '../types';

export const supplierService = {
  // Đăng ký đối tác (công khai, không cần auth) - với upload file
  registerPartner: async (formData: FormData): Promise<CreateSupplierResponse> => {
    const response = await api.post<ApiResponse<CreateSupplierResponse>>('/supplier/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
    });
    return response.data.data;
  },

  // Tạo nhà cung cấp mới (admin only)
  createSupplier: async (data: CreateSupplierRequest): Promise<CreateSupplierResponse> => {
    const response = await api.post<ApiResponse<CreateSupplierResponse>>('/supplier/createSupplier', data);
    return response.data.data;
  },

  // Lấy tất cả nhà cung cấp
  getAllSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get<ApiResponse<Supplier[]>>('/supplier');
    return response.data.data;
  },

  // Lấy nhà cung cấp theo user ID
  getSupplierByUserId: async (id: string): Promise<SupplierAndUser> => {
    const response = await api.get<ApiResponse<SupplierAndUser>>(`/supplier/getSupplierByUserID/${id}`);
    return response.data.data;
  },

  // Lấy thông tin nhà cung cấp (bao gồm cả user info) - dùng khi đã đăng nhập
  getInfoSupplier: async (): Promise<SupplierAndUser> => {
    const response = await api.get<ApiResponse<SupplierAndUser>>('/supplier/info');
    return response.data.data;
  },

  // Lấy nhà cung cấp theo ID
  getSupplierById: async (id: number): Promise<Supplier> => {
    const response = await api.get<ApiResponse<Supplier>>(`/supplier/${id}`);
    return response.data.data;
  },

  // Lấy nhà cung cấp theo email
  getSupplierByEmail: async (email: string): Promise<Supplier> => {
    const response = await api.get<ApiResponse<Supplier>>(`/supplier/email/${email}`);
    return response.data.data;
  },

  // Lấy nhà cung cấp đang hoạt động
  getActiveSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get<ApiResponse<Supplier[]>>('/supplier/active');
    return response.data.data;
  },

  // Lấy nhà cung cấp theo trạng thái
  getSuppliersByStatus: async (status: string): Promise<Supplier[]> => {
    const response = await api.get<ApiResponse<Supplier[]>>(`/supplier/status/${status}`);
    return response.data.data;
  },

  // Cập nhật trạng thái nhà cung cấp
  updateSupplierStatus: async (id: number, status: string): Promise<Supplier> => {
    const response = await api.put<ApiResponse<Supplier>>(`/supplier/status/${status}/${id}`);
    return response.data.data;
  },

  // Xóa mềm nhà cung cấp (soft delete)
  softDeleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`/supplier/soft-delete/${id}`);
  },

  // Khôi phục nhà cung cấp
  restoreSupplier: async (id: string): Promise<Supplier> => {
    const response = await api.put<ApiResponse<Supplier>>(`/supplier/restore/${id}`);
    return response.data.data;
  },

  // Xóa vĩnh viễn nhà cung cấp (hard delete)
  deleteSupplier: async (id: string): Promise<void> => {
    await api.delete(`/supplier/delete/${id}`);
  },

  // Tìm kiếm nhà cung cấp
  searchSuppliers: async (keyword: string): Promise<Supplier[]> => {
    const response = await api.get<ApiResponse<Supplier[]>>(`/supplier/search/${keyword}`);
    return response.data.data;
  },

  // Đếm số lượng nhà cung cấp
  countSuppliers: async (email?: string): Promise<number> => {
    const response = await api.get<ApiResponse<number>>('/supplier/count', {
      params: email ? { email } : {}
    });
    return response.data.data;
  },

  // Lấy nhà cung cấp với phân trang
  getSuppliersWithPagination: async (limit = 10, offset = 0): Promise<Supplier[]> => {
    const response = await api.get<ApiResponse<Supplier[]>>('/supplier/with-pagination', {
      params: { limit, offset }
    });
    return response.data.data;
  },

  // Kiểm tra email nhà cung cấp có tồn tại
  checkSupplierEmailExists: async (email: string): Promise<boolean> => {
    const response = await api.get<ApiResponse<boolean>>(`/supplier/email/${email}`);
    return response.data.data;
  },

  // Cập nhật hàng loạt trạng thái nhà cung cấp
  bulkUpdateSupplierStatus: async (ids: number[], status: string): Promise<void> => {
    await api.put(`/supplier/bulk-update-status/${status}`, { ids });
  },

  // Lấy nhà cung cấp theo khoảng ngày tạo
  getSuppliersByCreatedDateRange: async (email?: string, ngayTao?: string): Promise<Supplier[]> => {
    const response = await api.get<ApiResponse<Supplier[]>>('/supplier/created-date-range', {
      params: { 
        ...(email && { email }),
        ...(ngayTao && { ngay_tao: ngayTao })
      }
    });
    return response.data.data;
  },

  // Lấy danh sách nhà cung cấp chờ duyệt
  getPendingSuppliers: async (): Promise<Supplier[]> => {
    const response = await api.get<ApiResponse<Supplier[]>>('/supplier/pending');
    return response.data.data;
  },

  // Duyệt nhà cung cấp
  approveSupplier: async (id: string): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/supplier/approve/${id}`);
    return response.data.data;
  },

  // Từ chối nhà cung cấp
  rejectSupplier: async (id: string): Promise<any> => {
    const response = await api.put<ApiResponse<any>>(`/supplier/reject/${id}`);
    return response.data.data;
  },

  // Lấy danh sách tour của nhà cung cấp
  getMyTours: async (limit = 10, offset = 0, trang_thai?: string): Promise<any[]> => {
    const params: any = { limit, offset };
    // Nếu trang_thai là 'all' hoặc undefined, gửi '' để lấy tất cả
    // Nếu có giá trị cụ thể, gửi giá trị đó
    params.trang_thai = trang_thai === 'all' || !trang_thai ? '' : trang_thai;
    const response = await api.get<ApiResponse<any[]>>('/supplier/tours/my', { params });
    return response.data.data;
  },

  // ===========================================
  // DASHBOARD SUPPLIER API CALLS
  // ===========================================

  // Lấy tổng quan dashboard
  getDashboardOverview: async (): Promise<SupplierDashboardOverview> => {
    const response = await api.get<ApiResponse<SupplierDashboardOverview>>('/supplier/dashboard/overview');
    return response.data.data;
  },

  // Lấy doanh thu theo khoảng thời gian
  getRevenueByTimeRange: async (
    period: 'day' | 'week' | 'month' = 'day',
    startDate?: string,
    endDate?: string
  ): Promise<SupplierRevenueByTimeRange[]> => {
    const params: any = { period };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<ApiResponse<SupplierRevenueByTimeRange[]>>('/supplier/dashboard/revenue-by-time', { params });
    return response.data.data;
  },

  // Lấy top tours bán chạy nhất
  getTopTours: async (
    sortBy: 'revenue' | 'bookings' | 'rating' = 'revenue',
    limit = 10,
    startDate?: string,
    endDate?: string
  ): Promise<SupplierTopTour[]> => {
    const params: any = { sort_by: sortBy, limit };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<ApiResponse<SupplierTopTour[]>>('/supplier/dashboard/top-tours', { params });
    return response.data.data;
  },

  // Lấy thống kê booking theo trạng thái
  getBookingStatsByStatus: async (
    period: 'day' | 'week' | 'month' = 'day',
    startDate?: string,
    endDate?: string
  ): Promise<SupplierBookingStatsByStatus[]> => {
    const params: any = { period };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<ApiResponse<SupplierBookingStatsByStatus[]>>('/supplier/dashboard/booking-stats', { params });
    return response.data.data;
  },

  // Lấy thống kê tour theo trạng thái
  getTourStatsByStatus: async (): Promise<SupplierTourStatsByStatus[]> => {
    const response = await api.get<ApiResponse<SupplierTourStatsByStatus[]>>('/supplier/dashboard/tour-stats');
    return response.data.data;
  },

  // Lấy thống kê tour theo danh mục
  getTourStatsByCategory: async (): Promise<SupplierTourStatsByCategory[]> => {
    const response = await api.get<ApiResponse<SupplierTourStatsByCategory[]>>('/supplier/dashboard/tour-stats-by-category');
    return response.data.data;
  },

  // Lấy dữ liệu biểu đồ doanh thu
  getRevenueChart: async (
    period: 'day' | 'week' | 'month' = 'day',
    startDate?: string,
    endDate?: string
  ): Promise<SupplierRevenueChart[]> => {
    const params: any = { period };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<ApiResponse<SupplierRevenueChart[]>>('/supplier/dashboard/revenue-chart', { params });
    return response.data.data;
  },

  // Lấy thống kê khách hàng
  getCustomerStats: async (
    sortBy: 'spent' | 'bookings' = 'spent',
    limit = 10,
    startDate?: string,
    endDate?: string
  ): Promise<SupplierCustomerStats[]> => {
    const params: any = { sort_by: sortBy, limit };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<ApiResponse<SupplierCustomerStats[]>>('/supplier/dashboard/customer-stats', { params });
    return response.data.data;
  },

  // Lấy phân tích tỷ lệ hủy booking
  getCancellationAnalysis: async (
    startDate?: string,
    endDate?: string
  ): Promise<SupplierCancellationAnalysis> => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const response = await api.get<ApiResponse<SupplierCancellationAnalysis>>('/supplier/dashboard/cancellation-analysis', { params });
    return response.data.data;
  },

  // Lấy phân tích đánh giá
  getRatingAnalysis: async (): Promise<SupplierRatingAnalysis> => {
    const response = await api.get<ApiResponse<SupplierRatingAnalysis>>('/supplier/dashboard/rating-analysis');
    return response.data.data;
  },

  // Lấy lịch khởi hành sắp tới
  getUpcomingDepartures: async (limit = 10): Promise<SupplierUpcomingDeparture[]> => {
    const response = await api.get<ApiResponse<SupplierUpcomingDeparture[]>>('/supplier/dashboard/upcoming-departures', {
      params: { limit }
    });
    return response.data.data;
  },

  // Lấy booking gần đây
  getRecentBookings: async (limit = 10): Promise<SupplierRecentBooking[]> => {
    const response = await api.get<ApiResponse<SupplierRecentBooking[]>>('/supplier/dashboard/recent-bookings', {
      params: { limit }
    });
    return response.data.data;
  },

  // So sánh tháng hiện tại với tháng trước
  getMonthlyComparison: async (): Promise<SupplierMonthlyComparison> => {
    const response = await api.get<ApiResponse<SupplierMonthlyComparison>>('/supplier/dashboard/monthly-comparison');
    return response.data.data;
  },

  // Lấy danh sách đặt chỗ nâng cao với nhiều filter
  getBookingsAdvanced: async (params: {
    limit?: number;
    offset?: number;
    trang_thai?: string;
    tour_id?: number;
    start_date?: string;
    end_date?: string;
    departure_start_date?: string;
    departure_end_date?: string;
    search_keyword?: string;
    phuong_thuc_thanh_toan?: string;
    min_amount?: number;
    max_amount?: number;
    sort_by?: string;
  }): Promise<{ data: SupplierBookingAdvanced[]; total_count: number }> => {
    const response = await api.get<ApiResponse<SupplierBookingAdvanced[]> & { total?: number }>('/supplier/bookings/advanced', { params });
    return {
      data: response.data.data,
      total_count: (response.data as any).total || 0,
    };
  },

  // Lấy thống kê đánh giá
  getReviewStatistics: async (tourId?: number): Promise<SupplierReviewStatistics> => {
    const params: any = {};
    if (tourId) params.tour_id = tourId;
    const response = await api.get<ApiResponse<SupplierReviewStatistics>>('/supplier/dashboard/review-statistics', { params });
    return response.data.data;
  },

  // Lấy danh sách đánh giá chi tiết
  getDetailedReviews: async (rating?: number, tourId?: number): Promise<SupplierDetailedReview[]> => {
    const params: any = {};
    if (rating) params.rating = rating;
    if (tourId) params.tour_id = tourId;
    const response = await api.get<ApiResponse<SupplierDetailedReview[]>>('/supplier/dashboard/reviews', { params });
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Lấy danh sách tour options
  getOptionTours: async (): Promise<SupplierOptionTour[]> => {
    const response = await api.get<ApiResponse<SupplierOptionTour[]>>('/supplier/dashboard/options-tour');
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // ========== Refund Management ==========
  
  // Get refunds for supplier's tours
  getRefunds: async (params?: {
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: any[]; page: number; limit: number }> => {
    const response = await api.get<{
      message: string;
      data: any[];
      page: number;
      limit: number;
    }>('/supplier/refunds', {
      params
    });
    // Backend trả về { message, data: refundList, page, limit }
    return {
      data: response.data.data || [],
      page: response.data.page || 1,
      limit: response.data.limit || 10
    };
  },

  // Get refund statistics for supplier
  getRefundStats: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/supplier/refunds/stats', {
      params
    });
    return response.data.data;
  },

  // ========== Revenue Management ==========
  
  // Get revenue statistics
  getRevenueStatistics: async (params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<{
    tong_doanh_thu: number;
    doanh_thu_thang_nay: number;
    doanh_thu_thang_truoc: number;
    ty_le_tang_truong: number;
    so_dat_cho: number;
    doanh_thu_trung_binh_don: number;
  }> => {
    const response = await api.get<ApiResponse<{
      tong_doanh_thu: number;
      doanh_thu_thang_nay: number;
      doanh_thu_thang_truoc: number;
      ty_le_tang_truong: number;
      so_dat_cho: number;
      doanh_thu_trung_binh_don: number;
    }>>('/supplier/revenue/statistics', {
      params
    });
    return response.data.data;
  },

  // Get transactions
  getTransactions: async (params?: {
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    id: number;
    ma_dat_cho: string;
    tour_tieu_de: string;
    nguoi_dung_ten: string;
    so_tien: number;
    phi_dich_vu: number;
    so_tien_thuc_nhan: number;
    ngay_thanh_toan: string;
    trang_thai: string | { trang_thai_dat_cho?: string; valid?: boolean };
  }[]> => {
    const response = await api.get<ApiResponse<{
      id: number;
      ma_dat_cho: string;
      tour_tieu_de: string;
      nguoi_dung_ten: string;
      so_tien: number;
      phi_dich_vu: number;
      so_tien_thuc_nhan: number;
      ngay_thanh_toan: string;
      trang_thai: string | { trang_thai_dat_cho?: string; valid?: boolean };
    }[]>>('/supplier/revenue/transactions', {
      params
    });
    return response.data.data || [];
  },
};
