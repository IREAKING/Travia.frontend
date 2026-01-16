import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService } from '../../services/paymentService';
import { bookingService } from '../../services/bookingService';

interface PaymentFormData {
  // Passenger Information
  passengers: {
    ho_ten: string;
    ngay_sinh: string;
    loai_khach: 'nguoi_lon' | 'tre_em' | 'em_be';
    gioi_tinh: string;
    so_ho_chieu: string;
    quoc_tich: string;
    ghi_chu?: string;
  }[];
  
  // Payment Information
  phuong_thuc_thanh_toan: 'stripe_card' | 'paypal' | 'vnpay' | 'momo' | 'bank_transfer' | 'cash';
  card_number?: string;
  card_expiry?: string;
  card_cvv?: string;
  card_name?: string;
  
  // Contact Information
  email: string;
  so_dien_thoai: string;
  dia_chi: string;
  
  // Additional Info
  ghi_chu_dac_biet?: string;
  dieu_khoan: boolean;
}

export const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [formData, setFormData] = useState<PaymentFormData>({
    passengers: [],
    phuong_thuc_thanh_toan: 'stripe_card',
    email: '',
    so_dien_thoai: '',
    dia_chi: '',
    dieu_khoan: false
  });

  // Redirect to login if not authenticated (only after auth loading is complete)
  // NOTE: Disabled automatic redirect to allow form submission to handle it
  // useEffect(() => {
  //   // Wait for auth to finish loading before checking
  //   if (!authLoading) {
  //     // Check both context and localStorage as fallback
  //     const storedUser = localStorage.getItem('user');
  //     const hasUser = (isAuthenticated && user) || storedUser;
  //     
  //     if (!hasUser) {
  //       console.log('No user found, redirecting to login');
  //       showToast('Vui lòng đăng nhập để thanh toán', 'warning');
  //       navigate('/login', { state: { from: `/payment/${id}` } });
  //     } else {
  //       console.log('User authenticated, allowing payment');
  //     }
  //   }
  // }, [authLoading, isAuthenticated, user, navigate, id, showToast]);

  useEffect(() => {
    if (id) {
      loadBookingData();
    }
  }, [id]);

  const loadBookingData = async () => {
    try {
      if (!id) return;
      
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        showToast('Mã đặt tour không hợp lệ', 'error');
        return;
      }

      console.log('Loading booking data for ID:', bookingId);

      // Load booking từ API
      const booking = await bookingService.getBookingById(bookingId);
      console.log('Booking loaded:', booking);
      setBookingData(booking);
      
      // Load passengers từ localStorage (đã lưu ở Booking.tsx)
      const savedPassengers = localStorage.getItem(`booking_${bookingId}_passengers`);
      let passengers: PaymentFormData['passengers'] = [];
      
      if (savedPassengers) {
        try {
          const parsedPassengers = JSON.parse(savedPassengers);
          // Convert từ format của Booking.tsx sang format của Payment.tsx
          passengers = parsedPassengers.map((p: any) => ({
            ho_ten: p.ho_ten || '',
            ngay_sinh: p.ngay_sinh || '',
            loai_khach: (p.loai_khach === 'nguoi_lon' ? 'nguoi_lon' : p.loai_khach === 'tre_em' ? 'tre_em' : 'em_be') as 'nguoi_lon' | 'tre_em' | 'em_be',
            gioi_tinh: p.gioi_tinh || '',
            so_ho_chieu: p.so_giay_to_tuy_thanh || '',
            quoc_tich: p.quoc_tich || 'Vietnam',
            ghi_chu: p.ghi_chu || ''
          }));
          console.log('Loaded passengers from localStorage:', passengers);
        } catch (error) {
          console.error('Error parsing saved passengers:', error);
        }
      }
      
      // Load payment method từ localStorage (đã chọn ở Booking.tsx)
      const savedPaymentMethod = localStorage.getItem(`booking_${bookingId}_payment_method`);
      // Map payment method từ Booking.tsx sang Payment.tsx format
      let paymentMethod = savedPaymentMethod || booking?.phuong_thuc_thanh_toan || 'stripe_card';
      // Map 'stripe' từ Booking.tsx sang 'stripe_card' cho Payment.tsx
      if (paymentMethod === 'stripe') {
        paymentMethod = 'stripe_card';
      }
      
      // Nếu không có passengers từ localStorage, tạo mới dựa trên booking
      if (passengers.length === 0 && booking) {
        const soNguoiLon = booking.so_nguoi_lon || 0;
        const soTreEm = booking.so_tre_em || 0;
        
        for (let i = 0; i < soNguoiLon; i++) {
          passengers.push({
            ho_ten: '',
            ngay_sinh: '',
            loai_khach: 'nguoi_lon' as const,
            gioi_tinh: '',
            so_ho_chieu: '',
            quoc_tich: 'Vietnam',
            ghi_chu: ''
          });
        }
        for (let i = 0; i < soTreEm; i++) {
          passengers.push({
            ho_ten: '',
            ngay_sinh: '',
            loai_khach: 'tre_em' as const,
            gioi_tinh: '',
            so_ho_chieu: '',
            quoc_tich: 'Vietnam',
            ghi_chu: ''
          });
        }
        console.log('Created default passengers based on booking:', passengers);
      }
      
      setFormData(prev => ({
        ...prev,
        passengers,
        phuong_thuc_thanh_toan: paymentMethod as any,
        email: booking?.email || user?.email || '',
        so_dien_thoai: booking?.so_dien_thoai || user?.phone || ''
      }));
    } catch (error: any) {
      console.error('Error loading booking data:', error);
      if (error?.response?.status === 404) {
        showToast('Không tìm thấy thông tin đặt tour', 'error');
        navigate('/tours');
      } else {
        showToast('Không thể tải thông tin đặt tour', 'error');
      }
    }
  };

  const handlePassengerChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      passengers: prev.passengers.map((passenger, i) => 
        i === index ? { ...passenger, [field]: value } : passenger
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Wait for auth to finish loading
    if (authLoading) {
      showToast('Đang kiểm tra đăng nhập...', 'info');
      return;
    }
    
    // Check authentication - prioritize localStorage as it's more reliable
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    
    console.log('=== PAYMENT SUBMIT AUTH CHECK ===');
    console.log('authLoading:', authLoading);
    console.log('user from context:', user);
    console.log('storedUser:', storedUser ? 'exists' : 'missing');
    console.log('accessToken:', accessToken ? 'exists' : 'missing');
    
    // More lenient check: if we have accessToken, we're authenticated
    // Even if context hasn't updated yet
    if (!accessToken) {
      console.log('❌ No accessToken found, redirecting to login');
      showToast('Vui lòng đăng nhập để thanh toán', 'warning');
      navigate('/login', { state: { from: `/payment/${id}` } });
      return;
    }
    
    // If we have token but no user in context, try to parse from localStorage
    if (!user && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser || !parsedUser.id || !parsedUser.email) {
          console.log('❌ Invalid user data in localStorage');
          showToast('Vui lòng đăng nhập lại', 'warning');
          navigate('/login', { state: { from: `/payment/${id}` } });
          return;
        }
        console.log('✅ User data parsed from localStorage');
      } catch (error) {
        console.error('❌ Failed to parse stored user:', error);
        showToast('Vui lòng đăng nhập lại', 'warning');
        navigate('/login', { state: { from: `/payment/${id}` } });
        return;
      }
    }
    
    console.log('✅ Authentication check passed, proceeding with payment');
    
    if (!formData.dieu_khoan) {
      showToast('Vui lòng đồng ý với điều khoản và điều kiện', 'error');
      return;
    }

    if (formData.passengers.some(p => !p.ho_ten || !p.ngay_sinh)) {
      showToast('Vui lòng điền đầy đủ thông tin hành khách', 'error');
      return;
    }

    setLoading(true);
    try {
      // First, add passengers to booking
      if (!id) {
        showToast('Không tìm thấy thông tin đặt tour', 'error');
        return;
      }

      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        showToast('Mã đặt tour không hợp lệ', 'error');
        return;
      }

      // Convert passengers to the format expected by backend
      const passengersToAdd = formData.passengers.map(p => {
        // Map loai_khach: 'em_be' -> 'tre_em' (backend doesn't support 'em_be')
        let loaiKhach: 'nguoi_lon' | 'tre_em' = p.loai_khach === 'em_be' ? 'tre_em' : 
          (p.loai_khach === 'nguoi_lon' ? 'nguoi_lon' : 'tre_em');
        
        // Map gioi_tinh from Payment format to backend format
        let gioiTinh: 'nam' | 'nu' | 'khac' | undefined = undefined;
        if (p.gioi_tinh) {
          if (p.gioi_tinh.toLowerCase() === 'nam') gioiTinh = 'nam';
          else if (p.gioi_tinh.toLowerCase() === 'nữ' || p.gioi_tinh.toLowerCase() === 'nu') gioiTinh = 'nu';
          else gioiTinh = 'khac';
        }

        return {
          dat_cho_id: bookingId,
          ho_ten: p.ho_ten,
          ngay_sinh: p.ngay_sinh,
          loai_khach: loaiKhach,
          gioi_tinh: gioiTinh,
          so_giay_to_tuy_thanh: p.so_ho_chieu || undefined,
          quoc_tich: p.quoc_tich || undefined,
          ghi_chu: p.ghi_chu || undefined,
        };
      });

      console.log('Adding passengers to booking:', passengersToAdd);
      
      // Add passengers to booking
      try {
        await bookingService.addPassengers(passengersToAdd);
        console.log('Passengers added successfully');
        showToast('Đã cập nhật thông tin hành khách', 'success');
      } catch (passengerError: any) {
        console.error('Error adding passengers:', passengerError);
        // If passengers already exist or other error, log but continue with payment
        if (passengerError?.response?.status !== 400) {
          showToast('Có lỗi khi cập nhật thông tin hành khách, nhưng vẫn tiếp tục thanh toán', 'warning');
        }
        // Continue with payment even if adding passengers fails (might already be added)
      }

      // Process payment based on method
      if (formData.phuong_thuc_thanh_toan === 'vnpay') {
        // Handle VNPay payment
        await processVNPayPayment();
      } else if (formData.phuong_thuc_thanh_toan === 'stripe_card') {
        // Handle Stripe payment
        await processStripePayment();
      } else if (formData.phuong_thuc_thanh_toan === 'paypal') {
        // Handle PayPal payment
        await processPayPalPayment();
      } else {
        // Handle other payment methods
        await processOtherPayment();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Handle 401 Unauthorized
      if (error?.response?.status === 401) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại', 'warning');
        navigate('/login', { state: { from: `/payment/${id}` } });
      } else {
        const errorMessage = error?.response?.data?.error || 'Có lỗi xảy ra khi thanh toán';
        showToast(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
      setProcessingPayment(false);
    }
  };

  const processVNPayPayment = async () => {
    if (!id) {
      showToast('Không tìm thấy thông tin đặt tour', 'error');
      return;
    }

    try {
      setProcessingPayment(true);
      showToast('Đang tạo liên kết thanh toán VNPay...', 'info');
      
      // Get booking ID from URL or bookingData
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        showToast('Mã đặt tour không hợp lệ', 'error');
        return;
      }
      
      const response = await paymentService.createVNPayPayment(bookingId);
      console.log('VNPay payment response:', response);
      
      if (!response || !response.payment_url) {
        throw new Error('Không nhận được payment URL từ server');
      }
      
      // Redirect to VNPay
      paymentService.redirectToVNPay(response.payment_url);
    } catch (error: any) {
      console.error('VNPay payment error:', error);
      
      // Handle 401 Unauthorized
      if (error?.response?.status === 401) {
        showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại', 'warning');
        navigate('/login', { state: { from: `/payment/${id}` } });
      } else {
        const errorMessage = error?.response?.data?.error || 'Không thể tạo liên kết thanh toán VNPay';
        showToast(errorMessage, 'error');
        throw error;
      }
    }
  };

  const processStripePayment = async () => {
    // Implement Stripe payment processing
    showToast('Đang xử lý thanh toán...', 'info');
    // Redirect to success page
    navigate('/payment/success');
  };

  const processPayPalPayment = async () => {
    // Implement PayPal payment processing
    showToast('Đang chuyển hướng đến PayPal...', 'info');
    // Redirect to success page
    navigate('/payment/success');
  };

  const processOtherPayment = async () => {
    // Implement other payment methods
    showToast('Đang xử lý thanh toán...', 'info');
    // Redirect to success page
    navigate('/payment/success');
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!bookingData) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#030712] flex items-center justify-center relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-[180px] animate-pulse" />
            <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative z-10 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Không tìm thấy thông tin đặt tour</h1>
            <a href="/tours" className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all">
              Quay lại trang tours
            </a>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#030712] py-12 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }} 
          />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-4">
                💳 Thanh toán an toàn
              </span>
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Thanh toán
                </span>
              </h1>
              <p className="text-xl text-slate-400">Hoàn tất đặt tour của bạn</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Payment Form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Passenger Information */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center text-xl">
                        👤
                      </span>
                      Thông tin hành khách
                    </h2>
                    <div className="space-y-6">
                      {formData.passengers.map((passenger, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-cyan-500/30 transition-all">
                          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            {passenger.loai_khach === 'nguoi_lon' ? 'Người lớn' : 
                             passenger.loai_khach === 'tre_em' ? 'Trẻ em' : 'Em bé'}
                          </h3>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">
                                Họ và tên <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={passenger.ho_ten}
                                onChange={(e) => handlePassengerChange(index, 'ho_ten', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                placeholder="Nhập họ và tên"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">
                                Ngày sinh <span className="text-rose-400">*</span>
                              </label>
                              <input
                                type="date"
                                required
                                value={passenger.ngay_sinh}
                                onChange={(e) => handlePassengerChange(index, 'ngay_sinh', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all [color-scheme:dark]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">
                                Giới tính
                              </label>
                              <select
                                value={passenger.gioi_tinh}
                                onChange={(e) => handlePassengerChange(index, 'gioi_tinh', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                              >
                                <option value="" className="bg-gray-900">Chọn giới tính</option>
                                <option value="Nam" className="bg-gray-900">Nam</option>
                                <option value="Nữ" className="bg-gray-900">Nữ</option>
                                <option value="Khác" className="bg-gray-900">Khác</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">
                                Số hộ chiếu/CMND
                              </label>
                              <input
                                type="text"
                                value={passenger.so_ho_chieu}
                                onChange={(e) => handlePassengerChange(index, 'so_ho_chieu', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                placeholder="Nhập số hộ chiếu/CMND"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/70 mb-2">
                                Quốc tịch
                              </label>
                              <input
                                type="text"
                                value={passenger.quoc_tich}
                                onChange={(e) => handlePassengerChange(index, 'quoc_tich', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                placeholder="Nhập quốc tịch"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-white/70 mb-2">
                                Ghi chú đặc biệt
                              </label>
                              <textarea
                                value={passenger.ghi_chu || ''}
                                onChange={(e) => handlePassengerChange(index, 'ghi_chu', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                                rows={3}
                                placeholder="Dị ứng thức ăn, yêu cầu đặc biệt..."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl">
                        📧
                      </span>
                      Thông tin liên hệ
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Email <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Số điện thoại <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.so_dien_thoai}
                          onChange={(e) => setFormData(prev => ({ ...prev, so_dien_thoai: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          placeholder="0123456789"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-white/70 mb-2">
                          Địa chỉ
                        </label>
                        <textarea
                          value={formData.dia_chi}
                          onChange={(e) => setFormData(prev => ({ ...prev, dia_chi: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          rows={3}
                          placeholder="Nhập địa chỉ của bạn"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method - Chỉ hiển thị, không cho chọn lại */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <span className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-xl">
                        💳
                      </span>
                      Phương thức thanh toán
                    </h2>
                    <div className="p-6 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-2 border-cyan-500/30 rounded-xl backdrop-blur-sm">
                      <div className="flex items-center gap-4">
                        {(() => {
                          const paymentMethods = {
                            'stripe': { label: 'Thẻ quốc tế', icon: '💳', desc: 'Visa, Mastercard, JCB', gradient: 'from-blue-500 to-indigo-600' },
                            'stripe_card': { label: 'Thẻ tín dụng/ghi nợ', icon: '💳', desc: 'Visa, Mastercard, JCB', gradient: 'from-blue-500 to-indigo-600' },
                            'paypal': { label: 'PayPal', icon: '🅿️', desc: 'Thanh toán qua PayPal', gradient: 'from-blue-500 to-cyan-600' },
                            'vnpay': { label: 'VNPay', icon: '🏦', desc: 'Ví điện tử & ATM nội địa', gradient: 'from-red-500 to-rose-600' },
                            'momo': { label: 'MoMo', icon: '📱', desc: 'Thanh toán qua ví MoMo', gradient: 'from-pink-500 to-rose-500' },
                            'bank_transfer': { label: 'Chuyển khoản ngân hàng', icon: '🏧', desc: 'Chuyển khoản ngân hàng', gradient: 'from-emerald-500 to-teal-600' },
                            'cash': { label: 'Thanh toán tại chỗ', icon: '💵', desc: 'Thanh toán khi nhận tour', gradient: 'from-amber-500 to-orange-500' }
                          };
                          const method = paymentMethods[formData.phuong_thuc_thanh_toan as keyof typeof paymentMethods] || paymentMethods['stripe_card'];
                          return (
                            <>
                              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                                {method.icon}
                    </div>
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">{method.label}</h3>
                                <p className="text-white/70 text-sm mt-1">{method.desc}</p>
                          </div>
                              <div className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 rounded-lg backdrop-blur-sm">
                                <span className="text-cyan-300 font-semibold text-sm">Đã chọn</span>
                          </div>
                            </>
                          );
                        })()}
                      </div>
                      <p className="mt-4 text-sm text-white/60">
                        Phương thức thanh toán này đã được chọn ở bước trước. Nếu cần thay đổi, vui lòng quay lại trang đặt tour.
                      </p>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={formData.dieu_khoan}
                        onChange={(e) => setFormData(prev => ({ ...prev, dieu_khoan: e.target.checked }))}
                        className="w-5 h-5 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0 focus:ring-offset-transparent bg-white/10 border-white/30 rounded mt-1"
                      />
                      <label htmlFor="terms" className="ml-3 text-sm text-white/80">
                        Tôi đồng ý với{' '}
                        <a href="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
                          Điều khoản và điều kiện
                        </a>{' '}
                        và{' '}
                        <a href="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                          Chính sách bảo mật
                        </a>{' '}
                        của Travia
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <button
                      type="submit"
                      disabled={loading || processingPayment}
                      className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-[length:200%_100%] text-white font-bold py-5 px-8 rounded-xl hover:bg-[position:100%_0] transition-all duration-500 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40"
                    >
                      {loading || processingPayment ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          {formData.phuong_thuc_thanh_toan === 'vnpay' ? 'Đang tạo liên kết thanh toán...' : 'Đang xử lý...'}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span>Thanh toán {bookingData.tong_tien?.toLocaleString('vi-VN')} VND</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl sticky top-8">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-xl">
                      📋
                    </span>
                    Tóm Tắt Đặt Tour
                  </h2>
                  
                  {bookingData.tour && (
                    <div className="mb-6">
                      <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                        <img
                          src={bookingData.tour.anh || '/placeholder-tour.jpg'}
                          alt={bookingData.tour.tieu_de}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {bookingData.tour.tieu_de}
                      </h3>
                      <p className="text-white/70 mb-2">
                        {bookingData.tour.so_ngay} ngày {bookingData.tour.so_dem} đêm
                      </p>
                      <p className="text-white/70 flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Khởi hành: {new Date(bookingData.ngay_khoi_hanh).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/70">Người lớn ({bookingData.so_nguoi_lon})</span>
                      <span className="font-semibold text-white">
                        {(bookingData.so_nguoi_lon * (bookingData.gia_nguoi_lon || bookingData.gia_moi_nguoi || 0)).toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                    {bookingData.so_tre_em > 0 && (
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/70">Trẻ em ({bookingData.so_tre_em})</span>
                        <span className="font-semibold text-white">
                          {(bookingData.so_tre_em * (bookingData.gia_tre_em || bookingData.gia_moi_nguoi * 0.7 || 0)).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    )}
                    {bookingData.so_em_be > 0 && (
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-white/70">Em bé ({bookingData.so_em_be})</span>
                        <span className="font-semibold text-white">Miễn phí</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-4 mt-4">
                      <div className="flex justify-between text-lg font-bold p-3 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg border border-cyan-500/30">
                        <span className="text-white">Tổng cộng</span>
                        <span className="text-cyan-400">
                          {bookingData.tong_tien?.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-white/60 space-y-2 p-4 bg-white/5 rounded-lg">
                    <p className="flex items-center gap-2">
                      <span className="text-cyan-400">✓</span>
                      Giá đã bao gồm thuế và phí dịch vụ
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-cyan-400">✓</span>
                      Hủy miễn phí trong 24h
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-cyan-400">✓</span>
                      Hỗ trợ 24/7
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
