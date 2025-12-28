import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';

export const PaymentFailurePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [errorData, setErrorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadErrorData = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        setErrorData({
          errorCode: urlParams.get('error_code') || 'PAYMENT_FAILED',
          errorMessage: urlParams.get('error_message') || 'Thanh toán không thành công',
          bookingId: urlParams.get('booking_id') || id
        });
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadErrorData();
  }, [id]);

    const errorMessages: { [key: string]: string } = {
    'CARD_DECLINED': 'Thẻ bị từ chối. Vui lòng kiểm tra lại thông tin hoặc liên hệ ngân hàng.',
    'INSUFFICIENT_FUNDS': 'Tài khoản không đủ số dư.',
    'EXPIRED_CARD': 'Thẻ đã hết hạn.',
    'INVALID_CARD': 'Thông tin thẻ không hợp lệ.',
    'NETWORK_ERROR': 'Lỗi kết nối mạng.',
    'TIMEOUT': 'Thanh toán quá thời gian chờ.',
    'PAYMENT_FAILED': 'Thanh toán không thành công.',
      'CANCELLED': 'Bạn đã hủy thanh toán.',
    'UNKNOWN_ERROR': 'Đã xảy ra lỗi không xác định.'
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Đang tải thông tin...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#030712] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-500/20 rounded-full blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[150px]" />
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Failure Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl mb-8 shadow-2xl shadow-red-500/30">
                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="text-white">Thanh Toán </span>
                <span className="bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">Thất Bại</span>
              </h1>
              <p className="text-xl text-slate-400 mb-8">Rất tiếc, thanh toán không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
              <div className="inline-block p-6 bg-red-500/10 border border-red-500/30 rounded-2xl max-w-2xl">
                <p className="text-red-400 font-bold mb-2">❌ Mã lỗi: {errorData?.errorCode}</p>
                <p className="text-red-300">{errorMessages[errorData?.errorCode] || errorMessages['UNKNOWN_ERROR']}</p>
              </div>
            </div>

            {/* Error Details */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-8">Chi Tiết & Giải Pháp</h2>
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Thông Tin Lỗi</h3>
                  <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                    <div className="flex justify-between"><span className="text-slate-400">Mã lỗi:</span><span className="text-red-400 font-bold">{errorData?.errorCode}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Thời gian:</span><span className="text-white">{new Date().toLocaleString('vi-VN')}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Mã đặt tour:</span><span className="text-white">#{errorData?.bookingId || 'N/A'}</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Giải Pháp Khuyến Nghị</h3>
                  <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                    {[
                      'Kiểm tra lại thông tin thẻ/tài khoản',
                      'Thử phương thức thanh toán khác',
                      'Kiểm tra kết nối internet',
                      'Liên hệ ngân hàng nếu thẻ bị từ chối',
                      'Liên hệ hỗ trợ khách hàng 24/7'
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-cyan-400">✓</span>
                        <span className="text-slate-400">{item}</span>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Hỗ Trợ Khách Hàng</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: '📞', title: 'Hotline 24/7', info: '1900 1234', gradient: 'from-emerald-500 to-teal-600' },
                  { icon: '✉️', title: 'Email', info: 'support@travia.com', gradient: 'from-blue-500 to-indigo-600' },
                  { icon: '💬', title: 'Live Chat', info: 'Trên website', gradient: 'from-purple-500 to-pink-600' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg`}>{item.icon}</div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm">{item.info}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => errorData?.bookingId ? navigate(`/payment/${errorData.bookingId}`) : navigate('/tours')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Thử Lại Thanh Toán
                </button>
              <button onClick={() => navigate('/contact')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-all hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Liên Hệ Hỗ Trợ
                </button>
              <button onClick={() => navigate('/tours')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-all hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Quay Lại Tours
                </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
