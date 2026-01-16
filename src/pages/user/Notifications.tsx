import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserSidebar } from '../../components/layout/UserSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { notificationService, type Notification } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

const getNotificationIcon = (loai?: string) => {
  switch (loai) {
    case 'booking':
      return '📅';
    case 'payment':
      return '💳';
    case 'promotion':
      return '🎉';
    default:
      return '🔔';
  }
};

const getNotificationColor = (loai?: string) => {
  switch (loai) {
    case 'booking':
      return 'from-blue-500 to-cyan-500';
    case 'payment':
      return 'from-green-500 to-emerald-500';
    case 'promotion':
      return 'from-purple-500 to-pink-500';
    default:
      return 'from-indigo-500 to-blue-500';
  }
};

export const NotificationsPage = () => {
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isAuthenticated, filter, currentPage]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * itemsPerPage;
      
      let response;
      if (filter === 'unread') {
        response = await notificationService.getUnreadNotifications(itemsPerPage, offset);
        setNotifications(response);
      } else {
        response = await notificationService.getMyNotifications(itemsPerPage, offset);
        setNotifications(response.data);
        setUnreadCount(response.unread_count);
      }
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      showToast('Không thể tải thông báo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error: any) {
      showToast('Không thể đánh dấu đã đọc', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
      await loadNotifications();
      await loadUnreadCount();
    } catch (error: any) {
      showToast('Không thể đánh dấu tất cả', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <DashboardLayout sidebar={<UserSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Vui lòng đăng nhập để xem thông báo</p>
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
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-60"></div>
                <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Thông báo</h1>
                <p className="text-slate-400">
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-6 py-3 bg-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8">
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((filterType) => (
            <button
              key={filterType}
              onClick={() => {
                setFilter(filterType);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === filterType
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              {filterType === 'all' ? 'Tất cả' : 'Chưa đọc'}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LoadingSpinner size="lg" text="Đang tải thông báo..." />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <p className="text-slate-400 text-lg">Không có thông báo nào</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const isUnread = !notification.da_doc;
            return (
              <div
                key={notification.id}
                className={`bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border transition-all cursor-pointer hover:border-indigo-500/50 ${
                  isUnread ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/10'
                }`}
                onClick={() => {
                  if (isUnread) {
                    handleMarkAsRead(notification.id);
                  }
                  if (notification.lien_ket) {
                    window.location.href = notification.lien_ket;
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${getNotificationColor(notification.loai)} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {getNotificationIcon(notification.loai)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-medium">{notification.tieu_de || 'Thông báo'}</h3>
                      {isUnread && (
                        <span className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0 mt-2"></span>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-2 whitespace-pre-wrap">
                      {notification.noi_dung}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">
                        {formatDate(notification.ngay_tao)}
                      </span>
                      {notification.loai && (
                        <span className="text-xs px-2 py-1 bg-white/5 text-slate-400 rounded-lg">
                          {notification.loai}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};

