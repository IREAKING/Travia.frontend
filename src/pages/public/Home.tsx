import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { tourService } from '../../services/tourService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { AdvancedSearchBox } from '../../components/common/SearchBox';
import { Testimonials } from '../../components/common/Testimonials';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import type { TourCategory, SearchToursParams } from '../../types';
import type { GetAllTour } from '../../types/tour';
import { formatCurrency } from '../../utils/formatters';
import { LoadingSpinner } from '../../components/common/Loading';
import heroImage from '../../assets/header/sea-6873335.jpg';

export const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [featuredTours, setFeaturedTours] = useState<GetAllTour[]>([]);
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const navigate = useNavigate();
  
  useScrollReveal();

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

  // Handle search - navigate to tours page with search params
  const handleSearch = (params: SearchToursParams) => {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.diem_den_ten) searchParams.set('diem_den_ten', params.diem_den_ten);
    if (params.so_ngay_min) searchParams.set('so_ngay_min', params.so_ngay_min.toString());
    if (params.so_ngay_max) searchParams.set('so_ngay_max', params.so_ngay_max.toString());
    
    navigate(`/tours?${searchParams.toString()}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toursData, categoriesData] = await Promise.all([
          tourService.getAllTours(),
          tourService.getAllCategories(),
        ]);
        setFeaturedTours((toursData || []).filter(t => t.noi_bat).slice(0, 6));
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setFeaturedTours([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  // Featured Tour Card Component - Dark & Ethereal
  const FeaturedTourCard = ({ tour, index }: { tour: GetAllTour; index: number }) => {
    const isFavorited = favorites.has(tour.id);

    return (
      <div
        className={`group relative rounded-3xl overflow-hidden transition-all duration-700 transform hover:-translate-y-3 scroll-reveal stagger-${(index % 3) + 1}`}
      >
        {/* Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-60 blur-xl transition-all duration-700" />
        
        {/* Card */}
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 group-hover:border-white/20">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Link to={`/tours/${tour.id}`}>
              <img
                src={tour.anh_chinh || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800'}
                alt={tour.tieu_de}
                className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Link>

            {/* Badges */}
            <div className="absolute top-4 left-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/50">
                <svg className="w-3.5 h-3.5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                HOT
              </span>
            </div>

            {/* Favorite */}
            <button
              onClick={(e) => toggleFavorite(tour.id, e)}
              className={`absolute top-4 right-4 z-10 p-3 rounded-2xl backdrop-blur-xl transition-all duration-500 hover:scale-110 ${
                isFavorited ? 'bg-pink-500/80 text-white shadow-lg shadow-pink-500/50' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <svg className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Duration */}
            <div className="absolute bottom-4 left-4 z-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl text-white text-sm font-semibold rounded-xl border border-white/10">
                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {tour.so_ngay}N{tour.so_dem}Đ
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              {tour.danh_muc_ten && (
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-semibold rounded-lg border border-cyan-500/30">
                  {tour.danh_muc_ten}
                </span>
              )}
              {tour.avg_rating && tour.avg_rating > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-lg border border-amber-500/30">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-bold text-amber-300">{tour.avg_rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            <Link to={`/tours/${tour.id}`}>
              <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-4">
                {tour.tieu_de}
              </h3>
            </Link>

            <div className="flex items-end justify-between pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-slate-500 mb-1">Chỉ từ</p>
                <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {formatCurrency(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
                </span>
              </div>
              <Link
                to={`/tours/${tour.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105"
              >
                Xem ngay
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Category Card
  const CategoryCard = ({ category, index }: { category: TourCategory; index: number }) => (
    <Link
      to={`/tours?category=${category.id}`}
      className={`group relative p-6 rounded-2xl overflow-hidden transition-all duration-500 scroll-reveal stagger-${(index % 5) + 1}`}
    >
      {/* Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-50 blur-lg transition-all duration-500" />
      
      {/* Card */}
      <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all h-full">
        <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 border border-cyan-500/30">
          <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors mb-2">{category.ten}</h3>
        {category.mo_ta && <p className="text-sm text-slate-500 line-clamp-2">{category.mo_ta}</p>}
        
        {/* Arrow */}
        <div className="absolute bottom-6 right-6 w-10 h-10 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 border border-cyan-500/30">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </Link>
  );

  return (
    <MainLayout>
      {/* Hero Section - Dark & Ethereal */}
      <section className="relative min-h-[800px] w-full overflow-hidden bg-[#030712]">
        {/* Background Image with Overlay */}
        <img src={heroImage} alt="Travia Travel" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/80 via-[#030712]/60 to-[#030712]" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-500/30 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.15) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} 
        />

        <div className="relative container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[800px]">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl text-cyan-300 text-sm font-semibold rounded-full border border-cyan-500/30 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            🌍 Hơn 1000+ trải nghiệm độc đáo
          </span>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 animate-fade-in-down" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Khám Phá</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Thế Giới
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12 animate-fade-in-up animation-delay-200">
            Những hành trình tuyệt vời đang chờ đợi bạn
          </p>
          
          <div className="w-full max-w-5xl mb-16 animate-fade-in animation-delay-400">
            <AdvancedSearchBox onSearch={handleSearch} variant="dark" />
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-8 md:gap-16 animate-fade-in animation-delay-500">
            {[
              { value: '1000+', label: 'Tours' },
              { value: '50K+', label: 'Khách hàng' },
              { value: '4.9', label: 'Đánh giá' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-8 h-14 border-2 border-cyan-500/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Dark Theme */}
      <section className="py-24 bg-[#030712] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-4 scroll-reveal">
              ✨ Khám phá theo sở thích
            </span>
            <h2 className="text-5xl font-black text-white scroll-reveal" style={{ fontFamily: "'Playfair Display', serif" }}>
              Danh Mục <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Tour</span>
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <CategoryCard key={category.id} category={category} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Tours - Dark Theme */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-end justify-between mb-16">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full border border-amber-500/30 mb-4 scroll-reveal">
                🔥 Được yêu thích nhất
              </span>
              <h2 className="text-5xl font-black text-white scroll-reveal" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tours <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Nổi Bật</span>
              </h2>
            </div>
            <Link to="/tours" className="hidden md:inline-flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors scroll-reveal group">
              Xem tất cả
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours.map((tour, index) => (
                <FeaturedTourCard key={tour.id} tour={tour} index={index} />
              ))}
            </div>
          )}

          <div className="text-center mt-16 md:hidden">
            <Link to="/tours" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all">
              Xem Tất Cả Tours
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Why Choose Us - Dark & Ethereal */}
      <section className="py-24 bg-[#030712] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[180px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[180px]" />
          <div 
            className="absolute inset-0 opacity-5" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }} 
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-400 text-sm font-semibold rounded-full border border-white/10 mb-4 scroll-reveal">
              💎 Vì sao chọn chúng tôi?
            </span>
            <h2 className="text-5xl font-black scroll-reveal" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="text-white">Tại Sao Chọn </span>
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Travia?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
                title: 'Đảm Bảo Chất Lượng',
                desc: 'Tất cả tours đều được kiểm duyệt kỹ lưỡng bởi đội ngũ chuyên gia',
                gradient: 'from-emerald-400 to-cyan-500',
                glow: 'emerald',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
                title: 'Giá Tốt Nhất',
                desc: 'Cam kết giá cạnh tranh nhất thị trường với nhiều ưu đãi hấp dẫn',
                gradient: 'from-amber-400 to-orange-500',
                glow: 'amber',
              },
              {
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />,
                title: 'Hỗ Trợ 24/7',
                desc: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ bạn mọi lúc',
                gradient: 'from-purple-400 to-pink-500',
                glow: 'purple',
              },
            ].map((item, index) => (
              <div key={index} className={`group relative scroll-reveal stagger-${index + 1}`}>
                {/* Glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-700`} />
                
                {/* Card */}
                <div className="relative p-8 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 group-hover:border-white/20 transition-all h-full">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-${item.glow}-500/30`}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                </svg>
              </div>
                  <h3 className="font-bold text-2xl text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
              </div>
            ))}
            </div>

          {/* CTA */}
          <div className="text-center mt-20 scroll-reveal">
            <Link to="/tours" className="relative inline-flex items-center gap-3 px-12 py-6 overflow-hidden rounded-2xl font-bold text-lg transition-all duration-500 group">
              {/* Animated gradient border */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl" />
              <span className="absolute inset-[2px] bg-slate-900 rounded-xl group-hover:bg-slate-800 transition-colors" />
              <span className="relative z-10 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Bắt Đầu Khám Phá
              </span>
              <svg className="w-6 h-6 relative z-10 text-purple-400 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Float Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </MainLayout>
  );
};
