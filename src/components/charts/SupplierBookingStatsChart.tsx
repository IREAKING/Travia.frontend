import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { supplierService } from '../../services/supplierService';
import type { SupplierBookingStatsByStatusDetailed, SupplierBookingStatsByStatus } from '../../types';
import { LoadingSpinner } from '../common/Loading';

const SupplierBookingStatsChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await supplierService.getBookingStatsByStatus(
        period,
        startDate || undefined,
        endDate || undefined
      );

      // Group data by date and transform for stacked bar chart
      const groupedData: { [key: string]: any } = {};
      
      result.forEach((item: SupplierBookingStatsByStatus | SupplierBookingStatsByStatusDetailed) => {
        // Check if item has ngay_trong_thang (SupplierBookingStatsByStatusDetailed)
        const dateKey = 'ngay_trong_thang' in item ? item.ngay_trong_thang : '';
        if (!dateKey) return;
        
        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            date: dateKey,
            label: formatDateLabel(dateKey, period),
            cho_duyet: 0,
            da_xac_nhan: 0,
            da_thanh_toan: 0,
            hoan_thanh: 0,
            da_huy: 0,
            tong_so: 0,
          };
        }
        
        // Extract status from object structure
        let status = 'khac';
        if (item.trang_thai) {
          if (typeof item.trang_thai === 'string') {
            status = item.trang_thai;
          } else if ('valid' in item.trang_thai && item.trang_thai.valid && 'trang_thai_dat_cho' in item.trang_thai) {
            status = item.trang_thai.trang_thai_dat_cho;
          }
        }
        
        const soDatCho = 'so_dat_cho' in item ? item.so_dat_cho : ('booking_count' in item ? item.booking_count : 0);
        if (status in groupedData[dateKey]) {
          groupedData[dateKey][status] = soDatCho;
        }
        groupedData[dateKey].tong_so += soDatCho;
      });

      const chartData = Object.values(groupedData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setData(chartData);
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, startDate, endDate]);

  const formatDateLabel = (dateStr: string, periodType: string): string => {
    try {
      const date = new Date(dateStr);
      if (periodType === 'day') {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      } else if (periodType === 'week') {
        return `Tuần ${date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}`;
      } else {
        return date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
      }
    } catch {
      return dateStr;
    }
  };

  const statusColors: { [key: string]: string } = {
    cho_duyet: '#F59E0B',
    da_xac_nhan: '#3B82F6',
    da_thanh_toan: '#10B981',
    hoan_thanh: '#6366F1',
    da_huy: '#EF4444',
  };

  const statusLabels: { [key: string]: string } = {
    cho_duyet: 'Chờ duyệt',
    da_xac_nhan: 'Đã xác nhận',
    da_thanh_toan: 'Đã thanh toán',
    hoan_thanh: 'Hoàn thành',
    da_huy: 'Đã hủy',
  };

  const statusKeys = ['cho_duyet', 'da_xac_nhan', 'da_thanh_toan', 'hoan_thanh', 'da_huy'];

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2">Thống Kê Đặt Chỗ Theo Trạng Thái</h3>
        <p className="text-sm text-purple-300/80">Phân bổ đặt chỗ theo trạng thái qua thời gian</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Khoảng thời gian</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as 'day' | 'week' | 'month')}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="day">Theo ngày</option>
            <option value="week">Theo tuần</option>
            <option value="month">Theo tháng</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Từ ngày</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Đến ngày</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
              setPeriod('day');
            }}
            className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-xs sm:text-sm transition-all duration-200"
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
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="label" 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                  color: '#F3F4F6'
                }}
                labelStyle={{ color: '#F3F4F6' }}
                formatter={(value: any, name: string) => {
                  const label = statusLabels[name] || name;
                  return [value, label];
                }}
              />
              <Legend 
                formatter={(value) => statusLabels[value] || value}
                wrapperStyle={{ paddingTop: '20px' }}
              />
              {statusKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={statusColors[key]}
                  name={key}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          
          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-4">
            {statusKeys.map((key) => {
              const total = data.reduce((sum, item) => sum + (item[key] || 0), 0);
              return (
                <div key={key} className="text-center">
                  <div 
                    className="w-3 h-3 rounded-full mx-auto mb-2" 
                    style={{ backgroundColor: statusColors[key] }}
                  ></div>
                  <p className="text-xs text-gray-400 mb-1">{statusLabels[key]}</p>
                  <p className="text-lg font-semibold text-white">{total}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export { SupplierBookingStatsChart };
export default SupplierBookingStatsChart;

