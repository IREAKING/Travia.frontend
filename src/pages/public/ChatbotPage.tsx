import { MainLayout } from '../../components/layout/MainLayout';
import { Chatbot } from '../../components/chat/Chatbot';

export const ChatbotPage = () => {
  return (
    <MainLayout>
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Trợ lý AI Travia
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Tư vấn tour du lịch thông minh, hỗ trợ 24/7. Hỏi bất cứ điều gì về tours, điểm đến, giá cả và nhiều hơn nữa!
            </p>
          </div>

          {/* Chatbot Component */}
          <div className="mb-8">
            <Chatbot />
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Tư vấn thông minh</h3>
              <p className="text-slate-400 text-sm">
                AI phân tích nhu cầu và đưa ra gợi ý tour phù hợp nhất với bạn
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Phản hồi nhanh</h3>
              <p className="text-slate-400 text-sm">
                Trả lời tức thì mọi câu hỏi về tours, giá cả, lịch trình và điểm đến
              </p>
            </div>

            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Giao tiếp tự nhiên</h3>
              <p className="text-slate-400 text-sm">
                Chat như với bạn bè, dễ dàng và thân thiện bằng tiếng Việt
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

