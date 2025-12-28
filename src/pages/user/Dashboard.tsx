import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import type { Booking } from '../../types';
import { formatCurrency, formatDate, getStatusColor, getStatusText } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/Loading';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMyBookings();
        setBookings(data.data);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const activeBookings = bookings.filter(
    (b) => !['da_huy', 'hoan_thanh'].includes(b.trang_thai)
  );
  const pastBookings = bookings.filter((b) =>
    ['da_huy', 'hoan_thanh'].includes(b.trang_thai)
  );

  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Xin chào, {user?.name}!</h1>
          <p className="mt-2">Quản lý đặt chỗ và thông tin cá nhân của bạn</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đặt chỗ đang hoạt động</p>
                <p className="text-3xl font-bold text-blue-600">{activeBookings.length}</p>
              </div>
              <svg className="w-12 h-12 text-blue-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>

          <div className="card bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-3xl font-bold text-green-600">
                  {bookings.filter((b) => b.trang_thai === 'hoan_thanh').length}
                </p>
              </div>
              <svg className="w-12 h-12 text-green-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="card bg-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatCurrency(
                    bookings.reduce((sum, b) => sum + b.tong_tien, 0),
                    'VND'
                  )}
                </p>
              </div>
              <svg className="w-12 h-12 text-purple-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Đặt Chỗ Đang Hoạt Động</h2>
            <Link to="/tours" className="text-primary-600 hover:underline">
              Đặt tour mới
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : activeBookings.length === 0 ? (
            <div className="card text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Bạn chưa có đặt chỗ nào
              </h3>
              <p className="text-gray-600 mb-4">Khám phá các tour tuyệt vời và bắt đầu cuộc phiêu lưu của bạn!</p>
              <Link to="/tours" className="btn-primary inline-block">
                Xem Tours
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBookings.map((booking) => (
                <div key={booking.id} className="card hover:shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        {booking.tour_info?.tieu_de || `Tour #${booking.khoi_hanh_id}`}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Mã đặt chỗ: #{booking.id}</p>
                        <p>Ngày đặt: {formatDate(booking.ngay_dat)}</p>
                        <p>
                          Số người: {booking.so_nguoi_lon} người lớn
                          {booking.so_tre_em > 0 && `, ${booking.so_tre_em} trẻ em`}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold bg-${getStatusColor(
                          booking.trang_thai
                        )}-100 text-${getStatusColor(booking.trang_thai)}-800`}
                      >
                        {getStatusText(booking.trang_thai)}
                      </span>
                      <p className="text-2xl font-bold text-primary-600 mt-2">
                        {formatCurrency(booking.tong_tien, 'VND')}
                      </p>
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="text-sm text-primary-600 hover:underline mt-2"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Lịch Sử</h2>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="card opacity-75">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">
                        {booking.tour_info?.tieu_de || `Tour #${booking.khoi_hanh_id}`}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Mã đặt chỗ: #{booking.id}</p>
                        <p>Ngày đặt: {formatDate(booking.ngay_dat)}</p>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold bg-${getStatusColor(
                          booking.trang_thai
                        )}-100 text-${getStatusColor(booking.trang_thai)}-800`}
                      >
                        {getStatusText(booking.trang_thai)}
                      </span>
                      <p className="text-xl font-bold text-gray-600 mt-2">
                        {formatCurrency(booking.tong_tien, 'VND')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

