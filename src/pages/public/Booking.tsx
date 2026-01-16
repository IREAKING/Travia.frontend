import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Loading } from '../../components/common/Loading';
import { Modal } from '../../components/common/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { api } from '../../services/api';
import { bookingService } from '../../services/bookingService';
import type { Passenger } from '../../types';

// Types
interface TourInfo {
  id: number;
  tieu_de: string;
  mo_ta: string;
  so_ngay: number;
  so_dem: number;
  gia_nguoi_lon: number;
  gia_tre_em: number;
  don_vi_tien_te: string;
  hinh_anh: { duong_dan: string; la_anh_chinh: boolean }[];
}

interface DepartureInfo {
  id: number;
  ngay_khoi_hanh: string;
  ngay_ket_thuc: string;
  suc_chua: number;
  so_cho_da_dat: number;
  trang_thai: string;
  ghi_chu?: string;
}

interface PassengerForm {
  ho_ten: string;
  ngay_sinh: string;
  loai_khach: 'nguoi_lon' | 'tre_em';
  gioi_tinh: 'nam' | 'nu' | 'khac';
  so_giay_to_tuy_thanh: string;
  quoc_tich: string;
  ghi_chu: string;
}

type BookingStep = 'select' | 'passengers' | 'payment' | 'complete';

