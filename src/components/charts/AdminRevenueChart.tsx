import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services/adminService';
import type { RevenueByDay, AdminSupplierOption } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../common/ExportDropdown';

export const AdminRevenueChart = () => {
  const [data, setData] = useState<RevenueByDay[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<AdminSupplierOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [supplierId, setSupplierId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchSupplierOptions = async () => {
      try {
        const options = await adminService.getSupplierOptions();
        setSupplierOptions(options);
      } catch (err) {
        console.error('Failed to fetch supplier options:', err);
      }
    };
    fetchSupplierOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await adminService.getRevenueByDay(year, month, supplierId);
        setData(response || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch revenue data:', err);
        setError('Không thể tải dữ liệu doanh thu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year, month, supplierId]);

  const formattedData = data.map(item => {
    const dateStr = item.date || item.ngay;
    const revenueValue = item.revenue || item.doanh_thu || 0;
    const revenueNum = typeof revenueValue === 'string' ? parseFloat(revenueValue) : revenueValue;
    
    return {
    ...item,
      name: dateStr ? new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : '',
      revenue: isNaN(revenueNum) ? 0 : revenueNum
    };
  });

  const totalRevenue = formattedData.reduce((sum, item) => sum + (item.revenue || 0), 0);
  const canExport = formattedData.length > 0;

  const handleExportCsv = () => {
    if (!canExport) return;
    const rows = formattedData.map((item) => ({
      ngay: item.date || item.ngay || '',
      doanh_thu: item.revenue || 0,
    }));
    exportToCsv(`admin-doanh-thu-${year}-${month}.csv`, rows);
  };
  const handleExportXlsx = () => {
    if (!canExport) return;
    const rows = formattedData.map((item) => ({
      ngay: item.date || item.ngay || '',
      doanh_thu: item.revenue || 0,
    }));
    exportToXlsx(`admin-doanh-thu-${year}-${month}.xlsx`, rows);
  };

  if (loading) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-80 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-3"></div>
            <span className="text-slate-400 text-sm">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-80 flex items-center justify-center">
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
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Doanh Thu Theo Ngày</h3>
              <p className="text-sm text-slate-400">Theo dõi doanh thu hàng ngày</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
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
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Năm</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
              min="2020"
              max={new Date().getFullYear() + 1}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Tháng</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="0">Tất cả</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                <option key={m} value={m} className="bg-slate-800">Tháng {m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nhà cung cấp</label>
            <select
              value={supplierId || ''}
              onChange={(e) => setSupplierId(e.target.value || undefined)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="" className="bg-slate-800">Tất cả</option>
              {supplierOptions.map(supplier => (
                <option key={supplier.id} value={supplier.id} className="bg-slate-800">{supplier.ten}</option>
              ))}
            </select>
          </div>
        </div>
        
        {formattedData.length > 0 ? (
          <div style={{ width: '100%', height: '256px', minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="50%" stopColor="#a855f7" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="revenueStroke" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4"/>
                  <stop offset="50%" stopColor="#a855f7"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                formatter={(value: number) => [formatCurrency(value, 'VND'), 'Doanh thu']}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="url(#revenueStroke)" 
                strokeWidth={3}
                fill="url(#revenueGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        ) : (
          <div className="h-64 min-h-[256px] w-full flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
            <p className="text-gray-400">Không có dữ liệu để hiển thị</p>
          </div>
        )}
      </div>
    </div>
  );
};
