import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { adminService } from '../../services/adminService';
import type { AdminChartCategoryDistribution } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../common/Loading';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../common/ExportDropdown';

const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

export const AdminCategoryDistributionChart = () => {
  const [data, setData] = useState<AdminChartCategoryDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await adminService.getChartCategoryDistribution(year, month);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch category distribution data:', err);
        setError('Không thể tải dữ liệu phân bố danh mục');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month]);

  const formattedData = data.map(item => ({
    ...item,
    name: item.ten_danh_muc || 'Không xác định',
    value: typeof item.tong_doanh_thu === 'string' ? parseFloat(item.tong_doanh_thu) : item.tong_doanh_thu || 0,
    so_luong: item.so_luong_dat || 0,
  }));

  const totalRevenue = formattedData.reduce((sum, item) => sum + item.value, 0);
  const canExport = formattedData.length > 0;

  const handleExportCsv = () => {
    if (!canExport) return;
    const rows = formattedData.map((item) => ({
      danh_muc: item.name,
      doanh_thu: item.value,
      so_don: item.so_luong,
    }));
    exportToCsv(`admin-co-cau-doanh-thu-${year}-${month}.csv`, rows);
  };
  const handleExportXlsx = () => {
    if (!canExport) return;
    const rows = formattedData.map((item) => ({
      danh_muc: item.name,
      doanh_thu: item.value,
      so_don: item.so_luong,
    }));
    exportToXlsx(`admin-co-cau-doanh-thu-${year}-${month}.xlsx`, rows);
  };

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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Cơ Cấu Doanh Thu Theo Danh Mục</h3>
              <p className="text-sm text-slate-400">Phân bố doanh thu theo từng danh mục tour</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {formatCurrency(totalRevenue, 'VND')}
            </p>
            <p className="text-xs text-slate-500">Tổng doanh thu</p>
            <ExportDropdown
              onExportCsv={handleExportCsv}
              onExportXlsx={handleExportXlsx}
              disabled={!canExport}
              label="Xuất file"
            />
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
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tháng</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            >
              <option value="0" className="bg-slate-800">Tất cả</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m} className="bg-slate-800">Tháng {m}</option>
              ))}
            </select>
          </div>
        </div>

        {formattedData.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={formattedData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => {
                      const { name, percent } = props;
                      return `${name}: ${((percent || 0) * 100).toFixed(0)}%`;
                    }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {formattedData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                    }}
                    formatter={(value: number, _name: string, props: any) => {
                      const percentage = totalRevenue > 0 ? ((value / totalRevenue) * 100).toFixed(1) : '0';
                      return [
                        `${formatCurrency(value, 'VND')} (${percentage}%)`,
                        props.payload.name
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white mb-4">Chi tiết theo danh mục</h4>
              {formattedData.map((item, index) => {
                const percentage = totalRevenue > 0 ? ((item.value / totalRevenue) * 100).toFixed(1) : '0';
                return (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="text-sm font-medium text-white">{item.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{percentage}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">{item.so_luong.toLocaleString()} đơn</span>
                      <span className="text-purple-300 font-semibold">
                        {formatCurrency(item.value, 'VND')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="h-[350px] flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-400">Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </div>
    </div>
  );
};

