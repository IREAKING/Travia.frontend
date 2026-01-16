import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { adminService } from '../../services/adminService';

interface Refund {
  booking_id: number;
  ngay_dat: string;
  ngay_huy: string;
  tong_tien: number;
  don_vi_tien_te: string;
  so_nguoi_lon: number | null;
  so_tre_em: number | null;
  phuong_thuc_thanh_toan: string | null;
  trang_thai: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  tour_id: number;
  tour_title: string;
  supplier_id: string;
  supplier_name: string;
  departure_id: number;
  ngay_khoi_hanh: string;
  ngay_ket_thuc: string;
  so_ngay_truoc_khoi_hanh: number;
  phan_tram_hoan: number;
  so_tien_hoan: number;
  ly_do: string;
}

interface RefundStats {
  tong_so_refund: number;
  tong_tien_goc: number;
  tong_tien_hoan: number;
  tong_tien_phat: number;
  hoan_100_percent: number;
  hoan_90_percent: number;
  hoan_70_percent: number;
  hoan_50_percent: number;
  khong_hoan: number;
}

export const RefundManagementPage = () => {
  const { showToast } = useToast();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    loadRefunds();
    loadStats();
  }, [currentPage, startDate, endDate]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit,
      };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (searchTerm) params.search = searchTerm;

      const response = await adminService.getAllRefunds(params);
      setRefunds(response.data || []);
      setTotalPages(Math.ceil((response.data?.length || 0) / limit));
    } catch (error: any) {
      console.error('Error loading refunds:', error);
      showToast(
        error?.response?.data?.error || 'Không thể tải danh sách hoàn tiền',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const statsData = await adminService.getRefundStats(params);
      setStats(statsData);
    } catch (error: any) {
      console.error('Error loading stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadRefunds();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (loading && statsLoading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải dữ liệu..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-rose-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-60"></div>
                <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Quản Lý Hoàn Tiền</h1>
                <p className="text-slate-400">Theo dõi và quản lý các giao dịch hoàn tiền</p>
              </div>
            </div>
            
            {stats && (
              <div className="flex gap-4">
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Tổng tiền gốc</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                    {formatCurrency(stats.tong_tien_goc, 'VND')}
                  </p>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Tổng tiền hoàn</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {formatCurrency(stats.tong_tien_hoan, 'VND')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs mb-1">Tổng số refund</p>
            <p className="text-2xl font-bold text-white">{stats.tong_so_refund}</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs mb-1">Hoàn 100%</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.hoan_100_percent}</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs mb-1">Hoàn 90%</p>
            <p className="text-2xl font-bold text-teal-400">{stats.hoan_90_percent}</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs mb-1">Hoàn 70%</p>
            <p className="text-2xl font-bold text-amber-400">{stats.hoan_70_percent}</p>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <p className="text-slate-400 text-xs mb-1">Hoàn 50%</p>
            <p className="text-2xl font-bold text-orange-400">{stats.hoan_50_percent}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-6 border border-white/10 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">Tìm kiếm</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên khách hàng, email, tour..."
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2">Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full px-6 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Booking ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Khách hàng</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Tour</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Nhà cung cấp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Tiền hoàn</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">% Hoàn</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Lý do</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase">Ngày hủy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center">
                    <LoadingSpinner size="md" text="Đang tải..." />
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-400">
                    Không có dữ liệu hoàn tiền
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => (
                  <tr key={refund.booking_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">#{refund.booking_id}</td>
                    <td className="px-6 py-4">
                      <div className="text-white">{refund.customer_name}</div>
                      <div className="text-sm text-slate-400">{refund.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-white">{refund.tour_title}</td>
                    <td className="px-6 py-4 text-white">{refund.supplier_name}</td>
                    <td className="px-6 py-4 text-white">{formatCurrency(refund.tong_tien, refund.don_vi_tien_te || 'VND')}</td>
                    <td className="px-6 py-4 text-emerald-400 font-semibold">{formatCurrency(refund.so_tien_hoan, refund.don_vi_tien_te || 'VND')}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm font-medium">
                        {refund.phan_tram_hoan.toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{refund.ly_do}</td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(refund.ngay_huy)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-slate-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-slate-800/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
