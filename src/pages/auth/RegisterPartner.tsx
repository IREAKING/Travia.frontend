import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supplierService } from '../../services/supplierService';
import type { CreateSupplierRequest } from '../../types';
import { useToast } from '../../hooks/useToast';

export const RegisterPartnerPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<CreateSupplierRequest>({
    thong_tin_dang_nhap: {
      nguoi_dai_dien: '',
      email: '',
      mat_khau: '',
      so_dien_thoai: '',
    },
    thong_tin_nha_cung_cap: {
      ten: '',
      dia_chi: '',
      website: '',
      mo_ta: '',
      logo_url: '',
    },
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (section: keyof CreateSupplierRequest, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setError('');
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
    const { thong_tin_dang_nhap, thong_tin_nha_cung_cap } = formData;

    if (!thong_tin_dang_nhap.nguoi_dai_dien.trim()) {
      setError('Vui lòng nhập tên người đại diện');
      return false;
    }

    if (!thong_tin_dang_nhap.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(thong_tin_dang_nhap.email)) {
      setError('Email không hợp lệ');
      return false;
    }

    if (!thong_tin_dang_nhap.mat_khau.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }

    if (thong_tin_dang_nhap.mat_khau.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return false;
    }

    if (thong_tin_dang_nhap.mat_khau !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    if (!thong_tin_nha_cung_cap.ten.trim()) {
      setError('Vui lòng nhập tên nhà cung cấp');
      return false;
    }

    // Validate website URL (optional but if provided should be valid)
    if (thong_tin_nha_cung_cap.website && thong_tin_nha_cung_cap.website.trim()) {
      const website = thong_tin_nha_cung_cap.website.trim();
      const urlPattern = /^(https?:\/\/)?([\w\-\.]+)\.([a-z]{2,})([\/\w\-\.]*)*\/?$/i;
      if (!urlPattern.test(website)) {
        setError('URL website không hợp lệ. Ví dụ: example.com hoặc https://example.com');
        return false;
      }
    }

    // Validate logo URL (optional but if provided should be valid)
    if (thong_tin_nha_cung_cap.logo_url && thong_tin_nha_cung_cap.logo_url.trim()) {
      const logoUrl = thong_tin_nha_cung_cap.logo_url.trim();
      const urlPattern = /^(https?:\/\/)?([\w\-\.]+)\.([a-z]{2,})([\/\w\-\.]*)*\/?$/i;
      if (!urlPattern.test(logoUrl)) {
        setError('URL logo không hợp lệ. Ví dụ: https://example.com/logo.png');
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
      // Format URLs before sending
      const formattedData = {
        ...formData,
        thong_tin_nha_cung_cap: {
          ...formData.thong_tin_nha_cung_cap,
          website: formData.thong_tin_nha_cung_cap.website ? formatUrl(formData.thong_tin_nha_cung_cap.website) : undefined,
          logo_url: formData.thong_tin_nha_cung_cap.logo_url ? formatUrl(formData.thong_tin_nha_cung_cap.logo_url) : undefined,
        },
      };

      await supplierService.registerPartner(formattedData);
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
                Thông Tin Đăng Nhập
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nguoi_dai_dien" className="block text-sm font-medium text-slate-300 mb-2">
                    Tên Người Đại Diện <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="nguoi_dai_dien"
                    type="text"
                    value={formData.thong_tin_dang_nhap.nguoi_dai_dien}
                    onChange={(e) => handleInputChange('thong_tin_dang_nhap', 'nguoi_dai_dien', e.target.value)}
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
                    value={formData.thong_tin_dang_nhap.email}
                    onChange={(e) => handleInputChange('thong_tin_dang_nhap', 'email', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="example@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="mat_khau" className="block text-sm font-medium text-slate-300 mb-2">
                    Mật Khẩu <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="mat_khau"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.thong_tin_dang_nhap.mat_khau}
                      onChange={(e) => handleInputChange('thong_tin_dang_nhap', 'mat_khau', e.target.value)}
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
                    Xác Nhận Mật Khẩu <span className="text-red-400">*</span>
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
                    Số Điện Thoại
                  </label>
                  <input
                    id="so_dien_thoai"
                    type="tel"
                    value={formData.thong_tin_dang_nhap.so_dien_thoai || ''}
                    onChange={(e) => handleInputChange('thong_tin_dang_nhap', 'so_dien_thoai', e.target.value)}
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
                Thông Tin Công Ty / Nhà Cung Cấp
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ten" className="block text-sm font-medium text-slate-300 mb-2">
                    Tên Công Ty / Nhà Cung Cấp <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ten"
                    type="text"
                    value={formData.thong_tin_nha_cung_cap.ten}
                    onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'ten', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Tên công ty/nhà cung cấp"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="dia_chi" className="block text-sm font-medium text-slate-300 mb-2">
                    Địa Chỉ
                  </label>
                  <input
                    id="dia_chi"
                    type="text"
                    value={formData.thong_tin_nha_cung_cap.dia_chi || ''}
                    onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'dia_chi', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="Địa chỉ trụ sở chính"
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
                    value={formData.thong_tin_nha_cung_cap.website || ''}
                    onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'website', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="example.com"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500 mt-1">Có thể nhập với hoặc không có https://</p>
                </div>

                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-slate-300 mb-2">
                    Logo URL
                  </label>
                  <input
                    id="logo_url"
                    type="text"
                    value={formData.thong_tin_nha_cung_cap.logo_url || ''}
                    onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'logo_url', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 transition-all"
                    placeholder="https://example.com/logo.png"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-slate-500 mt-1">URL hình ảnh logo của công ty</p>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="mo_ta" className="block text-sm font-medium text-slate-300 mb-2">
                  Mô Tả
                </label>
                <textarea
                  id="mo_ta"
                  value={formData.thong_tin_nha_cung_cap.mo_ta || ''}
                  onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'mo_ta', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 text-white placeholder-slate-500 resize-none transition-all"
                  placeholder="Mô tả về công ty, dịch vụ, kinh nghiệm..."
                  disabled={isLoading}
                />
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
