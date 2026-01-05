import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminTopActiveUser } from '../../types';

export const TopActiveUsersCard = () => {
  const [data, setData] = useState<AdminTopActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await adminService.getTopActiveUsers();
        setData(response || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top active users:', err);
        setError('Không thể tải dữ liệu người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-80 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin mb-3"></div>
            <span className="text-slate-400 text-sm">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group relative rounded-3xl overflow-hidden">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl opacity-30 blur-xl"></div>
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-rose-500/20 rounded-2xl flex items-center justify-center border border-rose-500/30">
              <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-rose-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return { 
          bg: 'bg-gradient-to-r from-amber-500/30 to-orange-500/30', 
          border: 'border-amber-500/50',
          text: 'text-amber-400',
          icon: '🥇'
        };
      case 1:
        return { 
          bg: 'bg-gradient-to-r from-slate-400/30 to-slate-500/30', 
          border: 'border-slate-400/50',
          text: 'text-slate-300',
          icon: '🥈'
        };
      case 2:
        return { 
          bg: 'bg-gradient-to-r from-orange-700/30 to-orange-800/30', 
          border: 'border-orange-700/50',
          text: 'text-orange-400',
          icon: '🥉'
        };
      default:
        return { 
          bg: 'bg-white/5', 
          border: 'border-white/10',
          text: 'text-slate-400',
          icon: `#${index + 1}`
        };
    }
  };

  return (
    <div className="group relative rounded-3xl overflow-hidden transition-all duration-700">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-700"></div>
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10 group-hover:border-white/20 transition-all duration-500">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl flex items-center justify-center border border-pink-500/30">
            <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Top Người Dùng</h3>
            <p className="text-sm text-slate-400">Hoạt động nhiều nhất</p>
          </div>
        </div>

        <div className="space-y-3">
          {data.map((user, index) => {
            const rankStyle = getRankStyle(index);
            return (
              <div 
                key={user.id || index} 
                className={`flex items-center justify-between p-4 ${rankStyle.bg} rounded-2xl border ${rankStyle.border} transition-all duration-300 hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-11 h-11 bg-gradient-to-br from-cyan-500/40 to-purple-500/40 rounded-xl flex items-center justify-center border border-white/20">
                      <span className="font-bold text-white">
                            {user.ho_ten?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="absolute -top-1 -right-1 text-sm">
                      {typeof rankStyle.icon === 'string' && rankStyle.icon.startsWith('#') ? (
                        <span className={`w-5 h-5 ${rankStyle.bg} rounded-full flex items-center justify-center text-[10px] font-bold ${rankStyle.text}`}>
                          {index + 1}
                        </span>
                      ) : (
                        rankStyle.icon
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">{user.ho_ten || 'Unknown'}</p>
                    <p className="text-xs text-slate-400">
                      {user.email?.length > 20 ? user.email.substring(0, 20) + '...' : user.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {user.so_booking}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">đặt chỗ</p>
                </div>
              </div>
            );
          })}
        </div>

        {data.length === 0 && (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-3 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-7 h-7 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">Chưa có dữ liệu</p>
          </div>
        )}
      </div>
    </div>
  );
};
