import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserSidebar } from '../../components/layout/UserSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

// Mock data - In real app, you'd fetch user's contacts from API
// For now, we'll show a message that contacts are managed by admin
export const MyContactsPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <DashboardLayout sidebar={<UserSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Vui lòng đăng nhập để xem liên hệ của bạn</p>
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300">
              Đăng nhập
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<UserSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-2xl blur opacity-60"></div>
              <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Liên Hệ Của Tôi</h1>
              <p className="text-slate-400">Xem lịch sử liên hệ và phản hồi từ chúng tôi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
            ℹ️
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium mb-2">Về phản hồi liên hệ</h3>
            <p className="text-slate-400 text-sm mb-4">
              Khi bạn gửi liên hệ qua form liên hệ, chúng tôi sẽ xem xét và phản hồi lại cho bạn. 
              Bạn sẽ nhận được thông báo khi có phản hồi mới.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Gửi liên hệ mới
            </Link>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-white font-medium mb-4">Cách xem phản hồi</h3>
        <div className="space-y-3 text-slate-400 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-indigo-400">1.</span>
            <span>Kiểm tra thông báo của bạn để biết khi nào có phản hồi mới</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400">2.</span>
            <span>Phản hồi sẽ được gửi qua email hoặc hiển thị trong thông báo</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-indigo-400">3.</span>
            <span>Bạn có thể xem tất cả thông báo trong trang <Link to="/notifications" className="text-indigo-400 hover:text-indigo-300">Thông báo</Link></span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

