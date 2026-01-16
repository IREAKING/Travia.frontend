import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { userService, type UserDetail } from '../../services/user';
import { SuccessModal } from '../../components/common/Modal';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  // Load user detail with statistics
  useEffect(() => {
    const loadUserDetail = async () => {
      if (!user?.id) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        const detail = await userService.getUserById(user.id);
        setUserDetail(detail);
        setFormData({
          full_name: detail.full_name || detail.name || '',
          email: detail.email || '',
          phone: detail.phone || '',
        });
      } catch (error) {
        console.error('Failed to load user detail:', error);
        showToast('Không thể tải thông tin chi tiết', 'error');
        // Fallback to basic user data
    if (user) {
      setFormData({
        full_name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadUserDetail();
  }, [user?.id, showToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi API UpdateUser với đầy đủ thông tin
      const updatedUser = await userService.updateUser({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
      });
      
      // Update user in context
      updateUser({
        name: updatedUser.name || formData.full_name,
        phone: updatedUser.phone || formData.phone,
      });

      // Reload user detail to get updated statistics
      if (user?.id) {
        const detail = await userService.getUserById(user.id);
        setUserDetail(detail);
        // Cập nhật lại formData với dữ liệu mới nhất
        setFormData({
          full_name: detail.full_name || detail.name || formData.full_name,
          email: detail.email || formData.email,
          phone: detail.phone || formData.phone,
        });
      }
      
      // Hiển thị modal thông báo thành công
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user || loadingProfile) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen bg-[#030712]">
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
            👤 Thông tin tài khoản
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Thông Tin </span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Cá Nhân
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>
      </section>

      {/* Profile Content */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
      </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="md:col-span-1">
                <div className="group sticky top-24">
                  {/* Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-700" />
                  
                  {/* Card */}
                  <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 group-hover:border-white/20 p-8">
                <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-cyan-500/30 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full animate-pulse opacity-50" />
                        <span className="relative z-10">{(user.name || user.email)?.charAt(0).toUpperCase()}</span>
                  </div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                    {user.name || 'Chưa có tên'}
                  </h3>
                      <p className="text-cyan-300 mb-2">{user.email}</p>
                      <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/20 text-purple-300 text-sm font-semibold rounded-full border border-purple-500/30 capitalize">
                    {user.role?.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <h4 className="font-bold text-white mb-4 text-lg">Thống kê</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <span className="text-slate-400 flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Tổng đặt chỗ
                          </span>
                          <span className="font-bold text-cyan-400 text-lg">{userDetail?.tong_dat_cho ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <span className="text-slate-400 flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Đã hoàn thành
                          </span>
                          <span className="font-bold text-emerald-400 text-lg">{userDetail?.tong_dat_cho_da_thanh_toan ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                          <span className="text-slate-400 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Đang chờ
                          </span>
                          <span className="font-bold text-amber-400 text-lg">{userDetail?.tong_dat_cho_dang_cho_xac_nhan ?? 0}</span>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="md:col-span-2">
                <div className="group relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-700" />
                  
                  {/* Card */}
                  <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 group-hover:border-white/20 p-8">
                    <div className="mb-8">
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-4">
                        ✏️ Chỉnh sửa thông tin
                      </span>
                      <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Cập nhật <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Thông tin</span>
                      </h2>
                    </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-3">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                            className="w-full px-5 py-4 bg-slate-800/50 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder-slate-500 text-white transition-all duration-300 hover:border-white/20"
                        required
                      />
                    </div>

                    <div>
                          <label className="block text-sm font-semibold text-slate-300 mb-3">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                            className="w-full px-5 py-4 bg-slate-800/30 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder-slate-500 text-slate-400 cursor-not-allowed"
                        required
                        disabled
                      />
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Email không thể thay đổi
                          </p>
                    </div>
                  </div>

                  <div>
                        <label className="block text-sm font-semibold text-slate-300 mb-3">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                          className="w-full px-5 py-4 bg-slate-800/50 border-2 border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 placeholder-slate-500 text-white transition-all duration-300 hover:border-white/20"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                          className="relative flex-1 px-8 py-4 overflow-hidden rounded-xl font-bold text-white transition-all duration-500 group"
                    >
                          {/* Animated gradient border */}
                          <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl" />
                          <span className="absolute inset-[2px] bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors" />
                          <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                              <>
                          <LoadingSpinner size="sm" />
                                <span>Đang cập nhật...</span>
                              </>
                      ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Cập nhật thông tin
                              </>
                      )}
                          </span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                            if (userDetail) {
                              setFormData({
                                full_name: userDetail.full_name || userDetail.name || '',
                                email: userDetail.email || '',
                                phone: userDetail.phone || '',
                              });
                            } else if (user) {
                          setFormData({
                            full_name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                          });
                        }
                      }}
                          className="flex-1 px-8 py-4 bg-slate-800/50 border-2 border-white/10 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:border-white/20 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                    >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                      Đặt lại
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Cập nhật thành công"
        message="Thông tin cá nhân của bạn đã được cập nhật thành công!"
        buttonText="Đóng"
      />
    </MainLayout>
  );
};
