import { useState, useRef } from 'react';
import { reviewService } from '../../services/reviewService';
import type { CreateReviewRequest } from '../../services/reviewService';
import { imageUploadService } from '../../services/imageUploadService';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../common/Loading';

interface ReviewFormProps {
  datChoId: number;
  tourTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ReviewForm = ({ datChoId, tourTitle, onSuccess, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]); // URLs đã upload thành công
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // Preview URLs từ FileReader
  const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({}); // Track upload status per file
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      showToast('Vui lòng chọn file ảnh hợp lệ', 'error');
      return;
    }

    // Giới hạn số lượng ảnh
    const maxImages = 10;
    const currentTotal = imageFiles.length + imageUrls.length;
    
    if (currentTotal > maxImages) {
      showToast(`Chỉ có thể upload tối đa ${maxImages} ảnh. Bạn đã có ${imageUrls.length} ảnh.`, 'error');
      return;
    }

    // Kiểm tra kích thước file (max 5MB mỗi file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = imageFiles.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      showToast('Một số file vượt quá 5MB. Vui lòng chọn file nhỏ hơn.', 'error');
      return;
    }

    // Thêm files vào state và lưu index bắt đầu
    const currentFileCount = imageFiles.length;
    const newFiles = imageFiles.slice(0, maxImages - imageUrls.length);
    
    // Tạo preview URLs ngay lập tức
    const newPreviewUrls: string[] = [];
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const target = e.target;
        if (target && target.result) {
          newPreviewUrls.push(target.result as string);
          setPreviewUrls(prev => [...prev, target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Thêm files vào state
    setImageFiles(prev => [...prev, ...newFiles]);

    // Tự động upload ngay khi chọn file (sử dụng currentFileCount làm startIndex)
    await uploadFilesImmediately(newFiles, currentFileCount);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload files ngay lập tức
  const uploadFilesImmediately = async (files: File[], startIndex: number) => {
    for (let i = 0; i < files.length; i++) {
      const fileIndex = startIndex + i;
      setUploadingImages(prev => ({ ...prev, [fileIndex]: true }));
      
      try {
        const urls = await imageUploadService.uploadReviewImages([files[i]]);
        if (urls.length > 0) {
          setImageUrls(prev => [...prev, urls[0]]);
          // Xóa file đã upload thành công khỏi imageFiles
          setImageFiles(prev => prev.filter((_, idx) => idx !== fileIndex));
          // Xóa preview tương ứng
          setPreviewUrls(prev => prev.filter((_, idx) => idx !== fileIndex));
        }
      } catch (error: any) {
        console.error(`Error uploading file ${i + 1}:`, error);
        showToast(`Lỗi khi upload ảnh ${files[i].name}`, 'error');
      } finally {
        setUploadingImages(prev => {
          const newState = { ...prev };
          delete newState[fileIndex];
          return newState;
        });
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    // Xóa từ URLs đã upload
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemovePreview = (index: number) => {
    // Xóa file chưa upload và preview
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadingImages(prev => {
      const newState = { ...prev };
      delete newState[index];
      return newState;
    });
  };

  // Upload thủ công các file còn lại (nếu có)
  const handleUploadRemainingImages = async () => {
    if (imageFiles.length === 0) {
      showToast('Không có ảnh nào cần upload', 'info');
      return;
    }

    await uploadFilesImmediately(imageFiles, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || rating < 1 || rating > 5) {
      showToast('Vui lòng chọn điểm đánh giá từ 1 đến 5 sao', 'error');
      return;
    }

    if (!content.trim()) {
      showToast('Vui lòng nhập nội dung đánh giá', 'error');
      return;
    }

    // Nếu có file chưa upload, upload trước khi submit
    let finalImageUrls = [...imageUrls];
    if (imageFiles.length > 0) {
      setIsSubmitting(true);
      try {
        const urls = await imageUploadService.uploadReviewImages(imageFiles);
        finalImageUrls = [...imageUrls, ...urls];
        setImageUrls(finalImageUrls);
        setImageFiles([]);
        setPreviewUrls([]);
      } catch (error: any) {
        showToast('Lỗi khi upload ảnh. Vui lòng thử lại.', 'error');
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const reviewData: CreateReviewRequest = {
        dat_cho_id: datChoId,
        diem_danh_gia: rating,
        tieu_de: title.trim() || undefined,
        noi_dung: content.trim(),
        hinh_anh_dinh_kem: finalImageUrls.length > 0 ? finalImageUrls : undefined,
      };

      await reviewService.createReview(reviewData);
      showToast('Đánh giá của bạn đã được gửi thành công!', 'success');
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi gửi đánh giá';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg shadow-amber-500/30">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Đánh Giá Tour
          </h2>
          <p className="text-slate-400 text-lg">{tourTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <label className="block text-sm font-semibold text-white mb-4">
              Điểm đánh giá <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`transition-all transform hover:scale-125 active:scale-95 ${
                    star <= rating
                      ? 'text-yellow-400 scale-110'
                      : 'text-slate-600 hover:text-yellow-300'
                  }`}
                >
                  <svg
                    className="w-12 h-12 drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-6 text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {rating} / 5 sao
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <label htmlFor="title" className="block text-sm font-semibold text-white mb-3">
              Tiêu đề đánh giá <span className="text-slate-500 text-xs">(tùy chọn)</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Tour tuyệt vời, trải nghiệm đáng nhớ!"
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
              maxLength={255}
            />
          </div>

          {/* Content */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <label htmlFor="content" className="block text-sm font-semibold text-white mb-3">
              Nội dung đánh giá <span className="text-red-400">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về tour này... Bạn thích điều gì nhất? Có điều gì cần cải thiện không?"
              rows={6}
              className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 resize-none transition-all"
              required
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-500">
                {content.length} / 2000 ký tự
              </p>
              {content.length > 0 && (
                <p className="text-xs text-amber-400">
                  {content.length < 50 ? 'Hãy chia sẻ thêm để đánh giá có giá trị hơn!' : '✓'}
                </p>
              )}
            </div>
          </div>

          {/* Images Upload */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <label className="block text-sm font-semibold text-white mb-3">
              Hình ảnh đính kèm <span className="text-slate-500 text-xs">(tùy chọn, tối đa 10 ảnh)</span>
            </label>
            
            {/* File Input */}
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={imageUrls.length >= 10 || Object.keys(uploadingImages).length > 0}
              />
              <label
                htmlFor="image-upload"
                className={`flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-2 border-dashed border-cyan-500/30 rounded-xl cursor-pointer hover:border-cyan-500/50 hover:bg-cyan-500/30 transition-all ${
                  imageUrls.length >= 10 || Object.keys(uploadingImages).length > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-cyan-400 font-semibold">
                  {imageUrls.length >= 10 ? 'Đã đạt giới hạn 10 ảnh' : 'Chọn ảnh từ máy tính (tự động upload)'}
                </span>
              </label>
              <p className="text-xs text-slate-500 mt-2 text-center">
                Hỗ trợ: JPG, PNG, GIF (tối đa 5MB/ảnh)
              </p>
            </div>

            {/* Upload Button (nếu có file chưa upload) */}
            {imageFiles.length > 0 && Object.keys(uploadingImages).length === 0 && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleUploadRemainingImages}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload {imageFiles.length} ảnh còn lại</span>
                </button>
              </div>
            )}

            {/* Image Preview Grid */}
            {(imageUrls.length > 0 || previewUrls.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {/* Preview từ files đang upload */}
                {previewUrls.map((previewUrl, index) => (
                  <div key={`preview-${index}`} className="relative group aspect-square">
                    <img
                      src={previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border-2 border-dashed border-cyan-500/50 opacity-60"
                    />
                    <div className="absolute inset-0 bg-slate-900/70 rounded-xl flex items-center justify-center">
                      {uploadingImages[index] ? (
                        <div className="text-center">
                          <LoadingSpinner size="sm" />
                          <p className="text-xs text-slate-300 mt-2">Đang upload...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <svg className="w-8 h-8 text-cyan-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs text-slate-300">Chờ upload</p>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePreview(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {/* Preview từ URLs đã upload thành công */}
                {imageUrls.map((url, index) => (
                  <div key={`url-${index}`} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Review ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border-2 border-emerald-500/50 group-hover:border-emerald-500 transition-all"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error';
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500/90 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Đã upload
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-500 z-10"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {imageUrls.length === 0 && previewUrls.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Chưa có ảnh nào được thêm</p>
                <p className="text-xs text-slate-600 mt-1">Ảnh sẽ tự động upload khi bạn chọn</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || Object.keys(uploadingImages).length > 0}
              className="flex-1 relative px-8 py-4 overflow-hidden rounded-xl font-bold text-white transition-all duration-500 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 rounded-xl" />
              <span className="absolute inset-[2px] bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Gửi đánh giá</span>
                  </>
                )}
              </span>
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-4 bg-slate-800/50 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 hover:text-white transition-all border border-white/10"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
