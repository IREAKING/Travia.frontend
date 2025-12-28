import { useState, useEffect } from 'react';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  comment: string;
  tour: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Nguyễn Văn An',
    avatar: 'https://i.pravatar.cc/150?img=12',
    location: 'Hà Nội',
    rating: 5,
    comment: 'Chuyến đi tuyệt vời! Hướng dẫn viên nhiệt tình, khách sạn sạch sẽ. Tôi và gia đình rất hài lòng với dịch vụ của Travia.',
    tour: 'Tour Đà Nẵng - Hội An 4N3Đ',
    date: '2024-10-01'
  },
  {
    id: 2,
    name: 'Trần Thị Bình',
    avatar: 'https://i.pravatar.cc/150?img=45',
    location: 'TP.HCM',
    rating: 5,
    comment: 'Đây là lần đầu tiên tôi đi tour và trải nghiệm thật tuyệt vời. Mọi thứ đều được sắp xếp chu đáo, giá cả hợp lý. Chắc chắn sẽ quay lại!',
    tour: 'Tour Phú Quốc 3N2Đ',
    date: '2024-09-28'
  },
  {
    id: 3,
    name: 'Lê Minh Cường',
    avatar: 'https://i.pravatar.cc/150?img=33',
    location: 'Đà Nẵng',
    rating: 5,
    comment: 'Dịch vụ chuyên nghiệp, lịch trình hợp lý. Đặc biệt là hướng dẫn viên rất am hiểu và vui vẻ. Highly recommended!',
    tour: 'Tour Sapa - Fansipan 3N2Đ',
    date: '2024-09-20'
  },
  {
    id: 4,
    name: 'Phạm Thu Hà',
    avatar: 'https://i.pravatar.cc/150?img=47',
    location: 'Hải Phòng',
    rating: 5,
    comment: 'Tôi đã đi nhiều tour nhưng tour của Travia là tốt nhất. Giá cả minh bạch, không phát sinh chi phí. Sẽ giới thiệu cho bạn bè!',
    tour: 'Tour Nha Trang 4N3Đ',
    date: '2024-09-15'
  },
  {
    id: 5,
    name: 'Hoàng Văn Đức',
    avatar: 'https://i.pravatar.cc/150?img=68',
    location: 'Cần Thơ',
    rating: 5,
    comment: 'Chuyến đi với gia đình rất vui vẻ và an toàn. Các dịch vụ đều tốt, ăn uống ngon. Cảm ơn Travia đã mang đến kỷ niệm đẹp!',
    tour: 'Tour Đà Lạt 3N2Đ',
    date: '2024-09-10'
  },
  {
    id: 6,
    name: 'Vũ Thị Mai',
    avatar: 'https://i.pravatar.cc/150?img=20',
    location: 'Huế',
    rating: 5,
    comment: 'Tuyệt vời từ A đến Z! Booking dễ dàng, hỗ trợ nhanh chóng. Tour guide nhiệt tình. Sẽ đặt thêm nhiều tour nữa!',
    tour: 'Tour Hạ Long 2N1Đ',
    date: '2024-09-05'
  }
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const itemsPerPage = 3;

  useEffect(() => {
    if (!isAutoPlay) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => 
        (prev + itemsPerPage) >= testimonials.length ? 0 : prev + itemsPerPage
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const nextSlide = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => {
      const nextIndex = prev + itemsPerPage;
      return nextIndex >= testimonials.length ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => {
      const prevIndex = prev - itemsPerPage;
      return prevIndex < 0 ? Math.max(0, testimonials.length - itemsPerPage) : prevIndex;
    });
  };

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + itemsPerPage);
  
  // Đảm bảo luôn có đủ testimonials để hiển thị
  const paddedTestimonials = visibleTestimonials.length < itemsPerPage 
    ? [...visibleTestimonials, ...testimonials.slice(0, itemsPerPage - visibleTestimonials.length)]
    : visibleTestimonials;

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1 justify-center mb-4">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-5 h-5 ${
              index < rating ? 'text-amber-400' : 'text-gray-600'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <section className="relative py-20 bg-gray-950 w-full overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-16 scroll-reveal">
          <span className="inline-block px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-4">
            Đánh giá từ khách hàng
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Khách Hàng Nói Gì
            <span className="block mt-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Về Chúng Tôi
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Hơn 10,000+ khách hàng hài lòng đã trải nghiệm dịch vụ của Travia
          </p>
        </div>

        {/* Desktop View - 3 columns */}
        <div className="hidden md:grid md:grid-cols-3 gap-8 mb-12">
          {paddedTestimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`group relative bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-amber-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/5 scroll-reveal stagger-${index + 1}`}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative">
                {/* Quote icon */}
                <div className="absolute -top-2 -left-2 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>

                {renderStars(testimonial.rating)}
                
                <p className="text-gray-300 italic mb-6 text-center line-clamp-4 leading-relaxed">
                  "{testimonial.comment}"
                </p>

                <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                  <div className="relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/30"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                    <p className="text-xs text-amber-400 mt-1">{testimonial.tour}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View - 1 column */}
        <div className="md:hidden">
          <div className="group relative bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-cyan-500/5 rounded-2xl"></div>
            
            <div className="relative">
              {renderStars(visibleTestimonials[0]?.rating || 5)}
              
              <p className="text-gray-300 italic mb-6 text-center leading-relaxed">
                "{visibleTestimonials[0]?.comment || 'Chưa có đánh giá'}"
              </p>

              <div className="flex items-center justify-center gap-4 pt-4 border-t border-white/10">
                <img
                  src={visibleTestimonials[0]?.avatar || 'https://i.pravatar.cc/150?img=1'}
                  alt={visibleTestimonials[0]?.name || 'Khách hàng'}
                  className="w-14 h-14 rounded-full object-cover border-2 border-amber-500/30"
                />
                <div className="text-left">
                  <h4 className="font-semibold text-white">{visibleTestimonials[0]?.name || 'Khách hàng'}</h4>
                  <p className="text-sm text-gray-500">{visibleTestimonials[0]?.location || 'Việt Nam'}</p>
                  <p className="text-xs text-amber-400 mt-1">{visibleTestimonials[0]?.tour || 'Tour du lịch'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevSlide}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group"
            aria-label="Previous testimonials"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-2">
            {[...Array(Math.ceil(testimonials.length / itemsPerPage))].map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlay(false);
                  setCurrentIndex(index * itemsPerPage);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / itemsPerPage) === index
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 w-8'
                    : 'bg-gray-700 hover:bg-gray-600 w-2'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300 group"
            aria-label="Next testimonials"
          >
            <svg className="w-6 h-6 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 scroll-reveal">
          {[
            { value: '10K+', label: 'Khách Hàng', color: 'from-amber-500 to-orange-500' },
            { value: '500+', label: 'Tours', color: 'from-cyan-500 to-blue-500' },
            { value: '98%', label: 'Hài Lòng', color: 'from-green-500 to-emerald-500' },
            { value: '50+', label: 'Điểm Đến', color: 'from-purple-500 to-pink-500' },
          ].map((stat, index) => (
            <div 
              key={stat.label}
              className={`text-center p-6 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-300 hover:shadow-xl animation-delay-${index}00`}
            >
              <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </div>
              <div className="text-gray-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
