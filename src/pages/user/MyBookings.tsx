import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { formatCurrency, formatDate, getStatusText } from '../../utils/formatters';
import { bookingService } from '../../services/bookingService';
import { paymentService } from '../../services/paymentService';
import { ticketService } from '../../services/ticketService';
import { useToast } from '../../hooks/useToast';
import { ReviewForm } from '../../components/review/ReviewForm';
import { Modal } from '../../components/common/Modal';
import { reviewService } from '../../services/reviewService';

interface BookingDisplay {
  id: number;
  tour_id: number;
  tour_title: string;
  tour_image?: string;
  booking_date: string;
  departure_date: string;
  return_date: string;
  adults: number;
  children: number;
  total_price: number;
  currency: string;
  status: string; // Trạng thái đặt chỗ (trang_thai_dat_cho)
  departure_status?: string; // Trạng thái khởi hành (trang_thai_khoi_hanh)
  payment_status: string;
  notes?: string;
  has_review?: boolean; // Trạng thái đánh giá
}

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [trangThaiDatCho, setTrangThaiDatCho] = useState<string>('all');
  const [trangThaiKhoiHanh, setTrangThaiKhoiHanh] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingDisplay | null>(null);
  const [downloadingTicket, setDownloadingTicket] = useState<number | null>(null);

  const handleDownloadTicket = async (bookingId: number) => {
    try {
      setDownloadingTicket(bookingId);
      showToast('Đang tải vé...', 'info');
      await ticketService.downloadTicket(bookingId);
      showToast('Tải vé thành công!', 'success');
    } catch (error: any) {
      console.error('Error downloading ticket:', error);
      const errorMessage = error?.message || 'Không thể tải vé';
      showToast(errorMessage, 'error');
    } finally {
      setDownloadingTicket(null);
    }
  };

  const handleVNPayPayment = async (bookingId: number) => {
    // Check authentication before calling API
    if (!user) {
      showToast('Vui lòng đăng nhập để thanh toán', 'warning');
      return;
    }
    
    try {
      setProcessingPayment(bookingId);
      showToast('Đang tạo liên kết thanh toán...', 'info');
      
      const { payment_url } = await paymentService.createVNPayPayment(bookingId);
      
      // Redirect to VNPay
      paymentService.redirectToVNPay(payment_url);
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Handle 401 Unauthorized - token expired
      if (error?.response?.status === 401) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại', 'warning');
        // Don't redirect here, let tokenManager handle it
      } else {
        const errorMessage = error?.response?.data?.error || 'Không thể tạo liên kết thanh toán';
        showToast(errorMessage, 'error');
      }
      setProcessingPayment(null);
    }
  };

  // Helper function to extract status string from possible object format
  const getStatusString = (status: any): string => {
    if (!status) return 'cho_xac_nhan';
    if (typeof status === 'string') return status;
    if (typeof status === 'object' && status.trang_thai_dat_cho) {
      return status.valid ? status.trang_thai_dat_cho : 'cho_xac_nhan';
    }
    if (typeof status === 'object' && status.TrangThaiDatCho) {
      return status.valid ? status.TrangThaiDatCho : 'cho_xac_nhan';
    }
    return 'cho_xac_nhan';
  };

  // Helper function to extract departure status string
  const getDepartureStatusString = (status: any): string => {
    if (!status) return '';
    if (typeof status === 'string') return status;
    if (typeof status === 'object' && status.trang_thai_khoi_hanh) {
      return status.valid ? status.trang_thai_khoi_hanh : '';
    }
    if (typeof status === 'object' && status.TrangThaiKhoiHanh) {
      return status.valid ? status.TrangThaiKhoiHanh : '';
    }
    return '';
  };

  // Fetch bookings function
  const loadBookings = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * pageSize;
      
      // Chuyển đổi giá trị 'all' thành undefined để service không đưa vào query string
      const trangThaiDatChoParam = trangThaiDatCho === 'all' ? undefined : trangThaiDatCho;
      
      // Xử lý giá trị đặc biệt 'sap_toi' - chuyển thành danh sách các trạng thái
      let trangThaiKhoiHanhParam: string | undefined;
      if (trangThaiKhoiHanh === 'all') {
        trangThaiKhoiHanhParam = undefined;
      } else if (trangThaiKhoiHanh === 'sap_toi') {
        // Gửi nhiều giá trị phân cách bằng dấu phẩy
        trangThaiKhoiHanhParam = 'len_lich,con_cho,het_cho';
      } else {
        trangThaiKhoiHanhParam = trangThaiKhoiHanh;
      }
      
      console.log('📡 Calling API with:', { 
        trangThaiDatCho: trangThaiDatChoParam, 
        trangThaiKhoiHanh: trangThaiKhoiHanhParam,
        page: currentPage,
        offset
      });

      // Gọi service
      const result = await bookingService.getMyBookings(
        pageSize, 
        offset, 
        trangThaiDatChoParam, 
        trangThaiKhoiHanhParam
      );
      
      console.log('📦 API Response:', result);
      
      // Kiểm tra result và data
      if (!result || !result.data) {
        console.warn('⚠️ API response is invalid:', result);
        setBookings([]);
        setTotalCount(0);
        setTotalPages(0);
        return;
      }
      
      // Map API response to display format
      const mappedBookings: BookingDisplay[] = await Promise.all(
        (result.data || []).map(async (booking: any) => {
          const bookingDisplay: BookingDisplay = {
            id: booking.id || 0,
            tour_id: booking.khoi_hanh_id || 0,
            tour_title: booking.ten_tour || 'N/A',
            tour_image: booking.anh_tour,
            booking_date: booking.ngay_dat,
            departure_date: booking.ngay_khoi_hanh,
            return_date: booking.ngay_ket_thuc,
            adults: booking.so_nguoi_lon || 0,
            children: booking.so_tre_em || 0,
            total_price: Number(booking.tong_tien) || 0,
            currency: booking.don_vi_tien_te || 'VND',
            status: getStatusString(booking.trang_thai),
            departure_status: getDepartureStatusString(booking.trang_thai_khoi_hanh),
            payment_status: booking.phuong_thuc_thanh_toan ? 'paid' : 'pending',
            notes: booking.ghi_chu || undefined,
            has_review: false, // Mặc định
          };

          // Kiểm tra trạng thái đánh giá: 
          // Cho phép đánh giá khi: trang_thai_dat_cho = 'da_thanh_toan' VÀ trang_thai_khoi_hanh = 'hoan_thanh'
          const canReview = bookingDisplay.status === 'da_thanh_toan' && 
                           bookingDisplay.departure_status === 'hoan_thanh';
          
          if (canReview) {
            try {
              const reviewStatus = await reviewService.checkReviewStatus(bookingDisplay.id);
              bookingDisplay.has_review = reviewStatus.has_review;
              console.log(`📝 Booking ${bookingDisplay.id} (dat_cho: ${bookingDisplay.status}, khoi_hanh: ${bookingDisplay.departure_status}) review status:`, reviewStatus.has_review);
            } catch (error) {
              console.error(`Error checking review status for booking ${bookingDisplay.id}:`, error);
              bookingDisplay.has_review = false; // Mặc định chưa có review nếu lỗi
            }
          } else {
            console.log(`📋 Booking ${bookingDisplay.id} - dat_cho: ${bookingDisplay.status}, khoi_hanh: ${bookingDisplay.departure_status} (cannot review)`);
          }

          return bookingDisplay;
        })
      );
      
      console.log('✅ Bookings loaded:', mappedBookings.length);
      console.log('📊 Bookings with status hoan_thanh:', mappedBookings.filter(b => b.status === 'hoan_thanh').map(b => ({
        id: b.id,
        status: b.status,
        has_review: b.has_review
      })));
      setBookings(mappedBookings);
      setTotalCount(result.total);
      setTotalPages(Math.ceil(result.total / pageSize));
    } catch (error) {
      console.error('❌ Failed to fetch bookings:', error);
      setBookings([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  // 1. Reset trang về 1 khi người dùng thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [trangThaiDatCho, trangThaiKhoiHanh]);

  // 2. Chỉ thực hiện fetch khi currentPage thay đổi 
  // (hoặc khi filters thay đổi và trang đã là 1)
  useEffect(() => {
    loadBookings();
  }, [currentPage, trangThaiDatCho, trangThaiKhoiHanh]);

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      // Trạng thái đặt chỗ (trang_thai_dat_cho)
      'cho_xac_nhan': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'da_xac_nhan': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'da_thanh_toan': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      'hoan_thanh': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'da_huy': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      // Backward compatibility với frontend display values
      'pending': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'confirmed': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'completed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'cancelled': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };
    return `px-3 py-1.5 rounded-xl text-xs font-semibold border ${statusMap[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`;
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      'paid': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'pending': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'failed': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };
    return `px-2 py-1.5 rounded-xl text-xs font-semibold border ${statusMap[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`;
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section - Dark & Ethereal */}
      <section className="relative min-h-[400px] w-full overflow-hidden bg-[#030712]">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} 
        />

        <div className="relative container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[400px]">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl text-cyan-300 text-sm font-semibold rounded-full border border-cyan-500/30 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            📋 Quản lý đặt chỗ
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Đặt Chỗ </span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Của Tôi
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl">
            Quản lý các tour đã đặt của bạn
          </p>
        </div>
      </section>

      {/* Bookings Content */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

        <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Filter Tabs */}
          <div className="mb-8">
            {/* Header với nút xóa filter */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Bộ lọc</h2>
              {(trangThaiDatCho !== 'all' || trangThaiKhoiHanh !== 'all') && (
                <button
                  onClick={() => { 
                    setTrangThaiDatCho('all'); 
                    setTrangThaiKhoiHanh('all'); 
                  }}
                  className="text-xs text-cyan-400 underline hover:text-cyan-300 transition-colors"
                >
                  Xóa tất cả lọc
                </button>
              )}
            </div>
            
            {/* Filters Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Filter theo trạng thái đặt chỗ */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-3">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Trạng thái đặt chỗ
                  </span>
                </label>
                <select
                  value={trangThaiDatCho}
                  onChange={(e) => {
                    console.log('🖱️ Change filter trangThaiDatCho:', e.target.value);
                    setTrangThaiDatCho(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:bg-slate-800 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">Tất cả</option>
                  <option value="cho_xac_nhan" className="bg-slate-900">Chờ xác nhận</option>
                  <option value="da_thanh_toan" className="bg-slate-900">Đã thanh toán</option>
                </select>
              </div>

              {/* Filter theo trạng thái khởi hành */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-3">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Trạng thái khởi hành
                  </span>
                </label>
                <select
                  value={trangThaiKhoiHanh}
                  onChange={(e) => {
                    console.log('🖱️ Change filter trangThaiKhoiHanh:', e.target.value);
                    setTrangThaiKhoiHanh(e.target.value);
                  }}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:bg-slate-800 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 cursor-pointer"
                >
                  <option value="all" className="bg-slate-900">Tất cả</option>
                  <option value="sap_toi" className="bg-slate-900">Khởi hành sắp tới</option>
                  <option value="hoan_thanh" className="bg-slate-900">Hoàn thành</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookings List */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full animate-pulse opacity-30" />
                <svg className="w-16 h-16 text-cyan-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Chưa có đặt chỗ nào</h3>
              <p className="text-slate-400 mb-8 text-lg">Hãy khám phá các tour tuyệt vời và đặt chỗ ngay!</p>
              <Link 
                to="/tours" 
                className="relative inline-flex items-center gap-2 px-8 py-4 overflow-hidden rounded-xl font-bold text-white transition-all duration-500 group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl" />
                <span className="absolute inset-[2px] bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors" />
                <span className="relative z-10 flex items-center gap-2">
                Khám phá tours
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="group relative">
                    {/* Glow Effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-700" />
                    
                    {/* Card */}
                    <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 group-hover:border-white/20 p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Tour Image */}
                      <div className="md:w-64 flex-shrink-0">
                          <div className="relative w-full h-48 bg-slate-800 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
                          {booking.tour_image ? (
                            <img
                              src={booking.tour_image}
                              alt={booking.tour_title}
                                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                              <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                                <svg className="w-16 h-16 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                              </div>
                          )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent rounded-2xl" />
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                              {booking.tour_title}
                            </h3>
                              <p className="text-slate-400 mb-3 flex items-center gap-2">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                                Mã đặt chỗ: <span className="font-semibold text-cyan-400">#{booking.id}</span>
                            </p>
                          </div>
                            <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                            <span className={getStatusBadgeClass(booking.status)}>
                              {getStatusText(booking.status)}
                            </span>
                            <span className={getPaymentStatusBadgeClass(booking.payment_status)}>
                              {booking.payment_status === 'paid' ? 'Đã thanh toán' : 
                               booking.payment_status === 'pending' ? 'Chờ thanh toán' : 'Thanh toán thất bại'}
                            </span>
                          </div>
                        </div>

                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                                Thông tin chuyến đi
                              </h4>
                              <div className="space-y-2 text-sm text-slate-300">
                                <p className="flex items-center gap-2">
                                  <span className="text-slate-500">Ngày khởi hành:</span>
                                  <span className="font-medium text-white">{formatDate(booking.departure_date)}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-slate-500">Ngày về:</span>
                                  <span className="font-medium text-white">{formatDate(booking.return_date)}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-slate-500">Người lớn:</span>
                                  <span className="font-medium text-white">{booking.adults}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-slate-500">Trẻ em:</span>
                                  <span className="font-medium text-white">{booking.children}</span>
                                </p>
                              </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Thông tin thanh toán
                              </h4>
                              <div className="space-y-2 text-sm text-slate-300">
                                <p className="flex items-center gap-2">
                                  <span className="text-slate-500">Ngày đặt:</span>
                                  <span className="font-medium text-white">{formatDate(booking.booking_date)}</span>
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-slate-500">Tổng tiền:</span>
                                  <span className="text-xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                  {formatCurrency(booking.total_price, booking.currency)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {booking.notes && (
                            <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                              <h4 className="font-semibold text-white mb-2">Ghi chú</h4>
                              <p className="text-sm text-slate-300">
                              {booking.notes}
                            </p>
                          </div>
                        )}

                          <div className="flex flex-wrap gap-3">
                          <Link
                              to={`/booking/${booking.id}`}
                              className="px-6 py-3 bg-slate-800/50 border-2 border-white/10 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:border-white/20 hover:text-white transition-all duration-300 flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Xem chi tiết
                          </Link>
                            
                            {/* Nút thanh toán VNPay - chỉ hiển thị khi chưa thanh toán */}
                            {(booking.payment_status === 'pending' && 
                              (booking.status === 'cho_xac_nhan' || booking.status === 'da_xac_nhan')) && (
                              <button
                                onClick={() => handleVNPayPayment(booking.id)}
                                disabled={processingPayment === booking.id}
                                className="relative px-6 py-3 overflow-hidden rounded-xl font-semibold text-white transition-all duration-500 group disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl" />
                                <span className="absolute inset-[2px] bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors" />
                                <span className="relative z-10 flex items-center gap-2">
                                  {processingPayment === booking.id ? (
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
                            
                            {(booking.status === 'cho_xac_nhan') && booking.payment_status === 'paid' && (
                              <button className="px-6 py-3 bg-rose-500/20 border-2 border-rose-500/30 text-rose-400 font-semibold rounded-xl hover:bg-rose-500/30 hover:border-rose-500/50 transition-all duration-300 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              Hủy đặt chỗ
                            </button>
                          )}
                            {(booking.status === 'da_xac_nhan' || booking.status === 'da_thanh_toan' || booking.status === 'hoan_thanh') && booking.payment_status === 'paid' && (
                              <button
                                onClick={() => handleDownloadTicket(booking.id)}
                                disabled={downloadingTicket === booking.id}
                                className="relative px-6 py-3 overflow-hidden rounded-xl font-semibold text-white transition-all duration-500 group disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl" />
                                <span className="absolute inset-[2px] bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors" />
                                <span className="relative z-10 flex items-center gap-2">
                                  {downloadingTicket === booking.id ? (
                                    <>
                                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                      </svg>
                                      Đang tải...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Tải vé
                                    </>
                                  )}
                                </span>
                            </button>
                          )}
                          
                          {/* Nút đánh giá - hiển thị khi: trang_thai_dat_cho = 'da_thanh_toan' VÀ trang_thai_khoi_hanh = 'hoan_thanh' và chưa có review */}
                          {booking.status === 'da_thanh_toan' && 
                           booking.departure_status === 'hoan_thanh' && 
                           booking.has_review !== true && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowReviewForm(true);
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg shadow-amber-500/30 flex items-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                              Đánh giá
                            </button>
                          )}
                          
                          {/* Hiển thị trạng thái đã đánh giá */}
                          {booking.status === 'da_thanh_toan' && 
                           booking.departure_status === 'hoan_thanh' && 
                           booking.has_review === true && (
                            <div className="px-6 py-3 bg-emerald-500/20 border-2 border-emerald-500/30 text-emerald-400 font-semibold rounded-xl flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Đã đánh giá
                            </div>
                          )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-slate-400">
                    Hiển thị <span className="text-cyan-400 font-semibold">{((currentPage - 1) * pageSize) + 1}</span> - <span className="text-cyan-400 font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> trong tổng số <span className="text-purple-400 font-semibold">{totalCount}</span> đặt chỗ
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10 hover:border-cyan-500/50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5'
                          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/10 hover:border-cyan-500/50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </section>

      {/* Review Form Modal */}
      {selectedBooking && (
        <Modal
          isOpen={showReviewForm}
          onClose={() => {
            setShowReviewForm(false);
            setSelectedBooking(null);
          }}
        >
          <div className="max-w-3xl mx-auto">
            <ReviewForm
              datChoId={selectedBooking.id}
              tourTitle={selectedBooking.tour_title}
              onSuccess={() => {
                setShowReviewForm(false);
                setSelectedBooking(null);
                loadBookings(); // Reload để cập nhật
              }}
              onCancel={() => {
                setShowReviewForm(false);
                setSelectedBooking(null);
              }}
            />
          </div>
        </Modal>
      )}
    </MainLayout>
  );
};
