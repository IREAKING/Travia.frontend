import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const SupplierSidebar = () => {
  const location = useLocation();
  const [isTourMenuOpen, setIsTourMenuOpen] = useState(false);

  // Auto-expand tour menu if current path is within tours section
  useEffect(() => {
    if (location.pathname.startsWith('/supplier/tours')) {
      setIsTourMenuOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    {
      name: 'Đặt Chỗ',
      path: '/supplier/bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Đánh Giá',
      path: '/supplier/reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      name: 'Doanh Thu',
      path: '/supplier/revenue',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: 'Hồ Sơ Công Ty',
      path: '/supplier/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      name: 'Cài Đặt',
      path: '/supplier/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const tourSubItems = [
    {
      name: 'Danh Sách Tours',
      path: '/supplier/tours',
    },
    {
      name: 'Tạo Tour Mới',
      path: '/supplier/tours/create',
    },
  ];

  const isTourActive = location.pathname.startsWith('/supplier/tours');

  return (
    <nav className="px-3 space-y-1">
      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
        Quản Lý Partner
      </div>
      
      {/* Dashboard */}
      <NavLink
        to="/supplier/dashboard"
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 font-medium border border-cyan-400/30'
              : 'text-gray-300 hover:bg-white/10 hover:text-cyan-300 focus:bg-white/10 focus:text-cyan-300'
          }`
        }
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Dashboard</span>
      </NavLink>

      {/* Quản Lý Tours - Collapsible Menu */}
      <div>
        <button
          onClick={() => setIsTourMenuOpen(!isTourMenuOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
            isTourActive
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 font-medium border border-cyan-400/30'
              : 'text-gray-300 hover:bg-white/10 hover:text-cyan-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Quản Lý Tours</span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isTourMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isTourMenuOpen && (
          <div className="ml-8 mt-1 space-y-1">
            {tourSubItems.map((subItem) => (
              <NavLink
                key={subItem.path}
                to={subItem.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 font-medium border border-cyan-400/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-cyan-300'
                  }`
                }
              >
                <span className="w-2 h-2 rounded-full bg-current opacity-50"></span>
                <span>{subItem.name}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Other menu items */}
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 font-medium border border-cyan-400/30'
                : 'text-gray-300 hover:bg-white/10 hover:text-cyan-300 focus:bg-white/10 focus:text-cyan-300'
            }`
          }
        >
          {item.icon}
          <span>{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

