import { useState, useEffect } from 'react';
import { reviewService } from '../../services/reviewService';
import type { ReviewsResponse } from '../../types';
import { formatDate } from '../../utils/formatters';

interface ReviewsListProps {
  tourId: number;
}

export const ReviewsList = ({ tourId }: ReviewsListProps) => {
  const [reviewData, setReviewData] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  useEffect(() => {
    loadReviews();
  }, [tourId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewService.getTourReviews(tourId);
      setReviewData(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      setReviewData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Đánh giá từ khách hàng</h2>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-start gap-4 p-4 bg-gray-800/50 border border-white/5 rounded-xl">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reviewData || reviewData.tong_so_danh_gia === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Đánh giá từ khách hàng</h2>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-800/50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <p className="text-lg text-gray-300 mb-2">Chưa có đánh giá nào cho tour này</p>
          <p className="text-sm text-gray-500">Hãy là người đầu tiên đánh giá!</p>
        </div>
      </div>
    );
  }

  // Pagination logic
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const paginatedReviews = reviewData.thong_tin_danh_gia.slice(startIndex, endIndex);
  const totalPages = Math.ceil(reviewData.thong_tin_danh_gia.length / reviewsPerPage);

  // Calculate rating percentages for bar chart
  const ratingDistribution = [
    { stars: 5, count: reviewData.so_luong_5_sao },
    { stars: 4, count: reviewData.so_luong_4_sao },
    { stars: 3, count: reviewData.so_luong_3_sao },
    { stars: 2, count: reviewData.so_luong_2_sao },
    { stars: 1, count: reviewData.so_luong_1_sao },
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-white mb-8">Đánh giá từ khách hàng</h2>

      {/* Rating Overview */}
      <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-white/10">
        {/* Overall Rating */}
        <div className="flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-8">
          <div className="text-6xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-3">
            {reviewData.diem_trung_binh.toFixed(1)}
          </div>
          <div className="flex mb-3">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-6 h-6 ${i < Math.round(reviewData.diem_trung_binh) ? 'text-amber-400' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-400 font-medium">
            Dựa trên {reviewData.tong_so_danh_gia} đánh giá
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-4">
          {ratingDistribution.map((rating) => {
            const percentage = reviewData.tong_so_danh_gia > 0 
              ? (rating.count / reviewData.tong_so_danh_gia) * 100 
              : 0;
            
            return (
              <div key={rating.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-white">{rating.stars}</span>
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-400 w-10 text-right">
                  {rating.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {paginatedReviews.map((review) => (
          <div key={review.id} className="border-b border-white/5 pb-6 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-amber-500/20">
                  {review.ho_ten?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {review.ho_ten || 'Người dùng ẩn danh'}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(review.ngay_tao)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                <span className="text-lg font-bold text-amber-400">{review.diem_danh_gia}</span>
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            {/* Review Title */}
            {review.tieu_de && (
              <h4 className="font-semibold text-white mb-2">{review.tieu_de}</h4>
            )}

            {/* Review Content */}
            <p className="text-gray-300 leading-relaxed">{review.noi_dung}</p>

            {/* Review Images if any */}
            {review.hinh_anh_dinh_kem && review.hinh_anh_dinh_kem.length > 0 && (
              <div className="flex gap-3 mt-4">
                {review.hinh_anh_dinh_kem.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Review ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition border border-white/10"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 hover:border-amber-500/30 transition-all"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                      : 'border border-white/10 text-gray-400 hover:bg-white/5 hover:border-amber-500/30'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`w-10 h-10 rounded-xl font-semibold transition-all ${
                    currentPage === totalPages
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20'
                      : 'border border-white/10 text-gray-400 hover:bg-white/5 hover:border-amber-500/30'
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border border-white/10 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 hover:border-amber-500/30 transition-all"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
