import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare, Mail, Phone } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'f1',
    category: 'Installation & Removal',
    question: 'Will wall decals damage my paint when removed?',
    answer: 'No! Our wall decals use a specialized removable microsphere adhesive engineered specifically for painted drywall. When removed at a 45-degree angle, they lift cleanly without leaving residue or peeling paint. For extra caution on delicate surfaces, warm with a hairdryer on low for 10 seconds before peeling.',
  },
  {
    id: 'f2',
    category: 'Installation & Removal',
    question: 'How long should I wait after painting before applying decals?',
    answer: 'We recommend waiting 2 to 3 weeks after painting a wall. Even though fresh paint feels dry to the touch in hours, it continues to "cure" and release microscopic moisture and gasses for up to 3 weeks, which can weaken the decal adhesive if applied prematurely.',
  },
  {
    id: 'f3',
    category: 'Wall Types & Surfaces',
    question: 'What types of walls do WallArt decals stick to?',
    answer: 'Our decals stick best to smooth, flat interior painted drywall, finished wood, mirrors, glass, and metal. Mildly textured walls (like subtle orange peel) work well with our fabric decals. Heavily textured walls (knockdown or popcorn) are not recommended.',
  },
  {
    id: 'f4',
    category: 'General & Sizing',
    question: 'Are WallArt decals reusable?',
    answer: 'Our Fabric Wall Decals are 100% reusable multiple times! When you move or redecorate, simply peel them off and stick them back onto their original backing paper or wax paper. Our standard vinyl decals are removable but designed for single-use application.',
  },
  {
    id: 'f5',
    category: 'General & Sizing',
    question: 'Are your decals safe for baby nurseries?',
    answer: 'Yes, completely safe! All WallArt prints use GREENGUARD Gold certified water-based latex inks. They are non-toxic, lead-free, phthalate-free, and odorless, meeting the strictest emissions standards for nurseries, schools, and healthcare facilities.',
  },
  {
    id: 'f6',
    category: 'Shipping & Returns',
    question: 'How fast is dispatch and shipping?',
    answer: 'Every order is handcrafted in our US studio within 24-48 business hours. Standard US delivery takes 3-5 business days. Express (2-3 days) and Priority Overnight (1 business day) are also available at checkout.',
  },
  {
    id: 'f7',
    category: 'Shipping & Returns',
    question: 'What is your return policy?',
    answer: 'We offer a 30-Day Happiness Guarantee. If you are not satisfied with your purchase, return the unused decals in their original tube within 30 days for a full refund or exchange. Custom personalized decals cannot be returned for change of mind, but we replace any printing errors immediately free of charge.',
  },
  {
    id: 'f8',
    category: 'Custom Orders',
    question: 'Can you print custom logos or bespoke dimensions?',
    answer: 'Absolutely! Use our Custom Decal Builder to create lettering with custom fonts and colors. For custom corporate logos or large wall murals, send your vector file to custom@wallartdecor.com and our design team will provide a mock-up and quote within 24 hours.',
  },
];

export const FaqPage: React.FC = () => {
  useDocumentTitle('Frequently Asked Questions | WallArt');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openId, setOpenId] = useState<string | null>('f1');

  const categories = [
    'All',
    'Installation & Removal',
    'Wall Types & Surfaces',
    'General & Sizing',
    'Shipping & Returns',
    'Custom Orders',
  ];

  const filteredFaqs = FAQS.filter((f) => {
    const matchCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchSearch =
      !searchQuery.trim() ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/20 text-terracotta text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" /> Help Center
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-stone-300 font-light mb-8 max-w-xl mx-auto">
            Everything you need to know about decal adhesion, surface prep, safe removal, and custom orders.
          </p>

          {/* Search Box */}
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answers (e.g. textured walls, removal, nursery)..."
              className="w-full pl-11 pr-4 py-3 bg-white text-charcoal rounded-2xl text-sm border-0 focus:outline-none focus:ring-2 focus:ring-terracotta shadow-lg"
            />
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-3.5" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Breadcrumb items={[{ label: 'Help & FAQ' }]} />

        {/* Category Pills */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-charcoal text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-charcoal/70 hover:bg-stone-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="mt-8 space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center">
              <p className="text-sm text-charcoal/60">No answers found matching "{searchQuery}".</p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-serif font-bold text-charcoal text-base hover:text-terracotta transition"
                  >
                    <span>{faq.question}</span>
                    <span className="p-1 rounded-full bg-stone-100 text-charcoal/60 flex-shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-charcoal/80 leading-relaxed border-t border-stone-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Help Support Box */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs mt-16 text-center">
          <h3 className="text-xl font-serif font-bold text-charcoal mb-2">
            Still Have Questions?
          </h3>
          <p className="text-xs text-charcoal/70 mb-6 max-w-md mx-auto">
            Our interior decor specialists in Portland, Oregon are available Monday through Friday to assist with custom measurements or surface checks.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
            <a
              href="mailto:support@wallartdecor.com"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-beige hover:bg-stone-200 text-charcoal transition"
            >
              <Mail className="w-4 h-4 text-terracotta" /> support@wallartdecor.com
            </a>
            <a
              href="tel:18005550199"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-beige hover:bg-stone-200 text-charcoal transition"
            >
              <Phone className="w-4 h-4 text-forest" /> 1-800-555-0199
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
