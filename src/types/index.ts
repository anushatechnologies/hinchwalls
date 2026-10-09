// ============================================================
// Product Types
// ============================================================
export interface BulkPricingTier {
  minQuantity: number;
  pricePerUnit: number;
}

export interface Product {
  id: string;
  productId?: number | string;
  slug: string;
  name: string;
  title?: string;
  productName?: string;
  description: string;
  shortDescription?: string;
  price: number;
  sellingPrice?: number;
  originalPrice?: number;
  mrp?: number;
  discount?: number;
  sku: string;
  category: string;
  categoryName?: string;
  categoryId?: number | string;
  subcategory?: string;
  subcategoryId?: number | string;
  subcategoryName?: string;
  brand?: string;
  brandName?: string;
  unit?: string;
  moq?: number;
  stockQty?: number;
  tags: string[];
  images: string[];
  imageUrl?: string;
  hoverImage?: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  stockQuantity?: number;
  featured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isSale: boolean;
  isCustomizable: boolean;
  is24HourDelivery?: boolean;
  gstRate?: number;
  hsnCode?: string;
  status?: string;
  sizes: ProductSize[];
  colors: ProductColor[];
  materials?: string[];
  room?: string[];
  style?: string[];
  theme?: string[];
  dimensions?: string;
  specifications?: Record<string, string>;
  bulkPricingTiers?: BulkPricingTier[];
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Backend API DTOs (Category, Subcategory, Product)
// ============================================================
export interface CategoryRequest {
  name: string;
  slug: string;
  imageUrl?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface CategoryResponse {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  imageUrl?: string;
  active: boolean;
  sortOrder: number;
  productCount: number;
  subcategories?: SubcategoryResponse[];
  createdAt?: string;
}

export interface SubcategoryRequest {
  categoryId: number;
  name: string;
  slug: string;
  imageUrl?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface SubcategoryResponse {
  id: number;
  subcategoryId: number;
  categoryId: number;
  name: string;
  slug: string;
  imageUrl?: string;
  active: boolean;
  visibleOnWebsite?: boolean;
  sortOrder?: number;
  productCount?: number;
  createdAt?: string;
}

export interface ProductRequest {
  categoryId: number;
  subcategoryId: number;
  title: string;
  slug: string;
  sku: string;
  brand?: string;
  description?: string;
  price: number;
  mrp?: number;
  stockQty?: number;
  unit?: string;
  moq?: number;
  imageUrl?: string;
  images?: string[];
  active?: boolean;
  is24HourDelivery?: boolean;
  gstRate?: number;
  hsnCode?: string;
  specifications?: Record<string, string>;
  bulkPricingTiers?: BulkPricingTier[];
}

export interface ProductResponse {
  id: number;
  productId: number;
  name: string;
  title: string;
  slug: string;
  sku: string;
  categoryId: number;
  categoryName?: string;
  subcategoryId: number;
  subcategoryName?: string;
  brand?: string;
  price: number;
  sellingPrice?: number;
  mrp?: number;
  stockQty?: number;
  unit?: string;
  moq?: number;
  imageUrl?: string;
  images?: string[];
  active?: boolean;
  is24HourDelivery?: boolean;
  rating?: number;
  reviewCount?: number;
  specifications?: Record<string, string>;
  bulkPricingTiers?: BulkPricingTier[];
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: {
    currentPage?: number;
    page?: number;
    totalPages?: number;
    totalItems?: number;
    totalCount?: number;
    totalRecords?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  timestamp?: string;
}

export interface ProductSize {
  id: string;
  label: string;
  value: string;
  priceModifier: number;
}

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

// ============================================================
// Category Types
// ============================================================
export interface Category {
  id: string;
  categoryId?: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  productCount?: number;
  parentId?: string;
  subcategories?: Subcategory[];
  seoTitle?: string;
  seoDescription?: string;
  featured?: boolean;
  order?: number;
  active?: boolean;
  status?: 'active' | 'inactive';
}

// Subcategory Item (Each Card in the Grid) as per API Spec
export interface SubcategoryCardItem {
  subcategoryId: number | string;
  categoryId: number | string;
  name: string;
  slug: string;
  imageUrl: string;
  productCount: number;
  active?: boolean;
  visibleOnWebsite?: boolean;
}

// Category Info (Parent) as per API Spec
export interface CategoryData {
  categoryId: number | string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
  subcategories: SubcategoryCardItem[];
  active?: boolean;
}

export interface Subcategory {
  subcategoryId: number;
  categoryId: number;
  name: string;
  slug: string;
  imageUrl?: string;
  active: boolean;
  visibleOnWebsite?: boolean;
  productCount?: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  featured: boolean;
}

// ============================================================
// Cart Types
// ============================================================
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedSize?: ProductSize;
  selectedColor?: ProductColor;
  customText?: string;
  customFont?: string;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCode?: string;
  couponDiscount?: number;
}

// ============================================================
// Order Types
// ============================================================
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'printed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: Address;
  trackingNumber?: string;
  notes?: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
  customText?: string;
  unitPrice: number;
  totalPrice: number;
}

// ============================================================
// Customer / User Types
// ============================================================
export type UserRole = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export interface BackendUser {
  userId: number | string;
  firebaseUid: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: UserRole;
  sellerId: number | string | null;
  isProfileComplete: boolean;
}

export interface SyncResponseData {
  accessToken: string;
  tokenType?: string;
  expiresIn?: number;
  userId: number | string;
  firebaseUid: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: UserRole;
  sellerId: number | string | null;
  isProfileComplete: boolean;
}

export interface SyncRequest {
  firebaseIdToken: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface CheckPhoneResponse {
  exists: boolean;
}

export interface Customer extends Partial<BackendUser> {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  addresses: Address[];
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// ============================================================
// Review Types
// ============================================================
export interface Review {
  id: string;
  productId: string;
  customerId?: string;
  customerName?: string;
  author?: string;
  customerAvatar?: string;
  rating: number;
  title: string;
  content?: string;
  comment?: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  createdAt: string;
}

// ============================================================
// Blog Types
// ============================================================
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: BlogAuthor;
  category: string;
  tags: string[];
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  relatedProducts?: string[];
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
}

// ============================================================
// Filter / Sort Types
// ============================================================
export interface ProductFilters {
  categories?: string[];
  priceRange?: [number, number];
  sizes?: string[];
  colors?: string[];
  rooms?: string[];
  styles?: string[];
  themes?: string[];
  rating?: number;
  inStock?: boolean;
  onSale?: boolean;
}

export type SortOption =
  | 'featured'
  | 'best-selling'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating';

// ============================================================
// Checkout Types
// ============================================================
export interface CheckoutData {
  contact: {
    email: string;
    phone: string;
    subscribeToNewsletter: boolean;
  };
  shipping: Address;
  deliveryMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  payment: {
    method: 'card' | 'paypal';
  };
}

// ============================================================
// Admin Types
// ============================================================
export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  status: 'active' | 'inactive' | 'expired';
}

// ============================================================
// UI Types
// ============================================================
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface SearchResult {
  products: Product[];
  categories: Category[];
  total: number;
  query: string;
}

export type ViewMode = 'grid' | 'list';

// ============================================================
// Review DTOs
// ============================================================
export interface ReviewSubmitRequest {
  orderItemId: number;
  rating: number;
  title: string;
  comment: string;
  imageUrls?: string[];
}

export interface ReviewResponse {
  id: number;
  productId: number;
  productTitle?: string;
  customerId: number;
  customerName: string;
  orderId?: number;
  orderItemId?: number;
  rating: number;
  title: string;
  comment: string;
  status: string;
  helpfulCount?: number;
  verifiedPurchase: boolean;
  imageUrls: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface ProductRatingSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: Record<string, number>;
}

// ============================================================
// Cart DTOs
// ============================================================
export interface CartItemRequest {
  productId: number;
  quantity: number;
}

export interface CartItemResponse {
  cartItemId: number;
  productId: number;
  title: string;
  imageUrl?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  originalPrice?: number;
  gstRate?: number;
  lineTotal: number;
  lineGst?: number;
}

export interface CartResponse {
  cartId: number;
  storeId?: number;
  storeName?: string;
  storeSlug?: string;
  items: CartItemResponse[];
  subtotal: number;
  couponDiscount: number;
  totalGst?: number;
  deliveryCharge?: number;
  grandTotal: number;
}

export interface CouponApplyRequest {
  code: string;
}

export interface CouponApplyResponse {
  code: string;
  discountAmount: number;
  newGrandTotal: number;
  valid: boolean;
  message: string;
}

// ============================================================
// Order DTOs
// ============================================================
export interface OrderCreateRequest {
  addressId: number;
  paymentMethod: 'RAZORPAY' | 'COD' | string;
  deliverySlot?: string;
  deliveryInstructions?: string;
  requiresCraneUnloading?: boolean;
  orderForSomeoneElse?: boolean;
}

export interface OrderItemResponse {
  orderItemId: number;
  productId: number;
  title: string;
  imageUrl?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  storeId?: number;
  storeName?: string;
  subtotal: number;
  discount?: number;
  taxableAmount?: number;
  totalGst?: number;
  freightCharge?: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryLocation?: string;
  deliverySlot?: string;
  itemCount?: number;
  items: OrderItemResponse[];
  createdAt: string;
  estimatedDelivery?: string;
}

export interface OrderTrackingCheckpoint {
  status: string;
  location: string;
  description: string;
  timestamp: string;
}

export interface OrderTrackingResponse {
  orderId: number;
  orderNumber: string;
  currentStatus: string;
  estimatedDelivery?: string;
  checkpoints: OrderTrackingCheckpoint[];
}

export interface OrderCancelRequest {
  description: string;
}

export interface OrderCancelResponse {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
}

// ============================================================
// Payment DTOs
// ============================================================
export interface RazorpayCreateOrderRequest {
  orderId: number;
}

export interface RazorpayCreateOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderId: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface RazorpayVerifyRequest {
  orderId: number;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RazorpayVerifyResponse {
  paymentId: string;
  orderId: number;
  status: string;
  amount: number;
  paymentMethod: string;
}
