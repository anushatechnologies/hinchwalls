import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Heart,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Award,
  Users,
  Leaf,
  ArrowRight
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

export const AboutPage: React.FC = () => {
  useDocumentTitle('About Us | WallArt - Transform Your Walls');

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      {/* Hero Section */}
      <div className="relative bg-stone-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1600&q=80"
            alt="WallArt Studio workshop"
            className="w-full h-full object-cover opacity-25 filter brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-terracotta bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full inline-block mb-4">
            Our Brand Story
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            We Believe Every Wall Deserves a Soul.
          </h1>
          <p className="text-base sm:text-lg text-stone-200 max-w-2xl mx-auto font-light leading-relaxed">
            WallArt was founded with a single mission: to create architecturally refined, damage-free wall decor that empowers anyone to curate a home they genuinely love.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <Breadcrumb items={[{ label: 'About Us' }]} />

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-12 bg-white rounded-3xl p-8 border border-stone-200 shadow-xs text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-terracotta">150,000+</div>
            <div className="text-xs text-charcoal/60 mt-1 uppercase font-semibold tracking-wider">
              Rooms Transformed
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-forest">4.9 / 5.0</div>
            <div className="text-xs text-charcoal/60 mt-1 uppercase font-semibold tracking-wider">
              Customer Satisfaction
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-charcoal">100%</div>
            <div className="text-xs text-charcoal/60 mt-1 uppercase font-semibold tracking-wider">
              Damage-Free Guarantee
            </div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-600">Zero</div>
            <div className="text-xs text-charcoal/60 mt-1 uppercase font-semibold tracking-wider">
              Toxic VOC Emissions
            </div>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-16">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-xs uppercase font-bold tracking-widest text-terracotta">
              Designed For Real Homes
            </span>
            <h2 className="text-3xl font-serif font-bold text-charcoal leading-snug">
              From Rented Apartments to Forever Dream Homes
            </h2>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              Traditional wallpaper is messy, costly, and impossible to remove without scraping drywall and forfeiting rental security deposits. Stencils smear, and framed art requires pounding nails and drywall anchors.
            </p>
            <p className="text-sm text-charcoal/80 leading-relaxed">
              We engineered a bespoke, ultra-matte fabric vinyl equipped with specialized microsphere adhesive. It clings securely to interior walls, yet peels away effortlessly like a post-it note whenever you decide to redecorate. No sticky residue. No stripped paint. Ever.
            </p>
          </div>
          <div className="lg:col-span-6 rounded-3xl overflow-hidden shadow-xl aspect-4/3 border border-stone-200">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000&q=80"
              alt="Living room with WallArt decals"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Core Pillars */}
        <div className="my-20">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-terracotta">
              The WallArt Standard
            </span>
            <h2 className="text-3xl font-serif font-bold text-charcoal mt-1">
              Crafted With Intentionality
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-stone-200/90 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mb-5">
                <Leaf className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal mb-2">
                Safe for Nurseries & Kids
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                All our decals are printed with certified UL GREENGUARD Gold water-based latex inks. Absolutely zero PVC odor, phthalates, or lead. Safe for curious little hands.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200/90 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-5">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal mb-2">
                100% Removable & Reusable
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                Moving into a new home or switching nursery themes as your child grows? Simply peel your decals, apply them to backing paper, and re-stick in your new space.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200/90 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal mb-2">
                Artisanal Die-Cut Finish
              </h3>
              <p className="text-xs text-charcoal/70 leading-relaxed">
                No ugly transparent plastic borders around lettering or leaves. Each shape is custom contour cut down to the millimeter, creating the illusion of hand-painted artwork.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-stone-900 text-white rounded-3xl p-10 sm:p-14 text-center my-16 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
              Ready to Transform Your Walls?
            </h2>
            <p className="text-sm text-stone-300 mb-8 font-light">
              Explore hundreds of ready-to-peel designs, or build custom personalized lettering in our bespoke studio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/shop"
                className="px-8 py-3.5 bg-terracotta text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-terracotta-dark transition shadow-md"
              >
                Shop Collection
              </Link>
              <Link
                to="/customize"
                className="px-8 py-3.5 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-stone-100 transition shadow-md"
              >
                Custom Decal Builder
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
