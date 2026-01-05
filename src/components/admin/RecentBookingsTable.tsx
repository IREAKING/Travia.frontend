import { useEffect, useState } from 'react';
import type { RecentBooking } from '../../types';
import { formatCurrency } from '../../utils/formatters';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'cho_xac_nhan': { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
  'da_xac_nhan': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'da_thanh_toan': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'hoan_thanh': { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
  'da_huy': { bg: 'bg-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
};

const STATUS_LABELS: Record<string, string> = {
  'cho_xac_nhan': 'Chờ xác nhận',
  'da_xac_nhan': 'Đã xác nhận',
  'da_thanh_toan': 'Đã thanh toán',
  'hoan_thanh': 'Hoàn thành',
  'da_huy': 'Đã hủy',
};

export const RecentBookingsTable = () => {
  const [data] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement getRecentBookings service function
    setLoading(false);
    setError('Service function not implemented');
  }, []);

  if (loading) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-80 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-3"></div>
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

  return (
    <div className="group relative rounded-3xl overflow-hidden transition-all duration-700">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-700"></div>
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-violet-500/30">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Đặt Chỗ Gần Đây</h3>
              <p className="text-sm text-slate-400">10 đặt chỗ mới nhất</p>
            </div>
          </div>
          <a 
            href="/admin/bookings" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-sm font-medium rounded-xl transition-all duration-300 border border-white/10"
          >
            <span>Xem tất cả</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4">Mã</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4">Khách hàng</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4">Tour</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4">Giá trị</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4">Trạng thái</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-3 px-4">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((booking, index) => {
                // Handle trang_thai as string or object
                const trangThai = typeof (booking.trang_thai || booking.status) === 'string' 
                  ? (booking.trang_thai || booking.status) 
                  : (booking.trang_thai as any)?.trang_thai_dat_cho || (booking.trang_thai as any)?.TrangThaiDatCho || String(booking.trang_thai || booking.status);
                const style = STATUS_STYLES[trangThai] || { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' };
                const priceValue = booking.tong_gia || booking.total_amount;
                const totalPrice = typeof priceValue === 'string' 
                  ? parseFloat(priceValue) 
                  : (typeof priceValue === 'number' ? priceValue : 0);
                const bookingId = booking.id || booking.booking_id;
                return (
                  <tr 
                    key={bookingId || index} 
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-cyan-400">#{bookingId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-lg flex items-center justify-center border border-white/10">
                          <span className="text-xs font-bold text-white">
                            {booking.user_name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <span className="text-sm text-white font-medium">{booking.user_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-300 line-clamp-1 max-w-[200px]">
                        {booking.tour_title || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        {formatCurrency(totalPrice, 'VND')}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${style.bg} rounded-lg`}>
                        <span className={`w-1.5 h-1.5 ${style.dot} rounded-full`}></span>
                        <span className={`text-xs font-medium ${style.text}`}>
                          {STATUS_LABELS[trangThai] || trangThai}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-400">
                        {(booking.ngay_dat || booking.created_at) ? new Date(booking.ngay_dat || booking.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {data.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-500">Chưa có đặt chỗ nào</p>
          </div>
        )}
      </div>
    </div>
  );
};
