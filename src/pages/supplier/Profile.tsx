import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SupplierSidebar } from '../../components/layout/SupplierSidebar';
import { LoadingSpinner } from '../../components/common/Loading';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { supplierService } from '../../services/supplierService';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  ngay_ket_noi: string;
}

interface CompanyProfile {
  ten_cong_ty: string;
  dia_chi: string;
  thanh_pho: string;
  quoc_gia: string;
  website?: string;
  mo_ta: string;
  logo_url?: string;
  trang_thai: string;
  nam_thanh_lap: string;
  ma_so_thue: string;
  so_nhan_vien: string;
  giay_to_kinh_doanh?: string;
  email: string;
  so_dien_thoai: string;
}

export const SupplierProfilePage = () => {
  const { showToast } = useToast();
  const { user, supplier, updateSupplier } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Thông tin người đại diện
  const [userProfile, setUserProfile] = useState<UserProfile>({
    full_name: '',
    email: '',
    phone: '',
    ngay_ket_noi: '',
  });
  
  // Thông tin công ty
  const [profile, setProfile] = useState<CompanyProfile>({
    ten_cong_ty: '',
    dia_chi: '',
    thanh_pho: '',
    quoc_gia: '',
    website: '',
    mo_ta: '',
    logo_url: '',
    trang_thai: '',
    nam_thanh_lap: '',
    ma_so_thue: '',
    so_nhan_vien: '',
    giay_to_kinh_doanh: '',
    email: '',
    so_dien_thoai: '',
  });

  const [editedProfile, setEditedProfile] = useState<CompanyProfile>(profile);

  useEffect(() => {
    loadProfile();
  }, [user?.id]); // Chỉ phụ thuộc vào user.id, không phụ thuộc vào supplier để tránh vòng lặp

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        showToast('Không tìm thấy thông tin người dùng', 'error');
        return;
      }

      // Gọi endpoint getInfoSupplier - trả về thông tin công ty và người đại diện
      console.log('Calling getInfoSupplier');
      const supplierData: any = await supplierService.getInfoSupplier();
      console.log('getInfoSupplier response:', supplierData);
      
      // Map backend response to frontend structure
      const mappedSupplierData = {
        ...supplierData,
        id: typeof supplierData.id === 'string' ? parseInt(supplierData.id) || 0 : supplierData.id,
        logo_url: supplierData.logo || supplierData.logo_url,
        trang_thai: supplierData.trang_thai || 'active',
        nam_thanh_lap: supplierData.nam_thanh_lap?.toString() || supplierData.nam_thanh_lap,
        nguoi_dung_id: supplierData.id?.toString() || user.id,
      };
      
      // Cập nhật supplier trong AuthContext
      updateSupplier(mappedSupplierData);
      
      // 1. Thông tin người đại diện (từ API response)
      const userProfileData: UserProfile = {
        full_name: mappedSupplierData.ho_ten || '',
        email: mappedSupplierData.email || '',
        phone: mappedSupplierData.so_dien_thoai || '',
        ngay_ket_noi: mappedSupplierData.ngay_tao || ''
      };
      setUserProfile(userProfileData);

      // 2. Thông tin công ty (từ API response)
      const profileData: CompanyProfile = {
        ten_cong_ty: mappedSupplierData.ten || '',
        dia_chi: mappedSupplierData.dia_chi || '',
        thanh_pho: mappedSupplierData.thanh_pho || '',
        quoc_gia: mappedSupplierData.quoc_gia || '',
        website: mappedSupplierData.website || '',
        mo_ta: mappedSupplierData.mo_ta || '',
        logo_url: mappedSupplierData.logo_url || '',
        trang_thai: mappedSupplierData.trang_thai || '',
        nam_thanh_lap: mappedSupplierData.nam_thanh_lap || '',
        ma_so_thue: mappedSupplierData.ma_so_thue || '',
        so_nhan_vien: mappedSupplierData.so_nhan_vien || '',
        giay_to_kinh_doanh: mappedSupplierData.giay_to_kinh_doanh || '',
        email: mappedSupplierData.email || '',
        so_dien_thoai: mappedSupplierData.so_dien_thoai || '',
      };
      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('Không thể tải thông tin công ty', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfile(editedProfile);
      setIsEditing(false);
      showToast('Cập nhật thông tin thành công!', 'success');
    } catch (error) {
      showToast('Có lỗi xảy ra khi cập nhật', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<SupplierSidebar />}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <LoadingSpinner size="xl" text="Đang tải thông tin..." />
        </div>
      </DashboardLayout>
    );
  }

  const currentProfile = isEditing ? editedProfile : profile;

  return (
    <DashboardLayout sidebar={<SupplierSidebar />}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hồ Sơ Công Ty</h1>
            <p className="text-indigo-100">Quản lý thông tin doanh nghiệp</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar - Company Overview */}
        <div className="lg:col-span-1 space-y-6">
          {/* Logo Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              {currentProfile.logo_url ? (
                <img src={currentProfile.logo_url} alt="Logo" className="w-full h-full object-cover rounded-full" />
              ) : (
                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{currentProfile.ten_cong_ty || 'Chưa có tên'}</h3>
            <p className="text-sm text-gray-500 mb-4">
              {supplier?.ngay_tao ? `Đối tác từ ${new Date(supplier.ngay_tao).getFullYear()}` : `Năm ${currentProfile.nam_thanh_lap}`}
            </p>
            {isEditing && (
              <button className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium">
                Thay đổi logo
              </button>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
            <h4 className="font-semibold text-white mb-4">Thông tin</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">ID Nhà cung cấp</span>
                <span className="font-semibold text-white text-xs">{supplier?.id || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Người đại diện</span>
                <span className="font-semibold text-white text-sm">{userProfile.full_name || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Ngày tạo</span>
                <span className="font-semibold text-white text-sm">
                  {supplier?.ngay_tao ? new Date(supplier.ngay_tao).toLocaleDateString('vi-VN') : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Trạng thái</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  supplier?.trang_thai === 'hoat_dong' ? 'bg-green-100 text-green-800' :
                  supplier?.trang_thai === 'tam_ngung' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {supplier?.trang_thai === 'hoat_dong' ? 'Hoạt động' :
                   supplier?.trang_thai === 'tam_ngung' ? 'Tạm ngưng' :
                   supplier?.trang_thai || 'Chưa xác định'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Card */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
            <h4 className="font-semibold text-white mb-4">Xác minh</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700">Email đã xác minh</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700">Số điện thoại đã xác minh</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-700">Giấy phép kinh doanh</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Company Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Representative Information */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-400/30 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Thông Tin Người Đại Diện
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Họ và tên</label>
                <p className="text-base font-semibold text-white">{userProfile.full_name || '-'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-base text-white">{userProfile.email || '-'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Số điện thoại</label>
                <p className="text-base text-white">{userProfile.phone || '-'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Ngày kết nối</label>
                <p className="text-base text-gray-900">
                  {userProfile.ngay_ket_noi ? new Date(userProfile.ngay_ket_noi).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isEditing ? (
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Chỉnh sửa
              </button>
            </div>
          ) : (
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          )}

          {/* Company Information */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              Thông Tin Công Ty
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentProfile.ten_cong_ty}
                    onChange={(e) => handleChange('ten_cong_ty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.ten_cong_ty}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã số thuế <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentProfile.ma_so_thue}
                    onChange={(e) => handleChange('ma_so_thue', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.ma_so_thue}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={currentProfile.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={currentProfile.so_dien_thoai}
                    onChange={(e) => handleChange('so_dien_thoai', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.so_dien_thoai}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                {isEditing ? (
                  <input
                    type="url"
                    value={currentProfile.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">
                    {currentProfile.website ? (
                      <a href={currentProfile.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                        {currentProfile.website}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Năm thành lập</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={currentProfile.nam_thanh_lap}
                    onChange={(e) => handleChange('nam_thanh_lap', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.nam_thanh_lap}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentProfile.dia_chi}
                    onChange={(e) => handleChange('dia_chi', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.dia_chi}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành phố <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentProfile.thanh_pho}
                    onChange={(e) => handleChange('thanh_pho', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.thanh_pho}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quốc gia <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentProfile.quoc_gia}
                    onChange={(e) => handleChange('quoc_gia', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.quoc_gia}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số nhân viên</label>
                {isEditing ? (
                  <select
                    value={currentProfile.so_nhan_vien}
                    onChange={(e) => handleChange('so_nhan_vien', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="50-100">50-100</option>
                    <option value="100+">100+</option>
                  </select>
                ) : (
                  <p className="text-base text-gray-900 py-2">{currentProfile.so_nhan_vien}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả công ty</label>
                {isEditing ? (
                  <textarea
                    value={currentProfile.mo_ta}
                    onChange={(e) => handleChange('mo_ta', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={4}
                    placeholder="Giới thiệu về công ty của bạn..."
                  />
                ) : (
                  <p className="text-base text-gray-700 py-2">{currentProfile.mo_ta}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Documents */}
          <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
              Giấy Tờ Kinh Doanh
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600 mb-1">Tải lên giấy phép kinh doanh</p>
                <p className="text-xs text-gray-500">PDF, JPG, PNG (Tối đa 10MB)</p>
              </div>

              {currentProfile.giay_to_kinh_doanh && (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Giấy phép kinh doanh</p>
                      <p className="text-sm text-gray-500">Đã xác minh</p>
                    </div>
                  </div>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Xem
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

