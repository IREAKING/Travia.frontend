import { api } from './api';

/**
 * Service để tải vé điện tử (PDF)
 */
export const ticketService = {
  /**
   * Tải vé điện tử dưới dạng PDF
   * GET /ticket/:dat_cho_id
   * 
   * @param datChoId - ID đặt chỗ (booking ID)
   * @returns Promise<void> - File sẽ được download tự động
   */
  downloadTicket: async (datChoId: number): Promise<void> => {
    try {
      const response = await api.get(`/ticket/${datChoId}`, {
        responseType: 'blob', // Quan trọng: phải set responseType là 'blob' để nhận file
        headers: {
          'Accept': 'application/pdf',
        },
      });

      // Tạo blob từ response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Tạo URL từ blob
      const url = window.URL.createObjectURL(blob);
      
      // Tạo link để download
      const link = document.createElement('a');
      link.href = url;
      
      // Lấy filename từ Content-Disposition header hoặc dùng tên mặc định
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Ticket-${datChoId}.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
          // Decode URI nếu cần
          try {
            filename = decodeURIComponent(filename);
          } catch (e) {
            // Nếu không decode được, dùng giá trị gốc
          }
        }
      }
      
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading ticket:', error);
      
      // Nếu lỗi có response data, thử parse JSON error message
      if (error.response?.data) {
        try {
          const text = await error.response.data.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || errorData.message || 'Không thể tải vé');
        } catch (parseError) {
          // Nếu không parse được, throw error gốc
          throw new Error(error.response?.status === 404 
            ? 'Không tìm thấy vé cho đặt chỗ này' 
            : 'Không thể tải vé');
        }
      }
      
      throw error;
    }
  },
};

