import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendationService } from '../../services/recommendationService';
import type { GetAllTour } from '../../types/tour';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../common/Loading';
import { useToast } from '../../hooks/useToast';

interface RecommendedToursProps {
  method?: 'preferences' | 'destinations' | 'history' | 'ai';
  limit?: number;
  title?: string;
  showMethodSelector?: boolean;
}

export const RecommendedTours = ({
  method = 'preferences',
  limit = 10,
  title,
  showMethodSelector = false,
}: RecommendedToursProps) => {
  const [tours, setTours] = useState<GetAllTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(method);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadRecommendedTours();
  }, [selectedMethod, limit]);

  const loadRecommendedTours = async () => {
    try {
      setLoading(true);
      const response = await recommendationService.getRecommendedTours(selectedMethod, limit, 0);
      
      // Đảm bảo response tồn tại
      if (!response) {
        setTours([]);
        setAiRecommendation(null);
        return;
      }

      // Kiểm tra nếu là AI recommendation
      // AI response có cấu trúc: { message, data: { tours: [], ai_recommendation: "" }, method }
      if (selectedMethod === 'ai' && response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        const aiData = response.data as any;
        if ('tours' in aiData && 'ai_recommendation' in aiData) {
          setTours(Array.isArray(aiData.tours) ? aiData.tours : []);
          setAiRecommendation(aiData.ai_recommendation || null);
        } else {
          setTours([]);
          setAiRecommendation(null);
        }
      } else {
        // Response là RecommendedToursResponse với data là array
        // Cấu trúc: { message, data: GetAllTour[], method }
        if (response.data && Array.isArray(response.data)) {
          setTours(response.data);
        } else {
          setTours([]);
        }
        setAiRecommendation(null);
      }
    } catch (error: any) {
      console.error('Error loading recommended tours:', error);
      showToast('Không thể tải tour gợi ý', 'error');
      setTours([]);
      setAiRecommendation(null);
    } finally {
      setLoading(false);
    }
  };

  const getMethodLabel = (m: string) => {
    switch (m) {
      case 'preferences':
        return 'Sở thích của bạn';
      case 'destinations':
        return 'Điểm đến yêu thích';
      case 'history':
        return 'Lịch sử xem';
      case 'ai':
        return 'Gợi ý AI';
      default:
        return 'Gợi ý';
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex justify-center items-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400">Chưa có tour gợi ý. Hãy xem thêm tour để nhận gợi ý phù hợp!</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {title || `Tour gợi ý - ${getMethodLabel(selectedMethod)}`}
          </h2>
          <p className="text-slate-400">
            {tours?.length || 0} tour được gợi ý dựa trên {getMethodLabel(selectedMethod).toLowerCase()}
          </p>
        </div>

        {showMethodSelector && (
          <div className="flex gap-2">
            {['preferences', 'destinations', 'history', 'ai'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedMethod === m
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {getMethodLabel(m)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Recommendation Text */}
      {aiRecommendation && (
        <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">🤖</span>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">Gợi ý từ AI</h3>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{aiRecommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tours Horizontal Scroll */}
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
          <div className="flex gap-6 min-w-max">
            {tours.map((tour, index) => (
              <div key={tour.id} className="w-80 flex-shrink-0">
                <TourCard tour={tour} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tour Card Component
const TourCard = ({ tour, index }: { tour: GetAllTour; index: number }) => {
  return (
    <Link
      to={`/tours/${tour.id}`}
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
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
          <img
            src={tour.anh_chinh || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'}
            alt={tour.tieu_de}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          {/* Featured Badge */}
          {tour.noi_bat && (
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-pink-500/30 text-pink-300 text-xs font-semibold rounded-full border border-pink-400/30 backdrop-blur-sm">
                ⭐ Nổi bật
              </span>
            </div>
          )}

          {/* Rating */}
          {tour.avg_rating > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white text-xs font-semibold">{tour.avg_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {tour.tieu_de}
          </h3>

          {/* Destinations */}
          {tour.diem_den && tour.diem_den.length > 0 && (
            <div className="flex items-center gap-2 mb-3 text-sm text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">
                {Array.isArray(tour.diem_den) ? tour.diem_den.join(', ') : tour.diem_den}
              </span>
            </div>
          )}

          {/* Duration & Category */}
          <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {tour.so_ngay} ngày {tour.so_dem} đêm
            </span>
            {tour.danh_muc_ten && (
              <span className="px-2 py-1 bg-slate-800/50 rounded">
                {tour.danh_muc_ten}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div>
              <p className="text-xs text-slate-400 mb-1">Từ</p>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                {formatCurrency(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
              </p>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-sm font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Xem chi tiết
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

