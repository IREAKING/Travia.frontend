import { api } from './api';

export interface Transaction {
  id: number;
  dat_cho_id: number | null;
  nguoi_dung_id: string;
  ma_giao_dich_noi_bo: string;
  ma_tham_chieu_cong_thanh_toan: string | null;
  cong_thanh_toan_id: string | null;
  so_tien: number | string | any; // Can be number, string, or pgtype.Numeric object
  loai_giao_dich: string | null;
  trang_thai: {
    trang_thai_thanh_toan: string;
    valid: boolean;
  };
  noi_dung_chuyen_khoan: string | null;
  ngay_tao: string;
  ngay_hoan_thanh: string | null;
  phuong_thuc_thanh_toan: string | null;
  ten_nguoi_dung: string | null;
  email_nguoi_dung: string | null;
  ten_tour: string | null;
  tour_id: number | null;
  ten_cong_thanh_toan: string | null;
}

export interface TransactionsResponse {
  message: string;
  data: Transaction[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface GetTransactionsParams {
  limit?: number;
  offset?: number;
  status?: string;
  gateway?: string;
}

class TransactionService {
  /**
   * Lấy danh sách giao dịch (Admin only)
   * GET /api/admin/transactions
   */
  async getTransactions(params: GetTransactionsParams = {}): Promise<TransactionsResponse> {
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.gateway) queryParams.append('gateway', params.gateway);

    const response = await api.get<TransactionsResponse>(
      `/admin/transactions?${queryParams.toString()}`
    );
    return response.data;
  }
}

export const transactionService = new TransactionService();

