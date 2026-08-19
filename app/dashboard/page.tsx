'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Blog } from '@/lib/types';
import BlogCard from '@/components/BlogCard';
import { User as UserIcon, PlusCircle, Settings, LogOut, FileText, Calendar, Mail } from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userBlogs, setUserBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/login');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const blogsRes = await fetch(`/api/blogs?user_id=${userData.user.id}&limit=100`);
      if (blogsRes.ok) {
        const blogsData = await blogsRes.json();
        setUserBlogs(blogsData.blogs || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBlog = (id: number) => {
    router.push(`/blogs/edit/${id}`);
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setDeleteMsg('Blog post deleted successfully.');
        setUserBlogs(userBlogs.filter((b) => b.id !== id));
        setTimeout(() => setDeleteMsg(null), 3000);
      } else {
        alert(data.message || 'Failed to delete blog.');
      }
    } catch (e) {
      alert('Error deleting blog post.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const joinDate = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 backdrop-blur border border-white/20 rounded-full flex items-center justify-center font-bold text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-sky-100 mt-1">
                <span>@{user.username}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {user.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Joined {joinDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              href="/blogs/create"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-sky-700 font-semibold rounded-lg hover:bg-sky-50 transition text-sm shadow"
            >
              <PlusCircle className="w-4 h-4" /> Create Blog
            </Link>
            <Link
              href="/profile"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur text-white font-semibold rounded-lg transition text-sm"
            >
              <Settings className="w-4 h-4" /> Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/80 hover:bg-rose-600 text-white font-semibold rounded-lg transition text-sm"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </div>

      {deleteMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm flex items-center justify-between">
          <span>{deleteMsg}</span>
        </div>
      )}

      {/* User's Blogs Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Blog Posts ({userBlogs.length})</h2>
          </div>
          <Link
            href="/blogs/create"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
          >
            + New Post
          </Link>
        </div>

        {userBlogs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">You haven&apos;t written any blog posts yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Share your insights, code tutorials, or tech stories with readers across the web.
            </p>
            <Link
              href="/blogs/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Create Your First Blog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                showActions={true}
                onEdit={handleEditBlog}
                onDelete={handleDeleteBlog}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
