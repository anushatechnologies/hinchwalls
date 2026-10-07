import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

export const CartPage: React.FC = () => {
  useDocumentTitle('Shopping Cart | WallArt');
  const navigate = useNavigate();

  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getShipping,
    getTax,
    getTotal,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const total = getTotal();
  const discountAmount = ((subtotal * couponDiscount) / 100);

  const freeShippingThreshold = 200;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = await applyCoupon(promoInput.trim());
    if (success) {
      toast.success(`Coupon code ${promoInput.toUpperCase()} applied!`);
      setPromoInput('');
    } else {
      toast.error('Invalid coupon code. Try SAVE10, SAVE20, or WALLART15');
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-warm-white min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 shadow-sm">
          <div className="w-20 h-20 bg-beige rounded-full flex items-center justify-center mx-auto mb-6 text-terracotta">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-charcoal/70 mb-8 leading-relaxed">
            Looks like you haven't added any beautiful wall decals yet. Explore our curated collections to find your perfect statement piece.
          </p>
          <div className="space-y-3">
            <Link
              to="/shop"
              className="block w-full py-3.5 px-6 bg-terracotta text-white font-semibold text-sm rounded-xl hover:bg-terracotta-dark shadow-md transition"
            >
              Browse All Wall Art
            </Link>
            <Link
              to="/customize"
              className="block w-full py-3.5 px-6 bg-beige text-charcoal font-semibold text-sm rounded-xl hover:bg-stone-200 transition"
            >
              Build a Custom Decal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            { label: 'Shopping Cart' },
          ]}
        />

        <div className="flex items-baseline justify-between mt-4 mb-6">
          <h1 className="text-3xl font-serif font-bold text-charcoal">
            Shopping Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to empty your cart?')) {
                clearCart();
                toast.success('Cart cleared');
              }
            }}
            className="text-xs font-semibold text-charcoal/50 hover:text-red-600 transition"
          >
            Clear Cart
          </button>
        </div>

        {/* Free shipping progress bar */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 mb-8 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-charcoal mb-2">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-terracotta" />
              {remainingForFreeShipping === 0 ? (
                <span className="text-forest font-bold">
                  🎉 You unlocked FREE US Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-terracotta">${remainingForFreeShipping.toFixed(2)}</strong> more to get <strong>FREE Shipping</strong>
                </span>
              )}
            </span>
            <span>{Math.round(progressToFreeShipping)}%</span>
          </div>
          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-terracotta to-forest transition-all duration-500 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT: CART ITEMS ================= */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-xs">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  {/* Thumbnail */}
                  <Link
                    to={`/product/${item.product.slug}`}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-beige flex-shrink-0 border border-stone-200/80 group"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between h-full w-full">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/product/${item.product.slug}`}
                          className="font-serif font-bold text-charcoal hover:text-terracotta transition text-base sm:text-lg"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(item.id);
                            toast.success('Item removed from cart');
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg hover:bg-stone-50 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Selected options */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-charcoal/70">
                        {item.selectedSize && (
                          <span className="px-2.5 py-0.5 rounded-md bg-stone-100 font-medium">
                            Size: {item.selectedSize.label}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-stone-100 font-medium">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            Color: {item.selectedColor.name}
                          </span>
                        )}
                      </div>

                      {/* Custom text preview */}
                      {item.customText && (
                        <div className="mt-2 text-xs bg-beige/60 p-2 rounded-lg text-charcoal border border-stone-200">
                          <span className="font-semibold text-terracotta">Custom Lettering: </span>
                          "{item.customText}"
                        </div>
                      )}
                    </div>

                    {/* Quantity & Price Row */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-charcoal/60 hover:text-charcoal hover:bg-white rounded-l-lg transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-charcoal">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-charcoal/60 hover:text-charcoal hover:bg-white rounded-r-lg transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-serif font-bold text-charcoal">
                          ${item.totalPrice.toFixed(2)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[11px] text-charcoal/50">
                            ${item.unitPrice.toFixed(2)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions / Order Notes */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                Order Notes / Gift Message (Optional)
              </label>
              <textarea
                rows={2}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Include a gift message or special delivery instructions..."
                className="w-full p-3 border border-stone-300 rounded-xl text-xs text-charcoal focus:outline-none focus:border-terracotta resize-none"
              />
            </div>
          </div>

          {/* ================= RIGHT: ORDER SUMMARY ================= */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-xs">
              <h2 className="text-xl font-serif font-bold text-charcoal mb-5">
                Order Summary
              </h2>

              {/* Promo Code Box */}
              <form onSubmit={handleApplyPromo} className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Promo / Coupon Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="e.g. SAVE10"
                      className="w-full px-3.5 py-2.5 uppercase text-xs font-semibold border border-stone-300 rounded-xl focus:outline-none focus:border-terracotta"
                    />
                    <Tag className="w-3.5 h-3.5 text-stone-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-charcoal text-white rounded-xl text-xs font-semibold hover:bg-charcoal-light transition"
                  >
                    Apply
                  </button>
                </div>

                {couponCode && (
                  <div className="mt-2 flex items-center justify-between text-xs bg-forest/10 text-forest px-3 py-1.5 rounded-lg">
                    <span className="font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Code {couponCode} applied ({couponDiscount}% off)
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-stone-500 hover:text-red-500 text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <div className="text-[11px] text-charcoal/50 mt-1">
                  Try codes: <span className="font-mono text-charcoal">SAVE10</span>, <span className="font-mono text-charcoal">SAVE20</span>, or <span className="font-mono text-charcoal">WALLART15</span>
                </div>
              </form>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-4 border-t border-stone-100 text-sm">
                <div className="flex justify-between text-charcoal/80">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-forest font-medium">
                    <span>Coupon Discount ({couponDiscount}%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-charcoal/80">
                  <span>Estimated Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-forest font-semibold">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-charcoal/80">
                  <span>Estimated Sales Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-4 border-t border-stone-200 text-charcoal">
                  <span className="font-serif font-bold text-lg">Total</span>
                  <span className="font-serif font-bold text-2xl text-terracotta">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full mt-6 py-4 rounded-2xl bg-terracotta text-white font-bold text-sm uppercase tracking-wider hover:bg-terracotta-dark shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/shop"
                className="block text-center text-xs font-semibold text-charcoal/70 hover:text-terracotta transition mt-4"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3">
              <div className="flex items-center gap-3 text-xs text-charcoal/80">
                <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0" />
                <span>Bank-grade 256-Bit SSL Encrypted Checkout</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-charcoal/80">
                <RotateCcw className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span>30-Day Hassle-Free Returns & Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-charcoal/80">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>100% Non-Toxic & Wall-Safe Matte Vinyl</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
