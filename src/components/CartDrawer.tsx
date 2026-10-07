import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export default function CartDrawer() {
  const cartStore = useCartStore();
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getShipping, getTotal, couponCode } = cartStore;
  const subtotal = getSubtotal();
  const shipping = getShipping();
  const freeShippingThreshold = 200;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remaining = Math.max(freeShippingThreshold - subtotal, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-charcoal/40 backdrop-blur-sm" onClick={closeCart} />

      {/* Drawer */}
      <div className="w-full max-w-md bg-white flex flex-col h-full animate-slide-in-right shadow-large">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} />
            <h2 className="font-semibold text-charcoal">Your Cart</h2>
            <span className="badge bg-charcoal text-white ml-1">
              {cartStore.getItemCount()}
            </span>
          </div>
          <button onClick={closeCart} className="p-1.5 hover:bg-beige rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Free Shipping Bar */}
        {remaining > 0 && (
          <div className="px-5 py-3 bg-beige/50 border-b border-border">
            <p className="text-xs text-text-secondary mb-1.5">
              You're <strong className="text-terracotta">${remaining.toFixed(2)}</strong> away from free shipping!
            </p>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-terracotta rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        {remaining === 0 && (
          <div className="px-5 py-3 bg-forest/10 border-b border-forest/20 text-xs text-forest font-medium text-center">
            🎉 You qualify for FREE shipping!
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-5">
              <div className="w-20 h-20 bg-beige rounded-full flex items-center justify-center">
                <ShoppingBag size={32} className="text-text-light" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-charcoal mb-1">Your cart is empty</p>
                <p className="text-sm text-text-secondary">Add some beautiful wall art to get started!</p>
              </div>
              <button onClick={closeCart}>
                <Link to="/shop" className="btn-primary">
                  Browse Products
                </Link>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="p-4 flex gap-3">
                  <Link to={`/product/${item.product.slug}`} onClick={closeCart}>
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-beige"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.product.slug}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-charcoal hover:text-terracotta transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    {item.selectedSize && (
                      <p className="text-xs text-text-secondary mt-0.5">
                        Size: {item.selectedSize.label}
                      </p>
                    )}
                    {item.selectedColor && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <div
                          className="w-3 h-3 rounded-full border border-border"
                          style={{ background: item.selectedColor.hex }}
                        />
                        <span className="text-xs text-text-secondary">{item.selectedColor.name}</span>
                      </div>
                    )}
                    {item.customText && (
                      <p className="text-xs text-text-secondary mt-0.5 italic">"{item.customText}"</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity */}
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-beige transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center hover:bg-beige transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Price */}
                      <span className="text-sm font-semibold text-charcoal">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-text-light hover:text-red-500 transition-colors self-start"
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-5 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {couponCode && (
                <div className="flex justify-between text-sm text-forest">
                  <span>Coupon ({couponCode})</span>
                  <span>-{cartStore.couponDiscount}%</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-text-secondary">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-forest font-medium">FREE</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-semibold text-charcoal pt-1.5 border-t border-border">
                <span>Total</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-primary w-full text-center flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight size={16} />
            </Link>
            <Link
              to="/cart"
              onClick={closeCart}
              className="block text-center text-sm text-text-secondary hover:text-charcoal transition-colors"
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
