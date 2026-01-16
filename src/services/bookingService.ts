import { api } from './api';
import type { 
  Booking, 
  CreateBookingRequest,
  HoldSeatRequest,
  Passenger,
  ApiResponse 
} from '../types';

export interface HoldSeatResponse {
  message: string;
}

export interface CreateBookingResponse {
  message: string;
  booking: Booking;
}

export interface AddPassengersResponse {
  message: string;
}

export interface GetMyBookingsResponse {
  message: string;
  data: Booking[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface CheckAvailabilityResponse {
  con_cho: boolean;
  so_cho_trong: number;
}

/**
 * Booking Service - Tích hợp tất cả endpoint đặt tour từ backend
 */
export const bookingService = {
  /**
   * Hold seat - Giữ chỗ tạm thời trước khi đặt
   * POST /booking/hold-seat/{khoi_hanh_id}/{so_nguoi_lon}/{so_tre_em}
   * 
   * @param params - Thông tin giữ chỗ
   * @returns Promise<HoldSeatResponse>
   */
  holdSeat: async (params: HoldSeatRequest): Promise<HoldSeatResponse> => {
    const { khoi_hanh_id, so_nguoi_lon, so_tre_em } = params;
    const response = await api.post<HoldSeatResponse>(
      `/booking/hold-seat/${khoi_hanh_id}/${so_nguoi_lon}/${so_tre_em}`
    );
    return response.data;
  },

  /**
   * Create booking - Tạo đơn đặt tour
   * POST /booking/create
   * 
   * @param data - Thông tin đặt tour
   * @returns Promise<CreateBookingResponse>
   */
  createBooking: async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await api.post<CreateBookingResponse>('/booking/create', data);
    return response.data;
  },

  /**
   * Add passengers - Thêm thông tin hành khách cho đơn đặt
   * POST /booking/add-passengers
   * 
   * @param passengers - Danh sách hành khách
   * @returns Promise<AddPassengersResponse>
   */
  addPassengers: async (passengers: Passenger[]): Promise<AddPassengersResponse> => {
    if (!passengers || passengers.length === 0) {
      throw new Error('Danh sách hành khách không được để trống');
    }
    const response = await api.post<AddPassengersResponse>('/booking/add-passengers', passengers);
    return response.data;
  },

  /**
   * Get booking by ID - Lấy thông tin chi tiết đơn đặt
   * GET /booking/:id
   * 
   * @param id - ID của booking
   * @returns Promise<Booking>
   */
  getBookingById: async (id: number): Promise<Booking> => {
    const response = await api.get<{ message: string; data: Booking }>(`/booking/${id}`);
    return response.data.data;
  },

  /**
   * Get my bookings - Lấy danh sách đơn đặt của tôi với phân trang và filter
   * GET /booking/my-bookings?limit=10&offset=0&trang_thai_dat_cho=cho_xac_nhan&trang_thai_khoi_hanh=con_cho
   * 
   * @param limit - Số lượng booking mỗi trang (mặc định: 10)
   * @param offset - Vị trí bắt đầu (mặc định: 0)
   * @param trangThaiDatCho - Filter theo trạng thái đặt chỗ (optional)
   * @param trangThaiKhoiHanh - Filter theo trạng thái khởi hành (optional)
   * @returns Promise<GetMyBookingsResponse>
   */
  getMyBookings: async (
    limit: number = 10, 
    offset: number = 0,
    trangThaiDatCho?: string,
    trangThaiKhoiHanh?: string
  ): Promise<GetMyBookingsResponse> => {
    const params: any = { limit, offset };
    if (trangThaiDatCho) {
      params.trang_thai_dat_cho = trangThaiDatCho;
    }
    if (trangThaiKhoiHanh) {
      params.trang_thai_khoi_hanh = trangThaiKhoiHanh;
    }
    const response = await api.get<GetMyBookingsResponse>('/booking/my-bookings', {
      params
    });
    return response.data;
  },

  /**
   * Check departure availability - Kiểm tra số chỗ còn lại
   * GET /departure/:id (sử dụng thông tin từ departure)
   * Hoặc sử dụng CheckDepartureAvailability từ backend
   * 
   * @param khoiHanhId - ID của khởi hành
   * @param soNguoi - Tổng số người cần kiểm tra
   * @returns Promise<CheckAvailabilityResponse>
   */
  checkAvailability: async (khoiHanhId: number, soNguoi: number): Promise<CheckAvailabilityResponse> => {
    // Sử dụng endpoint departure để lấy thông tin
    const response = await api.get<ApiResponse<any>>(`/departure/${khoiHanhId}`);
    const departure = response.data.data;
    
    const soChoTrong = departure.suc_chua - (departure.so_cho_da_dat || 0);
    const conCho = soChoTrong >= soNguoi;
    
    return {
      con_cho: conCho,
      so_cho_trong: soChoTrong,
    };
  },

  /**
   * Calculate refund amount - Tính số tiền hoàn lại (không hủy booking)
   * GET /booking/:id/calculate-refund
   * 
   * @param id - ID của booking
   * @returns Promise<CalculateRefundResponse>
   */
  calculateRefundAmount: async (id: number): Promise<CalculateRefundResponse> => {
    const response = await api.get<{ message: string; data: CalculateRefundData }>(`/booking/${id}/calculate-refund`);
    return {
      message: response.data.message,
      data: response.data.data,
    };
  },

  /**
   * Cancel booking - Hủy đặt chỗ và tính số tiền hoàn lại
   * PUT /booking/:id/cancel
   * 
   * @param id - ID của booking
   * @returns Promise<CancelBookingResponse>
   */
  cancelBooking: async (id: number): Promise<CancelBookingResponse> => {
    const response = await api.put<{ message: string; data: CancelBookingData }>(`/booking/${id}/cancel`);
    return {
      message: response.data.message,
      data: response.data.data,
    };
  },
};

export interface CalculateRefundData {
  tong_tien: number;
  so_tien_hoan: number;
  phan_tram_hoan: number;
  so_ngay_truoc_khoi_hanh: number;
  ly_do: string;
}

export interface CalculateRefundResponse {
  message: string;
  data: CalculateRefundData;
}

export interface CancelBookingData {
  so_tien_hoan: number;
  phan_tram_hoan: number;
  so_ngay_truoc_khoi_hanh: number;
  ly_do: string;
}

export interface CancelBookingResponse {
  message: string;
  data: CancelBookingData;
}

