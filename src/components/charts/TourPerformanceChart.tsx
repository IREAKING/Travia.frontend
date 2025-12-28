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

const TourPerformanceChart = () => {
  const [data, setData] = useState<{ name: string; bookings: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await supplierService.getTopTours('revenue', 5);
        
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

    fetchData();
  }, []);
  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Hiệu Suất Tour</h3>
        <p className="text-sm text-pink-300/80">Top 5 tour có hiệu suất tốt nhất</p>
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
