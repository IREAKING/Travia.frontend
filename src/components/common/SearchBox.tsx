import { useState, useRef, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchToursParams } from '../../types';

interface SearchBoxProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export const SearchBox = ({ 
  onSearch, 
  placeholder = "Tìm kiếm tour, điểm đến...",
  className = "",
  variant = "dark"
}: SearchBoxProps) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/tours?search=${encodeURIComponent(query)}`);
      }
    }
  };

  const isDark = variant === 'dark';

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-28 py-4 text-lg rounded-xl transition-all duration-300 ${
            isDark
              ? 'bg-white/5 border-2 border-white/10 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-gray-500'
              : 'bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-gray-900 placeholder-gray-400'
          } focus:outline-none shadow-lg`}
        />
        <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25"
        >
          Tìm kiếm
        </button>
      </div>
    </form>
  );
};

// Hero Search Box - larger variant for homepage
export const HeroSearchBox = ({ variant = 'dark' }: { variant?: 'light' | 'dark' }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (location) params.append('location', location);
    navigate(`/tours?${params.toString()}`);
  };

  const isDark = variant === 'dark';

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`rounded-2xl shadow-2xl p-6 backdrop-blur-xl border ${
        isDark 
          ? 'bg-gray-900/80 border-white/10' 
          : 'bg-white/90 border-gray-200'
      }`}
    >
      <div className="grid md:grid-cols-3 gap-4">
        {/* Search keyword */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Tìm kiếm
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tên tour, hoạt động..."
              className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-2 border-white/10 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-gray-500'
                  : 'bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-gray-900 placeholder-gray-400'
              } focus:outline-none`}
            />
            <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Điểm đến
          </label>
          <div className="relative">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Hà Nội, Đà Nẵng..."
              className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 ${
                isDark
                  ? 'bg-white/5 border-2 border-white/10 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-gray-500'
                  : 'bg-white border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-gray-900 placeholder-gray-400'
              } focus:outline-none`}
            />
            <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Search button */}
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Tìm kiếm
          </button>
        </div>
      </div>
    </form>
  );
};

// Duration options for tour search
const DURATION_OPTIONS = [
  { label: 'Tất cả', value: '', min: undefined, max: undefined },
  { label: '1-2 ngày', value: '1-2', min: 1, max: 2 },
  { label: '3-4 ngày', value: '3-4', min: 3, max: 4 },
  { label: '4-5 ngày', value: '4-5', min: 4, max: 5 },
  { label: '5-7 ngày', value: '5-7', min: 5, max: 7 },
  { label: '1 tuần+', value: '7+', min: 7, max: undefined },
];

interface AdvancedSearchBoxProps {
  onSearch: (params: SearchToursParams) => void;
  initialParams?: SearchToursParams;
  variant?: 'light' | 'dark';
  className?: string;
}

