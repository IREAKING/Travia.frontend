import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';

export const PaymentSuccessPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookingData = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('booking_id') || id;
        if (bookingId) {
          const booking = localStorage.getItem(`booking_${bookingId}`);
          if (booking) setBookingData(JSON.parse(booking));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadBookingData();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-[#030712] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Đang tải thông tin...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#030712] relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Confetti Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div key={i} className="absolute w-3 h-3 rounded-full animate-[fall_4s_linear_infinite]" style={{ left: `${Math.random() * 100}%`, top: '-20px', backgroundColor: ['#10b981', '#06b6d4', '#fbbf24', '#ec4899', '#8b5cf6'][i % 5], animationDelay: `${Math.random() * 4}s`, opacity: 0.7 }} />
          ))}
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mb-8 shadow-2xl shadow-emerald-500/30 animate-bounce">
                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="text-white">Thanh toán </span>
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Thành công!</span>
              </h1>
              <p className="text-xl text-slate-400 mb-8">Cảm ơn bạn đã đặt tour. Email xác nhận đang được gửi đến bạn.</p>
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                <span className="text-2xl">📧</span>
                <span className="text-emerald-300">Email xác nhận: {bookingData?.email || 'your@email.com'}</span>
              </div>
            </div>

            {/* Booking Details */}
            <div className="relative group mb-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-30 blur-xl" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-8">Chi tiết đặt tour</h2>
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-4">Thông tin tour</h3>
                    {bookingData?.tour ? (
                      <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl">
                        <img src={bookingData.tour.anh || '/placeholder.jpg'} alt={bookingData.tour.tieu_de} className="w-20 h-20 object-cover rounded-xl" />
                        <div>
                          <h4 className="font-bold text-white">{bookingData.tour.tieu_de}</h4>
                          <p className="text-slate-400 text-sm">{bookingData.tour.so_ngay}N{bookingData.tour.so_dem}Đ</p>
                          <p className="text-emerald-400 font-bold mt-1">{bookingData.tour.gia_nguoi_lon?.toLocaleString('vi-VN')} VND</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white/5 rounded-xl text-slate-400">Đang tải...</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-4">Thông tin đặt</h3>
                    <div className="space-y-3 p-4 bg-white/5 rounded-xl">
                      <div className="flex justify-between"><span className="text-slate-400">Mã đặt tour:</span><span className="text-white font-bold">#{bookingData?.id || 'TRV-001'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Ngày khởi hành:</span><span className="text-white">{bookingData?.ngay_khoi_hanh ? new Date(bookingData.ngay_khoi_hanh).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Số khách:</span><span className="text-white">{bookingData?.so_nguoi_lon || 0} người lớn{bookingData?.so_tre_em > 0 && `, ${bookingData.so_tre_em} trẻ em`}</span></div>
                      <div className="flex justify-between items-center border-t border-white/10 pt-3 mt-3">
                        <span className="text-slate-400">Tổng tiền:</span>
                        <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{bookingData?.tong_tien?.toLocaleString('vi-VN') || '0'} VND</span>
                      </div>
                      <div className="flex justify-between"><span className="text-slate-400">Trạng thái:</span><span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-bold">✅ Đã thanh toán</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 mb-8">
              <h2 className="text-2xl font-bold text-white mb-8 text-center">Bước tiếp theo</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: '📧', title: 'Kiểm tra Email', desc: 'Email xác nhận với chi tiết đầy đủ', gradient: 'from-blue-500 to-indigo-600' },
                  { icon: '🎫', title: 'Tải vé điện tử', desc: 'Vé điện tử để check-in', gradient: 'from-emerald-500 to-teal-600' },
                  { icon: '🧳', title: 'Chuẩn bị hành trình', desc: 'Hành lý và tài liệu cần thiết', gradient: 'from-purple-500 to-pink-600' },
                ].map((step, i) => (
                  <div key={i} className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all">
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg`}>{step.icon}</div>
                    <h3 className="font-bold text-white mb-2">{i + 1}. {step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => console.log('Tải vé')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Tải vé điện tử
              </button>
              <button onClick={() => navigate('/my-bookings')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-all hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Xem đơn đặt
              </button>
              <button onClick={() => navigate('/tours')} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-all hover:scale-105">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Đặt tour khác
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </MainLayout>
  );
};
