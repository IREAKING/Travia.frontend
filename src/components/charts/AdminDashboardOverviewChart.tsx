import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminDashboardOverviewByMonthAndYear } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../common/Loading';

export const AdminDashboardOverviewChart = () => {
  const [overviewByMonth, setOverviewByMonth] = useState<AdminDashboardOverviewByMonthAndYear | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  // Always use month/year mode

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardOverviewByMonthAndYear(month, year);
        setOverviewByMonth(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard overview:', err);
        setError('Không thể tải dữ liệu tổng quan');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month, year]);

  if (loading) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Đang tải dữ liệu..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/30">
              <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-rose-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const displayData = overviewByMonth;

  return (
    <div className="group relative rounded-2xl overflow-hidden transition-all duration-300">
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
        {/* Header - Compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
              <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Tổng Quan Dashboard</h3>
              <p className="text-xs text-slate-400">Thống kê tổng hợp hệ thống</p>
            </div>
          </div>
        </div>

        {/* Filters - Compact */}
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Năm</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              min="2020"
              max={new Date().getFullYear() + 1}
              className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">Tháng</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m} className="bg-slate-800">Tháng {m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Display - Compact Grid */}
        {displayData && overviewByMonth && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Tổng Đặt Chỗ */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 rounded-xl p-3 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs text-cyan-300 font-medium">Tổng Đặt Chỗ</p>
              </div>
              <p className="text-xl font-bold text-white">{overviewByMonth.tong_dat_cho.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">Hủy: {overviewByMonth.so_don_da_huy.toLocaleString()}</p>
            </div>

            {/* Doanh Thu */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-3 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-green-300 font-medium">Doanh Thu</p>
              </div>
              <p className="text-lg font-bold text-white">
                {formatCurrency(typeof overviewByMonth.doanh_thu === 'string' ? parseFloat(overviewByMonth.doanh_thu) : overviewByMonth.doanh_thu, 'VND')}
              </p>
            </div>

            {/* Tổng Lượng Khách */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 rounded-xl p-3 border border-yellow-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-xs text-yellow-300 font-medium">Tổng Khách</p>
              </div>
              <p className="text-xl font-bold text-white">{overviewByMonth.tong_luong_khach.toLocaleString()}</p>
            </div>

            {/* Chuyến Khởi Hành */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 rounded-xl p-3 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-indigo-300 font-medium">Khởi Hành</p>
              </div>
              <p className="text-xl font-bold text-white">{overviewByMonth.so_chuyen_khoi_hanh.toLocaleString()}</p>
            </div>

            {/* Đánh Giá Mới */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-3 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <p className="text-xs text-purple-300 font-medium">Đánh Giá</p>
              </div>
              <p className="text-xl font-bold text-white">{overviewByMonth.so_danh_gia_moi.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs font-bold text-yellow-400">{overviewByMonth.diem_trung_binh.toFixed(1)}</span>
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

