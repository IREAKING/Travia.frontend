import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from './Loading';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  // Kiểm tra user có tồn tại và có đầy đủ thông tin cần thiết
  if (!user || !user.id || !user.email || !user.role) {
    console.warn('User not authenticated or incomplete user data:', user);
    // Redirect to login page but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn('User role not allowed:', user.role, 'Allowed roles:', allowedRoles);
    // User doesn't have permission
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

