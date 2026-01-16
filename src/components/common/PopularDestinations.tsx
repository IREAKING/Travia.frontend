import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { destinationService, type TopPopularDestination } from '../../services/destinationService';
import { LoadingSpinner } from './Loading';

interface PopularDestinationsProps {
  limit?: number;
  showTitle?: boolean;
  variant?: 'grid' | 'list' | 'carousel';
}

export const PopularDestinations: React.FC<PopularDestinationsProps> = ({
  limit = 8,
  showTitle = true,
  variant = 'grid'
}) => {
  const [destinations, setDestinations] = useState<TopPopularDestination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDestinations = async () => {
      setLoading(true);
      try {
        const data = await destinationService.getTopPopularDestinations(limit);
        setDestinations(data);
      } catch (error) {
        console.error('Error loading popular destinations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDestinations();
  }, [limit]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Không có điểm đến phổ biến nào</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showTitle && (
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-4">
            ⭐ Phổ biến nhất
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Điểm đến <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Phổ biến</span>
          </h2>
          <p className="text-slate-400 mt-2">Những điểm đến được yêu thích nhất</p>
        </div>
      )}

      {variant === 'grid' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/tours?diem_den_id=${destination.id}`}
              className="group relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all h-full">
                {destination.anh && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={destination.anh}
                      alt={destination.ten}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
                      {destination.so_luong_tour} tours
                    </div>
                    {destination.so_tour_noi_bat > 0 && (
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg shadow-purple-500/30">
                        ⭐ {destination.so_tour_noi_bat} nổi bật
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-xl text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {destination.ten}
                  </h3>
                  <p className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
                    <span className="text-cyan-400">📍</span>
                    {destination.khu_vuc && `${destination.khu_vuc}, `}
                    {destination.quoc_gia || 'Việt Nam'}
                  </p>
                  {destination.mo_ta && (
                    <p className="text-slate-500 text-sm line-clamp-2">{destination.mo_ta}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {variant === 'list' && (
        <div className="space-y-4">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/tours?diem_den_id=${destination.id}`}
              className="group flex items-center gap-4 p-4 bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              {destination.anh && (
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={destination.anh}
                    alt={destination.ten}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-white mb-1 group-hover:text-cyan-400 transition-colors">
                  {destination.ten}
                </h3>
                <p className="text-slate-400 text-sm mb-2">
                  {destination.khu_vuc && `${destination.khu_vuc}, `}
                  {destination.quoc_gia || 'Việt Nam'}
                </p>
                {destination.mo_ta && (
                  <p className="text-slate-500 text-sm line-clamp-1">{destination.mo_ta}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full">
                  {destination.so_luong_tour} tours
                </div>
                {destination.so_tour_noi_bat > 0 && (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                    ⭐ {destination.so_tour_noi_bat}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {variant === 'carousel' && (
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {destinations.map((destination) => (
              <Link
                key={destination.id}
                to={`/tours?diem_den_id=${destination.id}`}
                className="group relative flex-shrink-0 w-80"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all" />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all h-full">
                  {destination.anh && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={destination.anh}
                        alt={destination.ten}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                      <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
                        {destination.so_luong_tour} tours
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-xl text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      {destination.ten}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {destination.khu_vuc && `${destination.khu_vuc}, `}
                      {destination.quoc_gia || 'Việt Nam'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
