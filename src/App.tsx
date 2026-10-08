import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { PageSkeleton } from './components/Skeletons';

// Scroll to top on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

// Category & Subcategory Flow Pages
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const SubcategoryPage = lazy(() => import('./pages/SubcategoryPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const ShippingReturnsPage = lazy(() => import('./pages/ShippingReturnsPage'));

export default function App() {
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
          <Route element={<MainLayout />}>
            {/* Root redirects to All Categories Showcase (All 62 Subcategories) */}
            <Route path="/" element={<Navigate to="/category/all" replace />} />
            <Route path="/category" element={<Navigate to="/category/all" replace />} />

            {/* Screen 1: Category Page */}
            <Route path="/category/:categorySlug" element={<CategoryPage />} />

            {/* Screen 2: Subcategory Page */}
            <Route path="/category/:categorySlug/:subcategorySlug" element={<SubcategoryPage />} />

            {/* Product & Store Pages */}
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/track-order" element={<OrderTrackingPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shipping-returns" element={<ShippingReturnsPage />} />

            {/* Fallback to All Categories Showcase */}
            <Route path="*" element={<Navigate to="/category/all" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
