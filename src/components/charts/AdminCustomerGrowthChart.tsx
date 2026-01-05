import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services/adminService';
import type { AdminCustomerGrowthMonthlyReport } from '../../types';
import { LoadingSpinner } from '../common/Loading';

export const AdminCustomerGrowthChart = () => {
  const [data, setData] = useState<AdminCustomerGrowthMonthlyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await adminService.getCustomerGrowthMonthlyReport(year);
      // Sort by year and month ascending for proper display
      const sorted = result.sort((a, b) => {
        if (a.nam !== b.nam) return a.nam - b.nam;
        return a.thang - b.thang;
      });
      setData(sorted);
    } catch (error) {
      console.error('Error fetching customer growth data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data.map(item => ({
    thang: `Tháng ${item.thang}/${item.nam}`,
    khach_moi_thang_nay: Number(item.khach_moi_thang_nay),
    khach_moi_thang_truoc: typeof item.khach_moi_thang_truoc === 'string' 
      ? parseFloat(item.khach_moi_thang_truoc) || 0 
      : Number(item.khach_moi_thang_truoc) || 0,
    phan_tram_tang_truong: typeof item.phan_tram_tang_truong === 'string'
      ? parseFloat(item.phan_tram_tang_truong) || 0
      : Number(item.phan_tram_tang_truong) || 0,
  }));

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Tăng Trưởng Khách Hàng Theo Tháng</h3>
          <p className="text-sm text-slate-400">Báo cáo số lượng khách hàng mới và tỷ lệ tăng trưởng</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400">Năm:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
            min="2020"
            max={new Date().getFullYear() + 1}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 w-24"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="md" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-slate-400">
          Không có dữ liệu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="thang" 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="khach_moi_thang_nay" 
              name="Khách mới tháng này"
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={{ fill: '#06b6d4', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="khach_moi_thang_truoc" 
              name="Khách mới tháng trước"
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <p className="text-xs text-cyan-400 mb-1">Tổng khách mới</p>
            <p className="text-2xl font-bold text-cyan-300">
              {chartData.reduce((sum, item) => sum + item.khach_moi_thang_nay, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-xs text-purple-400 mb-1">Tăng trưởng TB</p>
            <p className="text-2xl font-bold text-purple-300">
              {chartData.length > 0
                ? (chartData.reduce((sum, item) => sum + item.phan_tram_tang_truong, 0) / chartData.length).toFixed(1)
                : 0}%
            </p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-xs text-emerald-400 mb-1">Tháng cao nhất</p>
            <p className="text-2xl font-bold text-emerald-300">
              {chartData.length > 0
                ? Math.max(...chartData.map(item => item.khach_moi_thang_nay)).toLocaleString()
                : 0}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

