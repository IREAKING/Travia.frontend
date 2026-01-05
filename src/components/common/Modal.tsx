import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Modal = ({ isOpen, onClose, children, showCloseButton = true }: ModalProps) => {
  // Close on Escape key and prevent background scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const preventScroll = (e: WheelEvent | TouchEvent) => {
      // Chỉ ngăn scroll nếu scroll ở backdrop (không phải trong modal content)
      const target = e.target as HTMLElement;
      const modalContent = target.closest('.modal-content-scrollable');
      if (!modalContent) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Ngăn scroll trên backdrop
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
      
      // Restore body scroll
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-transparent rounded-3xl shadow-2xl animate-scale-in overflow-hidden flex flex-col">
        {/* Content - không có background vì ReviewForm đã có */}
        <div className="relative flex flex-col max-h-[90vh]">
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-3 bg-slate-900/80 backdrop-blur-sm text-white hover:bg-slate-800 rounded-full transition-all duration-200 shadow-lg border border-white/10 hover:border-white/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Body - scrollable */}
          <div 
            className="modal-content-scrollable overflow-y-auto overflow-x-hidden max-h-[90vh] pr-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(148, 163, 184, 0.5) transparent',
            }}
          >
            <style>{`
              .modal-content-scrollable::-webkit-scrollbar {
                width: 8px;
              }
              .modal-content-scrollable::-webkit-scrollbar-track {
                background: rgba(15, 23, 42, 0.3);
                border-radius: 4px;
              }
              .modal-content-scrollable::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, rgba(251, 191, 36, 0.6), rgba(20, 184, 166, 0.6));
                border-radius: 4px;
              }
              .modal-content-scrollable::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(180deg, rgba(251, 191, 36, 0.8), rgba(20, 184, 166, 0.8));
              }
            `}</style>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  buttonText?: string;
}

export const SuccessModal = ({ isOpen, onClose, title = 'Thành công', message, buttonText = 'Đóng' }: SuccessModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} showCloseButton={false}>
      <div className="text-center py-4">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full animate-pulse opacity-50" />
          <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Message */}
        <p className="text-lg text-white mb-8">{message}</p>

        {/* Button */}
        <button
          onClick={onClose}
          className="relative px-8 py-4 overflow-hidden rounded-xl font-bold text-white transition-all duration-500 group"
        >
          {/* Animated gradient border */}
          <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 rounded-xl" />
          <span className="absolute inset-[2px] bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {buttonText}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        </button>
      </div>
    </Modal>
  );
};

