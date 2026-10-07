import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  ArrowLeft,
  Bell,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navLinks = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Layers },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-charcoal">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-200 flex flex-col justify-between flex-shrink-0 p-5">
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-800">
            <Link to="/admin" className="font-serif text-xl font-bold tracking-tight text-white">
              Wall<span className="text-terracotta">Art</span> <span className="text-xs uppercase px-2 py-0.5 rounded bg-terracotta/20 text-terracotta font-sans font-bold">Admin</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="mt-6 space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-terracotta text-white shadow-xs'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Back to store */}
        <div className="pt-6 border-t border-stone-800">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-stone-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-forest" />
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
              WallArt Operations Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/shop"
              target="_blank"
              className="text-xs font-semibold text-charcoal/70 hover:text-terracotta flex items-center gap-1"
            >
              View Live Site <ExternalLink className="w-3 h-3" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
