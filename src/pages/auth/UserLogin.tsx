import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/auth/LoginForm';
import { useToast } from '../../hooks/useToast';

export const UserLoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUser({ email, password });
      
      const userName = localStorage.getItem('user');
      const parsedUser = userName ? JSON.parse(userName) : null;
      const displayName = parsedUser?.full_name || parsedUser?.email || 'bạn';
      
      toast.success(`Chào mừng ${displayName}! 🎉`);
      
      setIsRedirecting(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Đăng nhập thất bại';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[180px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        
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

      {/* Loading Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/95 backdrop-blur-xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 mb-6 shadow-2xl shadow-cyan-500/30">
              <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Đang chuyển hướng...</h3>
            <p className="text-slate-400">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      )}

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

      <div className="relative z-10 w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center p-8">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 mb-6 backdrop-blur-xl">
              <span className="text-5xl">🌍</span>
            </div>
            <h1 className="text-5xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="text-white">Chào mừng </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                trở lại
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-md">
              Đăng nhập để tiếp tục hành trình khám phá thế giới cùng Travia
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 w-full max-w-sm">
            {[
              { icon: '✈️', text: '1000+ Tour độc đáo' },
              { icon: '🔒', text: 'Bảo mật tuyệt đối' },
              { icon: '💎', text: 'Ưu đãi dành riêng cho thành viên' },
            ].map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-slate-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Form */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <span className="text-4xl group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">🌍</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Travia
              </span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Đăng Nhập</h2>
            <p className="text-slate-400">Nhập thông tin tài khoản của bạn</p>
          </div>

          <LoginForm
            title="Đăng Nhập"
            subtitle="Chào mừng trở lại!"
            onSubmit={handleLogin}
            isLoading={isLoading}
            accentColor="cyan"
          />

          <div className="mt-6 text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            <div className="text-center text-sm text-slate-400">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Đăng ký ngay
              </Link>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-900 text-slate-500">Hoặc</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link 
                to="/admin/login" 
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Admin
              </Link>
              <Link 
                to="/supplier/login" 
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl border border-white/10 hover:border-white/20 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Nhà cung cấp
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Float Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
