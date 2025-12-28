import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { supplierService } from '../../services/supplierService';
import type { Supplier } from '../../types';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'hoat_dong': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'tam_khoa': { bg: 'bg-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
  'cho_duyet': { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
};


// Extended Supplier type with user info
type SupplierWithUser = Supplier & {
  email?: string;
  so_dien_thoai?: string;
  dang_hoat_dong?: boolean;
  xac_thuc?: boolean;
  logo?: string;
};

export const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState<SupplierWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDeleted, setShowDeleted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      // Lấy cả nhà cung cấp đã duyệt và chờ duyệt
      const [allSuppliers, pendingSuppliers] = await Promise.all([
        supplierService.getAllSuppliers().catch(() => []),
        supplierService.getPendingSuppliers().catch(() => [])
      ]);
      // Merge và loại bỏ trùng lặp
      const all = [...allSuppliers, ...pendingSuppliers];
      const unique = all.filter((supplier, index, self) => 
        index === self.findIndex((s) => s.id === supplier.id)
      );
      setSuppliers(unique);
    } catch (error: unknown) {
      console.error('Error fetching suppliers:', error);
      showToast('Không thể tải danh sách nhà cung cấp', 'error');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number | string) => {
    const supplierId = typeof id === 'number' ? id.toString() : id;
    if (window.confirm('Bạn có chắc chắn muốn duyệt nhà cung cấp này?')) {
      try {
        await supplierService.approveSupplier(supplierId);
        showToast('Duyệt nhà cung cấp thành công', 'success');
        fetchSuppliers();
      } catch (error: any) {
        console.error('Error approving supplier:', error);
        const errorMessage = error.response?.data?.message || 'Không thể duyệt nhà cung cấp';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleReject = async (id: number | string) => {
    const supplierId = typeof id === 'number' ? id.toString() : id;
    if (window.confirm('Bạn có chắc chắn muốn từ chối nhà cung cấp này?')) {
      try {
        await supplierService.rejectSupplier(supplierId);
        showToast('Từ chối nhà cung cấp thành công', 'success');
        fetchSuppliers();
      } catch (error: any) {
        console.error('Error rejecting supplier:', error);
        const errorMessage = error.response?.data?.message || 'Không thể từ chối nhà cung cấp';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleSoftDelete = async (id: number | string) => {
    const supplierId = typeof id === 'number' ? id.toString() : id;
    if (window.confirm('Bạn có chắc chắn muốn xóa mềm nhà cung cấp này? Nhà cung cấp sẽ bị ẩn nhưng có thể khôi phục sau.')) {
      try {
        await supplierService.softDeleteSupplier(supplierId);
        showToast('Xóa mềm nhà cung cấp thành công', 'success');
        fetchSuppliers();
      } catch (error: any) {
        console.error('Error soft deleting supplier:', error);
        const errorMessage = error.response?.data?.message || 'Không thể xóa mềm nhà cung cấp';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleRestore = async (id: number | string) => {
    const supplierId = typeof id === 'number' ? id.toString() : id;
    if (window.confirm('Bạn có chắc chắn muốn khôi phục nhà cung cấp này?')) {
      try {
        await supplierService.restoreSupplier(supplierId);
        showToast('Khôi phục nhà cung cấp thành công', 'success');
        fetchSuppliers();
      } catch (error: any) {
        console.error('Error restoring supplier:', error);
        const errorMessage = error.response?.data?.message || 'Không thể khôi phục nhà cung cấp';
        showToast(errorMessage, 'error');
      }
    }
  };

  const handleHardDelete = async (id: number | string) => {
    const supplierId = typeof id === 'number' ? id.toString() : id;
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn nhà cung cấp này? Hành động này không thể hoàn tác!')) {
      if (window.confirm('Cảnh báo: Xóa vĩnh viễn sẽ không thể khôi phục. Bạn vẫn muốn tiếp tục?')) {
        try {
          await supplierService.deleteSupplier(supplierId);
          showToast('Xóa vĩnh viễn nhà cung cấp thành công', 'success');
          fetchSuppliers();
        } catch (error: any) {
          console.error('Error hard deleting supplier:', error);
          const errorMessage = error.response?.data?.message || 'Không thể xóa vĩnh viễn nhà cung cấp';
          showToast(errorMessage, 'error');
        }
      }
    }
  };

  const filteredSuppliers = (suppliers || []).filter(supplier => {
    const matchesSearch = supplier.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());
    // Kiểm tra trạng thái dựa trên dang_hoat_dong và xac_thuc
    let status = 'hoat_dong';
    if (supplier.dang_hoat_dong === false || supplier.xac_thuc === false) {
      status = 'cho_duyet';
    }
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    // Lọc theo trạng thái xóa (nếu cần hiển thị đã xóa)
    const matchesDeleted = showDeleted ? true : (supplier.dang_hoat_dong !== false || supplier.xac_thuc !== false);
    return matchesSearch && matchesStatus && matchesDeleted;
  });

  const stats = {
    total: suppliers.length,
    active: suppliers.filter(s => s.dang_hoat_dong === true && s.xac_thuc === true).length,
    pending: suppliers.filter(s => s.dang_hoat_dong === false || s.xac_thuc === false).length,
    blocked: 0,
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl blur opacity-60"></div>
                <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Quản Lý Nhà Cung Cấp</h1>
                <p className="text-slate-400">Quản lý danh sách nhà cung cấp trong hệ thống</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Tổng cộng</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-xl flex items-center justify-center border border-violet-500/30">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Hoạt động</p>
              <p className="text-3xl font-bold text-emerald-400">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Chờ duyệt</p>
              <p className="text-3xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Tạm khóa</p>
              <p className="text-3xl font-bold text-rose-400">{stats.blocked}</p>
            </div>
            <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center border border-rose-500/30">
              <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all"
                placeholder="Tìm theo tên hoặc email..."
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showDeleted}
                onChange={(e) => setShowDeleted(e.target.checked)}
                className="w-4 h-4 text-violet-500 bg-white/5 border-white/10 rounded focus:ring-violet-500/50 focus:ring-2"
              />
              <span className="text-sm text-slate-400">Hiển thị đã xóa</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="all" className="bg-slate-900">Tất cả trạng thái</option>
              <option value="hoat_dong" className="bg-slate-900">Hoạt động</option>
              <option value="tam_khoa" className="bg-slate-900">Tạm khóa</option>
              <option value="cho_duyet" className="bg-slate-900">Chờ duyệt</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-400">
          Hiển thị <span className="font-semibold text-white">{filteredSuppliers.length}</span> nhà cung cấp
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Chưa có nhà cung cấp nào</h3>
            <p className="text-slate-500">Danh sách nhà cung cấp sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Nhà Cung Cấp</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Thông Tin Liên Hệ</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Trạng Thái</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Ngày Tạo</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-6">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSuppliers.map((supplier) => {
                  const isPending = supplier.dang_hoat_dong === false || supplier.xac_thuc === false;
                  const style = isPending ? STATUS_STYLES['cho_duyet'] : STATUS_STYLES['hoat_dong'];
                  const statusLabel = isPending ? 'Chờ duyệt' : 'Hoạt động';
                  
                  return (
                    <tr key={supplier.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {supplier.logo ? (
                            <img
                              src={supplier.logo}
                              alt={supplier.ten}
                              className="w-12 h-12 rounded-xl object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-white/10">
                              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{supplier.ten}</p>
                            {supplier.dia_chi && (
                              <p className="text-sm text-slate-400 flex items-center mt-1">
                                <svg className="w-4 h-4 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {supplier.dia_chi}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="text-sm text-white flex items-center">
                            <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            {supplier.email}
                          </p>
                          {supplier.so_dien_thoai && (
                            <p className="text-sm text-slate-400 flex items-center">
                              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {supplier.so_dien_thoai}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${style.bg} rounded-lg`}>
                          <span className={`w-1.5 h-1.5 ${style.dot} rounded-full`}></span>
                          <span className={`text-xs font-medium ${style.text}`}>
                            {statusLabel}
                          </span>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-slate-400">
                          {supplier.ngay_tao ? new Date(supplier.ngay_tao).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-end items-center gap-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApprove(supplier.id)}
                                className="px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all flex items-center gap-1.5"
                                title="Duyệt"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleReject(supplier.id)}
                                className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition-all flex items-center gap-1.5"
                                title="Từ chối"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Từ chối
                              </button>
                            </>
                          ) : showDeleted ? (
                            <>
                              <button
                                onClick={() => handleRestore(supplier.id)}
                                className="px-3 py-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition-all flex items-center gap-1.5"
                                title="Khôi phục"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Khôi phục
                              </button>
                              <button
                                onClick={() => handleHardDelete(supplier.id)}
                                className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all flex items-center gap-1.5"
                                title="Xóa vĩnh viễn"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Xóa vĩnh viễn
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSoftDelete(supplier.id)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Xóa mềm"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
