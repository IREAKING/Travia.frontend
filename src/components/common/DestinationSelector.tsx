import React, { useState, useEffect, useMemo } from 'react';
import { supplierTourService, type Destination } from '../../services/supplierTourService';

interface DestinationSelectorProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  value,
  onChange,
  placeholder = "Chọn điểm đến",
  className = "input-field"
}) => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  // const [total, setTotal] = useState(0);

  const limit = 20;

  // Load initial destinations
  useEffect(() => {
    loadDestinations(true);
  }, []);

  // Load destinations with search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        loadDestinations(true);
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadDestinations = async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const newOffset = reset ? 0 : offset;
      const result = await supplierTourService.getDestinationsPaginated({
        limit,
        offset: newOffset,
        search: searchQuery
      });

      if (reset) {
        setDestinations(result.destinations);
        setOffset(limit);
      } else {
        setDestinations(prev => [...prev, ...result.destinations]);
        setOffset(prev => prev + limit);
      }
      
      // setTotal(result.total);
      setHasMore(result.destinations.length === limit);
    } catch (error) {
      console.error('Error loading destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadDestinations(false);
    }
  };

  // Filter destinations based on search
  const filteredDestinations = useMemo(() => {
    if (!searchQuery) return destinations;
    return destinations.filter(dest => 
      dest.ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.khu_vuc?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [destinations, searchQuery]);

  const selectedDestination = destinations.find(dest => dest.id === value);

  return (
    <div className="relative">
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`${className} text-left flex justify-between items-center`}
      >
        <span className={selectedDestination ? 'text-gray-900' : 'text-gray-500'}>
          {selectedDestination ? selectedDestination.ten : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Tìm kiếm điểm đến..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Results */}
          <div className="max-h-48 overflow-y-auto">
            {filteredDestinations.length === 0 && !loading ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                {searchQuery ? 'Không tìm thấy điểm đến' : 'Không có điểm đến nào'}
              </div>
            ) : (
              <>
                {filteredDestinations.map((destination) => (
                  <button
                    key={destination.id}
                    type="button"
                    onClick={() => {
                      onChange(destination.id);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex justify-between items-center ${
                      value === destination.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{destination.ten}</div>
                      {destination.khu_vuc && (
                        <div className="text-xs text-gray-500">{destination.khu_vuc}</div>
                      )}
                    </div>
                    {value === destination.id && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loading}
                    className="w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Đang tải...' : 'Tải thêm'}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="p-3 text-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
