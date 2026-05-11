'use client';

import { useState } from 'react';
import { login, signup } from './actions';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    
    const action = isLogin ? login : signup;
    const result = await action(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-display p-4">
      <div className="w-full max-w-[400px] bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all duration-300">
        
        {/* Header / Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="material-icons text-primary text-[28px]">camera</span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Snapwise</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            {isLogin ? 'Welcome back to your dashboard' : 'Create your agency account'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
              isLogin 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${
              !isLogin 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-error/10 border border-error/20 rounded-xl text-error text-sm font-bold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form action={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Email Address
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="name@agency.com"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-primary text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading 
              ? 'Processing...' 
              : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Protected by strict multi-tenant authentication.
          </p>
        </div>
      </div>
    </div>
  );
}
