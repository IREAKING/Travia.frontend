import { MainLayout } from '../../components/layout/MainLayout';
import { SearchBox } from '../../components/common/SearchBox';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
}

export const BlogPage = () => {
  const blogPosts: BlogPost[] = [
    { id: 1, title: '10 Điểm Đến Du Lịch Hè 2024 Không Thể Bỏ Qua', excerpt: 'Khám phá những địa điểm tuyệt vời để nghỉ dưỡng mùa hè này...', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800', category: 'Du lịch', date: '15/10/2024', author: 'Admin', readTime: '5 phút đọc' },
    { id: 2, title: 'Bí Quyết Tiết Kiệm Chi Phí Khi Đi Tour', excerpt: 'Những mẹo nhỏ giúp bạn tiết kiệm nhưng vẫn có trải nghiệm tuyệt vời...', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800', category: 'Tips & Tricks', date: '12/10/2024', author: 'Travel Expert', readTime: '7 phút đọc' },
    { id: 3, title: 'Review Chi Tiết Tour Hạ Long 3 Ngày 2 Đêm', excerpt: 'Trải nghiệm thực tế về chuyến du thuyền sang trọng tại vịnh Hạ Long...', image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', category: 'Review', date: '10/10/2024', author: 'Nguyễn Văn A', readTime: '10 phút đọc' },
    { id: 4, title: 'Checklist Chuẩn Bị Cho Chuyến Du Lịch Dài Ngày', excerpt: 'Những thứ cần thiết không thể thiếu trong vali của bạn...', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800', category: 'Tips & Tricks', date: '8/10/2024', author: 'Travel Expert', readTime: '6 phút đọc' },
    { id: 5, title: 'Những Món Ăn Đường Phố Phải Thử Ở Hà Nội', excerpt: 'Khám phá văn hóa ẩm thực phong phú của thủ đô ngàn năm văn hiến...', image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', category: 'Ẩm thực', date: '5/10/2024', author: 'Food Blogger', readTime: '8 phút đọc' },
    { id: 6, title: 'Top 5 Resort Sang Trọng Tại Phú Quốc', excerpt: 'Những khu nghỉ dưỡng đẳng cấp 5 sao trên đảo ngọc...', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', category: 'Review', date: '3/10/2024', author: 'Luxury Traveler', readTime: '9 phút đọc' },
  ];

  const categories = ['Tất cả', 'Du lịch', 'Tips & Tricks', 'Review', 'Ẩm thực'];

  const getCategoryStyle = (category: string) => {
    const styles: Record<string, string> = {
      'Du lịch': 'from-cyan-500 to-blue-600',
      'Tips & Tricks': 'from-amber-500 to-orange-600',
      'Review': 'from-purple-500 to-pink-600',
      'Ẩm thực': 'from-emerald-500 to-teal-600',
    };
    return styles[category] || 'from-gray-500 to-gray-600';
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative min-h-[60vh] bg-[#030712] overflow-hidden flex items-center">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-pink-500/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(236,72,153,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>
        
        <div className="relative container mx-auto px-4 text-center py-20">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-500/10 text-pink-400 text-sm font-semibold rounded-full border border-pink-500/30 mb-6">
            📝 Blog Du Lịch
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Blog </span>
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Du Lịch</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Chia sẻ kinh nghiệm, tips và những câu chuyện du lịch thú vị
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchBox placeholder="Tìm bài viết..." />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="sticky top-16 z-30 bg-[#0a0f1a]/95 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, i) => (
              <button
                key={category}
                className={`px-5 py-2 rounded-xl font-medium transition-all duration-300 ${
                  i === 0
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:border-pink-500/30 hover:text-pink-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-[120px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full border border-amber-500/30 mb-4">
              🔥 Nổi Bật
            </span>
            <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Bài Viết <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Nổi Bật</span>
            </h2>
          </div>
          
          <div className="group relative max-w-5xl mx-auto">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500" />
            <div className="relative grid md:grid-cols-2 bg-slate-900/80 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
              <div className="relative h-[400px] overflow-hidden">
                <img src={blogPosts[0].image} alt={blogPosts[0].title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/50" />
              </div>
              <div className="p-10 flex flex-col justify-center">
                <span className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${getCategoryStyle(blogPosts[0].category)} text-white text-sm font-bold rounded-full w-fit mb-6`}>
                  {blogPosts[0].category}
                </span>
                <h3 className="text-3xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {blogPosts[0].title}
                </h3>
                <p className="text-slate-400 mb-6 text-lg">{blogPosts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-8">
                  <span className="flex items-center gap-1.5"><span className="text-cyan-400">👤</span> {blogPosts[0].author}</span>
                  <span className="flex items-center gap-1.5"><span className="text-purple-400">📅</span> {blogPosts[0].date}</span>
                  <span className="flex items-center gap-1.5"><span className="text-pink-400">⏱️</span> {blogPosts[0].readTime}</span>
                </div>
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl w-fit shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all hover:scale-105">
                  Đọc tiếp
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-4">
              📰 Mới Nhất
            </span>
            <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Bài Viết <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Mới Nhất</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.slice(1).map((post, i) => (
              <article key={post.id} className="group relative cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all" />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
                  <div className="relative h-52 overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                    <span className={`absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r ${getCategoryStyle(post.category)} text-white text-xs font-bold rounded-full shadow-lg`}>
                      {post.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-white mb-3 group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                      <span>👤 {post.author}</span>
                      <span>📅 {post.date}</span>
                    </div>
                    <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all group-hover:border-cyan-500/30">
                      Đọc thêm
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105">
              Xem Thêm Bài Viết
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <span className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-2xl mb-6 text-3xl">
              ✉️
            </span>
            <h2 className="text-5xl font-black text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Đăng Ký <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Nhận Tin</span>
            </h2>
            <p className="text-xl text-slate-400 mb-10">
              Nhận những bài viết mới nhất và ưu đãi độc quyền qua email
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
              />
              <button type="submit" className="px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all hover:scale-105">
                Đăng Ký
              </button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
