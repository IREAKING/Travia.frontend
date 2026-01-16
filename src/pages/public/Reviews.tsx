import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useToast } from '../../hooks/useToast';

interface Review {
  id: number;
  tour_id: number;
  nguoi_dung_id: string;
  dat_cho_id: number;
  rating: number;
  tieu_de: string;
  noi_dung: string;
  hinh_anh_url: string[];
  dang_hoat_dong: boolean;
  ngay_tao: string;
  ngay_cap_nhat: string;
  nguoi_dung: { ho_ten: string; anh_dai_dien?: string };
}

interface ReviewFormData {
  rating: number;
  tieu_de: string;
  noi_dung: string;
  hinh_anh_url: string[];
}

export const ReviewsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tourData, setTourData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFormData, setReviewFormData] = useState<ReviewFormData>({ rating: 5, tieu_de: '', noi_dung: '', hinh_anh_url: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (id) loadTourAndReviews(); }, [id]);

  const loadTourAndReviews = async () => {
    try {
      setLoading(true);
      const mockTour = { id: parseInt(id || '1'), tieu_de: 'Tour Hà Nội - Sapa 3 ngày 2 đêm', mo_ta: 'Khám phá vẻ đẹp của Sapa với những ruộng bậc thang tuyệt đẹp', anh: '/placeholder-tour.jpg', gia_nguoi_lon: 2500000, so_ngay: 3, so_dem: 2 };
      const mockReviews: Review[] = [
        { id: 1, tour_id: parseInt(id || '1'), nguoi_dung_id: 'user1', dat_cho_id: 1, rating: 5, tieu_de: 'Tour tuyệt vời!', noi_dung: 'Chuyến đi rất thú vị, hướng dẫn viên nhiệt tình, cảnh đẹp tuyệt vời.', hinh_anh_url: [], dang_hoat_dong: true, ngay_tao: '2024-01-15T10:00:00Z', ngay_cap_nhat: '2024-01-15T10:00:00Z', nguoi_dung: { ho_ten: 'Nguyễn Văn A' } },
        { id: 2, tour_id: parseInt(id || '1'), nguoi_dung_id: 'user2', dat_cho_id: 2, rating: 4, tieu_de: 'Trải nghiệm tốt', noi_dung: 'Tour khá ổn, giá cả hợp lý. Chỉ có một chút là thời gian hơi gấp gáp.', hinh_anh_url: [], dang_hoat_dong: true, ngay_tao: '2024-01-10T14:30:00Z', ngay_cap_nhat: '2024-01-10T14:30:00Z', nguoi_dung: { ho_ten: 'Trần Thị B' } }
      ];
      setTourData(mockTour);
      setReviews(mockReviews);
    } catch (error) {
      showToast('Không thể tải thông tin', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewFormData.tieu_de.trim() || !reviewFormData.noi_dung.trim()) { showToast('Vui lòng điền đầy đủ thông tin', 'error'); return; }
    setSubmitting(true);
    try {
      const newReview: Review = { id: Date.now(), tour_id: parseInt(id || '1'), nguoi_dung_id: 'current_user', dat_cho_id: 1, rating: reviewFormData.rating, tieu_de: reviewFormData.tieu_de, noi_dung: reviewFormData.noi_dung, hinh_anh_url: [], dang_hoat_dong: true, ngay_tao: new Date().toISOString(), ngay_cap_nhat: new Date().toISOString(), nguoi_dung: { ho_ten: 'Bạn' } };
      setReviews(prev => [newReview, ...prev]);
      setReviewFormData({ rating: 5, tieu_de: '', noi_dung: '', hinh_anh_url: [] });
      setShowReviewForm(false);
      showToast('Đánh giá đã được gửi!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type={interactive ? 'button' : undefined} onClick={interactive && onChange ? () => onChange(star) : undefined} disabled={!interactive} className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}>
          <svg className={`w-6 h-6 ${star <= rating ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );

  const getAverageRating = () => reviews.length === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const getRatingDistribution = () => { const d = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }; reviews.forEach(r => { d[r.rating as keyof typeof d]++; }); return d; };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Đang tải...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#030712]">
        {/* Hero */}
        <div className="relative py-16 bg-[#0a0f1a] overflow-hidden">
          <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-amber-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[120px]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </button>
            
            <div className="flex items-center gap-6">
              {tourData && (
                <>
                  <img src={tourData.anh} alt={tourData.tieu_de} className="w-20 h-20 object-cover rounded-2xl border border-white/10" />
                  <div>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full border border-amber-500/30 mb-2">
                      ⭐ Đánh giá tour
                    </span>
                    <h1 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{tourData.tieu_de}</h1>
                    <p className="text-slate-400">{tourData.so_ngay} ngày {tourData.so_dem} đêm</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">Tổng quan</h3>
                  <div className="text-right">
                    <div className="text-5xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">{getAverageRating().toFixed(1)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(Math.round(getAverageRating()))}
                      <span className="text-slate-400 text-sm">({reviews.length})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = getRatingDistribution()[rating as keyof typeof getRatingDistribution];
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-medium text-slate-400">{rating}</span>
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="w-8 text-sm text-slate-500 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write Review */}
              <button onClick={() => setShowReviewForm(!showReviewForm)} className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-[1.02]">
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {showReviewForm ? 'Hủy đánh giá' : 'Viết đánh giá'}
                </span>
              </button>

              {/* Review Form */}
              {showReviewForm && (
                <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 animate-fade-in">
                  <h3 className="text-2xl font-bold text-white mb-6">Viết đánh giá</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-3">Đánh giá của bạn</label>
                      <div className="flex items-center gap-3">
                        {renderStars(reviewFormData.rating, true, (r) => setReviewFormData(prev => ({ ...prev, rating: r })))}
                        <span className="text-lg font-bold text-amber-400">{reviewFormData.rating}/5</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Tiêu đề *</label>
                      <input type="text" required value={reviewFormData.tieu_de} onChange={(e) => setReviewFormData(prev => ({ ...prev, tieu_de: e.target.value }))} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all" placeholder="Nhập tiêu đề" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Nội dung *</label>
                      <textarea required value={reviewFormData.noi_dung} onChange={(e) => setReviewFormData(prev => ({ ...prev, noi_dung: e.target.value }))} rows={5} className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none" placeholder="Chia sẻ trải nghiệm của bạn..." />
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setShowReviewForm(false)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all">Hủy</button>
                      <button type="submit" disabled={submitting} className="flex-[2] py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50">
                        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">💬</div>
                    <h3 className="text-xl font-bold text-white mb-2">Chưa có đánh giá</h3>
                    <p className="text-slate-400">Hãy là người đầu tiên!</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {review.nguoi_dung.ho_ten.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-white">{review.nguoi_dung.ho_ten}</h4>
                            <span className="text-sm text-slate-500">{new Date(review.ngay_tao).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            {renderStars(review.rating)}
                            <span className="text-sm text-slate-400">{review.rating}/5</span>
                          </div>
                          <h5 className="font-semibold text-white mb-2">{review.tieu_de}</h5>
                          <p className="text-slate-400 leading-relaxed">{review.noi_dung}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">Thông tin tour</h3>
                {tourData && (
                  <div className="space-y-4">
                    <img src={tourData.anh} alt={tourData.tieu_de} className="w-full h-48 object-cover rounded-2xl border border-white/10" />
                    <h4 className="font-bold text-white">{tourData.tieu_de}</h4>
                    <p className="text-slate-400 text-sm">{tourData.mo_ta}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        {tourData.gia_nguoi_lon?.toLocaleString('vi-VN')} VND
                      </span>
                      <span className="text-slate-500">/người</span>
                    </div>
                    <button onClick={() => navigate(`/tours/${tourData.id}`)} className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all">
                      Xem chi tiết tour
                    </button>
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
