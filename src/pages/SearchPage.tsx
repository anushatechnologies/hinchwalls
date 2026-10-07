import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, Sparkles, Filter, ChevronDown, ArrowRight } from 'lucide-react';
import { productApi, categoryApi } from '../api';
import type { Product, Category, SortOption } from '../types';
import ProductCard from '../components/ProductCard';
import Breadcrumb from '../components/Breadcrumb';
import { ProductCardSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [inputVal, setInputVal] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [matchingCategories, setMatchingCategories] = useState<Category[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState<SortOption>('featured');

  useEffect(() => {
    categoryApi.getAll(true).then(setCategoriesList).catch(() => {});
  }, []);

  useDocumentTitle(query ? `Search: "${query}" | WallArt` : 'Search Wall Art');

  useEffect(() => {
    setInputVal(query);
    async function doSearch() {
      if (!query.trim()) {
        setProducts([]);
        setMatchingCategories([]);
        return;
      }
      setLoading(true);
      try {
        const res = await productApi.search(query);
        let sorted = [...res.products];
        if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
        if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
        if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
        if (sort === 'best-selling') sorted.sort((a, b) => b.reviewCount - a.reviewCount);
        setProducts(sorted);
        setMatchingCategories(res.categories);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }
    doSearch();
  }, [query, sort]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchParams({ q: inputVal.trim() });
    }
  };

  const popularSearches = categoriesList.length > 0
    ? categoriesList.slice(0, 6).map((c) => c.name)
    : ['Interior Wall Paints', 'Flooring & Tiles', 'Living Room', 'Botanical', 'Minimalist', 'Bedroom'];

  return (
    <div className="bg-warm-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            { label: 'Shop', href: '/shop' },
            { label: 'Search Results' },
          ]}
        />

        {/* Search Input Banner */}
        <div className="mt-4 mb-8 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal mb-4">
            Search WallArt Designs
          </h1>
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Search decals by room, style, theme, or color..."
                className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-2xl text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
              />
              <SearchIcon className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-terracotta text-white rounded-2xl text-xs uppercase tracking-wider font-semibold hover:bg-terracotta-dark shadow-sm transition"
            >
              Search
            </button>
          </form>

          {/* Quick tags */}
          <div className="flex items-center gap-2 flex-wrap mt-4 text-xs text-charcoal/70">
            <span className="font-semibold text-charcoal">Trending searches:</span>
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setInputVal(term);
                  setSearchParams({ q: term });
                }}
                className="px-3 py-1 bg-beige/60 hover:bg-beige rounded-full border border-stone-200/80 transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Result Stats & Sort bar */}
        {query && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-6">
            <div className="text-sm text-charcoal/80">
              Showing <strong>{products.length}</strong> results for{' '}
              <span className="font-serif italic font-semibold text-charcoal">"{query}"</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-charcoal/60">Sort by:</span>
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="appearance-none bg-white border border-stone-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-semibold text-charcoal focus:outline-none focus:border-terracotta cursor-pointer"
                >
                  <option value="featured">Relevance / Featured</option>
                  <option value="best-selling">Best Selling</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Matching categories if any */}
        {matchingCategories.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal mb-3">
              Matching Collections
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {matchingCategories.map((c) => (
                <Link
                  key={c.id}
                  to={`/category/${c.slug}`}
                  className="p-3 bg-white rounded-2xl border border-stone-200 hover:border-terracotta transition flex items-center justify-between group"
                >
                  <span className="text-xs font-bold text-charcoal group-hover:text-terracotta">
                    {c.name}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-terracotta transition" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : query && products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8 max-w-lg mx-auto">
            <Sparkles className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <h3 className="text-xl font-serif font-bold text-charcoal mb-2">No Results Found</h3>
            <p className="text-xs text-charcoal/70 mb-6">
              We couldn’t find anything matching "{query}". Try checking your spelling or search for broader terms like "nursery", "leaves", or "quote".
            </p>
            <Link
              to="/shop"
              className="inline-block px-6 py-2.5 bg-terracotta text-white font-semibold text-xs rounded-full hover:bg-terracotta-dark transition"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
