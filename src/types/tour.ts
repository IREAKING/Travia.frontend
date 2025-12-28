export interface GetAllTour {
  id: number;
  tieu_de: string;
  mo_ta: string;
  so_ngay: number;
  so_dem: number;
  gia_nguoi_lon: number;
  gia_tre_em: number;
  don_vi_tien_te: string;
  trang_thai: string;
  noi_bat: boolean;
  danh_muc_id?: number;
  danh_muc_ten: string;
  nha_cung_cap_ten: string;
  anh_chinh: string;
  diem_den: string[];
  avg_rating: number;
  total_reviews: number;
  next_departure_date: string | null;
}

export interface GetTourDetailByID {
  id: number;
  tieu_de: string;
  mo_ta: string;
  so_ngay: number;
  so_dem: number;
  gia_nguoi_lon: number;
  gia_tre_em: number;
  don_vi_tien_te: string;
  trang_thai: string;
  noi_bat: boolean;
}

// ============================================
// INTERFACES CHO TẠO TOUR (CREATE TOUR)
// ============================================

// Ảnh tour - tương ứng với bảng anh_tour
export interface AnhTourInput {
  link: string;
  mo_ta_alt?: string;
  la_anh_chinh?: boolean;
  thu_tu_hien_thi?: number;
}

// Điểm đến tour - tương ứng với bảng tour_diem_den
export interface DiaDiemTourInput {
  diem_den_id: number;
  thu_tu_tham_quan?: number;
}

// Hoạt động trong ngày - tương ứng với bảng hoat_dong_trong_ngay
export interface HoatDongTrongNgayInput {
  ten: string;
  gio_bat_dau?: string; // Format: "HH:MM:SS"
  gio_ket_thuc?: string; // Format: "HH:MM:SS"
  mo_ta?: string;
  thu_tu?: number;
}

// Lịch trình tour - tương ứng với bảng lich_trinh
export interface LichTrinhTourInput {
  ngay_thu: number;
  tieu_de: string;
  mo_ta?: string;
  gio_bat_dau?: string; // Format: "HH:MM:SS"
  gio_ket_thuc?: string; // Format: "HH:MM:SS"
  dia_diem?: string;
  thong_tin_luu_tru?: string;
  hoat_dong_lich_trinh_tours?: HoatDongTrongNgayInput[]; // nested activities
}

// Cấu hình nhóm tour - tương ứng với bảng cau_hinh_nhom_tour
export interface CauHinhNhomTourInput {
  so_nho_nhat?: number;
  so_lon_nhat?: number;
}

// Lịch khởi hành tour - tương ứng với bảng khoi_hanh_tour
export interface LichKhoiHanhTourInput {
  ngay_khoi_hanh: string; // Format: "YYYY-MM-DD"
  ngay_ket_thuc: string; // Format: "YYYY-MM-DD"
  suc_chua: number;
  trang_thai?: string; // len_lich, xac_nhan, huy, hoan_thanh
  ghi_chu?: string;
}

// Request để tạo tour đầy đủ
export interface CreateTourRequest {
  // Thông tin tour cơ bản
  tieu_de: string;
  mo_ta?: string;
  danh_muc_id?: number;
  so_ngay: number;
  so_dem: number;
  gia_nguoi_lon: number;
  gia_tre_em: number;
  don_vi_tien_te?: string;
  trang_thai?: string;
  noi_bat?: boolean;
  
  // Dữ liệu liên quan
  hinh_anh_tours: AnhTourInput[];
  dia_diem_tours: DiaDiemTourInput[];
  lich_trinh_tours: LichTrinhTourInput[];
  cau_hinh_nhom_tours?: CauHinhNhomTourInput;
  lich_khoi_hanh_tours?: LichKhoiHanhTourInput[];
}

// ============================================
// INTERFACES CHO DỮ LIỆU TRẢ VỀ (RESPONSE)
// ============================================

// Ảnh tour response
export interface AnhTour {
  id: number;
  tour_id: number;
  duong_dan: string;
  mo_ta?: string;
  la_anh_chinh?: boolean;
  thu_tu_hien_thi?: number;
  ngay_tao?: string;
}

// Lịch trình response
export interface LichTrinh {
  id: number;
  tour_id: number;
  ngay_thu: number;
  tieu_de: string;
  mo_ta?: string;
  gio_bat_dau?: string;
  gio_ket_thuc?: string;
  dia_diem?: string;
  thong_tin_luu_tru?: string;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

// Hoạt động trong ngày response
export interface HoatDongTrongNgay {
  id: number;
  lich_trinh_id: number;
  ten: string;
  gio_bat_dau?: string;
  gio_ket_thuc?: string;
  mo_ta?: string;
  thu_tu?: number;
  ngay_tao?: string;
}

// Lịch trình với hoạt động
export interface LichTrinhVoiHoatDong {
  lich_trinh: LichTrinh;
  hoat_dong: HoatDongTrongNgay[];
}

// Khởi hành tour response
export interface KhoiHanhTour {
  id: number;
  tour_id: number;
  ngay_khoi_hanh: string;
  ngay_ket_thuc: string;
  suc_chua: number;
  so_cho_da_dat?: number;
  trang_thai?: string;
  ghi_chu?: string;
  ngay_tao?: string;
  ngay_cap_nhat?: string;
}

// Cấu hình nhóm tour response
export interface CauHinhNhomTour {
  id: number;
  tour_id: number;
  so_nho_nhat?: number;
  so_lon_nhat?: number;
}

// Response khi tạo tour thành công
export interface CreateTourResponse {
  message: string;
  data: {
    tour: any; // Tour object
    images: AnhTour[];
    destinations: number[]; // Array of destination IDs
    itineraries: LichTrinhVoiHoatDong[];
    group_config_id?: number;
    departures: KhoiHanhTour[];
  };
}