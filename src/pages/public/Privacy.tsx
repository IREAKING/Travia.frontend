import { MainLayout } from '../../components/layout/MainLayout';

export const PrivacyPage = () => {
  const sections = [
    { title: 'Thông Tin Chúng Tôi Thu Thập', content: ['Thông tin cá nhân:'], list: ['Họ tên, email, số điện thoại', 'Địa chỉ và thông tin liên hệ', 'Thông tin thanh toán (được mã hóa)', 'Ngày sinh và giới tính (tùy chọn)', 'Thông tin passport/CMND (cho tour quốc tế)'], extra: ['Thông tin sử dụng:'], extraList: ['Lịch sử đặt tour và giao dịch', 'Thông tin duyệt web và tương tác', 'Dữ liệu thiết bị và trình duyệt', 'Vị trí địa lý (nếu được phép)'] },
    { title: 'Mục Đích Sử Dụng', content: ['Chúng tôi sử dụng thông tin của bạn để:'], list: ['Cung cấp và cải thiện dịch vụ', 'Xử lý đặt tour và thanh toán', 'Gửi thông tin khuyến mãi', 'Hỗ trợ khách hàng', 'Tuân thủ nghĩa vụ pháp lý', 'Ngăn chặn gian lận'] },
    { title: 'Chia Sẻ Thông Tin', content: ['Chúng tôi có thể chia sẻ thông tin với:'], list: ['Nhà cung cấp dịch vụ: Khách sạn, hãng bay', 'Nhà cung cấp thanh toán: Ngân hàng, cổng thanh toán', 'Cơ quan pháp luật: Khi được yêu cầu hợp pháp'], highlight: 'Cam kết: Không bán, cho thuê hoặc chia sẻ thông tin cá nhân cho mục đích thương mại.' },
    { title: 'Bảo Mật Thông Tin', content: ['Các biện pháp bảo mật:'], list: ['Mã hóa SSL/TLS cho dữ liệu truyền tải', 'Mã hóa cơ sở dữ liệu', 'Kiểm soát truy cập', 'Giám sát hệ thống 24/7', 'Sao lưu định kỳ', 'Đào tạo nhân viên bảo mật'] },
    { title: 'Quyền Của Bạn', content: ['Theo quy định pháp luật, bạn có quyền:'], list: ['Truy cập: Xem thông tin cá nhân', 'Chỉnh sửa: Cập nhật thông tin', 'Xóa: Yêu cầu xóa thông tin', 'Hạn chế: Giới hạn xử lý', 'Di chuyển: Xuất dữ liệu', 'Phản đối: Từ chối marketing'] },
    { title: 'Lưu Trữ Thông Tin', content: ['Thông tin được lưu trữ:'], list: ['Thời gian: Theo quy định pháp luật', 'Địa điểm: Server bảo mật tại Việt Nam', 'Backup: Sao lưu định kỳ', 'Xóa tự động: Dữ liệu không cần thiết'] },
    { title: 'Thay Đổi Chính Sách', content: ['Chúng tôi có thể cập nhật chính sách theo thời gian. Các thay đổi quan trọng sẽ được thông báo qua email hoặc trên website.'] },
  ];

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative py-20 bg-[#030712] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-10 right-1/4 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 text-sm font-semibold rounded-full border border-purple-500/30 mb-6">
            🔒 Bảo Mật
          </span>
          <h1 className="text-5xl font-black mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Chính Sách </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Bảo Mật</span>
          </h1>
          <p className="text-slate-400 text-lg">Cập nhật: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>
      </section>

      <section className="py-16 bg-[#0a0f1a]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i} className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                  <span className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                    {i + 1}
                  </span>
                  {section.title}
                </h2>
                <div className="text-slate-400 space-y-4 ml-14">
                  {section.content?.map((p, j) => <p key={j}>{p}</p>)}
                  {section.list && (
                    <ul className="list-disc pl-6 space-y-2">
                      {section.list.map((item, j) => <li key={j}>{item}</li>)}
                    </ul>
                  )}
                  {section.extra && (
                    <>
                      <p className="mt-4">{section.extra[0]}</p>
                      <ul className="list-disc pl-6 space-y-2">
                        {section.extraList?.map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                    </>
                  )}
                  {section.highlight && (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl mt-4">
                      <p className="text-purple-300 font-medium">{section.highlight}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl opacity-50 blur-xl" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 border border-white/10 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Câu Hỏi Về Bảo Mật?</h3>
              <p className="text-slate-400 mb-8">Liên hệ với chúng tôi nếu có thắc mắc</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="mailto:privacy@travia.vn" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  privacy@travia.vn
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
