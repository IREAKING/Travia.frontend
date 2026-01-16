import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { supplierTourService } from '../../services/supplierTourService';
import { imageUploadService } from '../../services/imageUploadService';
import { LoadingSpinner } from '../../components/common/Loading';
import { SuccessModal } from '../../components/common/Modal';
import { useToast } from '../../hooks/useToast';

// Tab Navigation Component
const TabButton = ({ 
  active, 
  onClick, 
  children, 
  icon 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-6 py-3 font-medium text-sm transition-all duration-200 relative
        ${active 
          ? 'text-white' 
          : 'text-gray-400 hover:text-gray-300'
        }
      `}
    >
      <span className="flex items-center gap-2">
        {icon}
        {children}
      </span>
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-t-full"></div>
      )}
    </button>
  );
};

export const EditTourPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('');
  
  const [formData, setFormData] = useState({
    tieu_de: '',
    mo_ta: '',
    danh_muc_id: 0,
    so_ngay: 1,
    so_dem: 0,
    gia_nguoi_lon: 0,
    gia_tre_em: 0,
    don_vi_tien_te: 'VND',
    trang_thai: 'nhap',
    noi_bat: false,
  });
  const [nhaCungCapId, setNhaCungCapId] = useState<string>('');

  // Additional data from tour detail
  const [tourImages, setTourImages] = useState<any[]>([]);
  const [tourDestinations, setTourDestinations] = useState<any[]>([]);
  const [tourItinerary, setTourItinerary] = useState<any[]>([]);
  const [tourDepartures, setTourDepartures] = useState<any[]>([]);
  const [tourConfig, setTourConfig] = useState<any>(null);

  // Departure form state
  const [showDepartureForm, setShowDepartureForm] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState<any>(null);
  const [departureFormData, setDepartureFormData] = useState({
    ngay_khoi_hanh: '',
    ngay_ket_thuc: '',
    suc_chua: 20,
    trang_thai: 'len_lich',
    ghi_chu: '',
  });
  const [departureLoading, setDepartureLoading] = useState(false);

  // Discount state
  const [tourDiscounts, setTourDiscounts] = useState<any[]>([]);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<any>(null);
  const [discountFormData, setDiscountFormData] = useState({
    phan_tram: 10,
    ngay_bat_dau: '',
    ngay_ket_thuc: '',
  });
  const [discountLoading, setDiscountLoading] = useState(false);

  // Image management state
  const [imageLoading, setImageLoading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
  const [showAddImageForm, setShowAddImageForm] = useState(false);
  const [imageFormData, setImageFormData] = useState({
    files: [] as File[],
    mo_ta: '',
    la_anh_chinh: false,
    thu_tu_hien_thi: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Destination management state
  const [destinationLoading, setDestinationLoading] = useState(false);
  const [deletingDestinationId, setDeletingDestinationId] = useState<number | null>(null);
  const [showAddDestinationForm, setShowAddDestinationForm] = useState(false);
  const [destinationFormData, setDestinationFormData] = useState({
    selectedCountry: '',
    selectedProvince: '',
    selectedCity: '',
    selectedDestinationId: 0,
    thu_tu_tham_quan: tourDestinations.length + 1,
  });
  const [countries, setCountries] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<Array<{ id: number; tinh: string | null }>>([]);
  const [cities, setCities] = useState<Array<{ id: number; ten: string }>>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const openSuccessModal = (message: string) => {
    setSuccessModalMessage(message);
    setShowSuccessModal(true);
  };

  // Load tour data
  useEffect(() => {
    const loadTour = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const tourData = await supplierTourService.getTourById(parseInt(id));
        
        // Populate form
        setFormData({
          tieu_de: tourData.tieu_de || '',
          mo_ta: tourData.mo_ta || '',
          danh_muc_id: tourData.danh_muc_id || 0,
          so_ngay: tourData.so_ngay || 1,
          so_dem: tourData.so_dem || 0,
          gia_nguoi_lon: tourData.gia_nguoi_lon || 0,
          gia_tre_em: tourData.gia_tre_em || 0,
          don_vi_tien_te: tourData.don_vi_tien_te || 'VND',
          trang_thai: tourData.trang_thai || 'nhap',
          noi_bat: tourData.noi_bat || false,
        });

        // Store nha_cung_cap_id from tour data
        if (tourData.nha_cung_cap_id) {
          setNhaCungCapId(tourData.nha_cung_cap_id.toString());
        }

        // Parse JSON fields from GetTourDetailByID response
        try {
          // Parse images
          if (tourData.hinh_anh) {
            const images = typeof tourData.hinh_anh === 'string' 
              ? JSON.parse(tourData.hinh_anh) 
              : tourData.hinh_anh;
            setTourImages(Array.isArray(images) ? images : []);
          }

          // Parse destinations
          if (tourData.diem_den) {
            const destinations = typeof tourData.diem_den === 'string'
              ? JSON.parse(tourData.diem_den)
              : tourData.diem_den;
            setTourDestinations(Array.isArray(destinations) ? destinations : []);
          }

          // Parse itinerary
          if (tourData.lich_trinh) {
            const itinerary = typeof tourData.lich_trinh === 'string'
              ? JSON.parse(tourData.lich_trinh)
              : tourData.lich_trinh;
            setTourItinerary(Array.isArray(itinerary) ? itinerary : []);
          }

          // Parse departures
          if (tourData.lich_khoi_hanh) {
            const departures = typeof tourData.lich_khoi_hanh === 'string'
              ? JSON.parse(tourData.lich_khoi_hanh)
              : tourData.lich_khoi_hanh;
            setTourDepartures(Array.isArray(departures) ? departures : []);
          }

          // Set tour config
          if (tourData.so_nho_nhat !== undefined || tourData.so_lon_nhat !== undefined) {
            setTourConfig({
              so_nho_nhat: tourData.so_nho_nhat || 1,
              so_lon_nhat: tourData.so_lon_nhat || 50,
            });
          }

          // Load discounts from dedicated endpoint
          try {
            const discounts = await supplierTourService.getDiscountsByTour(parseInt(id));
            if (discounts && discounts.length > 0) {
              setTourDiscounts(discounts);
            } else {
              setTourDiscounts([]);
            }
          } catch (discountError) {
            console.error('Error loading discounts:', discountError);
            setTourDiscounts([]);
          }
        } catch (parseError) {
          console.error('Error parsing tour detail data:', parseError);
        }
      } catch (error) {
        console.error('Error loading tour:', error);
        showToast('Không thể tải thông tin tour', 'error');
        navigate('/supplier/tours');
      } finally {
        setLoading(false);
      }
    };

    loadTour();
  }, [id, navigate, showToast]);

  // Handle update basic info (tab Thông tin cơ bản)
  const handleUpdateBasicInfo = async () => {
    console.log('🔄 handleUpdateBasicInfo called');
    console.log('📋 Form data:', formData);
    console.log('🏢 nhaCungCapId:', nhaCungCapId);
    console.log('🆔 Tour ID:', id);

    // Validation
    if (!formData.tieu_de.trim()) {
      showToast('Vui lòng nhập tiêu đề tour', 'error');
      return;
    }

    if (formData.so_ngay < 1) {
      showToast('Số ngày phải lớn hơn 0', 'error');
      return;
    }

    if (formData.gia_nguoi_lon <= 0 || formData.gia_tre_em <= 0) {
      showToast('Giá phải lớn hơn 0', 'error');
      return;
    }

    if (!nhaCungCapId) {
      showToast('Không tìm thấy thông tin nhà cung cấp', 'error');
      return;
    }

    if (!id) {
      showToast('Không tìm thấy ID tour', 'error');
      return;
    }

    try {
      setSubmitting(true);
      // Prepare data according to UpdateTourRequest format
      const updateData = {
        tieu_de: formData.tieu_de,
        mo_ta: formData.mo_ta || '',
        danh_muc_id: formData.danh_muc_id || 0,
        so_ngay: formData.so_ngay,
        so_dem: formData.so_dem || 0,
        gia_nguoi_lon: formData.gia_nguoi_lon,
        gia_tre_em: formData.gia_tre_em,
        don_vi_tien_te: formData.don_vi_tien_te || 'VND',
        trang_thai: formData.trang_thai || 'nhap',
        noi_bat: formData.noi_bat || false,
        nha_cung_cap_id: nhaCungCapId,
      };
      
      console.log('📤 Calling updateTour API with:', {
        tourId: parseInt(id!),
        updateData
      });
      
      await supplierTourService.updateTour(parseInt(id!), updateData);
      console.log('✅ Tour updated successfully');
      openSuccessModal('Cập nhật thông tin cơ bản thành công!');
      // Reload tour data to reflect changes
      const tourData = await supplierTourService.getTourById(parseInt(id!));
      setFormData({
        tieu_de: tourData.tieu_de || '',
        mo_ta: tourData.mo_ta || '',
        danh_muc_id: tourData.danh_muc_id || 0,
        so_ngay: tourData.so_ngay || 1,
        so_dem: tourData.so_dem || 0,
        gia_nguoi_lon: tourData.gia_nguoi_lon || 0,
        gia_tre_em: tourData.gia_tre_em || 0,
        don_vi_tien_te: tourData.don_vi_tien_te || 'VND',
        trang_thai: tourData.trang_thai || 'nhap',
        noi_bat: tourData.noi_bat || false,
      });
    } catch (error: any) {
      console.error('Error updating tour:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật tour';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // State for editing itinerary and activity
  const [showItineraryForm, setShowItineraryForm] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<any>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [itineraryFormData, setItineraryFormData] = useState({
    ngay_thu: 1,
    tieu_de: '',
    mo_ta: '',
    gio_bat_dau: '',
    gio_ket_thuc: '',
    dia_diem: '',
    thong_tin_luu_tru: '',
  });
  const [activityFormData, setActivityFormData] = useState({
    ten: '',
    gio_bat_dau: '',
    gio_ket_thuc: '',
    mo_ta: '',
    thu_tu: 1,
  });
  const [updatingItineraryId, setUpdatingItineraryId] = useState<number | null>(null);
  const [updatingActivityId, setUpdatingActivityId] = useState<number | null>(null);

  // Handle open edit itinerary form
  const handleOpenEditItinerary = (itinerary: any) => {
    setEditingItinerary(itinerary);
    setItineraryFormData({
      ngay_thu: itinerary.ngay_thu || 1,
      tieu_de: itinerary.tieu_de || '',
      mo_ta: itinerary.mo_ta || '',
      gio_bat_dau: itinerary.gio_bat_dau || '',
      gio_ket_thuc: itinerary.gio_ket_thuc || '',
      dia_diem: itinerary.dia_diem || '',
      thong_tin_luu_tru: itinerary.thong_tin_luu_tru || '',
    });
    setShowItineraryForm(true);
  };

  // Handle save itinerary
  const handleSaveItinerary = async () => {
    if (!editingItinerary?.id) {
      showToast('Không tìm thấy ID lịch trình', 'error');
      return;
    }

    if (!itineraryFormData.tieu_de.trim()) {
      showToast('Vui lòng nhập tiêu đề lịch trình', 'error');
      return;
    }

    try {
      setUpdatingItineraryId(editingItinerary.id);
      await supplierTourService.updateItinerary(editingItinerary.id, itineraryFormData);
      openSuccessModal('Cập nhật lịch trình thành công!');
      setShowItineraryForm(false);
      setEditingItinerary(null);
      // Reload tour data
      const tourData = await supplierTourService.getTourById(parseInt(id!));
      if (tourData.lich_trinh) {
        const itinerary = typeof tourData.lich_trinh === 'string'
          ? JSON.parse(tourData.lich_trinh)
          : tourData.lich_trinh;
        setTourItinerary(Array.isArray(itinerary) ? itinerary : []);
      }
    } catch (error: any) {
      console.error('Error updating itinerary:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật lịch trình';
      showToast(errorMessage, 'error');
    } finally {
      setUpdatingItineraryId(null);
    }
  };

  // Handle open edit activity form
  const handleOpenEditActivity = (activity: any, _itineraryId: number) => {
    setEditingActivity(activity);
    setActivityFormData({
      ten: activity.ten || '',
      gio_bat_dau: activity.gio_bat_dau || '',
      gio_ket_thuc: activity.gio_ket_thuc || '',
      mo_ta: activity.mo_ta || '',
      thu_tu: activity.thu_tu || 1,
    });
    setShowActivityForm(true);
  };

  // Handle add image
  const handleAddImage = async () => {
    if (!id) {
      showToast('Không tìm thấy ID tour', 'error');
      return;
    }

    if (imageFormData.files.length === 0) {
      showToast('Vui lòng chọn ít nhất một file ảnh', 'error');
      return;
    }

    try {
      setImageLoading(true);
      
      // Upload images to Supabase
      const uploadResult = await imageUploadService.uploadTourImages(imageFormData.files);
      
      if (uploadResult.images.length === 0) {
        showToast('Không có ảnh nào được upload thành công', 'error');
        return;
      }

      // Add each uploaded image to tour
      for (let i = 0; i < uploadResult.images.length; i++) {
        const uploadedImage = uploadResult.images[i];
        await supplierTourService.addTourImage(parseInt(id!), {
          duong_dan: uploadedImage.link,
          mo_ta: imageFormData.mo_ta || '',
          la_anh_chinh: imageFormData.la_anh_chinh && i === 0, // Only first image is primary
          thu_tu_hien_thi: imageFormData.thu_tu_hien_thi + i,
        });
      }
      openSuccessModal('Thêm hình ảnh thành công!');
      setShowAddImageForm(false);
      setImageFormData({
        files: [],
        mo_ta: '',
        la_anh_chinh: false,
        thu_tu_hien_thi: tourImages.length,
      });
      
      // Reload tour data
      const tourData = await supplierTourService.getTourById(parseInt(id!));
      if (tourData.hinh_anh) {
        const images = typeof tourData.hinh_anh === 'string' 
          ? JSON.parse(tourData.hinh_anh) 
          : tourData.hinh_anh;
        setTourImages(Array.isArray(images) ? images : []);
      }
    } catch (error: any) {
      console.error('Error adding image:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra khi thêm hình ảnh';
      showToast(errorMessage, 'error');
    } finally {
      setImageLoading(false);
    }
  };

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoadingCountries(true);
        const countriesList = await supplierTourService.getCountries();
        setCountries(countriesList);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    loadCountries();
  }, []);

  // Handle country change
  const handleCountryChange = async (country: string) => {
    setDestinationFormData(prev => ({
      ...prev,
      selectedCountry: country,
      selectedProvince: '',
      selectedCity: '',
      selectedDestinationId: 0,
    }));
    setProvinces([]);
    setCities([]);
    
    if (country) {
      try {
        setLoadingProvinces(true);
        const provincesList = await supplierTourService.getProvincesByCountry(country);
        setProvinces(provincesList);
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    }
  };

  // Handle province change
  const handleProvinceChange = async (provinceName: string) => {
    setDestinationFormData(prev => ({
      ...prev,
      selectedProvince: provinceName,
      selectedCity: '',
      selectedDestinationId: 0,
    }));
    setCities([]);
    
    if (provinceName) {
      try {
        setLoadingCities(true);
        const citiesList = await supplierTourService.getCitiesByProvince(provinceName);
        setCities(citiesList);
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoadingCities(false);
      }
    }
  };

  // Handle city change
  const handleCityChange = (cityName: string) => {
    if (!cityName) {
      setDestinationFormData(prev => ({
        ...prev,
        selectedCity: '',
        selectedDestinationId: 0,
      }));
      return;
    }

    // Find the city in the cities list to get the actual ID
    const selectedCity = cities.find(c => c.ten === cityName);
    if (selectedCity) {
      setDestinationFormData(prev => ({
        ...prev,
        selectedCity: cityName,
        selectedDestinationId: selectedCity.id,
      }));
    } else {
      setDestinationFormData(prev => ({
        ...prev,
        selectedCity: cityName,
        selectedDestinationId: 0,
      }));
    }
  };

  // Handle add destination
  const handleAddDestination = async () => {
    if (!id) {
      showToast('Không tìm thấy ID tour', 'error');
      return;
    }

    if (!destinationFormData.selectedDestinationId) {
      showToast('Vui lòng chọn điểm đến', 'error');
      return;
    }

    // Check if destination already exists
    const exists = tourDestinations.some((dest: any) => dest.id === destinationFormData.selectedDestinationId);
    if (exists) {
      showToast('Điểm đến này đã được thêm vào tour', 'error');
      return;
    }

    try {
      setDestinationLoading(true);
      await supplierTourService.addTourDestination(parseInt(id!), {
        diem_den_id: destinationFormData.selectedDestinationId,
        thu_tu_tham_quan: destinationFormData.thu_tu_tham_quan,
      });
      openSuccessModal('Thêm điểm đến thành công!');
      setShowAddDestinationForm(false);
      setDestinationFormData({
        selectedCountry: '',
        selectedProvince: '',
        selectedCity: '',
        selectedDestinationId: 0,
        thu_tu_tham_quan: tourDestinations.length + 1,
      });
      
      // Reload tour data
      const tourData = await supplierTourService.getTourById(parseInt(id!));
      if (tourData.diem_den) {
        const destinations = typeof tourData.diem_den === 'string'
          ? JSON.parse(tourData.diem_den)
          : tourData.diem_den;
        setTourDestinations(Array.isArray(destinations) ? destinations : []);
      }
    } catch (error: any) {
      console.error('Error adding destination:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra khi thêm điểm đến';
      showToast(errorMessage, 'error');
    } finally {
      setDestinationLoading(false);
    }
  };

  // Handle delete destination
  const handleDeleteDestination = async (diemDenId: number) => {
    if (!id) {
      showToast('Không tìm thấy ID tour', 'error');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa điểm đến này không?')) {
      return;
    }

    try {
      setDeletingDestinationId(diemDenId);
      await supplierTourService.deleteTourDestination(parseInt(id!), diemDenId);
      openSuccessModal('Xóa điểm đến thành công!');
      
      // Reload tour data
      const tourData = await supplierTourService.getTourById(parseInt(id!));
      if (tourData.diem_den) {
        const destinations = typeof tourData.diem_den === 'string'
          ? JSON.parse(tourData.diem_den)
          : tourData.diem_den;
        setTourDestinations(Array.isArray(destinations) ? destinations : []);
      }
    } catch (error: any) {
      console.error('Error deleting destination:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra khi xóa điểm đến';
      showToast(errorMessage, 'error');
    } finally {
      setDeletingDestinationId(null);
    }
  };

  // Handle delete image
  const handleDeleteImage = async (imageId: number) => {
    if (!imageId) {
      showToast('Không tìm thấy ID hình ảnh', 'error');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này không?')) {
      return;
    }

    try {
      setDeletingImageId(imageId);
      await supplierTourService.deleteTourImage(imageId);
      openSuccessModal('Xóa hình ảnh thành công!');
      
      // Reload tour data
      if (id) {
        const tourData = await supplierTourService.getTourById(parseInt(id));
        if (tourData.hinh_anh) {
          const images = typeof tourData.hinh_anh === 'string' 
            ? JSON.parse(tourData.hinh_anh) 
            : tourData.hinh_anh;
          setTourImages(Array.isArray(images) ? images : []);
        }
      }
    } catch (error: any) {
      console.error('Error deleting image:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra khi xóa hình ảnh';
      showToast(errorMessage, 'error');
    } finally {
      setDeletingImageId(null);
    }
  };

  // Handle save activity
  const handleSaveActivity = async () => {
    if (!editingActivity?.id) {
      showToast('Không tìm thấy ID hoạt động', 'error');
      return;
    }

    if (!activityFormData.ten.trim()) {
      showToast('Vui lòng nhập tên hoạt động', 'error');
      return;
    }

    try {
      setUpdatingActivityId(editingActivity.id);
      await supplierTourService.updateActivity(editingActivity.id, activityFormData);
      openSuccessModal('Cập nhật hoạt động thành công!');
      setShowActivityForm(false);
      setEditingActivity(null);
      // Reload tour data
      const tourData = await supplierTourService.getTourById(parseInt(id!));
      if (tourData.lich_trinh) {
        const itinerary = typeof tourData.lich_trinh === 'string'
          ? JSON.parse(tourData.lich_trinh)
          : tourData.lich_trinh;
        setTourItinerary(Array.isArray(itinerary) ? itinerary : []);
      }
    } catch (error: any) {
      console.error('Error updating activity:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật hoạt động';
      showToast(errorMessage, 'error');
    } finally {
      setUpdatingActivityId(null);
    }
  };

  // Handle input change
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Departure handlers
  const handleOpenCreateDeparture = () => {
    setEditingDeparture(null);
    setDepartureFormData({
      ngay_khoi_hanh: '',
      ngay_ket_thuc: '',
      suc_chua: 20,
      trang_thai: 'len_lich',
      ghi_chu: '',
    });
    setShowDepartureForm(true);
  };

  const handleOpenEditDeparture = (departure: any) => {
    setEditingDeparture(departure);
    setDepartureFormData({
      ngay_khoi_hanh: departure.ngay_khoi_hanh ? new Date(departure.ngay_khoi_hanh).toISOString().split('T')[0] : '',
      ngay_ket_thuc: departure.ngay_ket_thuc ? new Date(departure.ngay_ket_thuc).toISOString().split('T')[0] : '',
      suc_chua: departure.suc_chua || 20,
      trang_thai: departure.trang_thai || 'len_lich',
      ghi_chu: departure.ghi_chu || '',
    });
    setShowDepartureForm(true);
  };

  const handleSaveDeparture = async () => {
    if (!id) return;

    if (!departureFormData.ngay_khoi_hanh || !departureFormData.ngay_ket_thuc) {
      showToast('Vui lòng nhập đầy đủ ngày khởi hành và ngày kết thúc', 'error');
      return;
    }

    if (departureFormData.suc_chua <= 0) {
      showToast('Sức chứa phải lớn hơn 0', 'error');
      return;
    }

    try {
      setDepartureLoading(true);
      if (editingDeparture) {
        // Update
        await supplierTourService.updateDeparture(editingDeparture.id, departureFormData);
        openSuccessModal('Cập nhật lịch khởi hành thành công!');
      } else {
        // Create
        await supplierTourService.createDeparture({
          tour_id: parseInt(id),
          ...departureFormData,
        });
        openSuccessModal('Tạo lịch khởi hành thành công!');
      }
      
      // Reload tour data
      const tourData = await supplierTourService.getTourById(parseInt(id));
      if (tourData.lich_khoi_hanh) {
        const departures = typeof tourData.lich_khoi_hanh === 'string'
          ? JSON.parse(tourData.lich_khoi_hanh)
          : tourData.lich_khoi_hanh;
        setTourDepartures(Array.isArray(departures) ? departures : []);
      }
      
      setShowDepartureForm(false);
      setEditingDeparture(null);
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setDepartureLoading(false);
    }
  };

  const handleDeleteDeparture = async (departureId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch khởi hành này?')) {
      return;
    }

    try {
      setDepartureLoading(true);
      await supplierTourService.deleteDeparture(departureId);
      openSuccessModal('Xóa lịch khởi hành thành công!');
      
      // Reload tour data
      if (id) {
        const tourData = await supplierTourService.getTourById(parseInt(id));
        if (tourData.lich_khoi_hanh) {
          const departures = typeof tourData.lich_khoi_hanh === 'string'
            ? JSON.parse(tourData.lich_khoi_hanh)
            : tourData.lich_khoi_hanh;
          setTourDepartures(Array.isArray(departures) ? departures : []);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setDepartureLoading(false);
    }
  };

  const handleCancelDeparture = async (departureId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch khởi hành này?')) {
      return;
    }

    try {
      setDepartureLoading(true);
      await supplierTourService.cancelDeparture(departureId);
      openSuccessModal('Hủy lịch khởi hành thành công!');
      
      // Reload tour data
      if (id) {
        const tourData = await supplierTourService.getTourById(parseInt(id));
        if (tourData.lich_khoi_hanh) {
          const departures = typeof tourData.lich_khoi_hanh === 'string'
            ? JSON.parse(tourData.lich_khoi_hanh)
            : tourData.lich_khoi_hanh;
          setTourDepartures(Array.isArray(departures) ? departures : []);
        }
      }
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setDepartureLoading(false);
    }
  };

  // Discount handlers
  const handleOpenCreateDiscount = () => {
    setEditingDiscount(null);
    setDiscountFormData({
      phan_tram: 10,
      ngay_bat_dau: '',
      ngay_ket_thuc: '',
    });
    setShowDiscountForm(true);
  };

  const handleOpenEditDiscount = (discount: any) => {
    setEditingDiscount(discount);
    setDiscountFormData({
      phan_tram: parseFloat(discount.phan_tram?.toString() || '10'),
      ngay_bat_dau: discount.ngay_bat_dau ? new Date(discount.ngay_bat_dau).toISOString().split('T')[0] : '',
      ngay_ket_thuc: discount.ngay_ket_thuc ? new Date(discount.ngay_ket_thuc).toISOString().split('T')[0] : '',
    });
    setShowDiscountForm(true);
  };

  const handleSaveDiscount = async () => {
    if (!id) return;

    if (!discountFormData.ngay_bat_dau || !discountFormData.ngay_ket_thuc) {
      showToast('Vui lòng nhập đầy đủ ngày bắt đầu và ngày kết thúc', 'error');
      return;
    }

    if (discountFormData.phan_tram <= 0 || discountFormData.phan_tram > 100) {
      showToast('Phần trăm giảm giá phải từ 1 đến 100', 'error');
      return;
    }

    if (new Date(discountFormData.ngay_bat_dau) > new Date(discountFormData.ngay_ket_thuc)) {
      showToast('Ngày kết thúc phải sau ngày bắt đầu', 'error');
      return;
    }

    try {
      setDiscountLoading(true);
      if (editingDiscount && editingDiscount.id) {
        // Update
        await supplierTourService.updateDiscountTour({
          id: editingDiscount.id,
          tour_id: parseInt(id),
          ...discountFormData,
        });
        openSuccessModal('Cập nhật khuyến mãi thành công!');
      } else {
        // Create
        await supplierTourService.createDiscountTour({
          tour_id: parseInt(id),
          ...discountFormData,
        });
        openSuccessModal('Tạo khuyến mãi thành công!');
      }
      
      // Reload discounts
      const discounts = await supplierTourService.getDiscountsByTour(parseInt(id));
      setTourDiscounts(discounts || []);
      
      setShowDiscountForm(false);
      setEditingDiscount(null);
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleDeleteDiscount = async (discountId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      return;
    }

    if (!id) return;

    try {
      setDiscountLoading(true);
      await supplierTourService.deleteDiscountTour(discountId, parseInt(id));
      openSuccessModal('Xóa khuyến mãi thành công!');
      
      // Reload discounts
      const discounts = await supplierTourService.getDiscountsByTour(parseInt(id));
      setTourDiscounts(discounts || []);
    } catch (error: any) {
      showToast(error.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setDiscountLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<SupplierSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải thông tin tour..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<SupplierSidebar />}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="relative rounded-3xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-[#030712]">
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-0 w-[200px] h-[200px] bg-pink-500/15 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
            
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="relative z-10 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Chỉnh sửa tour</h1>
                <p className="text-cyan-300">Cập nhật thông tin tour của bạn</p>
            </div>
            <button
              onClick={() => navigate('/supplier/manage-tours')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 flex items-center font-semibold shadow-lg shadow-cyan-500/25"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Quay lại
            </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b border-white/10 overflow-x-auto">
            <TabButton
              active={activeTab === 'basic'}
              onClick={() => setActiveTab('basic')}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
            >
              Thông tin cơ bản
            </TabButton>
            <TabButton
              active={activeTab === 'images'}
              onClick={() => setActiveTab('images')}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>}
            >
              Hình ảnh ({tourImages.length})
            </TabButton>
            <TabButton
              active={activeTab === 'destinations'}
              onClick={() => setActiveTab('destinations')}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
            >
              Điểm đến ({tourDestinations.length})
            </TabButton>
            <TabButton
              active={activeTab === 'itinerary'}
              onClick={() => setActiveTab('itinerary')}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>}
            >
              Lịch trình ({tourItinerary.length})
            </TabButton>
            <TabButton
              active={activeTab === 'departures'}
              onClick={() => setActiveTab('departures')}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>}
            >
              Lịch khởi hành ({tourDepartures.length})
            </TabButton>
            {tourConfig && (
              <TabButton
                active={activeTab === 'config'}
                onClick={() => setActiveTab('config')}
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>}
              >
                Cấu Hình Nhóm
              </TabButton>
            )}
            <TabButton
              active={activeTab === 'discount'}
              onClick={() => setActiveTab('discount')}
              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
            >
              Khuyến mãi ({tourDiscounts.length})
            </TabButton>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3"></div>
              Thông tin cơ bản
            </h2>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiêu đề <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tieu_de}
                  onChange={(e) => handleChange('tieu_de', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                  placeholder="VD: Du lịch Đà Nẵng 3 ngày 2 đêm"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.mo_ta}
                  onChange={(e) => handleChange('mo_ta', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                  rows={4}
                  placeholder="Mô tả chi tiết về tour..."
                />
              </div>

              {/* Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số ngày <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.so_ngay}
                    onChange={(e) => handleChange('so_ngay', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Số đêm <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.so_dem}
                    onChange={(e) => handleChange('so_dem', parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giá Người Lớn (VND) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.gia_nguoi_lon}
                    onChange={(e) => handleChange('gia_nguoi_lon', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Giá Trẻ Em (VND) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.gia_tre_em}
                    onChange={(e) => handleChange('gia_tre_em', parseFloat(e.target.value))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-gray-500 transition-all"
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.trang_thai}
                  onChange={(e) => handleChange('trang_thai', e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                >
                  <option value="nhap" className="bg-slate-900">Nháp</option>
                  <option value="cong_bo" className="bg-slate-900">Công bố</option>
                  <option value="luu_tru" className="bg-slate-900">Lưu trữ</option>
                </select>
              </div>

              {/* Featured */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noi_bat"
                  checked={formData.noi_bat}
                  onChange={(e) => handleChange('noi_bat', e.target.checked)}
                  className="w-5 h-5 text-cyan-500 border-white/20 rounded focus:ring-2 focus:ring-cyan-500/50 bg-white/5"
                />
                <label htmlFor="noi_bat" className="ml-3 text-sm font-medium text-gray-300">
                  Đánh dấu là tour nổi bật
                </label>
              </div>
            </div>
          </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3"></div>
                  Hình ảnh tour ({tourImages.length})
              </h2>
                <button
                  onClick={() => setShowAddImageForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm hình ảnh
                </button>
              </div>
              {tourImages.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Chưa có hình ảnh nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {tourImages.map((image: any, index: number) => (
                    <div key={image.id || index} className="relative group">
                      <img
                        src={image.duong_dan || image.link}
                        alt={image.mo_ta || `Tour image ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border border-white/10 hover:border-cyan-400/50 transition-all"
                      />
                      {image.la_anh_chinh && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-cyan-500/90 text-white text-xs rounded font-medium">
                          Ảnh chính
                        </span>
                      )}
                      {image.mo_ta && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
                          <p className="text-xs text-white truncate">{image.mo_ta}</p>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        disabled={deletingImageId === image.id}
                        className="absolute top-2 left-2 p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa hình ảnh"
                      >
                        {deletingImageId === image.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Image Form Modal */}
          {showAddImageForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Thêm hình ảnh
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddImageForm(false);
                        setImageFormData({
                          files: [],
                          mo_ta: '',
                          la_anh_chinh: false,
                          thu_tu_hien_thi: tourImages.length,
                        });
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Chọn file ảnh <span className="text-red-400">*</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setImageFormData(prev => ({ ...prev, files }));
                        }}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30"
                      />
                      {imageFormData.files.length > 0 && (
                        <p className="mt-2 text-sm text-gray-400">
                          Đã chọn {imageFormData.files.length} file(s)
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Mô tả
                      </label>
                      <textarea
                        value={imageFormData.mo_ta}
                        onChange={(e) => setImageFormData(prev => ({ ...prev, mo_ta: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                        rows={3}
                        placeholder="Mô tả về hình ảnh..."
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="la_anh_chinh"
                          checked={imageFormData.la_anh_chinh}
                          onChange={(e) => setImageFormData(prev => ({ ...prev, la_anh_chinh: e.target.checked }))}
                          className="w-5 h-5 text-cyan-500 border-white/20 rounded focus:ring-2 focus:ring-cyan-500/50 bg-white/5"
                        />
                        <label htmlFor="la_anh_chinh" className="ml-2 text-sm font-medium text-gray-300">
                          Đặt làm ảnh chính
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Thứ tự hiển thị
                      </label>
                      <input
                        type="number"
                        value={imageFormData.thu_tu_hien_thi}
                        onChange={(e) => setImageFormData(prev => ({ ...prev, thu_tu_hien_thi: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                        min="0"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => {
                          setShowAddImageForm(false);
                          setImageFormData({
                            files: [],
                            mo_ta: '',
                            la_anh_chinh: false,
                            thu_tu_hien_thi: tourImages.length,
                          });
                        }}
                        className="px-6 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors font-medium"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleAddImage}
                        disabled={imageLoading || imageFormData.files.length === 0}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {imageLoading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Đang thêm...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Thêm hình ảnh
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Destinations Tab */}
          {activeTab === 'destinations' && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3"></div>
                  Điểm đến ({tourDestinations.length})
              </h2>
                <button
                  onClick={() => setShowAddDestinationForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm điểm đến
                </button>
              </div>
              {tourDestinations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Chưa có điểm đến nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tourDestinations.map((dest: any, index: number) => (
                    <div key={dest.id || index} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-lg mb-1">{dest.ten}</h4>
                          <p className="text-sm text-gray-400 mb-2">
                            {dest.tinh}, {dest.quoc_gia}
                          </p>
                          {dest.thu_tu_tham_quan && (
                            <span className="inline-flex items-center px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded border border-cyan-400/30">
                              Thứ tự tham quan: {dest.thu_tu_tham_quan}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteDestination(dest.id)}
                          disabled={deletingDestinationId === dest.id}
                          className="ml-4 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-400/30 hover:border-red-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa điểm đến"
                        >
                          {deletingDestinationId === dest.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add Destination Form Modal */}
          {showAddDestinationForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">
                      Thêm điểm đến
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddDestinationForm(false);
                        setDestinationFormData({
                          selectedCountry: '',
                          selectedProvince: '',
                          selectedCity: '',
                          selectedDestinationId: 0,
                          thu_tu_tham_quan: tourDestinations.length + 1,
                        });
                        setProvinces([]);
                        setCities([]);
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Quốc gia <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={destinationFormData.selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                        disabled={loadingCountries}
                      >
                        <option value="">Chọn quốc gia</option>
                        {countries.map((country) => (
                          <option key={country} value={country} className="bg-slate-800">
                            {country}
                          </option>
                        ))}
                      </select>
                      {loadingCountries && (
                        <p className="mt-2 text-sm text-gray-400">Đang tải...</p>
                      )}
                    </div>

                    {destinationFormData.selectedCountry && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Tỉnh/Thành phố <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={destinationFormData.selectedProvince}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                          disabled={loadingProvinces || !destinationFormData.selectedCountry}
                        >
                          <option value="">Chọn tỉnh/thành phố</option>
                          {provinces.map((province) => (
                            <option key={province.id} value={province.tinh || ''} className="bg-slate-800">
                              {province.tinh || ''}
                            </option>
                          ))}
                        </select>
                        {loadingProvinces && (
                          <p className="mt-2 text-sm text-gray-400">Đang tải...</p>
                        )}
                      </div>
                    )}

                    {destinationFormData.selectedProvince && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Thành phố/Địa điểm <span className="text-red-400">*</span>
                        </label>
                        <select
                          value={destinationFormData.selectedCity}
                          onChange={(e) => handleCityChange(e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                          disabled={loadingCities || !destinationFormData.selectedProvince}
                        >
                          <option value="">Chọn thành phố/địa điểm</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.ten} className="bg-slate-800">
                              {city.ten}
                            </option>
                          ))}
                        </select>
                        {loadingCities && (
                          <p className="mt-2 text-sm text-gray-400">Đang tải...</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Thứ tự tham quan
                      </label>
                      <input
                        type="number"
                        value={destinationFormData.thu_tu_tham_quan}
                        onChange={(e) => setDestinationFormData(prev => ({ ...prev, thu_tu_tham_quan: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                        min="1"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => {
                          setShowAddDestinationForm(false);
                          setDestinationFormData({
                            selectedCountry: '',
                            selectedProvince: '',
                            selectedCity: '',
                            selectedDestinationId: 0,
                            thu_tu_tham_quan: tourDestinations.length + 1,
                          });
                          setProvinces([]);
                          setCities([]);
                        }}
                        className="px-6 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors font-medium"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleAddDestination}
                        disabled={destinationLoading || !destinationFormData.selectedDestinationId}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {destinationLoading ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Đang thêm...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Thêm điểm đến
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === 'itinerary' && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3"></div>
                Lịch trình ({tourItinerary.length} ngày)
              </h2>
              {tourItinerary.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Chưa có lịch trình nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tourItinerary.map((day: any, index: number) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold text-lg">
                          Ngày {day.ngay_thu || index + 1}: {day.tieu_de}
                        </h4>
                        <button
                          onClick={() => handleOpenEditItinerary(day)}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all text-sm font-medium flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Chỉnh sửa
                        </button>
                      </div>
                      {day.dia_diem && (
                        <p className="text-sm text-gray-400 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {day.dia_diem}
                        </p>
                      )}
                      {day.gio_bat_dau && day.gio_ket_thuc && (
                        <p className="text-sm text-gray-400 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {day.gio_bat_dau} - {day.gio_ket_thuc}
                        </p>
                      )}
                      {day.mo_ta && (
                        <p className="text-sm text-gray-300 mb-4 leading-relaxed">{day.mo_ta}</p>
                      )}
                      {day.thong_tin_luu_tru && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-400 mb-2 font-medium">🏨 Thông tin lưu trú:</p>
                          <p className="text-sm text-gray-300">{day.thong_tin_luu_tru}</p>
                        </div>
                      )}
                      {day.hoat_dong && Array.isArray(day.hoat_dong) && day.hoat_dong.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-400 mb-3 font-medium">Hoạt động trong ngày:</p>
                          <ul className="space-y-2">
                            {day.hoat_dong.map((activity: any, actIndex: number) => (
                              <li key={actIndex} className="text-sm text-gray-300 flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-cyan-400">•</span>
                                  <span className="font-medium">{activity.ten}</span>
                                  {activity.gio_bat_dau && activity.gio_ket_thuc && (
                                      <span className="text-gray-500 text-xs">
                                      ({activity.gio_bat_dau} - {activity.gio_ket_thuc})
                                    </span>
                                  )}
                                  </div>
                                  {activity.mo_ta && (
                                    <p className="text-gray-400 text-xs mt-1 ml-4">{activity.mo_ta}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleOpenEditActivity(activity, day.id)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all text-xs font-medium flex items-center gap-1 flex-shrink-0"
                                  title="Chỉnh sửa hoạt động"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Chỉnh sửa
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Departures Tab */}
          {activeTab === 'departures' && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3"></div>
                  Lịch khởi hành ({tourDepartures.length} chuyến)
                </h2>
                <button
                  onClick={handleOpenCreateDeparture}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tạo mới
                </button>
              </div>
              {tourDepartures.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p className="mb-4">Chưa có lịch khởi hành nào</p>
                  <button
                    onClick={handleOpenCreateDeparture}
                    className="px-4 py-2 bg-white/5 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Tạo lịch khởi hành đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tourDepartures.map((dep: any, index: number) => (
                    <div key={dep.id || index} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold text-lg">Chuyến {index + 1}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs rounded font-medium ${
                            dep.trang_thai === 'xac_nhan' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                            dep.trang_thai === 'len_lich' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            dep.trang_thai === 'huy' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            dep.trang_thai === 'hoan_thanh' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {dep.trang_thai === 'xac_nhan' ? 'Xác nhận' :
                             dep.trang_thai === 'len_lich' ? 'Lên lịch' :
                             dep.trang_thai === 'huy' ? 'Đã hủy' :
                             dep.trang_thai === 'hoan_thanh' ? 'Hoàn thành' : dep.trang_thai}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditDeparture(dep)}
                              className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors border border-purple-400/30 hover:border-purple-400/50"
                              title="Chỉnh sửa"
                              disabled={departureLoading}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {dep.trang_thai !== 'huy' && (
                              <button
                                onClick={() => handleCancelDeparture(dep.id)}
                                className="p-2 text-orange-400 hover:bg-orange-500/20 rounded-lg transition-colors border border-orange-400/30 hover:border-orange-400/50"
                                title="Hủy"
                                disabled={departureLoading}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteDeparture(dep.id)}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-400/30 hover:border-red-400/50"
                              title="Xóa"
                              disabled={departureLoading}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400 block mb-1">Ngày khởi hành:</span>
                          <p className="text-white font-medium">
                            {dep.ngay_khoi_hanh ? new Date(dep.ngay_khoi_hanh).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-1">Ngày kết thúc:</span>
                          <p className="text-white font-medium">
                            {dep.ngay_ket_thuc ? new Date(dep.ngay_ket_thuc).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : '-'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-1">Sức chứa:</span>
                          <p className="text-white font-medium">{dep.suc_chua || '-'} khách</p>
                        </div>
                        <div>
                          <span className="text-gray-400 block mb-1">Đã đặt:</span>
                          <p className="text-white font-medium">{dep.so_cho_da_dat || 0} chỗ</p>
                        </div>
                      </div>
                      {dep.ghi_chu && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <p className="text-xs text-gray-400 mb-2 font-medium">Ghi chú:</p>
                          <p className="text-sm text-gray-300">{dep.ghi_chu}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Departure Form Modal */}
              {showDepartureForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">
                          {editingDeparture ? 'Chỉnh sửa lịch khởi hành' : 'Tạo lịch khởi hành mới'}
                        </h3>
                        <button
                          onClick={() => {
                            setShowDepartureForm(false);
                            setEditingDeparture(null);
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Ngày khởi hành <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="date"
                              value={departureFormData.ngay_khoi_hanh}
                              onChange={(e) => setDepartureFormData(prev => ({ ...prev, ngay_khoi_hanh: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Ngày kết thúc <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="date"
                              value={departureFormData.ngay_ket_thuc}
                              onChange={(e) => setDepartureFormData(prev => ({ ...prev, ngay_ket_thuc: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Sức chứa <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="number"
                              value={departureFormData.suc_chua}
                              onChange={(e) => setDepartureFormData(prev => ({ ...prev, suc_chua: parseInt(e.target.value) || 0 }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Trạng thái
                            </label>
                            <select
                              value={departureFormData.trang_thai}
                              onChange={(e) => setDepartureFormData(prev => ({ ...prev, trang_thai: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                            >
                              <option value="len_lich" className="bg-slate-900">Lên lịch</option>
                              <option value="xac_nhan" className="bg-slate-900">Xác nhận</option>
                              <option value="con_cho" className="bg-slate-900">Còn chỗ</option>
                              <option value="huy" className="bg-slate-900">Hủy</option>
                              <option value="hoan_thanh" className="bg-slate-900">Hoàn thành</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Ghi chú
                          </label>
                          <textarea
                            value={departureFormData.ghi_chu}
                            onChange={(e) => setDepartureFormData(prev => ({ ...prev, ghi_chu: e.target.value }))}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                            rows={3}
                            placeholder="Nhập ghi chú (nếu có)..."
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                        <button
                          onClick={() => {
                            setShowDepartureForm(false);
                            setEditingDeparture(null);
                          }}
                          className="px-6 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors font-medium"
                          disabled={departureLoading}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveDeparture}
                          disabled={departureLoading}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {departureLoading ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {editingDeparture ? 'Cập nhật' : 'Tạo mới'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Config Tab */}
          {activeTab === 'config' && tourConfig && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3"></div>
                Cấu Hình Nhóm
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Số người tối thiểu
                  </label>
                  <div className="px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white text-lg font-semibold">
                    {tourConfig.so_nho_nhat} người
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Số người tối đa
                  </label>
                  <div className="px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white text-lg font-semibold">
                    {tourConfig.so_lon_nhat} người
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Discount Tab */}
          {activeTab === 'discount' && (
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mr-3"></div>
                  Khuyến mãi ({tourDiscounts.length})
                </h2>
                <button
                  onClick={handleOpenCreateDiscount}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tạo mới
                </button>
              </div>
              {tourDiscounts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mb-4">Chưa có khuyến mãi nào</p>
                  <button
                    onClick={handleOpenCreateDiscount}
                    className="px-4 py-2 bg-white/5 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                  >
                    Tạo khuyến mãi đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tourDiscounts.map((discount: any, index: number) => {
                    const phanTram = parseFloat(discount.phan_tram?.toString() || '0');
                    const isActive = discount.ngay_bat_dau && discount.ngay_ket_thuc 
                      ? new Date(discount.ngay_bat_dau) <= new Date() && new Date(discount.ngay_ket_thuc) >= new Date()
                      : false;
                    const isExpired = discount.ngay_ket_thuc && new Date(discount.ngay_ket_thuc) < new Date();
                    
                    return (
                      <div key={discount.id || index} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-lg border border-pink-400/30">
                              <span className="text-2xl font-bold text-pink-300">{phanTram}%</span>
                            </div>
                            <div>
                              <h4 className="text-white font-semibold text-lg">Giảm {phanTram}%</h4>
                              <p className="text-sm text-gray-400">
                                {discount.ngay_bat_dau && discount.ngay_ket_thuc
                                  ? `${new Date(discount.ngay_bat_dau).toLocaleDateString('vi-VN')} - ${new Date(discount.ngay_ket_thuc).toLocaleDateString('vi-VN')}`
                                  : 'Chưa có thời gian'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 text-xs rounded font-medium ${
                              isActive ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                              isExpired ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                              'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            }`}>
                              {isActive ? 'Đang áp dụng' :
                               isExpired ? 'Đã hết hạn' : 'Sắp tới'}
                            </span>
                            {discount.id && (
                              <>
                                <button
                                  onClick={() => handleOpenEditDiscount(discount)}
                                  className="p-2 text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors border border-purple-400/30 hover:border-purple-400/50"
                                  title="Chỉnh sửa"
                                  disabled={discountLoading}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteDiscount(discount.id)}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-400/30 hover:border-red-400/50"
                                  title="Xóa"
                                  disabled={discountLoading}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Discount Form Modal */}
              {showDiscountForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-xl max-w-lg w-full">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">
                          {editingDiscount ? 'Chỉnh sửa khuyến mãi' : 'Tạo khuyến mãi mới'}
                        </h3>
                        <button
                          onClick={() => {
                            setShowDiscountForm(false);
                            setEditingDiscount(null);
                          }}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phần trăm giảm giá (%) <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            value={discountFormData.phan_tram}
                            onChange={(e) => setDiscountFormData(prev => ({ ...prev, phan_tram: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                            min="1"
                            max="100"
                            step="0.1"
                            required
                          />
                          <p className="text-xs text-gray-400 mt-1">Nhập từ 1 đến 100</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Ngày bắt đầu <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="date"
                              value={discountFormData.ngay_bat_dau}
                              onChange={(e) => setDiscountFormData(prev => ({ ...prev, ngay_bat_dau: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Ngày kết thúc <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="date"
                              value={discountFormData.ngay_ket_thuc}
                              onChange={(e) => setDiscountFormData(prev => ({ ...prev, ngay_ket_thuc: e.target.value }))}
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                        <button
                          onClick={() => {
                            setShowDiscountForm(false);
                            setEditingDiscount(null);
                          }}
                          className="px-6 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors font-medium"
                          disabled={discountLoading}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveDiscount}
                          disabled={discountLoading}
                          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {discountLoading ? (
                            <>
                              <LoadingSpinner size="sm" />
                              Đang xử lý...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {editingDiscount ? 'Cập nhật' : 'Tạo mới'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons - Update button for each tab */}
          {activeTab === 'basic' && (
          <div className="flex items-center justify-end bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
            <button
              type="button"
              onClick={handleUpdateBasicInfo}
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-400 hover:to-purple-400 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Cập nhật thông tin cơ bản
                </>
              )}
            </button>
          </div>
          )}
        </div>

        {/* Itinerary Form Modal */}
        {showItineraryForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Chỉnh sửa lịch trình
                  </h3>
                  <button
                    onClick={() => {
                      setShowItineraryForm(false);
                      setEditingItinerary(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ngày thứ <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={itineraryFormData.ngay_thu}
                        onChange={(e) => setItineraryFormData(prev => ({ ...prev, ngay_thu: parseInt(e.target.value) || 1 }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tiêu đề <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={itineraryFormData.tieu_de}
                        onChange={(e) => setItineraryFormData(prev => ({ ...prev, tieu_de: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                        placeholder="VD: Khám phá Hội An"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={itineraryFormData.mo_ta}
                      onChange={(e) => setItineraryFormData(prev => ({ ...prev, mo_ta: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                      rows={3}
                      placeholder="Mô tả chi tiết về lịch trình..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Giờ bắt đầu
                      </label>
                      <input
                        type="time"
                        value={itineraryFormData.gio_bat_dau}
                        onChange={(e) => setItineraryFormData(prev => ({ ...prev, gio_bat_dau: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Giờ kết thúc
                      </label>
                      <input
                        type="time"
                        value={itineraryFormData.gio_ket_thuc}
                        onChange={(e) => setItineraryFormData(prev => ({ ...prev, gio_ket_thuc: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Địa điểm
                    </label>
                    <input
                      type="text"
                      value={itineraryFormData.dia_diem}
                      onChange={(e) => setItineraryFormData(prev => ({ ...prev, dia_diem: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                      placeholder="VD: Phố cổ Hội An"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Thông tin lưu trú
                    </label>
                    <textarea
                      value={itineraryFormData.thong_tin_luu_tru}
                      onChange={(e) => setItineraryFormData(prev => ({ ...prev, thong_tin_luu_tru: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white transition-all"
                      rows={2}
                      placeholder="Thông tin về khách sạn/nơi lưu trú..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setShowItineraryForm(false);
                        setEditingItinerary(null);
                      }}
                      className="px-6 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveItinerary}
                      disabled={updatingItineraryId !== null}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updatingItineraryId !== null ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Cập nhật
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Form Modal */}
        {showActivityForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-white/10 shadow-xl max-w-lg w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">
                    Chỉnh sửa hoạt động
                  </h3>
                  <button
                    onClick={() => {
                      setShowActivityForm(false);
                      setEditingActivity(null);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tên hoạt động <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={activityFormData.ten}
                      onChange={(e) => setActivityFormData(prev => ({ ...prev, ten: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all"
                      placeholder="VD: Tham quan chùa Cầu"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Giờ bắt đầu
                      </label>
                      <input
                        type="time"
                        value={activityFormData.gio_bat_dau}
                        onChange={(e) => setActivityFormData(prev => ({ ...prev, gio_bat_dau: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Giờ kết thúc
                      </label>
                      <input
                        type="time"
                        value={activityFormData.gio_ket_thuc}
                        onChange={(e) => setActivityFormData(prev => ({ ...prev, gio_ket_thuc: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mô tả
                    </label>
                    <textarea
                      value={activityFormData.mo_ta}
                      onChange={(e) => setActivityFormData(prev => ({ ...prev, mo_ta: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all"
                      rows={3}
                      placeholder="Mô tả chi tiết về hoạt động..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Thứ tự
                    </label>
                    <input
                      type="number"
                      value={activityFormData.thu_tu}
                      onChange={(e) => setActivityFormData(prev => ({ ...prev, thu_tu: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-white transition-all"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setShowActivityForm(false);
                        setEditingActivity(null);
                      }}
                      className="px-6 py-2 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-colors font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveActivity}
                      disabled={updatingActivityId !== null}
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {updatingActivityId !== null ? (
                        <>
                          <LoadingSpinner size="sm" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Cập nhật
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Note */}
        <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4 mt-6">
          <div className="flex">
            <svg className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-cyan-300">
              <p className="font-medium mb-1">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Chỉ cập nhật thông tin cơ bản. Để quản lý ảnh, lịch trình, điểm đến, vui lòng sử dụng các tính năng chuyên biệt.</li>
                <li>Tour ở trạng thái "Công bố" sẽ hiển thị trên trang chủ cho khách hàng.</li>
                <li>Tour ở trạng thái "Nháp" chỉ bạn mới có thể xem và chỉnh sửa.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thành công"
        message={successModalMessage}
        buttonText="Đóng"
      />
    </DashboardLayout>
  );
};

