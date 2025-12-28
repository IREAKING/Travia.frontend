import { useState, useEffect, type ReactElement } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { authService } from '../../services/authService';

type SettingsTab = 'notifications' | 'language' | 'security' | 'appearance' | 'account';

const TABS: { id: SettingsTab; label: string; icon: ReactElement }[] = [
  {
    id: 'notifications',
    label: 'Thông báo',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    id: 'language',
    label: 'Ngôn ngữ & Vùng',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'appearance',
    label: 'Giao diện',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    id: 'security',
    label: 'Bảo mật',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Tài khoản',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

// Toggle Switch Component
const ToggleSwitch = ({ 
  checked, 
  onChange, 
  label, 
  description 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void; 
  label: string; 
  description: string;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
    <div>
      <h3 className="font-medium text-white">{label}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        checked 
          ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
          : 'bg-slate-700'
      }`}
    >
      <span
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${
          checked ? 'left-8' : 'left-1'
        }`}
      />
    </button>
  </div>
);

export const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');
  
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: true,
    push_notifications: true,
    booking_reminders: true,
    language: 'vi',
    currency: 'VND',
    timezone: 'Asia/Ho_Chi_Minh',
    theme: 'dark',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('user_settings', JSON.stringify(newSettings));
    showToast('Đã lưu cài đặt', 'success');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - Mật khẩu hiện tại
    if (!passwordForm.current_password.trim()) {
      showToast('⚠️ Vui lòng nhập mật khẩu hiện tại', 'error');
      return;
    }

    // Validation - Mật khẩu mới
    if (!passwordForm.new_password.trim()) {
      showToast('⚠️ Vui lòng nhập mật khẩu mới', 'error');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showToast('⚠️ Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }

    // Validation - Xác nhận mật khẩu
    if (!passwordForm.confirm_password.trim()) {
      showToast('⚠️ Vui lòng xác nhận mật khẩu mới', 'error');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('❌ Mật khẩu mới và xác nhận không khớp!', 'error');
      return;
    }

    // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
    if (passwordForm.current_password === passwordForm.new_password) {
      showToast('⚠️ Mật khẩu mới phải khác mật khẩu hiện tại', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        mat_khau_cu: passwordForm.current_password,
        mat_khau_moi: passwordForm.new_password,
      });
      
      // Thông báo thành công với icon và message rõ ràng
      showToast('✅ Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.', 'success');
      
      // Reset form sau khi thành công
      setPasswordForm({ 
        current_password: '', 
        new_password: '', 
        confirm_password: '' 
      });
    } catch (error: any) {
      // Xử lý các loại lỗi khác nhau từ backend
      let errorMessage = 'Có lỗi xảy ra khi đổi mật khẩu';
      
      if (error.response) {
        // Lỗi từ server
        const status = error.response.status;
        const serverError = error.response.data?.error || error.response.data?.message;
        
        if (status === 400) {
          // Bad Request - thường là mật khẩu cũ sai
          errorMessage = serverError || '❌ Mật khẩu cũ không chính xác. Vui lòng kiểm tra lại.';
        } else if (status === 401) {
          // Unauthorized - token hết hạn hoặc không hợp lệ
          errorMessage = '🔒 Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (status === 500) {
          // Server error
          errorMessage = '⚠️ Lỗi hệ thống. Vui lòng thử lại sau.';
        } else {
          errorMessage = serverError || errorMessage;
        }
      } else if (error.request) {
        // Không nhận được response từ server
        errorMessage = '🌐 Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.';
      } else {
        // Lỗi khác
        errorMessage = error.message || errorMessage;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Tài khoản đã được xóa thành công', 'success');
      logout();
    } catch (error) {
      showToast('Có lỗi xảy ra khi xóa tài khoản', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
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
      {/* Hero Section */}
      <div className="relative py-16 overflow-hidden bg-[#030712]">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[150px]" />
          <div 
            className="absolute inset-0 opacity-10" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} 
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl text-cyan-300 text-sm font-semibold rounded-full border border-cyan-500/30 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Cài đặt tài khoản
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="text-white">Cài Đặt </span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Cá Nhân</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto">
              Tùy chỉnh trải nghiệm của bạn theo cách riêng
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#030712] min-h-screen pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8 -mt-8">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
                  <nav className="space-y-2">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span className={activeTab === tab.id ? 'text-cyan-400' : ''}>{tab.icon}</span>
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Content Area */}
              <div className="lg:col-span-3 space-y-6">
                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-cyan-500/30">
                        <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Cài đặt thông báo</h2>
                        <p className="text-sm text-slate-400">Quản lý cách bạn nhận thông báo</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <ToggleSwitch
                        checked={settings.email_notifications}
                        onChange={(val) => handleSettingChange('email_notifications', val)}
                        label="Email thông báo"
                        description="Nhận thông báo qua email về đặt chỗ và cập nhật"
                      />
                      <ToggleSwitch
                        checked={settings.push_notifications}
                        onChange={(val) => handleSettingChange('push_notifications', val)}
                        label="Push notification"
                        description="Nhận thông báo đẩy trên thiết bị"
                      />
                      <ToggleSwitch
                        checked={settings.sms_notifications}
                        onChange={(val) => handleSettingChange('sms_notifications', val)}
                        label="SMS thông báo"
                        description="Nhận thông báo qua tin nhắn SMS"
                      />
                      <ToggleSwitch
                        checked={settings.booking_reminders}
                        onChange={(val) => handleSettingChange('booking_reminders', val)}
                        label="Nhắc nhở đặt chỗ"
                        description="Nhận nhắc nhở trước ngày khởi hành"
                      />
                      <ToggleSwitch
                        checked={settings.marketing_emails}
                        onChange={(val) => handleSettingChange('marketing_emails', val)}
                        label="Email khuyến mãi"
                        description="Nhận email về tour mới và ưu đãi đặc biệt"
                      />
                    </div>
                  </div>
                )}

                {/* Language Tab */}
                {activeTab === 'language' && (
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center border border-emerald-500/30">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Ngôn ngữ & Khu vực</h2>
                        <p className="text-sm text-slate-400">Tùy chỉnh ngôn ngữ và định dạng hiển thị</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Ngôn ngữ</label>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        >
                          <option value="vi" className="bg-slate-800">🇻🇳 Tiếng Việt</option>
                          <option value="en" className="bg-slate-800">🇺🇸 English</option>
                          <option value="zh" className="bg-slate-800">🇨🇳 中文</option>
                          <option value="ja" className="bg-slate-800">🇯🇵 日本語</option>
                          <option value="ko" className="bg-slate-800">🇰🇷 한국어</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Đơn vị tiền tệ</label>
                        <select
                          value={settings.currency}
                          onChange={(e) => handleSettingChange('currency', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        >
                          <option value="VND" className="bg-slate-800">VND (₫)</option>
                          <option value="USD" className="bg-slate-800">USD ($)</option>
                          <option value="EUR" className="bg-slate-800">EUR (€)</option>
                          <option value="JPY" className="bg-slate-800">JPY (¥)</option>
                          <option value="KRW" className="bg-slate-800">KRW (₩)</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Múi giờ</label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange('timezone', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        >
                          <option value="Asia/Ho_Chi_Minh" className="bg-slate-800">🕐 Asia/Ho_Chi_Minh (GMT+7)</option>
                          <option value="Asia/Bangkok" className="bg-slate-800">🕐 Asia/Bangkok (GMT+7)</option>
                          <option value="Asia/Singapore" className="bg-slate-800">🕐 Asia/Singapore (GMT+8)</option>
                          <option value="Asia/Tokyo" className="bg-slate-800">🕐 Asia/Tokyo (GMT+9)</option>
                          <option value="UTC" className="bg-slate-800">🕐 UTC (GMT+0)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance Tab */}
                {activeTab === 'appearance' && (
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-xl flex items-center justify-center border border-purple-500/30">
                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Giao diện</h2>
                        <p className="text-sm text-slate-400">Tùy chỉnh giao diện hiển thị</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-4">Chọn chế độ hiển thị</label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { value: 'light', label: 'Sáng', icon: '☀️' },
                            { value: 'dark', label: 'Tối', icon: '🌙' },
                            { value: 'auto', label: 'Tự động', icon: '🔄' },
                          ].map((theme) => (
                            <button
                              key={theme.value}
                              onClick={() => handleSettingChange('theme', theme.value)}
                              className={`p-4 rounded-xl border transition-all duration-300 ${
                                settings.theme === theme.value
                                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-500/50 text-white'
                                  : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                              }`}
                            >
                              <span className="text-2xl mb-2 block">{theme.icon}</span>
                              <span className="font-medium">{theme.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">Chế độ tự động</p>
                            <p className="text-sm text-slate-400">Tự động chuyển đổi giữa chế độ sáng và tối dựa trên cài đặt hệ thống của bạn.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-xl flex items-center justify-center border border-amber-500/30">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Bảo mật</h2>
                        <p className="text-sm text-slate-400">Quản lý mật khẩu và bảo mật tài khoản</p>
                      </div>
                    </div>
                    
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu hiện tại</label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            name="current_password"
                            value={passwordForm.current_password}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all pr-12"
                            placeholder="Nhập mật khẩu hiện tại"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showCurrentPassword ? (
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">Mật khẩu mới</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            name="new_password"
                            value={passwordForm.new_password}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all pr-12"
                            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showNewPassword ? (
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
                        <label className="block text-sm font-medium text-slate-300 mb-2">Xác nhận mật khẩu mới</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirm_password"
                            value={passwordForm.confirm_password}
                            onChange={handlePasswordChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all pr-12"
                            placeholder="Nhập lại mật khẩu mới"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                          >
                            {showConfirmPassword ? (
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

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Đang cập nhật...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Đổi mật khẩu</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === 'account' && (
                  <div className="space-y-6">
                    {/* Account Info */}
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center border border-blue-500/30">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">Thông tin tài khoản</h2>
                          <p className="text-sm text-slate-400">Xem thông tin tài khoản của bạn</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                          <div>
                            <p className="text-sm text-slate-400">Email</p>
                            <p className="text-white font-medium">{user.email}</p>
                          </div>
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                            Đã xác thực
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                          <div>
                            <p className="text-sm text-slate-400">Họ và tên</p>
                            <p className="text-white font-medium">{user.name || 'Chưa cập nhật'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                          <div>
                            <p className="text-sm text-slate-400">Số điện thoại</p>
                            <p className="text-white font-medium">{user.phone || 'Chưa cập nhật'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-red-400">Vùng nguy hiểm</h2>
                          <p className="text-sm text-slate-400">Các hành động không thể hoàn tác</p>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
                        <p className="text-red-300 text-sm">
                          Khi xóa tài khoản, tất cả dữ liệu của bạn bao gồm lịch sử đặt tour, đánh giá và thông tin cá nhân sẽ bị xóa vĩnh viễn.
                        </p>
                      </div>
                      
                      <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="px-6 py-3 bg-red-500/20 text-red-400 font-semibold rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Đang xóa...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Xóa tài khoản</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
