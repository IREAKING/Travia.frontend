import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { adminService } from '../../services/adminService';
import type { AdminChartBookingStatusStats } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../common/Loading';

const STATUS_COLORS: { [key: string]: string } = {
  'cho_xac_nhan': '#f59e0b',
  'da_xac_nhan': '#3b82f6',
  'da_thanh_toan': '#10b981',
  'hoan_thanh': '#06b6d4',
  'da_huy': '#ef4444',
  'dang_cho': '#8b5cf6',
};

const STATUS_LABELS: { [key: string]: string } = {
  'cho_xac_nhan': 'Chờ xác nhận',
  'da_xac_nhan': 'Đã xác nhận',
  'da_thanh_toan': 'Đã thanh toán',
  'hoan_thanh': 'Hoàn thành',
  'da_huy': 'Đã hủy',
  'dang_cho': 'Đang chờ',
};

export const AdminBookingStatusStatsChart = () => {
  const [data, setData] = useState<AdminChartBookingStatusStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await adminService.getChartBookingStatusStats(year, month);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch booking status stats data:', err);
        setError('Không thể tải dữ liệu trạng thái đặt chỗ');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month]);

  const formattedData = data.map(item => ({
    ...item,
    name: STATUS_LABELS[item.trang_thai] || item.trang_thai,
    so_luong: item.so_luong || 0,
    gia_tri: typeof item.gia_tri_uoc_tinh === 'string' ? parseFloat(item.gia_tri_uoc_tinh) : item.gia_tri_uoc_tinh || 0,
    color: STATUS_COLORS[item.trang_thai] || '#64748b',
  }));

  const totalBookings = formattedData.reduce((sum, item) => sum + item.so_luong, 0);

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

  return (
    <div className="group relative rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-700"></div>
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Trạng Thái Đặt Chỗ</h3>
              <p className="text-sm text-slate-400">Phân bố theo trạng thái</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              {totalBookings.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Tổng đặt chỗ</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Năm</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              min="2020"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tháng</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              <option value="0" className="bg-slate-800">Tất cả</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m} className="bg-slate-800">Tháng {m}</option>
              ))}
            </select>
          </div>
        </div>

        {formattedData.length > 0 ? (
          <>
            <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'so_luong') {
                        return [value.toLocaleString(), 'Số lượng'];
                      }
                      if (name === 'gia_tri') {
                        return [formatCurrency(value, 'VND'), 'Giá trị'];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      const labels: { [key: string]: string } = {
                        'so_luong': 'Số lượng',
                        'gia_tri': 'Giá trị ước tính'
                      };
                      return labels[value] || value;
                    }}
                  />
                  <Bar dataKey="so_luong" name="so_luong" stackId="a" radius={[0, 0, 0, 0]}>
                    {formattedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="gia_tri" name="gia_tri" stackId="b" radius={[8, 8, 0, 0]}>
                    {formattedData.map((entry, index) => (
                      <Cell key={`cell-value-${index}`} fill={entry.color} opacity={0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {formattedData.map((item, index) => {
                const percentage = totalBookings > 0 ? ((item.so_luong / totalBookings) * 100).toFixed(1) : '0';
                return (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <p className="text-xs font-medium text-white truncate">{item.name}</p>
                    </div>
                    <p className="text-xl font-bold text-white mb-1">{item.so_luong.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{percentage}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(item.gia_tri, 'VND')}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-[350px] flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-400">Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </div>
    </div>
  );
};

