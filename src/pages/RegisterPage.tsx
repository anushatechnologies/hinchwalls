import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Phone,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { firebaseAuthService } from '../services/firebase';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import type { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

type RegisterTab = 'phone' | 'email';

export const RegisterPage: React.FC = () => {
  useDocumentTitle('Create Account | HinchMart');
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const from = redirectParam || (location.state as any)?.from?.pathname || '/account';

  const {
    loginWithPhone,
    verifyPhoneOtp,
    registerWithEmail,
    loginWithGoogle,
    isLoading,
    error: authError,
    clearError,
  } = useAuthStore();

  const [activeTab, setActiveTab] = useState<RegisterTab>('phone');

  // Phone Registration State
  const [phoneName, setPhoneName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Email Registration State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Local UI error
  const [localError, setLocalError] = useState<string | null>(null);

  // Resend cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    clearError();
    return () => {
      firebaseAuthService.clearRecaptcha();
    };
  }, [clearError]);

  const handlePostRegisterRedirect = (role: string, isProfileComplete: boolean) => {
    if (!isProfileComplete) {
      navigate('/complete-profile', { state: { from: { pathname: from } }, replace: true });
      return;
    }

    if (role === 'ADMIN' && from === '/account') {
      navigate('/admin', { replace: true });
    } else if (role === 'SELLER' && from === '/account') {
      navigate('/seller/dashboard', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  // 1. Phone: Send OTP
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!phoneName.trim()) {
      setLocalError('Please enter your full name.');
      return;
    }

    const cleanNumber = phone.trim().replace(/\D/g, '');
    if (!cleanNumber || cleanNumber.length < 10) {
      setLocalError('Please enter a valid 10-digit mobile phone number.');
      return;
    }

    const fullPhone = `${countryCode}${cleanNumber.slice(-10)}`;

    try {
      const verifier = firebaseAuthService.getRecaptchaVerifier('register-recaptcha-container');
      recaptchaVerifierRef.current = verifier;

      const confResult = await loginWithPhone(fullPhone, verifier);
      setConfirmationResult(confResult);
      setOtpSent(true);
      setResendCooldown(30);
      toast.success(`OTP sent to ${fullPhone}`);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send OTP code.');
    }
  };

  // 2. Phone: Verify OTP & Sync with backend
  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setLocalError('Session expired. Please request a new OTP.');
      return;
    }

    const cleanOtp = otp.trim().replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      setLocalError('Please enter the 6-digit verification code.');
      return;
    }

    setLocalError(null);
    clearError();

    try {
      const result = await verifyPhoneOtp(confirmationResult, cleanOtp, {
        name: phoneName.trim(),
      });
      toast.success(`Welcome to HinchMart, ${phoneName}! 🎉`);
      handlePostRegisterRedirect(result.role, result.isProfileComplete);
    } catch (err: any) {
      setLocalError(err.message || 'Invalid OTP code.');
    }
  };

  // 3. Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    const cleanNumber = phone.trim().replace(/\D/g, '');
    const fullPhone = `${countryCode}${cleanNumber.slice(-10)}`;

    try {
      const verifier = firebaseAuthService.getRecaptchaVerifier('register-recaptcha-container');
      recaptchaVerifierRef.current = verifier;
      const confResult = await loginWithPhone(fullPhone, verifier);
      setConfirmationResult(confResult);
      setResendCooldown(30);
      toast.success('New OTP sent successfully!');
    } catch (err: any) {
      setLocalError(err.message || 'Could not resend OTP.');
    }
  };

  // 4. Email Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setLocalError('Please complete all registration fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must contain at least 6 characters.');
      return;
    }

    setLocalError(null);
    clearError();

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const result = await registerWithEmail(email.trim(), password, fullName);
      toast.success(`Welcome to HinchMart, ${firstName}! 🎉`);
      handlePostRegisterRedirect(result.role, result.isProfileComplete);
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed. This email may already be in use.');
    }
  };

  // 5. Google Sign-Up
  const handleGoogleSignUp = async () => {
    setLocalError(null);
    clearError();

    try {
      const result = await loginWithGoogle();
      toast.success('Account verified with Google!');
      handlePostRegisterRedirect(result.role, result.isProfileComplete);
    } catch (err: any) {
      setLocalError(err.message || 'Google registration was not completed.');
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="bg-stone-50 min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Invisible container for Firebase reCAPTCHA */}
      <div id="register-recaptcha-container" />

      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Join HinchMart
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900">Create Account</h1>
          <p className="text-xs text-stone-500 mt-1">
            Sign up to track architectural orders, save design specifications, and access trade pricing.
          </p>
        </div>

        {/* Error banner */}
        {displayedError && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{displayedError}</div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab('phone');
              setLocalError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'phone'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('email');
              setLocalError(null);
            }}
            className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'email'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
        </div>

        {/* Tab 1: Phone OTP Registration */}
        {activeTab === 'phone' && (
          <>
            {!otpSent ? (
              <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phoneName}
                      onChange={(e) => setPhoneName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-3 py-2.5 border border-stone-300 rounded-xl text-sm bg-stone-50 text-stone-800 font-semibold focus:outline-none focus:border-orange-500"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+971">🇦🇪 +971</option>
                    </select>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                      />
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3.5 px-4 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Sending Code...' : 'Verify Phone Number'}{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl text-xs text-stone-700 flex items-center justify-between">
                  <span>
                    Sent to <strong>{countryCode} {phone}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setConfirmationResult(null);
                    }}
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Enter 6-Digit OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 border border-stone-300 rounded-xl text-center text-xl font-mono tracking-widest focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Didn't receive code?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isLoading}
                    onClick={handleResendOtp}
                    className="text-orange-600 font-bold hover:underline disabled:text-stone-400 disabled:no-underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full mt-4 py-3.5 px-4 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Registration'}{' '}
                  <ShieldCheck className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}

        {/* Tab 2: Email Registration */}
        {activeTab === 'email' && (
          <form onSubmit={handleEmailRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jane"
                    className="w-full pl-9 pr-3 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
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
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-4 bg-orange-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-orange-700 shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <span className="relative bg-white px-3 text-xs text-stone-400 uppercase font-semibold">
            Or continue with
          </span>
        </div>

        {/* Google Sign-Up Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          className="w-full py-3 px-4 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 rounded-xl font-bold text-xs uppercase tracking-wider shadow-xs transition flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.1 3.66-5.18 3.66-9.12z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.25C.45 8.15 0 9.99 0 12s.45 3.85 1.25 5.43l4.03-3.14z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.57l4.03 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
            />
          </svg>
          Google Account
        </button>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-stone-100 text-center text-xs text-stone-500">
          Already have an account?{' '}
          <Link
            to={from.includes('checkout') ? `/login?redirect=${encodeURIComponent(from)}` : '/login'}
            className="font-semibold text-orange-600 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
