import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useEffect, useState } from 'react';
import { supplierService } from '../../services/supplierService';
// import type { SupplierRevenueChart } from '../../types';
import { LoadingSpinner } from '../common/Loading';

const RevenueTrendChart = () => {
  const [data, setData] = useState<{ month: string; revenue: number }[]>([]);
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
            month: monthLabel,
            revenue: typeof item.revenue === 'string' ? parseFloat(item.revenue) : item.revenue,
          };
        });
        setData(chartData);
      } catch (error) {
        console.error('Error fetching revenue trend data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Xu Hướng Doanh Thu</h3>
        <p className="text-sm text-blue-300/80">Biểu đồ đường thể hiện xu hướng tăng trưởng</p>
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
          <LineChart data={data}>
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
            formatter={(value) => [`${(value as number).toLocaleString()} VND`, 'Doanh thu']}
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
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export { RevenueTrendChart };
export default RevenueTrendChart;
