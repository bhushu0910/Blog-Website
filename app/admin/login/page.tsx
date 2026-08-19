'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, User, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!username.trim() || !password) {
      return setError('Please provide admin username and password.');
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid admin credentials.');
      } else {
        setSuccess('Admin authentication successful! Redirecting to admin dashboard...');
        setTimeout(() => {
          router.push('/admin/dashboard');
          router.refresh();
        }, 1000);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Admin Portal Login</h1>
          <p className="text-xs text-slate-400">Authorized administrative personnel only</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-lg text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-300 rounded-lg text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Admin Username
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm placeholder-slate-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm placeholder-slate-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 text-sm mt-2"
          >
            {loading ? 'Authenticating...' : 'Admin Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
