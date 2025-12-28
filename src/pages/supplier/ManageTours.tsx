import { useState, useEffect, type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { supplierTourService } from '../../services/supplierTourService';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';

type ViewMode = 'grid' | 'table';
type StatusFilter = 'all' | 'nhap' | 'cong_bo' | 'luu_tru';

export const ManageToursPage = () => {
  const { showToast } = useToast();
  const [tours, setTours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  useEffect(() => {
    loadTours();
  }, [statusFilter]);

  const loadTours = async () => {
    try {
      setLoading(true);
      // Truyền trang_thai vào API, 'all' sẽ được convert thành '' (lấy tất cả)
      const toursData = await supplierTourService.getMyTours(100, 0, statusFilter);
      setTours(toursData || []); // Fix: Ensure always array
    } catch (error) {
      console.error('Error loading tours:', error);
      showToast('Không thể tải danh sách tour', 'error');
      setTours([]);
    } finally {
      setLoading(false);
    }
  };

  // Update tour status
  const handleUpdateStatus = async (tourId: number, newStatus: string) => {
    try {
      setUpdatingStatusId(tourId);
      // Validate status
      if (!['nhap', 'cong_bo', 'luu_tru'].includes(newStatus)) {
        showToast('Trạng thái không hợp lệ', 'error');
        return;
      }
      await supplierTourService.updateTourStatus(tourId, newStatus as 'nhap' | 'cong_bo' | 'luu_tru');
      showToast('Cập nhật trạng thái thành công!', 'success');
      // Reload tours để đảm bảo danh sách được cập nhật theo filter hiện tại
      await loadTours();
    } catch (error: any) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái';
      showToast(errorMessage, 'error');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete tour
  const handleDeleteTour = async (tourId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      setDeletingId(tourId);
      await supplierTourService.deleteTour(tourId);
      setTours(prev => prev.filter(tour => tour.id !== tourId));
      showToast('Xóa tour thành công!', 'success');
    } catch (error) {
      console.error('Error deleting tour:', error);
      showToast('Có lỗi xảy ra khi xóa tour', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Format price
  const formatPrice = (price: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { text: string; className: string; icon: ReactElement } } = {
      'nhap': { 
        text: 'Nháp', 
        className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        )
      },
      'cong_bo': { 
        text: 'Công bố', 
        className: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'luu_tru': { 
        text: 'Lưu trữ', 
        className: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
        icon: (
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        )
      },
    };
    
    const statusInfo = statusMap[status] || { text: status, className: 'bg-gray-500/20 text-gray-300 border border-gray-500/30', icon: <></> };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${statusInfo.className}`}>
        {statusInfo.icon}
        {statusInfo.text}
      </span>
    );
  };

  // Filter tours (API đã filter theo statusFilter, chỉ cần filter search ở client-side)
  const filteredTours = (tours || []).filter(tour => {
    const matchesSearch = tour.tieu_de?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.danh_muc_ten?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: tours.length,
    published: tours.filter(t => t.trang_thai === 'cong_bo').length,
    draft: tours.filter(t => t.trang_thai === 'nhap').length,
    featured: tours.filter(t => t.noi_bat).length,
    archived: tours.filter(t => t.trang_thai === 'luu_tru').length,
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<SupplierSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" variant="default" text="Đang tải tours..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<SupplierSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-pink-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold text-white mb-2">Quản Lý Tours</h1>
              <p className="text-cyan-300">Quản lý và theo dõi các tour du lịch của bạn</p>
          </div>
          <Link
            to="/supplier/tours/create"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 flex items-center font-semibold shadow-lg shadow-cyan-500/25"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tạo Tour Mới
          </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tổng Tours</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Đã Công Bố</p>
              <p className="text-3xl font-bold text-cyan-400">{stats.published}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Nháp</p>
              <p className="text-3xl font-bold text-gray-300">{stats.draft}</p>
            </div>
            <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center border border-gray-400/30">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-pink-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Nổi Bật</p>
              <p className="text-3xl font-bold text-pink-400">{stats.featured}</p>
            </div>
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center border border-pink-400/30">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Lưu Trữ</p>
              <p className="text-3xl font-bold text-purple-400">{stats.archived}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm tour theo tên, danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
            >
              <option value="all" className="bg-slate-900">Tất cả</option>
              <option value="nhap" className="bg-slate-900">Nháp</option>
              <option value="cong_bo" className="bg-slate-900">Đã công bố</option>
              <option value="luu_tru" className="bg-slate-900">Lưu trữ</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-400/30' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-400/30' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-400">
          Hiển thị <span className="font-semibold text-cyan-300">{filteredTours.length}</span> tours
          {searchTerm && ` với từ khóa "${searchTerm}"`}
        </div>
      </div>

      {/* Tours List */}
      {filteredTours.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {tours.length === 0 ? 'Chưa có tour nào' : 'Không tìm thấy tour'}
          </h3>
          <p className="text-gray-400 mb-6">
            {tours.length === 0 
              ? 'Bắt đầu tạo tour đầu tiên của bạn' 
              : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
          </p>
          {tours.length === 0 && (
            <Link
              to="/supplier/tours/create"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all font-medium shadow-lg shadow-cyan-500/25"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Tour Mới
            </Link>
          )}
        </div>
      ) : viewMode === 'table' ? (
        // Table View
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Thời Gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900/40 divide-y divide-white/10">
                {filteredTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {tour.anh_dai_dien ? (
                            <img
                              className="h-16 w-16 rounded-lg object-cover border border-white/10"
                              src={tour.anh_dai_dien}
                              alt={tour.tieu_de}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-400/30">
                              <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-white mb-1">
                            {tour.tieu_de}
                          </div>
                          <div className="text-xs text-gray-400">
                            {tour.danh_muc_ten || 'Chưa phân loại'}
                          </div>
                          {tour.noi_bat && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-500/20 text-pink-300 border border-pink-400/30 mt-1">
                              ⭐ Nổi bật
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {tour.so_ngay}N/{tour.so_dem}Đ
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                        {formatPrice(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
                      </div>
                      <div className="text-xs text-gray-400">
                        Trẻ em: {formatPrice(tour.gia_tre_em, tour.don_vi_tien_te)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(tour.trang_thai)}
                        {updatingStatusId !== tour.id && (
                          <select
                            value={tour.trang_thai}
                            onChange={(e) => handleUpdateStatus(tour.id, e.target.value)}
                            className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 focus:ring-2 focus:ring-cyan-500/50 text-white transition-all"
                            disabled={updatingStatusId === tour.id}
                          >
                            <option value="nhap" className="bg-slate-900">Nháp</option>
                            <option value="cong_bo" className="bg-slate-900">Công bố</option>
                            <option value="luu_tru" className="bg-slate-900">Lưu trữ</option>
                          </select>
                        )}
                        {updatingStatusId === tour.id && (
                          <span className="text-xs text-cyan-400">Đang cập nhật...</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(tour.ngay_tao).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center gap-2">
                        <Link
                          to={`/supplier/tours/edit/${tour.id}`}
                          className="p-2 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors border border-cyan-400/30 hover:border-cyan-400/50"
                          title="Xem chi tiết"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          to={`/supplier/tours/edit/${tour.id}`}
                          className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors border border-purple-400/30 hover:border-purple-400/50"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteTour(tour.id)}
                          disabled={deletingId === tour.id}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 border border-red-400/30 hover:border-red-400/50"
                          title="Xóa"
                        >
                          {deletingId === tour.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Grid View
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => (
            <div key={tour.id} className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden hover:shadow-cyan-500/20 transition-all duration-300 group">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                {tour.anh_dai_dien ? (
                  <img
                    src={tour.anh_dai_dien}
                    alt={tour.tieu_de}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-cyan-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(tour.trang_thai)}
                </div>
                {tour.noi_bat && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-pink-500/30 text-pink-300 text-xs font-semibold rounded-full border border-pink-400/30 backdrop-blur-sm">
                      ⭐ Nổi bật
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">
                    {tour.tieu_de}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {tour.danh_muc_ten || 'Chưa phân loại'}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <div className="flex items-center text-sm text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {tour.so_ngay}N/{tour.so_dem}Đ
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyan-400">
                      {formatPrice(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
                    </div>
                    <div className="text-xs text-gray-400">
                      Trẻ em: {formatPrice(tour.gia_tre_em, tour.don_vi_tien_te)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/tours/${tour.id}`}
                    target="_blank"
                    className="flex-1 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors text-center text-sm font-medium border border-cyan-400/30"
                  >
                    Xem
                  </Link>
                  <Link
                    to={`/supplier/tours/edit/${tour.id}`}
                    className="flex-1 px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-center text-sm font-medium border border-purple-400/30"
                  >
                    Sửa
                  </Link>
                  <button
                    onClick={() => handleDeleteTour(tour.id)}
                    disabled={deletingId === tour.id}
                    className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 border border-red-400/30"
                  >
                    {deletingId === tour.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
