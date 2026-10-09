import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Package, TrendingUp, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const SellerDashboard: React.FC = () => {
  useDocumentTitle('Seller Portal | HinchMart');
  const { user } = useAuthStore();

  return (
    <div className="bg-stone-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-stone-900">
                  Seller Portal
                </h1>
                <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Verified Merchant
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Store ID: #{user?.sellerId || 'SEL-8812'} &bull; Managed by {user?.name || user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition"
            >
              View Storefront
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-500">Total Products</span>
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">24</p>
            <span className="text-[11px] text-emerald-600 font-medium">All in stock & active</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-500">Active Orders</span>
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">8</p>
            <span className="text-[11px] text-orange-600 font-medium">3 pending dispatch</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-500">Monthly Volume</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">₹1,48,200</p>
            <span className="text-[11px] text-emerald-600 font-medium">+18% vs last month</span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-stone-500">Merchant Rating</span>
              <DollarSign className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-stone-900">4.9 / 5.0</p>
            <span className="text-[11px] text-stone-500">Based on 142 reviews</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
