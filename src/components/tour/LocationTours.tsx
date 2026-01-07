import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tourService } from '../../services/tourService';
import type { GetAllTour } from '../../types/tour';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../common/Loading';
import { useToast } from '../../hooks/useToast';

interface LocationToursProps {
  limit?: number;
  title?: string;
}

export const LocationTours = ({ limit = 10, title }: LocationToursProps) => {
  const [domesticTours, setDomesticTours] = useState<GetAllTour[]>([]);
  const [internationalTours, setInternationalTours] = useState<GetAllTour[]>([]);
  const [countryCode, setCountryCode] = useState<string>('VN');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    loadToursByLocation();
  }, [limit]);

  const loadToursByLocation = async () => {
    try {
      setLoading(true);
      const data = await tourService.getToursByLocation(limit, 0);
      setDomesticTours(data.tours_quoc_noi || []);
      setInternationalTours(data.tours_quoc_te || []);
      setCountryCode(data.country_code || 'VN');
    } catch (error: any) {
      console.error('Error loading tours by location:', error);
      showToast('Không thể tải tour theo vị trí', 'error');
      setDomesticTours([]);
      setInternationalTours([]);
    } finally {
      setLoading(false);
    }
  };

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      VN: 'Việt Nam',
      US: 'Hoa Kỳ',
      AU: 'Australia',
      JP: 'Nhật Bản',
      KR: 'Hàn Quốc',
      TH: 'Thái Lan',
      SG: 'Singapore',
      MY: 'Malaysia',
      ID: 'Indonesia',
      PH: 'Philippines',
      CN: 'Trung Quốc',
      GB: 'Anh',
      FR: 'Pháp',
      DE: 'Đức',
      IT: 'Ý',
      ES: 'Tây Ban Nha',
    };
    return countries[code] || code;
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

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {title || `Tour dành cho bạn - ${getCountryName(countryCode)}`}
        </h2>
        <p className="text-slate-400">
          Phát hiện bạn đang ở <span className="font-semibold text-cyan-400">{getCountryName(countryCode)}</span>
        </p>
      </div>

      {/* Domestic Tours */}
      {domesticTours.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-purple-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-bold text-white">Tour Quốc Nội</h3>
                <p className="text-slate-400 text-sm">Các tour trong nước phù hợp với bạn</p>
              </div>
            </div>
            <Link to="/tours?type=domestic" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium hidden md:flex items-center gap-1">
              Xem tất cả
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
              <div className="flex gap-6 min-w-max">
                {domesticTours.map((tour, index) => (
                  <div key={tour.id} className="w-80 flex-shrink-0">
                    <TourCard tour={tour} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* International Tours */}
      {internationalTours.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <div>
                <h3 className="text-2xl font-bold text-white">Tour Quốc Tế</h3>
                <p className="text-slate-400 text-sm">Khám phá các điểm đến quốc tế</p>
              </div>
            </div>
            <Link to="/tours?type=international" className="text-purple-400 hover:text-purple-300 text-sm font-medium hidden md:flex items-center gap-1">
              Xem tất cả
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          <div className="relative">
            <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
              <div className="flex gap-6 min-w-max">
                {internationalTours.map((tour, index) => (
                  <div key={tour.id} className="w-80 flex-shrink-0">
                    <TourCard tour={tour} index={index} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {domesticTours.length === 0 && internationalTours.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Chưa có tour nào</h3>
          <p className="text-slate-400">Hiện tại chưa có tour phù hợp với vị trí của bạn</p>
        </div>
      )}
    </div>
  );
};

// Tour Card Component (reused from RecommendedTours)
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

