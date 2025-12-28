import { MainLayout } from '../../components/layout/MainLayout';

export const TermsPage = () => {
  const sections = [
    { title: 'Chấp Nhận Điều Khoản', content: ['Bằng việc truy cập và sử dụng website Travia.vn, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng.', 'Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ.'] },
    { title: 'Định Nghĩa', list: ['"Travia" hoặc "Chúng tôi" đề cập đến công ty Travia và các dịch vụ.', '"Khách hàng" hoặc "Bạn" đề cập đến người sử dụng dịch vụ.', '"Dịch vụ" đề cập đến các tour du lịch và dịch vụ đặt chỗ.', '"Website" đề cập đến trang web Travia.vn.'] },
    { title: 'Đăng Ký Tài Khoản', content: ['Để sử dụng một số tính năng, bạn cần tạo tài khoản. Bạn cam kết:'], list: ['Cung cấp thông tin chính xác, đầy đủ và cập nhật', 'Duy trì và cập nhật thông tin tài khoản', 'Bảo mật mật khẩu và chịu trách nhiệm cho tất cả hoạt động', 'Thông báo ngay về bất kỳ việc sử dụng trái phép nào'] },
    { title: 'Đặt Tour và Thanh Toán', content: ['Khi đặt tour, bạn đồng ý:'], list: ['Cung cấp thông tin chính xác về số lượng khách', 'Thanh toán đầy đủ theo thời hạn quy định', 'Tuân thủ các quy định về hủy và hoàn tiền', 'Chịu trách nhiệm cho các chi phí phát sinh'] },
    { title: 'Trách Nhiệm của Khách Hàng', content: ['Trong quá trình sử dụng dịch vụ, bạn cam kết:'], list: ['Tuân thủ pháp luật Việt Nam và quốc tế', 'Không sử dụng dịch vụ cho mục đích bất hợp pháp', 'Không can thiệp vào hoạt động bình thường của website', 'Tôn trọng quyền sở hữu trí tuệ'] },
    { title: 'Giới Hạn Trách Nhiệm', content: ['Travia không chịu trách nhiệm cho:'], list: ['Thiệt hại gián tiếp, đặc biệt hoặc hậu quả', 'Mất mát dữ liệu, lợi nhuận hoặc cơ hội kinh doanh', 'Hành vi của các nhà cung cấp dịch vụ bên thứ ba', 'Thiên tai, dịch bệnh hoặc các sự kiện bất khả kháng'] },
    { title: 'Thay Đổi Điều Khoản', content: ['Chúng tôi có quyền thay đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.', 'Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi được coi là bạn đã chấp nhận các điều khoản mới.'] },
    { title: 'Luật Áp Dụng', content: ['Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền tại Việt Nam.'] },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative py-20 bg-[#030712] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 text-sm font-semibold rounded-full border border-blue-500/30 mb-6">
            📜 Pháp Lý
          </span>
          <h1 className="text-5xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Điều Khoản </span>
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Dịch Vụ</span>
          </h1>
          <p className="text-slate-400 text-lg">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </section>

      <section className="py-16 bg-[#0a0f1a]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                    {i + 1}
                  </span>
                  {section.title}
                </h2>
                <div className="text-slate-400 space-y-3 ml-14">
                  {section.content?.map((p, j) => <p key={j}>{p}</p>)}
                  {section.list && (
                    <ul className="list-disc pl-6 space-y-2">
                      {section.list.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl opacity-50 blur-xl" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 border border-white/10 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Có Câu Hỏi?</h3>
              <p className="text-slate-400 mb-8">Liên hệ với chúng tôi nếu bạn có thắc mắc về điều khoản</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:legal@travia.vn" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  legal@travia.vn
                </a>
                <a href="tel:1900-xxxx" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-all hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  1900-xxxx
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
