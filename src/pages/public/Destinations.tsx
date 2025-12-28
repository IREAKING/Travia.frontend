import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { SearchBox } from '../../components/common/SearchBox';
import { LoadingSpinner } from '../../components/common/Loading';

interface Destination {
  id: number;
  ten: string;
  quoc_gia: string;
  khu_vuc?: string;
  mo_ta?: string;
  anh?: string;
  tour_count?: number;
}

const regions = [
  { name: 'Miền Bắc', icon: '🏔️', gradient: 'from-cyan-500 to-blue-600', desc: 'Núi non hùng vĩ' },
  { name: 'Miền Trung', icon: '🏖️', gradient: 'from-amber-500 to-orange-600', desc: 'Biển xanh cát trắng' },
  { name: 'Miền Nam', icon: '🌴', gradient: 'from-emerald-500 to-teal-600', desc: 'Sông nước miệt vườn' },
];

export const DestinationsPage = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDestinations([
        { id: 1, ten: 'Hạ Long', quoc_gia: 'Việt Nam', khu_vuc: 'Miền Bắc', mo_ta: 'Vịnh Hạ Long - Di sản thiên nhiên thế giới', anh: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800', tour_count: 15 },
        { id: 2, ten: 'Đà Nẵng', quoc_gia: 'Việt Nam', khu_vuc: 'Miền Trung', mo_ta: 'Thành phố đáng sống nhất Việt Nam', anh: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', tour_count: 20 },
        { id: 3, ten: 'Phú Quốc', quoc_gia: 'Việt Nam', khu_vuc: 'Miền Nam', mo_ta: 'Đảo ngọc thiên đường biển xanh', anh: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800', tour_count: 12 },
        { id: 4, ten: 'Sapa', quoc_gia: 'Việt Nam', khu_vuc: 'Miền Bắc', mo_ta: 'Thị trấn sương mù với ruộng bậc thang', anh: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800', tour_count: 18 },
        { id: 5, ten: 'Nha Trang', quoc_gia: 'Việt Nam', khu_vuc: 'Miền Trung', mo_ta: 'Thành phố biển xinh đẹp', anh: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800', tour_count: 22 },
        { id: 6, ten: 'Hội An', quoc_gia: 'Việt Nam', khu_vuc: 'Miền Trung', mo_ta: 'Phố cổ lãng mạn với đèn lồng', anh: 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800', tour_count: 16 },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const filteredDestinations = searchQuery
    ? destinations.filter(d => 
        d.ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.quoc_gia.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.khu_vuc?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : destinations;

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative min-h-[70vh] bg-[#030712] overflow-hidden flex items-center">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920"
            alt="Destinations"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-[#030712]/50" />
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[180px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative container mx-auto px-4 text-center py-20">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 text-sm font-semibold rounded-full border border-cyan-500/30 mb-6">
            🌍 Khám Phá Thế Giới
          </span>
          <h1 className="text-5xl md:text-7xl font-black mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Khám Phá </span>
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Điểm Đến</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Hàng trăm điểm đến tuyệt vời đang chờ bạn khám phá
          </p>
          <div className="w-full max-w-2xl mx-auto relative">
            <SearchBox 
              onSearch={setSearchQuery}
              placeholder="Tìm điểm đến..." 
            />
          </div>
        </div>
      </section>

      {/* Regions */}
      <section className="py-20 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-400 text-sm font-semibold rounded-full border border-purple-500/30 mb-4">
              🗺️ Vùng Miền
            </span>
            <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              Khám Phá <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Theo Vùng</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {regions.map((region, i) => (
              <div key={region.name} className="group relative cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${region.gradient} rounded-3xl opacity-0 group-hover:opacity-50 blur-xl transition-all duration-500`} />
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 group-hover:border-white/20 transition-all h-full text-center">
                  <div className={`w-20 h-20 bg-gradient-to-r ${region.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                    {region.icon}
                  </div>
                  <h3 className="font-bold text-2xl text-white mb-2">{region.name}</h3>
                  <p className="text-slate-400 mb-6">{region.desc}</p>
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all group-hover:border-white/20">
                    Xem điểm đến
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-20 bg-[#030712] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-semibold rounded-full border border-amber-500/30 mb-4">
                📍 Điểm Đến
              </span>
              <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Tất Cả <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Điểm Đến</span>
              </h2>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
              <span className="text-white font-medium">{filteredDestinations.length}</span>
              <span className="text-slate-400"> điểm đến</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                🔍
              </div>
              <p className="text-slate-400 text-lg">Không tìm thấy điểm đến nào</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredDestinations.map((destination, i) => (
                <Link
                  key={destination.id}
                  to={`/tours?destination=${destination.id}`}
                  className="group relative"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all" />
                  <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
                    {destination.anh && (
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={destination.anh}
                          alt={destination.ten}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/30">
                          {destination.tour_count} tours
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-xl text-white mb-2 group-hover:text-cyan-400 transition-colors">
                        {destination.ten}
                      </h3>
                      <p className="flex items-center gap-1.5 text-slate-400 text-sm mb-3">
                        <span className="text-cyan-400">📍</span> {destination.khu_vuc}, {destination.quoc_gia}
                      </p>
                      {destination.mo_ta && (
                        <p className="text-slate-500 text-sm line-clamp-2">{destination.mo_ta}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0a0f1a] relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-black text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            Không Tìm Thấy <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Điểm Đến?</span>
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Liên hệ với chúng tôi để được tư vấn điểm đến phù hợp
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all hover:scale-105"
          >
            Liên Hệ Ngay
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};
