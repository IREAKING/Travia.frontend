import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supplierService } from '../../services/supplierService';
import { useToast } from '../../hooks/useToast';

export const RegisterPartnerPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  
  // Form data
  const [nguoiDaiDien, setNguoiDaiDien] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [ten, setTen] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [website, setWebsite] = useState('');
  const [moTa, setMoTa] = useState('');
  const [namThanhLap, setNamThanhLap] = useState('');
  const [thanhPho, setThanhPho] = useState('');
  const [quocGia, setQuocGia] = useState('');
  const [maSoThue, setMaSoThue] = useState('');
  const [soNhanVien, setSoNhanVien] = useState('');

  // File uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [giayToFile, setGiayToFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const giayToInputRef = useRef<HTMLInputElement>(null);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate image type
      if (!file.type.startsWith('image/')) {
        setError('Logo phải là file ảnh (JPEG, PNG, GIF, WebP, BMP)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Logo không được vượt quá 5MB');
        return;
      }
      setLogoFile(file);
      setError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle business license file selection
  const handleGiayToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate PDF type
      if (file.type !== 'application/pdf') {
        setError('Giấy phép kinh doanh phải là file PDF');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File giấy phép kinh doanh không được vượt quá 10MB');
        return;
      }
      setGiayToFile(file);
      setError('');
    }
  };

  // Helper function to format URL
  const formatUrl = (url: string): string => {
    if (!url.trim()) return url;
    
    // If URL doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      return `https://${url}`;
    }
    
    return url;
  };

  const validateForm = (): boolean => {
    if (!nguoiDaiDien.trim()) {
      setError('Vui lòng nhập tên người đại diện');
      return false;
    }

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (!matKhau.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }

    if (matKhau.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }

    if (matKhau !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    if (!ten.trim()) {
      setError('Vui lòng nhập tên nhà cung cấp');
      return false;
    }

    if (!namThanhLap.trim()) {
      setError('Vui lòng nhập năm thành lập');
      return false;
    }

    // Validate date format (YYYY-MM-DD)
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(namThanhLap)) {
      setError('Năm thành lập phải có định dạng YYYY-MM-DD (ví dụ: 2020-01-01)');
      return false;
    }

    // Validate website URL (optional but if provided should be valid)
    if (website && website.trim()) {
      const websiteUrl = website.trim();
      const urlPattern = /^(https?:\/\/)?([\w\-\.]+)\.([a-z]{2,})([\/\w\-\.]*)*\/?$/i;
      if (!urlPattern.test(websiteUrl)) {
        setError('URL website không hợp lệ. Ví dụ: example.com hoặc https://example.com');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create FormData
      const formDataToSend = new FormData();
      
      // Thông tin đăng nhập
      formDataToSend.append('nguoi_dai_dien', nguoiDaiDien);
      formDataToSend.append('email', email);
      formDataToSend.append('mat_khau', matKhau);
      if (soDienThoai) {
        formDataToSend.append('so_dien_thoai', soDienThoai);
      }

      // Thông tin nhà cung cấp
      formDataToSend.append('ten', ten);
      if (diaChi) {
        formDataToSend.append('dia_chi', diaChi);
      }
      if (website) {
        formDataToSend.append('website', formatUrl(website));
      }
      if (moTa) {
        formDataToSend.append('mo_ta', moTa);
      }
      formDataToSend.append('nam_thanh_lap', namThanhLap);
      if (thanhPho) {
        formDataToSend.append('thanh_pho', thanhPho);
      }
      if (quocGia) {
        formDataToSend.append('quoc_gia', quocGia);
      }
      if (maSoThue) {
        formDataToSend.append('ma_so_thue', maSoThue);
      }
      if (soNhanVien) {
        formDataToSend.append('so_nhan_vien', soNhanVien);
      }

      // File uploads
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (giayToFile) {
        formDataToSend.append('giay_to_kinh_doanh', giayToFile);
      }

      await supplierService.registerPartner(formDataToSend);
      showToast('Đăng ký đối tác thành công! Tài khoản của bạn đang chờ admin duyệt.', 'success');
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate('/supplier/login');
      }, 2000);
    } catch (err: any) {
      console.error('Error registering partner:', err);
      const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-[#030712]">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(168,85,247,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} 
        />

        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-xl hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Trang chủ</span>
      </Link>

      <div className="relative w-full max-w-4xl z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <span className="text-4xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🤝</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Travia
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-2">
            ✨ Đăng ký trở thành đối tác
          </h1>
          <p className="text-slate-400">
            Đăng ký để bắt đầu cung cấp dịch vụ du lịch trên nền tảng của chúng tôi
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start text-sm">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin đăng nhập */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Thông tin đăng nhập
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nguoi_dai_dien" className="block text-sm font-medium text-slate-300 mb-2">
                    Tên người đại diện <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="nguoi_dai_dien"
                    type="text"
                    value={nguoiDaiDien}
                    onChange={(e) => {
                      setNguoiDaiDien(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Nguyễn Văn A"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="example@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="mat_khau" className="block text-sm font-medium text-slate-300 mb-2">
                    Mật khẩu <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="mat_khau"
                      type={showPassword ? 'text' : 'password'}
                      value={matKhau}
                      onChange={(e) => {
                        setMatKhau(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-3 pr-11 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 text-white placeholder-slate-500 transition-all"
                      placeholder="Tối thiểu 8 ký tự"
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                    Xác nhận mật khẩu <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Nhập lại mật khẩu"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="so_dien_thoai" className="block text-sm font-medium text-slate-300 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    id="so_dien_thoai"
                    type="tel"
                    value={soDienThoai}
                    onChange={(e) => {
                      setSoDienThoai(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="0987654321"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Thông tin nhà cung cấp */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Thông tin công ty / nhà cung cấp
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ten" className="block text-sm font-medium text-slate-300 mb-2">
                    Tên công ty / nhà cung cấp <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ten"
                    type="text"
                    value={ten}
                    onChange={(e) => {
                      setTen(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Tên công ty/nhà cung cấp"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="nam_thanh_lap" className="block text-sm font-medium text-slate-300 mb-2">
                    Năm thành lập <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="nam_thanh_lap"
                    type="date"
                    value={namThanhLap}
                    onChange={(e) => {
                      setNamThanhLap(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500 mt-1">Định dạng: YYYY-MM-DD</p>
                </div>

                <div>
                  <label htmlFor="dia_chi" className="block text-sm font-medium text-slate-300 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    id="dia_chi"
                    type="text"
                    value={diaChi}
                    onChange={(e) => {
                      setDiaChi(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Địa chỉ trụ sở chính"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="thanh_pho" className="block text-sm font-medium text-slate-300 mb-2">
                    Thành phố
                  </label>
                  <input
                    id="thanh_pho"
                    type="text"
                    value={thanhPho}
                    onChange={(e) => {
                      setThanhPho(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Thành phố"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="quoc_gia" className="block text-sm font-medium text-slate-300 mb-2">
                    Quốc gia
                  </label>
                  <input
                    id="quoc_gia"
                    type="text"
                    value={quocGia}
                    onChange={(e) => {
                      setQuocGia(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Quốc gia"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="ma_so_thue" className="block text-sm font-medium text-slate-300 mb-2">
                    Mã số thuế
                  </label>
                  <input
                    id="ma_so_thue"
                    type="text"
                    value={maSoThue}
                    onChange={(e) => {
                      setMaSoThue(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Mã số thuế"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="so_nhan_vien" className="block text-sm font-medium text-slate-300 mb-2">
                    Số nhân viên
                  </label>
                  <input
                    id="so_nhan_vien"
                    type="text"
                    value={soNhanVien}
                    onChange={(e) => {
                      setSoNhanVien(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Số nhân viên"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-slate-300 mb-2">
                    Website
                  </label>
                  <input
                    id="website"
                    type="text"
                    value={website}
                    onChange={(e) => {
                      setWebsite(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="example.com"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500 mt-1">Có thể nhập với hoặc không có https://</p>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="mo_ta" className="block text-sm font-medium text-slate-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  id="mo_ta"
                  value={moTa}
                  onChange={(e) => {
                    setMoTa(e.target.value);
                    setError('');
                  }}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 resize-none transition-all"
                  placeholder="Mô tả về công ty, dịch vụ, kinh nghiệm..."
                  disabled={isLoading}
                />
              </div>

              {/* Logo Upload */}
              <div className="mt-4">
                <label htmlFor="logo" className="block text-sm font-medium text-slate-300 mb-2">
                  Logo công ty
                </label>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <input
                      ref={logoInputRef}
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                      onChange={handleLogoChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{logoFile ? logoFile.name : 'Chọn file logo (JPEG, PNG, GIF, WebP, BMP - Tối đa 5MB)'}</span>
                    </button>
                    <p className="text-xs text-slate-500 mt-1">Chấp nhận: JPEG, PNG, GIF, WebP, BMP (Tối đa 5MB)</p>
                  </div>
                  {logoPreview && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/10">
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {logoFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                      if (logoInputRef.current) logoInputRef.current.value = '';
                    }}
                    className="mt-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Xóa logo đã chọn
                  </button>
                )}
              </div>

              {/* Business License Upload */}
              <div className="mt-4">
                <label htmlFor="giay_to_kinh_doanh" className="block text-sm font-medium text-slate-300 mb-2">
                  Giấy phép kinh doanh
                </label>
                <input
                  ref={giayToInputRef}
                  id="giay_to_kinh_doanh"
                  type="file"
                  accept="application/pdf"
                  onChange={handleGiayToChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => giayToInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>{giayToFile ? giayToFile.name : 'Chọn file giấy phép kinh doanh (PDF - Tối đa 10MB)'}</span>
                </button>
                <p className="text-xs text-slate-500 mt-1">Chỉ chấp nhận file PDF (Tối đa 10MB)</p>
                {giayToFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setGiayToFile(null);
                      if (giayToInputRef.current) giayToInputRef.current.value = '';
                    }}
                    className="mt-2 text-sm text-red-400 hover:text-red-300"
                  >
                    Xóa file đã chọn
                  </button>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start">
              <svg className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-amber-300">
                <p className="font-medium mb-1">Lưu ý quan trọng:</p>
                <p>Tài khoản của bạn sẽ được tạo và chờ admin duyệt. Sau khi được duyệt, bạn sẽ nhận được thông báo qua email và có thể đăng nhập vào hệ thống.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Đăng ký trở thành đối tác</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500">Đã có tài khoản đối tác?</span>{' '}
            <Link to="/supplier/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Đăng nhập →
            </Link>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-xs text-slate-500 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <p>
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <Link to="/terms" className="text-slate-300 hover:text-purple-400 underline transition-colors">
              Điều khoản dịch vụ
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="text-slate-300 hover:text-purple-400 underline transition-colors">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
