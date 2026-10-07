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

            {/* Fallback to All Categories Showcase */}
            <Route path="*" element={<Navigate to="/category/all" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