export const AdvancedSearchBox = ({
  onSearch,
  initialParams = {},
  variant = 'dark',
  className = '',
}: AdvancedSearchBoxProps) => {
  const [query, setQuery] = useState(initialParams.query || '');
  const [destination, setDestination] = useState(initialParams.diem_den_ten || '');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [customDays, setCustomDays] = useState({ min: '', max: '' });
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isDark = variant === 'dark';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDurationDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDurationLabel = () => {
    if (showCustomInput && (customDays.min || customDays.max)) {
      if (customDays.min && customDays.max) {
        return `${customDays.min}-${customDays.max} ngày`;
      } else if (customDays.min) {
        return `Từ ${customDays.min} ngày`;
      } else if (customDays.max) {
        return `Đến ${customDays.max} ngày`;
      }
    }
    const option = DURATION_OPTIONS.find(opt => opt.value === selectedDuration);
    return option?.label || 'Thời gian';
  };

  const handleDurationSelect = (option: typeof DURATION_OPTIONS[0]) => {
    setSelectedDuration(option.value);
    setShowCustomInput(false);
    setCustomDays({ min: '', max: '' });
    setShowDurationDropdown(false);
  };

  const handleCustomInputToggle = () => {
    setShowCustomInput(true);
    setSelectedDuration('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    let soNgayMin: number | undefined;
    let soNgayMax: number | undefined;

    if (showCustomInput) {
      soNgayMin = customDays.min ? parseInt(customDays.min) : undefined;
      soNgayMax = customDays.max ? parseInt(customDays.max) : undefined;
    } else if (selectedDuration) {
      const option = DURATION_OPTIONS.find(opt => opt.value === selectedDuration);
      soNgayMin = option?.min;
      soNgayMax = option?.max;
    }

    onSearch({
      query: query.trim() || undefined,
      diem_den_ten: destination.trim() || undefined,
      so_ngay_min: soNgayMin,
      so_ngay_max: soNgayMax,
    });
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className={`rounded-2xl shadow-2xl p-6 backdrop-blur-xl border ${
        isDark 
          ? 'bg-slate-900/90 border-white/10' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="grid md:grid-cols-4 gap-4">
          {/* Search keyword */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Tìm kiếm
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tên tour, hoạt động..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 border-2 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-500'
                    : 'bg-white border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-900 placeholder-gray-400'
                } focus:outline-none`}
              />
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Location/Destination */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Điểm đến
            </label>
            <div className="relative">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Hà Nội, Đà Nẵng..."
                className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 border-2 border-white/10 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-gray-500'
                    : 'bg-white border-2 border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 text-gray-900 placeholder-gray-400'
                } focus:outline-none`}
              />
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Duration Filter */}
          <div ref={dropdownRef}>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Thời gian
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                className={`w-full pl-10 pr-10 py-3 rounded-xl text-left transition-all duration-300 ${
                  isDark
                    ? 'bg-white/5 border-2 border-white/10 hover:border-cyan-500/30 text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-cyan-500/50 text-gray-900'
                } focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20`}
              >
                <span className={!selectedDuration && !showCustomInput ? (isDark ? 'text-gray-500' : 'text-gray-400') : ''}>
                  {getDurationLabel()}
                </span>
              </button>
              <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-transform ${showDurationDropdown ? 'rotate-180' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              {showDurationDropdown && (
                <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden border ${
                  isDark 
                    ? 'bg-slate-800 border-white/10' 
                    : 'bg-white border-gray-200'
                }`}>
                  {/* Preset Options */}
                  {DURATION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleDurationSelect(option)}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        selectedDuration === option.value && !showCustomInput
                          ? isDark
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-cyan-50 text-cyan-600'
                          : isDark
                            ? 'hover:bg-white/5 text-gray-300'
                            : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                  
                  {/* Divider */}
                  <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
                  
                  {/* Custom Input Toggle */}
                  <button
                    type="button"
                    onClick={handleCustomInputToggle}
                    className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-2 ${
                      showCustomInput
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-cyan-50 text-cyan-600'
                        : isDark
                          ? 'hover:bg-white/5 text-gray-300'
                          : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Tùy chỉnh
                  </button>
                  
                  {/* Custom Input Fields */}
                  {showCustomInput && (
                    <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={customDays.min}
                          onChange={(e) => setCustomDays(prev => ({ ...prev, min: e.target.value }))}
                          placeholder="Từ"
                          className={`w-20 px-3 py-2 rounded-lg text-center text-sm ${
                            isDark
                              ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          } focus:outline-none focus:border-cyan-500`}
                        />
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>-</span>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={customDays.max}
                          onChange={(e) => setCustomDays(prev => ({ ...prev, max: e.target.value }))}
                          placeholder="Đến"
                          className={`w-20 px-3 py-2 rounded-lg text-center text-sm ${
                            isDark
                              ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500'
                              : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400'
                          } focus:outline-none focus:border-cyan-500`}
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ngày</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search button */}
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
