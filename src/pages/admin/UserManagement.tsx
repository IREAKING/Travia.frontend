import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';
import { AdminCustomerGrowthChart } from '../../components/charts/AdminCustomerGrowthChart';
import { AdminTopActiveUsersChart } from '../../components/charts/AdminTopActiveUsersChart';

type UserRole = 'all' | 'khach_hang' | 'nha_cung_cap' | 'quan_tri';
type UserStatus = 'all' | 'active' | 'inactive' | 'blocked';

interface User {
  id: number;
  ten: string;
  email: string;
  so_dien_thoai?: string;
  vai_tro: string;
  trang_thai: string;
  ngay_tao: string;
  ngay_dang_nhap_cuoi?: string;
  anh_dai_dien?: string;
  dia_chi?: string;
  so_dat_cho?: number;
  so_tour?: number;
  doanh_thu?: number;
}

const ROLE_STYLES: Record<string, { bg: string; text: string }> = {
  'khach_hang': { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
  'nha_cung_cap': { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  'quan_tri': { bg: 'bg-rose-500/20', text: 'text-rose-400' },
};

const ROLE_LABELS: Record<string, string> = {
  'khach_hang': 'Khách hàng',
  'nha_cung_cap': 'Nhà cung cấp',
  'quan_tri': 'Quản trị',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'active': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'inactive': { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-400' },
  'blocked': { bg: 'bg-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
};

const STATUS_LABELS: Record<string, string> = {
  'active': 'Hoạt động',
  'inactive': 'Không hoạt động',
  'blocked': 'Đã khóa',
};

// Helper function to extract status string from possible object format
const getStatusString = (status: any): string | null => {
  if (!status) return null;
  if (typeof status === 'string') return status;
  if (typeof status === 'object' && status.trang_thai_dat_cho) {
    return status.valid ? status.trang_thai_dat_cho : null;
  }
  if (typeof status === 'object' && status.TrangThaiDatCho) {
    return status.valid ? status.TrangThaiDatCho : null;
  }
  return null;
};

export const UserManagementPage = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Mock data
  const mockUsers: User[] = [
    {
      id: 1,
      ten: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      so_dien_thoai: '0901234567',
      vai_tro: 'khach_hang',
      trang_thai: 'active',
      ngay_tao: '2024-01-15T08:30:00Z',
      ngay_dang_nhap_cuoi: '2024-11-12T14:20:00Z',
      so_dat_cho: 5,
      dia_chi: 'TP. Hồ Chí Minh'
    },
    {
      id: 2,
      ten: 'Công ty Du lịch ABC',
      email: 'contact@abc-travel.com',
      so_dien_thoai: '0912345678',
      vai_tro: 'nha_cung_cap',
      trang_thai: 'active',
      ngay_tao: '2024-02-10T10:00:00Z',
      ngay_dang_nhap_cuoi: '2024-11-12T09:15:00Z',
      so_tour: 12,
      doanh_thu: 250000000,
      dia_chi: 'Hà Nội'
    },
    {
      id: 3,
      ten: 'Trần Thị B',
      email: 'tranthib@email.com',
      so_dien_thoai: '0923456789',
      vai_tro: 'khach_hang',
      trang_thai: 'active',
      ngay_tao: '2024-03-20T15:45:00Z',
      ngay_dang_nhap_cuoi: '2024-11-10T16:30:00Z',
      so_dat_cho: 12,
      dia_chi: 'Đà Nẵng'
    },
    {
      id: 4,
      ten: 'Lê Văn C',
      email: 'levanc@email.com',
      so_dien_thoai: '0934567890',
      vai_tro: 'khach_hang',
      trang_thai: 'blocked',
      ngay_tao: '2024-04-05T11:20:00Z',
      ngay_dang_nhap_cuoi: '2024-10-15T10:00:00Z',
      so_dat_cho: 2,
      dia_chi: 'Cần Thơ'
    },
    {
      id: 5,
      ten: 'Admin User',
      email: 'admin@travia.com',
      so_dien_thoai: '0945678901',
      vai_tro: 'quan_tri',
      trang_thai: 'active',
      ngay_tao: '2023-12-01T08:00:00Z',
      ngay_dang_nhap_cuoi: '2024-11-12T15:30:00Z',
      dia_chi: 'TP. Hồ Chí Minh'
    },
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('Không thể tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn khóa tài khoản này?')) {
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, trang_thai: 'blocked' } : user
      ));
      showToast('Khóa tài khoản thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleUnblockUser = async (userId: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, trang_thai: 'active' } : user
      ));
      showToast('Mở khóa tài khoản thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(prev => prev.filter(user => user.id !== userId));
      showToast('Xóa người dùng thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? editingUser : user
      ));
      showToast('Cập nhật thông tin thành công!', 'success');
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.so_dien_thoai && user.so_dien_thoai.includes(searchTerm));
    const matchesRole = roleFilter === 'all' || user.vai_tro === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.trang_thai === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    customers: users.filter(u => u.vai_tro === 'khach_hang').length,
    suppliers: users.filter(u => u.vai_tro === 'nha_cung_cap').length,
    admins: users.filter(u => u.vai_tro === 'quan_tri').length,
    active: users.filter(u => u.trang_thai === 'active').length,
    blocked: users.filter(u => u.trang_thai === 'blocked').length,
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải người dùng..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(16,185,129,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur opacity-60"></div>
              <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Quản Lý Người Dùng</h1>
              <p className="text-slate-400">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <AdminCustomerGrowthChart />
        <AdminTopActiveUsersChart />
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-6 gap-4 mb-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Tổng số</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Khách hàng</p>
          <p className="text-2xl font-bold text-cyan-400">{stats.customers}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Nhà cung cấp</p>
          <p className="text-2xl font-bold text-purple-400">{stats.suppliers}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Quản trị</p>
          <p className="text-2xl font-bold text-rose-400">{stats.admins}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Hoạt động</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
        </div>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-white/10">
          <p className="text-slate-400 text-xs mb-1">Đã khóa</p>
          <p className="text-2xl font-bold text-amber-400">{stats.blocked}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all" className="bg-slate-900">Tất cả vai trò</option>
              <option value="khach_hang" className="bg-slate-900">Khách hàng</option>
              <option value="nha_cung_cap" className="bg-slate-900">Nhà cung cấp</option>
              <option value="quan_tri" className="bg-slate-900">Quản trị</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="all" className="bg-slate-900">Tất cả trạng thái</option>
              <option value="active" className="bg-slate-900">Hoạt động</option>
              <option value="inactive" className="bg-slate-900">Không hoạt động</option>
              <option value="blocked" className="bg-slate-900">Đã khóa</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Hiển thị <span className="font-semibold text-white">{filteredUsers.length}</span> người dùng
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy người dùng</h3>
          <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Người dùng</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Liên hệ</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Vai trò</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Trạng thái</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Thống kê</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Ngày tạo</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => {
                  const roleStyle = ROLE_STYLES[user.vai_tro] || { bg: 'bg-slate-500/20', text: 'text-slate-400' };
                  // const statusStyle = STATUS_STYLES[user.trang_thai] || STATUS_STYLES['active'];
                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {user.anh_dai_dien ? (
                            <img
                              src={user.anh_dai_dien}
                              alt={user.ten}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-white/10">
                              <span className="text-sm font-bold text-white">{user.ten.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{user.ten}</p>
                            <p className="text-sm text-slate-500">{user.dia_chi}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm text-white">{user.email}</p>
                          <p className="text-sm text-slate-500">{user.so_dien_thoai}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 ${roleStyle.bg} ${roleStyle.text} text-xs font-medium rounded-lg`}>
                          {ROLE_LABELS[user.vai_tro] || user.vai_tro}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {(() => {
                          const statusStr = getStatusString(user.trang_thai) || 'inactive';
                          const style = STATUS_STYLES[statusStr] || STATUS_STYLES['inactive'];
                          return (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${style.bg} rounded-lg`}>
                              <span className={`w-1.5 h-1.5 ${style.dot} rounded-full`}></span>
                              <span className={`text-xs font-medium ${style.text}`}>
                                {STATUS_LABELS[statusStr] || statusStr}
                          </span>
                        </span>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-6">
                        {user.vai_tro === 'khach_hang' && (
                          <span className="text-sm text-slate-300">{user.so_dat_cho} đặt chỗ</span>
                        )}
                        {user.vai_tro === 'nha_cung_cap' && (
                          <div>
                            <p className="text-sm text-slate-300">{user.so_tour} tours</p>
                            {user.doanh_thu && (
                              <p className="text-xs text-emerald-400">{formatCurrency(user.doanh_thu, 'VND')}</p>
                            )}
                          </div>
                        )}
                        {user.vai_tro === 'quan_tri' && <span className="text-sm text-slate-500">-</span>}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-400">
                          {new Date(user.ngay_tao).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {user.trang_thai === 'active' ? (
                            <button
                              onClick={() => handleBlockUser(user.id)}
                              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Khóa tài khoản"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                          ) : user.trang_thai === 'blocked' ? (
                            <button
                              onClick={() => handleUnblockUser(user.id)}
                              className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Mở khóa tài khoản"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          ) : null}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Xóa người dùng"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
            
            <div className="relative inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-slate-900 rounded-3xl shadow-2xl border border-white/10">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Chi tiết người dùng</h3>
                  <button onClick={() => setShowDetailModal(false)} className="text-white/80 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/40 to-purple-500/40 rounded-2xl flex items-center justify-center border border-white/20">
                    <span className="text-2xl font-bold text-white">{selectedUser.ten.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white">{selectedUser.ten}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2.5 py-1 ${ROLE_STYLES[selectedUser.vai_tro]?.bg || 'bg-slate-500/20'} ${ROLE_STYLES[selectedUser.vai_tro]?.text || 'text-slate-400'} text-xs font-medium rounded-lg`}>
                        {ROLE_LABELS[selectedUser.vai_tro] || selectedUser.vai_tro}
                      </span>
                      {(() => {
                        const statusStr = getStatusString(selectedUser.trang_thai) || 'inactive';
                        const style = STATUS_STYLES[statusStr] || STATUS_STYLES['inactive'];
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${style.bg} rounded-lg`}>
                            <span className={`w-1.5 h-1.5 ${style.dot} rounded-full`}></span>
                            <span className={`text-xs font-medium ${style.text}`}>
                              {STATUS_LABELS[statusStr] || statusStr}
                        </span>
                      </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Email</p>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Số điện thoại</p>
                    <p className="text-white">{selectedUser.so_dien_thoai || '-'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Địa chỉ</p>
                    <p className="text-white">{selectedUser.dia_chi || '-'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Ngày tạo</p>
                    <p className="text-white">{new Date(selectedUser.ngay_tao).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>

                {selectedUser.vai_tro === 'khach_hang' && (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <h5 className="font-semibold text-cyan-400 mb-2">Thống kê khách hàng</h5>
                    <p className="text-sm text-cyan-300">Tổng số đặt chỗ: <span className="font-bold">{selectedUser.so_dat_cho}</span></p>
                  </div>
                )}

                {selectedUser.vai_tro === 'nha_cung_cap' && (
                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <h5 className="font-semibold text-purple-400 mb-2">Thống kê nhà cung cấp</h5>
                    <p className="text-sm text-purple-300">Số tours: <span className="font-bold">{selectedUser.so_tour}</span></p>
                    {selectedUser.doanh_thu && (
                      <p className="text-sm text-purple-300">Doanh thu: <span className="font-bold">{formatCurrency(selectedUser.doanh_thu, 'VND')}</span></p>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
            
            <div className="relative inline-block w-full max-w-2xl overflow-hidden text-left align-middle transition-all transform bg-slate-900 rounded-3xl shadow-2xl border border-white/10">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Chỉnh sửa người dùng</h3>
                  <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tên</label>
                  <input
                    type="text"
                    value={editingUser.ten}
                    onChange={(e) => setEditingUser({ ...editingUser, ten: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    value={editingUser.so_dien_thoai || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, so_dien_thoai: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Vai trò</label>
                    <select
                      value={editingUser.vai_tro}
                      onChange={(e) => setEditingUser({ ...editingUser, vai_tro: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="khach_hang" className="bg-slate-900">Khách hàng</option>
                      <option value="nha_cung_cap" className="bg-slate-900">Nhà cung cấp</option>
                      <option value="quan_tri" className="bg-slate-900">Quản trị</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Trạng thái</label>
                    <select
                      value={editingUser.trang_thai}
                      onChange={(e) => setEditingUser({ ...editingUser, trang_thai: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    >
                      <option value="active" className="bg-slate-900">Hoạt động</option>
                      <option value="inactive" className="bg-slate-900">Không hoạt động</option>
                      <option value="blocked" className="bg-slate-900">Đã khóa</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                    }}
                    className="px-6 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleEditUser}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
