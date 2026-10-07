import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { productApi, categoryApi } from '../../api';
import type { Product, Category } from '../../types';

export const AdminProducts: React.FC = () => {
  const [productList, setProductList] = useState<Product[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    productApi.getAll({ limit: 100 }).then((res) => setProductList(res.products));
    categoryApi.getAll().then((res) => setCategoryList(res));
  }, []);

  // New product form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Home Decor');
  const [price, setPrice] = useState(29.99);
  const [sku, setSku] = useState(`DEC-${Math.floor(1000 + Math.random() * 9000)}`);
  const [shortDescription, setShortDescription] = useState('');
  const [inStock, setInStock] = useState(true);

  const filtered = productList.filter((p) => {
    const matchCat = selectedCat === 'All' || p.category === selectedCat;
    const matchSearch =
      !searchTerm.trim() ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this product from catalog?')) {
      setProductList(productList.filter((p) => p.id !== id));
      toast.success('Product deleted from catalog');
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error('Please enter product name and price');
      return;
    }

    const newProd: Product = {
      id: `p-${Date.now()}`,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      name,
      description: `${name} is handcrafted with premium non-toxic matte vinyl.`,
      shortDescription: shortDescription || `${name} for interior wall transformation.`,
      price: Number(price),
      sku,
      category,
      tags: [category.toLowerCase(), 'new'],
      images: [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
      ],
      rating: 5.0,
      reviewCount: 0,
      inStock,
      stockCount: 50,
      featured: false,
      isNew: true,
      isBestSeller: false,
      isSale: false,
      isCustomizable: false,
      sizes: [
        { id: 's1', label: 'Medium (24" × 18")', value: '24x18', priceModifier: 0 },
        { id: 's2', label: 'Large (36" × 24")', value: '36x24', priceModifier: 15 },
      ],
      colors: [
        { id: 'c1', name: 'Matte Charcoal', hex: '#2C2C2C' },
        { id: 'c2', name: 'Warm Terracotta', hex: '#C4704F' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProductList([newProd, ...productList]);
    toast.success(`Product "${name}" added to catalog!`);
    setShowAddModal(false);
    setName('');
    setPrice(29.99);
    setShortDescription('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
            Product Catalog Management
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Total of {productList.length} active wall decal designs in store.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-terracotta text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-terracotta-dark shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add New Decal
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by decal name or SKU..."
            className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-terracotta"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-charcoal/60">Category:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal focus:outline-none focus:border-terracotta"
          >
            <option value="All">All Categories</option>
            {categoryList.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-charcoal/70 uppercase font-bold tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-4">Design</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.slice(0, 15).map((p) => (
                <tr key={p.id} className="hover:bg-stone-50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200"
                      />
                      <div>
                        <div className="font-serif font-bold text-sm text-charcoal">{p.name}</div>
                        <div className="text-[11px] text-charcoal/60">{p.sizes.length} sizes available</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-charcoal/80">{p.sku}</td>
                  <td className="p-4 font-medium text-charcoal">{p.category}</td>
                  <td className="p-4 font-serif font-bold text-charcoal">${p.price.toFixed(2)}</td>
                  <td className="p-4">
                    {p.inStock ? (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest/10 text-forest flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex items-center gap-1 w-max">
                        <XCircle className="w-3 h-3" /> Out of stock
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-charcoal">
                    ★ {p.rating.toFixed(1)} ({p.reviewCount})
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toast('Edit modal opened for: ' + p.name)}
                        className="p-1.5 rounded-lg text-charcoal/70 hover:bg-stone-100"
                        title="Edit product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-stone-100"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="text-xl font-serif font-bold text-charcoal mb-4">
              Add New Wall Decal Design
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Modern Minimalist Arch Decal"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                  >
                    {categoryList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Handcrafted matte vinyl artwork for modern rooms"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="rounded accent-terracotta"
                />
                <span>Set as in-stock and immediately active for purchase</span>
              </label>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold text-charcoal hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-terracotta text-white rounded-xl text-xs font-semibold hover:bg-terracotta-dark shadow-sm"
                >
                  Publish Decal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
