import apiClient from './apiClient';
import type {
  Product,
  Category,
  Subcategory,
  BlogPost,
  Review,
  ProductFilters,
  SortOption,
  ReviewSubmitRequest,
  ReviewResponse,
  ProductRatingSummary,
  CartItemRequest,
  CartResponse,
  CouponApplyResponse,
  OrderCreateRequest,
  OrderResponse,
  OrderTrackingResponse,
  OrderCancelResponse,
  RazorpayCreateOrderResponse,
  RazorpayVerifyRequest,
  RazorpayVerifyResponse,
  ApiResponse,
} from '../types';

// Standard envelope helper extracting payload from { success, message, data, pagination }
async function requestApi<T>(url: string, method = 'GET', body?: any, params?: Record<string, any>): Promise<T> {
  const res = await apiClient.request<any>({
    url,
    method,
    params,
    data: body,
  });
  return res.data?.data !== undefined ? res.data.data : res.data;
}

// ============================================================
// AUTH API (/api/auth)
// ============================================================
export const authApi = {
  /**
   * POST /api/auth/login
   * Returns { token, user }
   */
  login: async (email: string, password: string): Promise<{ token: string; user: any }> => {
    const res = await apiClient.post<any>('/auth/login', { email, password });
    const data = res.data?.data || res.data;
    return {
      token: data?.token || data?.accessToken || '',
      user: data?.user || data?.customer || data || {},
    };
  },

  /**
   * POST /api/auth/register
   */
  register: async (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<{ token: string; user: any }> => {
    const res = await apiClient.post<any>('/auth/register', data);
    const resp = res.data?.data || res.data;
    return {
      token: resp?.token || resp?.accessToken || '',
      user: resp?.user || resp?.customer || resp || {},
    };
  },

  /**
   * GET /api/auth/me
   * Get the authenticated user's profile
   */
  me: async (): Promise<any> => {
    const res = await apiClient.get<any>('/auth/me');
    return res.data?.data || res.data;
  },

  /**
   * POST /api/auth/logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // ignore logout errors
    }
  },
};

// Live backend categories cache
let categoriesCache: Category[] | null = null;
let categoriesCachePromise: Promise<Category[]> | null = null;

/**
 * Business Rule Filter:
 * is_active = true AND visible_on_website = true
 * Any subcategory where visibleOnWebsite = false or active = false is automatically filtered out.
 */
export function isWebsiteSubcategoryVisible(s: any): boolean {
  if (!s) return false;
  const active = s.active !== false && s.is_active !== false && s.isActive !== false;
  const visibleOnWebsite =
    s.visibleOnWebsite !== false &&
    s.visible_on_website !== false &&
    s.isVisibleOnWebsite !== false;
  return Boolean(active && visibleOnWebsite);
}

// Normalize backend Category model
function normalizeCategory(c: any): Category {
  const id = c.categoryId ?? c.id;
  const rawSubs = Array.isArray(c.subcategories) ? c.subcategories : [];
  const filteredSubs = rawSubs.filter(isWebsiteSubcategoryVisible).map(normalizeSubcategory);

  return {
    ...c,
    id,
    categoryId: id,
    name: c.name || '',
    slug: c.slug || String(id),
    imageUrl: c.imageUrl || c.image || '',
    productCount: Number(c.productCount ?? 0),
    sortOrder: Number(c.sortOrder ?? 0),
    active: c.active !== false,
    subcategories: filteredSubs.length > 0 ? filteredSubs : undefined,
  };
}

// Normalize backend Subcategory model
function normalizeSubcategory(s: any): Subcategory {
  const id = s.subcategoryId ?? s.id;
  return {
    ...s,
    id,
    subcategoryId: id,
    categoryId: s.categoryId,
    name: s.name || '',
    slug: s.slug || String(id),
    imageUrl: s.imageUrl || s.image || '',
    productCount: Number(s.productCount ?? 0),
    sortOrder: Number(s.sortOrder ?? 0),
    active: s.active !== false,
    visibleOnWebsite: s.visibleOnWebsite !== false,
  };
}

// Normalize backend Product model
function normalizeProduct(p: any): Product {
  const id = p.productId ?? p.id;
  const price = Number(p.sellingPrice ?? p.price ?? 0);
  const mrp = Number(p.mrp ?? p.price ?? 0);
  const images = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.imageUrl ? [p.imageUrl] : []);

  return {
    ...p,
    id,
    productId: id,
    title: p.title || p.name || 'Product',
    name: p.title || p.name || 'Product',
    slug: p.slug || String(id),
    sku: p.sku || '',
    price,
    mrp,
    originalPrice: mrp > price ? mrp : undefined,
    discount: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
    unit: p.unit || 'unit',
    moq: Number(p.moq ?? 1),
    stockQty: Number(p.stockQty ?? 0),
    inStock: (p.stockQty ?? 1) > 0,
    rating: Number(p.rating ?? 0),
    reviewCount: Number(p.reviewCount ?? 0),
    reviewsCount: Number(p.reviewCount ?? 0),
    category: p.categoryName || p.category || '',
    categoryId: p.categoryId,
    subcategory: p.subcategoryName || p.subcategory || '',
    subcategoryId: p.subcategoryId,
    brand: p.brandName || p.brand || '',
    brandId: p.brandId,
    storeId: p.storeId,
    storeName: p.storeName || '',
    storeSlug: p.storeSlug || '',
    is24HourDelivery: Boolean(p.is24HourDelivery),
    isExpress: Boolean(p.is24HourDelivery),
    imageUrl: images[0] || p.imageUrl || '',
    images,
    description: p.description || '',
    specifications: p.specifications || {},
    active: p.active !== false,
  };
}

// ============================================================
// CATEGORY API (100% Live Backend)
// ============================================================
export const categoryApi = {
  /**
   * Endpoint D: Website All Categories with Nested Subcategories (Megamenu / Catalog)
   * GET /api/categories?active=true&includeSubcategories=true&website=true&page=1&limit=20
   * Returns all active categories where subcategories satisfy active = true AND visibleOnWebsite = true
   */
  getAll: async (active = true): Promise<Category[]> => {
    if (categoriesCache && categoriesCache.length > 0) return categoriesCache;
    if (categoriesCachePromise) return categoriesCachePromise;

    categoriesCachePromise = (async () => {
      try {
        const [res, websiteSubs] = await Promise.all([
          requestApi<any[]>('/categories', 'GET', undefined, {
            active,
            includeSubcategories: true,
            website: true,
            page: 1,
            limit: 50,
          }),
          subcategoryApi.getWebsiteSubcategories(),
        ]);

        if (Array.isArray(res)) {
          const list = res.map((c) => {
            const catId = Number(c.categoryId ?? c.id);
            const matchedSubs = websiteSubs.filter((s) => Number(s.categoryId) === catId);
            return normalizeCategory({
              ...c,
              subcategories: matchedSubs.length > 0 ? matchedSubs : c.subcategories,
            });
          });
          categoriesCache = list;
          return list;
        }
      } catch (err) {
        console.warn('Failed to fetch categories from backend', err);
      }
      return [];
    })();

    return categoriesCachePromise;
  },

  /**
   * Endpoint C: Website Category Details with Nested Subcategories
   * GET /api/categories/{id}?website=true
   * Returns category with nested subcategories satisfying active = true AND visibleOnWebsite = true.
   * If slug is 'all', returns all 62 website-visible subcategories.
   */
  getBySlug: async (slugOrId: string | number): Promise<(Category & { subcategories?: Subcategory[] }) | null> => {
    const slugStr = String(slugOrId).toLowerCase().trim();

    // Special case for 'all' or 'catalog' to return all 62 subcategories
    if (slugStr === 'all' || slugStr === 'catalog') {
      const allSubs = await subcategoryApi.getWebsiteSubcategories();
      const totalProds = allSubs.reduce((acc, s) => acc + (s.productCount || 0), 0);
      return {
        id: 'all',
        categoryId: 0,
        name: 'All Categories & Sections',
        slug: 'all',
        description: `Complete catalog of all ${allSubs.length} verified website sections, finishes, and construction materials.`,
        productCount: totalProds,
        subcategories: allSubs,
        active: true,
      };
    }

    const idNum = Number(slugStr);

    // If numeric, call direct endpoint with ?website=true
    if (!isNaN(idNum) && String(idNum) === slugStr) {
      try {
        const direct = await requestApi<any>(`/categories/${idNum}`, 'GET', undefined, { website: true });
        if (direct && (direct.categoryId || direct.id)) {
          const cat = normalizeCategory(direct);
          const rawSubs = Array.isArray(direct.subcategories) ? direct.subcategories : [];
          const filteredSubs = rawSubs.filter(isWebsiteSubcategoryVisible).map(normalizeSubcategory);
          const subcategories = filteredSubs.length > 0
            ? filteredSubs
            : await categoryApi.getSubcategories(cat.categoryId ?? (cat as any).id ?? 0);
          return { ...cat, subcategories };
        }
      } catch {
        // Fall back to searching list
      }
    }

    // Lookup across categories (with nested website subcategories)
    const all = await categoryApi.getAll();
    const found = all.find(
      (c) =>
        c.slug?.toLowerCase() === slugStr ||
        String(c.categoryId) === slugStr ||
        String(c.id) === slugStr ||
        c.name?.toLowerCase() === slugStr
    );

    if (!found) return null;

    // Ensure nested subcategories are filtered by active = true AND visibleOnWebsite = true
    const existingSubs = Array.isArray(found.subcategories)
      ? found.subcategories.filter(isWebsiteSubcategoryVisible)
      : [];
    const subcategories = existingSubs.length > 0
      ? existingSubs
      : await categoryApi.getSubcategories(found.categoryId ?? (found as any).id ?? 0);

    return { ...found, subcategories };
  },

  /**
   * Fetch website-visible subcategories for category
   * Calls Endpoint A (/subcategories/website?categoryId=...) or Endpoint B (?active=true&visibleOnWebsite=true)
   */
  getSubcategories: async (categoryId: number | string): Promise<Subcategory[]> => {
    if (String(categoryId).toLowerCase() === 'all' || categoryId === 0) {
      return subcategoryApi.getWebsiteSubcategories();
    }
    const catIdNum = Number(categoryId);
    if (isNaN(catIdNum)) return [];
    return subcategoryApi.getWebsiteSubcategories(catIdNum);
  },

  /**
   * POST /api/categories (Create Category)
   */
  create: async (data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post('/categories', data, { headers });
    categoriesCache = null;
    categoriesCachePromise = null;
    return res.data;
  },
};

// ============================================================
// SUBCATEGORY API (100% Live Backend)
// ============================================================
export const subcategoryApi = {
  /**
   * Endpoint A: Dedicated Website Subcategories Endpoint
   * GET /api/subcategories/website?categoryId={categoryId}
   * If categoryId is omitted, returns all 62 website subcategories (active = true AND visibleOnWebsite = true).
   */
  getWebsiteSubcategories: async (categoryId?: number | string): Promise<Subcategory[]> => {
    try {
      const params: Record<string, any> = {};
      if (
        categoryId !== undefined &&
        categoryId !== '' &&
        categoryId !== 'all' &&
        Number(categoryId) !== 0
      ) {
        const num = Number(categoryId);
        if (!isNaN(num)) params.categoryId = num;
      }
      const res = await requestApi<any[]>('/subcategories/website', 'GET', undefined, params);
      if (Array.isArray(res)) {
        return res
          .filter(isWebsiteSubcategoryVisible)
          .map(normalizeSubcategory);
      }
    } catch (err) {
      console.warn('Failed to fetch from /subcategories/website, falling back to standard endpoint with flags', err);
    }

    // Fallback to Endpoint B
    return subcategoryApi.getAll({
      categoryId: categoryId === 'all' || Number(categoryId) === 0 ? undefined : categoryId,
      active: true,
      visibleOnWebsite: true,
    });
  },

  /**
   * Endpoint B: Standard Subcategories Endpoint with Website Filter Flag
   * GET /api/subcategories?categoryId={categoryId}&active=true&visibleOnWebsite=true
   * Returns only subcategories satisfying active = true AND visibleOnWebsite = true.
   */
  getAll: async (params?: {
    categoryId?: number | string;
    active?: boolean;
    visibleOnWebsite?: boolean;
  }): Promise<Subcategory[]> => {
    try {
      const queryParams: Record<string, any> = {
        active: params?.active ?? true,
        visibleOnWebsite: params?.visibleOnWebsite ?? true,
      };
      if (params?.categoryId !== undefined && params.categoryId !== '') {
        const catId = Number(params.categoryId);
        if (!isNaN(catId)) queryParams.categoryId = catId;
      }
      const res = await requestApi<any[]>('/subcategories', 'GET', undefined, queryParams);
      if (Array.isArray(res)) {
        return res
          .filter(isWebsiteSubcategoryVisible)
          .map(normalizeSubcategory);
      }
    } catch (err) {
      console.warn('Failed to fetch all subcategories', err);
    }
    return [];
  },

  /**
   * GET subcategories for a category (Website Visible only)
   */
  getByCategory: async (categoryId: number | string): Promise<Subcategory[]> => {
    return subcategoryApi.getWebsiteSubcategories(categoryId);
  },

  /**
   * GET subcategory by slug or ID (Enforces active = true AND visibleOnWebsite = true)
   */
  getBySlug: async (slugOrId: string | number): Promise<Subcategory | null> => {
    const slugStr = String(slugOrId).toLowerCase().trim();
    const idNum = Number(slugStr);

    if (!isNaN(idNum) && String(idNum) === slugStr) {
      try {
        const direct = await requestApi<any>(`/subcategories/${idNum}`, 'GET');
        if (direct && (direct.subcategoryId || direct.id)) {
          if (isWebsiteSubcategoryVisible(direct)) {
            return normalizeSubcategory(direct);
          }
          return null;
        }
      } catch {
        // Fall back to searching list
      }
    }

    const all = await subcategoryApi.getWebsiteSubcategories();
    const found = all.find(
      (s) =>
        isWebsiteSubcategoryVisible(s) &&
        (s.slug?.toLowerCase() === slugStr ||
          String(s.subcategoryId) === slugStr ||
          String((s as any).id) === slugStr ||
          s.name?.toLowerCase() === slugStr)
    );
    return found || null;
  },

  /**
   * GET /api/subcategories/{id}/products?page={page}&limit={limit}
   */
  getProducts: async (subcategoryId: number | string, page = 1, limit = 20) => {
    return productApi.getAll({ subcategoryId: Number(subcategoryId), page, limit });
  },

  /**
   * POST /api/subcategories (Create Subcategory)
   */
  create: async (data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post('/subcategories', data, { headers });
    categoriesCache = null;
    categoriesCachePromise = null;
    return res.data;
  },
};

// ============================================================
// PRODUCT API (100% Live Backend)
// ============================================================
export const productApi = {
  /**
   * GET /api/products (with live backend filters and pagination)
   */
  getAll: async (params?: {
    categoryId?: number | string;
    subcategoryId?: number | string;
    category?: string;
    subcategory?: string;
    room?: string;
    brand?: string;
    featured?: boolean;
    sort?: SortOption | string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
    is24HourDelivery?: boolean;
    page?: number;
    limit?: number;
    filters?: ProductFilters;
  }) => {
    const queryParams: Record<string, any> = {};

    if (params?.categoryId !== undefined && params.categoryId !== '') {
      const num = Number(params.categoryId);
      if (!isNaN(num)) queryParams.categoryId = num;
      else queryParams.category = params.categoryId;
    }
    if (params?.subcategoryId !== undefined && params.subcategoryId !== '') {
      const num = Number(params.subcategoryId);
      if (!isNaN(num)) queryParams.subcategoryId = num;
      else queryParams.subcategory = params.subcategoryId;
    }
    if (params?.category && !queryParams.category && !queryParams.categoryId) queryParams.category = params.category;
    if (params?.subcategory && !queryParams.subcategory && !queryParams.subcategoryId) queryParams.subcategory = params.subcategory;
    if (params?.room) queryParams.room = params.room;
    if (params?.brand) queryParams.brand = params.brand;
    if (params?.featured !== undefined) queryParams.featured = params.featured;
    if (params?.is24HourDelivery !== undefined) queryParams.is24HourDelivery = params.is24HourDelivery;
    if (params?.minPrice !== undefined) queryParams.minPrice = params.minPrice;
    if (params?.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    else if (params?.sort) queryParams.sortBy = params.sort;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;

    let resData: any = null;
    try {
      const res = await apiClient.get<any>('/products', { params: queryParams });
      resData = res.data;
    } catch (e) {
      console.warn('Backend products request failed', e);
    }

    const envelope = resData;

    let rawList: any[] = [];
    let totalRecords = 0;
    let pagination = {
      page: params?.page || 1,
      limit: params?.limit || 20,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    };

    if (Array.isArray(envelope?.data)) {
      rawList = envelope.data;
      const pag = envelope.pagination || {};
      totalRecords = pag.totalCount ?? pag.totalItems ?? pag.totalRecords ?? rawList.length;
      pagination = {
        page: pag.page || pag.currentPage || params?.page || 1,
        limit: pag.limit || params?.limit || 20,
        totalPages: pag.totalPages || Math.ceil(totalRecords / (pag.limit || params?.limit || 20)) || 1,
        hasNext: pag.hasNextPage ?? (pag.currentPage ? pag.currentPage < pag.totalPages : false),
        hasPrev: pag.hasPrevPage ?? (pag.currentPage ? pag.currentPage > 1 : false),
      };
    } else if (envelope?.data?.products && Array.isArray(envelope.data.products)) {
      rawList = envelope.data.products;
      totalRecords = envelope.data.total ?? envelope?.data?.pagination?.totalCount ?? rawList.length;
      if (envelope.data.pagination) {
        pagination = {
          page: envelope.data.pagination.currentPage || envelope.data.pagination.page || 1,
          limit: envelope.data.pagination.limit || 20,
          totalPages: envelope.data.pagination.totalPages || Math.ceil(totalRecords / 20) || 1,
          hasNext: envelope.data.pagination.hasNextPage ?? false,
          hasPrev: envelope.data.pagination.hasPrevPage ?? false,
        };
      }
    } else if (Array.isArray(envelope?.products)) {
      rawList = envelope.products;
      const pag = envelope.pagination || {};
      totalRecords = pag.totalCount ?? pag.totalItems ?? rawList.length;
    } else if (Array.isArray(envelope)) {
      rawList = envelope;
      totalRecords = rawList.length;
    }

    const prods = rawList.map(normalizeProduct);

    return {
      products: prods,
      total: totalRecords,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
      pagination,
    };
  },

  /**
   * POST /api/products (Create Product)
   */
  create: async (data: any, token?: string) => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post('/products', data, { headers });
    return res.data;
  },

  /**
   * GET /api/products/{id}
   */
  getById: async (id: string | number): Promise<Product | null> => {
    try {
      const data = await requestApi<any>(`/products/${id}`, 'GET');
      if (data && (data.productId || data.id)) {
        return normalizeProduct(data);
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * GET /api/products/{slug}
   */
  getBySlug: async (slug: string): Promise<Product | null> => {
    try {
      const data = await requestApi<any>(`/products/${slug}`, 'GET');
      if (data && (data.productId || data.id)) {
        return normalizeProduct(data);
      }
    } catch {
      // Fall through to search by slug
    }

    try {
      const res = await productApi.getAll({ limit: 50 });
      const found = res.products.find((p) => p.slug === slug || String(p.id) === slug);
      return found || null;
    } catch {
      return null;
    }
  },

  /**
   * GET /api/products?featured=true
   */
  getFeatured: async (category?: string, limit = 8): Promise<Product[]> => {
    const res = await productApi.getAll({ category, featured: true, limit });
    return res.products;
  },

  /**
   * GET /api/products (Related Products)
   */
  getRelated: async (productId: string | number, category?: string, limit = 4): Promise<Product[]> => {
    try {
      const res = await apiClient.get<any>('/products', {
        params: { related: productId, category, limit },
      });
      const data = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(data) && data.length > 0) {
        return data.map(normalizeProduct);
      }
    } catch {
      // Fallback
    }
    const res = await productApi.getAll({ category, limit });
    return res.products.filter((p) => String(p.id) !== String(productId)).slice(0, limit);
  },

  /**
   * GET /api/products/{productId}/reviews
   */
  getReviews: async (productId: string | number): Promise<Review[]> => {
    try {
      return await requestApi<Review[]>(`/products/${productId}/reviews`, 'GET');
    } catch {
      return [];
    }
  },

  /**
   * Search
   */
  search: async (query: string) => {
    const res = await productApi.getAll({ category: query, limit: 20 });
    return {
      products: res.products,
      categories: [],
      total: res.total,
    };
  },

  getBestSellers: async (limit = 8) => {
    const res = await productApi.getAll({ limit });
    return res.products;
  },

  getNewArrivals: async (limit = 8) => {
    const res = await productApi.getAll({ sort: 'newest', limit });
    return res.products;
  },

  getSale: async (limit = 8) => {
    const res = await productApi.getAll({ limit });
    return res.products;
  },
};

// ============================================================
// BLOG API
// ============================================================
export const blogApi = {
  getAll: async (page = 1, limit = 9): Promise<{ posts: BlogPost[]; total: number; page: number; totalPages: number }> => {
    const res = await requestApi<any>('/blog', 'GET', undefined, { page, limit });
    return res?.posts ? res : { posts: [], total: 0, page, totalPages: 1 };
  },
  getBySlug: async (slug: string): Promise<BlogPost | null> => {
    return requestApi<BlogPost>(`/blog/${slug}`, 'GET');
  },
  getFeatured: async (_limit = 3): Promise<BlogPost[]> => {
    const res = await blogApi.getAll(1, _limit);
    return res.posts;
  },
};

// ============================================================
// REVIEW API (/api/reviews)
// ============================================================
export const reviewApi = {
  /**
   * 1. Submit a Customer Review (Verified Purchase)
   * POST /api/reviews
   * Headers: Authorization: Bearer <TOKEN>, X-User-Id: <userId>
   */
  submit: async (
    data: ReviewSubmitRequest,
    token?: string,
    userId?: string | number
  ): Promise<ApiResponse<ReviewResponse>> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    if (userId) headers['X-User-Id'] = String(userId);

    const res = await apiClient.post<ApiResponse<ReviewResponse>>('/reviews', data, { headers });
    return res.data;
  },

  /**
   * 2. Get All Reviews of a Product (Public / Customer Facing)
   * GET /api/reviews/product/{productId}?page=1&limit=10&rating={rating}
   */
  getByProduct: async (
    productId: number | string,
    params?: { page?: number; limit?: number; rating?: number }
  ): Promise<{ reviews: ReviewResponse[]; pagination: any }> => {
    try {
      const res = await apiClient.get<any>(`/reviews/product/${productId}`, { params });
      const envelope = res.data;
      const reviews = Array.isArray(envelope?.data) ? envelope.data : [];
      const pagination = envelope?.pagination || {
        currentPage: params?.page || 1,
        totalPages: 1,
        totalItems: reviews.length,
        limit: params?.limit || 10,
      };
      return { reviews, pagination };
    } catch {
      return { reviews: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, limit: 10 } };
    }
  },

  /**
   * 3. Get Product Rating Summary & Star Breakdown
   * GET /api/reviews/product/{productId}/summary
   */
  getSummary: async (productId: number | string): Promise<ProductRatingSummary | null> => {
    try {
      const res = await apiClient.get<ApiResponse<ProductRatingSummary>>(`/reviews/product/${productId}/summary`);
      return res.data?.data || null;
    } catch {
      return null;
    }
  },

  getAll: async (_limit = 10): Promise<Review[]> => {
    return [];
  },
};

// ============================================================
// CART API (/api/cart)
// ============================================================
export const cartApi = {
  /**
   * 1. Add Item to Cart
   * POST /api/cart/items
   */
  addItem: async (data: CartItemRequest, token?: string): Promise<CartResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post<ApiResponse<CartResponse>>('/cart/items', data, { headers });
    return res.data?.data || (res.data as any);
  },

  /**
   * 2. View Current Cart
   * GET /api/cart
   */
  get: async (token?: string): Promise<CartResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.get<ApiResponse<CartResponse>>('/cart', { headers });
    return res.data?.data || (res.data as any);
  },

  /**
   * 3. Apply Coupon Code
   * POST /api/cart/coupon
   */
  applyCoupon: async (code: string, token?: string): Promise<CouponApplyResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post<ApiResponse<CouponApplyResponse>>('/cart/coupon', { code }, { headers });
    return res.data?.data || (res.data as any);
  },

  /**
   * 4. Update Item Quantity
   * PUT /api/cart/items/{cartItemId}
   */
  updateQuantity: async (
    cartItemId: number | string,
    quantity: number,
    token?: string
  ): Promise<CartResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.put<ApiResponse<CartResponse>>(`/cart/items/${cartItemId}`, { quantity }, { headers });
    return res.data?.data || (res.data as any);
  },

  /**
   * 5. Remove Item from Cart
   * DELETE /api/cart/items/{cartItemId}
   */
  removeItem: async (cartItemId: number | string, token?: string): Promise<CartResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.delete<ApiResponse<CartResponse>>(`/cart/items/${cartItemId}`, { headers });
    return res.data?.data || (res.data as any);
  },

  /**
   * 6. Clear Entire Cart
   * DELETE /api/cart
   */
  clear: async (token?: string): Promise<void> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    await apiClient.delete('/cart', { headers });
  },
};

