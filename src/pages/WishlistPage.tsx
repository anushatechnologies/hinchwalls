import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlistStore } from '../store/wishlistStore';
import { useCartStore } from '../store/cartStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';

export const WishlistPage: React.FC = () => {
  useDocumentTitle('My Wishlist | WallArt');
  const { items, clear } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const handleAddAllToCart = () => {
    items.forEach((prod) => {
      addItem(prod, { quantity: 1 });
    });
    toast.success(`Added ${items.length} items to your cart!`);
    openCart();
  };

  return (
    <div className="bg-warm-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb items={[{ label: 'Wishlist' }]} />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-charcoal">
              My Saved Wall Art ({items.length})
            </h1>
            <p className="text-xs text-charcoal/60 mt-1">
              Keep track of designs you love and add them to your cart whenever you're ready.
            </p>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="px-5 py-2.5 bg-terracotta text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-terracotta-dark shadow-sm transition flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" /> Move All to Cart
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Clear all items from your wishlist?')) {
                    clear();
                    toast.success('Wishlist cleared');
                  }
                }}
                className="px-4 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold text-charcoal/70 hover:text-red-600 transition"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-stone-200 shadow-xs">
            <div className="w-16 h-16 bg-red-50 text-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-charcoal/70 mb-6 leading-relaxed">
              Explore our wide range of botanical, geometric, nursery, and modern decals and click the heart icon on any design to save it here.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-terracotta text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-terracotta-dark transition shadow-md"
            >
              Explore Wall Art <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
