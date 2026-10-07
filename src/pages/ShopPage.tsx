import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Grid3X3, LayoutList } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeletons';
import { productApi, categoryApi } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useScrollToTop } from '../hooks';
import type { Product, Category, ProductFilters, SortOption } from '../types';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
] as const;


const COLORS = ['Black', 'White', 'Gold', 'Navy', 'Sage', 'Terracotta', 'Blue', 'Pink'];
const ROOMS = ['Living Room', 'Bedroom', 'Kids Room', 'Nursery', 'Home Office', 'Kitchen', 'Bathroom'];
const SIZES = ['Small', 'Medium', 'Large', 'XL'];
const RATINGS = [4, 3, 2];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="sidebar-filter-section">
      <button className="sidebar-filter-title" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

export default function ShopPage() {
  useDocumentTitle('Shop All Wall Decals');
  useScrollToTop();

  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('featured');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode] = useState<'grid' | 'list'>('grid');
  const LIMIT = 20;

  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories and read URL params on mount
  useEffect(() => {
    categoryApi.getAll(true).then(setCategories).catch(() => {});
    const room = searchParams.get('room');
    const sale = searchParams.get('sale');
    const category = searchParams.get('category');
    if (room) setFilters((f) => ({ ...f, rooms: [room] }));
    if (sale) setFilters((f) => ({ ...f, onSale: true }));
    if (category) setFilters((f) => ({ ...f, categories: [category] }));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productApi.getAll({
        filters: { ...filters, priceRange },
        sort,
        page,
        limit: LIMIT,
      });
      setProducts(result.products);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } finally {
      setLoading(false);
    }
  }, [filters, sort, page, priceRange]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const toggleCategory = (cat: string) => {
    setFilters((f) => {
      const current = f.categories || [];
      return {
        ...f,
        categories: current.includes(cat)
          ? current.filter((c) => c !== cat)
          : [...current, cat],
      };
    });
    setPage(1);
  };

  const toggleColor = (color: string) => {
    setFilters((f) => {
      const current = f.colors || [];
      return {
        ...f,
        colors: current.includes(color)
          ? current.filter((c) => c !== color)
          : [...current, color],
      };
    });
    setPage(1);
  };

  const toggleRoom = (room: string) => {
    setFilters((f) => {
      const current = f.rooms || [];
      return {
        ...f,
        rooms: current.includes(room)
          ? current.filter((r) => r !== room)
          : [...current, room],
      };
    });
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 200]);
    setSort('featured');
    setPage(1);
    setSearchParams({});
  };

  const activeFilterCount = [
    (filters.categories?.length || 0),
    filters.inStock ? 1 : 0,
    filters.onSale ? 1 : 0,
    (filters.rooms?.length || 0),
    (filters.colors?.length || 0),
    filters.rating ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const SidebarContent = () => (
    <div className="space-y-0">
      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm text-terracotta font-medium mb-4 hover:underline"
        >
          <X size={14} /> Clear all filters ({activeFilterCount})
        </button>
      )}

      {/* Categories */}
      <FilterSection title="Category">
        <div className="space-y-1">
          {categories.map((cat) => (
            <label key={cat.id || cat.slug} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.categories?.includes(cat.slug) || false}
                onChange={() => toggleCategory(cat.slug)}
                className="w-3.5 h-3.5 rounded accent-terracotta"
              />
              <span className="capitalize">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability">
        <div className="space-y-1">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={() => setFilters((f) => ({ ...f, inStock: !f.inStock }))}
              className="w-3.5 h-3.5 rounded accent-terracotta"
            />
            In Stock
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.onSale || false}
              onChange={() => setFilters((f) => ({ ...f, onSale: !f.onSale }))}
              className="w-3.5 h-3.5 rounded accent-terracotta"
            />
            On Sale
          </label>
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Price">
        <div className="space-y-3">
          <input
            type="range"
            min={0}
            max={200}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-secondary">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}+</span>
          </div>
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => {
            const colorMap: Record<string, string> = {
              Black: '#1a1a1a', White: '#f8f8f8', Gold: '#c9a84c',
              Navy: '#1e3a5f', Sage: '#87a878', Terracotta: '#c4704f',
              Blue: '#4a90d9', Pink: '#f4c2c2',
            };
            const isSelected = filters.colors?.includes(color);
            return (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                title={color}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  isSelected ? 'border-charcoal scale-110' : 'border-border hover:border-charcoal/50'
                }`}
                style={{ background: colorMap[color] }}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* Room */}
      <FilterSection title="Room">
        <div className="space-y-1">
          {ROOMS.map((room) => (
            <label key={room} className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.rooms?.includes(room.toLowerCase().replace(/\s/g, '-')) || false}
                onChange={() => toggleRoom(room.toLowerCase().replace(/\s/g, '-'))}
                className="w-3.5 h-3.5 rounded accent-terracotta"
              />
              {room}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="space-y-1">
          {SIZES.map((size) => (
            <label key={size} className="checkbox-label">
              <input type="checkbox" className="w-3.5 h-3.5 rounded accent-terracotta" />
              {size}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-1">
          {RATINGS.map((r) => (
            <label key={r} className="checkbox-label">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === r}
                onChange={() => setFilters((f) => ({ ...f, rating: r }))}
                className="w-3.5 h-3.5 accent-terracotta"
              />
              <span className="flex items-center gap-1">
                {'★'.repeat(r)}{'☆'.repeat(5 - r)} & up
              </span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-warm-white min-h-screen">
      {/* Page Header */}
      <div className="bg-beige/50 border-b border-border py-8">
        <div className="container-custom">
          <h1 className="section-title">Shop All Wall Decals</h1>
          <p className="section-subtitle mt-2">
            {total > 0 ? `${total} beautiful designs` : 'Explore our collection'}
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h3 className="font-semibold text-charcoal mb-5 text-sm">Filter By</h3>
              <SidebarContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-beige transition-colors"
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-terracotta text-white text-xs rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="text-sm text-text-secondary">
                  {loading ? 'Loading...' : `${total} products`}
                </p>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-3">
                <label className="text-sm text-text-secondary hidden sm:block">Sort by:</label>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value as SortOption); setPage(1); }}
                  className="select-field py-2 pr-8 text-sm max-w-48"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.categories?.map((cat) => (
                  <span key={cat} className="flex items-center gap-1 px-3 py-1 bg-charcoal text-white text-xs rounded-full">
                    {cat}
                    <button onClick={() => toggleCategory(cat)}><X size={11} /></button>
                  </span>
                ))}
                {filters.onSale && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-charcoal text-white text-xs rounded-full">
                    On Sale
                    <button onClick={() => setFilters((f) => ({ ...f, onSale: false }))}><X size={11} /></button>
                  </span>
                )}
                {filters.rooms?.map((room) => (
                  <span key={room} className="flex items-center gap-1 px-3 py-1 bg-charcoal text-white text-xs rounded-full">
                    {room.replace(/-/g, ' ')}
                    <button onClick={() => toggleRoom(room)}><X size={11} /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Product Grid */}
            <div className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {loading
                ? Array.from({ length: LIMIT }).map((_, i) => <ProductCardSkeleton key={i} />)
                : products.length > 0
                ? products.map((p) => <ProductCard key={p.id} product={p} />)
                : (
                  <div className="col-span-full py-20 text-center">
                    <div className="text-4xl mb-4">🎨</div>
                    <h3 className="font-serif text-xl font-semibold text-charcoal mb-2">
                      No products found
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Try adjusting your filters to find what you're looking for.
                    </p>
                    <button onClick={clearFilters} className="btn-secondary">
                      Clear Filters
                    </button>
                  </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-beige transition-colors disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-sm transition-colors ${
                        page === p
                          ? 'bg-charcoal text-white'
                          : 'border border-border hover:bg-beige'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-beige transition-colors disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-charcoal/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="bg-white w-80 h-full overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Filter By</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <SidebarContent />
            </div>
            <div className="sticky bottom-0 bg-white border-t border-border p-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="btn-primary w-full"
              >
                Apply Filters ({total} results)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
