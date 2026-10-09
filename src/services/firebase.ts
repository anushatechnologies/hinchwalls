import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  type User,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Unsubscribe,
  updateProfile,
} from 'firebase/auth';

// Read Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderApiKeyHinchMart',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hinchmart-auth.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hinchmart-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hinchmart-app.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

// Singleton Firebase initialization
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

// Keep track of active reCAPTCHA verifier instance
let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Maps Firebase error codes to clean, user-friendly messages.
 * Prevents internal codes and credentials from leaking to the UI.
 */
export function formatFirebaseError(err: any): string {
  if (!err) return 'An unexpected authentication error occurred.';
  const code = err.code || err.message || '';

  switch (code) {
    case 'auth/invalid-phone-number':
      return 'The mobile phone number entered is invalid. Please check and try again.';
    case 'auth/missing-phone-number':
      return 'Please enter a valid mobile number.';
    case 'auth/quota-exceeded':
      return 'SMS quota exceeded for today. Please try again later or use Google sign-in.';
    case 'auth/invalid-verification-code':
      return 'The OTP entered is incorrect. Please check the 6-digit code and try again.';
    case 'auth/code-expired':
      return 'The OTP has expired. Please request a new code.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact customer support.';
    case 'auth/user-not-found':
      return 'No account was found matching these credentials.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your details.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completion.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in request was cancelled.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    default:
      if (typeof err.message === 'string' && !err.message.includes('Firebase:')) {
        return err.message;
      }
      return 'Authentication could not be completed. Please try again.';
  }
}

/**
 * Firebase Authentication Service
 */
export const firebaseAuthService = {
  /**
   * Initialize or retrieve reCAPTCHA verifier for phone OTP
   */
  getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
    if (activeRecaptchaVerifier) {
      try {
        activeRecaptchaVerifier.clear();
      } catch {
        // ignore clear error
      }
      activeRecaptchaVerifier = null;
    }

    activeRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // reCAPTCHA expired, reset if needed
      },
    });

    return activeRecaptchaVerifier;
  },

  /**
   * Clear existing reCAPTCHA instance
   */
  clearRecaptcha(): void {
    if (activeRecaptchaVerifier) {
      try {
        activeRecaptchaVerifier.clear();
      } catch {
        // ignore
      }
      activeRecaptchaVerifier = null;
    }
  },

  /**
   * Send Phone OTP using Firebase Authentication
   */
  async sendPhoneOtp(
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> {
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      return confirmationResult;
    } catch (err: any) {
      throw new Error(formatFirebaseError(err));
    }
  },

  /**
   * Verify the entered OTP against Firebase confirmationResult
   */
  async verifyOtp(
    confirmationResult: ConfirmationResult,
    otpCode: string
  ): Promise<{ user: User; idToken: string }> {
    try {
      const result = await confirmationResult.confirm(otpCode);
      const idToken = await result.user.getIdToken();
      return { user: result.user, idToken };
    } catch (err: any) {
      throw new Error(formatFirebaseError(err));
    }
  },

  /**
   * Google Sign-In via Popup
   */
  async signInWithGoogle(): Promise<{ user: User; idToken: string }> {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      return { user: result.user, idToken };
    } catch (err: any) {
      throw new Error(formatFirebaseError(err));
    }
  },

  /**
   * Email/Password Sign-In
   */
  async signInWithEmail(email: string, pass: string): Promise<{ user: User; idToken: string }> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      const idToken = await result.user.getIdToken();
      return { user: result.user, idToken };
    } catch (err: any) {
      throw new Error(formatFirebaseError(err));
    }
  },

  /**
   * Email/Password Sign-Up
   */
  async signUpWithEmail(
    email: string,
    pass: string,
    name?: string
  ): Promise<{ user: User; idToken: string }> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        try {
          await updateProfile(result.user, { displayName: name });
        } catch {
          // ignore display name update error
        }
      }
      const idToken = await result.user.getIdToken();
      return { user: result.user, idToken };
    } catch (err: any) {
      throw new Error(formatFirebaseError(err));
    }
  },

  /**
   * Obtain a fresh Firebase ID Token from current Firebase user session
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    try {
      return await currentUser.getIdToken(forceRefresh);
    } catch {
      return null;
    }
  },

  /**
   * Get current Firebase user
   */
  getCurrentFirebaseUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Listen for Firebase auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Sign out from Firebase
   */
  async signOut(): Promise<void> {
    this.clearRecaptcha();
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore sign out error
    }
  },
};
