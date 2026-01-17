import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { supplierService } from '../../services/supplierService';
import type { SupplierRevenueChart } from '../../types';
import { LoadingSpinner } from '../common/Loading';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../common/ExportDropdown';

const RevenueChart = () => {
  const [data, setData] = useState<SupplierRevenueChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await supplierService.getRevenueChart(
        period,
        startDate || undefined,
        endDate || undefined
      );
        // Transform data for chart
        const chartData = result.map((item: any) => {
          // Handle period/date - could be string or timestamp from PostgreSQL
          const periodValue = item.period || item.date;
          let dateLabel = 'N/A';
          try {
            if (typeof periodValue === 'string') {
              const date = new Date(periodValue);
              if (!isNaN(date.getTime())) {
                if (period === 'day') {
                  dateLabel = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                } else if (period === 'week') {
                  dateLabel = `Tuần ${date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}`;
                } else {
                  dateLabel = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
                }
              } else {
                dateLabel = periodValue;
              }
            } else if (periodValue) {
              dateLabel = String(periodValue);
            }
          } catch (e) {
            dateLabel = String(periodValue || 'N/A');
          }
          
          return {
            date: periodValue,
            label: dateLabel,
            revenue: typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue,
            booking_count: item.booking_count,
            customer_count: item.customer_count || 0,
          };
        });
        setData(chartData as SupplierRevenueChart[]);
      } catch (error) {
        console.error('Error fetching revenue chart data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchData();
  }, [period, startDate, endDate]);

  const canExport = data.length > 0;
  const handleExportCsv = () => {
    if (!canExport) return;
    const rows = data.map((item) => ({
      thoi_gian: item.label || item.date || '',
      doanh_thu: item.revenue || 0,
      so_dat_cho: item.booking_count || 0,
      so_khach: item.customer_count || 0,
    }));
    exportToCsv(`supplier-doanh-thu-${period}.csv`, rows);
  };
  const handleExportXlsx = () => {
    if (!canExport) return;
    const rows = data.map((item) => ({
      thoi_gian: item.label || item.date || '',
      doanh_thu: item.revenue || 0,
      so_dat_cho: item.booking_count || 0,
      so_khach: item.customer_count || 0,
    }));
    exportToXlsx(`supplier-doanh-thu-${period}.xlsx`, rows);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Doanh Thu Theo Thời Gian</h3>
          <p className="text-sm text-indigo-300/80">Tổng doanh thu và số lượng đặt chỗ</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
            <span className="text-sm text-indigo-300">Doanh thu</span>
          </div>
          <ExportDropdown
            onExportCsv={handleExportCsv}
            onExportXlsx={handleExportXlsx}
            disabled={!canExport}
            label="Xuất file"
          />
        </div>
      </div>

      {/* Filter Form */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Khoảng thời gian
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
            className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-white text-sm"
          >
            <option value="day" className="bg-slate-900">Theo ngày</option>
            <option value="week" className="bg-slate-900">Theo tuần</option>
            <option value="month" className="bg-slate-900">Theo tháng</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Từ ngày
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">
            Đến ngày
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-white text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setPeriod('month');
            }}
            className="w-full px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs sm:text-sm transition-all duration-200"
          >
            Đặt lại
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-[400px]">
          <LoadingSpinner />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[400px] text-gray-400">
          <p>Chưa có dữ liệu</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="label" 
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'revenue' ? `${(value as number).toLocaleString()} VND` : value,
              name === 'revenue' ? 'Doanh thu' : 'Đặt chỗ'
            ]}
            labelFormatter={(label) => {
              if (period === 'day') return `Ngày ${label}`;
              if (period === 'week') return label;
              return `Tháng ${label}`;
            }}
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              color: '#F3F4F6'
            }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#6366F1"
            fill="url(#colorRevenue)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export { RevenueChart };
export default RevenueChart;
