import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Home } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Page Not Found | WallArt');

  return (
    <div className="bg-warm-white min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-xs">
        <span className="text-6xl font-serif font-bold text-terracotta block mb-2">404</span>
        <h1 className="text-2xl font-serif font-bold text-charcoal mb-3">
          Page Not Found
        </h1>
        <p className="text-xs text-charcoal/70 mb-8 leading-relaxed">
          The wall decor page or collection you are looking for may have been moved or is no longer available.
        </p>
        <div className="space-y-3">
          <Link
            to="/"
            className="w-full py-3.5 px-6 bg-terracotta text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-terracotta-dark shadow-md transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" /> Return to Homepage
          </Link>
          <Link
            to="/shop"
            className="w-full py-3.5 px-6 bg-stone-100 text-charcoal font-semibold text-xs uppercase tracking-wider rounded-xl hover:bg-stone-200 transition flex items-center justify-center gap-2"
          >
            Browse All Wall Decals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
