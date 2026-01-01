// Format currency
export const formatCurrency = (amount: number, currency = 'VND'): string => {
  if (currency === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string, locale = 'vi-VN'): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Format date short
export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

// Format relative time
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return formatDateShort(dateString);
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Get status badge color
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Trạng thái đặt chỗ (trang_thai_dat_cho)
    'cho_xac_nhan': 'yellow',
    'da_xac_nhan': 'blue',
    'da_thanh_toan': 'green',
    'da_huy': 'red',
    'hoan_thanh': 'green',
    // Trạng thái khởi hành (trang_thai_khoi_hanh)
    'len_lich': 'blue',
    'xac_nhan': 'green',
    'huy': 'red',
    'het_cho': 'gray',
    'con_cho': 'green',
    // Legacy/backward compatibility
    'cho_thanh_toan': 'yellow',
    'hoan_tien': 'orange',
    'hoat_dong': 'green',
    'tam_ngung': 'red',
    // Frontend display values
    'pending': 'yellow',
    'confirmed': 'blue',
    'completed': 'green',
    'cancelled': 'red',
  };
  return statusMap[status] || 'gray';
};

// Get status text
export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Trạng thái đặt chỗ (trang_thai_dat_cho)
    'cho_xac_nhan': 'Chờ xác nhận',
    'da_xac_nhan': 'Đã xác nhận',
    'da_thanh_toan': 'Đã thanh toán',
    'da_huy': 'Đã hủy',
    'hoan_thanh': 'Hoàn thành',
    // Trạng thái khởi hành (trang_thai_khoi_hanh)
    'len_lich': 'Lên lịch',
    'xac_nhan': 'Xác nhận',
    'huy': 'Hủy',
    'het_cho': 'Hết chỗ',
    'con_cho': 'Còn chỗ',
    // Legacy/backward compatibility
    'cho_thanh_toan': 'Chờ thanh toán',
    'hoan_tien': 'Hoàn tiền',
    'hoat_dong': 'Hoạt động',
    'tam_ngung': 'Tạm ngưng',
    // Frontend display values
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
  };
  return statusMap[status] || status;
};

