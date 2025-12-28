import { useState } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: 'Làm thế nào để đặt tour?',
    answer: 'Bạn có thể đặt tour bằng cách: 1) Chọn tour yêu thích trên website, 2) Điền thông tin cá nhân và số lượng khách, 3) Chọn phương thức thanh toán, 4) Xác nhận đặt tour. Sau khi đặt thành công, bạn sẽ nhận được email xác nhận.',
    category: 'Đặt tour'
  },
  {
    id: 2,
    question: 'Có thể hủy tour không?',
    answer: 'Có, bạn có thể hủy tour theo chính sách hủy của từng tour cụ thể. Thông thường, hủy trước 7 ngày sẽ được hoàn 100% phí, hủy trước 3 ngày được hoàn 50% phí. Hủy trong vòng 24h sẽ không được hoàn tiền.',
    category: 'Hủy tour'
  },
  {
    id: 3,
    question: 'Thanh toán như thế nào?',
    answer: 'Chúng tôi chấp nhận thanh toán qua thẻ tín dụng (Visa, Mastercard), chuyển khoản ngân hàng, hoặc ví điện tử (MoMo, ZaloPay). Thanh toán được bảo mật 100% qua hệ thống SSL.',
    category: 'Thanh toán'
  },
  {
    id: 4,
    question: 'Tour có bao gồm bảo hiểm không?',
    answer: 'Tất cả các tour của chúng tôi đều bao gồm bảo hiểm du lịch cơ bản. Bảo hiểm bao gồm: tai nạn cá nhân, chi phí y tế khẩn cấp, hủy tour do lý do bất khả kháng.',
    category: 'Bảo hiểm'
  },
  {
    id: 5,
    question: 'Có thể thay đổi ngày đi tour không?',
    answer: 'Có thể thay đổi ngày đi tour tùy thuộc vào tình trạng còn chỗ của tour mới. Phí thay đổi là 200,000 VNĐ/khách. Vui lòng liên hệ hotline để được hỗ trợ.',
    category: 'Thay đổi'
  },
  {
    id: 6,
    question: 'Trẻ em có được giảm giá không?',
    answer: 'Trẻ em dưới 2 tuổi: miễn phí (ngồi chung với bố mẹ). Trẻ em 2-11 tuổi: giảm 30% giá tour. Trẻ em từ 12 tuổi trở lên: giá như người lớn.',
    category: 'Giá cả'
  },
  {
    id: 7,
    question: 'Tour có hướng dẫn viên không?',
    answer: 'Tất cả tour của chúng tôi đều có hướng dẫn viên chuyên nghiệp, nhiệt tình và am hiểu về điểm đến. Hướng dẫn viên sẽ hỗ trợ bạn trong suốt chuyến đi.',
    category: 'Dịch vụ'
  },
  {
    id: 8,
    question: 'Có thể đặt tour riêng không?',
    answer: 'Có, chúng tôi cung cấp dịch vụ tour riêng theo yêu cầu. Bạn có thể tùy chỉnh lịch trình, điểm đến và dịch vụ theo nhu cầu. Liên hệ hotline để được tư vấn chi tiết.',
    category: 'Tour riêng'
  }
];

const categories = ['Tất cả', 'Đặt tour', 'Hủy tour', 'Thanh toán', 'Bảo hiểm', 'Thay đổi', 'Giá cả', 'Dịch vụ', 'Tour riêng'];

export const FAQPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFAQs = selectedCategory === 'Tất cả' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative min-h-[50vh] bg-[#030712] overflow-hidden flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-10 right-1/3 w-[400px] h-[400px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ 
              backgroundImage: 'linear-gradient(rgba(251,191,36,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} 
          />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500/30 to-orange-500/30 backdrop-blur-xl rounded-3xl mb-8 border border-amber-500/30">
            <span className="text-4xl">❓</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Câu Hỏi </span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Thường Gặp</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Tìm câu trả lời cho những thắc mắc phổ biến về dịch vụ của chúng tôi
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          {/* Categories */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full border border-amber-500/30 mb-4">
                📁 Danh Mục
              </span>
              <h2 className="text-2xl font-bold text-white">Chọn chủ đề</h2>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:border-amber-500/30 hover:text-amber-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.map((faq, index) => (
              <div
                key={faq.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl opacity-0 ${openItems.includes(faq.id) ? 'opacity-30' : 'group-hover:opacity-20'} blur transition-all`} />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        openItems.includes(faq.id) 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30' 
                          : 'bg-white/5'
                      }`}>
                        {openItems.includes(faq.id) ? '✓' : faq.id}
                      </span>
                      <h3 className="text-lg font-semibold text-white pr-4">
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`transform transition-transform duration-300 ${
                      openItems.includes(faq.id) ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${
                    openItems.includes(faq.id) ? 'max-h-96' : 'max-h-0'
                  }`}>
                    <div className="px-6 pb-5">
                      <div className="border-t border-white/10 pt-4 ml-14">
                        <p className="text-slate-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="mt-16">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-50 blur-xl" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-10 border border-white/10 text-center">
                <span className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-2xl mb-6 text-3xl">
                  💬
                </span>
                <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Không tìm thấy <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">câu trả lời?</span>
                </h3>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                  Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn 24/7
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:1900-xxxx"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Hotline: 1900-xxxx
                  </a>
                  <a
                    href="mailto:support@travia.vn"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-xl text-white font-bold rounded-xl border border-white/20 hover:bg-white/10 transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@travia.vn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
