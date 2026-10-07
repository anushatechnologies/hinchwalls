import { products, interiorProducts, categories, blogPosts, reviews } from '../data/mockData.ts';
import type { Product, Subcategory, CategoryData, SubcategoryCardItem } from '../types/index.ts';

// ============================================================
// EXACT SPECIFICATION SUBCATEGORIES FOR INTERIOR (categoryId: 16)
// ============================================================
export const interiorSubcategories: SubcategoryCardItem[] = [
  {
    subcategoryId: 101,
    categoryId: 16,
    name: 'Wood Work',
    slug: 'wood-work',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    productCount: 6,
    active: true,
  },
  {
    subcategoryId: 102,
    categoryId: 16,
    name: 'Decorative Panles',
    slug: 'decorative-panles',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
    productCount: 3,
    active: true,
  },
  {
    subcategoryId: 103,
    categoryId: 16,
    name: 'Laminates',
    slug: 'laminates',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
    productCount: 3,
    active: true,
  },
  {
    subcategoryId: 104,
    categoryId: 16,
    name: 'Power Tools',
    slug: 'power-tools',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
    productCount: 2,
    active: true,
  },
  {
    subcategoryId: 105,
    categoryId: 16,
    name: 'Kitchen',
    slug: 'kitchen',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
    productCount: 28,
    active: true,
  },
  {
    subcategoryId: 106,
    categoryId: 16,
    name: 'Bedroom',
    slug: 'bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&q=80',
    productCount: 0,
    active: true,
  },
  {
    subcategoryId: 109,
    categoryId: 16,
    name: 'Dining',
    slug: 'dining',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80',
    productCount: 31,
    active: true,
  },
  {
    subcategoryId: 110,
    categoryId: 16,
    name: 'Living',
    slug: 'living',
    imageUrl: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&q=80',
    productCount: 3,
    active: true,
  },
  {
    subcategoryId: 107,
    categoryId: 16,
    name: 'Kids Room',
    slug: 'kids-room',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80',
    productCount: 9,
    active: true,
  },
  {
    subcategoryId: 108,
    categoryId: 16,
    name: 'Decorative',
    slug: 'decorative',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    productCount: 18,
    active: true,
  },
];

// Export subcategories as Subcategory[] for legacy typings
export const subcategories: Subcategory[] = interiorSubcategories.map((s) => ({
  subcategoryId: Number(s.subcategoryId),
  categoryId: Number(s.categoryId),
  name: s.name,
  slug: s.slug,
  imageUrl: s.imageUrl,
  productCount: s.productCount,
  active: true,
}));

// Category Data for Interior (API 1 Specification)
export const interiorCategoryData: CategoryData = {
  categoryId: 16,
  name: 'Interior',
  slug: 'interior',
  description: 'Premium interior materials, panels, fixtures, and room furnishings',
  imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  productCount: 103,
  subcategories: interiorSubcategories,
};

