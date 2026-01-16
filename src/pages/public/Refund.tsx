import { MainLayout } from '../../components/layout/MainLayout';

export const RefundPage = () => {
  const refundTable = [
    { time: 'Trước 15 ngày', rate: '100%', fee: 'Miễn phí', color: 'text-emerald-400' },
    { time: 'Trước 7 ngày', rate: '90%', fee: '10%', color: 'text-emerald-400' },
    { time: 'Trước 3 ngày', rate: '70%', fee: '30%', color: 'text-amber-400' },
    { time: 'Trước 24 giờ', rate: '50%', fee: '50%', color: 'text-orange-400' },
    { time: 'Trong 24 giờ', rate: '0%', fee: '100%', color: 'text-red-400' },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative py-20 bg-[#030712] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-teal-500/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-sm font-semibold rounded-full border border-emerald-500/30 mb-6">
            💰 Hoàn Tiền
          </span>
          <h1 className="text-5xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Chính Sách </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Hoàn Tiền</span>
          </h1>
          <p className="text-slate-400 text-lg">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </section>

      <section className="py-16 bg-[#0a0f1a]">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Overview */}
          <div className="relative group mb-8">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-30 blur-xl" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
                  ✅
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Tổng quan</h2>
                  <p className="text-slate-400">Travia cam kết đảm bảo quyền lợi khách hàng với chính sách hoàn tiền minh bạch và công bằng.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Refund Table */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                  1
                </span>
                Tỷ Lệ Hoàn Tiền
              </h2>
              <div className="overflow-x-auto ml-14">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 text-slate-400 font-medium">Thời gian hủy</th>
                      <th className="text-center py-4 text-slate-400 font-medium">Tỷ lệ hoàn</th>
                      <th className="text-right py-4 text-slate-400 font-medium">Phí hủy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refundTable.map((row, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-4 text-white">{row.time}</td>
                        <td className={`py-4 text-center font-bold ${row.color}`}>{row.rate}</td>
                        <td className="py-4 text-right text-slate-400">{row.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Special Cases */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                  2
                </span>
                Trường Hợp Đặc Biệt
              </h2>
              <div className="space-y-4 ml-14">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <h3 className="text-emerald-400 font-bold mb-2">✅ Hoàn 100% (không phí):</h3>
                  <ul className="list-disc pl-5 text-slate-400 space-y-1">
                    <li>Thiên tai, dịch bệnh</li>
                    <li>Lỗi của Travia</li>
                    <li>Thay đổi lịch trình không báo trước</li>
                    <li>Lý do sức khỏe có giấy bác sĩ</li>
                  </ul>
                </div>
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <h3 className="text-amber-400 font-bold mb-2">⚠️ Hoàn 50%:</h3>
                  <ul className="list-disc pl-5 text-slate-400 space-y-1">
                    <li>Thay đổi ngày tour (nếu còn chỗ)</li>
                    <li>Giảm số lượng khách (trước 7 ngày)</li>
                  </ul>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <h3 className="text-red-400 font-bold mb-2">❌ Không hoàn:</h3>
                  <ul className="list-disc pl-5 text-slate-400 space-y-1">
                    <li>Hủy trong ngày khởi hành</li>
                    <li>Không có mặt tại điểm tập trung</li>
                    <li>Vi phạm quy định tour</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Process */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                  3
                </span>
                Quy Trình Hoàn Tiền
              </h2>
              <div className="grid md:grid-cols-4 gap-4 ml-14">
                {[
                  { step: '1', title: 'Yêu cầu', desc: 'Gọi hotline hoặc email' },
                  { step: '2', title: 'Xác nhận', desc: 'Kiểm tra điều kiện' },
                  { step: '3', title: 'Xử lý', desc: 'Tính toán số tiền' },
                  { step: '4', title: 'Hoàn tiền', desc: '3-7 ngày làm việc' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-white font-bold shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="text-white font-bold mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                <span className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/30">
                  4
                </span>
                Phương Thức Hoàn Tiền
              </h2>
              <div className="grid md:grid-cols-3 gap-4 ml-14">
                {[
                  { icon: '🏦', title: 'Chuyển khoản', desc: 'Về tài khoản ngân hàng', gradient: 'from-blue-500 to-indigo-600' },
                  { icon: '📱', title: 'Ví điện tử', desc: 'MoMo, ZaloPay, VNPay', gradient: 'from-emerald-500 to-teal-600' },
                  { icon: '🏢', title: 'Tại văn phòng', desc: 'Tiền mặt hoặc CK', gradient: 'from-purple-500 to-pink-600' },
                ].map((method, i) => (
                  <div key={i} className="text-center p-5 bg-white/5 rounded-xl border border-white/10">
                    <div className={`w-12 h-12 bg-gradient-to-br ${method.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 text-xl shadow-lg`}>
                      {method.icon}
                    </div>
                    <h3 className="text-white font-bold mb-1">{method.title}</h3>
                    <p className="text-slate-500 text-sm">{method.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-12 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl opacity-50 blur-xl" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 border border-white/10 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Cần Hỗ Trợ Hoàn Tiền?</h3>
              <p className="text-slate-400 mb-8">Đội ngũ hỗ trợ 24/7 sẵn sàng giúp đỡ bạn</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:1900-xxxx" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Hotline: 1900-xxxx
                </a>
                <a href="mailto:refund@travia.vn" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-all hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  refund@travia.vn
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
