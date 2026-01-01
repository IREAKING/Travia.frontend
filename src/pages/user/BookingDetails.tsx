import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import { ReviewForm } from '../../components/review/ReviewForm';
import { Modal } from '../../components/common/Modal';

interface BookingDetails {
  id: number;
  nguoi_dung_id: string;
  khoi_hanh_id: number;
  so_nguoi_lon: number;
  so_tre_em: number;
  so_em_be: number;
  tong_tien: number;
  don_vi_tien_te: string;
  trang_thai: 'cho_xac_nhan' | 'da_xac_nhan' | 'da_thanh_toan' | 'da_huy' | 'hoan_thanh';
  phuong_thuc_thanh_toan: string;
  ngay_dat: string;
  ngay_cap_nhat: string;
  
  // Related data
  tour: {
    id: number;
    tieu_de: string;
    mo_ta: string;
    anh: string;
    so_ngay: number;
    so_dem: number;
    gia_nguoi_lon: number;
    gia_tre_em: number;
    don_vi_tien_te: string;
  };
  
  khoi_hanh: {
    id: number;
    ngay_khoi_hanh: string;
    ngay_ket_thuc: string;
    suc_chua: number;
    trang_thai: string;
    gia_dac_biet?: number;
    ghi_chu?: string;
  };
  
  hanh_khach: {
    id: number;
    ho_ten: string;
    ngay_sinh: string;
    loai_khach: 'nguoi_lon' | 'tre_em' | 'em_be';
    gioi_tinh: string;
    so_ho_chieu: string;
    quoc_tich: string;
    ghi_chu?: string;
  }[];
  
  thanh_toan?: {
    id: string;
    so_tien: number;
    don_vi_tien_te: string;
    phuong_thuc: string;
    trang_thai: string;
    ngay_thanh_toan?: string;
  };
}

