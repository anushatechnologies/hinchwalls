import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Breadcrumb from '../components/Breadcrumb';

export const AddressesPage: React.FC = () => {
  useDocumentTitle('Saved Addresses | WallArt');
  const navigate = useNavigate();
  const { user, isAuthenticated, addAddress, removeAddress, setDefaultAddress } = useAuthStore();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !address1 || !city || !zipCode) {
      toast.error('Please fill in required address fields');
      return;
    }

    addAddress({
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault,
    });

    toast.success('Address saved successfully');
    setShowAddModal(false);
    // Reset
    setFirstName('');
    setLastName('');
    setAddress1('');
    setAddress2('');
    setCity('');
    setState('');
    setZipCode('');
    setPhone('');
    setIsDefault(false);
  };

  return (
    <div className="bg-warm-white min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            { label: 'My Account', href: '/account' },
            { label: 'Saved Addresses' },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-charcoal">Delivery Addresses</h1>
            <p className="text-xs text-charcoal/60 mt-1">
              Manage your residential and business delivery addresses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 bg-terracotta text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-terracotta-dark shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>

        {user.addresses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-stone-200 shadow-xs">
            <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-charcoal mb-1">No Addresses Saved</h3>
            <p className="text-xs text-charcoal/60 mb-6">
              Add a delivery address to speed up your checkout process next time.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-terracotta text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-terracotta-dark transition"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-3xl p-6 border transition-all relative flex flex-col justify-between ${
                  addr.isDefault
                    ? 'border-terracotta ring-2 ring-terracotta/20 shadow-xs'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-charcoal">
                        {addr.firstName} {addr.lastName}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-forest/10 text-forest font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Delete this address?')) {
                          removeAddress(addr.id);
                          toast.success('Address removed');
                        }
                      }}
                      className="text-stone-400 hover:text-red-500 p-1"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-charcoal/80 space-y-1">
                    <p>{addr.address1}</p>
                    {addr.address2 && <p>{addr.address2}</p>}
                    <p>
                      {addr.city}, {addr.state} {addr.zipCode}
                    </p>
                    <p>{addr.country}</p>
                    {addr.phone && <p className="text-charcoal/50 pt-1">Phone: {addr.phone}</p>}
                  </div>
                </div>

                {!addr.isDefault && (
                  <div className="pt-4 mt-4 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setDefaultAddress(addr.id);
                        toast.success('Default address updated');
                      }}
                      className="text-xs font-semibold text-terracotta hover:underline"
                    >
                      Set as Default Address
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Address */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
              <h2 className="text-xl font-serif font-bold text-charcoal mb-4">
                Add New Delivery Address
              </h2>
              <form onSubmit={handleAddSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address1}
                    onChange={(e) => setAddress1(e.target.value)}
                    placeholder="123 Blossom Way"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Apartment / Suite (Optional)
                  </label>
                  <input
                    type="text"
                    value={address2}
                    onChange={(e) => setAddress2(e.target.value)}
                    placeholder="Suite 200"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
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
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal mb-1">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 000-0000"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-terracotta"
                  />
                </div>

                <label className="flex items-center gap-2 pt-1 text-xs text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded accent-terracotta"
                  />
                  <span>Set as default shipping address</span>
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
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressesPage;
