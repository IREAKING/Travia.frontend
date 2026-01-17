import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { adminService } from '../../services/adminService';
import type { TopBookedTour } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../common/Loading';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../common/ExportDropdown';

const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'];

export const AdminTopBookedToursChart = () => {
  const [data, setData] = useState<TopBookedTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'chart' | 'cards'>('cards');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await adminService.getTopBookedTours(limit);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top booked tours data:', err);
        setError('Không thể tải dữ liệu top tours');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [limit]);

  const formattedData = data.map((item, index) => ({
    ...item,
    name: item.tieu_de?.substring(0, 30) + (item.tieu_de && item.tieu_de.length > 30 ? '...' : '') || 'Không có tiêu đề',
    so_booking: item.so_booking || 0,
    tong_doanh_thu: typeof item.tong_doanh_thu === 'string' ? parseFloat(item.tong_doanh_thu) : item.tong_doanh_thu || 0,
    color: COLORS[index % COLORS.length],
  }));

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

  const canExport = formattedData.length > 0;
  const handleExportCsv = () => {
    if (!canExport) return;
    const rows = formattedData.map((item) => ({
      tour: item.tieu_de || 'Không có tiêu đề',
      so_booking: item.so_booking || 0,
      tong_doanh_thu: item.tong_doanh_thu || 0,
    }));
    exportToCsv(`admin-top-tour-dat-cho-${limit}.csv`, rows);
  };
  const handleExportXlsx = () => {
    if (!canExport) return;
    const rows = formattedData.map((item) => ({
      tour: item.tieu_de || 'Không có tiêu đề',
      so_booking: item.so_booking || 0,
      tong_doanh_thu: item.tong_doanh_thu || 0,
    }));
    exportToXlsx(`admin-top-tour-dat-cho-${limit}.xlsx`, rows);
  };

  return (
    <div className="group relative rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-700"></div>
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Top Tours Được Đặt Nhiều Nhất</h3>
              <p className="text-sm text-slate-400">Danh sách tour phổ biến nhất</p>
            </div>
          </div>
          <ExportDropdown
            onExportCsv={handleExportCsv}
            onExportXlsx={handleExportXlsx}
            disabled={!canExport}
            label="Xuất file"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Số lượng</label>
            <select
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="5" className="bg-slate-800">Top 5</option>
              <option value="10" className="bg-slate-800">Top 10</option>
              <option value="15" className="bg-slate-800">Top 15</option>
              <option value="20" className="bg-slate-800">Top 20</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Chế độ xem</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'chart' | 'cards')}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="cards" className="bg-slate-800">Thẻ</option>
              <option value="chart" className="bg-slate-800">Biểu đồ</option>
            </select>
          </div>
        </div>

        {formattedData.length > 0 ? (
          viewMode === 'chart' ? (
            <div style={{ width: '100%', height: '400px', minHeight: '400px' }}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'so_booking') {
                        return [value.toLocaleString(), 'Số booking'];
                      }
                      if (name === 'tong_doanh_thu') {
                        return [formatCurrency(value, 'VND'), 'Tổng doanh thu'];
                      }
                      return [value, name];
                    }}
                  />
                  <Bar dataKey="so_booking" name="so_booking" radius={[8, 8, 0, 0]}>
                    {formattedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {formattedData.map((tour, index) => (
                <div
                  key={tour.id}
                  className="bg-gradient-to-br from-white/5 to-white/0 rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group"
                >
                  {/* Ranking Badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-500 to-amber-500 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                      index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                      'bg-white/10 text-white'
                    }`}>
                      #{index + 1}
                    </div>
                    {tour.diem_trung_binh > 0 && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-yellow-400 font-semibold">{tour.diem_trung_binh.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Tour Image */}
                  {tour.anh_chinh && (
                    <div className="relative w-full h-32 mb-3 rounded-xl overflow-hidden bg-white/5">
                      <img
                        src={tour.anh_chinh}
                        alt={tour.tieu_de}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                  )}

                  {/* Tour Title */}
                  <h4 className="text-sm font-semibold text-white mb-2 line-clamp-2 min-h-[2.5rem]">
                    {tour.tieu_de}
                  </h4>

                  {/* Category & Supplier */}
                  <div className="flex items-center gap-2 mb-3 text-xs">
                    {tour.ten_danh_muc && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30">
                        {tour.ten_danh_muc}
                      </span>
                    )}
                    {tour.ten_nha_cung_cap && (
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30 truncate">
                        {tour.ten_nha_cung_cap}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="space-y-2 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Số booking</span>
                      <span className="text-white font-semibold">{tour.so_booking.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Doanh thu</span>
                      <span className="text-amber-400 font-semibold">
                        {formatCurrency(tour.tong_doanh_thu, 'VND')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Giá người lớn</span>
                      <span className="text-green-400 font-semibold">
                        {formatCurrency(typeof tour.gia_nguoi_lon === 'string' ? parseFloat(tour.gia_nguoi_lon) : tour.gia_nguoi_lon || 0, 'VND')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="h-[400px] flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-400">Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </div>
    </div>
  );
};

