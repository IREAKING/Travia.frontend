import { useEffect, useState } from 'react';
import { tourService } from '../../services/tourService';
import type { TourCategory } from '../../types';
import { LoadingSpinner } from '../../components/common/Loading';

export const TourCategories = () => {
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tourService.getAllCategories();
        setCategories(data);
        console.log('Tour Categories:', data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Không thể tải danh mục tour');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 bg-gray-950">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <span className="mt-4 block text-gray-400">Đang tải danh mục...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 bg-gray-950">
        <div className="inline-flex flex-col items-center p-8 bg-red-500/10 border border-red-500/20 rounded-2xl">
          <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-semibold text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all duration-300"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-950">
      <div className="px-4 py-12 text-center">
        <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4">
          Khám phá đa dạng
        </span>
        <h2 className="text-4xl md:text-5xl font-bold text-white">
          Danh Mục
          <span className="block mt-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Tour Du Lịch
          </span>
        </h2>
      </div>
      
      {categories.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex flex-col items-center p-8 bg-gray-900/50 border border-white/10 rounded-2xl">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-400 text-lg">Không có danh mục nào</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {categories.map((category) => (
            <div key={category.id} className="relative group cursor-pointer">
              <div className="relative h-[400px] w-full overflow-hidden">
                <img
                  src={category.anh || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=60'}
                  alt={category.ten}
                  className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-6 text-center">
                  <h3 className="text-white text-2xl md:text-3xl font-bold mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {category.ten}
                  </h3>
                  
                  {typeof category.total_tours === 'number' && (
                    <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                      {category.total_tours} tours khám phá
                    </p>
                  )}
                  
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-200">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-amber-500/20">
                      Khám phá
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
