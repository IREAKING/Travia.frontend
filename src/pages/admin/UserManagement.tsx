import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminCustomerGrowthChart } from '../../components/charts/AdminCustomerGrowthChart';
import { AdminTopActiveUsersChart } from '../../components/charts/AdminTopActiveUsersChart';

export const UserManagementPage = () => {

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
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-60"></div>
              <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Quản Lý Người Dùng</h1>
              <p className="text-slate-400">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <AdminCustomerGrowthChart />
        <AdminTopActiveUsersChart />
      </div>
    </DashboardLayout>
  );
};
