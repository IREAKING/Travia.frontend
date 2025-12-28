import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { tourService } from '../../services/tourService';
import { formatCurrency } from '../../utils/formatters';
import type { GetAllTour } from '../../types/tour';

type TourStatus = 'all' | 'hoat_dong' | 'tam_dung' | 'cho_duyet';

export const TourManagementPage = () => {
  const { showToast } = useToast();
  const [tours, setTours] = useState<GetAllTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TourStatus>('all');
  const [selectedTour, setSelectedTour] = useState<GetAllTour | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      setLoading(true);
      const data = await tourService.getAllTours();
      setTours(data || []);
    } catch (error) {
      console.error('Error loading tours:', error);
      showToast('Không thể tải danh sách tour', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (tourId: number, newStatus: string) => {
    try {
      // API call to update status would go here
      await new Promise(resolve => setTimeout(resolve, 500));
      setTours(prev => prev.map(tour => 
        tour.id === tourId ? { ...tour, trang_thai: newStatus } : tour
      ));
      showToast('Cập nhật trạng thái thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const handleDeleteTour = async (tourId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tour này?')) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTours(prev => prev.filter(tour => tour.id !== tourId));
      showToast('Xóa tour thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; text: string; dot: string }> = {
      'hoat_dong': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400' },
      'tam_dung': { bg: 'bg-amber-500/20', text: 'text-amber-400', dot: 'bg-amber-400' },
      'cho_duyet': { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-400' },
      'da_xoa': { bg: 'bg-rose-500/20', text: 'text-rose-400', dot: 'bg-rose-400' },
    };
    return styles[status] || styles['hoat_dong'];
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'hoat_dong': 'Hoạt động',
      'tam_dung': 'Tạm dừng',
      'cho_duyet': 'Chờ duyệt',
      'da_xoa': 'Đã xóa',
    };
    return labels[status] || status;
  };

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.tieu_de?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.nha_cung_cap_ten?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tour.trang_thai === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tours.length,
    active: tours.filter(t => t.trang_thai === 'hoat_dong').length,
    pending: tours.filter(t => t.trang_thai === 'cho_duyet').length,
    paused: tours.filter(t => t.trang_thai === 'tam_dung').length,
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<AdminSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải danh sách tour..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-[#030712]">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-amber-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(rgba(251,191,36,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl blur opacity-60"></div>
                <div className="relative w-16 h-16 bg-slate-900/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Quản Lý Tours</h1>
                <p className="text-slate-400">Quản lý tất cả tour trong hệ thống</p>
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
              <p className="text-slate-400 text-sm mb-1">Tổng Tours</p>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Đang Hoạt Động</p>
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
              <p className="text-slate-400 text-sm mb-1">Chờ Duyệt</p>
              <p className="text-3xl font-bold text-blue-400">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-500/30">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Tạm Dừng</p>
              <p className="text-3xl font-bold text-amber-400">{stats.paused}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                placeholder="Tìm theo tên tour, nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TourStatus)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="all" className="bg-slate-900">Tất cả trạng thái</option>
              <option value="hoat_dong" className="bg-slate-900">Hoạt động</option>
              <option value="cho_duyet" className="bg-slate-900">Chờ duyệt</option>
              <option value="tam_dung" className="bg-slate-900">Tạm dừng</option>
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-400">
          Hiển thị <span className="font-semibold text-white">{filteredTours.length}</span> tour
        </div>
      </div>

      {/* Tours Grid */}
      {filteredTours.length === 0 ? (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/10">
          <div className="w-20 h-20 mx-auto mb-6 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/10">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy tour nào</h3>
          <p className="text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTours.map((tour) => {
            const statusStyle = getStatusStyle(tour.trang_thai || 'hoat_dong');
            return (
              <div key={tour.id} className="group relative rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-2">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500"></div>
                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={tour.anh_chinh || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'}
                      alt={tour.tieu_de}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${statusStyle.bg} rounded-lg backdrop-blur-xl`}>
                        <span className={`w-1.5 h-1.5 ${statusStyle.dot} rounded-full`}></span>
                        <span className={`text-xs font-medium ${statusStyle.text}`}>
                          {getStatusLabel(tour.trang_thai || 'hoat_dong')}
                        </span>
                      </span>
                    </div>

                    {/* Featured Badge */}
                    {tour.noi_bat && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          HOT
                        </span>
                      </div>
                    )}

                    {/* Duration */}
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-xl text-white text-sm font-medium rounded-lg">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {tour.so_ngay}N{tour.so_dem}Đ
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category */}
                    {tour.danh_muc_ten && (
                      <span className="inline-block px-2.5 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-lg border border-cyan-500/30 mb-3">
                        {tour.danh_muc_ten}
                      </span>
                    )}

                    {/* Title */}
                    <h3 className="font-bold text-white text-lg line-clamp-2 mb-2 group-hover:text-cyan-300 transition-colors">
                      {tour.tieu_de}
                    </h3>

                    {/* Supplier */}
                    <p className="text-sm text-slate-400 mb-4">
                      <span className="text-slate-500">Nhà cung cấp:</span> {tour.nha_cung_cap_ten || 'N/A'}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Giá từ</p>
                        <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                          {formatCurrency(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTour(tour);
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
                        <select
                          value={tour.trang_thai || 'hoat_dong'}
                          onChange={(e) => handleStatusChange(tour.id, e.target.value)}
                          className="text-xs px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                          <option value="hoat_dong" className="bg-slate-900">Hoạt động</option>
                          <option value="cho_duyet" className="bg-slate-900">Chờ duyệt</option>
                          <option value="tam_dung" className="bg-slate-900">Tạm dừng</option>
                        </select>
                        <button
                          onClick={() => handleDeleteTour(tour.id)}
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTour && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm" onClick={() => setShowDetailModal(false)}></div>
            
            <div className="relative inline-block w-full max-w-3xl overflow-hidden text-left align-middle transition-all transform bg-slate-900 rounded-3xl shadow-2xl border border-white/10">
              {/* Header Image */}
              <div className="relative h-64">
                <img
                  src={selectedTour.anh_chinh || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'}
                  alt={selectedTour.tieu_de}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-xl text-white hover:bg-white/20 rounded-xl transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8">
                {/* Title & Category */}
                <div className="mb-6">
                  {selectedTour.danh_muc_ten && (
                    <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 text-sm font-medium rounded-lg border border-cyan-500/30 mb-3">
                      {selectedTour.danh_muc_ten}
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-white">{selectedTour.tieu_de}</h2>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Nhà cung cấp</p>
                    <p className="text-white font-medium">{selectedTour.nha_cung_cap_ten || 'N/A'}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Thời gian</p>
                    <p className="text-white font-medium">{selectedTour.so_ngay} ngày {selectedTour.so_dem} đêm</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Giá người lớn</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {formatCurrency(selectedTour.gia_nguoi_lon, selectedTour.don_vi_tien_te)}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">Giá trẻ em</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                      {formatCurrency(selectedTour.gia_tre_em || 0, selectedTour.don_vi_tien_te)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {selectedTour.mo_ta && (
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-2">Mô tả</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{selectedTour.mo_ta}</p>
                  </div>
                )}

                {/* Destinations */}
                {selectedTour.diem_den && selectedTour.diem_den.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-2">Điểm đến</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTour.diem_den.map((dest, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 text-slate-300 text-sm rounded-lg border border-white/10">
                          <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                  >
                    Đóng
                  </button>
                  <a
                    href={`/tours/${selectedTour.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                  >
                    Xem trên trang
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

