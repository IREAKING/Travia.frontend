// Export tour types
export * from './tour';

// User types
export type UserRole = 'khach_hang' | 'nha_cung_cap' | 'quan_tri';

export interface User {
  id: string;
  email: string;
  name?: string;  // Backend returns 'name'
  phone?: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface OTPRequest {
  email: string;
  otp: string;
}

export interface ChangePasswordRequest {
  mat_khau_cu: string;
  mat_khau_moi: string;
}

// Tour types
export interface TourCategory {
  id: number;
  ten: string;
  anh?: string;
  mo_ta?: string;
  total_tours?: number;
}

export interface Tour {
  id: number;
  tieu_de: string;
  mo_ta: string;
  danh_muc_id: number;
  danh_muc_ten?: string;
  so_ngay: number;
  so_dem: number;
  gia_nguoi_lon: number;
  gia_tre_em: number;
  don_vi_tien_te: string;
  trang_thai: string;
  noi_bat: boolean;
  nha_cung_cap_id: number;
  nha_cung_cap_ten?: string;
  avg_rating?: number;
  total_reviews?: number;
  images?: TourImage[];
  destinations?: Destination[];
  created_at?: string;
  updated_at?: string;
}

export interface TourImage {
  id: number;
  tour_id: number;
  link: string;
  mo_ta_alt?: string;
  la_anh_chinh: boolean;
  thu_tu_hien_thi: number;
}

export interface Destination {
  id: number;
  ten: string;
  quoc_gia: string;
  khu_vuc?: string;
  mo_ta?: string;
  vi_do?: number;
  kinh_do?: number;
  anh?: string;
}

export interface Departure {
  id: number;
  tour_id: number;
  ngay_khoi_hanh: string;
  ngay_ket_thuc: string;
  so_cho: number;
  so_cho_con_lai: number;
  gia_hien_tai: number;
  trang_thai: string;
}

// Booking types
export interface Booking {
  id: number;
  nguoi_dung_id: string;
  khoi_hanh_id: number;
  so_nguoi_lon: number;
  so_tre_em: number;
  tong_tien: number;
  trang_thai: string;
  ghi_chu?: string;
  ngay_dat: string;
  phuong_thuc_thanh_toan?: string;
  email?: string;
  so_dien_thoai?: string;
  tour_info?: Tour;
  departure_info?: Departure;
}

export interface CreateBookingRequest {
  khoi_hanh_id: number;
  so_nguoi_lon: number;
  so_tre_em: number;
  phuong_thuc_thanh_toan?: string;
}

export interface HoldSeatRequest {
  khoi_hanh_id: number;
  so_nguoi_lon: number;
  so_tre_em: number;
}

export interface Passenger {
  dat_cho_id: number;
  ho_ten: string;
  ngay_sinh: string; // Format: YYYY-MM-DD
  loai_khach?: 'nguoi_lon' | 'tre_em';
  gioi_tinh?: 'nam' | 'nu' | 'khac';
  so_giay_to_tuy_thanh?: string;
  quoc_tich?: string;
  ghi_chu?: string;
}

// Review types (legacy - for old booking reviews)
export interface Review {
  id: number;
  tour_id: number;
  nguoi_dung_id: string;
  diem_danh_gia: number;
  noi_dung?: string;
  ngay_danh_gia: string;
  user_name?: string;
}

// Tour Review types (new - for tour detail page reviews)
export interface TourReview {
  id: number;
  tieu_de: string;
  diem_danh_gia: number;
  noi_dung: string;
  hinh_anh_dinh_kem?: string[];
  ngay_tao: string;
  ho_ten: string;
}

export interface ReviewsResponse {
  thong_tin_danh_gia: TourReview[];
  tong_so_danh_gia: number;
  diem_trung_binh: number;
  so_luong_5_sao: number;
  so_luong_4_sao: number;
  so_luong_3_sao: number;
  so_luong_2_sao: number;
  so_luong_1_sao: number;
}

export interface CreateReviewRequest {
  tour_id: number;
  booking_id: number;
  diem_danh_gia: number;
  noi_dung?: string;
}

// Admin types
export interface AdminSummary {
  total_users: number;
  active_users: number;
  total_tours: number;
  active_tours: number;
  total_bookings: number;
  total_revenue: number;
  avg_rating: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number | string;
}

export interface RevenueByDay {
  date: string;
  ngay?: string; // Backend field name
  revenue: number | string;
  doanh_thu?: number | string; // Backend field name
  so_booking?: number; // Backend field name
  booking_count?: number; // Alternative field name
}

export interface AdminSupplierOption {
  id: string; // UUID
  ten: string;
}

export interface AdminDashboardOverviewByMonthAndYear {
  tong_dat_cho: number;
  so_don_da_huy: number;
  doanh_thu: number | string;
  so_chuyen_khoi_hanh: number;
  tong_luong_khach: number;
  so_danh_gia_moi: number;
  diem_trung_binh: number;
}

export interface AdminChartRevenueTrend {
  ngay: string;
  tong_so_don: number;
  doanh_thu_ngay: number | string;
  tong_khach_ngay: number;
}

export interface AdminChartCategoryDistribution {
  ten_danh_muc: string;
  so_luong_dat: number;
  tong_doanh_thu: number | string;
}

export interface AdminChartTopSuppliers {
  ten_nha_cung_cap: string;
  so_don_hang: number;
  doanh_thu_dat_duoc: number | string;
}

export interface AdminChartBookingStatusStats {
  trang_thai: string;
  so_luong: number;
  gia_tri_uoc_tinh: number | string;
}

export interface AdminCustomerGrowthMonthlyReport {
  nam: number;
  thang: number;
  khach_moi_thang_nay: number;
  khach_moi_thang_truoc: number | string;
  phan_tram_tang_truong: number | string;
}

export interface AdminTopActiveUser {
  id: string;
  ho_ten: string;
  email: string;
  so_booking: number;
  tong_chi_tieu: number | string;
}

export interface RevenueByYear {
  year: string;
  revenue: number | string;
}

export interface BookingsByStatus {
  status: string;
  count: number;
}

export interface BookingsByDayOfWeek {
  day_of_week: number;
  day_name: string;
  booking_count: number;
}

export interface TopTour {
  tour_id: number;
  tour_title: string;
  booking_count: number;
  total_revenue: number;
}

// Dashboard Overview Types
export interface DashboardOverview {
  total_users: number;
  total_tours: number;
  total_bookings: number;
  total_revenue: number | string;
  total_suppliers: number;
  total_destinations: number;
  pending_bookings: number;
  active_tours: number;
}

export interface DashboardOverviewWithComparison {
  total_users: number;
  users_change_percent: number | string;
  total_tours: number;
  tours_change_percent: number | string;
  total_bookings: number;
  bookings_change_percent: number | string;
  total_revenue: number | string;
  revenue_change_percent: number | string;
  total_suppliers: number;
  suppliers_change_percent: number | string;
  active_tours: number;
  pending_bookings: number;
}

// User Statistics Types
export interface UserStatsByRole {
  role: string;
  count: number;
}

export interface UserGrowthByMonth {
  month: string;
  new_users: number;
  total_users: number;
}

export interface UserGrowthByDay {
  date: string;
  new_users: number;
}

export interface NewUsersToday {
  new_users_today: number;
  change_from_yesterday: number;
}

export interface TopActiveUser {
  user_id: string;
  id?: string; // For compatibility
  full_name: string;
  user_name?: string; // For compatibility (backend may return ho_ten)
  email: string;
  booking_count: number;
  total_spent: number | string;
}

// Tour Statistics Types
export interface TopBookedTour {
  id: number;
  tieu_de: string;
  gia_nguoi_lon: number | string;
  ten_nha_cung_cap: string;
  ten_danh_muc: string;
  so_booking: number;
  tong_doanh_thu: number | string;
  diem_trung_binh: number;
  anh_chinh: string;
  // Legacy fields for backward compatibility
  tour_id?: number;
  tour_title?: string;
  booking_count?: number;
  total_revenue?: number | string;
}

export interface ToursCreatedByMonth {
  month: string;
  tours_created: number;
}

export interface TourPriceDistribution {
  price_range: string;
  tour_count: number;
}

// Recent Bookings
export interface RecentBooking {
  id?: number; // For compatibility
  booking_id: number;
  user_name: string;
  tour_title: string;
  total_amount: number | string;
  tong_gia?: number | string; // For compatibility
  status: string;
  trang_thai?: string | { trang_thai_dat_cho?: string; TrangThaiDatCho?: string; valid?: boolean }; // For compatibility
  created_at: string;
  ngay_dat?: string; // For compatibility
}

// API Response types
export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  error: string;
  details?: string;
}
// User types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  dang_hoat_dong?: boolean;
}
// Supplier types
export interface Supplier {
  id: number;
  ten: string;
  dia_chi?: string;
  website?: string;
  mo_ta?: string;
  logo_url?: string;
  trang_thai: string;
  nam_thanh_lap?: string;
  thanh_pho?: string;
  quoc_gia?: string;
  ma_so_thue?: string;
  so_nhan_vien?: string;
  giay_to_kinh_doanh?: string;
  nguoi_dung_id: string;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

export interface CreateSupplierRequest {
  thong_tin_dang_nhap: {
    nguoi_dai_dien: string;
    email: string;
    mat_khau: string;
    so_dien_thoai?: string;
  };
  thong_tin_nha_cung_cap: {
    ten: string;
    dia_chi?: string;
    website?: string;
    mo_ta?: string;
    logo_url?: string;
  };
}

export interface CreateSupplierResponse {
  message: string;
  data: {
    user: User;
    supplier: Supplier;
  };
}

// Filter and pagination types
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface FilterToursParams extends PaginationParams {
  danh_muc_id?: number;
  gia_min?: number;
  gia_max?: number;
  so_ngay_min?: number;
  so_ngay_max?: number;
  rating_min?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface SearchToursParams extends PaginationParams {
  query?: string;
  diem_den_id?: number;
  diem_den_ten?: string;
  so_ngay_min?: number;
  so_ngay_max?: number;
  so_dem_min?: number;
  so_dem_max?: number;
}

export interface SupplierAndUser {
  supplier: Supplier;
  user: User;
}

// Supplier types
export interface SupplierAndUser {
  id: number;
  ten: string;
  dia_chi?: string;
  website?: string;
  mo_ta?: string;
  logo_url?: string;
  trang_thai: string;
  nam_thanh_lap?: string;
  thanh_pho?: string;
  quoc_gia?: string;
  ma_so_thue?: string;
  so_nhan_vien?: string;
  giay_to_kinh_doanh?: string;
  nguoi_dung_id: string;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
  // User representative fields (từ getSupplierByUserID)
  ho_ten?: string;
  email?: string;
  so_dien_thoai?: string;
}

// Supplier Dashboard Types
export interface SupplierDashboardOverview {
  total_tours: number;
  published_tours: number;
  draft_tours: number;
  archived_tours: number;
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  paid_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number | string;
  revenue_last_30_days: number | string;
  revenue_last_7_days: number | string;
  avg_rating: number;
  total_reviews: number;
  total_customers: number;
  cancellation_rate: number;
}

export interface SupplierRevenueByTimeRange {
  period: string;
  booking_count: number;
  revenue: number | string;
  total_passengers: number;
}

export interface SupplierTopTour {
  id: number;
  tieu_de: string;
  gia_nguoi_lon: number | string;
  gia_tre_em: number | string;
  don_vi_tien_te: string | null;
  trang_thai: string | null;
  anh_chinh: string;
  total_bookings: number;
  total_revenue: number | string;
  total_passengers: number;
  avg_rating: number;
  total_reviews: number;
}


export interface SupplierBookingStatsByStatus {
  trang_thai: string | null;
  booking_count: number;
  total_amount: number | string;
  total_passengers: number;
  first_booking_date: string | null;
  last_booking_date: string | null;
}

export interface SupplierTourStatsByStatus {
  trang_thai: string | null;
  tour_count: number;
  total_departures: number;
  total_bookings: number;
  total_revenue: number | string;
}

export interface SupplierTourStatsByCategory {
  danh_muc_id: number | null;
  ten_danh_muc: string | null;
  tong_tour: number;
  tour_cong_bo: number;
  tour_noi_bat: number;
  gia_trung_binh: number | string;
}

export interface SupplierRevenueChart {
  period?: string;
  date?: string;
  revenue: number | string;
  booking_count: number;
  customer_count: number;
}

export interface SupplierCustomerStats {
  khach_hang_id: string;
  ten_khach_hang: string;
  email_khach_hang: string;
  so_dat_cho: number;
  tong_tien: number | string;
  so_nguoi_lon_va_tre_em: number;
  ngay_dat_dau_tien: string | null;
  ngay_dat_cuoi_cung: string | null;
}

export interface SupplierReviewStatistics {
  so_luong_danh_gia: number;
  diem_trung_binh: number;
  so_luong_5_sao: number;
  so_luong_4_sao: number;
  so_luong_3_sao: number;
  so_luong_2_sao: number;
  so_luong_1_sao: number;
}

export interface SupplierDetailedReview {
  danh_gia_id: number;
  tieu_de: string | null;
  noi_dung: string | null;
  diem_danh_gia: number;
  hinh_anh_dinh_kem: string[] | null;
  ngay_tao: string;
  nguoi_dung_ten: string | null;
  nguoi_dung_email: string | null;
  tour_id: number;
  tour_tieu_de: string | null;
}

export interface SupplierOptionTour {
  id: number;
  tieu_de: string | null;
}

export interface SupplierCancellationAnalysis {
  total_bookings: number;
  cancelled_bookings: number;
  cancellation_rate: number;
  lost_revenue: number | string;
  cancelled_last_30_days: number;
}

export interface SupplierBookingStatsByStatusDetailed {
  ngay_trong_thang: string;
  trang_thai: {
    trang_thai_dat_cho: string;
    valid: boolean;
  } | null;
  so_dat_cho: number;
  tong_tien: number | string;
  tong_khach: number;
}

export interface SupplierRatingAnalysis {
  total_reviews: number;
  avg_rating: number;
  five_star_count: number;
  four_star_count: number;
  three_star_count: number;
  two_star_count: number;
  one_star_count: number;
  tours_with_reviews: number;
}

export interface SupplierUpcomingDeparture {
  departure_id: number;
  ngay_khoi_hanh: string;
  ngay_ket_thuc: string;
  suc_chua: number;
  so_cho_da_dat: number | null;
  available_seats: number;
  trang_thai: string | null;
  tour_id: number;
  tour_title: string;
  tour_image: string;
  booking_count: number;
  revenue: number | string;
}

export interface SupplierRecentBooking {
  booking_id: number;
  ngay_dat: string;
  trang_thai: string | null | { trang_thai_dat_cho?: string; valid?: boolean };
  tong_tien: number | string;
  don_vi_tien_te: string | null;
  so_nguoi_lon: number;
  so_tre_em: number;
  customer_name: string;
  customer_email: string;
  tour_id: number;
  tour_title: string;
  ngay_khoi_hanh: string;
}

export interface SupplierMonthlyComparison {
  current_month_bookings: number;
  current_month_revenue: number | string;
  previous_month_bookings: number;
  previous_month_revenue: number | string;
  booking_change_percent: number;
  revenue_change_percent: number;
}

export interface SupplierBookingAdvanced {
  booking_id: number;
  ngay_dat: string;
  trang_thai: string | null | { trang_thai_dat_cho?: string; valid?: boolean };
  tong_tien: number | string;
  don_vi_tien_te: string | null;
  so_nguoi_lon: number | null;
  so_tre_em: number | null;
  phuong_thuc_thanh_toan: string | null;
  ngay_cap_nhat: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  tour_id: number;
  tour_title: string;
  tour_price_adult: number | string;
  tour_price_child: number | string;
  tour_currency: string | null;
  tour_image: string;
  departure_id: number;
  ngay_khoi_hanh: string;
  ngay_ket_thuc: string;
  departure_capacity: number;
  departure_booked: number;
  departure_available: number;
  departure_status: string | null;
  passenger_count: number;
  successful_payments: number;
  total_passengers: number;
  confirmed_revenue: number | string;
}

// AI Chatbot types
export interface ChatbotRequest {
  message: string;
  session_id?: string;
  include_tours?: boolean;
}

export interface ChatbotResponse {
  message: string;
  session_id: string;
  data: {
    response: string;
  };
}

export interface ChatHistory {
  id: number;
  nguoi_dung_id?: string;
  ma_phien: string;
  cau_hoi: string;
  cau_tra_loi: string;
  ngay_tao: string;
}