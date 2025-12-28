import { api } from './api';

export interface UploadedImage {
  link: string;
  mo_ta_alt: string;
  la_anh_chinh: boolean;
  thu_tu_hien_thi: number;
}

export interface UploadImagesResponse {
  successful_uploads: number;
  total_files: number;
  images: UploadedImage[];
  message: string;
  errors?: string[];
}

export const imageUploadService = {
  // Upload multiple images for tour creation
  uploadTourImages: async (files: File[]): Promise<UploadImagesResponse> => {
    if (!files || files.length === 0) {
      throw new Error('Không có file nào để upload');
    }

    try {
      const formData = new FormData();
      
      // Add all files to form data with validation
      let validFileCount = 0;
      files.forEach((file, index) => {
        if (file instanceof File) {
          formData.append('files', file);
          validFileCount++;
        } else {
          console.warn(`File at index ${index} is not a valid File object`);
        }
      });

      if (validFileCount === 0) {
        throw new Error('Không có file hợp lệ để upload');
      }

      console.log(`📤 Uploading ${validFileCount} file(s) to server...`);

      const response = await api.post(
        '/storage/upload-tour-images',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // Add timeout for large uploads (30 seconds)
          timeout: 30000,
        }
      );

      // Backend returns data directly, not wrapped in ApiResponse
      const result = response.data as UploadImagesResponse;
      
      console.log(`✅ Upload completed: ${result.successful_uploads}/${result.total_files} successful`);
      
      return result;
    } catch (error: any) {
      console.error('❌ Error uploading images:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error('Request error (no response):', error.request);
      } else {
        console.error('Error:', error.message);
      }
      
      // Re-throw with more context
      if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timeout. Vui lòng thử lại với ít file hơn hoặc file nhỏ hơn.');
      }
      
      throw error;
    }
  },

  // Create tour with uploaded images (deprecated - use supplierTourService.createTour instead)
  createTour: async (tourData: any): Promise<any> => {
    try {
      console.log('⚠️  Warning: imageUploadService.createTour is deprecated. Use supplierTourService.createTour instead.');
      const response = await api.post('/tour/', tourData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating tour:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },
};
