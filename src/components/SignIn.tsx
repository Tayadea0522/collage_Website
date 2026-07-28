import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

interface SignInProps {
  onNavigate?: (tab: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
      } else {
        if (onNavigate) {
          onNavigate('home');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F0F4F8] font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#0A2342] text-amber-400 mx-auto flex items-center justify-center font-bold">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold font-serif text-[#0A2342]">Sign In</h2>
          <p className="text-xs text-slate-500">
            Welcome back! Please enter your details to sign in.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-[#D97706] text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 p-2.5 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-[#D97706] text-slate-900"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D97706] hover:bg-[#b86202] text-slate-950 font-bold py-3 px-4 rounded-lg text-xs shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="text-center text-xs text-slate-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('signup')}
              className="font-bold text-[#0A2342] hover:underline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
