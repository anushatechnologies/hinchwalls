import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronDown,
  Filter,
  ShoppingBag,
  Heart,
  Star,
  Check,
  RotateCcw,
  SlidersHorizontal,
  PackageCheck,
  Grid2X2,
  List,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';
import { subcategoryApi, categoryApi, productApi } from '../api';
import type { Subcategory, Product, SubcategoryCardItem } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { ProductCardSkeleton } from '../components/Skeletons';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
];

export const SubcategoryPage: React.FC = () => {
  const { categorySlug = 'interior', subcategorySlug = '' } = useParams<{
    categorySlug: string;
    subcategorySlug: string;
  }>();

  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
  const [siblingSubcategories, setSiblingSubcategories] = useState<SubcategoryCardItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [page, setPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Cart & Wishlist Stores
  const cartStore = useCartStore();
  const wishlistStore = useWishlistStore();
  const [addingId, setAddingId] = useState<string | number | null>(null);

  const subcategoryName = subcategory?.name || subcategorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const categoryTitle = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  useDocumentTitle(`${subcategoryName} | ${categoryTitle} Catalog | HinchWall`);

  // STEP 4: Fetch Subcategory metadata and sibling subcategories
  useEffect(() => {
    let isMounted = true;
    async function initSubcategory() {
      try {
        // Fetch subcategory details by slug
        const sub = await subcategoryApi.getBySlug(subcategorySlug);
        if (isMounted && sub) {
          setSubcategory(sub);
        }

        // Fetch sibling subcategories for quick switcher (website-visible only)
        const catRes = await categoryApi.getBySlug(categorySlug);
        if (isMounted && catRes?.subcategories) {
          const validSubs = (catRes.subcategories as SubcategoryCardItem[]).filter(
            (s) => s.active !== false && s.visibleOnWebsite !== false
          );
          setSiblingSubcategories(validSubs);
          if (!sub) {
            const found = validSubs.find((s) => s.slug === subcategorySlug);
            if (found) {
              setSubcategory({
                subcategoryId: Number(found.subcategoryId),
                categoryId: Number(found.categoryId),
                name: found.name,
                slug: found.slug,
                imageUrl: found.imageUrl,
                productCount: found.productCount,
                active: true,
                visibleOnWebsite: true,
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load subcategory metadata', err);
      }
    }

    initSubcategory();
    return () => {
      isMounted = false;
    };
  }, [categorySlug, subcategorySlug]);

  // STEP 5: Fetch Products for Subcategory (GET /api/products?categoryId={catId}&subcategoryId={subId})
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setLoading(true);
      try {
        let subId = subcategory?.subcategoryId;
        let catId = subcategory?.categoryId;

        if (!subId && subcategorySlug) {
          const resolved = await subcategoryApi.getBySlug(subcategorySlug);
          if (resolved) {
            subId = resolved.subcategoryId;
            catId = resolved.categoryId;
            if (isMounted && !subcategory) {
              setSubcategory(resolved);
            }
          }
        }

        const res = await productApi.getAll({
          categoryId: catId,
          subcategoryId: subId,
          subcategory: !subId ? subcategorySlug : undefined,
          category: !catId ? categorySlug : undefined,
          brand: selectedBrand !== 'all' ? selectedBrand : undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          is24HourDelivery: fastDeliveryOnly ? true : undefined,
          sortBy,
          page,
          limit: 20,
        });

        if (isMounted) {
          let list = res.products || [];
          if (inStockOnly) {
            list = list.filter((p) => p.inStock);
          }
          setProducts(list);
          setTotal(res.total || list.length);
        }
      } catch (err) {
        console.error('Failed to fetch subcategory products', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [subcategory, categorySlug, subcategorySlug, selectedBrand, minPrice, maxPrice, sortBy, page, inStockOnly, fastDeliveryOnly]);

  // Dynamically discover all brands for this subcategory from the API
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadBrands() {
      const subId = subcategory?.subcategoryId;
      const res = await productApi.getAll({
        subcategoryId: subId,
        subcategory: !subId ? subcategorySlug : undefined,
        category: categorySlug,
        limit: 100,
      });
      if (!isMounted) return;
      const brandSet = new Set<string>();
      (res.products || []).forEach((p) => {
        const b = p.brand || p.brandName;
        if (b) brandSet.add(b);
      });
      setAvailableBrands(Array.from(brandSet).sort());
    }

    loadBrands().catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [subcategory?.subcategoryId, subcategorySlug, categorySlug]);

  // Cart Handler
  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const pKey = product.productId || product.id;
    setAddingId(pKey);
    await new Promise((r) => setTimeout(r, 250));
    cartStore.addItem(product, { quantity: 1 });
    toast.success(`Added "${product.title || product.name}" to cart!`, {
      style: { background: '#1c1917', color: '#fafaf9', fontSize: '13px', borderRadius: '12px' },
    });
    setAddingId(null);
  };

  // Wishlist Handler
  const handleWishlistToggle = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const added = wishlistStore.toggle(product);
    toast(added ? 'Added to wishlist ❤️' : 'Removed from wishlist', {
      duration: 1800,
      style: { background: '#1c1917', color: '#fafaf9', fontSize: '13px', borderRadius: '12px' },
    });
  };

  const clearAllFilters = () => {
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setFastDeliveryOnly(false);
    setSortBy('popular');
    setPage(1);
  };

  const hasActiveFilters =
    selectedBrand !== 'all' || minPrice !== '' || maxPrice !== '' || inStockOnly || fastDeliveryOnly;

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      {/* ── Subcategory Header Banner ── */}
      <div className="bg-stone-900 text-white border-b border-stone-800 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: categoryTitle, href: `/category/${categorySlug}` },
                { label: subcategoryName },
              ]}
              className="py-1 text-stone-400"
            />
            <Link
              to={`/category/${categorySlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-orange-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to {categoryTitle} Categories
            </Link>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {categoryTitle} Showcase
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-white tracking-tight">
                {subcategoryName}
              </h1>
              <p className="text-stone-300 text-sm sm:text-base mt-2">
                Explore verified contractor-grade and residential SKUs for {subcategoryName.toLowerCase()}.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-stone-800/80 rounded-2xl p-3 px-5 border border-stone-700 shrink-0">
              <PackageCheck className="w-6 h-6 text-orange-400" />
              <div>
                <span className="text-xs text-stone-400 block uppercase font-bold tracking-wider">
                  Available Catalog
                </span>
                <span className="text-xl font-black text-white">
                  {total} {total === 1 ? 'Product' : 'Products'}
                </span>
              </div>
            </div>
          </div>

          {/* Sibling Subcategories Pill Switcher */}
          {siblingSubcategories.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-800">
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
                Switch Subcategory:
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {siblingSubcategories.map((sub) => {
                  const isActive = sub.slug === subcategorySlug;
                  return (
                    <Link
                      key={sub.subcategoryId}
                      to={`/category/${categorySlug}/${sub.slug}`}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        isActive
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-stone-800 text-stone-300 border-stone-700 hover:border-orange-400 hover:text-white'
                      }`}
                    >
                      {sub.name}
                      <span className="ml-1.5 opacity-75 font-normal text-[11px]">
                        ({sub.productCount > 0 ? sub.productCount : '0'})
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Layout (Sidebar Filters + Product Grid) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Top Control Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-stone-200 p-4 mb-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-charcoal transition-colors"
            >
              <Filter className="w-4 h-4 text-orange-600" />
              Filters {hasActiveFilters && '(Active)'}
            </button>
            <div className="text-xs sm:text-sm text-stone-600 font-medium">
              Showing <strong>{products.length}</strong> of <strong>{total}</strong> products
              {selectedBrand !== 'all' && (
                <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold">
                  Brand: {selectedBrand}
                  <button onClick={() => setSelectedBrand('all')} className="hover:text-orange-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-semibold hidden md:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl px-4 py-2 pr-9 text-xs font-bold text-charcoal focus:outline-none focus:border-orange-500 cursor-pointer transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-stone-200 rounded-xl p-0.5 bg-stone-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-orange-600' : 'text-stone-400 hover:text-charcoal'
                }`}
                title="Grid View"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-xs text-orange-600' : 'text-stone-400 hover:text-charcoal'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* ── Filters Sidebar (Desktop & Collapsible Mobile) ── */}
          <aside
            className={`lg:block ${
              mobileFilterOpen ? 'block fixed inset-0 z-50 p-4 bg-stone-900/60 overflow-y-auto' : 'hidden'
            }`}
          >
            <div
              className={`bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6 ${
                mobileFilterOpen ? 'max-w-md mx-auto my-8' : ''
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-600" />
                  <h3 className="font-bold text-sm text-charcoal">Catalog Filters</h3>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                {mobileFilterOpen && (
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 text-stone-400 hover:text-charcoal lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* In Stock Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-stone-300"
                  />
                  <span className="text-xs font-bold text-charcoal">In Stock Items Only</span>
                </label>
              </div>

              {/* 24-Hour Delivery Toggle */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fastDeliveryOnly}
                    onChange={(e) => setFastDeliveryOnly(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-stone-300"
                  />
                  <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                    <span className="text-amber-500">⚡</span> 24-Hour Delivery
                  </span>
                </label>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-3">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-orange-500 font-semibold"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-charcoal focus:outline-none focus:border-orange-500 font-semibold"
                  />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    { label: 'Under ₹3k', min: '', max: '3000' },
                    { label: '₹3k - ₹8k', min: '3000', max: '8000' },
                    { label: '₹8k+', min: '8000', max: '' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => {
                        setMinPrice(preset.min);
                        setMaxPrice(preset.max);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[11px] font-semibold text-stone-600 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-3">
                  Filter by Brand
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <label className="flex items-center justify-between text-xs font-semibold text-charcoal cursor-pointer p-1 rounded-lg hover:bg-stone-50">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="brandFilter"
                        checked={selectedBrand === 'all'}
                        onChange={() => setSelectedBrand('all')}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      All Brands
                    </span>
                  </label>
                  {availableBrands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center justify-between text-xs font-semibold text-charcoal cursor-pointer p-1 rounded-lg hover:bg-stone-50"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="brandFilter"
                          checked={selectedBrand === brand}
                          onChange={() => setSelectedBrand(brand)}
                          className="text-orange-600 focus:ring-orange-500"
                        />
                        {brand}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply / Close for Mobile */}
              {mobileFilterOpen && (
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors"
                >
                  Apply Filters
                </button>
              )}
            </div>
          </aside>

          {/* ── Product Grid Section ── */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center shadow-xs">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
                  <PackageCheck className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-extrabold text-xl text-charcoal mb-2">
                  No Products Found in {subcategoryName}
                </h3>
                <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
                  {hasActiveFilters
                    ? 'No products matched your active filters. Try resetting the price or brand filter.'
                    : 'We are currently procuring fresh catalog batches for this subcategory.'}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 rounded-full bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-xs"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <Link
                    to={`/category/${categorySlug}`}
                    className="px-6 py-2.5 rounded-full bg-orange-500 text-white font-bold text-xs hover:bg-orange-600 transition-colors shadow-xs inline-block"
                  >
                    Browse Other {categoryTitle} Categories
                  </Link>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {products.map((product) => {
                  const pKey = product.productId || product.id;
                  const isWish = wishlistStore.isInWishlist(String(pKey));
                  const isAdding = addingId === pKey;
                  const discountPct =
                    product.discount ||
                    (product.mrp && product.price
                      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                      : 0);

                  const brandName = product.brand || product.brandName || 'HinchCraft';
                  const pTitle = product.title || product.name;
                  const imgSrc =
                    product.imageUrl ||
                    product.images?.[0] ||
                    'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80';

                  if (viewMode === 'list') {
                    return (
                      <div
                        key={pKey}
                        className="group bg-white rounded-2xl border border-stone-200 hover:border-orange-400 hover:shadow-md p-4 flex flex-col sm:flex-row gap-5 transition-all"
                      >
                        <Link
                          to={`/product/${product.slug}`}
                          className="w-full sm:w-48 aspect-square rounded-xl overflow-hidden bg-stone-50 shrink-0 relative block"
                        >
                          <img
                            src={imgSrc}
                            alt={pTitle}
                            loading="lazy"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.onerror = null;
                              const isLamp = (pTitle + ' ' + subcategoryName).toLowerCase().includes('lamp');
                              target.src = isLamp
                                ? 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
                                : 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {discountPct > 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase">
                              {discountPct}% OFF
                            </span>
                          )}
                        </Link>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                                {brandName}
                              </span>
                              {product.sku && (
                                <span className="text-[10px] text-stone-400 font-mono">
                                  SKU: {product.sku}
                                </span>
                              )}
                            </div>
                            <Link to={`/product/${product.slug}`}>
                              <h4 className="font-extrabold text-base text-charcoal group-hover:text-orange-600 transition-colors mt-1 line-clamp-1">
                                {pTitle}
                              </h4>
                            </Link>
                            <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                              {product.description || product.shortDescription}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-black text-charcoal">
                                  ₹{product.price.toLocaleString()}
                                </span>
                                {product.mrp && product.mrp > product.price && (
                                  <span className="text-xs text-stone-400 line-through">
                                    ₹{product.mrp.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                <Check className="w-3 h-3" />
                                {product.stockQty ? `${product.stockQty} in stock` : 'In Stock'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleWishlistToggle(e, product)}
                                className={`p-2.5 rounded-xl border transition-colors ${
                                  isWish
                                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                                    : 'border-stone-200 text-stone-400 hover:text-charcoal hover:bg-stone-50'
                                }`}
                              >
                                <Heart className="w-4 h-4" fill={isWish ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                onClick={(e) => handleAddToCart(e, product)}
                                disabled={isAdding || !product.inStock}
                                className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                {isAdding ? 'Adding...' : 'Add to Cart'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Default Grid Card
                  return (
                    <div
                      key={pKey}
                      className="group bg-white rounded-3xl border border-stone-200 hover:border-orange-500 hover:shadow-lg p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 mb-3">
                          <Link to={`/product/${product.slug}`} className="block w-full h-full">
                            <img
                              src={imgSrc}
                              alt={pTitle}
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                const isLamp = (pTitle + ' ' + subcategoryName).toLowerCase().includes('lamp');
                                target.src = isLamp
                                  ? 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
                                  : 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80';
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>

                          {/* Discount Badge */}
                          {discountPct > 0 && (
                            <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-xs">
                              {discountPct}% OFF
                            </span>
                          )}

                          {/* 24-Hour Delivery Badge */}
                          {product.is24HourDelivery && (
                            <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-stone-900 text-[10px] font-black uppercase tracking-wider shadow-xs flex items-center gap-1">
                              ⚡ 24h Delivery
                            </span>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => handleWishlistToggle(e, product)}
                            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md shadow-xs transition-all ${
                              isWish
                                ? 'bg-rose-500 text-white'
                                : 'bg-white/90 text-stone-600 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                            title="Add to Wishlist"
                          >
                            <Heart className="w-3.5 h-3.5" fill={isWish ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-orange-600 uppercase tracking-wider">
                            {brandName}
                          </span>
                          {product.sku && (
                            <span className="text-stone-400 font-mono text-[10px]">
                              {product.sku}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <Link to={`/product/${product.slug}`}>
                          <h4 className="font-bold text-sm text-charcoal group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                            {pTitle}
                          </h4>
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mt-2">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="text-xs font-bold text-charcoal ml-1">
                              {product.rating || 4.7}
                            </span>
                          </div>
                          {product.reviewCount ? (
                            <span className="text-[11px] text-stone-400">
                              ({product.reviewCount})
                            </span>
                          ) : null}
                          <span className="mx-1 text-stone-300">•</span>
                          <span className="text-[11px] text-emerald-600 font-semibold">
                            {product.stockQty ? `${product.stockQty} in stock` : 'In Stock'}
                          </span>
                        </div>

                        {/* Bulk Pricing Tier Badge */}
                        {product.bulkPricingTiers && product.bulkPricingTiers.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md w-fit">
                            <span>Bulk: ₹{product.bulkPricingTiers[product.bulkPricingTiers.length - 1].pricePerUnit}/unit</span>
                          </div>
                        )}

                        {/* Specifications Pills */}
                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {Object.entries(product.specifications).slice(0, 2).map(([k, v]) => (
                              <span key={k} className="text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded-md font-medium">
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pricing & Add to Cart Action */}
                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-black text-charcoal">
                              ₹{product.price.toLocaleString()}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="text-xs text-stone-400 line-through">
                                ₹{product.mrp.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={isAdding || !product.inStock}
                          className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {isAdding ? 'Adding...' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryPage;
