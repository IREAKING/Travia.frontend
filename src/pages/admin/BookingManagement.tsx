import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { adminService } from '../../services/adminService';
import { formatCurrency } from '../../utils/formatters';
import type { RecentBooking } from '../../types';

type BookingStatus = 'all' | 'cho_xac_nhan' | 'da_xac_nhan' | 'da_thanh_toan' | 'hoan_thanh' | 'da_huy';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'cho_xac_nhan': { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'da_xac_nhan': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'da_thanh_toan': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'hoan_thanh': { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  'da_huy': { bg: 'bg-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
};

const STATUS_LABELS: Record<string, string> = {
  'cho_xac_nhan': 'Chờ xác nhận',
  'da_xac_nhan': 'Đã xác nhận',
  'da_thanh_toan': 'Đã thanh toán',
  'hoan_thanh': 'Hoàn thành',
  'da_huy': 'Đã hủy',
};

const getStatusString = (status: any): string | null => {
  if (!status) return null;
  if (typeof status === 'string') return status;
  if (typeof status === 'object') {
    return status.trang_thai_dat_cho || status.TrangThaiDatCho || null;
  }
  return String(status);
};

export const BookingManagementPage = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [selectedBooking, setSelectedBooking] = useState<RecentBooking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getRecentBookings(100);
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      showToast('Không thể tải danh sách đặt chỗ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 500));
      setBookings(prev => prev.map(booking => 
        (booking.id || booking.booking_id) === bookingId ? { ...booking, trang_thai: newStatus, status: newStatus } : booking
      ));
      showToast('Cập nhật trạng thái thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.tour_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.id || booking.booking_id)?.toString().includes(searchTerm);
    const statusStr = getStatusString(booking.trang_thai || booking.status);
    const matchesStatus = statusFilter === 'all' || statusStr === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => getStatusString(b.trang_thai || b.status) === 'cho_xac_nhan').length,
    confirmed: bookings.filter(b => getStatusString(b.trang_thai || b.status) === 'da_xac_nhan').length,
    paid: bookings.filter(b => getStatusString(b.trang_thai || b.status) === 'da_thanh_toan').length,
    completed: bookings.filter(b => getStatusString(b.trang_thai || b.status) === 'hoan_thanh').length,
    cancelled: bookings.filter(b => getStatusString(b.trang_thai || b.status) === 'da_huy').length,
  };

  const totalRevenue = bookings
    .filter(b => {
      const status = getStatusString(b.trang_thai || b.status);
      return status === 'da_thanh_toan' || status === 'hoan_thanh';
    })
    .reduce((sum, b) => {
      const priceValue = b.tong_gia || b.total_amount;
      const price = typeof priceValue === 'string' 
        ? parseFloat(priceValue) 
        : (typeof priceValue === 'number' ? priceValue : 0);
      return sum + price;
    }, 0);

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải danh sách đặt chỗ..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-rose-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(236,72,153,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl blur opacity-60"></div>
                <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Quản Lý Đặt Chỗ</h1>
                <p className="text-slate-400">Xem và quản lý tất cả đơn đặt tour</p>
              </div>
            </div>
            
            <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Tổng doanh thu</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                {formatCurrency(totalRevenue, 'VND')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-6 gap-4 mb-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Tổng số</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Chờ xác nhận</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Đã xác nhận</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.confirmed}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Đã thanh toán</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.paid}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Hoàn thành</p>
          <p className="text-2xl font-bold text-blue-400">{stats.completed}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Đã hủy</p>
          <p className="text-2xl font-bold text-rose-400">{stats.cancelled}</p>
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
                placeholder="Tìm theo mã đặt chỗ, tên khách hàng, tour..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            >
              <option value="all" className="bg-slate-900">Tất cả trạng thái</option>
              <option value="cho_xac_nhan" className="bg-slate-900">Chờ xác nhận</option>
              <option value="da_xac_nhan" className="bg-slate-900">Đã xác nhận</option>
              <option value="da_thanh_toan" className="bg-slate-900">Đã thanh toán</option>
              <option value="hoan_thanh" className="bg-slate-900">Hoàn thành</option>
              <option value="da_huy" className="bg-slate-900">Đã hủy</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Hiển thị <span className="font-semibold text-white">{filteredBookings.length}</span> đặt chỗ
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy đặt chỗ nào</h3>
          <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Mã</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Khách hàng</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Tour</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Giá trị</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Trạng thái</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Ngày đặt</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.map((booking) => {
                  const statusStr = getStatusString(booking.trang_thai || booking.status) || 'cho_xac_nhan';
                  const style = STATUS_STYLES[statusStr] || STATUS_STYLES['cho_xac_nhan'];
                  const priceValue = booking.tong_gia || booking.total_amount;
                  const totalPrice = typeof priceValue === 'string' 
                    ? parseFloat(priceValue) 
                    : (typeof priceValue === 'number' ? priceValue : 0);
                  const bookingId = booking.id || booking.booking_id;
                  return (
                    <tr key={bookingId} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <span className="text-sm font-mono text-cyan-400">#{bookingId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-lg flex items-center justify-center border border-white/10">
                            <span className="text-xs font-bold text-white">
                              {booking.user_name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <span className="text-sm text-white font-medium">{booking.user_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-300 line-clamp-1 max-w-[200px]">
                          {booking.tour_title || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-semibold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                          {formatCurrency(totalPrice || 0, 'VND')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${style.bg} rounded-lg`}>
                          <span className={`w-1.5 h-1.5 ${style.dot} rounded-full`}></span>
                          <span className={`text-xs font-medium ${style.text}`}>
                            {STATUS_LABELS[statusStr] || statusStr}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-400">
                          {booking.ngay_dat ? new Date(booking.ngay_dat).toLocaleDateString('vi-VN') : 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
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
                          <select
                            value={getStatusString(booking.trang_thai || booking.status) || 'cho_xac_nhan'}
                            onChange={(e) => handleStatusChange(bookingId, e.target.value)}
                            className="text-xs px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                          >
                            <option value="cho_xac_nhan" className="bg-slate-900">Chờ xác nhận</option>
                            <option value="da_xac_nhan" className="bg-slate-900">Đã xác nhận</option>
                            <option value="da_thanh_toan" className="bg-slate-900">Đã thanh toán</option>
                            <option value="hoan_thanh" className="bg-slate-900">Hoàn thành</option>
                            <option value="da_huy" className="bg-slate-900">Đã hủy</option>
                          </select>
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
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
            
            <div className="relative inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-slate-900 rounded-3xl shadow-2xl border border-white/10">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-200 text-sm mb-1">Mã đặt chỗ</p>
                    <h3 className="text-2xl font-bold text-white">#{(selectedBooking.id || selectedBooking.booking_id)}</h3>
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
                    <p className="text-white font-medium">{selectedBooking.user_name || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Ngày đặt</p>
                    <p className="text-white font-medium">
                      {selectedBooking.ngay_dat ? new Date(selectedBooking.ngay_dat).toLocaleString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-sm text-slate-400 mb-1">Tour</p>
                  <p className="text-white font-medium">{selectedBooking.tour_title || 'N/A'}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Tổng giá trị</p>
                    <p className="text-xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                      {(() => {
                        const priceValue = selectedBooking.tong_gia || selectedBooking.total_amount;
                        const price = typeof priceValue === 'string' 
                          ? parseFloat(priceValue) 
                          : (typeof priceValue === 'number' ? priceValue : 0);
                        return formatCurrency(price, 'VND');
                      })()}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-2">Trạng thái</p>
                    {(() => {
                      const statusStr = getStatusString(selectedBooking.trang_thai || selectedBooking.status) || 'cho_xac_nhan';
                      const style = STATUS_STYLES[statusStr] || STATUS_STYLES['cho_xac_nhan'];
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${style.bg} rounded-lg`}>
                          <span className={`w-2 h-2 ${style.dot} rounded-full`}></span>
                          <span className={`text-sm font-medium ${style.text}`}>
                            {STATUS_LABELS[statusStr] || statusStr}
                          </span>
                        </span>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

