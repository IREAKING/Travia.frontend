import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { supplierService } from '../../services/supplierService';
// import type { SupplierTopTour } from '../../types';
import { LoadingSpinner } from '../common/Loading';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../common/ExportDropdown';

const TourPerformanceChart = () => {
  const [data, setData] = useState<{ name: string; bookings: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'revenue' | 'bookings' | 'rating'>('revenue');
  const [limit, setLimit] = useState(5);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await supplierService.getTopTours(
        sortBy,
        limit,
        startDate || undefined,
        endDate || undefined
      );
      
      // Transform data for chart
      const chartData = result.map((tour) => ({
        name: tour.tieu_de.length > 20 ? tour.tieu_de.substring(0, 20) + '...' : tour.tieu_de,
        bookings: tour.total_bookings,
        revenue: typeof tour.total_revenue === 'string' ? parseFloat(tour.total_revenue) : tour.total_revenue,
      }));
      setData(chartData);
    } catch (error) {
      console.error('Error fetching tour performance data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sortBy, limit, startDate, endDate]);
  const canExport = data.length > 0;
  const handleExportCsv = () => {
    if (!canExport) return;
    const rows = data.map((item) => ({
      tour: item.name,
      so_dat_cho: item.bookings,
      doanh_thu: item.revenue,
    }));
    exportToCsv(`supplier-hieu-suat-tour-${sortBy}.csv`, rows);
  };
  const handleExportXlsx = () => {
    if (!canExport) return;
    const rows = data.map((item) => ({
      tour: item.name,
      so_dat_cho: item.bookings,
      doanh_thu: item.revenue,
    }));
    exportToXlsx(`supplier-hieu-suat-tour-${sortBy}.xlsx`, rows);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Hiệu Suất Tour</h3>
          <p className="text-sm text-pink-300/80">Top tours có hiệu suất tốt nhất</p>
        </div>
        <ExportDropdown
          onExportCsv={handleExportCsv}
          onExportXlsx={handleExportXlsx}
          disabled={!canExport}
          label="Xuất file"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sắp xếp theo</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'revenue' | 'bookings' | 'rating')}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          >
            <option value="revenue">Doanh thu</option>
            <option value="bookings">Số đặt chỗ</option>
            <option value="rating">Đánh giá</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Số lượng</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          >
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="20">Top 20</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setSortBy('revenue');
              setLimit(5);
            }}
            className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs sm:text-sm transition-all duration-200"
          >
            Đặt lại
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <LoadingSpinner />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          <p>Chưa có dữ liệu</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={data}
          layout="horizontal"
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            type="number"
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
          />
          <YAxis 
            type="category"
            dataKey="name"
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
            width={100}
          />
          <Tooltip 
            formatter={(value, name) => [
              name === 'revenue' ? `${(value as number).toLocaleString()} VND` : value,
              name === 'revenue' ? 'Doanh thu' : 'Đặt chỗ'
            ]}
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
              color: '#F3F4F6'
            }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Bar 
            dataKey="revenue" 
            fill="#EC4899" 
            radius={[0, 4, 4, 0]}
            name="Doanh thu"
          />
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export { TourPerformanceChart };
export default TourPerformanceChart;
