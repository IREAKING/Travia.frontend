import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Loading } from '../../components/common/Loading';
import { api } from '../../services/api';
import { ReviewsList } from '../../components/tour/ReviewsList';

// Type definitions
interface TourDestination {
  id: number;
  ten: string;
  tinh: string;
  quoc_gia: string;
  khu_vuc: string | null;
  mo_ta: string | null;
  anh: string | null;
  vi_do: number;
  kinh_do: number;
  thu_tu_tham_quan: number;
}

interface TourImage {
  id: number;
  duong_dan: string;
  mo_ta: string;
  la_anh_chinh: boolean;
  thu_tu_hien_thi: number;
}

interface Activity {
  id: number;
  ten: string;
  gio_bat_dau: string;
  gio_ket_thuc: string;
  mo_ta: string;
  thu_tu: number;
}

interface Itinerary {
  id: number;
  ngay_thu: number;
  tieu_de: string;
  mo_ta: string;
  gio_bat_dau: string;
  gio_ket_thuc: string;
  dia_diem: string;
  thong_tin_luu_tru: string | null;
  hoat_dong: Activity[];
}

interface Departure {
  id: number;
  ngay_khoi_hanh: string;
  ngay_ket_thuc: string;
  suc_chua: number;
  trang_thai: string;
  ghi_chu: string;
  so_cho_da_dat: number;
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
  giam_gia_phan_tram: number | null;
  giam_gia_tu: string | null;
  giam_gia_den: string | null;
  trang_thai: string;
  noi_bat: boolean;
  so_nho_nhat: number;
  so_lon_nhat: number;
  ten_danh_muc: string;
  ten_nha_cung_cap: string;
  logo_ncc: string;
  diem_den: TourDestination[];
  hinh_anh: TourImage[];
  lich_trinh: Itinerary[];
  lich_khoi_hanh: Departure[];
  diem_trung_binh: number;
  tong_so_danh_gia: number;
  ngay_tao: string;
  ngay_cap_nhat: string;
}

interface ApiResponse {
  data: TourDetail;
  message: string;
}

type TabType = 'overview' | 'destinations' | 'itinerary' | 'reviews';

