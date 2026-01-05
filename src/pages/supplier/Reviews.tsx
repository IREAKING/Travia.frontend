import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { supplierService } from '../../services/supplierService';
import type { 
  SupplierReviewStatistics, 
  SupplierDetailedReview, 
  SupplierOptionTour 
} from '../../types';

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';

export const SupplierReviewsPage = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<SupplierDetailedReview[]>([]);
  const [statistics, setStatistics] = useState<SupplierReviewStatistics | null>(null);
  const [optionTours, setOptionTours] = useState<SupplierOptionTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [tourFilter, setTourFilter] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOptionTours();
    loadStatistics();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [ratingFilter, tourFilter]);

  const loadOptionTours = async () => {
    try {
      const result = await supplierService.getOptionTours();
      setOptionTours(result);
    } catch (error) {
      console.error('Error loading option tours:', error);
      showToast('Không thể tải danh sách tour', 'error');
    }
  };

  const loadStatistics = async () => {
    try {
      setLoadingStats(true);
      const tourId = tourFilter || undefined;
      const result = await supplierService.getReviewStatistics(tourId);
      setStatistics(result);
    } catch (error) {
      console.error('Error loading review statistics:', error);
      showToast('Không thể tải thống kê đánh giá', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      const rating = ratingFilter === 'all' ? undefined : parseInt(ratingFilter);
      const tourId = tourFilter;
      const result = await supplierService.getDetailedReviews(rating, tourId);
      setReviews(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Không thể tải danh sách đánh giá', 'error');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [tourFilter]);


  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const filteredReviews = (Array.isArray(reviews) ? reviews : []).filter(review => {
    const matchesSearch = 
      (review.tour_tieu_de?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (review.nguoi_dung_ten?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (review.noi_dung?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (review.tieu_de?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    return matchesSearch;
  });

  const averageRating = statistics 
    ? statistics.diem_trung_binh.toFixed(1)
    : '0.0';

  const ratingDistribution = statistics ? {
    5: statistics.so_luong_5_sao,
    4: statistics.so_luong_4_sao,
    3: statistics.so_luong_3_sao,
    2: statistics.so_luong_2_sao,
    1: statistics.so_luong_1_sao,
  } : {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  const totalReviews = statistics?.so_luong_danh_gia || 0;

  if (loading) {
    return (
      <DashboardLayout sidebar={<SupplierSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải đánh giá..." />
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
              <h1 className="text-3xl font-bold text-white mb-2">Đánh Giá & Nhận Xét</h1>
              <p className="text-cyan-300">Quản lý phản hồi từ khách hàng</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
              <svg className="w-8 h-8 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="text-center">
            {loadingStats ? (
              <div className="h-20 flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
            <div className="text-5xl font-bold text-cyan-400 mb-2">{averageRating}</div>
            {renderStars(parseFloat(averageRating), 'lg')}
                <p className="text-sm text-gray-400 mt-2">{totalReviews} đánh giá</p>
              </>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tổng đánh giá</p>
              {loadingStats ? (
                <div className="h-8 w-16 bg-cyan-500/20 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-cyan-400">{totalReviews}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center border border-cyan-400/30">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">5 sao</p>
              {loadingStats ? (
                <div className="h-8 w-16 bg-purple-500/20 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-purple-400">{ratingDistribution[5]}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
              <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-pink-500/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">1 sao</p>
              {loadingStats ? (
                <div className="h-8 w-16 bg-pink-500/20 rounded animate-pulse"></div>
              ) : (
                <p className="text-3xl font-bold text-pink-400">{ratingDistribution[1]}</p>
              )}
            </div>
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center border border-pink-400/30">
              <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {/* Rating Distribution */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Phân bố đánh giá</h3>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating as keyof typeof ratingDistribution];
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-300">{rating}</span>
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-300 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Bộ lọc</h3>
          
          <div className="space-y-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tìm kiếm</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Tìm theo tour, khách hàng, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                />
              </div>
            </div>

            {/* Tour Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Lọc theo tour</label>
              <select
                value={tourFilter || ''}
                onChange={(e) => setTourFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
              >
                <option value="">Tất cả tour</option>
                {optionTours.map((tour) => (
                  <option key={tour.id} value={tour.id} className="bg-slate-800">
                    {tour.tieu_de || `Tour #${tour.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Lọc theo số sao</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setRatingFilter('all')}
                  className={`px-4 py-2 rounded-lg transition-colors border ${
                    ratingFilter === 'all'
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-cyan-400/50'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  Tất cả
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setRatingFilter(rating.toString() as RatingFilter)}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 border ${
                      ratingFilter === rating.toString()
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {rating}
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Hiển thị <span className="font-semibold text-cyan-300">{filteredReviews.length}</span> đánh giá
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy đánh giá</h3>
          <p className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.danh_gia_id} className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6 hover:shadow-cyan-500/20 transition-all">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full flex items-center justify-center text-cyan-300 font-semibold text-lg border border-cyan-400/30">
                    {review.nguoi_dung_ten?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{review.nguoi_dung_ten || 'Khách hàng'}</h4>
                    <p className="text-sm text-gray-400">{review.tour_tieu_de || `Tour #${review.tour_id}`}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.diem_danh_gia, 'sm')}
                      <span className="text-xs text-gray-400">
                        {new Date(review.ngay_tao).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              {review.tieu_de && (
                <div className="mb-2">
                  <h5 className="font-medium text-white">{review.tieu_de}</h5>
                </div>
              )}

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-gray-300">{review.noi_dung || 'Không có nội dung'}</p>
              </div>

              {/* Review Images */}
              {review.hinh_anh_dinh_kem && review.hinh_anh_dinh_kem.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {review.hinh_anh_dinh_kem.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Review image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-white/10"
                    />
                  ))}
                </div>
              )}

              {/* Reply Section - Disabled for now as backend doesn't support it */}
              <div className="text-xs text-gray-500 italic">
                Tính năng trả lời đánh giá sẽ được cập nhật sau
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

