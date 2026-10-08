import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const LoginPage: React.FC = () => {
  useDocumentTitle('Sign In | WallArt');
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || (location.state as any)?.from?.pathname || '/account';
  const isCheckoutRedirect = from.includes('checkout');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    const ok = await login(email, password);
    if (ok) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="bg-warm-white min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> {isCheckoutRedirect ? 'Checkout Login' : 'Welcome Back'}
          </div>
          <h1 className="text-3xl font-serif font-bold text-charcoal">
            {isCheckoutRedirect ? 'Sign In to Checkout' : 'Sign In'}
          </h1>
          <p className="text-xs text-charcoal/60 mt-1">
            {isCheckoutRedirect
              ? 'Please log in to your account to review and complete your order.'
              : 'Access your orders, saved addresses, and wishlist.'}
          </p>
        </div>

        {/* Info tip */}
        <div className="mb-6 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-charcoal/80 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-forest flex-shrink-0 mt-0.5" />
          <div>
            <strong>Sign in with your HinchWall account.</strong> Don't have one?{' '}
            <Link
              to={isCheckoutRedirect ? `/register?redirect=${encodeURIComponent(from)}` : '/register'}
              className="text-terracotta hover:underline font-semibold"
            >
              Create a free account
            </Link>.
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-charcoal">Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); toast('Password reset link sent to demo email!'); }} className="text-xs text-terracotta hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-terracotta"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3.5 px-4 bg-terracotta text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-terracotta-dark shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? 'Signing In...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-charcoal/70">
          Don’t have an account yet?{' '}
          <Link
            to={isCheckoutRedirect ? `/register?redirect=${encodeURIComponent(from)}` : '/register'}
            className="font-semibold text-terracotta hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
