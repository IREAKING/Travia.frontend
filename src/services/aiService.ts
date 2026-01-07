import { api } from './api';

export interface ChatbotRequest {
  message: string;
  session_id?: string;
  include_tours?: boolean;
}

export interface ChatbotResponse {
  message: string;
  session_id: string;
  data: {
    response: string;
  };
}

export interface ChatHistory {
  id: number;
  nguoi_dung_id?: string;
  ma_phien: string;
  cau_hoi: string;
  cau_tra_loi: string;
  ngay_tao: string;
}

export const aiService = {
  // Chat với AI chatbot
  chatbot: async (request: ChatbotRequest): Promise<ChatbotResponse> => {
    try {
      const response = await api.post<ChatbotResponse>('/ai/chatbot', {
        message: request.message,
        session_id: request.session_id,
        include_tours: request.include_tours ?? false,
      });
      
      // Backend trả về trực tiếp ChatbotResponse format
      return response.data;
    } catch (error: any) {
      console.error('Error chatting with AI:', error);
      throw error;
    }
  },
};

