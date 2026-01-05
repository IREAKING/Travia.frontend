import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { adminService } from '../../services/adminService';
import type { AdminTopActiveUser } from '../../types';
import { LoadingSpinner } from '../common/Loading';
import { formatCurrency } from '../../utils/formatters';

export const AdminTopActiveUsersChart = () => {
  const [data, setData] = useState<AdminTopActiveUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchData();
  }, [limit]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await adminService.getTopActiveUsers(limit);
      setData(result);
    } catch (error) {
      console.error('Error fetching top active users:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = data.map(item => ({
    name: item.ho_ten.length > 15 ? item.ho_ten.substring(0, 15) + '...' : item.ho_ten,
    fullName: item.ho_ten,
    email: item.email,
    so_booking: Number(item.so_booking),
    tong_chi_tieu: typeof item.tong_chi_tieu === 'string' 
      ? parseFloat(item.tong_chi_tieu) || 0 
      : Number(item.tong_chi_tieu) || 0,
  }));

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1', '#f97316', '#84cc16'];

  return (
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Top Người Dùng Hoạt Động</h3>
          <p className="text-sm text-slate-400">Người dùng có nhiều đặt chỗ nhất</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-400">Số lượng:</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
            min="5"
            max="50"
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-20"
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
        <>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={100}
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
                formatter={(value: any, name: string) => {
                  if (name === 'tong_chi_tieu') {
                    return formatCurrency(value, 'VND');
                  }
                  return value;
                }}
                labelFormatter={(label) => {
                  const item = chartData.find(d => d.name === label);
                  return item ? `${item.fullName} (${item.email})` : label;
                }}
              />
              <Legend />
              <Bar dataKey="so_booking" name="Số đặt chỗ" fill="#06b6d4">
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Table View */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase py-3 px-4">STT</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase py-3 px-4">Tên</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase py-3 px-4">Email</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase py-3 px-4">Số đặt chỗ</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase py-3 px-4">Tổng chi tiêu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {chartData.map((item, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-300">{index + 1}</td>
                    <td className="py-3 px-4 text-sm text-white font-medium">{item.fullName}</td>
                    <td className="py-3 px-4 text-sm text-slate-400">{item.email}</td>
                    <td className="py-3 px-4 text-sm text-cyan-400 text-right font-semibold">{item.so_booking}</td>
                    <td className="py-3 px-4 text-sm text-emerald-400 text-right font-semibold">
                      {formatCurrency(item.tong_chi_tieu, 'VND')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

