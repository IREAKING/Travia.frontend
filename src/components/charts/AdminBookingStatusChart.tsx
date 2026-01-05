import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface BookingStatus {
  trang_thai?: string;
  status?: string;
  so_luong?: number;
  count?: number;
}

interface BookingByDayOfWeek {
  ngay_trong_tuan?: number;
  day_of_week?: number;
  ten_ngay?: string;
  day_name?: string;
  so_booking?: number;
  booking_count?: number;
}

const STATUS_COLORS: Record<string, { bg: string; fill: string }> = {
  'cho_xac_nhan': { bg: 'bg-amber-500', fill: '#f59e0b' },
  'da_xac_nhan': { bg: 'bg-emerald-500', fill: '#10b981' },
  'da_thanh_toan': { bg: 'bg-cyan-500', fill: '#06b6d4' },
  'hoan_thanh': { bg: 'bg-blue-500', fill: '#3b82f6' },
  'da_huy': { bg: 'bg-rose-500', fill: '#f43f5e' },
  'default': { bg: 'bg-slate-500', fill: '#64748b' }
};

const STATUS_LABELS: Record<string, string> = {
  'cho_xac_nhan': 'Chờ xác nhận',
  'da_xac_nhan': 'Đã xác nhận',
  'da_thanh_toan': 'Đã thanh toán',
  'hoan_thanh': 'Hoàn thành',
  'da_huy': 'Đã hủy',
};

export const AdminBookingStatusChart = () => {
  const [statusData] = useState<BookingStatus[]>([]);
  const [dayOfWeekData] = useState<BookingByDayOfWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement getBookingsByStatus and getBookingsByDayOfWeek service functions
    setLoading(false);
    setError('Service functions not implemented');
  }, []);

  if (loading) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-80 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-3"></div>
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

  const pieData = statusData.map((item) => {
    const status = item.trang_thai || item.status || '';
    return {
      name: STATUS_LABELS[status] || status,
      value: item.so_luong || item.count || 0,
      fill: STATUS_COLORS[status]?.fill || STATUS_COLORS.default.fill
    };
  });

  const barData = dayOfWeekData.map((item) => ({
    name: item.ten_ngay || item.day_name || '',
    bookings: item.so_booking || item.booking_count || 0
  }));

  const totalBookings = statusData.reduce((sum, item) => sum + (item.so_luong || item.count || 0), 0);

  return (
    <div className="group relative rounded-3xl overflow-hidden transition-all duration-700 hover:-translate-y-1">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-700"></div>
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Thống Kê Đặt Chỗ</h3>
              <p className="text-sm text-slate-400">Phân bố theo trạng thái</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              {totalBookings.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">Tổng đặt chỗ</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-56 min-h-[224px]">
            <ResponsiveContainer width="100%" height={224}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value: number, name: string) => [`${value} đặt chỗ`, name]}
                />
                <Legend 
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => <span className="text-slate-400">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Day of Week */}
          <div style={{ width: '100%', height: '200px', minHeight: '200px' }}>
            <p className="text-xs text-slate-500 mb-3 text-center">Theo ngày trong tuần</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="bookingBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#ec4899" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={10}
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
                  formatter={(value: number) => [`${value} đặt chỗ`, 'Số lượng']}
                />
                <Bar dataKey="bookings" fill="url(#bookingBarGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
