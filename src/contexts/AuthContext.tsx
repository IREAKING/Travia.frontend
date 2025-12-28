import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthResponse, LoginRequest, Supplier, UserRole } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/user';
import { supplierService } from '../services/supplierService';

interface AuthContextType {
  user: User | null;
  supplier: Supplier | null;
  loading: boolean;
  isAuthenticated: boolean;
  loginUser: (credentials: LoginRequest) => Promise<void>;
  loginAdmin: (credentials: LoginRequest) => Promise<void>;
  loginSupplier: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  updateSupplier: (supplierData: Supplier) => void;
}

// Default context value to prevent warnings during initial render
// This is used as the initial context value and will be replaced by AuthProvider
const defaultAuthContext: AuthContextType = {
  user: null,
  supplier: null,
  loading: true,
  isAuthenticated: false,
  loginUser: async () => {
    // No-op: will be replaced by AuthProvider
  },
  loginAdmin: async () => {
    // No-op: will be replaced by AuthProvider
  },
  loginSupplier: async () => {
    // No-op: will be replaced by AuthProvider
  },
  logout: async () => {
    // No-op: will be replaced by AuthProvider
  },
  updateUser: () => {
    // No-op: will be replaced by AuthProvider
  },
  updateSupplier: () => {
    // No-op: will be replaced by AuthProvider
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates if component unmounts
    
    const loadAuthData = async () => {
      try {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('user');
        const storedSupplier = localStorage.getItem('supplier');
        const accessToken = localStorage.getItem('accessToken');
        
        console.log('AuthContext: Loading from localStorage');
        console.log('storedUser:', storedUser ? 'exists' : 'missing');
        console.log('accessToken:', accessToken ? 'exists' : 'missing');
        
        // Load user data
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Parsed user:', parsedUser);
            
            // Security: Remove any sensitive fields that shouldn't be stored
            const sanitizedUser = { ...parsedUser };
            delete sanitizedUser.password;
            delete sanitizedUser.mat_khau;
            delete sanitizedUser.token;
            delete sanitizedUser.secret;
            
            // Đảm bảo user có đầy đủ thông tin cần thiết
            // Nếu có accessToken, chỉ cần id và email là đủ
            if (sanitizedUser && sanitizedUser.id && sanitizedUser.email) {
              // Nếu thiếu role nhưng có accessToken, thêm role mặc định
              if (!sanitizedUser.role && accessToken) {
                sanitizedUser.role = 'khach_hang'; // Default role
                localStorage.setItem('user', JSON.stringify(sanitizedUser));
              }
              
              if (isMounted) {
                setUser(sanitizedUser);
                console.log('✅ User loaded from localStorage');
              }
            } else {
              console.warn('Stored user data is incomplete:', sanitizedUser);
              // Nếu có accessToken nhưng user data không đầy đủ, vẫn giữ lại
              if (accessToken) {
                console.log('⚠️ Keeping incomplete user data because accessToken exists');
                if (isMounted) {
                  setUser(sanitizedUser);
                }
              } else {
                localStorage.removeItem('user');
              }
            }
          } catch (error) {
            console.error('Failed to parse stored user:', error);
            if (!accessToken) {
              localStorage.removeItem('user');
            }
          }
        } else if (accessToken) {
          // Có token nhưng không có user data - có thể do refresh page
          console.log('⚠️ AccessToken exists but no user data, user needs to refresh');
        }
        
        // Load supplier data
        if (storedSupplier) {
          try {
            const parsedSupplier = JSON.parse(storedSupplier);
            
            // Security: Remove any sensitive fields
            const sanitizedSupplier = { ...parsedSupplier };
            delete sanitizedSupplier.password;
            delete sanitizedSupplier.mat_khau;
            delete sanitizedSupplier.token;
            delete sanitizedSupplier.secret;
            
            if (sanitizedSupplier && sanitizedSupplier.id) {
              if (isMounted) {
                setSupplier(sanitizedSupplier);
              }
            } else {
              console.warn('Stored supplier data is incomplete, clearing...');
              localStorage.removeItem('supplier');
            }
          } catch (error) {
            console.error('Failed to parse stored supplier:', error);
            localStorage.removeItem('supplier');
          }
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        // Only set loading to false if component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadAuthData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for storage events to sync logout across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If accessToken is removed in another tab, logout here too
      if (e.key === 'accessToken' && !e.newValue && e.oldValue) {
        console.log('AccessToken removed in another tab, logging out...');
        setUser(null);
        setSupplier(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAuthSuccess = async (response: AuthResponse, role: UserRole) => {
    console.log('handleAuthSuccess - response:', response);
    const { user, tokens } = response;
    
    // Security: Sanitize user data before storing
    const sanitizedUser: any = { ...user };
    delete sanitizedUser.password;
    delete sanitizedUser.mat_khau;
    delete sanitizedUser.token;
    delete sanitizedUser.secret;
    
    // Store tokens in localStorage FIRST
    if (tokens) {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      console.log('✅ Tokens stored in localStorage');
    }
    
    try {
      // Nếu là nhà cung cấp, dùng GetInfoSupplier để lấy cả user và supplier info
      if (role === 'nha_cung_cap') {
        try {
          const supplierData: any = await supplierService.getInfoSupplier();
          console.log('Supplier info data:', supplierData);
          
          // Map backend response to frontend structure
          const mappedSupplierData = {
            ...supplierData,
            id: typeof supplierData.id === 'string' ? parseInt(supplierData.id) || 0 : supplierData.id,
            logo_url: supplierData.logo || supplierData.logo_url,
            trang_thai: supplierData.trang_thai || 'active',
            nam_thanh_lap: supplierData.nam_thanh_lap?.toString() || supplierData.nam_thanh_lap,
            nguoi_dung_id: supplierData.id?.toString() || user.id,
          };
          
          // Tạo user object từ supplierData (có chứa thông tin user)
          const normalizedUser = {
            ...user,
            id: mappedSupplierData.id?.toString() || user.id,
            email: mappedSupplierData.email || user.email,
            name: mappedSupplierData.ho_ten || user.name,
            full_name: mappedSupplierData.ho_ten || user.name || user.email,
            phone: mappedSupplierData.so_dien_thoai || user.phone,
            role: 'nha_cung_cap' as UserRole,
          };
          
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          setUser(normalizedUser);
          
          localStorage.setItem('supplier', JSON.stringify(mappedSupplierData));
          setSupplier(mappedSupplierData);
          
          console.log('Supplier login state set successfully');
          return;
        } catch (error) {
          console.error('Failed to fetch supplier info:', error);
          // Fallback: vẫn lưu user data từ response đăng nhập
        }
      }
      
      // Cho các role khác (khach_hang, quan_tri), lấy thông tin user như cũ
      try {
        const detailedUser = await userService.getUserById(user.id);
        
        // Normalize user data - backend sends 'name', we use 'full_name'
        // QUAN TRỌNG: Giữ lại role từ user ban đầu vì getUserById có thể không trả về role
        const normalizedUser = {
          ...detailedUser,
          id: detailedUser.id || user.id,
          email: detailedUser.email || user.email,
          name: detailedUser.name || detailedUser.full_name || user.name,
          full_name: detailedUser.full_name || detailedUser.name || user.name || user.email,
          phone: detailedUser.phone || user.phone,
          role: user.role || detailedUser.role || role, // Giữ lại role từ login response
        };
        console.log('Normalized user:', normalizedUser);
        
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        
        console.log('User state set successfully');
      } catch (detailError) {
        console.error('Failed to fetch user details:', detailError);
        // Fallback: vẫn lưu user data từ response đăng nhập
        const normalizedUser = {
          ...user,
          full_name: user.name || user.email,
          role: user.role || role, // Đảm bảo role được giữ lại
        };
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        console.log('Using fallback user data from login response');
      }
    } catch (error) {
      console.error('Failed in handleAuthSuccess:', error);
      // Final fallback: vẫn lưu user data từ response đăng nhập
      const normalizedUser = {
        ...user,
        full_name: user.name || user.email,
        role: user.role || role, // Đảm bảo role được giữ lại
      };
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      setUser(normalizedUser);
    }
  };

  const loginUser = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.loginUser(credentials);
    await handleAuthSuccess(response, 'khach_hang');
  }, []);

  const loginAdmin = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.loginAdmin(credentials);
    await handleAuthSuccess(response, 'quan_tri');
  }, []);

  const loginSupplier = useCallback(async (credentials: LoginRequest) => {
    const response = await authService.loginSupplier(credentials);
    await handleAuthSuccess(response, 'nha_cung_cap');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear state and localStorage, even if API call fails
      setUser(null);
      setSupplier(null);
      localStorage.removeItem('user');
      localStorage.removeItem('supplier');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  }, [user]);

  const updateSupplier = useCallback((supplierData: Supplier) => {
    setSupplier(supplierData);
    localStorage.setItem('supplier', JSON.stringify(supplierData));
  }, []);

  // Check authentication: user exists OR accessToken exists
  // Use useMemo to avoid recalculating on every render
  const isAuthenticated = useMemo(() => {
    if (user) return true;
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      return !!accessToken;
    }
    return false;
  }, [user]);

  const value: AuthContextType = useMemo(() => ({
    user,
    supplier,
    loading,
    isAuthenticated,
    loginUser,
    loginAdmin,
    loginSupplier,
    logout,
    updateUser,
    updateSupplier,
  }), [user, supplier, loading, isAuthenticated, loginUser, loginAdmin, loginSupplier, logout, updateUser, updateSupplier]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Context will always have a value (either default or from Provider)
  // No need to check for undefined anymore
  return context;
};

