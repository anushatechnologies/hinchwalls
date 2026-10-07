import React, { useState } from 'react';
import {
  Sparkles,
  Type,
  Palette,
  Maximize,
  Layers,
  Check,
  RotateCcw,
  ShoppingBag,
  HelpCircle,
  Eye,
  Sliders,
  CheckCircle2,
  Gift
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customDecalApi } from '../api';
import { useCartStore } from '../store/cartStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { Product } from '../types';

const FONTS = [
  { id: 'font-serif', name: 'Playfair Serif', sample: 'Graceful & Elegant', family: 'font-serif' },
  { id: 'font-sans', name: 'Inter Clean', sample: 'Modern & Architectural', family: 'font-sans' },
  { id: 'font-mono', name: 'Monospace Minimal', sample: 'Industrial & Crisp', family: 'font-mono' },
];

const COLORS = [
  { id: 'c1', name: 'Matte Charcoal', hex: '#2C2C2C' },
  { id: 'c2', name: 'Warm Terracotta', hex: '#C4704F' },
  { id: 'c3', name: 'Forest Evergreen', hex: '#3D5A47' },
  { id: 'c4', name: 'Luxe Metallic Gold', hex: '#D4AF37' },
  { id: 'c5', name: 'Soft Cream / Off-White', hex: '#FAF8F5' },
  { id: 'c6', name: 'Dusty Rose Blush', hex: '#D99B9B' },
  { id: 'c7', name: 'Deep Midnight Navy', hex: '#1E293B' },
  { id: 'c8', name: 'Earthy Sage', hex: '#87986A' },
];

const MATERIALS = [
  {
    id: 'standard',
    name: 'Peel & Stick Matte Vinyl',
    desc: 'Removable without wall damage, non-glare finish.',
    badge: 'Most Popular',
    multiplier: 1.0,
  },
  {
    id: 'premium',
    name: 'Fabric Wall Decal',
    desc: 'Woven polyester texture, wrinkle-free, reusable multiple times.',
    badge: 'Ultra Premium',
    multiplier: 1.5,
  },
  {
    id: 'glitter',
    name: 'Metallic & Shimmer Finish',
    desc: 'Catch the light with subtle metallic flake and matte luster.',
    badge: 'Statement',
    multiplier: 2.0,
  },
];

const ROOM_BACKGROUNDS = [
  {
    id: 'living',
    name: 'Living Room',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'nursery',
    name: 'Nursery / Kids',
    url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'bedroom',
    name: 'Master Bedroom',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'minimal',
    name: 'Minimal Clean Wall',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  },
];

