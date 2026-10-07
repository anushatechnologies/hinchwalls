import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { categoryApi, subcategoryApi } from '../api';
import type { Category, SubcategoryCardItem } from '../types';
export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryCardItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    categoryApi.getAll().then((cats) => {
      if (isMounted) setCategories(cats);
    }).catch(() => {});

    subcategoryApi.getAll().then((subs) => {
      if (isMounted) setSubcategories(subs as SubcategoryCardItem[]);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const half = Math.ceil(subcategories.length / 2);
  const finishesColumn = subcategories.slice(0, half);
  const spacesColumn = subcategories.slice(half);

  return (
    <footer className="bg-charcoal text-warm-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/category/all" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-warm-white rounded-lg flex items-center justify-center">
                <span className="text-charcoal text-sm font-bold">H</span>
              </div>
              <span className="font-serif text-xl font-bold">HinchWall</span>
            </Link>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
              Direct-to-contractor and residential architectural catalog for HinchWall finishes, fixtures, laminates, and decor.
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Mail size={14} />
                <a href="mailto:support@hinchwall.com" className="hover:text-white transition-colors">
                  support@hinchwall.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Phone size={14} />
                <a href="tel:+918388899999" className="hover:text-white transition-colors">
                  +91 83888 99999
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin size={14} />
                <span>Mon-Sat 8am-7pm</span>
              </div>
            </div>
          </div>

          {/* Top Categories Column (Dynamic from backend) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
              Categories ({categories.filter((cat) => (cat.subcategories && cat.subcategories.length > 0)).length})
            </h4>
            <ul className="space-y-2">
              {categories
                .filter((cat) => (cat.subcategories && cat.subcategories.length > 0))
                .map((cat) => (
                  <li key={cat.categoryId || cat.slug}>
                    <Link to={`/category/${cat.slug}`} className="text-sm text-white/70 hover:text-orange-400 transition-colors">
                      {cat.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Subcategories Column (Dynamic from backend) */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Popular Sections</h4>
            <ul className="space-y-2">
              {subcategories.slice(0, 10).map((sub) => (
                <li key={sub.subcategoryId || sub.slug}>
                  <Link to={`/category/all`} className="text-sm text-white/70 hover:text-orange-400 transition-colors">
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Help & Orders</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/orders" className="text-sm text-white/70 hover:text-orange-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-white/70 hover:text-orange-400 transition-colors">
                  FAQs & Support
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-white/70 hover:text-orange-400 transition-colors">
                  About HinchWall
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white/70 hover:text-orange-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <p className="text-xs text-white/40 text-center">
            © 2024 HinchWall. All rights reserved. Premium architectural materials catalog.
          </p>
        </div>
      </div>
    </footer>
  );
}
