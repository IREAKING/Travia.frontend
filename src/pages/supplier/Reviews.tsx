import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';

interface Review {
  id: number;
  tour_id: number;
  tour_tieu_de: string;
  nguoi_dung_id: number;
  nguoi_dung_ten: string;
  nguoi_dung_avatar?: string;
  diem_so: number;
  noi_dung: string;
  ngay_tao: string;
  tra_loi?: string;
  ngay_tra_loi?: string;
}

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';

export const SupplierReviewsPage = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Mock data
  const mockReviews: Review[] = [
    {
      id: 1,
      tour_id: 101,
      tour_tieu_de: 'Du lịch Đà Nẵng 3N2Đ',
      nguoi_dung_id: 201,
      nguoi_dung_ten: 'Nguyễn Văn A',
      diem_so: 5,
      noi_dung: 'Tour rất tuyệt vời! Hướng dẫn viên nhiệt tình, khách sạn sạch sẽ, lịch trình hợp lý. Gia đình tôi rất hài lòng!',
      ngay_tao: '2024-11-10T14:30:00Z'
    },
    {
      id: 2,
      tour_id: 102,
      tour_tieu_de: 'Phú Quốc 4N3Đ',
      nguoi_dung_id: 202,
      nguoi_dung_ten: 'Trần Thị B',
      diem_so: 4,
      noi_dung: 'Tour tốt nhưng lịch trình hơi gấp. Nên dành thêm thời gian ở mỗi địa điểm.',
      ngay_tao: '2024-11-08T10:20:00Z',
      tra_loi: 'Cảm ơn bạn đã góp ý! Chúng tôi sẽ cân nhắc điều chỉnh lịch trình cho phù hợp hơn.',
      ngay_tra_loi: '2024-11-09T09:00:00Z'
    },
    {
      id: 3,
      tour_id: 103,
      tour_tieu_de: 'Sapa 3N2Đ',
      nguoi_dung_id: 203,
      nguoi_dung_ten: 'Lê Văn C',
      diem_so: 5,
      noi_dung: 'Phong cảnh đẹp tuyệt vời! Đội ngũ tổ chức chuyên nghiệp, nhiệt tình. Sẽ quay lại lần sau.',
      ngay_tao: '2024-11-05T16:45:00Z',
      tra_loi: 'Cảm ơn bạn rất nhiều! Rất vui khi bạn hài lòng với dịch vụ của chúng tôi.',
      ngay_tra_loi: '2024-11-06T08:30:00Z'
    },
    {
      id: 4,
      tour_id: 101,
      tour_tieu_de: 'Du lịch Đà Nẵng 3N2Đ',
      nguoi_dung_id: 204,
      nguoi_dung_ten: 'Phạm Thị D',
      diem_so: 3,
      noi_dung: 'Tour tạm ổn. Một số dịch vụ chưa được như mong đợi.',
      ngay_tao: '2024-11-03T12:00:00Z'
    }
  ];

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Không thể tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId: number) => {
    if (!replyText.trim()) {
      showToast('Vui lòng nhập nội dung trả lời', 'error');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, tra_loi: replyText, ngay_tra_loi: new Date().toISOString() }
          : review
      ));
      showToast('Trả lời đánh giá thành công!', 'success');
      setReplyingTo(null);
      setReplyText('');
    } catch (error) {
      showToast('Có lỗi xảy ra khi trả lời', 'error');
    }
  };

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

  const filteredReviews = reviews.filter(review => {
    const matchesRating = ratingFilter === 'all' || review.diem_so === parseInt(ratingFilter);
    const matchesSearch = review.tour_tieu_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.nguoi_dung_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.noi_dung.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.diem_so, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingDistribution = {
    5: reviews.filter(r => r.diem_so === 5).length,
    4: reviews.filter(r => r.diem_so === 4).length,
    3: reviews.filter(r => r.diem_so === 3).length,
    2: reviews.filter(r => r.diem_so === 2).length,
    1: reviews.filter(r => r.diem_so === 1).length,
  };

  const repliedCount = reviews.filter(r => r.tra_loi).length;

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
            <div className="text-5xl font-bold text-cyan-400 mb-2">{averageRating}</div>
            {renderStars(parseFloat(averageRating), 'lg')}
            <p className="text-sm text-gray-400 mt-2">{reviews.length} đánh giá</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-cyan-500/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">Tổng đánh giá</p>
              <p className="text-3xl font-bold text-cyan-400">{reviews.length}</p>
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
              <p className="text-sm text-gray-400 mb-1">Đã trả lời</p>
              <p className="text-3xl font-bold text-purple-400">{repliedCount}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-400/30">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 p-6 hover:shadow-pink-500/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-400 mb-1">Chờ trả lời</p>
              <p className="text-3xl font-bold text-pink-400">{reviews.length - repliedCount}</p>
            </div>
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center border border-pink-400/30">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              
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
            <div key={review.id} className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6 hover:shadow-cyan-500/20 transition-all">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full flex items-center justify-center text-cyan-300 font-semibold text-lg border border-cyan-400/30">
                    {review.nguoi_dung_ten.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{review.nguoi_dung_ten}</h4>
                    <p className="text-sm text-gray-400">{review.tour_tieu_de}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.diem_so, 'sm')}
                      <span className="text-xs text-gray-400">
                        {new Date(review.ngay_tao).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="mb-4">
                <p className="text-gray-300">{review.noi_dung}</p>
              </div>

              {/* Reply Section */}
              {review.tra_loi ? (
                <div className="bg-cyan-500/10 rounded-lg p-4 border-l-4 border-cyan-500">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cyan-300 mb-1">Phản hồi của bạn</p>
                      <p className="text-sm text-cyan-200">{review.tra_loi}</p>
                      <p className="text-xs text-cyan-400 mt-2">
                        {new Date(review.ngay_tra_loi!).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ) : replyingTo === review.id ? (
                <div className="space-y-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập phản hồi của bạn..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReply(review.id)}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all shadow-lg shadow-cyan-500/25"
                    >
                      Gửi phản hồi
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                      className="px-4 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setReplyingTo(review.id)}
                  className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  Trả lời
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

