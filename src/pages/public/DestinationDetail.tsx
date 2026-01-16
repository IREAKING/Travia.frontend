import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { LoadingSpinner } from '../../components/common/Loading';
import { destinationService, type Destination } from '../../services/destinationService';
import { formatCurrency } from '../../utils/formatters';
import type { GetAllTour } from '../../types/tour';

type TourWithDiscount = GetAllTour & {
  giam_gia_phan_tram?: number | null;
  gia_sau_giam_nguoi_lon?: number | null;
};

export const DestinationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [tours, setTours] = useState<TourWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  const [toursLoading, setToursLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    if (id) {
      loadDestination();
      loadTours();
    }
  }, [id, page]);

  const loadDestination = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await destinationService.getDestinationById(parseInt(id));
      setDestination(data);
    } catch (error) {
      console.error('Error loading destination:', error);
      navigate('/destinations');
    } finally {
      setLoading(false);
    }
  };

  const loadTours = async () => {
    if (!id) return;
    try {
      setToursLoading(true);
      const offset = (page - 1) * pageSize;
      const data = await destinationService.getToursByDestination(parseInt(id), pageSize, offset);
      setTours(data as TourWithDiscount[]);
      // Estimate total pages (có thể cải thiện bằng cách thêm count API)
      setTotalPages(Math.ceil(data.length / pageSize) || 1);
    } catch (error) {
      console.error('Error loading tours:', error);
    } finally {
      setToursLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  if (!destination) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-slate-400">Không tìm thấy điểm đến</p>
          <Link to="/destinations" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
            Quay lại danh sách điểm đến
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] bg-[#030712] overflow-hidden flex items-center">
        {/* Background Image */}
        {destination.anh ? (
          <img
            src={destination.anh}
            alt={destination.ten}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/50 to-purple-900/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-[#030712]/50" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative container mx-auto px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-6">
            📍 Điểm đến
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">{destination.ten}</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-400 mb-6">
            {destination.khu_vuc && (
              <span className="flex items-center gap-2">
                <span>🗺️</span>
                {destination.khu_vuc}
              </span>
            )}
            {destination.quoc_gia && (
              <span className="flex items-center gap-2">
                <span>🌍</span>
                {destination.quoc_gia}
              </span>
            )}
          </div>
          {destination.mo_ta && (
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              {destination.mo_ta}
            </p>
          )}
        </div>
      </section>

      {/* Tours Section */}
      <section className="py-20 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full border border-amber-500/30 mb-4">
                🎯 Tours tại {destination.ten}
              </span>
              <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tours <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Khám phá</span>
              </h2>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <span className="text-white font-medium">{tours.length}</span>
              <span className="text-slate-400"> tours</span>
            </div>
          </div>

          {toursLoading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : tours.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                🎒
              </div>
              <p className="text-slate-400 text-lg mb-4">Chưa có tour nào cho điểm đến này</p>
              <Link
                to="/tours"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
              >
                Xem tất cả tours
              </Link>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tours.map((tour) => (
                  <Link
                    key={tour.id}
                    to={`/tour/${tour.id}`}
                    className="group relative"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all" />
                    <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all h-full">
                      {tour.anh_chinh && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={tour.anh_chinh}
                            alt={tour.tieu_de}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                          {tour.noi_bat && (
                            <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/30">
                              ⭐ Nổi bật
                            </div>
                          )}
                          {tour.giam_gia_phan_tram && (
                            <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-red-500/30">
                              -{tour.giam_gia_phan_tram}%
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-xl text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                          {tour.tieu_de}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                          <span>📅 {tour.so_ngay} ngày</span>
                          {tour.so_dem > 0 && <span>🌙 {tour.so_dem} đêm</span>}
                        </div>
                        {tour.avg_rating > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-white font-medium">{tour.avg_rating.toFixed(1)}</span>
                            <span className="text-slate-400">({tour.total_reviews})</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            {tour.gia_sau_giam_nguoi_lon ? (
                              <>
                                <p className="text-2xl font-bold text-cyan-400">
                                  {formatCurrency(tour.gia_sau_giam_nguoi_lon, tour.don_vi_tien_te || 'VND')}
                                </p>
                                <p className="text-sm text-slate-500 line-through">
                                  {formatCurrency(tour.gia_nguoi_lon, tour.don_vi_tien_te || 'VND')}
                                </p>
                              </>
                            ) : (
                              <p className="text-2xl font-bold text-cyan-400">
                                {formatCurrency(tour.gia_nguoi_lon, tour.don_vi_tien_te || 'VND')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Trước
                  </button>
                  <span className="text-slate-400">
                    Trang {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Back to Destinations */}
      <section className="py-12 bg-[#030712]">
        <div className="container mx-auto px-4 text-center">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại danh sách điểm đến
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};