// ============================================================
// DEDICATED PRODUCTS FOR THE INTERIOR SUBCATEGORIES SHOWCASE
// ============================================================
export const showcaseProducts: Product[] = [
  // ── Kids Room (subcategoryId: 107 - 8 Products) ──
  {
    id: '501',
    productId: 501,
    title: 'Kids Modular Study Table & Shelves',
    name: 'Kids Modular Study Table & Shelves',
    productName: 'Kids Modular Study Table & Shelves',
    slug: 'kids-modular-study-table',
    sku: 'INT-KD-001',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Kids Room',
    subcategoryId: 107,
    subcategoryName: 'Kids Room',
    price: 8999,
    mrp: 12499,
    originalPrice: 12499,
    discount: 28,
    description: 'Ergonomic modular study desk designed for children with adjustable heights, cable organizers, and built-in bookshelf cubbies.',
    shortDescription: 'Ergonomic modular study desk with adjustable bookshelf cubbies.',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80'],
    rating: 4.7,
    reviewCount: 38,
    stockQty: 15,
    stockCount: 15,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['kids', 'study table', 'interior', 'modular', 'desk'],
    sizes: [],
    colors: [
      { id: 'c1', name: 'Pastel Blue', hex: '#A0C4E2' },
      { id: 'c2', name: 'Warm Birch', hex: '#D8C3A5' },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-06-01',
  },
  {
    id: '502',
    productId: 502,
    title: 'Ergonomic Height-Adjustable Kids Desk Chair',
    name: 'Ergonomic Height-Adjustable Kids Desk Chair',
    productName: 'Ergonomic Height-Adjustable Kids Desk Chair',
    slug: 'ergonomic-kids-desk-chair',
    sku: 'INT-KD-002',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Kids Room',
    subcategoryId: 107,
    subcategoryName: 'Kids Room',
    price: 3499,
    mrp: 4999,
    originalPrice: 4999,
    discount: 30,
    description: 'Posturally aligned study chair with breathable mesh backing and smooth casters for active youngsters.',
    shortDescription: 'Posturally aligned study chair with breathable mesh backing.',
    imageUrl: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?w=600&q=80'],
    rating: 4.8,
    reviewCount: 22,
    stockQty: 22,
    stockCount: 22,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: false,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['kids', 'chair', 'ergonomic'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-12',
    updatedAt: '2024-06-02',
  },
  {
    id: '503',
    productId: 503,
    title: 'Pastel Modular Toy Storage Organizer Unit',
    name: 'Pastel Modular Toy Storage Organizer Unit',
    productName: 'Pastel Modular Toy Storage Organizer Unit',
    slug: 'pastel-toy-storage-organizer',
    sku: 'INT-KD-003',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Kids Room',
    subcategoryId: 107,
    subcategoryName: 'Kids Room',
    price: 4299,
    mrp: 5999,
    originalPrice: 5999,
    discount: 28,
    description: 'Multi-bin storage rack made from non-toxic engineered wood with rounded safety corners for effortless cleanup.',
    shortDescription: 'Multi-bin storage rack with rounded safety corners.',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80'],
    rating: 4.6,
    reviewCount: 15,
    stockQty: 18,
    stockCount: 18,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: false,
    isBestSeller: false,
    isNew: true,
    isSale: false,
    isCustomizable: false,
    tags: ['kids', 'storage', 'toys', 'organizer'],
    sizes: [],
    colors: [],
    createdAt: '2024-03-01',
    updatedAt: '2024-06-03',
  },
  {
    id: '504',
    productId: 504,
    title: 'Solid Pine Wood Bunk Bed with Safety Rails',
    name: 'Solid Pine Wood Bunk Bed with Safety Rails',
    productName: 'Solid Pine Wood Bunk Bed with Safety Rails',
    slug: 'pine-wood-bunk-bed',
    sku: 'INT-KD-004',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Kids Room',
    subcategoryId: 107,
    subcategoryName: 'Kids Room',
    price: 21999,
    mrp: 28999,
    originalPrice: 28999,
    discount: 24,
    description: 'Heavy-duty Scandinavian pine wood twin bunk bed with integrated anti-slip ladder and guard rails.',
    shortDescription: 'Heavy-duty Scandinavian pine wood twin bunk bed with safety rails.',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80'],
    rating: 4.9,
    reviewCount: 42,
    stockQty: 8,
    stockCount: 8,
    inStock: true,
    brand: 'Durian Living',
    brandName: 'Durian Living',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['kids', 'bed', 'bunk bed', 'wood'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-18',
    updatedAt: '2024-06-04',
  },
  {
    id: '505',
    productId: 505,
    title: 'Glow-in-the-Dark Celestial Constellation Wall Mural',
    name: 'Glow-in-the-Dark Celestial Constellation Wall Mural',
    productName: 'Glow-in-the-Dark Celestial Constellation Wall Mural',
    slug: 'celestial-constellation-wall-mural',
    sku: 'INT-KD-005',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Kids Room',
    subcategoryId: 107,
    subcategoryName: 'Kids Room',
    price: 1499,
    mrp: 2199,
    originalPrice: 2199,
    discount: 31,
    description: 'Self-adhesive peel-and-stick matte vinyl mural with photo-luminescent stars that emit a calming nighttime glow.',
    shortDescription: 'Self-adhesive peel-and-stick photo-luminescent star mural.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80'],
    rating: 4.8,
    reviewCount: 56,
    stockQty: 35,
    stockCount: 35,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: true,
    isBestSeller: false,
    isNew: true,
    isSale: false,
    isCustomizable: true,
    tags: ['mural', 'kids', 'stars', 'glow in dark'],
    sizes: [],
    colors: [],
    createdAt: '2024-03-15',
    updatedAt: '2024-06-05',
  },
  {
    id: '506',
    productId: 506,
    title: 'Magnetic Chalkboard Wall Panel Decal Set',
    name: 'Magnetic Chalkboard Wall Panel Decal Set',
    productName: 'Magnetic Chalkboard Wall Panel Decal Set',
    slug: 'magnetic-chalkboard-wall-panel',
    sku: 'INT-KD-006',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Kids Room',
    subcategoryId: 107,
    subcategoryName: 'Kids Room',
    price: 1899,
    mrp: 2499,
    originalPrice: 2499,
    discount: 24,
    description: 'Repositionable magnetic dry-erase and chalkboard surface for creative wall art, drawing, and school planning.',
    shortDescription: 'Repositionable magnetic dry-erase and chalkboard surface.',
    imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80'],
    rating: 4.5,
    reviewCount: 19,
    stockQty: 27,
    stockCount: 27,
    inStock: true,
    brand: 'Asian Paints',
    brandName: 'Asian Paints',
    featured: false,
    isBestSeller: false,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['kids', 'chalkboard', 'magnetic', 'decal'],
    sizes: [],
    colors: [],
    createdAt: '2024-04-01',
    updatedAt: '2024-06-06',
  },
  {
    id: '507',
    productId: 507,
    title: 'Scandinavian Cloud Floating Bookshelf (Set of 3)',
    name: 'Scandinavian Cloud Floating Bookshelf (Set of 3)',
    productName: 'Scandinavian Cloud Floating Bookshelf (Set of 3)',
    slug: 'scandinavian-cloud-floating-bookshelf',
    sku: 'INT-KD-007',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Kids Room',
    subcategoryId: 107,
    subcategoryName: 'Kids Room',
    price: 2299,
    mrp: 3199,
    originalPrice: 3199,
    discount: 28,
    description: 'Charming cloud-shaped white lacquered floating shelves for storybooks and plush stuffed animals.',
    shortDescription: 'Charming cloud-shaped white lacquered floating shelves.',
    imageUrl: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80'],
    rating: 4.7,
    reviewCount: 31,
    stockQty: 14,
    stockCount: 14,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: false,
    isBestSeller: false,
    isNew: true,
    isSale: false,
    isCustomizable: false,
    tags: ['kids', 'shelves', 'floating', 'cloud'],
    sizes: [],
    colors: [],
    createdAt: '2024-04-10',
    updatedAt: '2024-06-07',
  },
  {
    id: '508',
    productId: 508,
    title: 'Hypoallergenic Anti-Skid Playroom Area Rug',
    name: 'Hypoallergenic Anti-Skid Playroom Area Rug',
    productName: 'Hypoallergenic Anti-Skid Playroom Area Rug',
    slug: 'anti-skid-playroom-area-rug',
    sku: 'INT-KD-008',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Kids Room',
    subcategoryId: 107,
    subcategoryName: 'Kids Room',
    price: 2799,
    mrp: 3999,
    originalPrice: 3999,
    discount: 30,
    description: 'Ultra-soft microfiber floor rug with non-skid TPR rubber backing, machine washable and spill resistant.',
    shortDescription: 'Ultra-soft microfiber floor rug with non-skid rubber backing.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'],
    rating: 4.9,
    reviewCount: 47,
    stockQty: 19,
    stockCount: 19,
    inStock: true,
    brand: 'Durian Living',
    brandName: 'Durian Living',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['kids', 'rug', 'carpet', 'playroom'],
    sizes: [],
    colors: [],
    createdAt: '2024-04-18',
    updatedAt: '2024-06-08',
  },

  // ── Wood Work (subcategoryId: 101 - 6 Products) ──
  {
    id: '601',
    productId: 601,
    title: 'Teak Wood Architectural Fluted Wall Battens',
    name: 'Teak Wood Architectural Fluted Wall Battens',
    slug: 'teak-wood-fluted-wall-battens',
    sku: 'INT-WW-001',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Wood Work',
    subcategoryId: 101,
    subcategoryName: 'Wood Work',
    price: 4499,
    mrp: 5999,
    originalPrice: 5999,
    discount: 25,
    description: 'Solid Burmese teak wood wall panelling battens with natural grain sealer for luxury feature walls.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'],
    rating: 4.8,
    reviewCount: 30,
    stockQty: 30,
    stockCount: 30,
    inStock: true,
    brand: 'Greenlam Woodcraft',
    brandName: 'Greenlam Woodcraft',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: true,
    tags: ['wood work', 'teak', 'battens'],
    sizes: [],
    colors: [],
    createdAt: '2024-01-15',
    updatedAt: '2024-06-01',
  },
  {
    id: '602',
    productId: 602,
    title: 'Solid White Oak Acoustic Slat Wall Panel',
    name: 'Solid White Oak Acoustic Slat Wall Panel',
    slug: 'solid-white-oak-acoustic-slat-panel',
    sku: 'INT-WW-002',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Wood Work',
    subcategoryId: 101,
    subcategoryName: 'Wood Work',
    price: 6299,
    mrp: 7999,
    originalPrice: 7999,
    discount: 21,
    description: 'Sound-dampening acoustic felt backing surfaced with genuine white oak veneer slats.',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&q=80'],
    rating: 4.9,
    reviewCount: 24,
    stockQty: 24,
    stockCount: 24,
    inStock: true,
    brand: 'Greenlam Woodcraft',
    brandName: 'Greenlam Woodcraft',
    featured: true,
    isBestSeller: true,
    isNew: true,
    isSale: false,
    isCustomizable: false,
    tags: ['wood work', 'oak', 'acoustic'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-05',
    updatedAt: '2024-06-02',
  },
  {
    id: '603',
    productId: 603,
    title: 'Smoked Walnut Veneer Sheet (8x4 Ft)',
    name: 'Smoked Walnut Veneer Sheet (8x4 Ft)',
    slug: 'smoked-walnut-veneer-sheet',
    sku: 'INT-WW-003',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Wood Work',
    subcategoryId: 101,
    subcategoryName: 'Wood Work',
    price: 3899,
    mrp: 4800,
    originalPrice: 4800,
    discount: 19,
    description: 'Fumed natural walnut wood sheet with book-matched crown cut grain pattern.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80'],
    rating: 4.7,
    reviewCount: 18,
    stockQty: 40,
    stockCount: 40,
    inStock: true,
    brand: 'CenturyPly',
    brandName: 'CenturyPly',
    featured: false,
    isBestSeller: false,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['wood work', 'veneer', 'walnut'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-20',
    updatedAt: '2024-06-03',
  },
  {
    id: '604',
    productId: 604,
    title: 'Engineered Pine Wood Trim Moulding Pack',
    name: 'Engineered Pine Wood Trim Moulding Pack',
    slug: 'pine-wood-trim-moulding-pack',
    sku: 'INT-WW-004',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Wood Work',
    subcategoryId: 101,
    subcategoryName: 'Wood Work',
    price: 1899,
    mrp: 2499,
    originalPrice: 2499,
    discount: 24,
    description: 'Kiln-dried finger-jointed pine wood baseboards and crown cornices for seamless wall transitions.',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&q=80'],
    rating: 4.6,
    reviewCount: 12,
    stockQty: 50,
    stockCount: 50,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: false,
    isBestSeller: false,
    isNew: false,
    isSale: false,
    isCustomizable: false,
    tags: ['wood work', 'moulding', 'pine'],
    sizes: [],
    colors: [],
    createdAt: '2024-03-10',
    updatedAt: '2024-06-04',
  },
  {
    id: '605',
    productId: 605,
    title: 'Bespoke Fluted Partition Screen Dividers',
    name: 'Bespoke Fluted Partition Screen Dividers',
    slug: 'fluted-partition-screen-dividers',
    sku: 'INT-WW-005',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Wood Work',
    subcategoryId: 101,
    subcategoryName: 'Wood Work',
    price: 14500,
    mrp: 18500,
    originalPrice: 18500,
    discount: 22,
    description: 'Custom floor-to-ceiling wooden divider screen for zoning living and dining areas.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80'],
    rating: 4.8,
    reviewCount: 14,
    stockQty: 10,
    stockCount: 10,
    inStock: true,
    brand: 'Greenlam Woodcraft',
    brandName: 'Greenlam Woodcraft',
    featured: false,
    isBestSeller: true,
    isNew: true,
    isSale: true,
    isCustomizable: true,
    tags: ['wood work', 'partition', 'divider'],
    sizes: [],
    colors: [],
    createdAt: '2024-03-25',
    updatedAt: '2024-06-05',
  },
  {
    id: '606',
    productId: 606,
    title: 'Charcoal Treated Cedar Accent Wall Planks',
    name: 'Charcoal Treated Cedar Accent Wall Planks',
    slug: 'charcoal-treated-cedar-accent-planks',
    sku: 'INT-WW-006',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Wood Work',
    subcategoryId: 101,
    subcategoryName: 'Wood Work',
    price: 5499,
    mrp: 6999,
    originalPrice: 6999,
    discount: 21,
    description: 'Yakisugi style Japanese charred cedar wood planks with textured carbon grain finish.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'],
    rating: 4.7,
    reviewCount: 16,
    stockQty: 16,
    stockCount: 16,
    inStock: true,
    brand: 'CenturyPly',
    brandName: 'CenturyPly',
    featured: false,
    isBestSeller: false,
    isNew: false,
    isSale: false,
    isCustomizable: false,
    tags: ['wood work', 'cedar', 'charcoal'],
    sizes: [],
    colors: [],
    createdAt: '2024-04-05',
    updatedAt: '2024-06-06',
  },

  // ── Decorative Panels (subcategoryId: 102 - 3 Products) ──
  {
    id: '611',
    productId: 611,
    title: '3D Geometric Embossed Acoustic Wall Tiles',
    name: '3D Geometric Embossed Acoustic Wall Tiles',
    slug: '3d-geometric-acoustic-wall-tiles',
    sku: 'INT-DP-001',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Decorative Panels',
    subcategoryId: 102,
    subcategoryName: 'Decorative Panels',
    price: 3499,
    mrp: 4500,
    originalPrice: 4500,
    discount: 22,
    description: 'Dimensional poly-fiber 3D tiles with sound absorbing cavities for contemporary modern interiors.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80'],
    rating: 4.9,
    reviewCount: 25,
    stockQty: 25,
    stockCount: 25,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['decorative panels', '3d', 'acoustic'],
    sizes: [],
    colors: [],
    createdAt: '2024-01-20',
    updatedAt: '2024-06-01',
  },
  {
    id: '612',
    productId: 612,
    title: 'Ultra-Light PU Stone Charcoal Cladding Sheet',
    name: 'Ultra-Light PU Stone Charcoal Cladding Sheet',
    slug: 'pu-stone-charcoal-cladding-sheet',
    sku: 'INT-DP-002',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Decorative Panels',
    subcategoryId: 102,
    subcategoryName: 'Decorative Panels',
    price: 4899,
    mrp: 6200,
    originalPrice: 6200,
    discount: 21,
    description: 'Realistic volcanic ledge stone replica manufactured from lightweight fire-retardant polyurethane.',
    imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80'],
    rating: 4.8,
    reviewCount: 20,
    stockQty: 20,
    stockCount: 20,
    inStock: true,
    brand: 'Kajaria',
    brandName: 'Kajaria',
    featured: true,
    isBestSeller: false,
    isNew: true,
    isSale: false,
    isCustomizable: false,
    tags: ['decorative panels', 'stone', 'cladding'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-14',
    updatedAt: '2024-06-02',
  },
  {
    id: '613',
    productId: 613,
    title: 'Brushed Brass Metal Inlay Wall Fluted Panels',
    name: 'Brushed Brass Metal Inlay Wall Fluted Panels',
    slug: 'brushed-brass-metal-inlay-fluted-panels',
    sku: 'INT-DP-003',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Decorative Panels',
    subcategoryId: 102,
    subcategoryName: 'Decorative Panels',
    price: 6999,
    mrp: 8999,
    originalPrice: 8999,
    discount: 22,
    description: 'Architectural charcoal MDF panels accented with satin gold brushed brass channel inlays.',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80'],
    rating: 4.7,
    reviewCount: 15,
    stockQty: 15,
    stockCount: 15,
    inStock: true,
    brand: 'CenturyPly',
    brandName: 'CenturyPly',
    featured: false,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['decorative panels', 'brass', 'inlay'],
    sizes: [],
    colors: [],
    createdAt: '2024-03-05',
    updatedAt: '2024-06-03',
  },

  // ── Laminates (subcategoryId: 103 - 3 Products) ──
  {
    id: '621',
    productId: 621,
    title: 'Calacatta Gold High-Gloss Acrylic Laminate (8x4 Ft)',
    name: 'Calacatta Gold High-Gloss Acrylic Laminate (8x4 Ft)',
    slug: 'calacatta-gold-high-gloss-laminate',
    sku: 'INT-LM-001',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Laminates',
    subcategoryId: 103,
    subcategoryName: 'Laminates',
    price: 2899,
    mrp: 3799,
    originalPrice: 3799,
    discount: 24,
    description: 'Mirror-finish Italian marble look sheet with scratch-resistant antibacterial top layer.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'],
    rating: 4.8,
    reviewCount: 45,
    stockQty: 45,
    stockCount: 45,
    inStock: true,
    brand: 'Greenlam Woodcraft',
    brandName: 'Greenlam Woodcraft',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['laminates', 'marble', 'high-gloss'],
    sizes: [],
    colors: [],
    createdAt: '2024-01-18',
    updatedAt: '2024-06-01',
  },
  {
    id: '622',
    productId: 622,
    title: 'Velvet Matte Anti-Fingerprint Charcoal Sheet',
    name: 'Velvet Matte Anti-Fingerprint Charcoal Sheet',
    slug: 'velvet-matte-charcoal-sheet',
    sku: 'INT-LM-002',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Laminates',
    subcategoryId: 103,
    subcategoryName: 'Laminates',
    price: 3199,
    mrp: 4100,
    originalPrice: 4100,
    discount: 22,
    description: 'Thermal-healing super-matte laminate that eliminates smudges and finger marks.',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80'],
    rating: 4.9,
    reviewCount: 32,
    stockQty: 32,
    stockCount: 32,
    inStock: true,
    brand: 'CenturyPly',
    brandName: 'CenturyPly',
    featured: true,
    isBestSeller: false,
    isNew: true,
    isSale: false,
    isCustomizable: false,
    tags: ['laminates', 'matte', 'charcoal'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-19',
    updatedAt: '2024-06-02',
  },
  {
    id: '623',
    productId: 623,
    title: 'Rustic Natural Oak Synchronized Textured Laminate',
    name: 'Rustic Natural Oak Synchronized Textured Laminate',
    slug: 'rustic-natural-oak-textured-laminate',
    sku: 'INT-LM-003',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Laminates',
    subcategoryId: 103,
    subcategoryName: 'Laminates',
    price: 2599,
    mrp: 3300,
    originalPrice: 3300,
    discount: 21,
    description: 'Deep pore woodgrain embossing synchronized precisely to the wood print.',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&q=80'],
    rating: 4.7,
    reviewCount: 28,
    stockQty: 28,
    stockCount: 28,
    inStock: true,
    brand: 'Greenlam Woodcraft',
    brandName: 'Greenlam Woodcraft',
    featured: false,
    isBestSeller: false,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['laminates', 'oak', 'textured'],
    sizes: [],
    colors: [],
    createdAt: '2024-03-12',
    updatedAt: '2024-06-03',
  },

  // ── Power Tools (subcategoryId: 104 - 2 Products) ──
  {
    id: '631',
    productId: 631,
    title: 'Bosch Professional GSB 550 Impact Drill Kit (13mm)',
    name: 'Bosch Professional GSB 550 Impact Drill Kit (13mm)',
    slug: 'bosch-gsb-550-impact-drill-kit',
    sku: 'INT-PT-001',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Power Tools',
    subcategoryId: 104,
    subcategoryName: 'Power Tools',
    price: 3499,
    mrp: 4699,
    originalPrice: 4699,
    discount: 26,
    description: '550W high-speed variable speed rotary percussion hammer drill with carrying kit and 40 drill accessory bits.',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80'],
    rating: 4.8,
    reviewCount: 35,
    stockQty: 35,
    stockCount: 35,
    inStock: true,
    brand: 'Bosch',
    brandName: 'Bosch',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['power tools', 'drill', 'bosch'],
    sizes: [],
    colors: [],
    createdAt: '2024-01-22',
    updatedAt: '2024-06-01',
  },
  {
    id: '632',
    productId: 632,
    title: 'DeWalt 20V Max Brushless Cordless Circular Saw',
    name: 'DeWalt 20V Max Brushless Cordless Circular Saw',
    slug: 'dewalt-20v-brushless-circular-saw',
    sku: 'INT-PT-002',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Power Tools',
    subcategoryId: 104,
    subcategoryName: 'Power Tools',
    price: 12499,
    mrp: 15999,
    originalPrice: 15999,
    discount: 22,
    description: 'High-torque wood cutting circular saw with electric brake, bevel cutting guide and laser cut illumination.',
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&q=80'],
    rating: 4.9,
    reviewCount: 18,
    stockQty: 18,
    stockCount: 18,
    inStock: true,
    brand: 'DeWalt',
    brandName: 'DeWalt',
    featured: false,
    isBestSeller: true,
    isNew: true,
    isSale: false,
    isCustomizable: false,
    tags: ['power tools', 'saw', 'dewalt'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-28',
    updatedAt: '2024-06-02',
  },

  // ── Kitchen (subcategoryId: 105 - 28 Products generator) ──
  ...Array.from({ length: 28 }, (_, i) => {
    const titles = [
      'Modular Acrylic Soft-Close Kitchen Wall Cabinet',
      'Engineered Quartz Countertop Slab (Calacatta Gold)',
      'Under-Cabinet Dimmable Warm LED Linear Profile Light',
      'Dual-Bowl 304 Stainless Steel Kitchen Sink with Drainer',
      'Matte Black Pull-Down Swivel Kitchen Mixer Faucet',
      'Heavy-Duty Stainless Steel Pull-Out Pantry Organizer Rack',
      'Soft-Close Corner Carousel Magic Corner Unit',
      'Tempered Glass Kitchen Backsplash Splashback Panel',
      'Solid Brass Kitchen Cabinet Bar Pulls (Pack of 10)',
      'Built-in Dish Rack Drainer Shelf with Drip Tray',
    ];
    const brands = ['HinchCraft', 'Kajaria', 'Bosch', 'Asian Paints', 'Greenlam Woodcraft'];
    const pId = 701 + i;
    const title = titles[i % titles.length] + (i >= 10 ? ` - Series ${Math.floor(i / 10) + 1}` : '');
    const price = 1200 + (i * 450);
    const mrp = Math.round(price * 1.3);
    return {
      id: String(pId),
      productId: pId,
      title,
      name: title,
      productName: title,
      slug: `kitchen-item-${pId}`,
      sku: `INT-KT-${String(i + 1).padStart(3, '0')}`,
      category: 'Interior',
      categoryId: 16,
      subcategory: 'Kitchen',
      subcategoryId: 105,
      subcategoryName: 'Kitchen',
      price,
      mrp,
      originalPrice: mrp,
      discount: Math.round(((mrp - price) / mrp) * 100),
      description: `High-durability kitchen interior component engineered for humidity resistance, stain resistance, and sleek contemporary aesthetics.`,
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80',
      images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80'],
      rating: parseFloat((4.4 + (i % 6) * 0.1).toFixed(1)),
      reviewCount: 10 + i * 3,
      stockQty: 10 + (i % 25),
      stockCount: 10 + (i % 25),
      inStock: true,
      brand: brands[i % brands.length],
      brandName: brands[i % brands.length],
      featured: i < 4,
      isBestSeller: i % 3 === 0,
      isNew: i % 4 === 0,
      isSale: i % 2 === 0,
      isCustomizable: false,
      tags: ['kitchen', 'interior', 'modular'],
      sizes: [],
      colors: [],
      createdAt: '2024-03-01',
      updatedAt: '2024-06-01',
    };
  }),

  // ── Balcony (subcategoryId: 108 - 5 Products) ──
  {
    id: '801',
    productId: 801,
    title: 'Weatherproof WPC Interlocking Deck Tiles (Pack of 11)',
    name: 'Weatherproof WPC Interlocking Deck Tiles (Pack of 11)',
    slug: 'wpc-interlocking-balcony-deck-tiles',
    sku: 'INT-BC-001',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Balcony',
    subcategoryId: 108,
    subcategoryName: 'Balcony',
    price: 3299,
    mrp: 4499,
    originalPrice: 4499,
    discount: 27,
    description: 'UV-stabilized wood-plastic composite snap-lock tiles for fast, tool-free balcony terrace flooring.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80'],
    rating: 4.8,
    reviewCount: 32,
    stockQty: 24,
    stockCount: 24,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['balcony', 'deck tiles', 'flooring'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-10',
    updatedAt: '2024-06-01',
  },
  {
    id: '802',
    productId: 802,
    title: 'High-Density Artificial Turf Grass Carpet (40mm)',
    name: 'High-Density Artificial Turf Grass Carpet (40mm)',
    slug: 'high-density-artificial-turf-grass',
    sku: 'INT-BC-002',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Balcony',
    subcategoryId: 108,
    subcategoryName: 'Balcony',
    price: 1899,
    mrp: 2699,
    originalPrice: 2699,
    discount: 30,
    description: 'Four-tone lush synthetic turf with drainage holes and fire-retardant backing.',
    imageUrl: 'https://images.unsplash.com/photo-1558904541-efa8c4a52d31?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1558904541-efa8c4a52d31?w=600&q=80'],
    rating: 4.7,
    reviewCount: 40,
    stockQty: 30,
    stockCount: 30,
    inStock: true,
    brand: 'Asian Paints',
    brandName: 'Asian Paints',
    featured: true,
    isBestSeller: true,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['balcony', 'grass', 'turf'],
    sizes: [],
    colors: [],
    createdAt: '2024-02-25',
    updatedAt: '2024-06-02',
  },
  {
    id: '803',
    productId: 803,
    title: 'Outdoor Wall-Mounted Vertical Herb Planter Frame',
    name: 'Outdoor Wall-Mounted Vertical Herb Planter Frame',
    slug: 'wall-mounted-vertical-herb-planter',
    sku: 'INT-BC-003',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Balcony',
    subcategoryId: 108,
    subcategoryName: 'Balcony',
    price: 2499,
    mrp: 3299,
    originalPrice: 3299,
    discount: 24,
    description: 'Anti-corrosion powder-coated steel modular vertical garden trellis with self-watering pots.',
    imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80'],
    rating: 4.6,
    reviewCount: 17,
    stockQty: 18,
    stockCount: 18,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: false,
    isBestSeller: false,
    isNew: true,
    isSale: false,
    isCustomizable: false,
    tags: ['balcony', 'planter', 'garden'],
    sizes: [],
    colors: [],
    createdAt: '2024-03-12',
    updatedAt: '2024-06-03',
  },
  {
    id: '804',
    productId: 804,
    title: 'Wrought Iron Railing Hanging Planter Boxes (Set of 2)',
    name: 'Wrought Iron Railing Hanging Planter Boxes (Set of 2)',
    slug: 'railing-hanging-planter-boxes',
    sku: 'INT-BC-004',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Balcony',
    subcategoryId: 108,
    subcategoryName: 'Balcony',
    price: 1599,
    mrp: 2199,
    originalPrice: 2199,
    discount: 27,
    description: 'Sturdy balcony railing planter brackets with coco coir liners and rust-proof finish.',
    imageUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=600&q=80'],
    rating: 4.5,
    reviewCount: 22,
    stockQty: 25,
    stockCount: 25,
    inStock: true,
    brand: 'HinchCraft',
    brandName: 'HinchCraft',
    featured: false,
    isBestSeller: false,
    isNew: false,
    isSale: true,
    isCustomizable: false,
    tags: ['balcony', 'railing', 'planter'],
    sizes: [],
    colors: [],
    createdAt: '2024-03-28',
    updatedAt: '2024-06-04',
  },
  {
    id: '805',
    productId: 805,
    title: 'Teak Wood Folding Balcony Bistro Table & 2 Chairs',
    name: 'Teak Wood Folding Balcony Bistro Table & 2 Chairs',
    slug: 'teak-folding-balcony-bistro-set',
    sku: 'INT-BC-005',
    category: 'Interior',
    categoryId: 16,
    subcategory: 'Balcony',
    subcategoryId: 108,
    subcategoryName: 'Balcony',
    price: 8999,
    mrp: 11999,
    originalPrice: 11999,
    discount: 25,
    description: 'Compact space-saving folding table and chairs set crafted from weather-treated plantation teak wood.',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80'],
    rating: 4.9,
    reviewCount: 29,
    stockQty: 12,
    stockCount: 12,
    inStock: true,
    brand: 'Durian Living',
    brandName: 'Durian Living',
    featured: true,
    isBestSeller: true,
    isNew: true,
    isSale: false,
    isCustomizable: false,
    tags: ['balcony', 'furniture', 'teak'],
    sizes: [],
    colors: [],
    createdAt: '2024-04-10',
    updatedAt: '2024-06-05',
  },
];

