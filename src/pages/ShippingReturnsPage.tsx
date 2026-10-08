import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Package, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

export const ShippingReturnsPage: React.FC = () => {
  useDocumentTitle('Shipping & Returns Policy | WallArt');

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-stone-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-terracotta bg-white/10 backdrop-blur-xs px-3.5 py-1.5 rounded-full inline-block mb-3">
            Customer Guarantee
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Shipping & Return Policies
          </h1>
          <p className="text-sm sm:text-base text-stone-300 font-light max-w-xl mx-auto leading-relaxed">
            Fast, secure fulfillment from our Portland studio and our 30-Day Love-It Happiness Guarantee.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Breadcrumb items={[{ label: 'Shipping & Returns' }]} />

        {/* Highlight 3-Pillar Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center shadow-xs">
            <div className="w-12 h-12 bg-forest/10 text-forest rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Free Shipping Over ₹200</h3>
            <p className="text-xs text-charcoal/70 mt-1">Automatic standard free shipping across India.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center shadow-xs">
            <div className="w-12 h-12 bg-terracotta/10 text-terracotta rounded-2xl flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">30-Day Returns</h3>
            <p className="text-xs text-charcoal/70 mt-1">Full refund on unused decals in original packaging.</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-stone-200 text-center shadow-xs">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">Application Guarantee</h3>
            <p className="text-xs text-charcoal/70 mt-1">Free replacement if your decal tears during install.</p>
          </div>
        </div>

        {/* Section 1: Shipping Info */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <Truck className="w-6 h-6 text-terracotta" />
            <h2 className="text-2xl font-serif font-bold text-charcoal">Shipping Rates & Timelines</h2>
          </div>

          <p className="text-sm text-charcoal/80 leading-relaxed">
            All orders are handcrafted and custom cut on demand in our studio. We print and pack within <strong>24 to 48 business hours</strong> after payment confirmation.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
              <thead className="bg-stone-50 font-bold uppercase tracking-wider text-charcoal border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Transit Time</th>
                  <th className="p-3.5">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-charcoal/80">
                <tr>
                  <td className="p-3.5 font-semibold">Standard Tracked</td>
                  <td className="p-3.5">3–5 Business Days</td>
                  <td className="p-3.5 font-bold text-forest">Free on orders ₹200+ (₹49 under ₹200)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">Express Priority</td>
                  <td className="p-3.5">2–3 Business Days</td>
                  <td className="p-3.5 font-semibold">₹149</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold">Overnight Air</td>
                  <td className="p-3.5">1 Business Day</td>
                  <td className="p-3.5 font-semibold">₹299</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-base font-serif font-bold text-charcoal pt-2">Secure Protective Packaging</h3>
          <p className="text-xs text-charcoal/80 leading-relaxed">
            Every decal is gently rolled with moisture-resistant wax parchment and packaged inside heavy-duty, crush-proof cardboard mailing tubes with secure plastic end caps.
          </p>
        </div>

        {/* Section 2: Returns Policy */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-xs mb-8 space-y-6">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6 text-terracotta" />
            <h2 className="text-2xl font-serif font-bold text-charcoal">30-Day Hassle-Free Returns</h2>
          </div>

          <p className="text-sm text-charcoal/80 leading-relaxed">
            We want you to love your walls! If you change your mind, return any unused, unpeeled standard catalog decals in their original packaging within 30 days of delivery.
          </p>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-serif font-bold text-charcoal">How to Initiate a Return:</h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-charcoal/80">
              <li>Email <a href="mailto:returns@wallartdecor.com" className="text-terracotta underline font-semibold">returns@wallartdecor.com</a> with your order number.</li>
              <li>Our team will generate a prepaid return postage label within 24 hours.</li>
              <li>Carefully roll the decals back into their original mailing tube and drop it at any USPS location.</li>
              <li>Once inspected, your original payment method will be refunded in 3–5 business days.</li>
            </ol>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 leading-relaxed">
            <strong>Custom Personalized Decal Exceptions:</strong> Because bespoke decals with custom family names or custom quotes cannot be resold, they are non-returnable unless defective or damaged in transit.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingReturnsPage;
