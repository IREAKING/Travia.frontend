import { MainLayout } from '../../components/layout/MainLayout';

export const AboutPage = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] bg-[#030712] overflow-hidden flex items-center">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px'
            }}
          />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 backdrop-blur-xl rounded-3xl mb-8 border border-cyan-500/30">
            <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          <h1 className="text-6xl md:text-7xl font-black mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Về </span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Travia</span>
            </h1>
          <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-4xl mx-auto">
            Nền tảng du lịch hàng đầu Việt Nam - Kết nối bạn với những trải nghiệm tuyệt vời
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { icon: '✅', text: 'Đáng tin cậy 100%' },
              { icon: '⏰', text: 'Hỗ trợ 24/7' },
              { icon: '❤️', text: 'Trải nghiệm tuyệt vời' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-4">
              ✨ Sứ mệnh & tầm nhìn
            </span>
            <h2 className="text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Định hướng <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Phát triển</span>
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                title: 'Sứ mệnh',
                icon: '🚀',
                gradient: 'from-cyan-500 to-blue-600',
                description: 'Mang đến cho mọi người những trải nghiệm du lịch tuyệt vời nhất, kết nối du khách với các điểm đến độc đáo và nhà cung cấp tour uy tín trên khắp Việt Nam và thế giới.',
              },
              {
                title: 'Tầm nhìn',
                icon: '🎯',
                gradient: 'from-purple-500 to-pink-600',
                description: 'Trở thành nền tảng du lịch số 1 Đông Nam Á, nơi mọi người tìm thấy và đặt tour một cách dễ dàng, nhanh chóng với trải nghiệm tốt nhất.',
              },
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.gradient} rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-700`} />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-10 border border-white/10 group-hover:border-white/20 transition-all h-full">
                  <div className={`w-20 h-20 bg-gradient-to-r ${item.gradient} rounded-3xl flex items-center justify-center mb-8 text-4xl shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
              </div>
                  <h3 className="text-3xl font-bold mb-6 text-white">{item.title}</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">{item.description}</p>
            </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full border border-amber-500/30 mb-4">
              📊 Thành tựu
            </span>
            <h2 className="text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Con số <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Ấn tượng</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '500+', label: 'Tours du lịch', icon: '🗺️', gradient: 'from-cyan-500 to-blue-600' },
              { value: '10,000+', label: 'Khách hàng hài lòng', icon: '😊', gradient: 'from-emerald-500 to-teal-600' },
              { value: '100+', label: 'Nhà cung cấp', icon: '🏢', gradient: 'from-purple-500 to-pink-600' },
              { value: '50+', label: 'Điểm đến', icon: '📍', gradient: 'from-amber-500 to-orange-600' },
            ].map((stat, i) => (
              <div key={i} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500`} />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 group-hover:border-white/20 transition-all text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {stat.icon}
              </div>
                  <div className="text-5xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-2">{stat.value}</div>
                  <p className="text-slate-400 font-medium">{stat.label}</p>
            </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[150px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 text-sm font-semibold rounded-full border border-purple-500/30 mb-4">
              👥 Đội ngũ
            </span>
            <h2 className="text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Những <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Con người</span> tuyệt vời
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Nguyễn Văn A', role: 'CEO & Founder', desc: 'Hơn 10 năm kinh nghiệm trong ngành du lịch', gradient: 'from-cyan-500 to-blue-600' },
              { name: 'Trần Thị B', role: 'CTO', desc: 'Chuyên gia công nghệ với niềm đam mê digital', gradient: 'from-purple-500 to-pink-600' },
              { name: 'Lê Văn C', role: 'Head of Operations', desc: 'Đảm bảo mọi hoạt động diễn ra suôn sẻ', gradient: 'from-amber-500 to-orange-600' },
            ].map((member, i) => (
              <div key={i} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${member.gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500`} />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 group-hover:border-white/20 transition-all text-center">
                  <div className={`w-28 h-28 bg-gradient-to-br ${member.gradient} rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500`}>
                    <span className="text-4xl font-bold text-white">{member.name.split(' ').pop()?.charAt(0)}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-cyan-400 font-semibold mb-4">{member.role}</p>
                  <p className="text-slate-400">{member.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-sm font-semibold rounded-full border border-emerald-500/30 mb-4">
              💎 Giá trị
            </span>
            <h2 className="text-5xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Giá trị <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Cốt lõi</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '✅', title: 'Tin Cậy', desc: 'Cam kết dịch vụ đáng tin cậy và minh bạch', gradient: 'from-emerald-500 to-teal-600' },
              { icon: '💡', title: 'Sáng Tạo', desc: 'Luôn tìm kiếm cách cải thiện trải nghiệm', gradient: 'from-amber-500 to-orange-600' },
              { icon: '❤️', title: 'Đam Mê', desc: 'Làm việc với niềm đam mê và nhiệt huyết', gradient: 'from-pink-500 to-rose-600' },
              { icon: '🤝', title: 'Cộng Đồng', desc: 'Xây dựng cộng đồng du lịch bền vững', gradient: 'from-blue-500 to-indigo-600' },
              { icon: '⚡', title: 'Hiệu Quả', desc: 'Tối ưu hóa quy trình cho dịch vụ tốt nhất', gradient: 'from-purple-500 to-violet-600' },
              { icon: '🌍', title: 'Mở Rộng', desc: 'Không ngừng phát triển để phục vụ tốt hơn', gradient: 'from-cyan-500 to-blue-600' },
            ].map((value, i) => (
              <div key={i} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${value.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-all duration-500`} />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 group-hover:border-white/20 transition-all h-full">
                  <div className={`w-14 h-14 bg-gradient-to-r ${value.gradient} rounded-xl flex items-center justify-center mb-4 text-2xl shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-slate-400">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            Sẵn sàng <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Khám phá?</span>
            </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Bắt đầu hành trình của bạn cùng Travia ngay hôm nay
            </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/tours" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105">
                  Xem tất cả tours
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
              </a>
            <a href="/contact" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white/5 backdrop-blur-xl text-white font-bold rounded-2xl border border-white/20 hover:bg-white/10 transition-all hover:scale-105">
                  Liên hệ với chúng tôi
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
              </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
