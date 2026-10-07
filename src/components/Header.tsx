import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useDebounce } from '../hooks';
import { productApi, categoryApi, subcategoryApi } from '../api';
import type { Product, Category, SubcategoryCardItem } from '../types';

interface ShowcaseNavCategory {
  label: string;
  href: string;
  iconUrl: string;
  badge?: string;
}

export default function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryCardItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const cartStore = useCartStore();
  const searchRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const itemCount = cartStore.getItemCount();

  // Sticky header shadow trigger
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Fetch all categories dynamically from backend
  useEffect(() => {
    let isMounted = true;
    categoryApi.getAll().then((cats) => {
      if (isMounted && Array.isArray(cats)) {
        setCategories(cats);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Derive current category from URL (e.g. /category/interior or /category/electrical)
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentCategorySlug = pathParts[0] === 'category' && pathParts[1] ? pathParts[1] : 'interior';
  const [activeCategory, setActiveCategory] = useState<any>(null);

  // Fetch subcategories dynamically from API for active category
  useEffect(() => {
    let isMounted = true;
    categoryApi.getBySlug(currentCategorySlug).then((res) => {
      if (!isMounted) return;
      setActiveCategory(res);
      if (res?.subcategories && res.subcategories.length > 0) {
        setSubcategories(
          (res.subcategories as SubcategoryCardItem[]).filter(
            (s) => s.active !== false && s.visibleOnWebsite !== false
          )
        );
      } else if (res?.categoryId) {
        subcategoryApi.getByCategory(res.categoryId).then((subs) => {
          if (isMounted) {
            setSubcategories(
              (subs as SubcategoryCardItem[]).filter(
                (s) => s.active !== false && s.visibleOnWebsite !== false
              )
            );
          }
        });
      } else {
        setSubcategories([]);
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [currentCategorySlug]);

function getSubcategoryIconFallback(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('lamp') || n.includes('lantern') || n.includes('light')) {
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=100&auto=format&fit=crop&q=80';
  }
  if (n.includes('art') || n.includes('paint') || n.includes('wall')) {
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=100&auto=format&fit=crop&q=80';
}

  const categoryNavItems: ShowcaseNavCategory[] = [
    {
      label: `All ${activeCategory?.name || 'Sections'}`,
      href: `/category/${currentCategorySlug}`,
      iconUrl: activeCategory?.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=100&q=80',
      badge: subcategories.length > 0 ? `${subcategories.length} Sections` : undefined,
    },
    ...subcategories.map((sub) => ({
      label: sub.name,
      href: `/category/${currentCategorySlug}/${sub.slug}`,
      iconUrl: sub.imageUrl || getSubcategoryIconFallback(sub.name),
      badge: sub.productCount > 0 ? `${sub.productCount} SKUs` : 'Browse',
    })),
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Live search for products / subcategories
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    productApi.search(debouncedSearch).then((data) => {
      setSearchResults((data.products || []).slice(0, 6));
      setSearchLoading(false);
    }).catch(() => setSearchLoading(false));
  }, [debouncedSearch]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchSelect = (product: Product) => {
    setSearchOpen(false);
    setSearchQuery('');
    if (product.slug || product.id) {
      navigate(`/product/${product.slug || product.id}`);
    } else {
      const catSlug = product.category ? product.category.toLowerCase().replace(/\s+/g, '-') : currentCategorySlug;
      const subSlug = (product.subcategory || product.subcategoryName || '')
        .toLowerCase()
        .replace(/\s+/g, '-');
      navigate(subSlug ? `/category/${catSlug}/${subSlug}` : `/category/${catSlug}`);
    }
  };

  return (
    <>
      {/* Top Banner Bar */}
      <div className="bg-stone-900 text-stone-300 text-center text-xs py-2 px-4 font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span>HinchWall Architectural &amp; Materials Catalog &bull; Direct Jobsite Dispatch</span>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${
          isScrolled ? 'shadow-md border-b border-stone-200' : 'border-b border-stone-200/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile Hamburger */}
            <button
              className="lg:hidden p-2 -ml-2 rounded-xl text-stone-700 hover:bg-stone-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Brand Logo */}
            <Link to="/category/all" className="flex items-center gap-3 group shrink-0">
              <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-orange-500 transition-colors">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors">
                  HinchWall
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600 mt-0.5">
                  {activeCategory?.name || 'Architectural Catalog'}
                </span>
              </div>
            </Link>

            {/* Search Input with dropdown */}
            <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg mx-6 relative">
              <div className="w-full relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />
                <input
                  type="text"
                  placeholder="Search materials, finishes, fixtures, SKUs..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-100/90 border border-stone-200 rounded-full text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all shadow-xs"
                />
              </div>

              {searchOpen && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden">
                  {searchLoading ? (
                    <div className="p-4 text-center text-xs text-stone-500">Searching catalog...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="p-2 divide-y divide-stone-100">
                      {searchResults.map((product) => (
                        <div
                          key={product.id || product.productId}
                          onClick={() => handleSearchSelect(product)}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50/70 cursor-pointer transition-colors"
                        >
                          <img
                            src={product.imageUrl || (product.images && product.images[0])}
                            alt={product.title || product.name}
                            className="w-10 h-10 object-cover rounded-lg bg-stone-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-stone-900 truncate">
                              {product.title || product.name}
                            </p>
                            <p className="text-[11px] text-stone-500">
                              {product.subcategory || product.subcategoryName} &bull;{' '}
                              <span className="text-orange-600 font-bold">₹{product.price.toLocaleString('en-IN')}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-stone-500">
                      No products matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions (Catalog Link & Cart) */}
            <div className="flex items-center gap-3">
              <Link
                to="/category/all"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-stone-800 text-xs font-bold transition-colors"
              >
                <span>Browse All (62)</span>
              </Link>

              {/* Cart Drawer Toggle */}
              <button
                onClick={cartStore.toggleCart}
                className="relative p-2.5 rounded-full bg-stone-100 hover:bg-orange-500 hover:text-white text-stone-800 transition-all duration-200"
                aria-label="View Cart"
              >
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-xs">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Slide-in Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 top-0 z-50 flex">
            <div
              className="bg-stone-950/50 backdrop-blur-xs flex-1"
              onClick={() => setMobileOpen(false)}
            />
            <div className="bg-white w-80 h-full overflow-y-auto p-5 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center text-white">
                    <Layers className="w-4 h-4" />
                  </div>
                  <span className="font-serif font-black text-lg text-stone-900">HinchWall</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-lg text-stone-500 hover:bg-stone-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Category Switcher */}
              <div className="py-3 border-b border-stone-200 overflow-x-auto no-scrollbar flex items-center gap-1.5">
                <Link
                  to="/category/all"
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                    currentCategorySlug === 'all'
                      ? 'bg-orange-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <Sparkles size={11} />
                  <span>All (62)</span>
                </Link>
                {categories
                  .filter((cat) => (cat.subcategories && cat.subcategories.length > 0))
                  .map((cat) => {
                    const isCurrent = currentCategorySlug === cat.slug;
                    return (
                      <Link
                        key={cat.categoryId || cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                          isCurrent
                            ? 'bg-stone-900 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {cat.name}
                      </Link>
                    );
                  })}
              </div>

              <div className="mt-4 flex-1 space-y-1">
                {categoryNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl text-sm font-bold transition-colors ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 border border-orange-200'
                          : 'text-stone-800 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.iconUrl}
                          alt=""
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = getSubcategoryIconFallback(item.label);
                          }}
                          className="w-6 h-6 rounded-lg object-cover"
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[11px] font-semibold text-stone-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-stone-200">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    cartStore.openCart();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-600 text-white font-bold text-sm shadow-md"
                >
                  <ShoppingBag size={18} />
                  <span>View Cart ({itemCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
