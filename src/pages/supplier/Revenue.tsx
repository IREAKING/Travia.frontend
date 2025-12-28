import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';

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
  trang_thai: string;
}

export const SupplierRevenuePage = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Mock data
  const mockRevenueData: RevenueData = {
    tong_doanh_thu: 250000000,
    doanh_thu_thang_nay: 65000000,
    doanh_thu_thang_truoc: 55000000,
    ty_le_tang_truong: 18.2,
    so_dat_cho: 48,
    doanh_thu_trung_binh_don: 1354166,
  };

  const mockTransactions: Transaction[] = [
    {
      id: 1,
      ma_dat_cho: 'BK-2024-001',
      tour_tieu_de: 'Du lịch Đà Nẵng 3N2Đ',
      nguoi_dung_ten: 'Nguyễn Văn A',
      so_tien: 15000000,
      phi_dich_vu: 750000,
      so_tien_thuc_nhan: 14250000,
      ngay_thanh_toan: '2024-11-10T08:30:00Z',
      trang_thai: 'hoan_thanh'
    },
    {
      id: 2,
      ma_dat_cho: 'BK-2024-002',
      tour_tieu_de: 'Phú Quốc 4N3Đ',
      nguoi_dung_ten: 'Trần Thị B',
      so_tien: 28000000,
      phi_dich_vu: 1400000,
      so_tien_thuc_nhan: 26600000,
      ngay_thanh_toan: '2024-11-08T14:20:00Z',
      trang_thai: 'hoan_thanh'
    },
    {
      id: 3,
      ma_dat_cho: 'BK-2024-003',
      tour_tieu_de: 'Sapa 3N2Đ',
      nguoi_dung_ten: 'Lê Văn C',
      so_tien: 18000000,
      phi_dich_vu: 900000,
      so_tien_thuc_nhan: 17100000,
      ngay_thanh_toan: '2024-11-05T10:15:00Z',
      trang_thai: 'hoan_thanh'
    },
  ];

  useEffect(() => {
    loadRevenueData();
  }, [timePeriod]);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRevenueData(mockRevenueData);
      setTransactions(mockTransactions);
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

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'hoan_thanh': { text: 'Hoàn thành', className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
      'cho_xu_ly': { text: 'Chờ xử lý', className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
      'dang_xu_ly': { text: 'Đang xử lý', className: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
    };
    
    const statusInfo = statusMap[status] || { text: status, className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' };
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
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
              <p className="text-sm text-gray-400 mb-1">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-yellow-400">{formatPrice(5000000)}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-400/30">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Đã rút</p>
              <p className="text-2xl font-bold text-purple-400">{formatPrice(45000000)}</p>
            </div>
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-red-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Hoàn tiền</p>
              <p className="text-2xl font-bold text-red-400">{formatPrice(2000000)}</p>
            </div>
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center border border-red-400/30">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
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
              <p className="text-4xl font-bold mb-1">{formatPrice(15000000)}</p>
              <p className="text-blue-200 text-sm">Có thể rút về tài khoản</p>
            </div>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors font-semibold shadow-lg">
              Yêu cầu rút tiền
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

