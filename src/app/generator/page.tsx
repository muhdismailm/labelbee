"use client";

import { useState, useEffect } from "react";
import { SlipData, defaultSlipData } from "@/types";
import GeneratorForm from "@/components/GeneratorForm";
import SlipPreview from "@/components/SlipPreview";
import { exportToPdf } from "@/utils/exportPdf";
import { 
  onAuthStateChanged, 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";


const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof (window as unknown as { Razorpay: unknown }).Razorpay !== "undefined") {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Home() {
  // Firebase Auth states
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Auth Form Inputs
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [loadingAuthSubmit, setLoadingAuthSubmit] = useState<boolean>(false);

  // Standard functional states
  const [data, setData] = useState<SlipData>(defaultSlipData);
  const [credits, setCredits] = useState<number>(0);
  const [isPackModalOpen, setIsPackModalOpen] = useState<boolean>(false);
  const [loadingPayment, setLoadingPayment] = useState<boolean>(false);

  // Listen to active Firebase authentication session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync credits balance for the active Firebase user from Firestore
  useEffect(() => {
    let unsubscribeFirestore: () => void;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setCredits(docSnap.data().credits || 0);
        } else {
          setCredits(0);
        }
      }, (error) => {
        console.error("Firestore credits sync error:", error);
      });
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCredits(0);
    }
    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    }
  }, [user]);

  const handleDataChange = (updates: Partial<SlipData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  // Firebase auth login/signup submit handler
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setLoadingAuthSubmit(true);

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, authEmail, authPassword);
        setIsAuthModalOpen(false);
        // Clear forms
        setAuthEmail("");
        setAuthPassword("");
      } else {
        if (!authName.trim()) {
          throw new Error("Full name is required.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        // Update user display name
        await updateProfile(userCredential.user, {
          displayName: authName,
        });
        setIsAuthModalOpen(false);
        // Clear forms
        setAuthEmail("");
        setAuthPassword("");
        setAuthName("");
      }
    } catch (err) {
      console.error("Authentication error:", err);
      const error = err as Error;
      // Simplify Firebase error messages for standard parent/teacher view
      let msg = error.message || "An authentication error occurred.";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
        msg = "Invalid email or password. Please try again.";
      } else if (msg.includes("auth/email-already-in-use")) {
        msg = "This email is already registered. Please sign in instead.";
      } else if (msg.includes("auth/invalid-email")) {
        msg = "Please enter a valid email address.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password must be at least 6 characters.";
      }
      setAuthError(msg);
    } finally {
      setLoadingAuthSubmit(false);
    }
  };

  const handleSignOut = async () => {
    if (confirm("Are you sure you want to sign out?")) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setLoadingAuthSubmit(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsAuthModalOpen(false);
    } catch (err) {
      console.error("Google Auth error:", err);
      const error = err as Error;
      let msg = error.message || "Failed to sign in with Google.";
      if (msg.includes("auth/popup-closed-by-user")) {
        msg = "Sign in popup was closed. Please try again.";
      } else if (msg.includes("auth/operation-not-allowed")) {
        msg = "Google sign-in is not enabled in Firebase Console. Please enable it under authentication providers.";
      }
      setAuthError(msg);
    } finally {
      setLoadingAuthSubmit(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!authEmail.trim()) {
      setAuthError("Please enter your email address first to reset your password.");
      setAuthSuccess(null);
      return;
    }
    setAuthError(null);
    setAuthSuccess(null);
    try {
      await sendPasswordResetEmail(auth, authEmail);
      setAuthSuccess("Password reset link has been sent to your email! Please check your inbox.");
    } catch (err) {
      console.error("Reset error:", err);
      const error = err as Error;
      let msg = error.message || "Failed to send reset email.";
      if (msg.includes("auth/user-not-found")) {
        msg = "No user found with this email address.";
      } else if (msg.includes("auth/invalid-email")) {
        msg = "Please enter a valid email address.";
      }
      setAuthError(msg);
    }
  };



  const handlePrint = async () => {
    // 1. Gate behind authentication
    if (!user) {
      setAuthError(null);
      setAuthMode('login');
      setIsAuthModalOpen(true);
      return;
    }

    // 2. Gate behind dynamic credit balance
    if (credits <= 0) {
      setIsPackModalOpen(true);
      return;
    }

    // 3. Deduct credit, update state/local storage and trigger download
    try {
      const newCredits = credits - 1;
      await setDoc(doc(db, "users", user.uid), { credits: newCredits }, { merge: true });
      setCredits(newCredits);

      await exportToPdf("print-container", `${data.studentName.replace(/\s+/g, '-').toLowerCase()}-slips.pdf`);
    } catch {
      alert("Failed to generate PDF. Please try again.");
    }
  };

  // Dynamic Razorpay checkout handler for tiered packages
  const handleBuyPack = async (packageId: 'pack_1' | 'pack_4' | 'pack_10') => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    setLoadingPayment(true);

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ packageId }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initiate checkout. Please try again later.");
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Razorpay SDK failed to load. Please check your internet connection or disable ad-blockers.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LabelBee Credits",
        description: `Unlock ${
          packageId === 'pack_1' ? '1 Download' : packageId === 'pack_4' ? '4 Downloads' : '10 Downloads'
        }`,
        image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=128&auto=format&fit=crop", 
        order_id: orderData.id,
        handler: async function () {
          try {
            // We no longer update credits here locally, the webhook will do it securely
            setLoadingPayment(false);
            setIsPackModalOpen(false);

            alert(`🎉 Success! Your payment was received. Your credits will be updated shortly once verified.`);
          } catch (error) {
            console.error("PDF generation after checkout failed:", error);
            setLoadingPayment(false);
          }
        },
        prefill: {
          name: user.displayName || "User",
          email: user.email || "user@labelbee.com",
        },
        notes: {
          userId: user.uid,
          packageId: packageId,
        },
        theme: {
          color: "#4f46e5", 
        },
        modal: {
          ondismiss: function () {
            setLoadingPayment(false);
          },
        },
      };

      const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      const error = err as Error;
      alert(error.message || "An unexpected error occurred launching Razorpay checkout.");
      setLoadingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-200">
              LB
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">LabelBee</span>
          </div>

          <nav className="flex items-center gap-4">
            {/* Developer testing tools */}
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 border-r border-slate-200 pr-3">
                <button
                  onClick={async () => {
                    const newTotal = credits + 5;
                    await setDoc(doc(db, "users", user.uid), { credits: newTotal }, { merge: true });
                  }}
                  className="text-[10px] text-slate-400 hover:text-indigo-600 px-2 py-1 rounded border border-slate-100 hover:border-indigo-100 transition-all font-mono cursor-pointer"
                  title="Dev Tool: Give 5 test credits instantly"
                >
                  +5 Credits
                </button>
                <button
                  onClick={async () => {
                    await setDoc(doc(db, "users", user.uid), { credits: 0 }, { merge: true });
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-600 px-2 py-1 rounded border border-slate-100 hover:border-rose-100 transition-all font-mono cursor-pointer"
                  title="Dev Tool: Reset credits balance to 0"
                >
                  Clear Credits
                </button>
              </div>
            )}

            {/* Authenticated user UI */}
            {authLoaded && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="hidden md:inline text-sm text-slate-500 font-medium">
                      Hi, {user.displayName || "Parent"}!
                    </span>

                    {/* Interactive credit balance badge */}
                    <button
                      onClick={() => setIsPackModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-700 text-xs font-bold transition-all shadow-sm cursor-pointer"
                      title="Click to buy more credits"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                      <span>{credits} {credits === 1 ? 'Credit' : 'Credits'}</span>
                    </button>

                    {/* Simple Custom Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 transition-all cursor-pointer"
                      title="Sign Out"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthError(null);
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}

            {/* Main Action CTA Button */}
            <button
              onClick={handlePrint}
              disabled={loadingPayment}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-sm flex items-center gap-2 cursor-pointer ${
                loadingPayment
                  ? "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                  : user && credits > 0
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white hover:scale-[1.02] active:scale-[0.98] shadow-emerald-100 shadow-lg"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white hover:scale-[1.02] active:scale-[0.98] shadow-indigo-100 shadow-lg"
              }`}
            >
              {loadingPayment ? (
                <>
                  <svg className="animate-spin -ml-1 mr-1 h-4.5 w-4.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Securing checkout...</span>
                </>
              ) : user && credits > 0 ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>Download PDF (-1 Credit)</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  <span>Export PDF</span>
                </>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar - Form */}
        <aside className="w-full lg:w-[400px] xl:w-[450px] bg-white border-r border-slate-200 overflow-y-auto h-[calc(100vh-64px)]">
          <GeneratorForm data={data} onChange={handleDataChange} />
        </aside>

        {/* Right Area - Preview */}
        <section className="flex-grow bg-slate-50/50 overflow-y-auto h-[calc(100vh-64px)] relative p-6 lg:p-10">
          <SlipPreview data={data} />
        </section>
      </main>

      {/* Custom Glassmorphic Firebase Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-8 max-h-[95vh] overflow-y-auto max-w-md w-full shadow-2xl relative flex flex-col gap-4 animate-scale-up">
            
            {/* Close Button */}
            <button 
              onClick={() => { if (!loadingAuthSubmit) setIsAuthModalOpen(false); }}
              disabled={loadingAuthSubmit}
              className="absolute top-4 right-4 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 p-2 rounded-full transition-colors disabled:opacity-50 z-10 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Custom Premium Brand Logo Badge */}
            <div className="flex justify-start">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
              </div>
            </div>

            {/* Modal Title with decorative crescent shape inspired by the screenshot */}
            <div className="relative text-left w-full mt-2">
              {/* Crescent Semicircle Graphic Accent */}
              <div className="absolute -top-1.5 left-[155px] w-7 h-3.5 bg-amber-400/90 rounded-t-full rotate-[15deg]"></div>
              
              <h3 className="text-[32px] font-black text-slate-900 leading-[1.12] tracking-tight">
                Welcome<br/>
                To {authMode === 'login' ? 'LabelBee!' : 'Register!'}
              </h3>
              <p className="text-[13px] font-semibold text-slate-400 mt-2.5">
                {authMode === 'login' ? 'Login into your account to access the site' : 'Create your account to access the site'}
              </p>
            </div>

            {/* Error Notification Badge */}
            {authError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2 animate-shake">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500 flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span>{authError}</span>
              </div>
            )}

            {/* Success Notification Badge */}
            {authSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold flex items-center gap-2 animate-fade-in">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 flex-shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span>{authSuccess}</span>
              </div>
            )}

            {/* Google Authentication Button */}
            <button
              type="button"
              disabled={loadingAuthSubmit}
              onClick={handleGoogleSignIn}
              className="w-full py-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-extrabold shadow-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-grow h-px bg-slate-100"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">or</span>
              <div className="flex-grow h-px bg-slate-100"></div>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
              
              {/* Name Field (Sign Up Mode Only) */}
              {authMode === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-5 py-3 rounded-full border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all text-slate-900 font-medium"
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">Email</label>
                <input
                  type="email"
                  required
                  placeholder="parent@gmail.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-full border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all text-slate-900 font-medium"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-5 py-3 rounded-full border border-slate-200 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all text-slate-900 font-medium"
                />
              </div>

              {/* Remember Me & Forgot Password Row (Login Mode Only) */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-0.5 px-2">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none hover:text-slate-600 transition-colors">
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                    />
                    <span>Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    onClick={handleForgotPassword}
                    className="text-indigo-600 hover:underline cursor-pointer bg-transparent border-none p-0 font-bold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingAuthSubmit}
                className="w-full py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer"
              >
                {loadingAuthSubmit ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{authMode === 'login' ? 'Sign In' : 'Sign Up'}</span>
                )}
              </button>
            </form>

            {/* Toggle Sign In / Sign Up Mode Link */}
            <div className="text-center text-xs font-bold text-slate-400 mt-2">
              {authMode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button 
                    onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Create here
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button 
                    onClick={() => { setAuthMode('login'); setAuthError(null); }}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                  >
                    Log In
                  </button>
                </span>
              )}
            </div>

            {/* Copyright Footer */}
            <p className="text-[10px] font-bold text-slate-300 text-center tracking-wide mt-2">
              Copyright by LabelBee 2026. All Rights Reserved.
            </p>

          </div>
        </div>
      )}

      {/* Credit Package Selector Modal */}
      {isPackModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-h-[95vh] overflow-y-auto max-w-3xl w-full shadow-2xl relative flex flex-col gap-5 animate-scale-up">
            
            {/* Close Button */}
            <button 
              onClick={() => { if (!loadingPayment) setIsPackModalOpen(false); }}
              disabled={loadingPayment}
              className="absolute top-4 right-4 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 p-2 rounded-full transition-colors disabled:opacity-50 z-10 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Modal Header */}
            <div className="text-center">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                Credits Required
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mt-2">
                Choose a Print Package
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Deduct 1 credit for each high-resolution A4 name slips sheet. Purchase a pack to unlock instant downloads.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
              
              {/* Pack 1 */}
              <div className="border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center gap-4 bg-white relative hover:shadow-md transition-all duration-300">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  Starter Pack
                </span>
                <div className="my-1">
                  <div className="text-3xl font-black text-slate-800">1</div>
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Download Credit</div>
                </div>
                <div className="text-2xl font-extrabold text-slate-800">
                  ₹11 <span className="text-sm font-normal text-slate-400">INR</span>
                </div>
                <button
                  onClick={() => handleBuyPack('pack_1')}
                  disabled={loadingPayment}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all cursor-pointer"
                >
                  Buy Starter
                </button>
              </div>

              {/* Pack 4 */}
              <div className="border-2 border-indigo-500 rounded-2xl p-5 flex flex-col items-center text-center gap-4 bg-indigo-50/25 relative shadow-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold uppercase tracking-wide">
                  Save 25%
                </span>
                <div className="my-1">
                  <div className="text-3xl font-black text-indigo-600">4</div>
                  <div className="text-xs text-indigo-400 uppercase font-bold tracking-wider">Download Credits</div>
                </div>
                <div className="text-2xl font-extrabold text-slate-800">
                  ₹33 <span className="text-sm font-normal text-slate-400">INR</span>
                </div>
                <button
                  onClick={() => handleBuyPack('pack_4')}
                  disabled={loadingPayment}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Buy Popular
                </button>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                  Most Popular
                </div>
              </div>

              {/* Pack 10 */}
              <div className="border border-amber-300 rounded-2xl p-5 flex flex-col items-center text-center gap-4 bg-amber-50/10 relative hover:shadow-md transition-all duration-300">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                  Best Value
                </span>
                <div className="my-1">
                  <div className="text-3xl font-black text-amber-500">10</div>
                  <div className="text-xs text-amber-400 uppercase font-bold tracking-wider">Download Credits</div>
                </div>
                <div className="text-2xl font-extrabold text-slate-800">
                  ₹99 <span className="text-sm font-normal text-slate-400">INR</span>
                </div>
                <button
                  onClick={() => handleBuyPack('pack_10')}
                  disabled={loadingPayment}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-sm font-bold hover:scale-[1.02] transition-all cursor-pointer"
                >
                  Buy Super Value
                </button>
              </div>

            </div>

            {/* Modal Footer loading indicator */}
            {loadingPayment && (
              <div className="flex items-center justify-center gap-2 text-indigo-600 text-xs font-semibold py-2 animate-pulse">
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Securing transaction with Razorpay... Please don&apos;t close this window.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

