import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { tourService } from '../../services/tourService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import type { TourCategory, SearchToursParams } from '../../types';
import type { GetAllTour } from '../../types/tour';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/Loading';

export const ToursPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [tours, setTours] = useState<GetAllTour[]>([]);
  // const [allTours, setAllTours] = useState<GetAllTour[]>([]);
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSearchParams, setCurrentSearchParams] = useState<SearchToursParams>({});
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const selectedCategory = searchParams.get('category');

  // Load favorites from API when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFavorites();
    }
  }, [isAuthenticated, user]);

  const loadFavorites = async () => {
    try {
      const favoriteTours = await favoriteService.getFavorites();
      const favoriteIds = new Set(favoriteTours.map(fav => fav.tour_id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const toggleFavorite = async (tourId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !user) {
      showToast('Vui lòng đăng nhập để thêm tour yêu thích', 'warning');
      return;
    }

    try {
      const isFavorite = favorites.has(tourId);
      
      if (isFavorite) {
        await favoriteService.removeFavorite(tourId);
    setFavorites(prev => {
      const newFavorites = new Set(prev);
        newFavorites.delete(tourId);
          return newFavorites;
        });
        showToast('Đã xóa khỏi danh sách yêu thích', 'success');
      } else {
        await favoriteService.addFavorite(tourId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
        newFavorites.add(tourId);
      return newFavorites;
    });
        showToast('Đã thêm vào danh sách yêu thích', 'success');
      }
    } catch (error: any) {
      console.error('Failed to toggle favorite:', error);
      const errorMessage = error?.response?.data?.error || 'Có lỗi xảy ra';
      showToast(errorMessage, 'error');
    }
  };

  // Parse search params from URL
  const getSearchParamsFromURL = useCallback((): SearchToursParams => {
    return {
      query: searchParams.get('query') || undefined,
      diem_den_ten: searchParams.get('diem_den_ten') || undefined,
      so_ngay_min: searchParams.get('so_ngay_min') ? parseInt(searchParams.get('so_ngay_min')!) : undefined,
      so_ngay_max: searchParams.get('so_ngay_max') ? parseInt(searchParams.get('so_ngay_max')!) : undefined,
    };
  }, [searchParams]);

  // Initial fetch - check URL params for search
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesData = await tourService.getAllCategories();
        setCategories(categoriesData || []);

        const urlParams = getSearchParamsFromURL();
        const hasSearchParams = urlParams.query || urlParams.diem_den_ten || urlParams.so_ngay_min || urlParams.so_ngay_max;

        if (hasSearchParams) {
          // Search with URL params
          setCurrentSearchParams(urlParams);
          setIsSearching(true);
          const results = await tourService.searchTours({
            ...urlParams,
            limit: 50,
            offset: 0,
          });
          setTours(results || []);
        } else {
          // Fetch all tours
          const toursData = await tourService.getAllTours();
          setTours(toursData || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setTours([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getSearchParamsFromURL]);

  // Filter by category (client-side)
  let filteredTours = tours;
  if (selectedCategory && filteredTours) {
    filteredTours = filteredTours.filter((t) => t.danh_muc_id === parseInt(selectedCategory));
  }

  // Pagination calculations
  const totalPages = Math.ceil((filteredTours?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTours = filteredTours?.slice(startIndex, endIndex) || [];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, tours.length]);

  // Clear all filters
  const handleClearFilters = async () => {
    setSearchParams({});
    setCurrentSearchParams({});
    setIsSearching(false);
    setLoading(true);
    try {
      const toursData = await tourService.getAllTours();
      setTours(toursData || []);
    } catch (error) {
      console.error('Failed to fetch tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    // Preserve search params when changing category
    const newParams = new URLSearchParams(searchParams);
    if (categoryId) {
      newParams.set('category', categoryId);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  // Tour Card Component - Dark & Ethereal Style
  const TourCard = ({ tour, index }: { tour: GetAllTour; index: number }) => {
    const isFavorited = favorites.has(tour.id);

    return (
      <div
        className="group relative rounded-2xl overflow-hidden transition-all duration-700 transform hover:-translate-y-2 hover:scale-[1.02]"
        style={{ 
          animationDelay: `${index * 80}ms`,
          background: 'linear-gradient(145deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
        }}
      >
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-hover:opacity-75 blur-xl transition-all duration-700 group-hover:duration-500" />
        
        {/* Card Content */}
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all duration-500">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Link to={`/tours/${tour.id}`}>
              <img
                src={tour.anh_chinh || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'}
                alt={tour.tieu_de}
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110"
              />
              {/* Overlay Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Link>

            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
              {/* Featured Badge */}
              {tour.noi_bat && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/50 animate-pulse">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  HOT
                </span>
              )}

              {/* Favorite Button */}
              <button
                onClick={(e) => toggleFavorite(tour.id, e)}
                className={`p-2 rounded-xl backdrop-blur-xl transition-all duration-500 hover:scale-110 ${
                  isFavorited
                    ? 'bg-pink-500/80 text-white shadow-lg shadow-pink-500/50'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <svg
                  className={`w-4 h-4 transition-all duration-500 ${isFavorited ? 'scale-110' : ''}`}
                  fill={isFavorited ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>

            {/* Bottom Info on Image */}
            <div className="absolute bottom-3 left-3 right-3 z-10">
              {/* Destinations */}
              {tour.diem_den && tour.diem_den.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tour.diem_den.slice(0, 2).map((diemDen, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/10 backdrop-blur-xl text-white text-xs font-medium rounded-lg border border-white/10"
                    >
                      <svg className="w-2.5 h-2.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {diemDen}
                    </span>
                  ))}
                  {tour.diem_den.length > 2 && (
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-xl text-white text-xs font-medium rounded-lg">
                      +{tour.diem_den.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Duration Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-xl text-white text-xs font-semibold rounded-lg border border-white/10">
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {tour.so_ngay} ngày {tour.so_dem} đêm
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Category & Rating */}
            <div className="flex items-center justify-between mb-3">
              {tour.danh_muc_ten && (
                <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/30">
                  {tour.danh_muc_ten}
                </span>
              )}
              {tour.avg_rating && tour.avg_rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 rounded-lg border border-amber-500/30">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-bold text-amber-300">{tour.avg_rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-slate-500">({tour.total_reviews})</span>
                </div>
              )}
            </div>

            {/* Title */}
            <Link to={`/tours/${tour.id}`}>
              <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors duration-300 line-clamp-2 mb-2">
                {tour.tieu_de}
              </h3>
            </Link>

            {/* Provider */}
            {tour.nha_cung_cap_ten && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="text-xs text-slate-400">{tour.nha_cung_cap_ten}</span>
              </div>
            )}

            {/* Price Section */}
            <div className="flex items-end justify-between pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-0.5">Giá từ</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {formatCurrency(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
                  </span>
                </div>
              </div>
              <Link
                to={`/tours/${tour.id}`}
                className="relative inline-flex items-center gap-1.5 px-4 py-2 overflow-hidden rounded-xl font-bold text-white transition-all duration-500 group/btn"
              >
                {/* Button glow background */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                <span className="absolute inset-[2px] bg-slate-900 rounded-lg group-hover/btn:bg-slate-800 transition-colors duration-300" />
                <span className="relative z-10 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold text-sm">Khám phá</span>
                <svg className="w-3.5 h-3.5 relative z-10 text-purple-400 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      {/* Hero Section - Dark & Ethereal */}
      <div className="relative py-24 overflow-hidden bg-[#030712]">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} 
          />
          
          {/* Floating Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/5 backdrop-blur-xl text-cyan-300 text-sm font-semibold rounded-full border border-cyan-500/30 mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              {isSearching ? 'Kết quả tìm kiếm' : 'Khám phá thế giới cùng chúng tôi'}
            </span>
            <h1 className="text-5xl md:text-6xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isSearching ? (
                <>
                  <span className="text-white">Kết quả cho </span>
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {currentSearchParams.query || currentSearchParams.diem_den_ten || 'bộ lọc'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-white">Tất cả </span>
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Tour</span>
                </>
              )}
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              {isSearching 
                ? `Tìm thấy ${tours.length} tour phù hợp với tiêu chí của bạn`
                : 'Hàng nghìn trải nghiệm du lịch độc đáo đang chờ bạn'
              }
            </p>
            
            {/* Search Info Tags */}
            {isSearching && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {currentSearchParams.query && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-300 text-sm font-medium rounded-full border border-cyan-500/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {currentSearchParams.query}
                  </span>
                )}
                {currentSearchParams.diem_den_ten && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 text-purple-300 text-sm font-medium rounded-full border border-purple-500/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {currentSearchParams.diem_den_ten}
                  </span>
                )}
                {(currentSearchParams.so_ngay_min || currentSearchParams.so_ngay_max) && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/20 text-pink-300 text-sm font-medium rounded-full border border-pink-500/30">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {currentSearchParams.so_ngay_min && currentSearchParams.so_ngay_max 
                      ? `${currentSearchParams.so_ngay_min}-${currentSearchParams.so_ngay_max} ngày`
                      : currentSearchParams.so_ngay_min 
                        ? `Từ ${currentSearchParams.so_ngay_min} ngày`
                        : `Đến ${currentSearchParams.so_ngay_max} ngày`
                    }
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-400 text-sm font-medium rounded-full border border-white/10 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Bar - Glassmorphism */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide flex-1">
              <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Danh mục:</span>
              <button
                onClick={() => handleCategoryChange(null)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                Tất cả
              </button>
              {categories && categories.length > 0 && categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id.toString())}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                    selectedCategory === category.id.toString()
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {category.ten}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-1 p-1.5 bg-white/5 rounded-xl border border-white/10 ml-4">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tours Section */}
      <div className="bg-[#030712] min-h-screen">
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-12 relative z-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredTours.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center border border-white/10">
                <svg className="w-14 h-14 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3">Không tìm thấy tour nào</h3>
              <p className="text-slate-500 mb-8">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between mb-10">
                <p className="text-slate-400">
                  Hiển thị <span className="font-bold text-white">{startIndex + 1}-{Math.min(endIndex, filteredTours.length)}</span> trong tổng <span className="font-bold text-white">{filteredTours.length}</span> tour
                  {selectedCategory && categories.find(c => c.id.toString() === selectedCategory) && (
                    <span className="ml-1">
                      trong <span className="font-semibold text-cyan-400">{categories.find(c => c.id.toString() === selectedCategory)?.ten}</span>
                    </span>
                  )}
                </p>
              </div>

              {/* Tours Grid */}
              <div className={`grid gap-8 md:gap-10 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {paginatedTours.map((tour, index) => (
                  <TourCard key={tour.id} tour={tour} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {filteredTours.length > 0 && totalPages > 1 && (
                <div className="mt-12">
                  {/* Pagination Controls */}
                  <div className="flex items-center justify-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/10'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/30'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        if (!showPage) {
                          // Show ellipsis
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="px-2 text-slate-500">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 min-w-[44px] ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/30'
                                : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/20'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/10'
                          : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 hover:border-white/30'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add floating animation keyframe */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </MainLayout>
  );
};
