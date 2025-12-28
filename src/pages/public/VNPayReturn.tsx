import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useToast } from '../../hooks/useToast';
import { LoadingSpinner } from '../../components/common/Loading';
import { paymentService } from '../../services/paymentService';

export const VNPayReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    status: 'success' | 'failed';
    booking_id?: number;
    transaction_code?: string;
    error_code?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Kiểm tra xem có VNPay params không (vnp_ResponseCode, vnp_TxnRef, etc.)
        const hasVNPayParams = searchParams.has('vnp_ResponseCode') || searchParams.has('vnp_TxnRef');
        
        if (hasVNPayParams) {
          // VNPay redirect trực tiếp về frontend với VNPay params
          // Gọi backend để verify và xử lý
          const verifyResult = await paymentService.verifyVNPayCallback();
          setResult(verifyResult);
          
          if (verifyResult.status === 'success') {
            showToast('Thanh toán thành công!', 'success');
            setTimeout(() => {
              if (verifyResult.booking_id) {
                navigate(`/booking/${verifyResult.booking_id}`);
              } else {
                navigate('/my-bookings');
              }
            }, 3000);
          } else {
            const errorMessages: Record<string, string> = {
              '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ',
              '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
              '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
              '11': 'Đã hết hạn chờ thanh toán',
              '12': 'Thẻ/Tài khoản bị khóa',
              '51': 'Tài khoản không đủ số dư để thực hiện giao dịch',
              '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
              '75': 'Ngân hàng thanh toán đang bảo trì',
              '99': 'Lỗi không xác định',
            };
            
            const errorMsg = verifyResult.error_code 
              ? errorMessages[verifyResult.error_code] || verifyResult.message || 'Thanh toán thất bại'
              : verifyResult.message || 'Thanh toán thất bại';
            showToast(errorMsg, 'error');
            
            setTimeout(() => {
              if (verifyResult.booking_id) {
                navigate(`/booking/${verifyResult.booking_id}`);
              } else {
                navigate('/my-bookings');
              }
            }, 3000);
          }
        } else {
          // Legacy: Backend đã xử lý và redirect về với params đã xử lý
          const parsedParams = paymentService.parseVNPayReturnParams();
          setResult(parsedParams);
          
          if (parsedParams.status === 'success') {
            showToast('Thanh toán thành công!', 'success');
            setTimeout(() => {
              if (parsedParams.booking_id) {
                navigate(`/booking/${parsedParams.booking_id}`);
              } else {
                navigate('/my-bookings');
              }
            }, 3000);
          } else {
            const errorMessages: Record<string, string> = {
              '07': 'Trừ tiền thành công nhưng giao dịch bị nghi ngờ',
              '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking',
              '10': 'Xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
              '11': 'Đã hết hạn chờ thanh toán',
              '12': 'Thẻ/Tài khoản bị khóa',
              '51': 'Tài khoản không đủ số dư để thực hiện giao dịch',
              '65': 'Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
              '75': 'Ngân hàng thanh toán đang bảo trì',
              '99': 'Lỗi không xác định',
            };
            
            const errorMsg = parsedParams.error_code 
              ? errorMessages[parsedParams.error_code] || 'Thanh toán thất bại'
              : 'Thanh toán thất bại';
            showToast(errorMsg, 'error');
            
            setTimeout(() => {
              if (parsedParams.booking_id) {
                navigate(`/booking/${parsedParams.booking_id}`);
              } else {
                navigate('/my-bookings');
              }
            }, 3000);
          }
        }
      } catch (error: any) {
        console.error('Error processing payment:', error);
        showToast('Có lỗi xảy ra khi xử lý thanh toán', 'error');
        setTimeout(() => {
          navigate('/my-bookings');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, showToast]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#030712]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#030712] flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Success State */}
            {result?.status === 'success' && (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full animate-pulse opacity-30" />
                  <svg className="w-16 h-16 text-green-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4">
                  Thanh toán thành công!
                </h1>
                
                <p className="text-xl text-slate-400 mb-8">
                  Cảm ơn bạn đã thanh toán. Đơn đặt tour của bạn đã được xác nhận.
                </p>

                {result.transaction_code && (
                  <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-8">
                    <p className="text-slate-400 mb-2">Mã giao dịch:</p>
                    <p className="text-cyan-400 font-mono text-lg">{result.transaction_code}</p>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate(`/booking/${result.booking_id || ''}`)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                  >
                    Xem chi tiết đơn đặt
                  </button>
                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 border border-white/10"
                  >
                    Danh sách đặt chỗ
                  </button>
                </div>

                <p className="text-slate-500 text-sm mt-6">
                  Đang chuyển hướng tự động trong 3 giây...
                </p>
              </div>
            )}

            {/* Failed State */}
            {result?.status === 'failed' && (
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center border border-red-500/30 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-400 rounded-full animate-pulse opacity-30" />
                  <svg className="w-16 h-16 text-red-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4">
                  Thanh toán thất bại
                </h1>
                
                <p className="text-xl text-slate-400 mb-8">
                  {result.error_code && (
                    <span className="text-red-400">Mã lỗi: {result.error_code}</span>
                  )}
                </p>

                {result.transaction_code && (
                  <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-8">
                    <p className="text-slate-400 mb-2">Mã giao dịch:</p>
                    <p className="text-cyan-400 font-mono text-lg">{result.transaction_code}</p>
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => navigate(`/booking/${result.booking_id || ''}`)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                  >
                    Thử lại thanh toán
                  </button>
                  <button
                    onClick={() => navigate('/my-bookings')}
                    className="px-6 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-all duration-300 border border-white/10"
                  >
                    Quay lại danh sách
                  </button>
                </div>

                <p className="text-slate-500 text-sm mt-6">
                  Đang chuyển hướng tự động trong 3 giây...
                </p>
              </div>
            )}

            {/* Invalid State */}
            {!result && !loading && (
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Trạng thái không hợp lệ
                </h1>
                <p className="text-xl text-slate-400 mb-8">
                  Không thể xác định kết quả thanh toán.
                </p>
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                >
                  Quay lại danh sách đặt chỗ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

