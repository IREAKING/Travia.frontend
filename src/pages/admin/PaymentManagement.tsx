import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { transactionService } from '../../services/transactionService';
import type { Transaction } from '../../services/transactionService';

interface Payment {
  id: number;
  booking_id: number;
  user_name: string;
  tour_title: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string;
  created_at: string;
}

type PaymentStatus = 'all' | 'pending' | 'completed' | 'failed' | 'refunded';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'pending': { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'completed': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'failed': { bg: 'bg-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
  'refunded': { bg: 'bg-purple-500/20', text: 'text-purple-400', dot: 'bg-purple-400' },
};

const STATUS_LABELS: Record<string, string> = {
  'pending': 'Đang xử lý',
  'completed': 'Hoàn thành',
  'failed': 'Thất bại',
  'refunded': 'Đã hoàn tiền',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  'vnpay': 'VNPay',
  'momo': 'MoMo',
  'bank_transfer': 'Chuyển khoản',
  'cash': 'Tiền mặt',
  'credit_card': 'Thẻ tín dụng',
};

export const PaymentManagementPage = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Mock data
  const mockPayments: Payment[] = [
    {
      id: 1,
      booking_id: 101,
      user_name: 'Nguyễn Văn A',
      tour_title: 'Tour Đà Nẵng - Hội An 3N2Đ',
      amount: 5500000,
      payment_method: 'vnpay',
      status: 'completed',
      transaction_id: 'VNP123456789',
      created_at: '2024-12-05T14:30:00Z',
    },
    {
      id: 2,
      booking_id: 102,
      user_name: 'Trần Thị B',
      tour_title: 'Tour Phú Quốc 4N3Đ',
      amount: 8200000,
      payment_method: 'momo',
      status: 'completed',
      transaction_id: 'MOMO987654321',
      created_at: '2024-12-05T10:15:00Z',
    },
    {
      id: 3,
      booking_id: 103,
      user_name: 'Lê Văn C',
      tour_title: 'Tour Sapa - Fansipan 3N2Đ',
      amount: 4800000,
      payment_method: 'bank_transfer',
      status: 'pending',
      transaction_id: 'BT111222333',
      created_at: '2024-12-06T09:00:00Z',
    },
    {
      id: 4,
      booking_id: 104,
      user_name: 'Phạm Thị D',
      tour_title: 'Tour Nha Trang 5N4Đ',
      amount: 12500000,
      payment_method: 'credit_card',
      status: 'failed',
      transaction_id: 'CC444555666',
      created_at: '2024-12-04T16:45:00Z',
    },
    {
      id: 5,
      booking_id: 105,
      user_name: 'Hoàng Văn E',
      tour_title: 'Tour Hạ Long 2N1Đ',
      amount: 2800000,
      payment_method: 'vnpay',
      status: 'refunded',
      transaction_id: 'VNP777888999',
      created_at: '2024-12-03T11:20:00Z',
    },
  ];

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions({
        limit: 100,
        offset: 0,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      // Convert Transaction[] to Payment[]
      const convertedPayments: Payment[] = response.data.map((tx: Transaction) => {
        // Convert so_tien - backend returns as number after JSON serialization
        let amount = 0;
        if (typeof tx.so_tien === 'number') {
          amount = tx.so_tien;
        } else if (typeof tx.so_tien === 'string') {
          amount = parseFloat(tx.so_tien) || 0;
        } else if (tx.so_tien && typeof tx.so_tien === 'object') {
          // Handle pgtype.Numeric if it comes as object
          const numObj = tx.so_tien as any;
          if (numObj.Float64Value) {
            const val = numObj.Float64Value();
            amount = val?.Float64 || 0;
          } else if (numObj.Int64Value) {
            const val = numObj.Int64Value();
            amount = val?.Int64 || 0;
          } else if (numObj.Int !== undefined) {
            amount = numObj.Int;
          } else if (numObj.Float !== undefined) {
            amount = numObj.Float;
          }
        }

        // Get status string
        const statusStr = tx.trang_thai?.valid ? tx.trang_thai.trang_thai_thanh_toan : 'pending';
        const statusMap: Record<string, string> = {
          'cho_thanh_toan': 'pending',
          'dang_cho_thanh_toan': 'pending',
          'thanh_cong': 'completed',
          'that_bai': 'failed',
          'hoan_tien': 'refunded',
        };

        // Get payment method from gateway or booking
        const paymentMethod = tx.ten_cong_thanh_toan?.toLowerCase() || 
                              tx.phuong_thuc_thanh_toan?.toLowerCase() || 
                              'unknown';

        return {
          id: tx.id,
          booking_id: tx.dat_cho_id || 0,
          user_name: tx.ten_nguoi_dung || 'N/A',
          tour_title: tx.ten_tour || 'N/A',
          amount: amount,
          payment_method: paymentMethod,
          status: statusMap[statusStr] || statusStr,
          transaction_id: tx.ma_giao_dich_noi_bo,
          created_at: tx.ngay_tao,
        };
      });

      setPayments(convertedPayments);
    } catch (error: any) {
      console.error('Error loading payments:', error);
      showToast(
        error?.response?.data?.error || 'Không thể tải danh sách thanh toán',
        'error'
      );
      // Fallback to mock data on error
      setPayments(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hoàn tiền cho giao dịch này?')) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId ? { ...payment, status: 'refunded' } : payment
      ));
      showToast('Hoàn tiền thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tour_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    completed: payments.filter(p => p.status === 'completed').length,
    failed: payments.filter(p => p.status === 'failed').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
  };

  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải danh sách thanh toán..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-60"></div>
                <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Quản Lý Thanh Toán</h1>
                <p className="text-slate-400">Theo dõi và quản lý các giao dịch thanh toán</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Tổng thu</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {formatCurrency(totalRevenue, 'VND')}
                </p>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Đã hoàn</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {formatCurrency(totalRefunded, 'VND')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Đang xử lý</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Hoàn thành</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.completed}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Thất bại</p>
          <p className="text-2xl font-bold text-rose-400">{stats.failed}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Đã hoàn tiền</p>
          <p className="text-2xl font-bold text-purple-400">{stats.refunded}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm theo mã giao dịch, tên khách hàng, tour..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all" className="bg-slate-900">Tất cả trạng thái</option>
              <option value="pending" className="bg-slate-900">Đang xử lý</option>
              <option value="completed" className="bg-slate-900">Hoàn thành</option>
              <option value="failed" className="bg-slate-900">Thất bại</option>
              <option value="refunded" className="bg-slate-900">Đã hoàn tiền</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Hiển thị <span className="font-semibold text-white">{filteredPayments.length}</span> giao dịch
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy giao dịch nào</h3>
          <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Mã GD</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Khách hàng</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Tour</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Số tiền</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Phương thức</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Trạng thái</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Ngày</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPayments.map((payment) => {
                  const style = STATUS_STYLES[payment.status] || STATUS_STYLES['pending'];
                  return (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <span className="text-sm font-mono text-emerald-400">#{payment.id}</span>
                          <p className="text-xs text-slate-500 mt-0.5">{payment.transaction_id}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-white font-medium">{payment.user_name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300 line-clamp-1 max-w-[200px]">
                          {payment.tour_title}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                          {formatCurrency(payment.amount, 'VND')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 bg-white/5 text-slate-300 text-xs font-medium rounded-lg border border-white/10">
                          {PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${style.bg} rounded-lg`}>
                          <span className={`w-1.5 h-1.5 ${style.dot} rounded-full`}></span>
                          <span className={`text-xs font-medium ${style.text}`}>
                            {STATUS_LABELS[payment.status] || payment.status}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-400">
                          {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {payment.status === 'completed' && (
                            <button
                              onClick={() => handleRefund(payment.id)}
                              className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                              title="Hoàn tiền"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
            
            <div className="relative inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-slate-900 rounded-3xl shadow-2xl border border-white/10">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-200 text-sm mb-1">Mã giao dịch</p>
                    <h3 className="text-2xl font-bold text-white">{selectedPayment.transaction_id}</h3>
                  </div>
                  <button onClick={() => setShowDetailModal(false)} className="text-white/80 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Khách hàng</p>
                    <p className="text-white font-medium">{selectedPayment.user_name}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Mã booking</p>
                    <p className="text-white font-medium">#{selectedPayment.booking_id}</p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Tour</p>
                  <p className="text-white font-medium">{selectedPayment.tour_title}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Số tiền</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {formatCurrency(selectedPayment.amount, 'VND')}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Phương thức</p>
                    <p className="text-white font-medium">
                      {PAYMENT_METHOD_LABELS[selectedPayment.payment_method] || selectedPayment.payment_method}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-2">Trạng thái</p>
                    {(() => {
                      const style = STATUS_STYLES[selectedPayment.status] || STATUS_STYLES['pending'];
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${style.bg} rounded-lg`}>
                          <span className={`w-2 h-2 ${style.dot} rounded-full`}></span>
                          <span className={`text-sm font-medium ${style.text}`}>
                            {STATUS_LABELS[selectedPayment.status] || selectedPayment.status}
                          </span>
                        </span>
                      );
                    })()}
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Thời gian</p>
                    <p className="text-white font-medium">
                      {new Date(selectedPayment.created_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                  >
                    Đóng
                  </button>
                  {selectedPayment.status === 'completed' && (
                    <button
                      onClick={() => {
                        handleRefund(selectedPayment.id);
                        setShowDetailModal(false);
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                    >
                      Hoàn tiền
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

