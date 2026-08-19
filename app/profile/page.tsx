'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { User as UserIcon, Mail, AtSign, AlertCircle, CheckCircle2, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UserProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setName(data.user.name);
      setUsername(data.user.username);
      setEmail(data.user.email);
    } catch (e) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Profile update failed.');
      } else {
        setSuccess('Profile updated successfully!');
        if (user) {
          setUser({ ...user, name, username, email });
        }
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto my-10 px-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-full flex items-center justify-center font-bold text-xl">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Profile</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your personal account details</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-lg text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Username
            </label>
            <div className="relative">
              <AtSign className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 text-sm flex items-center justify-center gap-2 mt-4"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