export const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  // State
  const [step, setStep] = useState<BookingStep>('select');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tour, setTour] = useState<TourInfo | null>(null);
  const [departure, setDeparture] = useState<DepartureInfo | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Form data
  const [soNguoiLon, setSoNguoiLon] = useState(1);
  const [soTreEm, setSoTreEm] = useState(0);
  const [passengers, setPassengers] = useState<PassengerForm[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('stripe');
  const [seatHeld, setSeatHeld] = useState(false);
  const [expandedPassenger, setExpandedPassenger] = useState<number>(0);
  const [showInsufficientSeatsModal, setShowInsufficientSeatsModal] = useState(false);
  const [insufficientSeatsMessage, setInsufficientSeatsMessage] = useState('');

  // Get departure ID from query params
  const departureId = searchParams.get('departure');

  // Load tour and departure function
  const loadTourAndDeparture = async () => {
    if (!id || !departureId) {
      showToast('Thiếu thông tin tour hoặc ngày khởi hành', 'error');
      navigate('/tours');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get<{ data: any }>(`/tour/${id}`);
      const tourData = response.data.data;

      setTour({
        id: tourData.id,
        tieu_de: tourData.tieu_de,
        mo_ta: tourData.mo_ta,
        so_ngay: tourData.so_ngay,
        so_dem: tourData.so_dem,
        gia_nguoi_lon: tourData.gia_nguoi_lon,
        gia_tre_em: tourData.gia_tre_em,
        don_vi_tien_te: tourData.don_vi_tien_te,
        hinh_anh: tourData.hinh_anh || [],
      });

      const dep = tourData.lich_khoi_hanh?.find(
        (d: DepartureInfo) => d.id === parseInt(departureId)
      );

      if (dep) {
        setDeparture(dep);
      } else {
        showToast('Không tìm thấy ngày khởi hành', 'error');
        navigate(`/tours/${id}`);
      }
    } catch (error) {
      console.error('Error loading tour:', error);
      showToast('Không thể tải thông tin tour', 'error');
      navigate('/tours');
    } finally {
      setLoading(false);
    }
  };

  // Check authentication with proper loading handling
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Check authentication - use both context and localStorage
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const hasAuth = (isAuthenticated && user) || (storedUser && accessToken);

    if (!hasAuth) {
      const returnUrl = `/booking/new/${id}${departureId ? `?departure=${departureId}` : ''}`;
      showToast('Vui lòng đăng nhập để đặt tour', 'warning');
      navigate('/login', { state: { from: returnUrl } });
      return;
    }

    // Load tour and departure if authenticated
    loadTourAndDeparture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, departureId, isAuthenticated, user, authLoading]);

  // Initialize passengers when counts change
  useEffect(() => {
    const newPassengers: PassengerForm[] = [];

    for (let i = 0; i < soNguoiLon; i++) {
      newPassengers.push({
        ho_ten: passengers[i]?.ho_ten || '',
        ngay_sinh: passengers[i]?.ngay_sinh || '',
        loai_khach: 'nguoi_lon',
        gioi_tinh: passengers[i]?.gioi_tinh || 'nam',
        so_giay_to_tuy_thanh: passengers[i]?.so_giay_to_tuy_thanh || '',
        quoc_tich: passengers[i]?.quoc_tich || 'Việt Nam',
        ghi_chu: passengers[i]?.ghi_chu || '',
      });
    }

    for (let i = 0; i < soTreEm; i++) {
      const idx = soNguoiLon + i;
      newPassengers.push({
        ho_ten: passengers[idx]?.ho_ten || '',
        ngay_sinh: passengers[idx]?.ngay_sinh || '',
        loai_khach: 'tre_em',
        gioi_tinh: passengers[idx]?.gioi_tinh || 'nam',
        so_giay_to_tuy_thanh: passengers[idx]?.so_giay_to_tuy_thanh || '',
        quoc_tich: passengers[idx]?.quoc_tich || 'Việt Nam',
        ghi_chu: passengers[idx]?.ghi_chu || '',
      });
    }

    setPassengers(newPassengers);
  }, [soNguoiLon, soTreEm]);

  // Step 1: Hold seat
  const handleHoldSeat = async () => {
    if (!departure) return;

    // Check authentication before holding seat
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const hasAuth = (isAuthenticated && user) || (storedUser && accessToken);

    if (!hasAuth) {
      const returnUrl = `/booking/new/${id}${departureId ? `?departure=${departureId}` : ''}`;
      showToast('Vui lòng đăng nhập để đặt tour', 'warning');
      navigate('/login', { state: { from: returnUrl } });
      return;
    }

    const availableSeats = departure.suc_chua - departure.so_cho_da_dat;
    const totalPeople = soNguoiLon + soTreEm;

    if (totalPeople > availableSeats) {
      setInsufficientSeatsMessage(`Không đủ chỗ trống. Hiện chỉ còn ${availableSeats} chỗ.`);
      setShowInsufficientSeatsModal(true);
      return;
    }

    if (totalPeople === 0) {
      showToast('Vui lòng chọn ít nhất 1 người', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await bookingService.holdSeat({
        khoi_hanh_id: departure.id,
        so_nguoi_lon: soNguoiLon,
        so_tre_em: soTreEm,
      });
      setSeatHeld(true);
      setStep('passengers');
      showToast('Đã giữ chỗ thành công!', 'success');
    } catch (error: any) {
      console.error('Error holding seat:', error);
      
      // Handle 401 Unauthorized
      if (error?.response?.status === 401) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại', 'warning');
        const returnUrl = `/booking/new/${id}${departureId ? `?departure=${departureId}` : ''}`;
        navigate('/login', { state: { from: returnUrl } });
      } else if (error?.response?.status === 409 || error?.response?.data?.so_cho_trong !== undefined) {
        const soChoTrong = error?.response?.data?.so_cho_trong;
        const soChoYeuCau = error?.response?.data?.so_cho_yeu_cau;
        if (soChoTrong !== undefined && soChoYeuCau !== undefined) {
          setInsufficientSeatsMessage(
            `Không đủ chỗ trống. Yêu cầu ${soChoYeuCau} chỗ nhưng chỉ còn ${soChoTrong} chỗ.`
          );
        } else {
          setInsufficientSeatsMessage(error?.response?.data?.error || 'Không đủ chỗ trống cho số lượng đã chọn.');
        }
        setShowInsufficientSeatsModal(true);
      } else {
        showToast(error.response?.data?.error || 'Không thể giữ chỗ', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Validate passengers
  const validatePassengers = (): boolean => {
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.ho_ten.trim()) {
        showToast(`Vui lòng nhập họ tên hành khách ${i + 1}`, 'error');
        setExpandedPassenger(i);
        return false;
      }
      if (!p.ngay_sinh) {
        showToast(`Vui lòng nhập ngày sinh hành khách ${i + 1}`, 'error');
        setExpandedPassenger(i);
        return false;
      }
    }
    return true;
  };

  // Go to payment step
  const handleToPayment = () => {
    if (!validatePassengers()) return;
    setStep('payment');
  };

  // Step 2 & 3: Create booking and add passengers
  const handleConfirmBooking = async () => {
    if (!departure || !tour) return;

    // Check authentication before creating booking
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const hasAuth = (isAuthenticated && user) || (storedUser && accessToken);

    if (!hasAuth) {
      const returnUrl = `/booking/new/${id}${departureId ? `?departure=${departureId}` : ''}`;
      showToast('Vui lòng đăng nhập để đặt tour', 'warning');
      navigate('/login', { state: { from: returnUrl } });
      return;
    }

    if (!validatePassengers()) return;

    try {
      setSubmitting(true);

      // Create booking
      const bookingResult = await bookingService.createBooking({
        khoi_hanh_id: departure.id,
        so_nguoi_lon: soNguoiLon,
        so_tre_em: soTreEm,
        phuong_thuc_thanh_toan: paymentMethod,
      });

      console.log('Booking result:', bookingResult);
      
      // Validate booking result
      if (!bookingResult || !bookingResult.booking) {
        throw new Error('Không nhận được thông tin booking từ server');
      }

      const newBookingId = bookingResult.booking.id;
      
      // Validate booking ID
      if (!newBookingId || newBookingId === undefined || newBookingId === null) {
        console.error('Invalid booking ID:', newBookingId);
        console.error('Full booking result:', bookingResult);
        throw new Error('Không nhận được ID booking từ server');
      }

      console.log('Created booking with ID:', newBookingId);
      setBookingId(newBookingId);

      // Lưu thông tin passengers vào localStorage để sử dụng ở trang payment
      // Passengers sẽ được thêm vào booking ở trang payment sau khi user xác nhận
      const passengerData: Passenger[] = passengers.map((p) => ({
        dat_cho_id: newBookingId,
        ho_ten: p.ho_ten,
        ngay_sinh: p.ngay_sinh,
        loai_khach: p.loai_khach,
        gioi_tinh: p.gioi_tinh,
        so_giay_to_tuy_thanh: p.so_giay_to_tuy_thanh || undefined,
        quoc_tich: p.quoc_tich || undefined,
        ghi_chu: p.ghi_chu || undefined,
      }));
      
      localStorage.setItem(`booking_${newBookingId}_passengers`, JSON.stringify(passengerData));
      
      // Lưu payment method vào localStorage để sử dụng ở trang payment
      localStorage.setItem(`booking_${newBookingId}_payment_method`, paymentMethod);

      // Redirect to payment page (passengers sẽ được thêm ở đó)
      console.log('Redirecting to payment page:', `/payment/${newBookingId}`);
      navigate(`/payment/${newBookingId}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      // Handle 401 Unauthorized
      if (error?.response?.status === 401) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại', 'warning');
        const returnUrl = `/booking/new/${id}${departureId ? `?departure=${departureId}` : ''}`;
        navigate('/login', { state: { from: returnUrl } });
      } else {
        showToast(error.response?.data?.error || 'Có lỗi xảy ra khi đặt tour', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updatePassenger = (index: number, field: keyof PassengerForm, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const calculateTotal = () => {
    if (!tour) return 0;
    return soNguoiLon * tour.gia_nguoi_lon + soTreEm * tour.gia_tre_em;
  };

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030712]">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  const getMainImage = () => {
    if (!tour?.hinh_anh?.length) return 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800';
    const main = tour.hinh_anh.find((img) => img.la_anh_chinh);
    return main?.duong_dan || tour.hinh_anh[0]?.duong_dan || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800';
  };

  // Show loading while checking authentication or loading tour data
  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030712]">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  // Check authentication after loading
  const storedUserCheck = localStorage.getItem('user');
  const accessTokenCheck = localStorage.getItem('accessToken');
  const hasAuth = (isAuthenticated && user) || (storedUserCheck && accessTokenCheck);
  
  if (!hasAuth) {
    return null; // Will redirect in useEffect
  }

  if (!tour || !departure) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thông tin</h1>
            <button onClick={() => navigate('/tours')} className="btn-primary">
              Quay lại danh sách tour
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const stepIndex = ['select', 'passengers', 'payment', 'complete'].indexOf(step);

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#0a0f1a]">
        {/* Hero Header with Background Image */}
        <div className="relative h-72 overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${getMainImage()})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0a0f1a]" />
          
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute top-10 right-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
          
          <div className="relative container mx-auto px-4 pt-8">
            <button
              onClick={() => navigate(`/tours/${id}`)}
              className="flex items-center text-white/70 hover:text-white mb-6 transition group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Quay lại chi tiết tour</span>
            </button>
            
            <div className="max-w-3xl">
              <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                Đặt tour
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {tour.tieu_de}
              </h1>
              <div className="flex items-center gap-4 text-white/70">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {tour.so_ngay} ngày {tour.so_dem} đêm
                </span>
                <span className="w-1 h-1 bg-white/50 rounded-full" />
                <span>{formatDate(departure.ngay_khoi_hanh)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="sticky top-0 z-20 bg-[#0a0f1a]/95 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4 max-w-3xl mx-auto">
              {[
                { key: 'select', label: 'Số lượng', icon: '👥' },
                { key: 'passengers', label: 'Hành khách', icon: '📝' },
                { key: 'payment', label: 'Thanh toán', icon: '💳' },
                { key: 'complete', label: 'Hoàn tất', icon: '✨' },
              ].map((s, idx) => (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`relative flex items-center justify-center w-12 h-12 rounded-2xl text-lg transition-all duration-500 ${
                        stepIndex === idx
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-110'
                          : stepIndex > idx
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 text-white/40'
                      }`}
                    >
                      {stepIndex > idx ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span>{s.icon}</span>
                      )}
                      {stepIndex === idx && (
                        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping" />
                      )}
                    </div>
                    <span className={`mt-2 text-xs font-medium transition-colors ${
                      stepIndex >= idx ? 'text-white' : 'text-white/40'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {idx < 3 && (
                    <div className="flex-1 h-0.5 mx-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-700 ${
                          stepIndex > idx ? 'w-full' : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Select passengers */}
              {step === 'select' && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                      👥
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Chọn số lượng hành khách</h2>
                      <p className="text-white/60">Chọn số người tham gia tour</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Adults */}
                    <div className="group relative bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 hover:border-amber-500/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">🧑</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">Người lớn</h3>
                            <p className="text-white/50 text-sm">Từ 12 tuổi trở lên</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-400 font-bold text-lg">
                            {formatCurrency(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
                          </p>
                          <p className="text-white/40 text-xs">/người</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-4 mt-4">
                        <button
                          onClick={() => setSoNguoiLon(Math.max(1, soNguoiLon - 1))}
                          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-16 text-center text-3xl font-bold text-white">{soNguoiLon}</span>
                        <button
                          onClick={() => setSoNguoiLon(soNguoiLon + 1)}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/30"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="group relative bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-2xl">👧</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">Trẻ em</h3>
                            <p className="text-white/50 text-sm">Từ 2 - 11 tuổi</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold text-lg">
                            {formatCurrency(tour.gia_tre_em, tour.don_vi_tien_te)}
                          </p>
                          <p className="text-white/40 text-xs">/trẻ</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-4 mt-4">
                        <button
                          onClick={() => setSoTreEm(Math.max(0, soTreEm - 1))}
                          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-16 text-center text-3xl font-bold text-white">{soTreEm}</span>
                        <button
                          onClick={() => setSoTreEm(soTreEm + 1)}
                          className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Availability Info */}
                    <div className="flex items-center gap-3 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-cyan-300 font-medium">Còn {departure.suc_chua - departure.so_cho_da_dat} chỗ trống</p>
                        <p className="text-cyan-400/60 text-sm">trên tổng số {departure.suc_chua} chỗ</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleHoldSeat}
                    disabled={submitting}
                    className="relative w-full mt-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] text-white font-bold py-5 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:bg-[position:100%_0] overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {submitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Đang giữ chỗ...
                        </>
                      ) : (
                        <>
                          Giữ chỗ ngay
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              )}

              {/* Step 2: Passenger Details */}
              {step === 'passengers' && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                      📝
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Thông tin hành khách</h2>
                      <p className="text-white/60">Điền thông tin cho {passengers.length} hành khách</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {passengers.map((passenger, index) => (
                      <div
                        key={index}
                        className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                          expandedPassenger === index
                            ? 'bg-white/10 border-amber-500/30'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Header - Always visible */}
                        <button
                          onClick={() => setExpandedPassenger(expandedPassenger === index ? -1 : index)}
                          className="w-full flex items-center justify-between p-5"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${
                              passenger.loai_khach === 'nguoi_lon' 
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                                : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                            }`}>
                              {index + 1}
                            </div>
                            <div className="text-left">
                              <h3 className="font-semibold text-white">
                                {passenger.ho_ten || `Hành khách ${index + 1}`}
                              </h3>
                              <p className="text-white/50 text-sm">
                                {passenger.loai_khach === 'nguoi_lon' ? 'Người lớn' : 'Trẻ em'}
                                {passenger.ngay_sinh && ` • ${passenger.ngay_sinh}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {passenger.ho_ten && passenger.ngay_sinh && (
                              <span className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                            <svg 
                              className={`w-5 h-5 text-white/50 transition-transform duration-300 ${expandedPassenger === index ? 'rotate-180' : ''}`} 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded Form */}
                        {expandedPassenger === index && (
                          <div className="px-5 pb-5 space-y-4 animate-fade-in">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                  Họ và tên <span className="text-rose-400">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={passenger.ho_ten}
                                  onChange={(e) => updatePassenger(index, 'ho_ten', e.target.value)}
                                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                  placeholder="Nhập họ và tên đầy đủ"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">
                                  Ngày sinh <span className="text-rose-400">*</span>
                                </label>
                                <input
                                  type="date"
                                  value={passenger.ngay_sinh}
                                  onChange={(e) => updatePassenger(index, 'ngay_sinh', e.target.value)}
                                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all [color-scheme:dark]"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Giới tính</label>
                                <select
                                  value={passenger.gioi_tinh}
                                  onChange={(e) => updatePassenger(index, 'gioi_tinh', e.target.value)}
                                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                >
                                  <option value="nam" className="bg-gray-900">Nam</option>
                                  <option value="nu" className="bg-gray-900">Nữ</option>
                                  <option value="khac" className="bg-gray-900">Khác</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Quốc tịch</label>
                                <input
                                  type="text"
                                  value={passenger.quoc_tich}
                                  onChange={(e) => updatePassenger(index, 'quoc_tich', e.target.value)}
                                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                  placeholder="Việt Nam"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Số CMND/CCCD/Hộ chiếu</label>
                                <input
                                  type="text"
                                  value={passenger.so_giay_to_tuy_thanh}
                                  onChange={(e) => updatePassenger(index, 'so_giay_to_tuy_thanh', e.target.value)}
                                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                  placeholder="Nhập số giấy tờ"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-white/70 mb-2">Ghi chú đặc biệt</label>
                                <input
                                  type="text"
                                  value={passenger.ghi_chu}
                                  onChange={(e) => updatePassenger(index, 'ghi_chu', e.target.value)}
                                  className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                  placeholder="VD: Dị ứng thực phẩm, yêu cầu đặc biệt..."
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => setStep('select')}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-4 px-6 rounded-xl transition-all border border-white/10"
                    >
                      ← Quay lại
                    </button>
                    <button
                      onClick={handleToPayment}
                      className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
                    >
                      Tiếp tục thanh toán →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 'payment' && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-amber-500/30">
                      💳
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Phương thức thanh toán</h2>
                      <p className="text-white/60">Chọn cách thanh toán phù hợp</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { id: 'stripe', name: 'Thẻ quốc tế', icon: '💳', desc: 'Visa, Mastercard, JCB', gradient: 'from-blue-500 to-indigo-600' },
                      { id: 'vnpay', name: 'VNPay', icon: '🏦', desc: 'Ví điện tử & ATM nội địa', gradient: 'from-red-500 to-rose-600' },
                      { id: 'momo', name: 'MoMo', icon: '📱', desc: 'Thanh toán qua ví MoMo', gradient: 'from-pink-500 to-rose-500' },
                      { id: 'bank_transfer', name: 'Chuyển khoản', icon: '🏛️', desc: 'Chuyển khoản ngân hàng', gradient: 'from-emerald-500 to-teal-600' },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`relative flex items-center p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                          paymentMethod === method.id
                            ? 'bg-white/10 border-amber-500/50 shadow-lg shadow-amber-500/10'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center text-2xl mr-4 shadow-lg`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{method.name}</h3>
                          <p className="text-white/50 text-sm">{method.desc}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          paymentMethod === method.id 
                            ? 'border-amber-500 bg-amber-500' 
                            : 'border-white/30'
                        }`}>
                          {paymentMethod === method.id && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Terms */}
                  <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-white/10">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-amber-500 focus:ring-amber-500/50"
                      />
                      <span className="text-white/70 text-sm leading-relaxed">
                        Tôi đã đọc và đồng ý với{' '}
                        <a href="/terms" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">Điều khoản sử dụng</a>,{' '}
                        <a href="/privacy" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">Chính sách bảo mật</a> và{' '}
                        <a href="/refund" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">Chính sách hoàn hủy</a>
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => setStep('passengers')}
                      className="flex-1 bg-white/10 hover:bg-white/15 text-white font-bold py-4 px-6 rounded-xl transition-all border border-white/10"
                    >
                      ← Quay lại
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      disabled={submitting}
                      className="flex-[2] relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-[length:200%_100%] text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:bg-[position:100%_0] group"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Đang xử lý...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Xác nhận • {formatCurrency(calculateTotal(), tour.don_vi_tien_te)}
                          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Complete */}
              {step === 'complete' && (
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/10 shadow-2xl animate-fade-in">
                  {/* Confetti effect */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full animate-bounce"
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          backgroundColor: ['#fbbf24', '#22c55e', '#3b82f6', '#ec4899'][i % 4],
                          animationDelay: `${Math.random() * 2}s`,
                          animationDuration: `${2 + Math.random() * 2}s`,
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30 animate-scale-in">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    
                    <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Đặt tour thành công!
                    </h2>
                    
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full mb-6">
                      <span className="text-white/70">Mã đơn đặt:</span>
                      <span className="text-amber-400 font-mono font-bold text-lg">#{bookingId}</span>
                    </div>
                    
                    <p className="text-white/60 mb-8 max-w-md mx-auto">
                      Cảm ơn bạn đã đặt tour! Email xác nhận đã được gửi đến địa chỉ email của bạn. 
                      Chúng tôi sẽ liên hệ trong thời gian sớm nhất.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => navigate('/my-bookings')}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Xem đơn đặt của tôi
                      </button>
                      <button
                        onClick={() => navigate('/tours')}
                        className="bg-white/10 hover:bg-white/15 text-white font-bold py-4 px-8 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Khám phá thêm tour
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl">
                {/* Tour Preview */}
                <div className="relative h-40 rounded-2xl overflow-hidden mb-6">
                  <img
                    src={getMainImage()}
                    alt={tour.tieu_de}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="font-bold text-white text-lg line-clamp-2">{tour.tieu_de}</h4>
                    <p className="text-white/70 text-sm">{tour.so_ngay} ngày {tour.so_dem} đêm</p>
                  </div>
                </div>

                {/* Departure Info */}
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider">Ngày khởi hành</p>
                    <p className="text-white font-bold">{formatDate(departure.ngay_khoi_hanh)}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">Người lớn</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded-md text-white/80 text-sm">x{soNguoiLon}</span>
                    </div>
                    <span className="text-white font-medium">{formatCurrency(soNguoiLon * tour.gia_nguoi_lon, tour.don_vi_tien_te)}</span>
                  </div>
                  {soTreEm > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-white/60">Trẻ em</span>
                        <span className="px-2 py-0.5 bg-white/10 rounded-md text-white/80 text-sm">x{soTreEm}</span>
                      </div>
                      <span className="text-white font-medium">{formatCurrency(soTreEm * tour.gia_tre_em, tour.don_vi_tien_te)}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 font-medium">Tổng cộng</span>
                    <span className="text-3xl font-bold text-amber-400">
                      {formatCurrency(calculateTotal(), tour.don_vi_tien_te)}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                {seatHeld && step !== 'complete' && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-emerald-300 font-medium text-sm">Đã giữ chỗ thành công</p>
                      <p className="text-emerald-400/60 text-xs">Hoàn tất đặt tour trong 15 phút</p>
                    </div>
                  </div>
                )}

                {/* Support */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-white/50 text-sm mb-3">Cần hỗ trợ?</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold">1900 1234</p>
                      <p className="text-white/50 text-xs">Hỗ trợ 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showInsufficientSeatsModal}
        onClose={() => setShowInsufficientSeatsModal(false)}
        showCloseButton={false}
      >
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Không đủ chỗ trống</h3>
          <p className="text-slate-300 mb-6">{insufficientSeatsMessage}</p>
          <button
            onClick={() => setShowInsufficientSeatsModal(false)}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
};
