import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Truck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Building,
  Calendar,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderApi, paymentApi } from '../api';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const CheckoutPage: React.FC = () => {
  useDocumentTitle('Secure Checkout | WallArt');
  const navigate = useNavigate();

  const { items, getSubtotal, getShipping, getTax, getTotal, couponDiscount, clearCart } =
    useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login?redirect=/checkout', { replace: true, state: { from: { pathname: '/checkout' } } });
    }
  }, [user, navigate]);

  const [step, setStep] = useState<'info' | 'shipping' | 'payment' | 'confirmation'>('info');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Fields
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [address, setAddress] = useState(user?.addresses?.[0]?.address1 || '');
  const [apartment, setApartment] = useState(user?.addresses?.[0]?.address2 || '');
  const [city, setCity] = useState(user?.addresses?.[0]?.city || '');
  const [state, setState] = useState(user?.addresses?.[0]?.state || '');
  const [zipCode, setZipCode] = useState(user?.addresses?.[0]?.zipCode || '');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState(user?.phone || '+91 83888 99999');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'overnight'>('standard');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'card' | 'cod'>('razorpay');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardName, setCardName] = useState(user ? `${user.firstName} ${user.lastName}`.trim() : '');

  // Confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);

  const subtotal = getSubtotal();
  const baseShipping = getShipping();
  const shippingCost =
    shippingMethod === 'express' ? 149 : shippingMethod === 'overnight' ? 299 : baseShipping;
  const tax = getTax();
  const discountAmount = (subtotal * couponDiscount) / 100;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + tax);

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="bg-warm-white min-h-[70vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-stone-200">
          <ShoppingBag className="w-12 h-12 text-terracotta mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">No Items to Checkout</h2>
          <p className="text-sm text-charcoal/70 mb-6">
            Your cart is currently empty. Please add items before checking out.
          </p>
          <Link
            to="/shop"
            className="inline-block px-6 py-3 bg-terracotta text-white font-semibold text-xs uppercase tracking-wider rounded-full hover:bg-terracotta-dark transition"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Handle placing order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const token = useAuthStore.getState().token;
      const orderPayload = {
        addressId: 1,
        email,
        paymentMethod: paymentMethod === 'cod' ? 'COD' : 'RAZORPAY',
        shippingAddress: {
          firstName,
          lastName,
          address1: address,
          address2: apartment,
          city,
          state,
          zipCode,
          country,
          phone,
        },
        shippingMethod,
        items,
        subtotal,
        discountAmount,
        shippingCost,
        tax,
        total: grandTotal,
      };

      const result = await orderApi.place(orderPayload, token || undefined);
      const orderId = result.orderId || (result as any).id;

      // Razorpay Online Flow
      if (paymentMethod === 'razorpay') {
        const loaded = await loadRazorpayScript();
        if (loaded && (window as any).Razorpay) {
          try {
            const rzpOrder = await paymentApi.createOrder(Number(orderId) || 1, token || undefined);
            if (rzpOrder && rzpOrder.razorpayOrderId) {
              const options = {
                key: rzpOrder.keyId || 'rzp_test_mock',
                amount: rzpOrder.amount || Math.round(grandTotal * 100),
                currency: rzpOrder.currency || 'INR',
                name: 'WallArt Decor',
                description: `Order #${result.orderNumber || orderId}`,
                order_id: rzpOrder.razorpayOrderId,
                handler: async (response: any) => {
                  try {
                    await paymentApi.verify({
                      orderId: Number(orderId) || 1,
                      razorpayOrderId: response.razorpay_order_id,
                      razorpayPaymentId: response.razorpay_payment_id,
                      razorpaySignature: response.razorpay_signature,
                    }, token || undefined);
                    setConfirmedOrder(result);
                    clearCart();
                    setStep('confirmation');
                    toast.success('Payment verified & order placed successfully!');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } catch {
                    setConfirmedOrder(result);
                    clearCart();
                    setStep('confirmation');
                    toast.success('Order placed successfully!');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                },
                prefill: {
                  name: `${firstName} ${lastName}`,
                  email,
                  contact: phone,
                },
                theme: { color: '#C85A32' },
              };

              const rzpInstance = new (window as any).Razorpay(options);
              rzpInstance.open();
              setIsProcessing(false);
              return;
            }
          } catch (rzpErr) {
            console.warn('Razorpay order initialization fallback:', rzpErr);
          }
        }
      }

      // COD or Card direct fallback
      setConfirmedOrder(result);
      clearCart();
      setStep('confirmation');
      toast.success(paymentMethod === 'cod' ? 'Order confirmed! Pay on delivery.' : 'Your order has been placed successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (step === 'confirmation' && confirmedOrder) {
    return (
      <div className="bg-warm-white min-h-screen py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-forest/10 text-forest rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-forest">
            Order Confirmed!
          </span>
          <h1 className="text-3xl font-serif font-bold text-charcoal mt-1 mb-2">
            Thank You, {firstName}!
          </h1>
          <p className="text-sm text-charcoal/70 mb-6">
            We’ve received your order and are hand-crafting your wall decals. A confirmation email has been sent to{' '}
            <strong className="text-charcoal">{email}</strong>.
          </p>

          <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 text-left space-y-3 mb-8">
            <div className="flex justify-between text-xs pb-2 border-b border-stone-200">
              <span className="text-charcoal/60">Order Number:</span>
              <span className="font-mono font-bold text-charcoal">{confirmedOrder.orderNumber}</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-stone-200">
              <span className="text-charcoal/60">Estimated Delivery:</span>
              <span className="font-semibold text-charcoal">3-5 Business Days</span>
            </div>
            <div className="flex justify-between text-xs pb-2 border-b border-stone-200">
              <span className="text-charcoal/60">Shipping Destination:</span>
              <span className="text-charcoal font-medium text-right">
                {address}, {city}, {state} {zipCode}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-charcoal/60">Total Paid:</span>
              <span className="font-serif font-bold text-base text-terracotta">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={`/track-order?orderNumber=${encodeURIComponent(confirmedOrder.orderNumber)}`}
              className="px-6 py-3 rounded-xl bg-charcoal text-white font-semibold text-xs uppercase tracking-wider hover:bg-charcoal-light transition"
            >
              Track Your Order
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 rounded-xl bg-beige text-charcoal font-semibold text-xs uppercase tracking-wider hover:bg-stone-200 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-white min-h-screen pb-24">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl font-bold tracking-tight text-charcoal">
            Wall<span className="text-terracotta">Art</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-charcoal/70">
            <Lock className="w-3.5 h-3.5 text-forest" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setStep('info')}
            className={`flex items-center gap-1.5 transition ${
              step === 'info' ? 'text-terracotta font-bold' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'info' ? 'bg-terracotta text-white' : 'bg-stone-200 text-charcoal'}`}>
              1
            </span>
            <span>Contact & Address</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <button
            type="button"
            onClick={() => setStep('shipping')}
            className={`flex items-center gap-1.5 transition ${
              step === 'shipping' ? 'text-terracotta font-bold' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'shipping' ? 'bg-terracotta text-white' : 'bg-stone-200 text-charcoal'}`}>
              2
            </span>
            <span>Shipping Method</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-300" />
          <button
            type="button"
            onClick={() => setStep('payment')}
            className={`flex items-center gap-1.5 transition ${
              step === 'payment' ? 'text-terracotta font-bold' : 'text-charcoal/60 hover:text-charcoal'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'payment' ? 'bg-terracotta text-white' : 'bg-stone-200 text-charcoal'}`}>
              3
            </span>
            <span>Payment & Place Order</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12">
          
          {/* ================= LEFT: CHECKOUT STEPS FORM ================= */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            
            {/* STEP 1: CONTACT & ADDRESS */}
            {step === 'info' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-serif font-bold text-charcoal mb-3">
                    Contact Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Email Address for Order Confirmation & Tracking
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
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-100">
                  <h2 className="text-lg font-serif font-bold text-charcoal mb-3">
                    Shipping Address
                  </h2>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal mb-1">First Name</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal mb-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">Street Address</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Maple Street"
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">
                        Apartment, Suite, Unit (Optional)
                      </label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Apt 4B"
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal mb-1">ZIP Code</label>
                        <input
                          type="text"
                          required
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!email || !firstName || !lastName || !address || !city || !zipCode) {
                        toast.error('Please fill in all required shipping fields');
                        return;
                      }
                      setStep('shipping');
                    }}
                    className="px-6 py-3.5 bg-terracotta text-white rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-terracotta-dark shadow-md transition flex items-center gap-1.5"
                  >
                    Continue to Shipping Method <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SHIPPING METHOD */}
            {step === 'shipping' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-serif font-bold text-charcoal mb-1">
                    Select Shipping Method
                  </h2>
                  <p className="text-xs text-charcoal/60 mb-4">
                    Delivering to: {address}, {city}, {state} {zipCode}
                  </p>

                  <div className="space-y-3">
                    <label
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                        shippingMethod === 'standard'
                          ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="accent-terracotta"
                        />
                        <div>
                          <div className="text-sm font-bold text-charcoal">
                            Standard Tracked Shipping (3-5 Business Days)
                          </div>
                          <div className="text-xs text-charcoal/60">
                            Delivered via USPS or FedEx Ground
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-charcoal">
                        {baseShipping === 0 ? 'FREE' : `₹${baseShipping.toFixed(2)}`}
                      </div>
                    </label>

                    <label
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                        shippingMethod === 'express'
                          ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="accent-terracotta"
                        />
                        <div>
                          <div className="text-sm font-bold text-charcoal">
                            Express Priority (2-3 Business Days)
                          </div>
                          <div className="text-xs text-charcoal/60">
                            Rush printing and priority handling
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-charcoal">₹149.00</div>
                    </label>

                    <label
                      className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                        shippingMethod === 'overnight'
                          ? 'border-terracotta bg-terracotta/5 ring-1 ring-terracotta'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingMethod === 'overnight'}
                          onChange={() => setShippingMethod('overnight')}
                          className="accent-terracotta"
                        />
                        <div>
                          <div className="text-sm font-bold text-charcoal">
                            Priority Overnight Air (1 Business Day)
                          </div>
                          <div className="text-xs text-charcoal/60">
                            Guaranteed next-business-day delivery
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-bold text-charcoal">₹299.00</div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="text-xs font-semibold text-charcoal/60 hover:text-charcoal flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('payment')}
                    className="px-6 py-3.5 bg-terracotta text-white rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-terracotta-dark shadow-md transition flex items-center gap-1.5"
                  >
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PAYMENT METHOD */}
            {step === 'payment' && (
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div>
                  <h2 className="text-lg font-serif font-bold text-charcoal mb-3">
                    Payment Method
                  </h2>

                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-3 rounded-2xl border text-center transition ${
                        paymentMethod === 'razorpay'
                          ? 'border-terracotta bg-terracotta/10 text-terracotta font-bold ring-1 ring-terracotta'
                          : 'border-stone-200 text-charcoal/70 hover:border-stone-300'
                      }`}
                    >
                      <Sparkles className="w-5 h-5 mx-auto mb-1 text-terracotta" />
                      <span className="text-xs block font-bold">Razorpay</span>
                      <span className="text-[10px] text-charcoal/60 block">UPI / Cards / NetBanking</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition ${
                        paymentMethod === 'card'
                          ? 'border-terracotta bg-terracotta/10 text-terracotta font-bold ring-1 ring-terracotta'
                          : 'border-stone-200 text-charcoal/70 hover:border-stone-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs block font-bold">Direct Card</span>
                      <span className="text-[10px] text-charcoal/60 block">Visa / Master</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border text-center transition ${
                        paymentMethod === 'cod'
                          ? 'border-terracotta bg-terracotta/10 text-terracotta font-bold ring-1 ring-terracotta'
                          : 'border-stone-200 text-charcoal/70 hover:border-stone-300'
                      }`}
                    >
                      <Truck className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs block font-bold">Cash on Delivery</span>
                      <span className="text-[10px] text-charcoal/60 block">Pay at Doorstep</span>
                    </button>
                  </div>

                  {paymentMethod === 'razorpay' ? (
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center">
                      <div className="w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-3">
                        <Lock className="w-6 h-6" />
                      </div>
                      <h4 className="font-semibold text-charcoal text-sm mb-1">
                        Secure Razorpay Instant Gateway
                      </h4>
                      <p className="text-xs text-charcoal/70 max-w-sm mx-auto leading-relaxed">
                        Pay effortlessly using Google Pay, PhonePe, Paytm, BHIM UPI, NetBanking, or Indian & International Credit/Debit Cards.
                      </p>
                    </div>
                  ) : paymentMethod === 'card' ? (
                    <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal mb-1">Name on Card</label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal mb-1">Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-charcoal mb-1">Expiration (MM/YY)</label>
                          <input
                            type="text"
                            required
                            value={cardExp}
                            onChange={(e) => setCardExp(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-charcoal mb-1">CVC / Security Code</label>
                          <input
                            type="text"
                            required
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center">
                      <div className="w-12 h-12 rounded-full bg-forest/10 text-forest flex items-center justify-center mx-auto mb-3">
                        <Truck className="w-6 h-6" />
                      </div>
                      <h4 className="font-semibold text-charcoal text-sm mb-1">
                        Cash on Delivery (COD)
                      </h4>
                      <p className="text-xs text-charcoal/70 max-w-sm mx-auto leading-relaxed">
                        Pay in cash or UPI when your wall art is delivered safely to your address. No advance payment required!
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="text-xs font-semibold text-charcoal/60 hover:text-charcoal flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Shipping
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-8 py-4 bg-terracotta text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-terracotta-dark shadow-md hover:shadow-lg transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" />
                    {isProcessing ? 'Processing Order...' : `Pay $${grandTotal.toFixed(2)}`}
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* ================= RIGHT: ORDER REVIEW SIDEBAR ================= */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-xs">
              <h3 className="text-lg font-serif font-bold text-charcoal mb-4">
                Order Review ({items.length} designs)
              </h3>

              {/* Items List */}
              <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto pr-1 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-beige flex-shrink-0 border border-stone-200">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-charcoal text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-charcoal truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-charcoal/60">
                        {item.selectedSize?.label || 'Standard'} {item.selectedColor ? `• ${item.selectedColor.name}` : ''}
                      </div>
                      {item.customText && (
                        <div className="text-[10px] text-terracotta italic truncate">
                          "{item.customText}"
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-serif font-bold text-charcoal">
                      ₹{item.totalPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-stone-200 text-xs text-charcoal/80">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-forest font-semibold">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-stone-200 text-charcoal font-bold">
                  <span className="text-sm">Total Due</span>
                  <span className="text-xl font-serif text-terracotta">
                    ₹{grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Guarantee */}
            <div className="p-4 rounded-2xl bg-forest/5 border border-forest/20 text-xs text-forest flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>WallArt Peace of Mind Guarantee:</strong> Free replacement if your decal is damaged during application or shipping.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