// Unified catalog combining showcase products, legacy products, and interior items
export const allProducts: Product[] = [
  ...showcaseProducts,
  ...products.filter((p) => !showcaseProducts.some((sp) => sp.id === p.id)),
];

// Unified categories list
export const allCategories: any[] = [
  {
    id: 'cat-interior',
    categoryId: 16,
    name: 'Interior',
    slug: 'interior',
    description: 'Premium interior materials, panels, fixtures, and room furnishings',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    productCount: 42,
    active: true,
    subcategories: interiorSubcategories,
  },
  {
    id: 'cat-delivery',
    categoryId: 100,
    name: '24 hrs Delivery',
    slug: '24-hrs-delivery',
    description: 'Express 24 hrs procurement and delivery',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&q=80',
    productCount: 45,
    active: true,
  },
  {
    id: 'cat-electrical',
    categoryId: 1,
    name: 'Electrical',
    slug: 'electrical',
    description: 'Switches, wiring, MCBs, distribution boards & industrial cabling',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&q=80',
    productCount: 85,
    active: true,
  },
  {
    id: 'cat-hardware',
    categoryId: 2,
    name: 'Hardware',
    slug: 'hardware',
    description: 'Door handles, hinges, architectural hardware & fasteners',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=400&q=80',
    productCount: 64,
    active: true,
  },
  {
    id: 'cat-plumbing',
    categoryId: 3,
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'CPVC pipes, fittings, valves, bath fittings & sanitaryware',
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80',
    productCount: 52,
    active: true,
  },
  {
    id: 'cat-power-tools',
    categoryId: 5,
    name: 'Power Tools',
    slug: 'power-tools',
    description: 'Drills, cutters, angle grinders, sanders & jobsite tools',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80',
    productCount: 40,
    active: true,
  },
  {
    id: 'cat-exterior',
    categoryId: 6,
    name: 'Exterior',
    slug: 'exterior',
    description: 'Exterior coatings, weatherproof cladding, pavers & roofing',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&q=80',
    productCount: 30,
    active: true,
  },
  {
    id: 'cat-furniture',
    categoryId: 7,
    name: 'Furniture',
    slug: 'furniture',
    description: 'Office desks, ergonomic seating, bedroom suites & living furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    productCount: 48,
    active: true,
  },
  {
    id: 'cat-paints',
    categoryId: 8,
    name: 'paints',
    slug: 'paints',
    description: 'Luxury emulsions, primers, enamels, waterproofing & tints',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&q=80',
    productCount: 92,
    active: true,
  },
  {
    id: 'cat-home-decor',
    categoryId: 9,
    name: 'Home Decor',
    slug: 'home-decor',
    description: 'Wall decals, acoustic wall panels, murals & styling accents',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=400&q=80',
    productCount: 120,
    active: true,
  },
];

