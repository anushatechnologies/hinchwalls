import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoryApi } from '../../api';
import type { Category } from '../../types';

export const AdminCategories: React.FC = () => {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategoryList(res));
  }, []);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      description,
      image,
      productCount: 0,
      featured: true,
      order: categoryList.length + 1,
      status: 'active',
    };

    setCategoryList([...categoryList, newCat]);
    toast.success(`Category "${name}" created!`);
    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this category?')) {
      setCategoryList(categoryList.filter((c) => c.id !== id));
      toast.success('Category removed');
    }
  };

  const toggleStatus = (id: string) => {
    setCategoryList(
      categoryList.map((c) =>
        c.id === id ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c
      )
    );
    toast.success('Category status updated');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal">
            Category & Collection Management
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            Manage storefront taxonomy and collection showcases.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-terracotta text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-terracotta-dark shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryList.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/9 bg-stone-100">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full backdrop-blur-xs ${
                    c.status === 'active'
                      ? 'bg-forest/80 text-white'
                      : 'bg-stone-500/80 text-white'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif font-bold text-lg text-charcoal">{c.name}</h3>
                <p className="text-xs text-charcoal/70 mt-1 line-clamp-2">{c.description}</p>
                <div className="text-xs text-charcoal/50 mt-3 font-medium">
                  {c.productCount} Active Designs
                </div>
              </div>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleStatus(c.id)}
                className="text-xs font-semibold text-charcoal hover:text-terracotta"
              >
                {c.status === 'active' ? 'Set Inactive' : 'Activate'}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="text-stone-400 hover:text-red-600 p-1"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <h2 className="text-xl font-serif font-bold text-charcoal mb-4">
              Add New Decor Category
            </h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vintage Botanical"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of this aesthetic..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Hero Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                />
              </div>

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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
