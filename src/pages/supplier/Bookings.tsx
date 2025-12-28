import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { supplierService } from '../../services/supplierService';
import type { SupplierBookingAdvanced } from '../../types';

type BookingStatus = 'all' | 'cho_xac_nhan' | 'da_xac_nhan' | 'da_thanh_toan' | 'hoan_thanh' | 'da_huy';

export const SupplierBookingsPage = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<SupplierBookingAdvanced[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [tourId, setTourId] = useState<number | undefined>(undefined);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [departureStartDate, setDepartureStartDate] = useState<string>('');
  const [departureEndDate, setDepartureEndDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('ngay_dat_desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [selectedBooking, setSelectedBooking] = useState<SupplierBookingAdvanced | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [currentPage, statusFilter, searchKeyword, tourId, startDate, endDate, departureStartDate, departureEndDate, paymentMethod, minAmount, maxAmount, sortBy]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * pageSize;
      
      const params: any = {
        limit: pageSize,
        offset,
        sort_by: sortBy,
      };
      
      if (statusFilter !== 'all') {
        params.trang_thai = statusFilter;
      }
      
      if (searchKeyword) {
        params.search_keyword = searchKeyword;
      }
      
      if (tourId) {
        params.tour_id = tourId;
      }
      
      if (startDate) {
        params.start_date = startDate;
      }
      
      if (endDate) {
        params.end_date = endDate;
      }
      
      if (departureStartDate) {
        params.departure_start_date = departureStartDate;
      }
      
      if (departureEndDate) {
        params.departure_end_date = departureEndDate;
      }
      
      if (paymentMethod) {
        params.phuong_thuc_thanh_toan = paymentMethod;
      }
      
      if (minAmount) {
        params.min_amount = parseFloat(minAmount);
      }
      
      if (maxAmount) {
        params.max_amount = parseFloat(maxAmount);
      }
      
      const result = await supplierService.getBookingsAdvanced(params);
      setBookings(Array.isArray(result.data) ? result.data : []);
      setTotalCount(result.total_count || 0);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      showToast(error?.response?.data?.message || 'Không thể tải danh sách đặt chỗ', 'error');
      // Ensure bookings is always an array even on error
      setBookings([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | string, currency: string = 'VND') => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency === 'VND' ? 'VND' : currency,
    }).format(numPrice);
  };

  // Helper function to extract status string from possible object format
  const getStatusString = (status: any): string | null => {
    if (!status) return null;
    if (typeof status === 'string') return status;
    if (typeof status === 'object' && status.trang_thai_dat_cho) {
      return status.valid ? status.trang_thai_dat_cho : null;
    }
    return null;
  };

  const getStatusBadge = (status: any) => {
    const statusStr = getStatusString(status);
    const statusMap: { [key: string]: { text: string; className: string } } = {
      'cho_xac_nhan': { text: 'Chờ xác nhận', className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
      'da_xac_nhan': { text: 'Đã xác nhận', className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
      'da_thanh_toan': { text: 'Đã thanh toán', className: 'bg-green-500/20 text-green-300 border border-green-500/30' },
      'hoan_thanh': { text: 'Hoàn thành', className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' },
      'da_huy': { text: 'Đã hủy', className: 'bg-red-500/20 text-red-300 border border-red-500/30' },
    };
    
    const statusInfo = statusStr ? statusMap[statusStr] : { text: statusStr || 'N/A', className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getPaymentMethodText = (method: string | null) => {
    if (!method) return 'N/A';
    const methodMap: { [key: string]: string } = {
      'stripe_card': 'Thẻ tín dụng',
      'paypal': 'PayPal',
      'vnpay': 'VNPay',
      'momo': 'MoMo',
      'bank_transfer': 'Chuyển khoản',
      'cash': 'Tiền mặt',
    };
    return methodMap[method] || method;
  };

  const handleStatusChange = async (_bookingId: number, _newStatus: string) => {
    try {
      // TODO: Implement API call to update booking status
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadBookings();
      showToast('Cập nhật trạng thái thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra khi cập nhật trạng thái', 'error');
    }
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearchKeyword('');
    setTourId(undefined);
    setStartDate('');
    setEndDate('');
    setDepartureStartDate('');
    setDepartureEndDate('');
    setPaymentMethod('');
    setMinAmount('');
    setMaxAmount('');
    setSortBy('ngay_dat_desc');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // Ensure bookings is always an array
  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const stats = {
    total: totalCount,
    pending: safeBookings.filter(b => getStatusString(b.trang_thai) === 'cho_xac_nhan').length,
    confirmed: safeBookings.filter(b => getStatusString(b.trang_thai) === 'da_xac_nhan').length,
    paid: safeBookings.filter(b => getStatusString(b.trang_thai) === 'da_thanh_toan').length,
    completed: safeBookings.filter(b => getStatusString(b.trang_thai) === 'hoan_thanh').length,
  };

  if (loading && safeBookings.length === 0) {
    return (
      <DashboardLayout sidebar={<SupplierSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải đặt chỗ..." />
        </div>
      </DashboardLayout>
    );
  }

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
              <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Đặt Chỗ</h1>
              <p className="text-cyan-300">Theo dõi và quản lý các đặt chỗ tour</p>
          </div>
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tổng đặt chỗ</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-yellow-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Chờ xác nhận</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-400/30">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Đã xác nhận</p>
              <p className="text-3xl font-bold text-cyan-400">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-green-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Đã thanh toán</p>
              <p className="text-3xl font-bold text-green-400">{stats.paid}</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-400/30">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-gray-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Hoàn thành</p>
              <p className="text-3xl font-bold text-gray-300">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center border border-gray-400/30">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6 mb-8">
        <div className="flex flex-col gap-4">
          {/* Basic Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                  placeholder="Tìm theo tên khách hàng, email, tên tour..."
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setCurrentPage(1);
                  }}
                className="pl-10 pr-4 py-3 w-full bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Trạng thái:</span>
            <select
              value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as BookingStatus);
                  setCurrentPage(1);
                }}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
            >
              <option value="all" className="bg-slate-900">Tất cả</option>
              <option value="cho_xac_nhan" className="bg-slate-900">Chờ xác nhận</option>
              <option value="da_xac_nhan" className="bg-slate-900">Đã xác nhận</option>
                <option value="da_thanh_toan" className="bg-slate-900">Đã thanh toán</option>
              <option value="hoan_thanh" className="bg-slate-900">Hoàn thành</option>
              <option value="da_huy" className="bg-slate-900">Đã hủy</option>
            </select>
          </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-300">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
              >
                <option value="ngay_dat_desc" className="bg-slate-900">Ngày đặt (mới nhất)</option>
                <option value="ngay_dat_asc" className="bg-slate-900">Ngày đặt (cũ nhất)</option>
                <option value="tong_tien_desc" className="bg-slate-900">Tổng tiền (cao → thấp)</option>
                <option value="tong_tien_asc" className="bg-slate-900">Tổng tiền (thấp → cao)</option>
                <option value="ngay_khoi_hanh_asc" className="bg-slate-900">Ngày khởi hành (sớm nhất)</option>
                <option value="ngay_khoi_hanh_desc" className="bg-slate-900">Ngày khởi hành (muộn nhất)</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2"
            >
              <svg className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {showAdvancedFilters ? 'Ẩn bộ lọc nâng cao' : 'Hiển thị bộ lọc nâng cao'}
            </button>
            <button
              onClick={handleResetFilters}
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tour ID</label>
                <input
                  type="number"
                  value={tourId || ''}
                  onChange={(e) => {
                    setTourId(e.target.value ? parseInt(e.target.value) : undefined);
                    setCurrentPage(1);
                  }}
                  placeholder="Nhập ID tour"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ngày đặt từ</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ngày đặt đến</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ngày khởi hành từ</label>
                <input
                  type="date"
                  value={departureStartDate}
                  onChange={(e) => {
                    setDepartureStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ngày khởi hành đến</label>
                <input
                  type="date"
                  value={departureEndDate}
                  onChange={(e) => {
                    setDepartureEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Phương thức thanh toán</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                >
                  <option value="" className="bg-slate-900">Tất cả</option>
                  <option value="stripe_card" className="bg-slate-900">Thẻ tín dụng</option>
                  <option value="paypal" className="bg-slate-900">PayPal</option>
                  <option value="vnpay" className="bg-slate-900">VNPay</option>
                  <option value="momo" className="bg-slate-900">MoMo</option>
                  <option value="bank_transfer" className="bg-slate-900">Chuyển khoản</option>
                  <option value="cash" className="bg-slate-900">Tiền mặt</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Số tiền tối thiểu</label>
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => {
                    setMinAmount(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Nhập số tiền"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                />
        </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Số tiền tối đa</label>
                <input
                  type="number"
                  value={maxAmount}
                  onChange={(e) => {
                    setMaxAmount(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Nhập số tiền"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                />
              </div>
            </div>
          )}

          <div className="text-sm text-gray-400 pt-2 border-t border-white/10">
            Hiển thị <span className="font-semibold text-cyan-300">{safeBookings.length}</span> trong tổng số <span className="font-semibold text-cyan-300">{totalCount}</span> đặt chỗ
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {safeBookings.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy đặt chỗ</h3>
          <p className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <>
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg overflow-hidden">
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
                    Số người
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Ngày khởi hành
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900/40 divide-y divide-white/10">
                  {safeBookings.map((booking) => (
                    <tr key={booking.booking_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-cyan-400">#{booking.booking_id}</div>
                      <div className="text-xs text-gray-400">
                          {new Date(booking.ngay_dat).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{booking.tour_title}</div>
                        <div className="text-xs text-gray-400">Tour ID: {booking.tour_id}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">{booking.customer_name}</div>
                        <div className="text-xs text-gray-400">{booking.customer_email}</div>
                        {booking.customer_phone && (
                          <div className="text-xs text-gray-400">{booking.customer_phone}</div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {booking.so_nguoi_lon || 0} người lớn
                        {booking.so_tre_em && booking.so_tre_em > 0 && `, ${booking.so_tre_em} trẻ em`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(booking.ngay_khoi_hanh).toLocaleDateString('vi-VN')}
                        <div className="text-xs text-gray-400">
                          Đến: {new Date(booking.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                          {formatPrice(booking.tong_tien, booking.don_vi_tien_te || 'VND')}
                        </div>
                        {booking.phuong_thuc_thanh_toan && (
                          <div className="text-xs text-gray-400 mt-1">
                            {getPaymentMethodText(booking.phuong_thuc_thanh_toan)}
                      </div>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.trang_thai)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-400/30 hover:border-cyan-400/50"
                          title="Xem chi tiết"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                          {getStatusString(booking.trang_thai) === 'cho_xac_nhan' && (
                          <button
                              onClick={() => handleStatusChange(booking.booking_id, 'da_xac_nhan')}
                            className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-400/30 hover:border-cyan-400/50"
                            title="Xác nhận"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Trước
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-black/75 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
            
            <div className="relative inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl">
              <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Chi tiết đặt chỗ</h3>
                  <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Mã đặt chỗ</label>
                    <p className="text-lg font-semibold text-cyan-400">#{selectedBooking.booking_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Trạng thái</label>
                    <div className="mt-1">{getStatusBadge(selectedBooking.trang_thai)}</div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400">Tour</label>
                  <p className="text-base font-medium text-white">{selectedBooking.tour_title}</p>
                  <p className="text-sm text-gray-400">Tour ID: {selectedBooking.tour_id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Khách hàng</label>
                    <p className="text-base text-white">{selectedBooking.customer_name}</p>
                    <p className="text-sm text-gray-400">{selectedBooking.customer_email}</p>
                    {selectedBooking.customer_phone && (
                      <p className="text-sm text-gray-400">{selectedBooking.customer_phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Số người</label>
                    <p className="text-base text-white">
                      {selectedBooking.so_nguoi_lon || 0} người lớn
                      {selectedBooking.so_tre_em && selectedBooking.so_tre_em > 0 && `, ${selectedBooking.so_tre_em} trẻ em`}
                    </p>
                    <p className="text-sm text-gray-400">Tổng: {selectedBooking.total_passengers} người</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Ngày khởi hành</label>
                    <p className="text-base text-white">
                      {new Date(selectedBooking.ngay_khoi_hanh).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-sm text-gray-400">
                      Đến: {new Date(selectedBooking.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Tổng tiền</label>
                    <p className="text-xl font-bold text-cyan-400">
                      {formatPrice(selectedBooking.tong_tien, selectedBooking.don_vi_tien_te || 'VND')}
                    </p>
                    {selectedBooking.phuong_thuc_thanh_toan && (
                      <p className="text-sm text-gray-400 mt-1">
                        Phương thức: {getPaymentMethodText(selectedBooking.phuong_thuc_thanh_toan)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Sức chứa</label>
                    <p className="text-base text-white">
                      {selectedBooking.departure_booked} / {selectedBooking.departure_capacity}
                    </p>
                    <p className="text-sm text-gray-400">Còn trống: {selectedBooking.departure_available}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Thanh toán</label>
                    <p className="text-base text-white">
                      {selectedBooking.successful_payments} lần thành công
                    </p>
                    <p className="text-sm text-gray-400">
                      Doanh thu xác nhận: {formatPrice(selectedBooking.confirmed_revenue, selectedBooking.don_vi_tien_te || 'VND')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Đóng
                  </button>
                  {getStatusString(selectedBooking.trang_thai) === 'cho_xac_nhan' && (
                    <button
                      onClick={() => {
                        handleStatusChange(selectedBooking.booking_id, 'da_xac_nhan');
                        setShowDetailModal(false);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/25"
                    >
                      Xác nhận đặt chỗ
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