export interface ApiResponse {
  status: number;
  data: any;
  headers?: Record<string, string>;
}

export function handleApiRoute(urlStr: string, method = 'GET', _body?: any): ApiResponse {
  const parsedUrl = new URL(urlStr, 'http://localhost');
  const pathname = parsedUrl.pathname.replace(/^\/api/, '');
  const searchParams = parsedUrl.searchParams;

  // ============================================================
  // 1. GET /categories (Supports ?slug=interior & includeSubcategories=true)
  // ============================================================
  if (pathname === '/categories' && method === 'GET') {
    const slugQuery = searchParams.get('slug');
    if (slugQuery) {
      const matched = allCategories.find((c) => c.slug === slugQuery || c.name.toLowerCase() === slugQuery.toLowerCase());
      if (matched) {
        if (matched.slug === 'interior' || matched.categoryId === 16) {
          return {
            status: 200,
            data: {
              success: true,
              data: interiorCategoryData,
            },
          };
        }
        return {
          status: 200,
          data: {
            success: true,
            data: matched,
          },
        };
      }
      return { status: 404, data: { success: false, message: `Category '${slugQuery}' not found` } };
    }

    const activeOnly = searchParams.get('active') !== 'false';
    const list = activeOnly ? allCategories.filter((c) => c.active !== false) : allCategories;
    return {
      status: 200,
      data: {
        success: true,
        message: 'Categories retrieved successfully',
        data: list,
      },
    };
  }

  // 1b. GET /categories/:slugOrId (API 1: Get Category Details & Subcategories List)
  const catSlugOrIdMatch = pathname.match(/^\/categories\/([a-zA-Z0-9_-]+)$/);
  if (catSlugOrIdMatch && method === 'GET') {
    const slugOrId = catSlugOrIdMatch[1];
    if (slugOrId === 'interior' || slugOrId === '16' || slugOrId === '4') {
      return {
        status: 200,
        data: {
          success: true,
          data: interiorCategoryData,
        },
      };
    }

    const cat = allCategories.find(
      (c) => c.slug === slugOrId || String(c.categoryId) === slugOrId || c.id === slugOrId
    );
    if (cat) {
      return {
        status: 200,
        data: {
          success: true,
          message: 'Category retrieved successfully',
          data: cat,
        },
      };
    }
    return { status: 404, data: { success: false, message: `Category '${slugOrId}' not found` } };
  }

  // ============================================================
  // 2. GET /subcategories (API 2: Get Subcategories by Category)
  // Query Params: categoryId: 16, active: true
  // ============================================================
  const catSubcatsMatch = pathname.match(/^\/categories\/([a-zA-Z0-9_-]+)\/subcategories$/);
  if ((pathname === '/subcategories' || catSubcatsMatch) && method === 'GET') {
    let catId = searchParams.get('categoryId');
    if (!catId && catSubcatsMatch) {
      catId = catSubcatsMatch[1];
    }

    let result = [...interiorSubcategories];
    if (catId) {
      if (catId === '16' || catId === 'interior' || catId === '4') {
        result = interiorSubcategories;
      } else {
        const numId = parseInt(catId, 10);
        result = interiorSubcategories.filter((s) => Number(s.categoryId) === numId);
      }
    }

    return {
      status: 200,
      data: {
        success: true,
        data: result,
      },
    };
  }

  // 2b. GET /subcategories/:slugOrId
  // E.g. GET /api/subcategories/kids-room or GET /api/subcategories/107
  const subcatSlugOrIdMatch = pathname.match(/^\/subcategories\/([a-zA-Z0-9_-]+)$/);
  if (subcatSlugOrIdMatch && method === 'GET') {
    const slugOrId = subcatSlugOrIdMatch[1];
    const subcat = interiorSubcategories.find(
      (s) => s.slug === slugOrId || String(s.subcategoryId) === slugOrId || s.name.toLowerCase() === slugOrId.toLowerCase()
    );

    if (subcat) {
      return {
        status: 200,
        data: {
          success: true,
          data: subcat,
        },
      };
    }
    return { status: 404, data: { success: false, message: `Subcategory '${slugOrId}' not found` } };
  }

  // ============================================================
  // 3. GET /products (API 3: Get Products for Subcategory)
  // Query Params: categoryId, subcategoryId (or category, subcategory), page, limit, brand, sortBy
  // ============================================================
  const subcatProdsMatch = pathname.match(/^\/subcategories\/([a-zA-Z0-9_-]+)\/products$/);
  if ((pathname === '/products' || subcatProdsMatch) && method === 'GET') {
    let result = [...allProducts];

    let subcatParam = searchParams.get('subcategoryId') || searchParams.get('subcategory');
    if (!subcatParam && subcatProdsMatch) {
      subcatParam = subcatProdsMatch[1];
    }

    // Filter by Subcategory ID or Slug
    if (subcatParam) {
      const sIdNum = parseInt(subcatParam, 10);
      if (!isNaN(sIdNum)) {
        // Map legacy 1..10 to 101..108 if needed
        const mappedId = sIdNum < 100 ? sIdNum + 100 : sIdNum;
        result = result.filter(
          (p) => Number(p.subcategoryId) === sIdNum || Number(p.subcategoryId) === mappedId
        );
      } else {
        const subSlug = subcatParam.toLowerCase();
        result = result.filter(
          (p) =>
            p.subcategory?.toLowerCase() === subSlug ||
            p.subcategory?.toLowerCase().replace(/\s+/g, '-') === subSlug ||
            p.subcategoryName?.toLowerCase().replace(/\s+/g, '-') === subSlug
        );
      }
    }

    // Filter by Category
    const catParam = searchParams.get('categoryId') || searchParams.get('category');
    if (catParam) {
      const cIdNum = parseInt(catParam, 10);
      if (!isNaN(cIdNum)) {
        result = result.filter(
          (p) =>
            Number(p.categoryId) === cIdNum ||
            (cIdNum === 16 && (p.category.toLowerCase() === 'interior' || p.categoryName?.toLowerCase() === 'interior'))
        );
      } else {
        const catLower = catParam.toLowerCase();
        result = result.filter(
          (p) =>
            p.category.toLowerCase() === catLower ||
            p.categoryName?.toLowerCase() === catLower ||
            p.tags?.some((t) => t.toLowerCase() === catLower)
        );
      }
    }

    // Filter by Brand (API Spec)
    const brand = searchParams.get('brand');
    if (brand && brand !== 'all') {
      const brandLower = brand.toLowerCase();
      result = result.filter(
        (p) => p.brand?.toLowerCase() === brandLower || p.brandName?.toLowerCase() === brandLower
      );
    }

    // Filter by Min/Max Price
    const minPrice = searchParams.get('minPrice');
    if (minPrice) {
      result = result.filter((p) => p.price >= parseFloat(minPrice));
    }
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) {
      result = result.filter((p) => p.price <= parseFloat(maxPrice));
    }

    // Filter by Featured
    if (searchParams.get('featured') === 'true') {
      result = result.filter((p) => p.featured);
    }

    // Filter by Related
    const related = searchParams.get('related');
    if (related) {
      result = result.filter((p) => p.id !== related && String(p.productId) !== related);
    }

    // Sorting (API 3 Spec: sortBy: price_asc | price_desc | popular | newest)
    const sortBy = searchParams.get('sortBy') || searchParams.get('sort') || 'popular';
    switch (sortBy) {
      case 'price_asc':
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      case 'popular':
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'best-selling':
        result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
        break;
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '20', 10));
    const totalRecords = result.length;
    const paginated = result.slice((page - 1) * limit, page * limit);

    return {
      status: 200,
      data: {
        success: true,
        data: {
          products: paginated,
          total: totalRecords,
          pagination: {
            page,
            limit,
            totalPages: Math.ceil(totalRecords / limit) || 1,
            hasNext: page * limit < totalRecords,
            hasPrev: page > 1,
          },
        },
      },
    };
  }

  // ============================================================
  // 4. GET /products/:id (STEP 4: Product Details)
  // ============================================================
  const prodIdOrSlugMatch = pathname.match(/^\/products\/([a-zA-Z0-9_-]+)$/);
  if (prodIdOrSlugMatch && method === 'GET') {
    const idOrSlug = prodIdOrSlugMatch[1];
    const product = allProducts.find(
      (p) => String(p.productId) === idOrSlug || p.id === idOrSlug || p.slug === idOrSlug
    );

    if (product) {
      return {
        status: 200,
        data: {
          success: true,
          message: 'Product retrieved successfully',
          data: product,
        },
      };
    }
    return { status: 404, data: { success: false, message: `Product '${idOrSlug}' not found` } };
  }

  // 5. GET /products/:id/reviews
  const prodReviewsMatch = pathname.match(/^\/products\/([a-zA-Z0-9_-]+)\/reviews$/);
  if (prodReviewsMatch && method === 'GET') {
    const pId = prodReviewsMatch[1];
    const pReviews = reviews.filter((r) => r.productId === pId || r.productId === `p${pId}`);
    return {
      status: 200,
      data: {
        success: true,
        message: 'Reviews retrieved successfully',
        data: pReviews,
      },
    };
  }

  // 6. GET /blog
  if (pathname === '/blog' && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        data: {
          posts: blogPosts,
          total: blogPosts.length,
        },
      },
    };
  }

  // 7. GET /orders & POST /orders
  if (pathname === '/orders' && method === 'GET') {
    return {
      status: 200,
      data: {
        success: true,
        message: 'Orders retrieved successfully',
        data: [
          { orderId: 101, orderNumber: 'ORD-8941', customerName: 'Alex Johnson', totalAmount: 74.97, status: 'Processing', createdAt: new Date().toISOString() },
          { orderId: 102, orderNumber: 'ORD-8942', customerName: 'Elena Rostova', totalAmount: 129.50, status: 'Confirmed', createdAt: new Date().toISOString() },
          { orderId: 103, orderNumber: 'ORD-8943', customerName: 'Marcus Vance', totalAmount: 44.99, status: 'Shipped', createdAt: new Date().toISOString() },
          { orderId: 104, orderNumber: 'ORD-8944', customerName: 'Chloe Bennett', totalAmount: 215.00, status: 'Delivered', createdAt: new Date().toISOString() },
          { orderId: 105, orderNumber: 'ORD-8945', customerName: 'David Kim', totalAmount: 38.00, status: 'Delivered', createdAt: new Date().toISOString() },
        ],
      },
    };
  }

  if (pathname === '/orders' && method === 'POST') {
    return {
      status: 201,
      data: {
        success: true,
        message: 'Order created successfully',
        data: {
          orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'Confirmed',
          estimatedDelivery: '3-5 business days',
        },
      },
    };
  }

  return { status: 404, data: { success: false, message: `Route ${method} ${pathname} not found` } };
}
