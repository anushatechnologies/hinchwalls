import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Heart,
  MapPin,
  Truck,
  LogOut,
  User,
  Settings,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { orderApi } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

export const AccountPage: React.FC = () => {
  useDocumentTitle('My Account | WallArt');
  const navigate = useNavigate();

  const { user, isAuthenticated, logout, updateProfile } = useAuthStore();
  const { items: wishlistItems } = useWishlistStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Edit profile state
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    async function loadOrders() {
      try {
        const ords = await orderApi.getOrders();
        setOrders(ords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [isAuthenticated, navigate]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ firstName, lastName, phone });
    toast.success('Profile details updated successfully');
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="bg-warm-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb items={[{ label: 'My Account' }]} />

        {/* User Hero Banner */}
        <div className="mt-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-terracotta text-white font-serif font-bold text-2xl flex items-center justify-center shadow-md">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-charcoal">
                  Hello, {user.firstName}!
                </h1>
                <span className="text-xs bg-forest/10 text-forest font-semibold px-2 py-0.5 rounded-full">
                  WallArt VIP
                </span>
              </div>
              <p className="text-xs text-charcoal/60 mt-0.5">{user.email}</p>
              <div className="flex items-center gap-4 text-xs text-charcoal/70 mt-2 font-medium">
                <span>Orders: <strong>{orders.length || user.orderCount}</strong></span>
                <span>•</span>
                <span>Wishlist: <strong>{wishlistItems.length}</strong> items</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-charcoal/70 hover:text-red-600 hover:border-red-200 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <Link
            to="/orders"
            className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-terracotta hover:shadow-md transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-beige flex items-center justify-center text-charcoal group-hover:text-terracotta transition mb-3">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-serif font-bold text-charcoal">My Orders</div>
              <div className="text-xs text-charcoal/60 mt-0.5">View history & invoices</div>
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-terracotta hover:shadow-md transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-beige flex items-center justify-center text-charcoal group-hover:text-terracotta transition mb-3">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-serif font-bold text-charcoal">Wishlist</div>
              <div className="text-xs text-charcoal/60 mt-0.5">{wishlistItems.length} saved decals</div>
            </div>
          </Link>

          <Link
            to="/addresses"
            className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-terracotta hover:shadow-md transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-beige flex items-center justify-center text-charcoal group-hover:text-terracotta transition mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-serif font-bold text-charcoal">Addresses</div>
              <div className="text-xs text-charcoal/60 mt-0.5">Manage delivery info</div>
            </div>
          </Link>

          <Link
            to="/track-order"
            className="p-5 rounded-2xl bg-white border border-stone-200/80 hover:border-terracotta hover:shadow-md transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-beige flex items-center justify-center text-charcoal group-hover:text-terracotta transition mb-3">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-serif font-bold text-charcoal">Track Package</div>
              <div className="text-xs text-charcoal/60 mt-0.5">Live shipping tracker</div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          
          {/* ================= RECENT ORDERS ================= */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-charcoal">Recent Orders</h2>
              <Link to="/orders" className="text-xs font-semibold text-terracotta hover:underline">
                View All ({orders.length}) →
              </Link>
            </div>

            {loadingOrders ? (
              <div className="p-8 text-center text-charcoal/60 text-xs">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
                <p className="text-xs text-charcoal/60">You haven’t placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    className="p-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-charcoal">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            ord.status === 'delivered'
                              ? 'bg-forest/10 text-forest'
                              : ord.status === 'shipped'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-stone-100 text-charcoal/70'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-charcoal/60 mt-1">
                        Placed on {ord.createdAt} • {ord.itemCount} items
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <span className="font-serif font-bold text-charcoal text-base">
                        ${ord.total.toFixed(2)}
                      </span>
                      <Link
                        to={`/track-order?orderNumber=${encodeURIComponent(ord.orderNumber)}`}
                        className="px-4 py-2 rounded-xl bg-stone-100 text-charcoal text-xs font-semibold hover:bg-stone-200 transition"
                      >
                        Track Status
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= EDIT PROFILE ================= */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs">
              <h2 className="text-lg font-serif font-bold text-charcoal mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-terracotta" /> Profile Information
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2 border border-stone-200 bg-stone-50 rounded-xl text-xs text-charcoal/60 cursor-not-allowed"
                  />
                  <span className="text-[10px] text-charcoal/50 mt-1 block">
                    Contact customer support to change registered email.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-charcoal text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-charcoal-light transition"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AccountPage;
