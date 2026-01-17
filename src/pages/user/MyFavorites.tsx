import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/common/Loading';
import { formatCurrency } from '../../utils/formatters';
import { favoriteService } from '../../services/favoriteService';
import { api } from '../../services/api';
import type { GetAllTour } from '../../types/tour';
import { useToast } from '../../hooks/useToast';

interface TourImage {
  id: number;
  duong_dan: string;
  la_anh_chinh: boolean;
}

interface TourDestination {
  id: number;
  ten: string;
}

interface TourDetail {
  id: number;
  tieu_de: string;
  mo_ta: string;
  so_ngay: number;
  so_dem: number;
  gia_nguoi_lon: number;
  gia_tre_em: number;
  don_vi_tien_te: string;
  trang_thai: string;
  noi_bat: boolean;
  ten_danh_muc?: string;
  ten_nha_cung_cap?: string;
  diem_trung_binh?: number;
  tong_so_danh_gia?: number;
  diem_den?: TourDestination[];
  hinh_anh?: TourImage[];
  lich_khoi_hanh?: Array<{ ngay_khoi_hanh: string }>;
}

interface ApiResponse<T> {
  data: T;
  message: string;
}

export const MyFavoritesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [favoriteTourIds, setFavoriteTourIds] = useState<number[]>([]);
  const [tours, setTours] = useState<GetAllTour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const mapTourDetailToCard = (tour: TourDetail): GetAllTour => {
    const mainImage =
      tour.hinh_anh?.find(img => img.la_anh_chinh)?.duong_dan ||
      tour.hinh_anh?.[0]?.duong_dan ||
      '';

    return {
      id: tour.id,
      tieu_de: tour.tieu_de,
      mo_ta: tour.mo_ta,
      so_ngay: tour.so_ngay,
      so_dem: tour.so_dem,
      gia_nguoi_lon: tour.gia_nguoi_lon,
      gia_tre_em: tour.gia_tre_em,
      don_vi_tien_te: tour.don_vi_tien_te,
      trang_thai: tour.trang_thai,
      noi_bat: tour.noi_bat,
      danh_muc_ten: tour.ten_danh_muc || '',
      nha_cung_cap_ten: tour.ten_nha_cung_cap || '',
      anh_chinh: mainImage,
      diem_den: tour.diem_den?.map(item => item.ten) || [],
      avg_rating: tour.diem_trung_binh || 0,
      total_reviews: tour.tong_so_danh_gia || 0,
      next_departure_date: tour.lich_khoi_hanh?.[0]?.ngay_khoi_hanh || null,
    };
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const favorites = await favoriteService.getFavorites();
      const tourIds = favorites.map(fav => fav.tour_id);
      setFavoriteTourIds(tourIds);

      // Fetch tour details for each favorite
      if (tourIds.length > 0) {
        const tourPromises = tourIds.map(id => api.get<ApiResponse<TourDetail>>(`/tour/${id}`));
        const tourResults = await Promise.allSettled(tourPromises);
        const successfulTours = tourResults
          .filter((result) => result.status === 'fulfilled')
          .map(result => (result as PromiseFulfilledResult<any>).value.data.data as TourDetail)
          .map(mapTourDetailToCard);
        setTours(successfulTours);
      } else {
        setTours([]);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      showToast('Không thể tải danh sách tour yêu thích', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (tourId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const isFavorite = favoriteTourIds.includes(tourId);
      
      if (isFavorite) {
        await favoriteService.removeFavorite(tourId);
        setFavoriteTourIds(prev => prev.filter(id => id !== tourId));
        setTours(prev => prev.filter(tour => tour.id !== tourId));
        showToast('Đã xóa khỏi danh sách yêu thích', 'success');
      } else {
        await favoriteService.addFavorite(tourId);
        setFavoriteTourIds(prev => [...prev, tourId]);
        showToast('Đã thêm vào danh sách yêu thích', 'success');
      }
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
      const errorMessage = error?.response?.data?.error || 'Có lỗi xảy ra';
      showToast(errorMessage, 'error');
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section - Dark & Ethereal */}
      <section className="relative min-h-[400px] w-full overflow-hidden bg-[#030712]">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} 
        />

        <div className="relative container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[400px]">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl text-cyan-300 text-sm font-semibold rounded-full border border-cyan-500/30 mb-6">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            ❤️ Tour yêu thích
          </span>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Tour Yêu Thích </span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Của Tôi
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl">
            Danh sách các tour bạn đã yêu thích
          </p>
        </div>
      </section>

      {/* Tours Content */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/30 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full animate-pulse opacity-30" />
                  <svg className="w-16 h-16 text-cyan-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Chưa có tour yêu thích nào</h3>
                <p className="text-slate-400 mb-8 text-lg">Hãy khám phá các tour tuyệt vời và thêm vào danh sách yêu thích!</p>
                <Link 
                  to="/tours" 
                  className="relative inline-flex items-center gap-2 px-8 py-4 overflow-hidden rounded-xl font-bold text-white transition-all duration-500 group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl" />
                  <span className="absolute inset-[2px] bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors" />
                  <span className="relative z-10 flex items-center gap-2">
                    Khám phá tours
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour, index) => (
                  <TourCard 
                    key={tour.id} 
                    tour={tour} 
                    index={index}
                    isFavorite={favoriteTourIds.includes(tour.id)}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

// Tour Card Component
const TourCard = ({ 
  tour, 
  index, 
  isFavorite, 
  onToggleFavorite 
}: { 
  tour: GetAllTour; 
  index: number;
  isFavorite: boolean;
  onToggleFavorite: (tourId: number, e: React.MouseEvent) => void;
}) => {
  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-700 transform hover:-translate-y-2 hover:scale-[1.02]"
      style={{ 
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700 group-hover:duration-500" />
      
      {/* Card Content */}
      <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all duration-500">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden">
          <Link to={`/tours/${tour.id}`}>
            <img
              src={tour.anh_chinh || '/placeholder-tour.jpg'}
              alt={tour.tieu_de}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          {/* Favorite Button */}
          <button
            onClick={(e) => onToggleFavorite(tour.id, e)}
            className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-xl transition-all duration-300 ${
              isFavorite
                ? 'bg-rose-500/90 text-white shadow-lg shadow-rose-500/50'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            <svg 
              className={`w-5 h-5 transition-all duration-300 ${isFavorite ? 'scale-110' : ''}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {/* Price Badge */}
          {tour.gia_nguoi_lon && (
            <div className="absolute bottom-4 left-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl backdrop-blur-xl">
              <span className="text-white font-bold text-lg">
                {formatCurrency(Number(tour.gia_nguoi_lon), tour.don_vi_tien_te || 'VND')}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <Link to={`/tours/${tour.id}`}>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors line-clamp-2">
              {tour.tieu_de}
            </h3>
          </Link>
          
          {tour.mo_ta && (
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">
              {tour.mo_ta}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{tour.diem_den?.join(', ') || 'N/A'}</span>
            </div>

            <Link
              to={`/tours/${tour.id}`}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

