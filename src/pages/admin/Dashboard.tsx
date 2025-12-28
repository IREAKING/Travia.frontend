import { useEffect, useState, Suspense, lazy } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { adminService } from '../../services/adminService';
import type { 
  DashboardOverviewWithComparison, 
  NewUsersToday,
  UserStatsByRole 
} from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner, ChartLoading } from '../../components/common/Loading';

// Lazy load admin chart components
const AdminRevenueChart = lazy(() => import('../../components/charts/AdminRevenueChart').then(module => ({ default: module.AdminRevenueChart })));
const AdminBookingStatusChart = lazy(() => import('../../components/charts/AdminBookingStatusChart').then(module => ({ default: module.AdminBookingStatusChart })));
const AdminTopToursChart = lazy(() => import('../../components/charts/AdminTopToursChart').then(module => ({ default: module.AdminTopToursChart })));
const AdminUserGrowthChart = lazy(() => import('../../components/charts/AdminUserGrowthChart').then(module => ({ default: module.AdminUserGrowthChart })));
const AdminTourPriceChart = lazy(() => import('../../components/charts/AdminTourPriceChart').then(module => ({ default: module.AdminTourPriceChart })));
const AdminToursCreatedChart = lazy(() => import('../../components/charts/AdminToursCreatedChart').then(module => ({ default: module.AdminToursCreatedChart })));
const RecentBookingsTable = lazy(() => import('../../components/admin/RecentBookingsTable').then(module => ({ default: module.RecentBookingsTable })));
const TopActiveUsersCard = lazy(() => import('../../components/admin/TopActiveUsersCard').then(module => ({ default: module.TopActiveUsersCard })));

// Helper to display change indicator
const ChangeIndicator = ({ value, suffix = '%' }: { value: number | string; suffix?: string }) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isPositive = numValue >= 0;
  
  return (
    <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
      <svg 
        className={`w-3 h-3 mr-0.5 ${!isPositive ? 'rotate-180' : ''}`} 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
      {Math.abs(numValue).toFixed(1)}{suffix}
    </span>
  );
};

