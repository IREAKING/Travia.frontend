import React, { useState, useEffect, useRef } from 'react';
import { supplierTourService, type Destination } from '../../services/supplierTourService';

interface CascadingDestinationSelectorProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export const CascadingDestinationSelector: React.FC<CascadingDestinationSelectorProps> = ({
  value: _value,
  onChange,
  placeholder = "Chọn điểm đến",
  className = "input-field"
}) => {
  const [countries, setCountries] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<Destination[]>([]);
  const [cities, setCities] = useState<Destination[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Use ref to store onChange callback to avoid infinite loops
  const onChangeRef = useRef(onChange);

  // Update ref when onChange changes
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoadingCountries(true);
      try {
        const countriesData = await supplierTourService.getCountries();
        console.log('Countries loaded:', countriesData);
        setCountries(countriesData);
      } catch (error) {
        console.error('Error loading countries:', error);
      } finally {
        setLoadingCountries(false);
      }
    };
    
    loadCountries();
  }, []);

  // Load provinces when country changes
  useEffect(() => {
    if (selectedCountry) {
      const loadProvinces = async () => {
        setLoadingProvinces(true);
        try {
          const provincesData = await supplierTourService.getProvincesByCountry(selectedCountry);
          setProvinces(provincesData);
        } catch (error) {
          console.error('Error loading provinces:', error);
        } finally {
          setLoadingProvinces(false);
        }
      };
      
      loadProvinces();
      
      // Reset province and city selections
      setSelectedProvince('');
      setSelectedCity('');
      setCities([]);
    }
  }, [selectedCountry]);

  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      const loadCities = async () => {
        setLoadingCities(true);
        try {
          const citiesData = await supplierTourService.getCitiesByProvince(selectedProvince);
          setCities(citiesData);
        } catch (error) {
          console.error('Error loading cities:', error);
        } finally {
          setLoadingCities(false);
        }
      };
      
      loadCities();
      
      // Reset city selection
      setSelectedCity('');
    }
  }, [selectedProvince]);

  // Update final value when city changes (call parent onChange)
  useEffect(() => {
    if (selectedCity) {
      const cityId = parseInt(selectedCity);
      onChangeRef.current(cityId);
    }
  }, [selectedCity]);

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  // Get display text for selected destination
  const getDisplayText = () => {
    if (selectedCity && cities.length > 0) {
      const city = cities.find(c => c.id.toString() === selectedCity);
      return city ? `${city.ten} - ${selectedProvince} - ${selectedCountry}` : placeholder;
    }
    return placeholder;
  };

  return (
    <div className="space-y-3">
      {/* Country Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quốc Gia *
        </label>
        <select
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value)}
          className={`${className} ${loadingCountries ? 'opacity-50' : ''}`}
          disabled={loadingCountries}
        >
          <option value="">Chọn quốc gia</option>
          {countries.map((country, index) => (
            <option key={index} value={country}>
              {country}
            </option>
          ))}
        </select>
        {loadingCountries && (
          <div className="mt-1 text-xs text-gray-500">Đang tải...</div>
        )}
      </div>

      {/* Province Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tỉnh/Thành Phố *
        </label>
        <select
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className={`${className} ${loadingProvinces || !selectedCountry ? 'opacity-50' : ''}`}
          disabled={loadingProvinces || !selectedCountry}
        >
          <option value="">Chọn tỉnh/thành phố</option>
          {provinces.map(province => (
            <option key={province.id} value={province.ten || ''}>
              {province.ten}
            </option>
          ))}
        </select>
        {loadingProvinces && (
          <div className="mt-1 text-xs text-gray-500">Đang tải...</div>
        )}
        {!selectedCountry && (
          <div className="mt-1 text-xs text-gray-500">Vui lòng chọn quốc gia trước</div>
        )}
      </div>

      {/* City Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Thành Phố/Quận/Huyện *
        </label>
        <select
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          className={`${className} ${loadingCities || !selectedProvince ? 'opacity-50' : ''}`}
          disabled={loadingCities || !selectedProvince}
        >
          <option value="">Chọn thành phố/quận/huyện</option>
          {cities.map(city => (
            <option key={city.id} value={city.id.toString()}>
              {city.ten}
            </option>
          ))}
        </select>
        {loadingCities && (
          <div className="mt-1 text-xs text-gray-500">Đang tải...</div>
        )}
        {!selectedProvince && (
          <div className="mt-1 text-xs text-gray-500">Vui lòng chọn tỉnh/thành phố trước</div>
        )}
      </div>

      {/* Selected Destination Display */}
      {selectedCity && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-medium text-green-800">Điểm đến đã chọn:</div>
          <div className="text-sm text-green-700">{getDisplayText()}</div>
        </div>
      )}
    </div>
  );
};
