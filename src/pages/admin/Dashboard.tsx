import { Suspense, lazy } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { ChartLoading } from '../../components/common/Loading';

// Lazy load admin chart components
const AdminDashboardOverviewChart = lazy(() => import('../../components/charts/AdminDashboardOverviewChart').then(module => ({ default: module.AdminDashboardOverviewChart })));
const AdminRevenueChart = lazy(() => import('../../components/charts/AdminRevenueChart').then(module => ({ default: module.AdminRevenueChart })));
const AdminRevenueTrendChart = lazy(() => import('../../components/charts/AdminRevenueTrendChart').then(module => ({ default: module.AdminRevenueTrendChart })));
const AdminCategoryDistributionChart = lazy(() => import('../../components/charts/AdminCategoryDistributionChart').then(module => ({ default: module.AdminCategoryDistributionChart })));
const AdminTopSuppliersChart = lazy(() => import('../../components/charts/AdminTopSuppliersChart').then(module => ({ default: module.AdminTopSuppliersChart })));
const AdminBookingStatusStatsChart = lazy(() => import('../../components/charts/AdminBookingStatusStatsChart').then(module => ({ default: module.AdminBookingStatusStatsChart })));
const AdminTopBookedToursChart = lazy(() => import('../../components/charts/AdminTopBookedToursChart').then(module => ({ default: module.AdminTopBookedToursChart })));

export const AdminDashboard = () => {

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
            
          </div>
        </div>
      </div>


      {/* Dashboard Overview */}
      <div className="mb-8">
        <Suspense fallback={<ChartLoading />}>
          <AdminDashboardOverviewChart />
        </Suspense>
      </div>

      {/* New Charts Section - Row 1 */}
      <div className="mb-8">
        <Suspense fallback={<ChartLoading />}>
          <AdminRevenueTrendChart />
        </Suspense>
      </div>

      {/* New Charts Section - Row 2 */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Suspense fallback={<ChartLoading />}>
          <AdminCategoryDistributionChart />
        </Suspense>
        <Suspense fallback={<ChartLoading />}>
          <AdminTopSuppliersChart />
        </Suspense>
      </div>

      {/* New Charts Section - Row 3 */}
      <div className="mb-8">
        <Suspense fallback={<ChartLoading />}>
          <AdminBookingStatusStatsChart />
        </Suspense>
      </div>

      {/* Charts Section - Row 4 */}
      <div className="mb-8">
        <Suspense fallback={<ChartLoading />}>
          <AdminRevenueChart />
        </Suspense>
      </div>

      {/* Charts Section - Row 5 */}
      <div className="mb-8">
          <Suspense fallback={<ChartLoading />}>
          <AdminTopBookedToursChart />
          </Suspense>
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
                  <p className="font-semibold text-white group-hover:text-amber-300 transition-colors">Báo cáo chi tiết</p>
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
