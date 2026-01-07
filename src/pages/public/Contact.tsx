import { useState } from 'react';
import type { FormEvent } from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { contactService } from '../../services/contactService';
import { useToast } from '../../hooks/useToast';

export const ContactPage = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        setIsSubmitting(false);
        return;
      }

      // Call API
      await contactService.createContact({
        ho_ten: formData.name,
        email: formData.email,
        so_dien_thoai: formData.phone || undefined,
        tieu_de: formData.subject,
        noi_dung: formData.message,
      });

      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      showToast('Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.', 'success');
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      setSubmitStatus('error');
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] bg-[#030712] overflow-hidden flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: 'linear-gradient(rgba(168,85,247,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl rounded-3xl mb-8 border border-purple-500/30">
            <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Liên Hệ </span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Với Chúng Tôi</span>
            </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7 với đội ngũ chuyên nghiệp
            </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: '⏰', text: 'Phản hồi trong 24h' },
              { icon: '✅', text: 'Hỗ trợ chuyên nghiệp' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 text-white text-sm">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
            <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-4">
                  📞 Thông Tin Liên Hệ
                </span>
                <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Kết Nối <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Với Chúng Tôi</span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  { icon: '📍', title: 'Địa chỉ', content: '123 Đường ABC, Quận XYZ\nHà Nội, Việt Nam', gradient: 'from-blue-500 to-indigo-600' },
                  { icon: '📞', title: 'Điện thoại', content: 'Hotline: 1900-xxxx\nMobile: +84 xxx xxx xxx', gradient: 'from-emerald-500 to-teal-600' },
                  { icon: '✉️', title: 'Email', content: 'info@travia.com\nsupport@travia.com', gradient: 'from-purple-500 to-pink-600' },
                  { icon: '🕐', title: 'Giờ làm việc', content: 'T2 - T6: 8:00 - 18:00\nT7 - CN: 9:00 - 17:00', gradient: 'from-amber-500 to-orange-600' },
                ].map((info, i) => (
                  <div key={i} className="group relative">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${info.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur transition-opacity`} />
                    <div className="relative flex items-start gap-4 p-5 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 group-hover:border-white/20 transition-all">
                      <div className={`w-14 h-14 bg-gradient-to-r ${info.gradient} rounded-xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                        {info.icon}
                  </div>
                  <div>
                        <h3 className="font-bold text-white mb-1">{info.title}</h3>
                        <p className="text-slate-400 whitespace-pre-line text-sm">{info.content}</p>
                  </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl opacity-50 blur-lg" />
                <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="font-bold text-xl text-white mb-4">Theo Dõi Chúng Tôi</h3>
                  <div className="flex gap-3">
                    {[
                      { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', gradient: 'from-blue-500 to-blue-600' },
                      { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z', gradient: 'from-pink-500 to-purple-600' },
                      { icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', gradient: 'from-cyan-400 to-blue-500' },
                    ].map((social, i) => (
                      <a key={i} href="#" className={`group/social w-12 h-12 bg-gradient-to-r ${social.gradient} rounded-xl flex items-center justify-center hover:scale-110 transition-all shadow-lg`}>
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d={social.icon} />
                    </svg>
                  </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl opacity-30 blur-xl" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 text-sm font-semibold rounded-full border border-purple-500/30 mb-4">
                    ✉️ Gửi Tin Nhắn
                  </span>
                  <h2 className="text-3xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Liên Hệ <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Ngay</span>
                </h2>
                  <p className="text-slate-400 mt-2">Chúng tôi sẽ phản hồi trong vòng 24 giờ</p>
              </div>
              
              {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-3">
                    <span className="text-xl">✅</span>
                    <span className="font-medium">Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl flex items-center gap-3">
                    <span className="text-xl">❌</span>
                    <span className="font-medium">Có lỗi xảy ra. Vui lòng thử lại sau.</span>
                </div>
              )}

                <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                </div>

                  <div className="grid md:grid-cols-2 gap-5">
                <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                        placeholder="+84 xxx xxx xxx"
                  />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Chủ đề *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all [&>option]:bg-slate-900"
                    required
                  >
                    <option value="">Chọn chủ đề</option>
                    <option value="booking">Đặt tour</option>
                    <option value="support">Hỗ trợ kỹ thuật</option>
                    <option value="partnership">Hợp tác</option>
                    <option value="feedback">Góp ý</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Nội dung *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                      rows={5}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                    className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Đang gửi...
                      </>
                  ) : (
                      <>
                        🚀 Gửi tin nhắn
                      </>
                  )}
                </button>
              </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
