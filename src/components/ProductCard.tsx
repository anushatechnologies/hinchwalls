import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, className = '', viewMode = 'grid' }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const navigate = useNavigate();

  const isWishlisted = wishlistStore.isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = wishlistStore.toggle(product);
    toast(added ? '❤️ Added to wishlist' : '💔 Removed from wishlist', {
      duration: 2000,
      style: { background: '#2c2c2c', color: '#faf8f5', fontSize: '14px' },
    });
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingToCart(true);
    await new Promise((r) => setTimeout(r, 400));
    cartStore.addItem(product, { size: product.sizes?.[0], quantity: 1 });
    cartStore.openCart();
    toast.success('Added to cart!', {
      style: { background: '#2c2c2c', color: '#faf8f5', fontSize: '14px' },
    });
    setAddingToCart(false);
  };

  const discountPct = product.discount || (product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : (product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0));

  const displayImage = isHovered && product.hoverImage && !imgError
    ? product.hoverImage
    : (product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/400x533?text=Product');

  return (
    <div
      className={`group relative flex flex-col bg-white rounded-xl overflow-hidden border border-border/50 hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="relative overflow-hidden block bg-beige aspect-[3/4]">
        <img
          src={imgError ? 'https://via.placeholder.com/400x533?text=WallArt' : displayImage}
          alt={product.name}
          onError={() => setImgError(true)}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/5 transition-all duration-300" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {product.isSale && discountPct > 0 && (
            <span className="badge-sale">{discountPct}% OFF</span>
          )}
          {product.isNew && !product.isSale && (
            <span className="badge-new">NEW</span>
          )}
          {product.isBestSeller && !product.isSale && !product.isNew && (
            <span className="badge bg-amber-100 text-amber-700">BEST SELLER</span>
          )}
        </div>

        {/* Wishlist & Quick View */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlistToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-soft ${
              isWishlisted
                ? 'bg-terracotta text-white'
                : 'bg-white text-charcoal hover:bg-terracotta hover:text-white'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); navigate(`/product/${product.slug}`); }}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-white transition-colors shadow-soft"
            aria-label="Quick view"
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Quick Add Button */}
        <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleQuickAdd}
            disabled={addingToCart || !product.inStock}
            className="w-full py-3 bg-charcoal text-white text-xs font-semibold tracking-wider hover:bg-charcoal/85 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {addingToCart ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </span>
            ) : !product.inStock ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingBag size={14} />
                QUICK ADD
              </>
            )}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product.slug}`}>
          <p className="text-xs text-text-secondary capitalize mb-1">{product.category.replace(/-/g, ' ')}</p>
          <h3 className="text-sm font-semibold text-charcoal line-clamp-2 hover:text-terracotta transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <span className="font-semibold text-charcoal text-sm">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-xs text-text-light line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
