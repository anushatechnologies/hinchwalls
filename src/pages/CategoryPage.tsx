import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Search,
  Grid2X2,
} from 'lucide-react';
import { categoryApi, subcategoryApi } from '../api';
import type { Category, CategoryData, SubcategoryCardItem } from '../types';
import Breadcrumb from '../components/Breadcrumb';
import { PageSkeleton } from '../components/Skeletons';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function getSubcategoryFallback(name?: string, slug?: string): string {
  const combined = `${name || ''} ${slug || ''}`.toLowerCase();
  if (combined.includes('lamp') || combined.includes('lantern') || combined.includes('light')) {
    return 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80';
  }
  if (combined.includes('art') || combined.includes('paint') || combined.includes('wall') || combined.includes('canvas')) {
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80';
  }
  if (combined.includes('pipe') || combined.includes('plumb') || combined.includes('fitting') || combined.includes('tank')) {
    return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80';
  }
  if (combined.includes('bed') || combined.includes('sofa') || combined.includes('table') || combined.includes('chair') || combined.includes('furniture')) {
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80';
  }
  if (combined.includes('tool') || combined.includes('hardware') || combined.includes('drill')) {
    return 'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80';
}

export const CategoryPage: React.FC = () => {
  const { categorySlug, slug } = useParams<{ categorySlug?: string; slug?: string }>();
  const activeSlug = (categorySlug || slug || 'all').toLowerCase();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allSubcategories, setAllSubcategories] = useState<SubcategoryCardItem[]>([]);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // Map of categoryId -> Category metadata
  const categoryMap = useMemo(() => {
    const map = new Map<number | string, { name: string; slug: string }>();
    categories.forEach((c) => {
      const id = c.categoryId ?? c.id;
      map.set(Number(id), { name: c.name, slug: c.slug });
      map.set(String(id), { name: c.name, slug: c.slug });
      map.set(c.slug.toLowerCase(), { name: c.name, slug: c.slug });
    });
    return map;
  }, [categories]);

  useDocumentTitle(
    activeSlug === 'all'
      ? 'All 14 Categories & 62 Sections | HinchWall'
      : `${category?.name || 'Category'} Catalog | HinchWall`
  );

  // Load all 14 categories and all 62 website subcategories
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const [cats, subs] = await Promise.all([
          categoryApi.getAll(true),
          subcategoryApi.getWebsiteSubcategories(), // Returns all 62 subcategories
        ]);

        if (!isMounted) return;

        setCategories(cats);
        const validSubs = (subs as SubcategoryCardItem[]).filter(
          (s) => s.active !== false && s.visibleOnWebsite !== false
        );
        setAllSubcategories(validSubs);

        if (activeSlug === 'all' || activeSlug === 'catalog') {
          const totalProds = validSubs.reduce((acc, s) => acc + (s.productCount || 0), 0);
          setCategory({
            categoryId: 'all',
            name: 'All Categories & Sections',
            slug: 'all',
            description: `Browse all ${cats.length || 14} categories and ${validSubs.length} active website sections, finishes, fixtures, and materials on HinchWall.`,
            productCount: totalProds,
            subcategories: validSubs,
          });
        } else {
          // Find matching category
          const catRes = await categoryApi.getBySlug(activeSlug);
          if (catRes) {
            const catSubs = (catRes.subcategories as SubcategoryCardItem[]) || [];
            const filteredCatSubs = catSubs.filter(
              (s) => s.active !== false && s.visibleOnWebsite !== false
            );
            const computedTotal = filteredCatSubs.reduce((acc, s) => acc + (s.productCount || 0), 0);

            setCategory({
              categoryId: catRes.categoryId ?? (catRes as any).id,
              name: catRes.name,
              slug: catRes.slug,
              description: catRes.description,
              imageUrl: catRes.imageUrl || catRes.image,
              productCount: catRes.productCount ?? computedTotal,
              subcategories: filteredCatSubs,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load category showcase', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [activeSlug]);

  // Derived subcategories to display based on active slug and search filter
  const displayedSubcategories = useMemo(() => {
    let list: SubcategoryCardItem[] = [];

    if (activeSlug === 'all' || activeSlug === 'catalog') {
      list = allSubcategories;
    } else if (category?.subcategories && category.subcategories.length > 0) {
      list = category.subcategories;
    } else {
      // Filter allSubcategories by categoryId if category matched
      const currentCatId = category?.categoryId;
      if (currentCatId) {
        list = allSubcategories.filter(
          (s) => Number(s.categoryId) === Number(currentCatId)
        );
      } else {
        list = allSubcategories;
      }
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter((s) => {
        const catName = categoryMap.get(Number(s.categoryId))?.name || '';
        return (
          s.name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q) ||
          catName.toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [activeSlug, allSubcategories, category, searchFilter, categoryMap]);

  // Only show categories that have at least 1 active subcategory (subCount > 0)
  // Categories with no active subcategories are automatically hidden
  const activeCategories = useMemo(() => {
    return categories
      .map((cat) => {
        const count = allSubcategories.filter(
          (s) => Number(s.categoryId) === Number(cat.categoryId ?? cat.id)
        ).length;
        return { ...cat, subCount: count };
      })
      .filter((cat) => cat.subCount > 0);
  }, [categories, allSubcategories]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <PageSkeleton />
      </div>
    );
  }

  const categoryName = category?.name || (activeSlug.charAt(0).toUpperCase() + activeSlug.slice(1));
  const categoryDesc = category?.description || '';

  return (
    <div className="bg-warm-white min-h-screen pb-20">
      {/* ── Main Content Container ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/category/all' },
            { label: 'Catalog', href: '/category/all' },
            { label: categoryName },
          ]}
        />

        {/* ── Category Filter Pills & Search Bar ── */}
        <section aria-label="Category Navigation & Filters" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">
                <Layers className="w-4 h-4" />
                Category Switcher
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-stone-900">
                {activeSlug === 'all'
                  ? `All Categories (${activeCategories.length}) & Sections (${allSubcategories.length})`
                  : `${categoryName} Collection (${displayedSubcategories.length} Sections)`}
              </h1>
              {categoryDesc && (
                <p className="text-xs text-stone-500 mt-1 max-w-xl">{categoryDesc}</p>
              )}
            </div>

            {/* Quick Live Search Filter */}
            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={`Filter ${displayedSubcategories.length} sections...`}
                className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-full text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Active Category Filter Tabs with Exact Backend Counts */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            <button
              onClick={() => navigate('/category/all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 shadow-xs ${
                activeSlug === 'all'
                  ? 'bg-orange-600 text-white shadow-orange-600/20 shadow-md'
                  : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <Grid2X2 size={13} />
              <span>All Sections ({allSubcategories.length})</span>
            </button>

            {activeCategories.map((cat) => {
              const isSelected = activeSlug === cat.slug;
              return (
                <button
                  key={cat.categoryId || cat.slug}
                  onClick={() => navigate(`/category/${cat.slug}`)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 border flex items-center gap-1.5 shadow-xs ${
                    isSelected
                      ? 'bg-stone-900 text-white border-stone-900 shadow-md'
                      : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border-stone-200'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {cat.subCount}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Subcategories Grid (Displays up to 62 Cards) ── */}
        <section aria-labelledby="subcategories-grid-heading">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-stone-500">
              Showing {displayedSubcategories.length} of {allSubcategories.length} sections
              {activeSlug !== 'all' && ` in ${categoryName}`}
            </span>
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                Clear Search Filter
              </button>
            )}
          </div>

          {displayedSubcategories.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
              <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-900 mb-1">
                {searchFilter ? 'No matching sections found' : `Sections coming soon for ${categoryName}`}
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                {searchFilter
                  ? `No subcategories matched "${searchFilter}". Try viewing all sections.`
                  : `New architectural and material items for ${categoryName} are being onboarded. You can explore all other active sections.`}
              </p>
              <button
                onClick={() => {
                  setSearchFilter('');
                  navigate('/category/all');
                }}
                className="px-5 py-2 rounded-full bg-orange-600 text-white text-xs font-bold shadow-md hover:bg-orange-500 transition-colors"
              >
                View All {allSubcategories.length} Sections
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-4">
              {displayedSubcategories.map((sub) => {
                const parentCat = categoryMap.get(Number(sub.categoryId));
                const targetCatSlug = parentCat?.slug || activeSlug || 'interior';

                return (
                  <Link
                    key={`${sub.categoryId}-${sub.subcategoryId || sub.slug}`}
                    to={`/category/${targetCatSlug}/${sub.slug}`}
                    className="group bg-white rounded-2xl border border-stone-200 hover:border-orange-500 hover:shadow-xl p-3 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1"
                  >
                    {/* Card Image */}
                    <div className="w-full aspect-square rounded-xl bg-stone-50 overflow-hidden flex items-center justify-center p-1 relative">
                      <img
                        src={sub.imageUrl || getSubcategoryFallback(sub.name, sub.slug)}
                        alt={sub.name}
                        loading="lazy"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = getSubcategoryFallback(sub.name, sub.slug);
                        }}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                      />
                      {parentCat && activeSlug === 'all' && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-xs text-[9px] font-bold text-white tracking-wide uppercase">
                          {parentCat.name}
                        </span>
                      )}
                    </div>

                    {/* Product Count & Title */}
                    <div className="mt-2.5 w-full">
                      <span className="text-[11px] font-bold text-stone-400 block truncate">
                        {sub.productCount > 0 ? `${sub.productCount} Products` : 'Browse SKUs'}
                      </span>
                      <h3 className="font-extrabold text-xs sm:text-sm text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                        {sub.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Value Proposition / Trust Features ── */}
        <section className="bg-white rounded-3xl border border-stone-200 p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-charcoal">Verified Quality Materials</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  All interior panels, laminates, and fixtures meet national fire-retardant and emission standards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-charcoal">24-48 Hour Jobsite Dispatch</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Bulk contractor supply and express residential delivery direct to your project location.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-charcoal">Hassle-Free Replacement</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  On-site inspection and rapid replacements for transit damages or batch discrepancies.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CategoryPage;
