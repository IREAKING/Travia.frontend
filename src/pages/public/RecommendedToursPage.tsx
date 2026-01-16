import { MainLayout } from '../../components/layout/MainLayout';
import { RecommendedTours } from '../../components/tour/RecommendedTours';

export const RecommendedToursPage = () => {
  return (
    <MainLayout>
      <section className="py-20 px-4 bg-[#030712] min-h-screen">
        <div className="container mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Tour gợi ý dành cho bạn
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Khám phá các tour được AI gợi ý dựa trên sở thích, lịch sử xem và điểm đến yêu thích của bạn
            </p>
          </div>

          {/* Recommended Tours Component */}
          <RecommendedTours method="preferences" limit={12} showMethodSelector={true} />
        </div>
      </section>
    </MainLayout>
  );
};

