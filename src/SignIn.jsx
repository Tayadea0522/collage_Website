import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";

export function SignIn({ onNavigate, initialEmail = "", successMessage = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(successMessage);

  useEffect(() => {
    // Check if redirected from SignUp with stored email and message
    const savedEmail = sessionStorage.getItem("signedUpEmail");
    const savedSuccessMsg = sessionStorage.getItem("signUpSuccessMessage");

    if (savedEmail) {
      setEmail(savedEmail);
      sessionStorage.removeItem("signedUpEmail");
    } else if (initialEmail) {
      setEmail(initialEmail);
    }

    if (savedSuccessMsg) {
      setSuccessMsg(savedSuccessMsg);
      sessionStorage.removeItem("signUpSuccessMessage");
    } else if (successMessage) {
      setSuccessMsg(successMessage);
    }
  }, [initialEmail, successMessage]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        if (onNavigate) {
          onNavigate("home");
        }
        window.location.href = "/";
      }
    } catch (err) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold font-serif text-slate-900">Sign In</h2>
          <p className="text-xs text-slate-500">Welcome back! Please enter your details to sign in.</p>
        </div>

        {/* Success message above the form when redirected from successful signup */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-3 font-medium shadow-sm">
            <svg className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="leading-relaxed">{successMsg}</div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold py-3 px-4 rounded-lg text-xs shadow transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="text-center pt-2 text-[11px] text-slate-500 border-t border-slate-100">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("signup")}
              className="font-bold text-slate-900 hover:underline"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
