import { useState } from 'react';
import type { FormEvent } from 'react';
import { supplierService } from '../../services/supplierService';
import type { CreateSupplierRequest } from '../../types';
import { LoadingSpinner } from '../common/Loading';
import { useToast } from '../../hooks/useToast';

interface CreateSupplierFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateSupplierForm = ({ onSuccess, onCancel }: CreateSupplierFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSupplierRequest>({
    thong_tin_dang_nhap: {
      nguoi_dai_dien: '',
      email: '',
      mat_khau: '',
      so_dien_thoai: '',
    },
    thong_tin_nha_cung_cap: {
      ten: '',
      dia_chi: '',
      website: '',
      mo_ta: '',
      logo_url: '',
    },
  });

  const { showToast } = useToast();

  const handleInputChange = (section: keyof CreateSupplierRequest, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Helper function to format URL
  const formatUrl = (url: string): string => {
    if (!url.trim()) return url;
    
    // If URL doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//i)) {
      return `https://${url}`;
    }
    
    return url;
  };

  const validateForm = (): boolean => {
    const { thong_tin_dang_nhap, thong_tin_nha_cung_cap } = formData;

    if (!thong_tin_dang_nhap.nguoi_dai_dien.trim()) {
      showToast('Vui lòng nhập tên người đại diện', 'error');
      return false;
    }

    if (!thong_tin_dang_nhap.email.trim()) {
      showToast('Vui lòng nhập email', 'error');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(thong_tin_dang_nhap.email)) {
      showToast('Email không hợp lệ', 'error');
      return false;
    }

    if (!thong_tin_dang_nhap.mat_khau.trim()) {
      showToast('Vui lòng nhập mật khẩu', 'error');
      return false;
    }

    if (thong_tin_dang_nhap.mat_khau.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', 'error');
      return false;
    }

    if (!thong_tin_nha_cung_cap.ten.trim()) {
      showToast('Vui lòng nhập tên nhà cung cấp', 'error');
      return false;
    }

    // Validate website URL (optional but if provided should be valid)
    if (thong_tin_nha_cung_cap.website && thong_tin_nha_cung_cap.website.trim()) {
      const website = thong_tin_nha_cung_cap.website.trim();
      const urlPattern = /^(https?:\/\/)?([\w\-\.]+)\.([a-z]{2,})([\/\w\-\.]*)*\/?$/i;
      if (!urlPattern.test(website)) {
        showToast('URL website không hợp lệ. Ví dụ: example.com hoặc https://example.com', 'error');
        return false;
      }
    }

    // Validate logo URL (optional but if provided should be valid)
    if (thong_tin_nha_cung_cap.logo_url && thong_tin_nha_cung_cap.logo_url.trim()) {
      const logoUrl = thong_tin_nha_cung_cap.logo_url.trim();
      const urlPattern = /^(https?:\/\/)?([\w\-\.]+)\.([a-z]{2,})([\/\w\-\.]*)*\/?$/i;
      if (!urlPattern.test(logoUrl)) {
        showToast('URL logo không hợp lệ. Ví dụ: https://example.com/logo.png', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Format URLs before sending
      const formattedData = {
        ...formData,
        thong_tin_nha_cung_cap: {
          ...formData.thong_tin_nha_cung_cap,
          website: formData.thong_tin_nha_cung_cap.website ? formatUrl(formData.thong_tin_nha_cung_cap.website) : undefined,
          logo_url: formData.thong_tin_nha_cung_cap.logo_url ? formatUrl(formData.thong_tin_nha_cung_cap.logo_url) : undefined,
        },
      };

      await supplierService.createSupplier(formattedData);
      showToast('Tạo nhà cung cấp thành công!', 'success');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating supplier:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo nhà cung cấp';
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      thong_tin_dang_nhap: {
        nguoi_dai_dien: '',
        email: '',
        mat_khau: '',
        so_dien_thoai: '',
      },
      thong_tin_nha_cung_cap: {
        ten: '',
        dia_chi: '',
        website: '',
        mo_ta: '',
        logo_url: '',
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Tạo Nhà Cung Cấp Mới</h1>
                <p className="text-blue-100">Điền thông tin để tạo tài khoản nhà cung cấp</p>
              </div>
              <div className="bg-white/20 rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Thông tin đăng nhập */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                Thông Tin Đăng Nhập
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="nguoi_dai_dien" className="block text-sm font-medium text-gray-700">
                    Tên Người Đại Diện <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nguoi_dai_dien"
                    type="text"
                    value={formData.thong_tin_dang_nhap.nguoi_dai_dien}
                    onChange={(e) => handleInputChange('thong_tin_dang_nhap', 'nguoi_dai_dien', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Nhập tên người đại diện"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.thong_tin_dang_nhap.email}
                    onChange={(e) => handleInputChange('thong_tin_dang_nhap', 'email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="example@company.com"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="mat_khau" className="block text-sm font-medium text-gray-700">
                    Mật Khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="mat_khau"
                    type="password"
                    value={formData.thong_tin_dang_nhap.mat_khau}
                    onChange={(e) => handleInputChange('thong_tin_dang_nhap', 'mat_khau', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="so_dien_thoai" className="block text-sm font-medium text-gray-700">
                    Số Điện Thoại
                  </label>
                  <input
                    id="so_dien_thoai"
                    type="tel"
                    value={formData.thong_tin_dang_nhap.so_dien_thoai || ''}
                    onChange={(e) => handleInputChange('thong_tin_dang_nhap', 'so_dien_thoai', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="0123456789"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

          {/* Thông tin nhà cung cấp */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <div className="bg-indigo-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              Thông Tin Nhà Cung Cấp
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="ten" className="block text-sm font-medium text-gray-700">
                  Tên Nhà Cung Cấp <span className="text-red-500">*</span>
                </label>
                <input
                  id="ten"
                  type="text"
                  value={formData.thong_tin_nha_cung_cap.ten}
                  onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'ten', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  placeholder="Tên công ty/nhà cung cấp"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dia_chi" className="block text-sm font-medium text-gray-700">
                  Địa Chỉ
                </label>
                <input
                  id="dia_chi"
                  type="text"
                  value={formData.thong_tin_nha_cung_cap.dia_chi || ''}
                  onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'dia_chi', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                  placeholder="Địa chỉ trụ sở chính"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <input
                    id="website"
                    type="text"
                    value={formData.thong_tin_nha_cung_cap.website || ''}
                    onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'website', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="example.com"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">Có thể nhập với hoặc không có https://</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">
                  Logo URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="logo_url"
                    type="text"
                    value={formData.thong_tin_nha_cung_cap.logo_url || ''}
                    onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'logo_url', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="https://example.com/logo.png"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">URL hình ảnh logo của công ty</p>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="mo_ta" className="block text-sm font-medium text-gray-700 mb-2">
                Mô Tả
              </label>
              <textarea
                id="mo_ta"
                value={formData.thong_tin_nha_cung_cap.mo_ta || ''}
                onChange={(e) => handleInputChange('thong_tin_nha_cung_cap', 'mo_ta', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200 bg-white"
                placeholder="Mô tả về nhà cung cấp, dịch vụ, kinh nghiệm..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8">
            <button
              type="button"
              onClick={handleReset}
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 font-medium"
              disabled={isLoading}
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Làm Mới
              </div>
            </button>
            
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-3 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 font-medium"
                disabled={isLoading}
              >
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Hủy
                </div>
              </button>
            )}
            
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              disabled={isLoading}
            >
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Đang tạo...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tạo Nhà Cung Cấp
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
