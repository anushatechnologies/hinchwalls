import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, Mail, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { firebaseAuthService } from '../services/firebase';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const ProfileCompletionPage: React.FC = () => {
  useDocumentTitle('Complete Profile | HinchMart');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuthStore();

  const [name, setName] = useState(user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim());
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setSubmitting(true);
    try {
      const fbToken = await firebaseAuthService.getIdToken(false);
      if (fbToken) {
        await authService.syncWithBackend(fbToken, {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        });
      }

      const nameParts = name.trim().split(' ');
      updateProfile({
        name: name.trim(),
        firstName: nameParts[0] || 'User',
        lastName: nameParts.slice(1).join(' ') || '',
        email: email.trim(),
        phone: phone.trim(),
        isProfileComplete: true,
      });

      toast.success('Profile completed successfully!');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-50 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Almost There
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">
            Complete Your Profile
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Please provide your contact details to finish setting up your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
              />
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-3.5 px-4 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? 'Saving Profile...' : 'Complete Profile'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletionPage;
