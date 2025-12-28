// Loading component cơ bản
export const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <div className="text-center">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-cyan-500 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="text-gray-400 font-medium">Đang tải...</p>
      </div>
    </div>
  );
};

// LoadingSpinner với nhiều kiểu khác nhau
export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default',
  text = '',
  className = ''
}: { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'dots' | 'pulse' | 'wave' | 'bounce';
  text?: string;
  className?: string;
}) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  }[size];

  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }[size];

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-bounce ${
                  size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
                }`}
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClass} bg-gradient-to-r from-amber-500 to-orange-500 rounded-full animate-pulse shadow-lg shadow-amber-500/30`}></div>
        );

      case 'wave':
        return (
          <div className="flex space-x-1 items-end">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-gradient-to-t from-amber-500 to-cyan-500 rounded-full animate-pulse"
                style={{ 
                  height: `${(i + 1) * 6}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              ></div>
            ))}
          </div>
        );

      case 'bounce':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`bg-gradient-to-r from-amber-500 to-cyan-500 rounded-full animate-bounce shadow-lg shadow-amber-500/20 ${
                  size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
                }`}
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
        );

      default:
        return (
          <div className="relative">
            <div className={`${sizeClass} border-4 border-gray-700 border-t-amber-500 rounded-full animate-spin`}></div>
            <div className={`absolute inset-0 ${sizeClass} border-4 border-transparent border-r-cyan-500 rounded-full animate-spin`} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {renderSpinner()}
      {text && (
        <p className={`mt-3 text-gray-400 font-medium ${textSizeClass}`}>
          {text}
        </p>
      )}
    </div>
  );
};

// Loading overlay cho toàn màn hình
export const LoadingOverlay = ({ 
  text = 'Đang tải...',
  variant = 'default'
}: {
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'wave' | 'bounce';
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-xl">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative text-center">
        <LoadingSpinner size="xl" variant={variant} />
        <p className="mt-6 text-xl font-semibold text-white">{text}</p>
      </div>
    </div>
  );
};

// Loading skeleton cho cards
export const LoadingSkeleton = ({ 
  type = 'card',
  count = 1 
}: {
  type?: 'card' | 'text' | 'image' | 'list';
  count?: number;
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded-lg w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded-lg w-1/2 mb-4"></div>
            <div className="h-40 bg-gray-700 rounded-xl mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-4 bg-gray-700 rounded-lg w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded-lg w-1/4"></div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-700 rounded-lg w-full"></div>
            <div className="h-4 bg-gray-700 rounded-lg w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded-lg w-4/6"></div>
          </div>
        );

      case 'image':
        return (
          <div className="animate-pulse">
            <div className="h-64 bg-gray-700 rounded-xl"></div>
          </div>
        );

      case 'list':
        return (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-3 bg-gray-800/30 rounded-xl border border-white/5">
                <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded-lg w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded-lg w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

// Loading cho charts
export const ChartLoading = () => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded-lg w-1/3 mb-4"></div>
      <div className="h-4 bg-gray-700 rounded-lg w-1/2 mb-6"></div>
      <div className="h-64 bg-gray-700 rounded-xl"></div>
    </div>
  </div>
);

// Loading cho buttons
export const ButtonLoading = ({ 
  size = 'md',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size];

  return (
    <div className={`animate-spin ${sizeClass} border-2 border-white/30 border-t-white rounded-full ${className}`}></div>
  );
};

// Loading cho form
export const FormLoading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded-lg w-1/4"></div>
      <div className="h-12 bg-gray-700 rounded-xl"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded-lg w-1/3"></div>
      <div className="h-12 bg-gray-700 rounded-xl"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded-lg w-1/2"></div>
      <div className="h-32 bg-gray-700 rounded-xl"></div>
    </div>
    <div className="h-12 bg-gray-700 rounded-xl w-1/4"></div>
  </div>
);

// Loading cho table
export const TableLoading = ({ rows = 5 }: { rows?: number }) => (
  <div className="animate-pulse">
    <div className="h-12 bg-gray-700 rounded-xl mb-4"></div>
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-14 bg-gray-800/50 rounded-xl border border-white/5"></div>
      ))}
    </div>
  </div>
);