export const TourDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedDeparture, setSelectedDeparture] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTour = async () => {
      if (!id) return;
      try {
        const response = await api.get<ApiResponse>(`/tour/${id}`);
        const tourData = response.data.data;
        setTour(tourData);
        const mainImage = tourData.hinh_anh.find(img => img.la_anh_chinh);
        if (mainImage) {
          setSelectedImage(mainImage.duong_dan);
        } else if (tourData.hinh_anh.length > 0) {
          setSelectedImage(tourData.hinh_anh[0].duong_dan);
        }
      } catch (error) {
        console.error('Failed to fetch tour:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/tours/${id}` } });
    } else if (selectedDeparture) {
      navigate(`/booking/new/${id}?departure=${selectedDeparture}`);
    } else {
      alert('Vui lòng chọn ngày khởi hành');
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 5);
  };

  const getDepartureStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      'con_cho': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'sap_day': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'het_cho': 'bg-red-500/20 text-red-400 border-red-500/30',
      'da_huy': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return styles[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getDepartureStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'con_cho': 'Còn chỗ',
      'sap_day': 'Sắp đầy',
      'het_cho': 'Hết chỗ',
      'da_huy': 'Đã hủy',
    };
    return texts[status] || status;
  };

  if (loading) return <Loading />;
  
  if (!tour) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Tour không tồn tại</h1>
            <button onClick={() => navigate('/tours')} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl">
              Quay lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const mainImage = tour.hinh_anh.find(img => img.la_anh_chinh) || tour.hinh_anh[0];

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#030712]">
        {/* Hero Section */}
        <div className="relative h-[500px] overflow-hidden">
          <img
            src={selectedImage || mainImage?.duong_dan}
            alt={tour.tieu_de}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent" />
          
          {/* Floating Orbs */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />

          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <a href="/" className="hover:text-cyan-400 transition-colors">Trang chủ</a>
              <span className="text-slate-600">/</span>
              <a href="/tours" className="hover:text-cyan-400 transition-colors">Tours</a>
              <span className="text-slate-600">/</span>
              <span className="text-white">{tour.tieu_de}</span>
            </div>

            {/* Title & Info */}
            <div className="flex items-start justify-between">
              <div>
                {tour.noi_bat && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30 mb-4">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Nổi bật
                  </span>
                )}
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {tour.tieu_de}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-300">
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-lg">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {tour.so_ngay} ngày {tour.so_dem} đêm
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-xl rounded-lg">
                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {tour.so_nho_nhat} - {tour.so_lon_nhat} người
                  </span>
                  {tour.tong_so_danh_gia > 0 && (
                    <span className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 backdrop-blur-xl rounded-lg border border-amber-500/30">
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-amber-300">{tour.diem_trung_binh.toFixed(1)}</span>
                      <span className="text-slate-400">({tour.tong_so_danh_gia})</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                <div className="flex border-b border-white/10">
                  {[
                    { key: 'overview', label: 'Tổng quan', icon: '📋' },
                    ...(tour.diem_den.length > 0 ? [{ key: 'destinations', label: 'Điểm đến', icon: '📍', count: tour.diem_den.length }] : []),
                    ...(tour.lich_trinh.length > 0 ? [{ key: 'itinerary', label: 'Lịch trình', icon: '🗓️', count: tour.lich_trinh.length }] : []),
                    { key: 'reviews', label: 'Đánh giá', icon: '⭐', count: tour.tong_so_danh_gia },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as TabType)}
                      className={`flex-1 py-4 px-4 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        activeTab === tab.key
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border-b-2 border-cyan-500'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">{tab.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                      {/* Image Gallery */}
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center text-sm">📸</span>
                          Hình ảnh
                        </h2>
                        <div className="mb-4 relative rounded-2xl overflow-hidden">
                          <img
                            src={selectedImage || mainImage?.duong_dan}
                            alt={tour.tieu_de}
                            className="w-full h-96 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        <div className="grid grid-cols-5 gap-3">
                          {tour.hinh_anh.map((image) => (
                            <button
                              key={image.id}
                              onClick={() => setSelectedImage(image.duong_dan)}
                              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                selectedImage === image.duong_dan
                                  ? 'border-cyan-500 shadow-lg shadow-cyan-500/30'
                                  : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <img src={image.duong_dan} alt={image.mo_ta} className="w-full h-20 object-cover" />
                              {image.la_anh_chinh && (
                                <span className="absolute top-1 right-1 bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded">Chính</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-sm">📝</span>
                          Mô tả tour
                        </h2>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-line">{tour.mo_ta}</p>
                      </div>
                    </div>
                  )}

                  {/* Destinations Tab */}
                  {activeTab === 'destinations' && tour.diem_den.length > 0 && (
                    <div className="animate-fade-in">
                      <h2 className="text-2xl font-bold text-white mb-6">Các điểm đến</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {tour.diem_den.map((dest, index) => (
                          <div key={dest.id} className="group relative p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                            <div className="relative flex items-start gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-xl flex items-center justify-center border border-cyan-500/30">
                                <span className="text-cyan-400 font-bold">{index + 1}</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-white mb-1">{dest.ten}</h3>
                                <p className="text-sm text-slate-400">{dest.tinh}, {dest.quoc_gia}</p>
                                {dest.mo_ta && <p className="text-sm text-slate-500 mt-2">{dest.mo_ta}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Itinerary Tab */}
                  {activeTab === 'itinerary' && tour.lich_trinh.length > 0 && (
                    <div className="animate-fade-in">
                      <h2 className="text-2xl font-bold text-white mb-6">Lịch trình chi tiết</h2>
                      <div className="space-y-6">
                        {tour.lich_trinh.map((day, index) => (
                          <div key={day.id} className="relative">
                            {index !== tour.lich_trinh.length - 1 && (
                              <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 to-purple-500/50" />
                            )}
                            <div className="flex gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/30">
                                  {day.ngay_thu}
                                </div>
                              </div>
                              <div className="flex-1 bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-cyan-500/30 transition-all">
                                <h3 className="text-xl font-bold text-white mb-2">{day.tieu_de}</h3>
                                <div className="flex flex-wrap gap-3 text-sm text-slate-400 mb-3">
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatTime(day.gio_bat_dau)} - {formatTime(day.gio_ket_thuc)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {day.dia_diem}
                                  </span>
                                </div>
                                <p className="text-slate-300 mb-4">{day.mo_ta}</p>
                                
                                {day.hoat_dong.length > 0 && (
                                  <div className="space-y-3">
                                    <h4 className="font-semibold text-white text-sm uppercase tracking-wider">Hoạt động</h4>
                                    {day.hoat_dong.map((activity) => (
                                      <div key={activity.id} className="bg-black/30 rounded-xl p-4 border border-white/5">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-cyan-500/30">
                                            <span className="text-cyan-400 font-semibold text-xs">{activity.thu_tu}</span>
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-white mb-1">{activity.ten}</h5>
                                            <p className="text-xs text-slate-500 mb-1">
                                              {formatTime(activity.gio_bat_dau)} - {formatTime(activity.gio_ket_thuc)}
                                            </p>
                                            <p className="text-sm text-slate-400">{activity.mo_ta}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {day.thong_tin_luu_tru && (
                                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                    <div className="flex items-center gap-2">
                                      <span className="text-blue-400">🏨</span>
                                      <span className="text-sm text-blue-300">
                                        <strong>Lưu trú:</strong> {day.thong_tin_luu_tru}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="animate-fade-in -m-6">
                      <ReviewsList tourId={tour.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Pricing Card */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-50 blur-lg group-hover:opacity-75 transition-opacity" />
                  <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 border border-white/10">
                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                          {formatCurrency(tour.gia_nguoi_lon, tour.don_vi_tien_te)}
                        </span>
                        <span className="text-slate-400">/ người</span>
                      </div>
                      <p className="text-slate-500">
                        Trẻ em: <span className="text-slate-300">{formatCurrency(tour.gia_tre_em, tour.don_vi_tien_te)}</span>
                      </p>
                      {tour.giam_gia_phan_tram && (
                        <span className="inline-block mt-2 px-3 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-lg border border-red-500/30">
                          🔥 Giảm {tour.giam_gia_phan_tram}%
                        </span>
                      )}
                    </div>

                    {/* Supplier */}
                    <div className="mb-6 pb-6 border-b border-white/10">
                      <p className="text-sm text-slate-500 mb-2">Nhà cung cấp</p>
                      <div className="flex items-center gap-3">
                        <img src={tour.logo_ncc} alt={tour.ten_nha_cung_cap} className="w-12 h-12 object-cover rounded-xl border border-white/10" />
                        <span className="font-semibold text-white">{tour.ten_nha_cung_cap}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Danh mục</span>
                        <span className="text-white font-medium">{tour.ten_danh_muc}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Thời gian</span>
                        <span className="text-white font-medium">{tour.so_ngay}N{tour.so_dem}Đ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Quy mô</span>
                        <span className="text-white font-medium">{tour.so_nho_nhat}-{tour.so_lon_nhat} người</span>
                      </div>
                    </div>

                    {/* Departure Selection */}
                    {tour.lich_khoi_hanh.length > 0 && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-white mb-3">Chọn ngày khởi hành</label>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                          {tour.lich_khoi_hanh.map((departure) => (
                            <button
                              key={departure.id}
                              onClick={() => setSelectedDeparture(departure.id)}
                              disabled={departure.trang_thai === 'het_cho' || departure.trang_thai === 'da_huy'}
                              className={`w-full p-4 rounded-xl border text-left transition-all ${
                                selectedDeparture === departure.id
                                  ? 'bg-cyan-500/20 border-cyan-500/50'
                                  : 'bg-white/5 border-white/10 hover:border-white/20'
                              } ${
                                departure.trang_thai === 'het_cho' || departure.trang_thai === 'da_huy'
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold text-white">{formatDate(departure.ngay_khoi_hanh)}</span>
                                <span className={`text-xs px-2 py-1 rounded-lg border ${getDepartureStatusStyle(departure.trang_thai)}`}>
                                  {getDepartureStatusText(departure.trang_thai)}
                                </span>
                              </div>
                              <div className="text-xs text-slate-400 space-y-1">
                                <p>Về: {formatDate(departure.ngay_ket_thuc)}</p>
                                <p>Còn {departure.suc_chua - departure.so_cho_da_dat}/{departure.suc_chua} chỗ</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Book Button */}
                    <button
                      onClick={handleBookNow}
                      disabled={tour.trang_thai !== 'cong_bo' || tour.lich_khoi_hanh.length === 0}
                      className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {!isAuthenticated ? 'Đăng nhập để đặt tour' : tour.trang_thai !== 'cong_bo' ? 'Tour tạm ngưng' : tour.lich_khoi_hanh.length === 0 ? 'Chưa có lịch khởi hành' : '🚀 Đặt tour ngay'}
                    </button>

                    {/* Support */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-sm text-slate-500 mb-2">Cần hỗ trợ?</p>
                      <div className="flex items-center gap-2 text-cyan-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href="tel:1900000000" className="font-semibold hover:underline">1900 1234</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why Choose Us */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="font-bold text-white mb-4">Tại sao chọn chúng tôi?</h3>
                  <div className="space-y-3">
                    {[
                      { icon: '✅', text: 'Đảm bảo giá tốt nhất' },
                      { icon: '🔄', text: 'Hủy miễn phí trước 7 ngày' },
                      { icon: '💬', text: 'Hỗ trợ 24/7' },
                      { icon: '🔒', text: 'Thanh toán an toàn' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-slate-300">
                        <span>{item.icon}</span>
                        <span className="text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
