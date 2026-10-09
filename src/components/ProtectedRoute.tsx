import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../types';
import { PageSkeleton } from './Skeletons';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requireProfileComplete?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requireProfileComplete = false,
  children,
}) => {
  const { user, isAuthenticated, isInitializing } = useAuthStore();
  const location = useLocation();

  // 1. Wait until authentication initialization completes to prevent redirect flashes
  if (isInitializing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <PageSkeleton />
      </div>
    );
  }

  // 2. Redirect unauthenticated users to login, preserving intended path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Check role authorization against backend-verified user role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || 'CUSTOMER') as UserRole;
    if (!allowedRoles.includes(userRole)) {
      return (
        <Navigate
          to="/access-denied"
          state={{
            from: location,
            requiredRoles: allowedRoles,
            currentRole: userRole,
          }}
          replace
        />
      );
    }
  }

  // 4. Check profile completion if required
  if (requireProfileComplete && user.isProfileComplete === false) {
    if (location.pathname !== '/complete-profile') {
      return <Navigate to="/complete-profile" state={{ from: location }} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
