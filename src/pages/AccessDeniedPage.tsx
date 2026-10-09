import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, UserCheck, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const AccessDeniedPage: React.FC = () => {
  useDocumentTitle('Access Denied | HinchMart');
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const state = location.state as { requiredRoles?: string[]; currentRole?: string } | undefined;
  const currentRole = state?.currentRole || user?.role || 'CUSTOMER';
  const requiredRoles = state?.requiredRoles || ['ADMIN'];

  return (
    <div className="bg-stone-50 min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          Access Denied
        </h1>

        <p className="text-xs text-stone-600 mb-6 leading-relaxed">
          You do not have the required permissions to access this area. This section requires{' '}
          <strong className="text-stone-900">{requiredRoles.join(' or ')}</strong> privileges, but your
          account is registered with role <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-orange-600 font-bold">{currentRole}</span>.
        </p>

        {user && (
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-left mb-6 text-xs text-stone-700">
            <div className="flex items-center gap-2 font-bold text-stone-900 mb-1">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Signed In As:</span>
            </div>
            <p className="text-stone-800 font-semibold">{user.name || user.email}</p>
            <p className="text-stone-500">{user.email || user.phone}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to={currentRole === 'ADMIN' ? '/admin' : currentRole === 'SELLER' ? '/seller/dashboard' : '/account'}
            className="w-full py-3 px-4 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-700 shadow-sm transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Your Portal
          </Link>

          <Link
            to="/"
            className="w-full py-3 px-4 bg-stone-100 text-stone-800 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-200 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Storefront
          </Link>

          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 text-stone-500 hover:text-red-600 text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Switch Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