// ============================================================
// ORDER API (/api/orders)
// ============================================================
export const orderApi = {
  /**
   * 1. Place Order (Checkout)
   * POST /api/orders
   */
  create: async (data: OrderCreateRequest, token?: string): Promise<OrderResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post<ApiResponse<OrderResponse>>('/orders', data, { headers });
    return res.data?.data || (res.data as any);
  },

  place: async (data: any, token?: string): Promise<OrderResponse> => {
    return orderApi.create(data, token);
  },

  /**
   * 2. Get Full Order by ID
   * GET /api/orders/{id}
   */
  getById: async (orderId: number | string, token?: string): Promise<OrderResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.get<ApiResponse<OrderResponse>>(`/orders/${orderId}`, { headers });
    return res.data?.data || (res.data as any);
  },

  /**
   * 3. Get Real-time Tracking Checkpoints
   * GET /api/orders/{id}/tracking
   */
  getTracking: async (orderId: number | string, token?: string): Promise<OrderTrackingResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.get<ApiResponse<OrderTrackingResponse>>(`/orders/${orderId}/tracking`, { headers });
    return res.data?.data || (res.data as any);
  },

  track: async (orderNumber: string, email?: string): Promise<any> => {
    const res = await apiClient.get<any>('/orders/track', { params: { orderNumber, email } });
    return res.data?.data || res.data;
  },

  /**
   * 4. Cancel Order
   * POST /api/orders/{id}/cancel
   */
  cancel: async (
    orderId: number | string,
    description: string,
    token?: string
  ): Promise<OrderCancelResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post<ApiResponse<OrderCancelResponse>>(
      `/orders/${orderId}/cancel`,
      { description },
      { headers }
    );
    return res.data?.data || (res.data as any);
  },

  /**
   * 5. Get Customer Orders List
   * GET /api/orders
   */
  getOrders: async (token?: string): Promise<OrderResponse[]> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.get<any>('/orders', { headers });
    const data = res.data?.data || res.data;
    return Array.isArray(data) ? data : [];
  },
};

// ============================================================
// PAYMENT API (/api/payments)
// ============================================================
export const paymentApi = {
  /**
   * 1. Generate Gateway Razorpay Order
   * POST /api/payments/create-order
   */
  createOrder: async (orderId: number, token?: string): Promise<RazorpayCreateOrderResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post<ApiResponse<RazorpayCreateOrderResponse>>(
      '/payments/create-order',
      { orderId },
      { headers }
    );
    return res.data?.data || (res.data as any);
  },

  /**
   * 2. Verify Payment Signature
   * POST /api/payments/verify
   */
  verify: async (data: RazorpayVerifyRequest, token?: string): Promise<RazorpayVerifyResponse> => {
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await apiClient.post<ApiResponse<RazorpayVerifyResponse>>('/payments/verify', data, { headers });
    return res.data?.data || (res.data as any);
  },
};

export const customDecalApi = {
  calculatePrice: (width: number, height: number, material: string) => {
    const area = width * height;
    const basePrice = area * 0.08;
    const materialMultiplier = material === 'premium' ? 1.5 : material === 'glitter' ? 2 : 1;
    return parseFloat((basePrice * materialMultiplier + 5.99).toFixed(2));
  },
};
