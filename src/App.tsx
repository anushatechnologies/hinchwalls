import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { PageSkeleton } from './components/Skeletons';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

// Scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

// Store & Category Flow Pages
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SubcategoryPage = lazy(() => import('./pages/SubcategoryPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ShippingReturnsPage = lazy(() => import('./pages/ShippingReturnsPage'));
const AccessDeniedPage = lazy(() => import('./pages/AccessDeniedPage'));
const ProfileCompletionPage = lazy(() => import('./pages/ProfileCompletionPage'));

// Seller Portal Pages
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));

// Admin Portal Pages
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

export default function App() {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-4 py-12">
            <PageSkeleton />
          </div>
        }
      >
        <Routes>
          {/* Main Storefront Layout */}
          <Route element={<MainLayout />}>
            {/* Root redirects to All Categories Showcase */}
            <Route path="/" element={<Navigate to="/category/all" replace />} />
            <Route path="/category" element={<Navigate to="/category/all" replace />} />

            {/* Public Catalog Routes */}
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/category/:categorySlug/:subcategorySlug" element={<SubcategoryPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shipping-returns" element={<ShippingReturnsPage />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />

            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/access-denied" element={<AccessDeniedPage />} />

            {/* Protected Profile Completion Route */}
            <Route
              element={<ProtectedRoute allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']} />}
            >
              <Route path="/complete-profile" element={<ProfileCompletionPage />} />
            </Route>

            {/* Protected Customer Routes */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['CUSTOMER', 'SELLER', 'ADMIN']}
                  requireProfileComplete={true}
                />
              }
            >
              <Route path="/account" element={<AccountPage />} />
              <Route path="/addresses" element={<AddressesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>

            {/* Protected Seller Routes */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={['SELLER', 'ADMIN']}
                  requireProfileComplete={true}
                />
              }
            >
              <Route path="/seller/dashboard" element={<SellerDashboard />} />
              <Route path="/seller/products" element={<SellerDashboard />} />
              <Route path="/seller/orders" element={<SellerDashboard />} />
              <Route path="/seller/profile" element={<SellerDashboard />} />
            </Route>
          </Route>

          {/* Protected Admin Portal Layout & Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>

          {/* Fallback to All Categories Showcase */}
          <Route path="*" element={<Navigate to="/category/all" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
