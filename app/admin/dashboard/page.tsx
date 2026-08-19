'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, FileText, Shield, ArrowRight, Clock, UserCheck, Calendar } from 'lucide-react';
import { User, Blog } from '@/lib/types';

interface StatsData {
  totalUsers: number;
  totalBlogs: number;
  recentUsers: User[];
  recentBlogs: (Blog & { author_name: string })[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500">Loading admin portal...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Management Control Center</h1>
            <p className="text-xs text-slate-400 mt-1">System overview &amp; database administration</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Link
            href="/admin/users"
            className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg text-sm transition"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/blogs"
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg border border-slate-700 text-sm transition"
          >
            Manage Blogs
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Users</p>
            <p className="text-4xl font-extrabold text-slate-900">{stats.totalUsers}</p>
          </div>
          <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Published Blogs</p>
            <p className="text-4xl font-extrabold text-slate-900">{stats.totalBlogs}</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Recent Activity Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-600" /> Recent User Registrations
            </h3>
            <Link href="/admin/users" className="text-xs font-semibold text-sky-600 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{u.name}</p>
                  <p className="text-xs text-slate-500">@{u.username} • {u.email}</p>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(u.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Blogs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Recent Published Blogs
            </h3>
            <Link href="/admin/blogs" className="text-xs font-semibold text-indigo-600 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentBlogs.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between">
                <div className="pr-4">
                  <p className="font-semibold text-slate-800 text-sm line-clamp-1">{b.title}</p>
                  <p className="text-xs text-slate-500">By {b.author_name}</p>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(b.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
