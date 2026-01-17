import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { supplierService } from '../../services/supplierService';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../../components/common/ExportDropdown';

type TimePeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

interface RevenueData {
  tong_doanh_thu: number;
  doanh_thu_thang_nay: number;
  doanh_thu_thang_truoc: number;
  ty_le_tang_truong: number;
  so_dat_cho: number;
  doanh_thu_trung_binh_don: number;
}

interface Transaction {
  id: number;
  ma_dat_cho: string;
  tour_tieu_de: string;
  nguoi_dung_ten: string;
  so_tien: number;
  phi_dich_vu: number;
  so_tien_thuc_nhan: number;
  ngay_thanh_toan: string;
  trang_thai: string | { trang_thai_dat_cho?: string; valid?: boolean };
}

export const SupplierRevenuePage = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadRevenueData();
  }, [timePeriod]);

  const getDateRange = (period: TimePeriod): { start_date?: string; end_date?: string } => {
    const today = new Date();
    const endDate = today.toISOString().split('T')[0];
    
    switch (period) {
      case 'today':
        return { start_date: endDate, end_date: endDate };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return { start_date: weekStart.toISOString().split('T')[0], end_date: endDate };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(1);
        return { start_date: monthStart.toISOString().split('T')[0], end_date: endDate };
      case 'year':
        const yearStart = new Date(today);
        yearStart.setMonth(0, 1);
        return { start_date: yearStart.toISOString().split('T')[0], end_date: endDate };
      default:
        return {};
    }
  };

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange(timePeriod);
      
      // Load revenue statistics
      const stats = await supplierService.getRevenueStatistics(dateRange);
      setRevenueData({
        tong_doanh_thu: stats.tong_doanh_thu,
        doanh_thu_thang_nay: stats.doanh_thu_thang_nay,
        doanh_thu_thang_truoc: stats.doanh_thu_thang_truoc,
        ty_le_tang_truong: stats.ty_le_tang_truong,
        so_dat_cho: stats.so_dat_cho,
        doanh_thu_trung_binh_don: stats.doanh_thu_trung_binh_don,
      });

      // Load transactions
      const trans = await supplierService.getTransactions({
        ...dateRange,
        limit: 50,
        offset: 0,
      });
      setTransactions(trans.map(t => {
        // Handle trang_thai - could be string or object
        let trangThai: string | { trang_thai_dat_cho?: string; valid?: boolean };
        if (typeof t.trang_thai === 'object' && t.trang_thai !== null) {
          trangThai = t.trang_thai;
        } else {
          trangThai = t.trang_thai || 'unknown';
        }

        return {
          id: t.id,
          ma_dat_cho: t.ma_dat_cho,
          tour_tieu_de: t.tour_tieu_de,
          nguoi_dung_ten: t.nguoi_dung_ten,
          so_tien: t.so_tien,
          phi_dich_vu: t.phi_dich_vu,
          so_tien_thuc_nhan: t.so_tien_thuc_nhan,
          ngay_thanh_toan: t.ngay_thanh_toan,
          trang_thai: trangThai,
        };
      }));
    } catch (error) {
      console.error('Error loading revenue data:', error);
      showToast('Không thể tải dữ liệu doanh thu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const handleExportSummaryCsv = () => {
    if (!revenueData) return;
    exportToCsv('supplier-doanh-thu-tong-quan.csv', [
      {
        tong_doanh_thu: revenueData.tong_doanh_thu,
        doanh_thu_thang_nay: revenueData.doanh_thu_thang_nay,
        doanh_thu_thang_truoc: revenueData.doanh_thu_thang_truoc,
        ty_le_tang_truong: revenueData.ty_le_tang_truong,
        so_dat_cho: revenueData.so_dat_cho,
        doanh_thu_trung_binh_don: revenueData.doanh_thu_trung_binh_don,
      },
    ]);
  };
  const handleExportSummaryXlsx = () => {
    if (!revenueData) return;
    exportToXlsx('supplier-doanh-thu-tong-quan.xlsx', [
      {
        tong_doanh_thu: revenueData.tong_doanh_thu,
        doanh_thu_thang_nay: revenueData.doanh_thu_thang_nay,
        doanh_thu_thang_truoc: revenueData.doanh_thu_thang_truoc,
        ty_le_tang_truong: revenueData.ty_le_tang_truong,
        so_dat_cho: revenueData.so_dat_cho,
        doanh_thu_trung_binh_don: revenueData.doanh_thu_trung_binh_don,
      },
    ]);
  };

  const handleExportTransactionsCsv = () => {
    if (transactions.length === 0) return;
    const rows = transactions.map((t) => ({
      ma_dat_cho: t.ma_dat_cho,
      tour: t.tour_tieu_de,
      khach_hang: t.nguoi_dung_ten,
      so_tien: t.so_tien,
      phi_dich_vu: t.phi_dich_vu,
      so_tien_thuc_nhan: t.so_tien_thuc_nhan,
      ngay_thanh_toan: t.ngay_thanh_toan,
    }));
    exportToCsv('supplier-giao-dich.csv', rows);
  };
  const handleExportTransactionsXlsx = () => {
    if (transactions.length === 0) return;
    const rows = transactions.map((t) => ({
      ma_dat_cho: t.ma_dat_cho,
      tour: t.tour_tieu_de,
      khach_hang: t.nguoi_dung_ten,
      so_tien: t.so_tien,
      phi_dich_vu: t.phi_dich_vu,
      so_tien_thuc_nhan: t.so_tien_thuc_nhan,
      ngay_thanh_toan: t.ngay_thanh_toan,
    }));
    exportToXlsx('supplier-giao-dich.xlsx', rows);
  };

  const getStatusBadge = (status: string | { trang_thai_dat_cho?: string; valid?: boolean }) => {
    // Extract status string from object or use string directly
    let statusStr: string;
    if (typeof status === 'object' && status !== null) {
      statusStr = status.trang_thai_dat_cho || 'unknown';
    } else {
      statusStr = status || 'unknown';
    }

    const statusMap: { [key: string]: { text: string; className: string } } = {
      'hoan_thanh': { text: 'Hoàn thành', className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
      'da_thanh_toan': { text: 'Đã thanh toán', className: 'bg-green-500/20 text-green-300 border border-green-500/30' },
      'cho_xu_ly': { text: 'Chờ xử lý', className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
      'dang_xu_ly': { text: 'Đang xử lý', className: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
      'cho_xac_nhan': { text: 'Chờ xác nhận', className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
      'da_xac_nhan': { text: 'Đã xác nhận', className: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
      'da_huy': { text: 'Đã hủy', className: 'bg-red-500/20 text-red-300 border border-red-500/30' },
    };
    
    const statusInfo = statusMap[statusStr] || { text: statusStr, className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded border ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<SupplierSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải dữ liệu doanh thu..." />
        </div>
      </DashboardLayout>
    );
  }

  if (!revenueData) return null;

  return (
    <DashboardLayout sidebar={<SupplierSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-pink-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Doanh Thu & Thu Nhập</h1>
              <p className="text-cyan-300">Theo dõi và quản lý tài chính</p>
            </div>
            <div className="flex items-center gap-3">
              <ExportDropdown
                onExportCsv={handleExportSummaryCsv}
                onExportXlsx={handleExportSummaryXlsx}
                disabled={!revenueData}
                label="Xuất tổng quan"
              />
              <ExportDropdown
                onExportCsv={handleExportTransactionsCsv}
                onExportXlsx={handleExportTransactionsXlsx}
                disabled={transactions.length === 0}
                label="Xuất giao dịch"
              />
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Period Filter */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6 mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-300">Khoảng thời gian:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'today', label: 'Hôm nay' },
              { value: 'week', label: 'Tuần này' },
              { value: 'month', label: 'Tháng này' },
              { value: 'year', label: 'Năm nay' },
              { value: 'custom', label: 'Tùy chỉnh' },
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setTimePeriod(period.value as TimePeriod)}
                className={`px-4 py-2 rounded-lg transition-colors border ${
                  timePeriod === period.value
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-cyan-400/50'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-xl p-6 border border-cyan-400/30 shadow-lg backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
              <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              revenueData.ty_le_tang_truong >= 0 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'
            }`}>
              {revenueData.ty_le_tang_truong >= 0 ? '↑' : '↓'} {Math.abs(revenueData.ty_le_tang_truong)}%
            </div>
          </div>
          <p className="text-cyan-300 text-sm mb-2">Tổng Doanh Thu</p>
          <p className="text-3xl font-bold text-white">{formatPrice(revenueData.tong_doanh_thu)}</p>
          <p className="text-cyan-200 text-xs mt-2">
            Tháng trước: {formatPrice(revenueData.doanh_thu_thang_truoc)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-2">Số Đặt Chỗ</p>
          <p className="text-3xl font-bold text-white">{formatNumber(revenueData.so_dat_cho)}</p>
          <p className="text-gray-500 text-xs mt-2">Trong kỳ</p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-2">Trung Bình/Đơn</p>
          <p className="text-3xl font-bold text-white">{formatPrice(revenueData.doanh_thu_trung_binh_don)}</p>
          <p className="text-gray-500 text-xs mt-2">Giá trị đơn hàng</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-cyan-400">
                {formatPrice(revenueData.doanh_thu_thang_nay)}
              </p>
            </div>
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-yellow-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tổng số giao dịch</p>
              <p className="text-2xl font-bold text-yellow-400">{formatNumber(transactions.length)}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-400/30">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tổng phí dịch vụ</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatPrice(transactions.reduce((sum, t) => sum + t.phi_dich_vu, 0))}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-red-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tổng thực nhận</p>
              <p className="text-2xl font-bold text-red-400">
                {formatPrice(transactions.reduce((sum, t) => sum + t.so_tien_thuc_nhan, 0))}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-400/30">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Giao Dịch Gần Đây</h3>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
            Xuất báo cáo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Mã đặt chỗ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Tour
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Phí dịch vụ
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Thực nhận
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Ngày thanh toán
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/40 divide-y divide-white/10">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-cyan-400">{transaction.ma_dat_cho}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white">{transaction.tour_tieu_de}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-white">{transaction.nguoi_dung_ten}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">{formatPrice(transaction.so_tien)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-red-400">-{formatPrice(transaction.phi_dich_vu)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-cyan-400">{formatPrice(transaction.so_tien_thuc_nhan)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-400">
                      {new Date(transaction.ngay_thanh_toan).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.trang_thai)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="relative rounded-3xl overflow-hidden mt-8">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10">
          <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px]" />
        </div>
        
        <div className="relative z-10 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Số dư khả dụng</h3>
              <p className="text-4xl font-bold mb-1">
                {formatPrice(transactions.reduce((sum, t) => sum + t.so_tien_thuc_nhan, 0))}
              </p>
              <p className="text-blue-200 text-sm">Tổng số tiền thực nhận từ các giao dịch</p>
            </div>
            <button 
              className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold shadow-lg"
              onClick={() => showToast('Tính năng rút tiền đang được phát triển', 'info')}
            >
              Yêu cầu rút tiền
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

