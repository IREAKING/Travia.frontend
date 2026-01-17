import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services/adminService';
import { exportToCsv, exportToXlsx } from '../../utils/export';
import { ExportDropdown } from '../common/ExportDropdown';

interface UserGrowthData {
  month: number | string;
  year?: number;
  new_users: number;
}

export const AdminUserGrowthChart = () => {
  const [data, setData] = useState<UserGrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminService.getUserGrowthByMonth();
        setData(response || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch user growth data:', err);
        setError('Không thể tải dữ liệu tăng trưởng người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-80 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-3"></div>
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

  const formattedData = data.map(item => ({
    ...item,
    name: item.year ? `T${item.month}/${item.year}` : String(item.month)
  }));

  const totalNewUsers = data.reduce((sum, item) => sum + (item.new_users || 0), 0);
  const canExport = data.length > 0;

  const handleExportCsv = () => {
    if (!canExport) return;
    const rows = data.map((item) => ({
      thang: item.month,
      nam: item.year || '',
      nguoi_dung_moi: item.new_users || 0,
    }));
    exportToCsv('admin-tang-truong-nguoi-dung.csv', rows);
  };
  const handleExportXlsx = () => {
    if (!canExport) return;
    const rows = data.map((item) => ({
      thang: item.month,
      nam: item.year || '',
      nguoi_dung_moi: item.new_users || 0,
    }));
    exportToXlsx('admin-tang-truong-nguoi-dung.xlsx', rows);
  };

  return (
    <div className="group relative rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-700"></div>
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Tăng Trưởng Người Dùng</h3>
              <p className="text-sm text-slate-400">12 tháng gần nhất</p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {totalNewUsers.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Tổng người dùng mới</p>
            <ExportDropdown
              onExportCsv={handleExportCsv}
              onExportXlsx={handleExportXlsx}
              disabled={!canExport}
              label="Xuất file"
            />
          </div>
        </div>

        <div style={{ width: '100%', height: '256px', minHeight: '256px' }}>
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrowthGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6"/>
                  <stop offset="50%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#a855f7"/>
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
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => [`${value} người dùng`, 'Người dùng mới']}
              />
              <Line 
                type="monotone" 
                dataKey="new_users" 
                stroke="url(#userGrowthGradient)" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#0f172a' }}
                activeDot={{ r: 6, fill: '#a855f7', stroke: '#0f172a', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