export const CustomizePage: React.FC = () => {
  useDocumentTitle('Custom Decal Studio | WallArt');

  const [text, setText] = useState('Together is our favorite place to be');
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]);
  const [widthInches, setWidthInches] = useState(36);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [selectedRoom, setSelectedRoom] = useState(ROOM_BACKGROUNDS[0]);
  const [activeTab, setActiveTab] = useState<'text' | 'font' | 'color' | 'size' | 'material'>('text');

  const { addItem, openCart } = useCartStore();

  // Calculated approximate height based on text lines and width
  const lineCount = text.split('\n').filter(Boolean).length || 1;
  const calculatedHeight = Math.round((widthInches / (text.length / lineCount || 10)) * 5);
  const heightInches = Math.max(8, Math.min(60, calculatedHeight));

  const calculatedPrice = customDecalApi.calculatePrice(
    widthInches,
    heightInches,
    selectedMaterial.id
  );

  const handleAddToCart = () => {
    if (!text.trim()) {
      toast.error('Please enter your custom decal text first.');
      return;
    }

    const customProduct: Product = {
      id: `custom-${Date.now()}`,
      slug: `custom-decal-${Date.now()}`,
      name: `Custom Decal: "${text.slice(0, 24)}${text.length > 24 ? '...' : ''}"`,
      description: `Bespoke custom wall decal made from ${selectedMaterial.name}. Font: ${selectedFont.name}, Color: ${selectedColor.name}, Dimensions: ${widthInches}" W × ${heightInches}" H.`,
      shortDescription: `Custom lettering in ${selectedColor.name} (${widthInches}" × ${heightInches}")`,
      price: calculatedPrice,
      sku: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Custom Decals',
      tags: ['custom', 'lettering', 'bespoke', selectedColor.name.toLowerCase()],
      images: [selectedRoom.url],
      rating: 5.0,
      reviewCount: 1,
      inStock: true,
      stockCount: 999,
      featured: false,
      isNew: true,
      isBestSeller: false,
      isSale: false,
      isCustomizable: true,
      sizes: [
        {
          id: 'custom-sz',
          label: `${widthInches}" × ${heightInches}"`,
          value: `${widthInches}x${heightInches}`,
          priceModifier: 0,
        },
      ],
      colors: [selectedColor],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(customProduct, {
      size: customProduct.sizes[0],
      color: selectedColor,
      quantity: 1,
      customText: text,
    });

    toast.success('Your bespoke custom decal was added to cart!');
    openCart();
  };

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      {/* Header */}
      <div className="bg-stone-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta/20 text-terracotta text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Bespoke Studio
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white">
              Custom Decal Builder
            </h1>
            <p className="text-sm text-stone-300 mt-1 max-w-xl">
              Type your quote, choose your favorite typography and colors, and see it rendered live on modern walls.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700">
            <div>
              <div className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">
                Current Estimate
              </div>
              <div className="text-2xl font-serif font-bold text-terracotta">
                ${calculatedPrice.toFixed(2)}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-6 py-2.5 rounded-xl bg-terracotta text-white font-semibold text-xs uppercase tracking-wider hover:bg-terracotta-dark shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" /> Add Custom Decal
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ================= LEFT: LIVE INTERACTIVE PREVIEW ================= */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-stone-300/80 aspect-4/3 max-h-[560px] bg-stone-900 group">
              {/* Room Background */}
              <img
                src={selectedRoom.url}
                alt={selectedRoom.name}
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-black/10" />

              {/* Live Rendered Custom Text */}
              <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <div
                  className={`max-w-md w-full transition-all duration-300 ${
                    alignment === 'left' ? 'text-left' : alignment === 'right' ? 'text-right' : 'text-center'
                  }`}
                  style={{
                    filter: `drop-shadow(0 2px 5px rgba(0,0,0,0.35))`,
                  }}
                >
                  <p
                    className={`${selectedFont.family} font-bold leading-tight whitespace-pre-line tracking-wide transition-all`}
                    style={{
                      color: selectedColor.hex,
                      fontSize: `${Math.max(18, Math.min(48, widthInches * 0.9))}px`,
                    }}
                  >
                    {text || 'Your Words Here'}
                  </p>
                </div>
              </div>

              {/* Dimension Ruler Badge */}
              <div className="absolute bottom-4 left-4 bg-charcoal/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 border border-white/10 shadow-md">
                <Maximize className="w-3.5 h-3.5 text-terracotta" />
                <span>
                  {widthInches}" wide × approx. {heightInches}" tall
                </span>
              </div>

              {/* Room Switcher Overlay */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-charcoal/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 shadow-md">
                {ROOM_BACKGROUNDS.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoom(room)}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                      selectedRoom.id === room.id
                        ? 'bg-terracotta text-white font-bold'
                        : 'text-stone-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inclusions summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal">Free Application Tool</div>
                  <div className="text-[11px] text-charcoal/60">Squeegee & test sample included</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center flex-shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal">Damage-Free Guarantee</div>
                  <div className="text-[11px] text-charcoal/60">Peeled cleanly anytime</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-charcoal">Handcrafted In USA</div>
                  <div className="text-[11px] text-charcoal/60">Dispatched in 2-3 days</div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT: BUILDER CONTROLS ================= */}
          <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm">
            
            {/* Step navigation tabs */}
            <div className="flex items-center border-b border-stone-200 pb-3 gap-2 overflow-x-auto scrollbar-none mb-6">
              {[
                { id: 'text', label: '1. Text', icon: Type },
                { id: 'font', label: '2. Font', icon: Sparkles },
                { id: 'color', label: '3. Color', icon: Palette },
                { id: 'size', label: '4. Size', icon: Maximize },
                { id: 'material', label: '5. Material', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? 'bg-charcoal text-white shadow-xs'
                        : 'text-charcoal/70 hover:bg-stone-100 hover:text-charcoal'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: TEXT CONTENT */}
            {activeTab === 'text' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                    Enter Your Text or Quote
                  </label>
                  <textarea
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your family name, nursery rhyme, inspirational quote, or business slogan..."
                    className="w-full p-4 border border-stone-300 rounded-2xl text-base text-charcoal focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-charcoal/60 mt-1.5">
                    <span>{text.length} characters</span>
                    <span>Supports multiple lines (press Enter)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                    Text Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setAlignment(align)}
                        className={`py-2 px-3 rounded-xl border text-xs capitalize font-semibold transition ${
                          alignment === align
                            ? 'border-terracotta bg-terracotta/10 text-terracotta'
                            : 'border-stone-200 text-charcoal/80 hover:bg-stone-50'
                        }`}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Inspiration Phrases */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-2">
                    Popular Inspirations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'In this home, we do love & laughter',
                      'The Miller Family • Est. 2021',
                      'You are so loved, little one',
                      'Dream big, work hard, stay humble',
                    ].map((quote, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setText(quote)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-beige/60 hover:bg-beige text-charcoal border border-stone-200 transition text-left"
                      >
                        "{quote}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FONTS */}
            {activeTab === 'font' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Choose Typography Style
                </label>
                <div className="space-y-3">
                  {FONTS.map((f) => {
                    const isSelected = selectedFont.id === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setSelectedFont(f)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected
                            ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta'
                            : 'border-stone-200 hover:border-stone-400 bg-white'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-charcoal">{f.name}</div>
                          <div className={`text-xl text-charcoal/90 mt-1 ${f.family}`}>
                            {text.slice(0, 20) || f.sample}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-terracotta text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: COLOR */}
            {activeTab === 'color' && (
              <div className="space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Select Decal Vinyl Color:{' '}
                  <span className="text-terracotta">{selectedColor.name}</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {COLORS.map((c) => {
                    const isSelected = selectedColor.id === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta'
                            : 'border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-xs font-semibold text-charcoal truncate">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: SIZES */}
            {activeTab === 'size' && (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal">
                      Decal Width: <span className="text-terracotta font-semibold">{widthInches} Inches</span>
                    </label>
                    <span className="text-xs text-charcoal/60">
                      Height: ~{heightInches} Inches
                    </span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={72}
                    step={2}
                    value={widthInches}
                    onChange={(e) => setWidthInches(Number(e.target.value))}
                    className="w-full accent-terracotta cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-charcoal/50 mt-1">
                    <span>18" (Compact)</span>
                    <span>36" (Standard)</span>
                    <span>54" (Large)</span>
                    <span>72" (Mural Size)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="text-xs font-bold text-charcoal">Size Recommendation Guide:</div>
                  <p className="text-xs text-charcoal/70">
                    • <strong>24" – 36":</strong> Perfect over desks, single cribs, or doorway arches.
                  </p>
                  <p className="text-xs text-charcoal/70">
                    • <strong>42" – 54":</strong> Ideal above queen beds, 3-seater sofas, or dining sideboards.
                  </p>
                  <p className="text-xs text-charcoal/70">
                    • <strong>60" – 72":</strong> Best for expansive accent feature walls and nursery focal points.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 5: MATERIAL */}
            {activeTab === 'material' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1">
                  Select Vinyl Material & Finish
                </label>
                {MATERIALS.map((mat) => {
                  const isSelected = selectedMaterial.id === mat.id;
                  return (
                    <button
                      key={mat.id}
                      type="button"
                      onClick={() => setSelectedMaterial(mat)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-charcoal">{mat.name}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-charcoal/70">
                          {mat.badge}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal/70">{mat.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer with Price and Primary CTA */}
            <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-charcoal/60 uppercase tracking-wider block">
                    Calculated Total
                  </span>
                  <span className="text-3xl font-serif font-bold text-charcoal">
                    ${calculatedPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-forest block">
                    ✓ Free US Shipping on $200+
                  </span>
                  <span className="text-[11px] text-charcoal/50">
                    Estimated Delivery: 3-5 business days
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-4 rounded-2xl bg-terracotta text-white font-bold text-sm uppercase tracking-wider hover:bg-terracotta-dark shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Add To Cart — ${calculatedPrice.toFixed(2)}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizePage;
