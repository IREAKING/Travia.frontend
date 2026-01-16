import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Suspense, lazy, useEffect, useState } from 'react';
import { ChartLoading, LoadingSpinner } from '../../components/common/Loading';
import { supplierService } from '../../services/supplierService';
import type { 
  Tour, 
  SupplierDashboardOverview,
  SupplierRecentBooking,
  SupplierUpcomingDeparture,
  SupplierMonthlyComparison
} from '../../types';
import { useToast } from '../../hooks/useToast';

// Lazy load chart components để giảm bundle size
const RevenueChart = lazy(() => import('../../components/charts/RevenueChart').then(module => ({ default: module.RevenueChart })));
const CustomerStatsChart = lazy(() => import('../../components/charts/CustomerStatsChart').then(module => ({ default: module.CustomerStatsChart })));
const TourCategoriesChart = lazy(() => import('../../components/charts/TourCategoriesChart').then(module => ({ default: module.TourCategoriesChart })));
const SupplierBookingStatsChart = lazy(() => import('../../components/charts/SupplierBookingStatsChart').then(module => ({ default: module.SupplierBookingStatsChart })));
const TourPerformanceChart = lazy(() => import('../../components/charts/TourPerformanceChart').then(module => ({ default: module.TourPerformanceChart })));

export const SupplierDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const [overview, setOverview] = useState<SupplierDashboardOverview | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [recentBookings, setRecentBookings] = useState<SupplierRecentBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [upcomingDepartures, setUpcomingDepartures] = useState<SupplierUpcomingDeparture[]>([]);
  const [isLoadingDepartures, setIsLoadingDepartures] = useState(true);
  const [monthlyComparison, setMonthlyComparison] = useState<SupplierMonthlyComparison | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    await Promise.all([
      fetchMyTours(),
      fetchOverview(),
      fetchRecentBookings(),
      fetchUpcomingDepartures(),
      fetchMonthlyComparison()
    ]);
  };

  const fetchMyTours = async () => {
    try {
      setIsLoadingTours(true);
      const data = await supplierService.getMyTours(10, 0);
      setTours(data || []);
    } catch (error: any) {
      console.error('Error fetching tours:', error);
      showToast('Không thể tải danh sách tour', 'error');
    } finally {
      setIsLoadingTours(false);
    }
  };

  const fetchOverview = async () => {
    try {
      setIsLoadingOverview(true);
      const data = await supplierService.getDashboardOverview();
      setOverview(data);
    } catch (error: any) {
      console.error('Error fetching overview:', error);
      showToast('Không thể tải tổng quan dashboard', 'error');
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const data = await supplierService.getRecentBookings(5);
      setRecentBookings(data || []);
    } catch (error: any) {
      console.error('Error fetching recent bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const fetchUpcomingDepartures = async () => {
    try {
      setIsLoadingDepartures(true);
      const data = await supplierService.getUpcomingDepartures(5);
      setUpcomingDepartures(data || []);
    } catch (error: any) {
      console.error('Error fetching upcoming departures:', error);
    } finally {
      setIsLoadingDepartures(false);
    }
  };

  const fetchMonthlyComparison = async () => {
    try {
      setIsLoadingComparison(true);
      const data = await supplierService.getMonthlyComparison();
      setMonthlyComparison(data);
    } catch (error: any) {
      console.error('Error fetching monthly comparison:', error);
    } finally {
      setIsLoadingComparison(false);
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

  const formatNumber = (num: number | string) => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return '0';
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + 'M';
    }
    if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'K';
    }
    return numValue.toString();
  };

  const formatPercent = (percent: number) => {
    if (isNaN(percent)) return '0%';
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
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

  // Helper function to get status display text
  const getStatusText = (status: any): string => {
    const statusStr = getStatusString(status);
    if (!statusStr) return 'N/A';
    
    const statusMap: Record<string, string> = {
      'da_thanh_toan': 'Đã thanh toán',
      'cho_xac_nhan': 'Chờ xác nhận',
      'da_xac_nhan': 'Đã xác nhận',
      'hoan_thanh': 'Hoàn thành',
      'da_huy': 'Đã hủy'
    };
    
    return statusMap[statusStr] || statusStr;
  };

  // Helper function to get status color classes
  const getStatusColor = (status: any): string => {
    const statusStr = getStatusString(status);
    if (!statusStr) return 'bg-gray-500/20 text-gray-400';
    
    const colorMap: Record<string, string> = {
      'da_thanh_toan': 'bg-green-500/20 text-green-400',
      'cho_xac_nhan': 'bg-yellow-500/20 text-yellow-400',
      'da_xac_nhan': 'bg-blue-500/20 text-blue-400',
      'hoan_thanh': 'bg-purple-500/20 text-purple-400',
      'da_huy': 'bg-red-500/20 text-red-400'
    };
    
    return colorMap[statusStr] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <DashboardLayout sidebar={<SupplierSidebar />}>
      {/* Header Section */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-pink-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(99,102,241,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
        <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
              <h1 className="text-3xl font-bold text-white mb-1">Partner Dashboard</h1>
              <p className="text-indigo-300">Chào mừng {user?.name}</p>
            </div>
          </div>
        </div>
      </div> {/* Close header section's <div> */}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 backdrop-blur-xl rounded-xl p-6 border border-indigo-500/30 shadow-lg hover:shadow-indigo-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-300 text-sm mb-2">Tours Của Bạn</p>
                {isLoadingOverview ? (
                  <div className="h-8 w-16 bg-indigo-500/20 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-white">{overview?.total_tours || 0}</p>
                    <p className="text-indigo-400 text-xs mt-1">
                      {overview?.published_tours || 0} đã công bố
                    </p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-400/30">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm mb-2">Đặt Chỗ Mới</p>
                {isLoadingOverview ? (
                  <div className="h-8 w-16 bg-purple-500/20 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-white">{overview?.pending_bookings || 0}</p>
                    <p className="text-purple-400 text-xs mt-1">
                      {overview?.total_bookings || 0} tổng booking
                    </p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-400/30">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 backdrop-blur-xl rounded-xl p-6 border border-pink-500/30 shadow-lg hover:shadow-pink-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-300 text-sm mb-2">Đánh Giá</p>
                {isLoadingOverview ? (
                  <div className="h-8 w-16 bg-pink-500/20 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-white">
                      {overview?.avg_rating ? overview.avg_rating.toFixed(1) : '0.0'}
                    </p>
                    <p className="text-pink-400 text-xs mt-1">
                      {overview?.total_reviews || 0} đánh giá
                    </p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center border border-pink-400/30">
                <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/30 shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm mb-2">Doanh Thu</p>
                {isLoadingOverview || isLoadingComparison ? (
                  <div className="h-8 w-20 bg-blue-500/20 rounded animate-pulse"></div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-white">
                      {overview?.total_revenue ? formatNumber(overview.total_revenue) : '0'}
                    </p>
                    <p className="text-blue-400 text-xs mt-1">
                      {monthlyComparison?.revenue_change_percent 
                        ? formatPercent(monthlyComparison.revenue_change_percent) 
                        : '0%'} tháng này
                    </p>
                  </>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Chart - Full Width */}
        <div className="mb-8">
          <Suspense fallback={<ChartLoading />}>
            <RevenueChart />
          </Suspense>
        </div>

        {/* Customer Stats - Full Width */}
        <div className="mb-8">
          <Suspense fallback={<ChartLoading />}>
            <CustomerStatsChart />
          </Suspense>
        </div>

        {/* Charts Section - 2 columns */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Suspense fallback={<ChartLoading />}>
            <TourCategoriesChart />
          </Suspense>
          <Suspense fallback={<ChartLoading />}>
            <TourPerformanceChart />
          </Suspense>
        </div>

        {/* Booking Stats - Full Width */}
        <div className="mb-8">
          <Suspense fallback={<ChartLoading />}>
            <SupplierBookingStatsChart />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/supplier/create-tour" className="group">
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 backdrop-blur-xl rounded-xl border border-indigo-500/30 shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 p-6">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 border border-indigo-400/30">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
                </div>
              <div>
                  <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">Tạo Tour Mới</p>
                <p className="text-sm text-indigo-300/80">Thêm tour mới vào hệ thống</p>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/supplier/manage-tours" className="group">
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-xl rounded-xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 p-6">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 border border-purple-400/30">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
                </div>
              <div>
                  <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Quản Lý Tours</p>
                <p className="text-sm text-purple-300/80">Xem và chỉnh sửa tours</p>
                </div>
              </div>
            </div>
          </Link>

          <div className="group">
            <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/10 backdrop-blur-xl rounded-xl border border-pink-500/30 shadow-lg hover:shadow-pink-500/20 transition-all duration-300 p-6 cursor-pointer">
            <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500/30 to-indigo-500/30 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 border border-pink-400/30">
                  <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
                </div>
              <div>
                  <p className="font-semibold text-white group-hover:text-pink-300 transition-colors">Thống kê</p>
                <p className="text-sm text-pink-300/80">Xem báo cáo chi tiết</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings & Upcoming Departures */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Bookings */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Đặt Chỗ Gần Đây</h2>
              <Link to="/supplier/bookings" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                Xem tất cả →
              </Link>
            </div>
            {isLoadingBookings ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Chưa có đặt chỗ nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.booking_id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-white">{booking.tour_title}</p>
                        <p className="text-xs text-gray-400 mt-1">{booking.customer_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.trang_thai)}`}>
                        {getStatusText(booking.trang_thai)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">
                        {new Date(booking.ngay_dat).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm font-semibold text-indigo-400">
                        {formatPrice(booking.tong_tien, booking.don_vi_tien_te || 'VND')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Departures */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Lịch Khởi Hành Sắp Tới</h2>
              <Link to="/supplier/manage-tours" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
                Xem tất cả →
              </Link>
            </div>
            {isLoadingDepartures ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : upcomingDepartures.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Chưa có lịch khởi hành sắp tới</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDepartures.map((departure) => (
                  <div key={departure.departure_id} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{departure.tour_title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(departure.ngay_khoi_hanh).toLocaleDateString('vi-VN')} - {new Date(departure.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Chỗ trống</p>
                          <p className="text-sm font-semibold text-green-400">
                            {departure.available_seats}/{departure.suc_chua}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Đặt chỗ</p>
                          <p className="text-sm font-semibold text-indigo-400">
                            {departure.booking_count}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Doanh thu</p>
                        <p className="text-sm font-semibold text-blue-400">
                          {formatNumber(departure.revenue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Tours */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Tour Của Tôi</h2>
            <Link to="/supplier/manage-tours" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">
              Xem tất cả →
            </Link>
          </div>
          
          {isLoadingTours ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-400/30">
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-gray-400 mb-4">Bạn chưa có tour nào</p>
              <Link 
                to="/supplier/create-tour"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-400 hover:to-purple-400 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tạo tour đầu tiên
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {tours.map((tour) => (
                <Link 
                  key={tour.id} 
                  to={`/supplier/manage-tours/${tour.id}`}
                  className="block group"
                >
                  <div className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 hover:border-indigo-500/30 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-indigo-400/30 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-indigo-300 transition-colors truncate">
                        {tour.tieu_de}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-gray-400">
                          {tour.so_ngay} ngày {tour.so_dem} đêm
                        </p>
                        <p className="text-xs text-indigo-400 font-semibold">
                          {formatPrice(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
                        </p>
              </div>
            </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
              </div>
                </Link>
              ))}
            </div>
          )}
      </div>
    </DashboardLayout>
  );
};


