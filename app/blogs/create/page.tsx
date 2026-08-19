'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenSquare, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateBlogPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) return setError('Blog title is required.');
    if (!description.trim()) return setError('Blog content/description is required.');

    setLoading(true);

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to publish blog post.');
      } else {
        setSuccess('Blog post published successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-10 px-4">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-lg flex items-center justify-center">
            <PenSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Blog Post</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Draft and publish a new post to the platform</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Blog Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Getting Started with Next.js App Router and MySQL"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white text-sm font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Content / Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={12}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your full blog post content here..."
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white text-sm leading-relaxed"
              required
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Publishing Post...' : 'Publish Blog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
