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

const RevenueChart = () => {
  const [data, setData] = useState<SupplierRevenueChart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await supplierService.getRevenueChart('month');
        // Transform data for chart
        const chartData = result.map((item) => {
          // Handle date - could be string or interval from PostgreSQL
          let monthLabel = 'N/A';
          try {
            if (typeof item.date === 'string') {
              const date = new Date(item.date);
              if (!isNaN(date.getTime())) {
                monthLabel = date.toLocaleDateString('vi-VN', { month: 'short' });
              } else {
                // Try to extract from interval format if needed
                monthLabel = item.date;
              }
            } else {
              monthLabel = String(item.date);
            }
          } catch (e) {
            monthLabel = String(item.date);
          }
          
          return {
            date: item.date,
            month: monthLabel,
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

    fetchData();
  }, []);
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Doanh Thu Theo Tháng</h3>
          <p className="text-sm text-indigo-300/80">Tổng doanh thu và số lượng đặt chỗ</p>
        </div>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
          <span className="text-sm text-indigo-300">Doanh thu</span>
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
          <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="month" 
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
            labelFormatter={(label) => `Tháng ${label}`}
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
