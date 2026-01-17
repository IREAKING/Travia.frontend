import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { adminService } from '../../services/adminService';
import type { AdminChartTopSuppliers } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../common/Loading';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../common/ExportDropdown';

const COLORS = ['#06b6d4', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

export const AdminTopSuppliersChart = () => {
  const [data, setData] = useState<AdminChartTopSuppliers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await adminService.getChartTopSuppliers(year, month);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top suppliers data:', err);
        setError('Không thể tải dữ liệu top nhà cung cấp');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month]);

  const formattedData = data.map(item => ({
    ...item,
    name: item.ten_nha_cung_cap || 'Không xác định',
    doanh_thu: typeof item.doanh_thu_dat_duoc === 'string' ? parseFloat(item.doanh_thu_dat_duoc) : item.doanh_thu_dat_duoc || 0,
    so_don: item.so_don_hang || 0,
  }));

  const totalRevenue = formattedData.reduce((sum, item) => sum + item.doanh_thu, 0);
  const canExport = formattedData.length > 0;

  const handleExportCsv = () => {
    if (!canExport) return;
    const rows = formattedData.map((item) => ({
      nha_cung_cap: item.name,
      doanh_thu: item.doanh_thu,
      so_don: item.so_don,
    }));
    exportToCsv(`admin-top-nha-cung-cap-${year}-${month}.csv`, rows);
  };
  const handleExportXlsx = () => {
    if (!canExport) return;
    const rows = formattedData.map((item) => ({
      nha_cung_cap: item.name,
      doanh_thu: item.doanh_thu,
      so_don: item.so_don,
    }));
    exportToXlsx(`admin-top-nha-cung-cap-${year}-${month}.xlsx`, rows);
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
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Top 5 Nhà Cung Cấp Xuất Sắc</h3>
              <p className="text-sm text-slate-400">Theo doanh thu đạt được</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
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
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tháng</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              <option value="0" className="bg-slate-800">Tất cả</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m} className="bg-slate-800">Tháng {m}</option>
              ))}
            </select>
          </div>
        </div>

        {formattedData.length > 0 ? (
          <div style={{ width: '100%', height: '350px', minHeight: '350px' }}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={formattedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={true} vertical={false} />
                <XAxis 
                  type="number"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  tickFormatter={(value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toString();
                  }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  width={150}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'doanh_thu') {
                      return [formatCurrency(value, 'VND'), 'Doanh thu'];
                    }
                    if (name === 'so_don') {
                      return [value.toLocaleString(), 'Số đơn'];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="doanh_thu" radius={[0, 8, 8, 0]}>
                  {formattedData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[350px] flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-400">Không có dữ liệu để hiển thị</p>
          </div>
        )}

        {/* Summary Table */}
        {formattedData.length > 0 && (
          <div className="mt-6 space-y-2">
            {formattedData.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 flex items-center justify-center border border-green-500/30">
                    <span className="text-xs font-bold text-green-300">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.so_don.toLocaleString()} đơn hàng</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-300">
                    {formatCurrency(item.doanh_thu, 'VND')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

