import { useState, Suspense, lazy } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { ChartLoading } from '../../components/common/Loading';

// Lazy load admin chart components
const AdminRevenueChart = lazy(() => import('../../components/charts/AdminRevenueChart').then(module => ({ default: module.AdminRevenueChart })));
const AdminBookingStatusChart = lazy(() => import('../../components/charts/AdminBookingStatusChart').then(module => ({ default: module.AdminBookingStatusChart })));
const AdminTopToursChart = lazy(() => import('../../components/charts/AdminTopToursChart').then(module => ({ default: module.AdminTopToursChart })));
const AdminUserGrowthChart = lazy(() => import('../../components/charts/AdminUserGrowthChart').then(module => ({ default: module.AdminUserGrowthChart })));
const AdminTourPriceChart = lazy(() => import('../../components/charts/AdminTourPriceChart').then(module => ({ default: module.AdminTourPriceChart })));
const AdminToursCreatedChart = lazy(() => import('../../components/charts/AdminToursCreatedChart').then(module => ({ default: module.AdminToursCreatedChart })));

type TabType = 'overview' | 'revenue' | 'users' | 'tours' | 'bookings';

export const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'overview', 
      label: 'Tổng Quan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      id: 'revenue', 
      label: 'Doanh Thu',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    { 
      id: 'users', 
      label: 'Người Dùng',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    { 
      id: 'tours', 
      label: 'Tours',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'bookings', 
      label: 'Đặt Chỗ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Suspense fallback={<ChartLoading />}>
                <AdminRevenueChart />
              </Suspense>
              <Suspense fallback={<ChartLoading />}>
                <AdminBookingStatusChart />
              </Suspense>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <Suspense fallback={<ChartLoading />}>
                <AdminUserGrowthChart />
              </Suspense>
              <Suspense fallback={<ChartLoading />}>
                <AdminTopToursChart />
              </Suspense>
            </div>
          </div>
        );
      case 'revenue':
        return (
          <div className="space-y-8">
            <Suspense fallback={<ChartLoading />}>
              <AdminRevenueChart />
            </Suspense>
          </div>
        );
      case 'users':
        return (
          <div className="space-y-8">
            <Suspense fallback={<ChartLoading />}>
              <AdminUserGrowthChart />
            </Suspense>
          </div>
        );
      case 'tours':
        return (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Suspense fallback={<ChartLoading />}>
                <AdminTopToursChart />
              </Suspense>
              <Suspense fallback={<ChartLoading />}>
                <AdminTourPriceChart />
              </Suspense>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <Suspense fallback={<ChartLoading />}>
                <AdminToursCreatedChart />
              </Suspense>
            </div>
          </div>
        );
      case 'bookings':
        return (
          <div className="space-y-8">
            <Suspense fallback={<ChartLoading />}>
              <AdminBookingStatusChart />
            </Suspense>
          </div>
        );
      default:
        return null;
    }
  };

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
              <h1 className="text-3xl font-bold text-white mb-1">Phân Tích & Báo Cáo</h1>
              <p className="text-slate-400">Xem báo cáo chi tiết về hoạt động của hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-2 mb-8 border border-white/10">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </DashboardLayout>
  );
};
