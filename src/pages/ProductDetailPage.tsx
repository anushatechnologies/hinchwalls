import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Eye,
  Sliders,
  Maximize2,
  HelpCircle,
  Clock,
  Sparkle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi } from '../api';
import type { Product, ProductSize, ProductColor, Review } from '../types';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useRecentlyViewedStore } from '../store/recentlyViewedStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import StarRating from '../components/StarRating';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import { PageSkeleton } from '../components/Skeletons';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customText, setCustomText] = useState('');
  const [customFont, setCustomFont] = useState('font-serif');
  const [openAccordion, setOpenAccordion] = useState<string>('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [showRoomPreview, setShowRoomPreview] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // New review form
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');

  // Stores
  const { addItem, openCart } = useCartStore();
  const { isInWishlist, toggle: toggleWishlist } = useWishlistStore();
  const { items: recentlyViewed, add: addToRecentlyViewed } = useRecentlyViewedStore();

  useDocumentTitle(product ? product.name : 'Product Details');

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const found = (await productApi.getBySlug(slug)) || (await productApi.getById(slug));
        if (found) {
          // Normalize images array if backend provides single imageUrl
          if ((!found.images || found.images.length === 0) && found.imageUrl) {
            found.images = [found.imageUrl];
          }
          setProduct(found);
          setSelectedImageIndex(0);
          setSelectedSize(found.sizes && found.sizes.length > 0 ? found.sizes[0] : null);
          setSelectedColor(found.colors && found.colors.length > 0 ? found.colors[0] : null);
          setQuantity(1);
          setCustomText('');
          addToRecentlyViewed(found);

          const [related, revs] = await Promise.all([
            productApi.getRelated(found.id, found.category, 4),
            productApi.getReviews(found.id),
          ]);
          setRelatedProducts(related);
          setReviews(revs);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold text-charcoal mb-4">Product Not Found</h2>
        <p className="text-charcoal/70 mb-8 max-w-md mx-auto">
          We couldn't find the product you're looking for. It may have been relocated or is currently out of stock.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center px-8 py-3 bg-terracotta text-white font-medium rounded-full hover:bg-terracotta-dark transition-colors shadow-md"
        >
          Explore All Wall Decals
        </Link>
      </div>
    );
  }

  const currentUnitPrice = product.price + (selectedSize?.priceModifier || 0);
  const totalPrice = (currentUnitPrice * quantity).toFixed(2);
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product, {
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity,
      customText: product.isCustomizable ? customText : undefined,
    });
    toast.success(`Added ${product.name} to your cart!`);
    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 400);
  };

  const handleBuyNow = () => {
    addItem(product, {
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      quantity,
      customText: product.isCustomizable ? customText : undefined,
    });
    navigate('/checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor || !newReviewTitle || !newReviewComment) {
      toast.error('Please fill in all review fields.');
      return;
    }

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      author: newReviewAuthor,
      rating: newReviewRating,
      title: newReviewTitle,
      comment: newReviewComment,
      verified: true,
      helpful: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setReviews([newRev, ...reviews]);
    setShowReviewModal(false);
    setNewReviewAuthor('');
    setNewReviewTitle('');
    setNewReviewComment('');
    setNewReviewRating(5);
    toast.success('Thank you! Your review has been submitted.');
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const roomMockupImages = [
    { name: 'Living Room', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Modern Bedroom', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Nursery / Kids Room', url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80' },
  ];

  return (
    <div className="bg-warm-white min-h-screen pb-20">
      {/* Top Breadcrumb navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            { label: product.category, href: `/shop?category=${encodeURIComponent(product.category)}` },
            { label: product.name },
          ]}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
          
          {/* ================= LEFT: IMAGES & VISUALIZER ================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-col-reverse md:flex-row gap-4">
              {/* Thumbnails */}
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[550px] pb-2 md:pb-0 scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImageIndex(idx);
                      setShowRoomPreview(false);
                    }}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImageIndex === idx && !showRoomPreview
                        ? 'border-terracotta ring-2 ring-terracotta/20 scale-102'
                        : 'border-stone-200 hover:border-charcoal/30 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                
                {/* Room Preview Toggle Button */}
                <button
                  type="button"
                  onClick={() => setShowRoomPreview(!showRoomPreview)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 flex flex-col items-center justify-center p-1 text-center flex-shrink-0 transition-all ${
                    showRoomPreview
                      ? 'border-terracotta bg-terracotta/10 text-terracotta font-semibold'
                      : 'border-dashed border-stone-300 text-charcoal/70 hover:border-terracotta hover:text-terracotta'
                  }`}
                  title="View on Real Wall"
                >
                  <Eye className="w-5 h-5 mb-1" />
                  <span className="text-[10px] leading-tight">Wall Preview</span>
                </button>
              </div>

              {/* Main Display Stage */}
              <div className="flex-1 relative rounded-2xl overflow-hidden bg-beige/40 border border-stone-200/70 shadow-sm aspect-square max-h-[580px] group">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                  {product.isBestSeller && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Best Seller
                    </span>
                  )}
                  {product.isSale && (
                    <span className="px-3 py-1 bg-terracotta text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      Save {product.discount || 20}%
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-3 py-1 bg-forest text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
                      New Arrival
                    </span>
                  )}
                  {product.isCustomizable && (
                    <span className="px-3 py-1 bg-charcoal text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      Customizable
                    </span>
                  )}
                </div>

                {/* Top Right Actions */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2.5 bg-white/90 backdrop-blur-md rounded-full text-charcoal hover:text-terracotta hover:bg-white shadow-sm transition-all"
                    title="Share product"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      toggleWishlist(product);
                      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
                    }}
                    className={`p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-sm transition-all ${
                      isWishlisted ? 'text-terracotta bg-red-50' : 'text-charcoal hover:text-terracotta hover:bg-white'
                    }`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-terracotta' : ''}`} />
                  </button>
                </div>

                {/* Normal Image or Live Wall Room Preview */}
                {!showRoomPreview ? (
                  <div
                    className="w-full h-full cursor-crosshair overflow-hidden relative"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                  >
                    <img
                      src={product.images[selectedImageIndex] || product.images[0]}
                      alt={product.name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80';
                      }}
                      className={`w-full h-full object-cover transition-transform duration-200 ${
                        isZoomed ? 'scale-150' : 'scale-100'
                      }`}
                      style={
                        isZoomed
                          ? {
                              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                            }
                          : undefined
                      }
                    />

                    {/* Customizable Live Overlay Preview if text entered */}
                    {product.isCustomizable && customText && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                        <div
                          className={`text-2xl md:text-3xl font-bold drop-shadow-md text-center px-4 py-2 rounded ${customFont}`}
                          style={{ color: selectedColor ? selectedColor.hex : '#2c2c2c' }}
                        >
                          "{customText}"
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 bg-charcoal/60 text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 backdrop-blur-xs pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-3 h-3" /> Hover to zoom
                    </div>
                  </div>
                ) : (
                  /* Wall Preview Mockup */
                  <div className="w-full h-full relative bg-stone-900 flex items-center justify-center overflow-hidden">
                    <img
                      src={roomMockupImages[0].url}
                      alt="Room background preview"
                      className="w-full h-full object-cover opacity-85"
                    />
                    {/* Simulated wall decal projection */}
                    <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                      <div className="w-48 md:w-64 max-h-48 drop-shadow-2xl transition-all duration-300">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain filter drop-shadow-lg opacity-95"
                          style={{
                            mixBlendMode: 'multiply',
                            filter: selectedColor ? `drop-shadow(0 4px 6px rgba(0,0,0,0.3))` : undefined,
                          }}
                        />
                        {product.isCustomizable && customText && (
                          <div
                            className={`text-xl font-bold text-center mt-2 ${customFont}`}
                            style={{ color: selectedColor ? selectedColor.hex : '#2c2c2c' }}
                          >
                            {customText}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="absolute top-4 left-4 bg-charcoal/80 text-white text-xs px-3 py-1.5 rounded-md backdrop-blur-sm">
                      Interactive Wall Visualizer
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRoomPreview(false)}
                      className="absolute bottom-4 right-4 bg-white text-charcoal text-xs font-semibold px-3 py-1.5 rounded-full shadow hover:bg-stone-100 transition"
                    >
                      Close Visualizer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Guarantees and USPs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-200">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50">
                <Sparkle className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span className="text-xs font-medium text-charcoal/90 leading-tight">Peel & Stick Ready</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50">
                <RotateCcw className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span className="text-xs font-medium text-charcoal/90 leading-tight">100% Damage-Free</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50">
                <ShieldCheck className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span className="text-xs font-medium text-charcoal/90 leading-tight">Non-Toxic Matte Vinyl</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-stone-50">
                <Truck className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span className="text-xs font-medium text-charcoal/90 leading-tight">Free Shipping ₹200+</span>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: PRODUCT DETAILS & CONFIG ================= */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Category & Tags */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs uppercase tracking-widest font-semibold text-terracotta hover:underline"
              >
                {product.category}
              </Link>
              <span className="text-xs text-charcoal/50 font-mono">SKU: {product.sku}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Reviews jump link */}
            <div className="flex items-center gap-3 mt-2.5 pb-4 border-b border-stone-200">
              <StarRating
                rating={product.rating}
                totalReviews={product.reviewCount}
                showNumber
                size="md"
              />
              <span className="text-xs text-charcoal/40">•</span>
              <a
                href="#reviews"
                className="text-xs font-medium text-terracotta hover:underline"
              >
                Read all {reviews.length || product.reviewCount} reviews
              </a>
            </div>

            {/* Pricing Section */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-serif font-bold text-charcoal">
                ₹{totalPrice}
              </span>
              {product.originalPrice && (
                <span className="text-lg text-charcoal/40 line-through">
                  ₹{((product.originalPrice + (selectedSize?.priceModifier || 0)) * quantity).toFixed(2)}
                </span>
              )}
              {product.isSale && (
                <span className="text-xs font-bold text-forest bg-forest/10 px-2 py-0.5 rounded">
                  Save {product.discount || 20}%
                </span>
              )}
            </div>

            <p className="text-xs text-charcoal/60 mt-1">
              or 3 monthly interest-free payments of ₹{(Number(totalPrice) / 3).toFixed(2)} with{' '}
              <span className="font-semibold text-charcoal">UPI</span> or <span className="font-semibold text-charcoal">Razorpay</span>
            </p>

            {/* Short Description */}
            <p className="text-sm text-charcoal/80 mt-4 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* ================= CONFIGURATORS ================= */}
            <div className="mt-6 space-y-5 pt-4 border-t border-stone-200">
              
              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                      Select Size: <span className="text-terracotta font-normal">{selectedSize?.label}</span>
                    </label>
                    <span className="text-xs text-charcoal/50">{selectedSize?.value}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize?.id === size.id;
                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`p-2.5 rounded-xl border text-left transition-all relative ${
                            isSelected
                              ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta text-charcoal'
                              : 'border-stone-200 hover:border-charcoal/40 bg-white text-charcoal/80'
                          }`}
                        >
                          <div className="text-xs font-semibold">{size.label}</div>
                          <div className="text-[11px] text-charcoal/60">{size.value}</div>
                          {size.priceModifier > 0 && (
                            <div className="text-[10px] text-terracotta font-medium mt-0.5">
                              +₹{size.priceModifier.toFixed(2)}
                            </div>
                          )}
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-terracotta absolute top-2 right-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block mb-2">
                    Matte Vinyl Color:{' '}
                    <span className="text-terracotta font-normal">{selectedColor?.name}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = selectedColor?.id === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`group relative flex items-center justify-center p-0.5 rounded-full border-2 transition-all ${
                            isSelected
                              ? 'border-terracotta scale-110 shadow-sm'
                              : 'border-transparent hover:scale-105'
                          }`}
                          title={color.name}
                        >
                          <span
                            className="w-7 h-7 rounded-full shadow-inner border border-black/10 flex items-center justify-center"
                            style={{ backgroundColor: color.hex }}
                          >
                            {isSelected && (
                              <Check
                                className={`w-3.5 h-3.5 ${
                                  ['#FFFFFF', '#FAF8F5', '#F5E6D3'].includes(color.hex.toUpperCase())
                                    ? 'text-charcoal'
                                    : 'text-white'
                                }`}
                              />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Customizable Text Input (If enabled) */}
              {product.isCustomizable && (
                <div className="p-4 rounded-xl bg-beige/50 border border-stone-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-terracotta" />
                      Personalization / Custom Text:
                    </label>
                    <span className="text-[11px] text-charcoal/60">Max 30 chars</span>
                  </div>
                  <input
                    type="text"
                    maxLength={30}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="e.g. The Miller Family / Oliver"
                    className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-lg text-sm text-charcoal placeholder:text-stone-400 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-charcoal/70">Font Style:</span>
                    <button
                      type="button"
                      onClick={() => setCustomFont('font-serif')}
                      className={`px-2.5 py-1 text-xs rounded border transition ${
                        customFont === 'font-serif'
                          ? 'border-terracotta bg-white font-serif font-bold text-terracotta'
                          : 'border-stone-200 bg-white/70 font-serif'
                      }`}
                    >
                      Classic Serif
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomFont('font-sans')}
                      className={`px-2.5 py-1 text-xs rounded border transition ${
                        customFont === 'font-sans'
                          ? 'border-terracotta bg-white font-sans font-bold text-terracotta'
                          : 'border-stone-200 bg-white/70 font-sans'
                      }`}
                    >
                      Modern Clean
                    </button>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block mb-2">
                  Quantity
                </label>
                <div className="inline-flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2.5 text-charcoal/70 hover:text-charcoal hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-white transition"
                    title="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-charcoal">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-charcoal/70 hover:text-charcoal hover:bg-stone-50 transition"
                    title="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-terracotta text-white font-semibold text-sm hover:bg-terracotta-dark shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isAdding ? 'Adding to Cart...' : 'Add to Cart'}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-xl bg-charcoal text-white font-semibold text-sm hover:bg-charcoal-light shadow-md transition-all active:scale-[0.99]"
                >
                  Buy Now
                </button>
              </div>

              {/* Stock info */}
              <div className="flex items-center gap-2 text-xs text-forest pt-1">
                <span className="w-2 h-2 rounded-full bg-forest animate-pulse"></span>
                <span>In Stock — Handcrafted and ready to dispatch within 24-48 hours.</span>
              </div>
            </div>

            {/* ================= ACCORDION TABS ================= */}
            <div className="mt-8 border-t border-stone-200 divide-y divide-stone-200">
              {/* Tab 1: Description */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}
                  className="w-full flex items-center justify-between text-left font-serif font-bold text-charcoal text-base"
                >
                  <span>Product Details & Specifications</span>
                  {openAccordion === 'description' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'description' && (
                  <div className="mt-3 text-sm text-charcoal/80 space-y-2 leading-relaxed">
                    <p>{product.description}</p>
                    <ul className="list-disc list-inside space-y-1 pt-2 text-xs text-charcoal/70">
                      <li>Premium matte finish eliminates glare and looks like painted art</li>
                      <li>Precision die-cut without transparent borders or backgrounds</li>
                      <li>Safe for smooth interior walls, glass, wood, mirror, and finished furniture</li>
                      <li>Easy 3-step peel, stick, and smooth application</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Tab 2: Installation */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'install' ? '' : 'install')}
                  className="w-full flex items-center justify-between text-left font-serif font-bold text-charcoal text-base"
                >
                  <span>How to Apply & Remove</span>
                  {openAccordion === 'install' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'install' && (
                  <div className="mt-3 text-sm text-charcoal/80 space-y-2.5 leading-relaxed">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-terracotta/20 text-terracotta text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <p className="text-xs"><strong>Clean Surface:</strong> Wipe down wall with a dry cloth to remove dust. Allow newly painted walls to cure 2-3 weeks.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-terracotta/20 text-terracotta text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <p className="text-xs"><strong>Peel & Position:</strong> Gently peel backing paper and position sticker on wall using painter's tape if needed.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-terracotta/20 text-terracotta text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <p className="text-xs"><strong>Smooth & Enjoy:</strong> Firmly squeegee from center outwards. To remove later, simply warm with a hair dryer and peel gently at a 45° angle with zero residue.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tab 3: Shipping & Returns */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                  className="w-full flex items-center justify-between text-left font-serif font-bold text-charcoal text-base"
                >
                  <span>Shipping & Hassle-Free Returns</span>
                  {openAccordion === 'shipping' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="mt-3 text-sm text-charcoal/80 space-y-2 text-xs leading-relaxed">
                    <p><strong>Standard Shipping:</strong> 3-5 business days. Free on orders over ₹200.</p>
                    <p><strong>30-Day Love It Guarantee:</strong> If you're not completely in love with your wall decals, return them within 30 days for a full replacement or refund.</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ================= REVIEWS SECTION ================= */}
        <div id="reviews" className="mt-20 pt-10 border-t border-stone-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-charcoal">Customer Reviews</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <StarRating rating={product.rating} size="lg" showNumber />
                <span className="text-sm text-charcoal/60">
                  Based on {reviews.length || product.reviewCount} verified reviews
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="px-6 py-2.5 bg-charcoal text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-charcoal-light transition shadow-sm self-start md:self-auto"
            >
              Write a Review
            </button>
          </div>

          {/* Review List */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
              <p className="text-sm text-charcoal/60 italic py-6">
                Be the first to write a review for this decal!
              </p>
            ) : (
              reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal text-sm">{rev.author}</span>
                      {rev.verified && (
                        <span className="text-[11px] bg-forest/10 text-forest px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-charcoal/40">{rev.createdAt}</span>
                  </div>
                  <StarRating rating={rev.rating} size="sm" />
                  <h4 className="font-semibold text-charcoal text-sm mt-2">{rev.title}</h4>
                  <p className="text-sm text-charcoal/80 mt-1 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ================= RELATED PRODUCTS ================= */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-stone-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold text-charcoal">Complete the Look</h2>
                <p className="text-sm text-charcoal/60 mt-1">
                  Complementary designs curated to match this decor style.
                </p>
              </div>
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="text-xs font-bold text-terracotta hover:underline uppercase tracking-wider"
              >
                View Category →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ================= RECENTLY VIEWED ================= */}
        {recentlyViewed.length > 1 && (
          <div className="mt-20 pt-10 border-t border-stone-200">
            <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recentlyViewed
                .filter((p) => p.id !== product.id)
                .slice(0, 5)
                .map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Write a Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-serif font-bold text-charcoal mb-4">Write a Review</h3>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Your Rating</label>
                <StarRating
                  rating={newReviewRating}
                  interactive
                  onRatingChange={setNewReviewRating}
                  size="lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  placeholder="e.g. Sarah M."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={newReviewTitle}
                  onChange={(e) => setNewReviewTitle(e.target.value)}
                  placeholder="e.g. Looks stunning in my nursery!"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Review Details</label>
                <textarea
                  required
                  rows={4}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Tell us about the quality, installation ease, and visual finish..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-sm text-charcoal hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-terracotta text-white rounded-lg text-sm font-semibold hover:bg-terracotta-dark"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