export const AdminDashboard = () => {
  const [overview, setOverview] = useState<DashboardOverviewWithComparison | null>(null);
  const [newUsersToday, setNewUsersToday] = useState<NewUsersToday | null>(null);
  const [userStats, setUserStats] = useState<UserStatsByRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData, newUsersTodayData, userStatsData] = await Promise.all([
          adminService.getDashboardOverviewWithComparison(),
          adminService.getNewUsersToday(),
          adminService.getUserStatsByRole(),
        ]);
        setOverview(overviewData);
        setNewUsersToday(newUsersTodayData);
        setUserStats(userStatsData || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner 
            size="xl" 
            variant="default" 
            text="Đang tải dữ liệu dashboard..." 
          />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border border-white/10">
              <svg className="w-14 h-14 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-rose-400 text-lg font-medium mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Thử lại
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalRevenue = typeof overview?.total_revenue === 'string' 
    ? parseFloat(overview.total_revenue) 
    : overview?.total_revenue || 0;

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Header Section */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[#030712]">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-pink-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-60"></div>
                <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
                <p className="text-slate-400">Tổng quan hệ thống và thống kê chi tiết</p>
              </div>
            </div>
            
            {/* Today's New Users Badge */}
            {newUsersToday && (
              <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <p className="text-sm text-slate-400 mb-1">Người dùng mới hôm nay</p>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{newUsersToday.new_users_today}</span>
                  <div className="flex flex-col">
                    <ChangeIndicator value={newUsersToday.change_from_yesterday} suffix="" />
                    <span className="text-xs text-slate-500">so với hôm qua</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Summary Stats */}
      {overview && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="group relative rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-2 font-medium">Tổng Người Dùng</p>
                  <p className="text-3xl font-bold text-white">{overview.total_users?.toLocaleString()}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <ChangeIndicator value={overview.users_change_percent} />
                    <span className="text-xs text-slate-500">so với tháng trước</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Tours */}
          <div className="group relative rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-2 font-medium">Tổng Tours</p>
                  <p className="text-3xl font-bold text-white">{overview.total_tours?.toLocaleString()}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <ChangeIndicator value={overview.tours_change_percent} />
                    <span className="text-xs text-slate-500">so với tháng trước</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="group relative rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-2 font-medium">Tổng Đặt Chỗ</p>
                  <p className="text-3xl font-bold text-white">{overview.total_bookings?.toLocaleString()}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <ChangeIndicator value={overview.bookings_change_percent} />
                    <span className="text-xs text-slate-500">so với tháng trước</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group relative rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-3xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-2 font-medium">Tổng Doanh Thu</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                    {formatCurrency(totalRevenue, 'VND')}
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <ChangeIndicator value={overview.revenue_change_percent} />
                    <span className="text-xs text-slate-500">so với tháng trước</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Stats Row */}
      {overview && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Suppliers */}
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Nhà Cung Cấp</p>
                <p className="text-2xl font-bold text-white">{overview.total_suppliers?.toLocaleString()}</p>
                {overview.suppliers_change_percent && (
                  <ChangeIndicator value={overview.suppliers_change_percent} />
                )}
              </div>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Active Tours */}
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Tours Đang Hoạt Động</p>
                <p className="text-2xl font-bold text-white">{overview.active_tours?.toLocaleString()}</p>
                <p className="text-xs text-slate-500">/{overview.total_tours} tổng tours</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Bookings */}
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Đặt Chỗ Chờ Xử Lý</p>
                <p className="text-2xl font-bold text-white">{overview.pending_bookings?.toLocaleString()}</p>
                <p className="text-xs text-amber-400">Cần xử lý</p>
              </div>
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Stats by Role */}
      {userStats.length > 0 && (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Phân Bố Người Dùng Theo Vai Trò</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {userStats.filter(stat => stat && stat.role).map((stat, index) => {
              const roleNames: Record<string, string> = {
                'khach_hang': 'Khách hàng',
                'nha_cung_cap': 'Nhà cung cấp',
                'quan_tri': 'Quản trị viên',
              };
              const roleColors: Record<string, { bg: string; border: string; text: string }> = {
                'khach_hang': { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400' },
                'nha_cung_cap': { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
                'quan_tri': { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' },
              };
              const colors = roleColors[stat.role] || { bg: 'bg-slate-500/20', border: 'border-slate-500/30', text: 'text-slate-400' };
              return (
                <div key={`role-${stat.role || index}`} className={`flex items-center space-x-3 p-4 ${colors.bg} rounded-xl border ${colors.border}`}>
                  <div className={`w-4 h-4 ${colors.text.replace('text-', 'bg-')} rounded-full`}></div>
                  <div className="flex-1">
                    <p className={`text-sm ${colors.text}`}>{roleNames[stat.role] || stat.role}</p>
                    <p className="text-xl font-bold text-white">{stat.count?.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts Section - Row 1 */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Suspense fallback={<ChartLoading />}>
          <AdminRevenueChart />
        </Suspense>
        <Suspense fallback={<ChartLoading />}>
          <AdminBookingStatusChart />
        </Suspense>
      </div>

      {/* Charts Section - Row 2 */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Suspense fallback={<ChartLoading />}>
          <AdminTopToursChart />
        </Suspense>
        <Suspense fallback={<ChartLoading />}>
          <AdminUserGrowthChart />
        </Suspense>
      </div>

      {/* Charts Section - Row 3 */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Suspense fallback={<ChartLoading />}>
          <AdminToursCreatedChart />
        </Suspense>
        <Suspense fallback={<ChartLoading />}>
          <AdminTourPriceChart />
        </Suspense>
      </div>

      {/* Recent Bookings & Top Users */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<ChartLoading />}>
            <RecentBookingsTable />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<ChartLoading />}>
            <TopActiveUsersCard />
          </Suspense>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <a href="/admin/suppliers" className="group">
          <div className="relative rounded-2xl overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 border border-cyan-500/30">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-cyan-300 transition-colors">Quản Lý Nhà Cung Cấp</p>
                  <p className="text-sm text-slate-400">Tạo và quản lý suppliers</p>
                </div>
              </div>
            </div>
          </div>
        </a>

        <a href="/admin/users" className="group">
          <div className="relative rounded-2xl overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 border border-emerald-500/30">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-emerald-300 transition-colors">Quản Lý Người Dùng</p>
                  <p className="text-sm text-slate-400">Xem và quản lý users</p>
                </div>
              </div>
            </div>
          </div>
        </a>

        <a href="/admin/tours" className="group">
          <div className="relative rounded-2xl overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 border border-purple-500/30">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">Quản Lý Tours</p>
                  <p className="text-sm text-slate-400">Duyệt và quản lý tours</p>
                </div>
              </div>
            </div>
          </div>
        </a>

        <a href="/admin/analytics" className="group">
          <div className="relative rounded-2xl overflow-hidden transition-all duration-700 hover:-translate-y-2">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 border border-amber-500/30">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">Báo Cáo Chi Tiết</p>
                  <p className="text-sm text-slate-400">Xem analytics đầy đủ</p>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </DashboardLayout>
  );
};
