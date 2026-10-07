import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Truck,
  Search,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { orderApi } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

export const OrderTrackingPage: React.FC = () => {
  useDocumentTitle('Track Your Order | WallArt');
  const [searchParams] = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '#124321';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState('alex@example.com');
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialOrderNumber) {
      handleTrack(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleTrack = async (orderNum: string) => {
    if (!orderNum.trim()) return;
    setLoading(true);
    try {
      const data = await orderApi.track(orderNum, email);
      setTrackingData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack(orderNumber);
  };

  return (
    <div className="bg-warm-white min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb items={[{ label: 'Track Order' }]} />

        {/* Hero Banner */}
        <div className="text-center mt-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-3">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal">
            Track Your Shipment
          </h1>
          <p className="text-xs text-charcoal/60 mt-1 max-w-md mx-auto">
            Enter your order number and email to check the live status of your custom decals.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs mb-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Order Number
              </label>
              <input
                type="text"
                required
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. #124321"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-mono focus:outline-none focus:border-terracotta"
              />
            </div>
            <div className="sm:col-span-5">
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Billing Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-terracotta text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-terracotta-dark shadow-sm transition disabled:opacity-50 h-[42px]"
              >
                {loading ? 'Tracking...' : 'Track'}
              </button>
            </div>
          </form>
        </div>

        {/* Tracking Details & Timeline */}
        {trackingData && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-8 animate-fadeInUp">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
              <div>
                <span className="text-xs uppercase font-bold text-terracotta tracking-wider">
                  Live Courier Update
                </span>
                <h2 className="text-xl font-serif font-bold text-charcoal mt-0.5">
                  Order {trackingData.orderNumber}
                </h2>
                <div className="text-xs text-charcoal/60 mt-1">
                  Tracking Number:{' '}
                  <span className="font-mono font-bold text-charcoal">
                    {trackingData.trackingNumber}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-charcoal/60 block">Estimated Delivery</span>
                <span className="text-lg font-serif font-bold text-forest">
                  {trackingData.estimatedDelivery}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="text-sm font-serif font-bold text-charcoal mb-6">
                Shipment Progression
              </h3>
              <div className="relative border-l-2 border-stone-200 ml-4 space-y-6">
                {trackingData.timeline.map((step: any, idx: number) => (
                  <div key={idx} className="relative pl-6">
                    <span
                      className={`absolute -left-2.5 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-forest text-white'
                          : 'bg-stone-200 text-stone-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <div className="flex items-center justify-between">
                      <h4
                        className={`text-sm font-semibold ${
                          step.completed ? 'text-charcoal' : 'text-charcoal/40'
                        }`}
                      >
                        {step.status}
                      </h4>
                      {step.date && (
                        <span className="text-xs text-charcoal/50 font-mono">{step.date}</span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal/60 mt-0.5">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Carrier note */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-charcoal/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest flex-shrink-0" />
                <span>Package is insured with USPS Priority Mail</span>
              </div>
              <a
                href="#carrier"
                onClick={(e) => e.preventDefault()}
                className="text-terracotta hover:underline font-semibold flex items-center gap-1"
              >
                View on Carrier Website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;
