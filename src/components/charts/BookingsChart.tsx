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
// import type { SupplierBookingStatsByStatus } from '../../types';
import { LoadingSpinner } from '../common/Loading';

const BookingsChart = () => {
  const [data, setData] = useState<{ month: string; bookings: number; cancellations: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await supplierService.getBookingStatsByStatus();
        
        // Calculate total bookings and cancellations
        const totalBookings = result.reduce((sum, item) => sum + item.booking_count, 0);
        const getStatusString = (status: any): string | null => {
          if (!status) return null;
          if (typeof status === 'string') return status;
          if (typeof status === 'object' && status.trang_thai_dat_cho) {
            return status.valid ? status.trang_thai_dat_cho : null;
          }
          return null;
        };
        const cancelledBookings = result.find(item => {
          const statusStr = getStatusString(item.trang_thai);
          return statusStr === 'da_huy';
        })?.booking_count || 0;
        
        // For now, show current stats (can be enhanced to show monthly breakdown)
        const chartData = [
          { month: 'Hiện tại', bookings: totalBookings, cancellations: cancelledBookings }
        ];
        setData(chartData);
      } catch (error) {
        console.error('Error fetching bookings chart data:', error);
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
          <h3 className="text-lg font-semibold text-white">Đặt Chỗ Theo Tháng</h3>
          <p className="text-sm text-purple-300/80">Số lượng đặt chỗ và hủy chỗ</p>
        </div>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
            <span className="text-sm text-purple-300">Đặt chỗ</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
            <span className="text-sm text-pink-300">Hủy chỗ</span>
          </div>
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
          <BarChart data={data}>
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
          />
          <Tooltip 
            formatter={(value, name) => [
              value,
              name === 'bookings' ? 'Đặt chỗ' : 'Hủy chỗ'
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
          <Bar 
            dataKey="bookings" 
            fill="#A855F7" 
            radius={[4, 4, 0, 0]}
            name="Đặt chỗ"
          />
          <Bar 
            dataKey="cancellations" 
            fill="#EC4899" 
            radius={[4, 4, 0, 0]}
            name="Hủy chỗ"
          />
        </BarChart>
      </ResponsiveContainer>
      )}
    </div>
  );
};

export { BookingsChart };
export default BookingsChart;
