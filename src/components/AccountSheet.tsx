"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface AccountSheetProps {
  open: boolean;
  onClose: () => void;
  /** Custom title for the unauthenticated landing view */
  title?: string;
  /** Custom subtitle for the unauthenticated landing view */
  subtitle?: string;
  /** Optional small footnote below the guest button */
  footnote?: string;
  /** Called when the user successfully authenticates (not for sign-up confirmation) */
  onAuthSuccess?: () => void;
}

export default function AccountSheet({
  open,
  onClose,
  title = "Keep what matters close",
  subtitle = "Save your journal entries, favorite verses, and mushaf position across devices.",
  footnote,
  onAuthSuccess,
}: AccountSheetProps) {
  const { user, isGuest, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [wasGuest, setWasGuest] = useState(true);

  // Track guest → authenticated transition for onAuthSuccess
  useEffect(() => {
    if (open && isGuest) {
      setWasGuest(true);
    }
  }, [open, isGuest]);

  useEffect(() => {
    if (open && wasGuest && !isGuest && onAuthSuccess) {
      onAuthSuccess();
      setWasGuest(false);
    }
  }, [open, wasGuest, isGuest, onAuthSuccess]);

  // Reset state when sheet closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setShowEmailForm(false);
        setEmail("");
        setPassword("");
        setError(null);
        setSubmitting(false);
        setGoogleLoading(false);
        setSuccessMessage(null);
      }, 400);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setError(null);
    setSubmitting(true);
    setSuccessMessage(null);

    const fn = isSignUp ? signUpWithEmail : signInWithEmail;
    const { error: authError } = await fn(email, password);

    setSubmitting(false);
    if (authError) {
      setError(authError);
    } else if (isSignUp) {
      setSuccessMessage("Check your email to confirm your account.");
    }
    // For sign-in success, onAuthSuccess fires via the user effect above
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    const { error: authError } = await signInWithGoogle();
    if (authError) {
      setGoogleLoading(false);
      setError(authError);
    }
    // If no error, the page will redirect — keep loading state
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: "rgba(45, 45, 45, 0.25)",
          backdropFilter: open ? "blur(2px)" : "blur(0px)",
          WebkitBackdropFilter: open ? "blur(2px)" : "blur(0px)",
          opacity: open ? 1 : 0,
          transition: "opacity 400ms ease-in-out, backdrop-filter 400ms ease-in-out",
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating card — slides up from bottom, settles at center */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-5"
        style={{
          pointerEvents: open ? "auto" : "none",
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Account"
          className="w-[85%] max-w-[420px] rounded-2xl px-6 pt-6 pb-6 relative"
          style={{
            backgroundColor: "var(--cream)",
            boxShadow: open
              ? "0 8px 40px rgba(45, 45, 45, 0.12), 0 2px 12px rgba(45, 45, 45, 0.06)"
              : "none",
            opacity: open ? 1 : 0,
            transform: open
              ? "translateY(8px) scale(1)"
              : "translateY(60px) scale(0.97)",
            transition: open
              ? "transform 550ms cubic-bezier(0.32, 0.72, 0, 1), opacity 400ms ease-out"
              : "transform 350ms cubic-bezier(0.32, 0.72, 0, 1), opacity 250ms ease-in",
            pointerEvents: open ? "auto" : "none",
          }}
        >
          {/* Close button — top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-olive-muted/40 hover:text-olive-muted transition-colors duration-300"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>

          {isGuest ? (
            /* ── Unauthenticated view ── */
            <>
              {!showEmailForm ? (
                <div className="flex flex-col items-center">
                  <h2 className="font-[family-name:var(--font-dm-serif)] text-[1.25rem] text-title-brown text-center leading-tight">
                    {title}
                  </h2>
                  <p className="mt-2.5 mb-6 font-[family-name:var(--font-nunito)] text-[0.8rem] text-olive-muted text-center leading-relaxed max-w-[260px]">
                    {subtitle}
                  </p>

                  <button
                    onClick={() => setShowEmailForm(true)}
                    className="w-full max-w-[260px] px-6 py-2.5 rounded-full border border-olive/25 font-[family-name:var(--font-nunito)] text-[0.84rem] font-semibold text-olive hover:bg-olive hover:text-cream transition-all duration-400"
                  >
                    Continue with Email
                  </button>

                  <button
                    onClick={handleGoogle}
                    disabled={googleLoading}
                    className="mt-2.5 w-full max-w-[260px] px-6 py-2.5 rounded-full border border-olive/15 font-[family-name:var(--font-nunito)] text-[0.84rem] font-medium text-olive-muted hover:text-olive hover:border-olive/25 transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {googleLoading ? (
                      <>
                        <span
                          className="inline-block w-3.5 h-3.5 border-[1.5px] border-olive-muted/30 border-t-olive-muted rounded-full"
                          style={{ animation: "spin 700ms linear infinite" }}
                        />
                        <span>Redirecting...</span>
                      </>
                    ) : (
                      "Continue with Google"
                    )}
                  </button>

                  {error && (
                    <p className="mt-3 font-[family-name:var(--font-nunito)] text-[0.73rem] text-red-600/80 text-center">
                      {error}
                    </p>
                  )}

                  <button
                    onClick={onClose}
                    className="mt-4 font-[family-name:var(--font-nunito)] text-[0.75rem] font-medium text-olive-muted/50 hover:text-olive-muted transition-colors duration-300"
                  >
                    Continue as Guest
                  </button>

                  {footnote && (
                    <p className="mt-2 font-[family-name:var(--font-nunito)] text-[0.68rem] text-olive-muted/40 text-center leading-snug">
                      {footnote}
                    </p>
                  )}
                </div>
              ) : (
                /* ── Email form ── */
                <div className="flex flex-col items-center">
                  <h2 className="font-[family-name:var(--font-dm-serif)] text-[1.15rem] text-title-brown text-center leading-tight mb-5">
                    {isSignUp ? "Create your account" : "Welcome back"}
                  </h2>

                  <div className="w-full max-w-[280px] space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full px-4 py-2.5 rounded-xl border border-olive/12 font-[family-name:var(--font-nunito)] text-[0.86rem] text-title-brown placeholder:text-olive-muted/40 outline-none focus:border-olive/30 transition-colors duration-300"
                      style={{ backgroundColor: "var(--cream-light)" }}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      className="w-full px-4 py-2.5 rounded-xl border border-olive/12 font-[family-name:var(--font-nunito)] text-[0.86rem] text-title-brown placeholder:text-olive-muted/40 outline-none focus:border-olive/30 transition-colors duration-300"
                      style={{ backgroundColor: "var(--cream-light)" }}
                    />

                    {error && (
                      <p className="font-[family-name:var(--font-nunito)] text-[0.73rem] text-red-600/80 text-center">
                        {error}
                      </p>
                    )}

                    {successMessage && (
                      <p className="font-[family-name:var(--font-nunito)] text-[0.73rem] text-olive text-center">
                        {successMessage}
                      </p>
                    )}

                    <button
                      onClick={handleEmailSubmit}
                      disabled={submitting || !email.trim() || !password.trim()}
                      className="w-full px-6 py-2.5 rounded-full bg-olive text-cream font-[family-name:var(--font-nunito)] text-[0.84rem] font-semibold hover:bg-olive/90 transition-all duration-400 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? "..." : isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                  </div>

                  <button
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccessMessage(null); }}
                    className="mt-4 font-[family-name:var(--font-nunito)] text-[0.73rem] font-medium text-olive-muted/60 hover:text-olive-muted transition-colors duration-300"
                  >
                    {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
                  </button>

                  <button
                    onClick={() => { setShowEmailForm(false); setError(null); setSuccessMessage(null); }}
                    className="mt-1.5 font-[family-name:var(--font-nunito)] text-[0.7rem] font-medium text-olive-muted/40 hover:text-olive-muted transition-colors duration-300"
                  >
                    Back
                  </button>
                </div>
              )}
            </>
          ) : (
            /* ── Authenticated view ── */
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-olive">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <p className="font-[family-name:var(--font-nunito)] text-[0.84rem] text-title-brown font-medium mb-1">
                {user?.email}
              </p>
              <p className="font-[family-name:var(--font-nunito)] text-[0.7rem] text-olive-muted/60 mb-5">
                Your entries are being saved
              </p>
              <button
                onClick={signOut}
                className="px-6 py-2 rounded-full border border-olive/15 font-[family-name:var(--font-nunito)] text-[0.8rem] font-medium text-olive-muted hover:text-olive hover:border-olive/30 transition-all duration-400"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
