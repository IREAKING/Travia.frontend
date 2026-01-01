import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { supplierTourService, type CreateTourRequest, type TourImage, type TourDestination, type Itinerary, type Activity, type Departure } from '../../services/supplierTourService';
import { imageUploadService } from '../../services/imageUploadService';
import { ButtonLoading } from '../../components/common/Loading';
import { CascadingDestinationSelector } from '../../components/common/CascadingDestinationSelector';
import { useToast } from '../../hooks/useToast';

// Collapsible Section Component
const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center bg-gradient-to-r from-cyan-500/10 to-purple-500/10 hover:from-cyan-500/20 hover:to-purple-500/20 transition-all duration-300 group border-b border-white/10"
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all duration-300 border border-cyan-400/30">
            <svg
              className={`w-4 h-4 text-cyan-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 bg-gradient-to-b from-slate-900/40 to-slate-800/40">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Horizontal Tabs Component for Itinerary
const ItineraryTabs = ({ 
  itineraries, 
  onUpdateItinerary, 
  onAddActivity, 
  onUpdateActivity, 
  onRemoveActivity,
  onRemoveItinerary 
}: {
  itineraries: Itinerary[];
  onUpdateItinerary: (index: number, field: keyof Itinerary, value: any) => void;
  onAddActivity: (itineraryIndex: number) => void;
  onUpdateActivity: (itineraryIndex: number, activityIndex: number, field: keyof Activity, value: any) => void;
  onRemoveActivity: (itineraryIndex: number, activityIndex: number) => void;
  onRemoveItinerary: (index: number) => void;
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Reset active tab when itineraries change
  useEffect(() => {
    if (activeTab >= itineraries.length && itineraries.length > 0) {
      setActiveTab(Math.max(0, itineraries.length - 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itineraries.length]); // Only when length changes, not activeTab

  if (itineraries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>Chưa có lịch trình nào</p>
      </div>
    );
  }

  const currentItinerary = itineraries[activeTab];

  return (
    <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-white/10">
        <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {itineraries.map((itinerary, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-3 transition-all duration-300 min-w-0 relative ${
                activeTab === index
                  ? 'border-cyan-500 text-cyan-300 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 shadow-sm'
                  : 'border-transparent text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-purple-500/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                  activeTab === index 
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md border-cyan-400/50' 
                    : 'bg-white/5 text-gray-400 border-white/10 group-hover:bg-cyan-500/20 group-hover:text-cyan-300'
                }`}>
                  <span className="text-xs font-bold">{itinerary.ngay_thu}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="truncate font-semibold">Ngày {itinerary.ngay_thu}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full transition-all duration-300 ${
                    activeTab === index 
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' 
                      : 'bg-white/5 text-gray-500 border border-white/10'
                  }`}>
                    {itinerary.hoat_dong_lich_trinh_tours?.length || 0} hoạt động
                  </span>
                </div>
              </div>
              {activeTab === index && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>
        
        {/* Navigation Arrows for Mobile */}
        {itineraries.length > 3 && (
          <div className="flex justify-between items-center px-2 py-2 bg-white/5 border-t border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
              disabled={activeTab === 0}
              className="p-1 text-gray-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs text-gray-400">
              {activeTab + 1} / {itineraries.length}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab(Math.min(itineraries.length - 1, activeTab + 1))}
              disabled={activeTab === itineraries.length - 1}
              className="p-1 text-gray-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-8 bg-gradient-to-br from-slate-900/40 to-slate-800/40">
        {/* Day Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-xl flex items-center justify-center shadow-lg border border-cyan-400/30">
              <span className="text-cyan-300 font-bold text-lg">{currentItinerary.ngay_thu}</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-white mb-1">
                Ngày {currentItinerary.ngay_thu}
              </h4>
              <p className="text-gray-400 font-medium">
                {currentItinerary.tieu_de || 'Chưa có tiêu đề'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemoveItinerary(activeTab)}
            className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 rounded-lg hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-red-500/30"
          >
            <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa Ngày
          </button>
        </div>

        {/* Day Basic Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl p-4 shadow-sm border border-white/10 hover:shadow-cyan-500/10 transition-all duration-300">
            <label className="flex text-sm font-semibold text-gray-300 mb-2 items-center">
              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tiêu Đề Ngày *
            </label>
            <input
              type="text"
              required
              value={currentItinerary.tieu_de}
              onChange={(e) => onUpdateItinerary(activeTab, 'tieu_de', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm text-white placeholder-gray-500"
              placeholder="VD: Khám phá Hà Nội"
            />
          </div>

          <div className="bg-white/5 rounded-xl p-4 shadow-sm border border-white/10 hover:shadow-cyan-500/10 transition-all duration-300">
            <label className="flex text-sm font-semibold text-gray-300 mb-2 items-center">
              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Địa Điểm
            </label>
            <input
              type="text"
              value={currentItinerary.dia_diem}
              onChange={(e) => onUpdateItinerary(activeTab, 'dia_diem', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm text-white placeholder-gray-500"
              placeholder="VD: Hà Nội, Việt Nam"
            />
          </div>

          <div className="bg-white/5 rounded-xl p-4 shadow-sm border border-white/10 hover:shadow-purple-500/10 transition-all duration-300">
            <label className="flex text-sm font-semibold text-gray-300 mb-2 items-center">
              <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Giờ Bắt Đầu
            </label>
            <input
              type="time"
              value={currentItinerary.gio_bat_dau}
              onChange={(e) => onUpdateItinerary(activeTab, 'gio_bat_dau', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm text-white"
            />
          </div>

          <div className="bg-white/5 rounded-xl p-4 shadow-sm border border-white/10 hover:shadow-pink-500/10 transition-all duration-300">
            <label className="flex text-sm font-semibold text-gray-300 mb-2 items-center">
              <svg className="w-4 h-4 mr-2 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Giờ Kết Thúc
            </label>
            <input
              type="time"
              value={currentItinerary.gio_ket_thuc}
              onChange={(e) => onUpdateItinerary(activeTab, 'gio_ket_thuc', e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300 text-sm text-white"
            />
          </div>
        </div>

        {/* Day Description */}
        <div className="mb-6">
          <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Mô Tả Ngày
            </span>
            <span className="text-xs text-gray-400">({currentItinerary.mo_ta?.length || 0} ký tự)</span>
          </label>
          <textarea
            value={currentItinerary.mo_ta}
            onChange={(e) => onUpdateItinerary(activeTab, 'mo_ta', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all text-sm resize-y"
            rows={4}
            placeholder="Mô tả chi tiết hoạt động trong ngày... (VD: Khám phá thủ đô Hà Nội với những di tích lịch sử, văn hóa độc đáo...)"
          />
        </div>

        {/* Accommodation Info */}
        <div className="mb-6">
          <label className="flex items-center justify-between text-sm font-medium text-gray-300 mb-2">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Thông Tin Lưu Trú
            </span>
            <span className="text-xs text-gray-400">({currentItinerary.thong_tin_luu_tru?.length || 0} ký tự)</span>
          </label>
          <textarea
            value={currentItinerary.thong_tin_luu_tru}
            onChange={(e) => onUpdateItinerary(activeTab, 'thong_tin_luu_tru', e.target.value)}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white placeholder-gray-500 transition-all text-sm resize-y"
            rows={3}
            placeholder="Thông tin về khách sạn, homestay... (VD: Nghỉ đêm tại khách sạn 4 sao trung tâm thành phố, phòng tiện nghi đầy đủ...)"
          />
        </div>

        {/* Activities Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-xl flex items-center justify-center shadow-lg border border-cyan-400/30">
                <svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h5 className="text-xl font-bold text-white">
                  Hoạt Động
                </h5>
                <p className="text-sm text-gray-400">
                  {currentItinerary.hoat_dong_lich_trinh_tours?.length || 0} hoạt động đã thêm
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onAddActivity(activeTab)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Thêm Hoạt Động
            </button>
          </div>

          {(currentItinerary.hoat_dong_lich_trinh_tours?.length || 0) === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-white/5 to-cyan-500/10 rounded-xl border-2 border-dashed border-white/20">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-400/30">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Chưa có hoạt động nào</h3>
              <p className="text-sm text-gray-400 mb-4">Thêm hoạt động đầu tiên cho ngày này</p>
              <button
                type="button"
                onClick={() => onAddActivity(activeTab)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 text-sm font-medium shadow-lg shadow-cyan-500/25"
              >
                Thêm Hoạt Động Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {(currentItinerary.hoat_dong_lich_trinh_tours || []).map((activity, activityIndex) => (
                <div key={activityIndex} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm hover:shadow-cyan-500/20 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-lg flex items-center justify-center text-cyan-300 font-bold text-sm border border-cyan-400/30">
                        {activityIndex + 1}
                      </div>
                      <h6 className="text-lg font-semibold text-white">
                        Hoạt Động {activityIndex + 1}
                      </h6>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveActivity(activeTab, activityIndex)}
                      className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 rounded-lg hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-300 text-sm font-medium border border-red-400/30 hover:border-red-400/50"
                    >
                      <svg className="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Xóa
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Tên Hoạt Động *
                      </label>
                      <input
                        type="text"
                        required
                        value={activity.ten}
                        onChange={(e) => onUpdateActivity(activeTab, activityIndex, 'ten', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all text-sm"
                        placeholder="VD: Tham quan Chùa Một Cột"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Thứ Tự
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={activity.thu_tu || ''}
                        onChange={(e) => onUpdateActivity(activeTab, activityIndex, 'thu_tu', e.target.value ? parseInt(e.target.value) : 1)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Giờ Bắt Đầu
                      </label>
                      <input
                        type="time"
                        value={activity.gio_bat_dau}
                        onChange={(e) => onUpdateActivity(activeTab, activityIndex, 'gio_bat_dau', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-1">
                        Giờ Kết Thúc
                      </label>
                      <input
                        type="time"
                        value={activity.gio_ket_thuc}
                        onChange={(e) => onUpdateActivity(activeTab, activityIndex, 'gio_ket_thuc', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center justify-between text-xs font-medium text-gray-300 mb-2">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Mô Tả Hoạt Động
                      </span>
                      <span className="text-xs text-gray-400">({activity.mo_ta?.length || 0} ký tự)</span>
                    </label>
                    <textarea
                      value={activity.mo_ta}
                      onChange={(e) => onUpdateActivity(activeTab, activityIndex, 'mo_ta', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all text-sm resize-y"
                      rows={3}
                      placeholder="Mô tả chi tiết hoạt động... (VD: Tham quan Lăng Chủ tịch Hồ Chí Minh, tìm hiểu về cuộc đời và sự nghiệp của Bác...)"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CreateTourPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<CreateTourRequest>({
    tieu_de: '',
    mo_ta: '',
    danh_muc_id: undefined,
    so_ngay: 1,
    so_dem: 0,
    gia_nguoi_lon: 0,
    gia_tre_em: 0,
    don_vi_tien_te: 'VND',
    trang_thai: 'nhap',
    noi_bat: false,
    hinh_anh_tours: [],
    dia_diem_tours: [],
    lich_trinh_tours: [],
    cau_hinh_nhom_tours: {
      so_nho_nhat: 1,
      so_lon_nhat: 40,
    },
    lich_khoi_hanh_tours: [],
  });

  // Load initial data (only categories, destinations will be loaded on demand)
  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesData = await supplierTourService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadData();
  }, [])

  // Validate form data before submission
  const validateFormData = (): string | null => {
    console.log('🔍 Starting validation...');
    
    // Basic information validation
    if (!formData.tieu_de.trim()) {
      console.log('❌ Validation failed: Empty title');
      return 'Vui lòng nhập tiêu đề tour';
    }

    console.log('📏 Title length:', formData.tieu_de.length);
    if (formData.tieu_de.length < 10) {
      console.log('❌ Validation failed: Title too short');
      return 'Tiêu đề tour phải có ít nhất 10 ký tự';
    }

    if (formData.tieu_de.length > 200) {
      console.log('❌ Validation failed: Title too long');
      return 'Tiêu đề tour không được vượt quá 200 ký tự';
    }

    // Duration validation
    if (formData.so_ngay < 1) {
      return 'Số ngày phải lớn hơn 0';
    }

    if (formData.so_ngay > 365) {
      return 'Số ngày không được vượt quá 365';
    }

    if (formData.so_dem < 0) {
      return 'Số đêm không được âm';
    }

    if (formData.so_dem > formData.so_ngay) {
      return 'Số đêm không được lớn hơn số ngày';
    }

    // Price validation
    console.log('💰 Price validation:', { adult: formData.gia_nguoi_lon, child: formData.gia_tre_em });
    if (formData.gia_nguoi_lon <= 0) {
      console.log('❌ Validation failed: Adult price invalid');
      return 'Giá người lớn phải lớn hơn 0';
    }

    if (formData.gia_tre_em <= 0) {
      console.log('❌ Validation failed: Child price invalid');
      return 'Giá trẻ em phải lớn hơn 0';
    }

    if (formData.gia_tre_em > formData.gia_nguoi_lon) {
      console.log('❌ Validation failed: Child price > adult price');
      return 'Giá trẻ em không nên lớn hơn giá người lớn';
    }

    // Images validation
    console.log('🖼️ Images count:', formData.hinh_anh_tours.length);
    if (formData.hinh_anh_tours.length === 0) {
      console.log('❌ Validation failed: No images');
      return 'Vui lòng thêm ít nhất 1 ảnh cho tour';
    }

    // Validate at least one main image
    const hasMainImage = formData.hinh_anh_tours.some(img => img.la_anh_chinh);
    if (!hasMainImage && formData.hinh_anh_tours.length > 0) {
      console.log('⚠️ No main image set, auto-setting first image');
      // Auto-set first image as main if none selected
      formData.hinh_anh_tours[0].la_anh_chinh = true;
    }

    // Supplier ID sẽ được backend tự động lấy từ JWT token

    // Group config validation
    if (formData.cau_hinh_nhom_tours) {
      if ((formData.cau_hinh_nhom_tours.so_nho_nhat ?? 0) < 1) {
        return 'Số người tối thiểu phải lớn hơn 0';
      }

      if ((formData.cau_hinh_nhom_tours.so_lon_nhat ?? 0) < 1) {
        return 'Số người tối đa phải lớn hơn 0';
      }

      if ((formData.cau_hinh_nhom_tours.so_nho_nhat ?? 0) > (formData.cau_hinh_nhom_tours.so_lon_nhat ?? 0)) {
        return 'Số người tối thiểu không được lớn hơn số người tối đa';
      }
    }

    // Destinations validation (optional but recommended)
    if (formData.dia_diem_tours.length > 0) {
      const invalidDest = formData.dia_diem_tours.find(d => !d.diem_den_id || d.diem_den_id === 0);
      if (invalidDest) {
        return 'Vui lòng chọn đầy đủ thông tin điểm đến';
      }
    }

    // Itineraries validation (optional but recommended)
    if (formData.lich_trinh_tours.length > 0) {
      for (let i = 0; i < formData.lich_trinh_tours.length; i++) {
        const itinerary = formData.lich_trinh_tours[i];
        if (!itinerary.tieu_de.trim()) {
          return `Vui lòng nhập tiêu đề cho Ngày ${itinerary.ngay_thu}`;
        }

        // Validate activities in itinerary
        if (itinerary.hoat_dong_lich_trinh_tours && itinerary.hoat_dong_lich_trinh_tours.length > 0) {
          for (let j = 0; j < itinerary.hoat_dong_lich_trinh_tours.length; j++) {
            const activity = itinerary.hoat_dong_lich_trinh_tours[j];
            if (!activity.ten.trim()) {
              return `Vui lòng nhập tên cho Hoạt động ${j + 1} trong Ngày ${itinerary.ngay_thu}`;
            }
          }
        }
      }
    }

    return null; // No errors
  };

  // Clean up data helper function
  const cleanupTourData = (data: CreateTourRequest): CreateTourRequest => {
    // Clean up itineraries
    const cleanedItineraries = data.lich_trinh_tours.map(itin => ({
      ngay_thu: Number(itin.ngay_thu),
      tieu_de: itin.tieu_de.trim(),
      mo_ta: itin.mo_ta?.trim() || '',
      gio_bat_dau: itin.gio_bat_dau || '',
      gio_ket_thuc: itin.gio_ket_thuc || '',
      dia_diem: itin.dia_diem?.trim() || '',
      thong_tin_luu_tru: itin.thong_tin_luu_tru?.trim() || '',
      hoat_dong_lich_trinh_tours: (itin.hoat_dong_lich_trinh_tours || []).map(act => ({
        ten: act.ten.trim(),
        gio_bat_dau: act.gio_bat_dau || '',
        gio_ket_thuc: act.gio_ket_thuc || '',
        mo_ta: act.mo_ta?.trim() || '',
        thu_tu: Number(act.thu_tu) || 1,
      })),
    }));

    // Clean up destinations
    const cleanedDestinations = data.dia_diem_tours.map(dest => ({
      diem_den_id: Number(dest.diem_den_id),
      thu_tu_tham_quan: Number(dest.thu_tu_tham_quan) || 1,
    }));

    // Clean up images
    const cleanedImages = data.hinh_anh_tours.map(img => ({
      link: img.link.trim(),
      mo_ta_alt: img.mo_ta_alt?.trim() || '',
      la_anh_chinh: Boolean(img.la_anh_chinh),
      thu_tu_hien_thi: Number(img.thu_tu_hien_thi) || 1,
    }));

    // Clean up departures
    const cleanedDepartures = data.lich_khoi_hanh_tours?.map(dep => ({
      ngay_khoi_hanh: dep.ngay_khoi_hanh,
      ngay_ket_thuc: dep.ngay_ket_thuc,
      suc_chua: Number(dep.suc_chua),
      trang_thai: dep.trang_thai || 'len_lich',
      ghi_chu: dep.ghi_chu?.trim() || '',
    })) || [];

    return {
      tieu_de: data.tieu_de.trim(),
      mo_ta: data.mo_ta?.trim() || '',
      danh_muc_id: data.danh_muc_id ? Number(data.danh_muc_id) : undefined,
      so_ngay: Number(data.so_ngay),
      so_dem: Number(data.so_dem),
      gia_nguoi_lon: Number(data.gia_nguoi_lon),
      gia_tre_em: Number(data.gia_tre_em),
      don_vi_tien_te: data.don_vi_tien_te || 'VND',
      trang_thai: data.trang_thai || 'nhap',
      noi_bat: Boolean(data.noi_bat),
      hinh_anh_tours: cleanedImages,
      dia_diem_tours: cleanedDestinations,
      lich_trinh_tours: cleanedItineraries,
      cau_hinh_nhom_tours: data.cau_hinh_nhom_tours ? {
        so_nho_nhat: Number(data.cau_hinh_nhom_tours.so_nho_nhat),
        so_lon_nhat: Number(data.cau_hinh_nhom_tours.so_lon_nhat),
      } : {
        so_nho_nhat: 1,
        so_lon_nhat: 40,
      },
      lich_khoi_hanh_tours: cleanedDepartures,
    };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 handleSubmit called');
    console.log('📝 Current formData:', formData);

    // Validate form data
    const validationError = validateFormData();
    if (validationError) {
      console.log('❌ Validation failed:', validationError);
      showToast(validationError, 'error');
      return;
    }

    console.log('✅ Validation passed, proceeding with submission...');
    setLoading(true);

    try {
      // Clean up and prepare tour data
      const tourData = cleanupTourData(formData);

      console.log('📤 Submitting tour data:', JSON.stringify(tourData, null, 2));

      // Create tour via API
      const result = await supplierTourService.createTour(tourData);
      
      console.log('✅ Tour created successfully:', result);
      
      showToast('🎉 Tạo tour thành công!', 'success');
      
      // Navigate to dashboard after short delay to show success message
      setTimeout(() => {
        navigate('/supplier/dashboard');
      }, 1000);

    } catch (error: any) {
      console.error('❌ Error creating tour:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      // Parse error message
      let errorMessage = 'Có lỗi xảy ra khi tạo tour';

      if (error.response?.status === 400) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        setTimeout(() => navigate('/supplier/login'), 2000);
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền tạo tour. Vui lòng liên hệ quản trị viên.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Dữ liệu quá lớn. Vui lòng giảm số lượng ảnh hoặc nội dung.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      }

      // Override with specific error message if available
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && !error.response) {
        errorMessage = `Lỗi kết nối: ${error.message}`;
      }

      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof CreateTourRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle file upload with validation and progress
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate files before upload
    const fileArray = Array.from(files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    
    // Filter valid files
    const invalidFiles: string[] = [];
    const validFiles = fileArray.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (định dạng không hợp lệ)`);
        return false;
      }
      if (file.size > maxSize) {
        invalidFiles.push(`${file.name} (quá 5MB)`);
        return false;
      }
      return true;
    });

    if (invalidFiles.length > 0) {
      showToast(`Một số file không hợp lệ: ${invalidFiles.join(', ')}`, 'warning');
    }

    if (validFiles.length === 0) {
      showToast('Không có file hợp lệ để upload', 'error');
      return;
    }

    setUploadingImages(true);
    try {
      // Upload images
      const response = await imageUploadService.uploadTourImages(validFiles);
      
      // Convert uploaded images to TourImage format
      const uploadedImages: TourImage[] = response.images.map((img, index) => ({
        link: img.link,
        mo_ta_alt: img.mo_ta_alt || '',
        la_anh_chinh: formData.hinh_anh_tours.length === 0 && index === 0, // First image as main if no images yet
        thu_tu_hien_thi: formData.hinh_anh_tours.length + index + 1,
      }));

      // Add uploaded images to form data
      setFormData(prev => ({
        ...prev,
        hinh_anh_tours: [...prev.hinh_anh_tours, ...uploadedImages]
      }));

      showToast(
        `✅ Upload thành công ${response.successful_uploads}/${response.total_files} ảnh!`, 
        'success'
      );
      
      if (response.errors && response.errors.length > 0) {
        console.warn('Upload errors:', response.errors);
        showToast(`⚠️ Một số ảnh thất bại: ${response.errors.slice(0, 2).join(', ')}`, 'warning');
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi upload ảnh';
      if (error.response?.status === 413) {
        errorMessage = 'File quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast(errorMessage, 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    // Reset input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update image
  const updateImage = useCallback((index: number, field: keyof TourImage, value: any) => {
    setFormData(prev => ({
      ...prev,
      hinh_anh_tours: prev.hinh_anh_tours.map((img, i) => 
        i === index ? { ...img, [field]: value } : img
      )
    }));
  }, []);

  // Remove image
  const removeImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      hinh_anh_tours: prev.hinh_anh_tours.filter((_, i) => i !== index)
    }));
  }, []);

  // Add destination
  const addDestination = useCallback(() => {
    setFormData(prev => {
      const newDestination: TourDestination = {
        diem_den_id: 0,
        thu_tu_tham_quan: prev.dia_diem_tours.length + 1,
      };
      return {
        ...prev,
        dia_diem_tours: [...prev.dia_diem_tours, newDestination]
      };
    });
  }, []);

  // Update destination
  const updateDestination = useCallback((index: number, field: keyof TourDestination, value: any) => {
    setFormData(prev => ({
      ...prev,
      dia_diem_tours: prev.dia_diem_tours.map((dest, i) => 
        i === index ? { ...dest, [field]: value } : dest
      )
    }));
  }, []);

  // Remove destination
  const removeDestination = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      dia_diem_tours: prev.dia_diem_tours.filter((_, i) => i !== index)
    }));
  }, []);

  // Add itinerary
  const addItinerary = useCallback(() => {
    setFormData(prev => {
      const newItinerary: Itinerary = {
        ngay_thu: prev.lich_trinh_tours.length + 1,
        tieu_de: '',
        mo_ta: '',
        gio_bat_dau: '',
        gio_ket_thuc: '',
        dia_diem: '',
        thong_tin_luu_tru: '',
        hoat_dong_lich_trinh_tours: [],
      };
      return {
        ...prev,
        lich_trinh_tours: [...prev.lich_trinh_tours, newItinerary]
      };
    });
  }, []);

  // Update itinerary
  const updateItinerary = useCallback((index: number, field: keyof Itinerary, value: any) => {
    setFormData(prev => ({
      ...prev,
      lich_trinh_tours: prev.lich_trinh_tours.map((itin, i) => 
        i === index ? { ...itin, [field]: value } : itin
      )
    }));
  }, []);

  // Add activity to itinerary
  const addActivity = useCallback((itineraryIndex: number) => {
    setFormData(prev => {
      const newActivity: Activity = {
        ten: '',
        gio_bat_dau: '',
        gio_ket_thuc: '',
        mo_ta: '',
        thu_tu: (prev.lich_trinh_tours[itineraryIndex]?.hoat_dong_lich_trinh_tours?.length || 0) + 1,
      };
      return {
        ...prev,
        lich_trinh_tours: prev.lich_trinh_tours.map((itin, i) => 
          i === itineraryIndex 
            ? { ...itin, hoat_dong_lich_trinh_tours: [...(itin.hoat_dong_lich_trinh_tours || []), newActivity] }
            : itin
        )
      };
    });
  }, []);

  // Update activity
  const updateActivity = useCallback((itineraryIndex: number, activityIndex: number, field: keyof Activity, value: any) => {
    setFormData(prev => ({
      ...prev,
      lich_trinh_tours: prev.lich_trinh_tours.map((itin, i) => 
        i === itineraryIndex 
          ? {
              ...itin,
              hoat_dong_lich_trinh_tours: (itin.hoat_dong_lich_trinh_tours || []).map((act, j) => 
                j === activityIndex ? { ...act, [field]: value } : act
              )
            }
          : itin
      )
    }));
  }, []);

  // Remove activity
  const removeActivity = useCallback((itineraryIndex: number, activityIndex: number) => {
    setFormData(prev => ({
      ...prev,
      lich_trinh_tours: prev.lich_trinh_tours.map((itin, i) => 
        i === itineraryIndex 
          ? {
              ...itin,
              hoat_dong_lich_trinh_tours: (itin.hoat_dong_lich_trinh_tours || []).filter((_, j) => j !== activityIndex)
            }
          : itin
      )
    }));
  }, []);

  // ============================================================
  // DEPARTURE HANDLERS
  // ============================================================
  
  // Add departure
  const addDeparture = useCallback(() => {
    setFormData(prev => {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (prev.so_ngay || 1));
      
      const newDeparture: Departure = {
        ngay_khoi_hanh: today,
        ngay_ket_thuc: endDate.toISOString().split('T')[0],
        suc_chua: prev.cau_hinh_nhom_tours?.so_lon_nhat || 20,
        trang_thai: 'len_lich',
        ghi_chu: '',
      };
      return {
        ...prev,
        lich_khoi_hanh_tours: [...(prev.lich_khoi_hanh_tours || []), newDeparture]
      };
    });
  }, []);

  // Update departure
  const updateDeparture = useCallback((index: number, field: keyof Departure, value: any) => {
    setFormData(prev => ({
      ...prev,
      lich_khoi_hanh_tours: prev.lich_khoi_hanh_tours?.map((dep, i) => 
        i === index ? { ...dep, [field]: value } : dep
      ) || []
    }));
  }, []);

  // Remove departure
  const removeDeparture = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      lich_khoi_hanh_tours: prev.lich_khoi_hanh_tours?.filter((_, i) => i !== index) || []
    }));
  }, []);

  return (
    <DashboardLayout sidebar={<SupplierSidebar />}>
      <div className="max-w-6xl mx-auto pb-32">
        {/* Header Section */}
        <div className="mb-10">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[#030712]">
              <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-pink-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
              
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
              }}></div>
            </div>
            
            <div className="relative z-10 p-8">
            <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
                  <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Tạo Tour Mới</h1>
                  <p className="text-cyan-300 text-lg">Tạo tour du lịch mới cho khách hàng của bạn</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center space-x-6 text-sm flex-wrap gap-y-2">
              <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-sm"></div>
                  <span className="text-cyan-300 font-medium">Thông tin cơ bản</span>
              </div>
              <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${formData.cau_hinh_nhom_tours ? 'bg-cyan-400' : 'bg-cyan-400/40'}`}></div>
                  <span className="text-cyan-300 font-medium">Nhóm: {formData.cau_hinh_nhom_tours?.so_nho_nhat || 0}-{formData.cau_hinh_nhom_tours?.so_lon_nhat || 0} người</span>
              </div>
              <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${formData.hinh_anh_tours.length > 0 ? 'bg-cyan-400' : 'bg-cyan-400/40'}`}></div>
                  <span className="text-cyan-300 font-medium">Hình ảnh ({formData.hinh_anh_tours.length})</span>
              </div>
              <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${formData.dia_diem_tours.length > 0 ? 'bg-cyan-400' : 'bg-cyan-400/40'}`}></div>
                  <span className="text-cyan-300 font-medium">Điểm đến ({formData.dia_diem_tours.length})</span>
              </div>
              <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${formData.lich_trinh_tours.length > 0 ? 'bg-cyan-400' : 'bg-cyan-400/40'}`}></div>
                  <span className="text-cyan-300 font-medium">Lịch trình ({formData.lich_trinh_tours.length} ngày)</span>
              </div>
              <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${formData.lich_khoi_hanh_tours && formData.lich_khoi_hanh_tours.length > 0 ? 'bg-cyan-400' : 'bg-cyan-400/40'}`}></div>
                  <span className="text-cyan-300 font-medium">Khởi hành ({formData.lich_khoi_hanh_tours?.length || 0} chuyến)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form id="create-tour-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <CollapsibleSection title="📋 Thông Tin Cơ Bản" defaultOpen={true}>
            <div className="mb-4 p-3 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-lg">
              <p className="text-sm text-cyan-300">
                <span className="font-semibold">💡 Hướng dẫn:</span> Điền đầy đủ thông tin cơ bản về tour. Các trường có dấu (*) là bắt buộc.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiêu Đề Tour *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tieu_de}
                  onChange={(e) => handleInputChange('tieu_de', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                  placeholder="Nhập tiêu đề tour"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Danh Mục
                </label>
                <select
                  value={formData.danh_muc_id || ''}
                  onChange={(e) => handleInputChange('danh_muc_id', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                >
                  <option value="" className="bg-slate-900">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.ten}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số Ngày *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.so_ngay || ''}
                  onChange={(e) => handleInputChange('so_ngay', e.target.value ? parseInt(e.target.value) : 0)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số Đêm *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.so_dem || ''}
                  onChange={(e) => handleInputChange('so_dem', e.target.value ? parseInt(e.target.value) : 0)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giá Người Lớn (VND) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.gia_nguoi_lon || ''}
                  onChange={(e) => handleInputChange('gia_nguoi_lon', e.target.value ? parseFloat(e.target.value) : 0)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Giá Trẻ Em (VND) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.gia_tre_em || ''}
                  onChange={(e) => handleInputChange('gia_tre_em', e.target.value ? parseFloat(e.target.value) : 0)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Đơn Vị Tiền Tệ
                </label>
                <select
                  value={formData.don_vi_tien_te}
                  onChange={(e) => handleInputChange('don_vi_tien_te', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                >
                  <option value="VND" className="bg-slate-900">VND</option>
                  <option value="USD" className="bg-slate-900">USD</option>
                  <option value="EUR" className="bg-slate-900">EUR</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số Người Tối Thiểu
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cau_hinh_nhom_tours?.so_nho_nhat || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : 1;
                    setFormData(prev => ({
                      ...prev,
                      cau_hinh_nhom_tours: {
                        ...prev.cau_hinh_nhom_tours!,
                        so_nho_nhat: value
                      }
                    }));
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                  placeholder="VD: 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Số Người Tối Đa
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.cau_hinh_nhom_tours?.so_lon_nhat || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : 40;
                    setFormData(prev => ({
                      ...prev,
                      cau_hinh_nhom_tours: {
                        ...prev.cau_hinh_nhom_tours!,
                        so_lon_nhat: value
                      }
                    }));
                  }}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                  placeholder="VD: 40"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mô Tả Tour
                <span className="text-xs text-gray-400 ml-2">({formData.mo_ta?.length || 0} ký tự)</span>
              </label>
              <textarea
                value={formData.mo_ta}
                onChange={(e) => handleInputChange('mo_ta', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all resize-y"
                rows={8}
                placeholder="Mô tả chi tiết về tour... (VD: Trải nghiệm vẻ đẹp hùng vĩ của miền Bắc Việt Nam với Vịnh Hạ Long di sản thế giới và vùng cao Sapa thơ mộng. Chương trình bao gồm: Du thuyền ngủ đêm trên Vịnh Hạ Long, khám phá hang Sửng Sốt và làng chài...)"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Mô tả chi tiết giúp khách hàng hiểu rõ hơn về tour của bạn
              </p>
            </div>

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="noi_bat"
                checked={formData.noi_bat}
                onChange={(e) => handleInputChange('noi_bat', e.target.checked)}
                className="h-4 w-4 text-cyan-500 focus:ring-cyan-500/50 border-white/20 rounded bg-white/5"
              />
              <label htmlFor="noi_bat" className="ml-2 block text-sm text-gray-300">
                Tour nổi bật
              </label>
            </div>
          </CollapsibleSection>

          {/* Images */}
          <CollapsibleSection title={`🖼️ Hình Ảnh Tour (${formData.hinh_anh_tours.length})`}>
            <div className="mb-4 p-3 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-lg">
              <p className="text-sm text-cyan-300">
                <span className="font-semibold">💡 Hướng dẫn:</span> Upload ít nhất 1 ảnh cho tour. Ảnh đẹp sẽ thu hút khách hàng hơn!
              </p>
            </div>
            <div className="mb-4">
              {/* File Upload Section */}
              <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-cyan-400/50 transition-colors bg-white/5">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={uploadingImages}
                />
                
                <div className="space-y-4">
                  <div>
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImages}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImages ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang upload...
                        </>
                      ) : (
                        'Chọn Ảnh để Upload'
                      )}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-400">
                    Hỗ trợ: JPEG, PNG, GIF, WebP, BMP
                    <br />
                    Có thể chọn nhiều ảnh cùng lúc
                  </p>
                </div>
              </div>

              {/* Manual URL Input (Optional) */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const newImage: TourImage = {
                      link: '',
                      mo_ta_alt: '',
                      la_anh_chinh: formData.hinh_anh_tours.length === 0,
                      thu_tu_hien_thi: formData.hinh_anh_tours.length + 1,
                    };
                    setFormData(prev => ({
                      ...prev,
                      hinh_anh_tours: [...prev.hinh_anh_tours, newImage]
                    }));
                  }}
                  className="px-4 py-2 bg-white/5 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
                >
                  + Thêm URL Ảnh Thủ Công
                </button>
              </div>
            </div>

            {formData.hinh_anh_tours.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Chưa có hình ảnh nào</p>
                <p className="text-xs text-gray-500 mt-1">Upload ảnh hoặc thêm URL để bắt đầu</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.hinh_anh_tours.map((image, index) => (
                  <div key={index} className="border border-white/10 rounded-lg p-3 bg-white/5">
                    {/* Image Preview */}
                    {image.link && (
                      <div className="mb-3">
                        <img
                          src={image.link}
                          alt={image.mo_ta_alt || `Tour image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-white/10"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Link Hình Ảnh *
                        </label>
                        <input
                          type="url"
                          required
                          value={image.link}
                          onChange={(e) => updateImage(index, 'link', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all text-sm"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Mô Tả Alt
                        </label>
                        <input
                          type="text"
                          value={image.mo_ta_alt}
                          onChange={(e) => updateImage(index, 'mo_ta_alt', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all text-sm"
                          placeholder="Mô tả hình ảnh"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={image.la_anh_chinh}
                          onChange={(e) => updateImage(index, 'la_anh_chinh', e.target.checked)}
                          className="h-4 w-4 text-cyan-500 focus:ring-cyan-500/50 border-white/20 rounded bg-white/5"
                        />
                        <label className="ml-2 block text-sm text-gray-300">
                          Ảnh chính
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Destinations */}
          <CollapsibleSection title={`📍 Điểm Đến (${formData.dia_diem_tours.length})`}>
            <div className="mb-4 p-3 bg-purple-500/10 border-l-4 border-purple-500 rounded-r-lg">
              <p className="text-sm text-purple-300">
                <span className="font-semibold">💡 Hướng dẫn:</span> Thêm các điểm đến chính trong tour theo thứ tự tham quan.
              </p>
            </div>
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={addDestination}
                className="px-4 py-2 bg-white/5 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
              >
                + Thêm Điểm Đến
              </button>
            </div>

            {formData.dia_diem_tours.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>Chưa có điểm đến nào</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.dia_diem_tours.map((destination, index) => (
                  <div key={index} className="border border-white/10 rounded-lg p-3 bg-white/5">
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Điểm Đến *
                        </label>
                        <CascadingDestinationSelector
                          value={destination.diem_den_id}
                          onChange={(value) => updateDestination(index, 'diem_den_id', value)}
                          placeholder="Chọn điểm đến"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Thứ Tự Tham Quan
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={destination.thu_tu_tham_quan || ''}
                          onChange={(e) => updateDestination(index, 'thu_tu_tham_quan', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeDestination(index)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

          {/* Itineraries */}
          <CollapsibleSection title={`📅 Lịch Trình (${formData.lich_trinh_tours.length} ngày)`}>
            <div className="mb-4 p-3 bg-orange-500/10 border-l-4 border-orange-500 rounded-r-lg">
              <p className="text-sm text-orange-300">
                <span className="font-semibold">💡 Hướng dẫn:</span> Tạo lịch trình chi tiết cho từng ngày. Mỗi ngày có thể có nhiều hoạt động khác nhau.
              </p>
            </div>
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={addItinerary}
                className="px-4 py-2 bg-white/5 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors text-sm font-medium"
              >
                + Thêm Ngày
              </button>
            </div>

            <ItineraryTabs
              itineraries={formData.lich_trinh_tours}
              onUpdateItinerary={updateItinerary}
              onAddActivity={addActivity}
              onUpdateActivity={updateActivity}
              onRemoveActivity={removeActivity}
              onRemoveItinerary={(index) => {
                const newItineraries = formData.lich_trinh_tours.filter((_, i) => i !== index);
                setFormData(prev => ({ ...prev, lich_trinh_tours: newItineraries }));
              }}
            />
          </CollapsibleSection>

          {/* Departures (Lịch Khởi Hành) */}
          <CollapsibleSection title={`🚌 Lịch Khởi Hành (${formData.lich_khoi_hanh_tours?.length || 0} chuyến)`} defaultOpen={true}>
            <div className="mb-4 p-3 bg-purple-500/10 border-l-4 border-purple-500 rounded-r-lg">
              <p className="text-sm text-purple-300">
                <span className="font-semibold">💡 Hướng dẫn:</span> Thêm các ngày khởi hành cụ thể cho tour. Mỗi chuyến có sức chứa riêng.
              </p>
            </div>
            
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={addDeparture}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-400 hover:to-pink-400 transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm Chuyến Khởi Hành
              </button>
            </div>

            {formData.lich_khoi_hanh_tours && formData.lich_khoi_hanh_tours.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-white/5 to-purple-500/10 rounded-xl border-2 border-dashed border-white/20">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-400/30">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Chưa có lịch khởi hành</h3>
                <p className="text-sm text-gray-400 mb-4">Thêm lịch khởi hành để khách hàng có thể đặt tour</p>
                <button
                  type="button"
                  onClick={addDeparture}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all duration-300 text-sm font-medium shadow-lg shadow-purple-500/25"
                >
                  Thêm Lịch Khởi Hành Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.lich_khoi_hanh_tours?.map((departure, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-sm hover:shadow-purple-500/20 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center shadow-md border border-purple-400/30">
                          <span className="text-purple-300 font-bold text-sm">#{index + 1}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-white">Chuyến {index + 1}</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDeparture(index)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-400/30 hover:border-red-400/50"
                        title="Xóa chuyến khởi hành"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Ngày khởi hành */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                          <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Ngày Khởi Hành
                        </label>
                        <input
                          type="date"
                          value={departure.ngay_khoi_hanh}
                          onChange={(e) => updateDeparture(index, 'ngay_khoi_hanh', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm text-white"
                          required
                        />
                      </div>

                      {/* Ngày kết thúc */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                          <svg className="w-4 h-4 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Ngày Kết Thúc
                        </label>
                        <input
                          type="date"
                          value={departure.ngay_ket_thuc}
                          onChange={(e) => updateDeparture(index, 'ngay_ket_thuc', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm text-white"
                          required
                        />
                      </div>

                      {/* Sức chứa */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                          <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Sức Chứa (Số khách tối đa)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={departure.suc_chua}
                          onChange={(e) => updateDeparture(index, 'suc_chua', parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm text-white"
                          required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Giới hạn: {formData.cau_hinh_nhom_tours?.so_nho_nhat || 1} - {formData.cau_hinh_nhom_tours?.so_lon_nhat || 50} khách
                        </p>
                      </div>

                      {/* Trạng thái */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                          <svg className="w-4 h-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Trạng Thái
                        </label>
                        <select
                          value={departure.trang_thai || 'len_lich'}
                          onChange={(e) => updateDeparture(index, 'trang_thai', e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm text-white"
                        >
                          <option value="len_lich" className="bg-slate-900">📋 Lên lịch</option>
                          <option value="xac_nhan" className="bg-slate-900">✅ Xác nhận</option>
                          <option value="con_cho" className="bg-slate-900">🟢 Còn chỗ</option>
                          <option value="huy" className="bg-slate-900">❌ Hủy</option>
                          <option value="hoan_thanh" className="bg-slate-900">🎉 Hoàn thành</option>
                        </select>
                      </div>
                    </div>

                    {/* Ghi chú */}
                    <div className="mt-4">
                      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Ghi Chú
                      </label>
                      <textarea
                        value={departure.ghi_chu || ''}
                        onChange={(e) => updateDeparture(index, 'ghi_chu', e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm resize-y text-white placeholder-gray-500"
                        rows={2}
                        placeholder="Ghi chú về chuyến khởi hành này (VD: Chuyến dịp lễ, đã đặt phương tiện...)"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleSection>

        </form>

        {/* Sticky Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-6 shadow-2xl">
          <div className="container mx-auto max-w-6xl flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/supplier/dashboard')}
              className="px-8 py-3 bg-white/5 border border-white/20 text-gray-300 rounded-xl hover:bg-white/10 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hủy
            </button>
            <button
              type="submit"
              form="create-tour-form"
              disabled={loading}
              onClick={() => console.log('🖱️ Submit button clicked')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl transform hover:-translate-y-0.5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <ButtonLoading size="md" />
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Tạo Tour
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
