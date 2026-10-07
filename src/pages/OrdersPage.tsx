import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, RefreshCw, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderApi } from '../api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

export const OrdersPage: React.FC = () => {
  useDocumentTitle('My Orders | WallArt');
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const { addItem, openCart } = useCartStore();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  // Cancel order modal state
  const [selectedOrderToCancel, setSelectedOrderToCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getOrders(token || undefined);
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate, token]);

  const getOrderStatus = (ord: any): string => {
    return (ord.orderStatus || ord.status || 'PENDING').toLowerCase();
  };

  const filteredOrders = orders.filter((ord) => {
    if (filter === 'all') return true;
    const st = getOrderStatus(ord);
    if (filter === 'processing') return ['processing', 'pending', 'confirmed', 'placed'].includes(st);
    if (filter === 'shipped') return ['shipped', 'out_for_delivery'].includes(st);
    if (filter === 'delivered') return st === 'delivered';
    if (filter === 'cancelled') return ['cancelled', 'canceled'].includes(st);
    return true;
  });

  const handleReorder = (item: any) => {
    const fallbackProduct: any = {
      id: String(item.productId || item.id || `p-${Date.now()}`),
      name: item.title || item.name || 'Wall Art Print',
      price: item.unitPrice || item.price || 49.99,
      images: [item.imageUrl || item.images?.[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80'],
      slug: item.slug || 'art-print',
      category: 'Home Decor',
    };
    addItem(fallbackProduct, { quantity: 1 });
    toast.success(`Added ${fallbackProduct.name} back to cart!`);
    openCart();
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderToCancel) return;
    if (!cancelReason.trim()) {
      toast.error('Please specify a reason for cancellation');
      return;
    }

    setIsCancelling(true);
    const orderIdToCancel = selectedOrderToCancel.orderId || selectedOrderToCancel.id;
    try {
      await orderApi.cancel(orderIdToCancel, cancelReason.trim(), token || undefined);
      toast.success('Order cancelled successfully');
      setSelectedOrderToCancel(null);
      setCancelReason('');
      await fetchOrders();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to cancel order';
      toast.error(errMsg);
    } finally {
      setIsCancelling(false);
    }
  };

  const isCancellable = (ord: any): boolean => {
    const st = getOrderStatus(ord);
    return ['pending', 'placed', 'confirmed', 'processing'].includes(st);
  };

  return (
    <div className="bg-warm-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            { label: 'My Account', href: '/account' },
            { label: 'Order History' },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-charcoal">Order History</h1>
            <p className="text-xs text-charcoal/60 mt-1">
              Track recent shipments and review past bespoke purchases.
            </p>
          </div>
          <Link
            to="/shop"
            className="px-5 py-2.5 bg-terracotta text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-terracotta-dark transition self-start sm:self-auto"
          >
            Start New Order
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'processing', 'shipped', 'delivered', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition capitalize ${
                filter === status
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-charcoal/70 hover:bg-stone-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div className="p-12 text-center text-xs text-charcoal/60 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-terracotta" />
            Loading your orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 max-w-md mx-auto">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-serif font-bold text-charcoal mb-1">No Orders Found</h3>
            <p className="text-xs text-charcoal/60 mb-4">You have no orders matching this filter.</p>
            <Link
              to="/shop"
              className="inline-block px-5 py-2 bg-charcoal text-white text-xs font-semibold rounded-lg hover:bg-charcoal/90 transition"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((ord, idx) => {
              const statusStr = getOrderStatus(ord);
              const orderId = ord.orderId || ord.id || idx;
              const orderNumber = ord.orderNumber || `HM-${orderId}`;
              const totalVal = ord.totalAmount ?? ord.total ?? 0;
              const createdAt = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent';
              const itemsList = Array.isArray(ord.items) ? ord.items : [];

              return (
                <div
                  key={orderId}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs"
                >
                  {/* Order Top Bar */}
                  <div className="bg-stone-50 p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-6">
                      <div>
                        <span className="text-charcoal/60 block text-[10px] uppercase font-bold tracking-wider">
                          Order Placed
                        </span>
                        <span className="font-semibold text-charcoal">{createdAt}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/60 block text-[10px] uppercase font-bold tracking-wider">
                          Total Amount
                        </span>
                        <span className="font-serif font-bold text-charcoal">
                          ₹{Number(totalVal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-charcoal/60 block text-[10px] uppercase font-bold tracking-wider">
                          Order Number
                        </span>
                        <span className="font-mono font-bold text-charcoal">{orderNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          statusStr === 'delivered'
                            ? 'bg-forest/10 text-forest'
                            : statusStr === 'shipped'
                            ? 'bg-amber-500/10 text-amber-600'
                            : statusStr === 'cancelled' || statusStr === 'canceled'
                            ? 'bg-red-500/10 text-red-600'
                            : 'bg-charcoal/10 text-charcoal'
                        }`}
                      >
                        {statusStr}
                      </span>
                      <Link
                        to={`/track-order?orderNumber=${encodeURIComponent(orderNumber)}`}
                        className="px-3.5 py-1.5 rounded-lg bg-charcoal text-white text-xs font-semibold hover:bg-charcoal/90 transition flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" /> Track Package
                      </Link>

                      {isCancellable(ord) && (
                        <button
                          type="button"
                          onClick={() => setSelectedOrderToCancel(ord)}
                          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="p-4 sm:p-6 divide-y divide-stone-100">
                    {itemsList.map((item: any, itemIdx: number) => {
                      const itemName = item.title || item.name || 'Wall Art Print';
                      const itemImg = item.imageUrl || item.images?.[0] || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&q=80';
                      const itemPrice = item.unitPrice ?? item.price ?? 0;
                      const itemQty = item.quantity || 1;

                      return (
                        <div key={item.orderItemId || item.id || itemIdx} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                          <img
                            src={itemImg}
                            alt={itemName}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-beige border border-stone-200 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-serif font-bold text-charcoal text-sm sm:text-base truncate block">
                              {itemName}
                            </h4>
                            <p className="text-xs text-charcoal/60 mt-0.5">
                              Qty: {itemQty} &bull; Unit: ₹{Number(itemPrice).toLocaleString('en-IN')}
                            </p>
                            <div className="text-xs font-bold text-terracotta mt-1">
                              ₹{Number((item.lineTotal ?? (itemPrice * itemQty))).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={() => handleReorder(item)}
                              className="px-3.5 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-charcoal hover:border-terracotta hover:text-terracotta transition flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" /> Buy Again
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {selectedOrderToCancel && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-stone-200 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="font-serif font-bold text-lg text-charcoal">Cancel Order</h3>
            </div>
            <p className="text-xs text-charcoal/70 mb-4 leading-relaxed">
              Are you sure you want to cancel order{' '}
              <strong className="text-charcoal font-mono">
                {selectedOrderToCancel.orderNumber || selectedOrderToCancel.id}
              </strong>
              ? This action cannot be undone.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Ordered by mistake, found another piece, change of plans..."
                  className="w-full text-xs p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-terracotta outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => {
                    setSelectedOrderToCancel(null);
                    setCancelReason('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal/70 hover:bg-stone-100 transition"
                >
                  Nevermind
                </button>
                <button
                  type="submit"
                  disabled={isCancelling}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cancelling...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