export const BookingDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadBookingDetails();
    }
  }, [id]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { state: { from: `/booking/${id}` } });
    }
  }, [isAuthenticated, loading, navigate, id]);

  const handleVNPayPayment = async () => {
    if (!booking) return;
    
    // Check authentication before calling API
    if (!isAuthenticated || !user) {
      showToast('Vui lòng đăng nhập để thanh toán', 'warning');
      navigate('/login', { state: { from: `/booking/${id}` } });
      return;
    }
    
    try {
      setProcessingPayment(true);
      showToast('Đang tạo liên kết thanh toán...', 'info');
      
      const { payment_url } = await paymentService.createVNPayPayment(booking.id);
      
      // Redirect to VNPay
      paymentService.redirectToVNPay(payment_url);
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Handle 401 Unauthorized - redirect to login
      if (error?.response?.status === 401) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại', 'warning');
        navigate('/login', { state: { from: `/booking/${id}` } });
      } else {
        const errorMessage = error?.response?.data?.error || 'Không thể tạo liên kết thanh toán';
        showToast(errorMessage, 'error');
      }
      setProcessingPayment(false);
    }
  };

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      // Load booking details from API
      // This is a mock implementation
      const mockBooking: BookingDetails = {
        id: parseInt(id || '1'),
        nguoi_dung_id: 'user1',
        khoi_hanh_id: 1,
        so_nguoi_lon: 2,
        so_tre_em: 1,
        so_em_be: 0,
        tong_tien: 6750000,
        don_vi_tien_te: 'VND',
        trang_thai: 'da_thanh_toan',
        phuong_thuc_thanh_toan: 'stripe_card',
        ngay_dat: '2024-01-15T10:00:00Z',
        ngay_cap_nhat: '2024-01-15T10:30:00Z',
        
        tour: {
          id: 1,
          tieu_de: 'Tour Hà Nội - Sapa 3 ngày 2 đêm',
          mo_ta: 'Khám phá vẻ đẹp của Sapa với những ruộng bậc thang tuyệt đẹp',
          anh: '/placeholder-tour.jpg',
          so_ngay: 3,
          so_dem: 2,
          gia_nguoi_lon: 2500000,
          gia_tre_em: 1750000,
          don_vi_tien_te: 'VND'
        },
        
        khoi_hanh: {
          id: 1,
          ngay_khoi_hanh: '2024-02-15',
          ngay_ket_thuc: '2024-02-17',
          suc_chua: 20,
          trang_thai: 'xac_nhan',
          gia_dac_biet: 2500000,
          ghi_chu: 'Khởi hành từ Hà Nội lúc 6:00 sáng'
        },
        
        hanh_khach: [
          {
            id: 1,
            ho_ten: 'Nguyễn Văn A',
            ngay_sinh: '1990-01-01',
            loai_khach: 'nguoi_lon',
            gioi_tinh: 'Nam',
            so_ho_chieu: 'A1234567',
            quoc_tich: 'Vietnam',
            ghi_chu: 'Dị ứng hải sản'
          },
          {
            id: 2,
            ho_ten: 'Trần Thị B',
            ngay_sinh: '1992-05-15',
            loai_khach: 'nguoi_lon',
            gioi_tinh: 'Nữ',
            so_ho_chieu: 'B2345678',
            quoc_tich: 'Vietnam'
          },
          {
            id: 3,
            ho_ten: 'Nguyễn Văn C',
            ngay_sinh: '2015-08-20',
            loai_khach: 'tre_em',
            gioi_tinh: 'Nam',
            so_ho_chieu: 'C3456789',
            quoc_tich: 'Vietnam'
          }
        ],
        
        thanh_toan: {
          id: 'pay_123',
          so_tien: 6750000,
          don_vi_tien_te: 'VND',
          phuong_thuc: 'stripe_card',
          trang_thai: 'completed',
          ngay_thanh_toan: '2024-01-15T10:30:00Z'
        }
      };
      
      setBooking(mockBooking);
    } catch (error) {
      console.error('Error loading booking details:', error);
      showToast('Không thể tải thông tin đặt tour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    if (!confirm('Bạn có chắc chắn muốn hủy đặt tour này?')) {
      return;
    }

    setCancelling(true);
    try {
      // Cancel booking via API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      setBooking(prev => prev ? { ...prev, trang_thai: 'da_huy' } : null);
      showToast('Đặt tour đã được hủy thành công', 'success');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      showToast('Có lỗi xảy ra khi hủy đặt tour', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadTicket = () => {
    // Implement ticket download
    showToast('Đang tải vé điện tử...', 'info');
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'cho_xac_nhan': 'bg-yellow-100 text-yellow-800',
      'da_xac_nhan': 'bg-blue-100 text-blue-800',
      'da_thanh_toan': 'bg-green-100 text-green-800',
      'da_huy': 'bg-red-100 text-red-800',
      'hoan_thanh': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'cho_xac_nhan': 'Chờ xác nhận',
      'da_xac_nhan': 'Đã xác nhận',
      'da_thanh_toan': 'Đã thanh toán',
      'da_huy': 'Đã hủy',
      'hoan_thanh': 'Hoàn thành'
    };
    return texts[status] || status;
  };

  const canCancel = booking?.trang_thai === 'cho_xac_nhan' || booking?.trang_thai === 'da_xac_nhan';

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đặt tour...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!booking) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy đặt tour</h1>
            <button onClick={() => navigate('/my-bookings')} className="btn-primary">
              Quay lại danh sách đặt tour
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Quay lại danh sách đặt tour
              </button>
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Chi Tiết Đặt Tour #{booking.id}
                  </h1>
                  <p className="text-xl text-gray-600">
                    Đặt ngày: {new Date(booking.ngay_dat).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.trang_thai)}`}>
                    {getStatusText(booking.trang_thai)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Tour Information */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Tour</h2>
                  <div className="flex items-start space-x-6">
                    <img
                      src={booking.tour.anh}
                      alt={booking.tour.tieu_de}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {booking.tour.tieu_de}
                      </h3>
                      <p className="text-gray-600 mb-4">{booking.tour.mo_ta}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Thời gian:</span>
                          <span className="ml-2 font-semibold">
                            {booking.tour.so_ngay} ngày {booking.tour.so_dem} đêm
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Giá:</span>
                          <span className="ml-2 font-semibold">
                            {booking.tour.gia_nguoi_lon.toLocaleString('vi-VN')} VND/người lớn
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Departure Information */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Khởi Hành</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch Trình</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày khởi hành:</span>
                          <span className="font-semibold">
                            {new Date(booking.khoi_hanh.ngay_khoi_hanh).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày kết thúc:</span>
                          <span className="font-semibold">
                            {new Date(booking.khoi_hanh.ngay_ket_thuc).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sức chứa:</span>
                          <span className="font-semibold">{booking.khoi_hanh.suc_chua} người</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.khoi_hanh.trang_thai)}`}>
                            {getStatusText(booking.khoi_hanh.trang_thai)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ghi Chú</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                        {booking.khoi_hanh.ghi_chu || 'Không có ghi chú đặc biệt'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Passenger Information */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Hành Khách</h2>
                  <div className="space-y-4">
                    {booking.hanh_khach.map((passenger, index) => (
                      <div key={passenger.id} className="border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {passenger.loai_khach === 'nguoi_lon' ? 'Người lớn' : 
                             passenger.loai_khach === 'tre_em' ? 'Trẻ em' : 'Em bé'} {index + 1}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            passenger.loai_khach === 'nguoi_lon' ? 'bg-blue-100 text-blue-800' :
                            passenger.loai_khach === 'tre_em' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {passenger.loai_khach === 'nguoi_lon' ? 'Người lớn' :
                             passenger.loai_khach === 'tre_em' ? 'Trẻ em' : 'Em bé'}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Họ và tên:</span>
                            <span className="ml-2 font-semibold">{passenger.ho_ten}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Ngày sinh:</span>
                            <span className="ml-2 font-semibold">
                              {new Date(passenger.ngay_sinh).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Giới tính:</span>
                            <span className="ml-2 font-semibold">{passenger.gioi_tinh}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Số hộ chiếu:</span>
                            <span className="ml-2 font-semibold">{passenger.so_ho_chieu}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Quốc tịch:</span>
                            <span className="ml-2 font-semibold">{passenger.quoc_tich}</span>
                          </div>
                          {passenger.ghi_chu && (
                            <div className="md:col-span-2">
                              <span className="text-gray-600">Ghi chú:</span>
                              <span className="ml-2 font-semibold">{passenger.ghi_chu}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Information */}
                {booking.thanh_toan && (
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông Tin Thanh Toán</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi Tiết Thanh Toán</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Mã thanh toán:</span>
                            <span className="font-semibold">#{booking.thanh_toan.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Số tiền:</span>
                            <span className="font-semibold text-emerald-600">
                              {booking.thanh_toan.so_tien.toLocaleString('vi-VN')} {booking.thanh_toan.don_vi_tien_te}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phương thức:</span>
                            <span className="font-semibold">
                              {booking.thanh_toan.phuong_thuc === 'stripe_card' ? 'Thẻ tín dụng' :
                               booking.thanh_toan.phuong_thuc === 'paypal' ? 'PayPal' :
                               booking.thanh_toan.phuong_thuc === 'vnpay' ? 'VNPay' :
                               booking.thanh_toan.phuong_thuc === 'momo' ? 'MoMo' :
                               booking.thanh_toan.phuong_thuc === 'bank_transfer' ? 'Chuyển khoản' :
                               'Tiền mặt'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.thanh_toan.trang_thai)}`}>
                              {getStatusText(booking.thanh_toan.trang_thai)}
                            </span>
                          </div>
                          {booking.thanh_toan.ngay_thanh_toan && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ngày thanh toán:</span>
                              <span className="font-semibold">
                                {new Date(booking.thanh_toan.ngay_thanh_toan).toLocaleString('vi-VN')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Tóm Tắt</h3>
                  
                  {/* Booking Summary */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Người lớn ({booking.so_nguoi_lon})</span>
                      <span className="font-semibold">
                        {(booking.so_nguoi_lon * booking.tour.gia_nguoi_lon).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                    {booking.so_tre_em > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trẻ em ({booking.so_tre_em})</span>
                        <span className="font-semibold">
                          {(booking.so_tre_em * booking.tour.gia_tre_em).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    )}
                    {booking.so_em_be > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Em bé ({booking.so_em_be})</span>
                        <span className="font-semibold">Miễn phí</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Tổng cộng</span>
                        <span className="text-emerald-600">
                          {booking.tong_tien.toLocaleString('vi-VN')} {booking.don_vi_tien_te}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Nút thanh toán VNPay - chỉ hiển thị khi chưa thanh toán */}
                    {booking && booking.trang_thai !== 'da_thanh_toan' && 
                     booking.trang_thai !== 'hoan_thanh' && 
                     (!booking.thanh_toan || booking.thanh_toan.trang_thai !== 'thanh_cong') && (
                      <button
                        onClick={handleVNPayPayment}
                        disabled={processingPayment}
                        className="w-full relative overflow-hidden rounded-lg font-bold py-3 px-4 text-white transition-all duration-500 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-lg" />
                        <span className="absolute inset-[2px] bg-slate-900 rounded-md group-hover:bg-slate-800 transition-colors" />
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {processingPayment ? (
                            <>
                              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Thanh toán VNPay
                            </>
                          )}
                        </span>
                      </button>
                    )}
                    
                    <button
                      onClick={handleDownloadTicket}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Tải Vé Điện Tử
                      </span>
                    </button>
                    
                    {canCancel && (
                      <button
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling ? 'Đang hủy...' : 'Hủy Đặt Tour'}
                      </button>
                    )}
                    
                    {/* Review Button - chỉ hiển thị khi booking đã hoàn thành */}
                    {booking.trang_thai === 'hoan_thanh' && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/30"
                      >
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Đánh Giá Tour
                        </span>
                      </button>
                    )}
                    
                    {/* Xem đánh giá tour */}
                    <button
                      onClick={() => navigate(`/tours/${booking.tour.id}`)}
                      className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-all duration-300"
                    >
                      <span className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Xem Chi Tiết Tour
                      </span>
                    </button>
                  </div>

                  {/* Contact Support */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Cần hỗ trợ?</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>📧 support@travia.com</p>
                      <p>📞 1900 1234 (24/7)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {booking && (
        <Modal
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
        >
          <div className="max-w-3xl mx-auto">
            <ReviewForm
              datChoId={booking.id}
              tourTitle={booking.tour.tieu_de}
              onSuccess={() => {
                setShowReviewForm(false);
                loadBookingDetails(); // Reload để cập nhật trạng thái
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};
