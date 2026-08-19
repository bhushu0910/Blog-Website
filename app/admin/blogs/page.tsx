'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Blog } from '@/lib/types';
import { FileText, Search, Edit3, Trash2, ArrowLeft, X, Eye } from 'lucide-react';

interface AdminBlogItem extends Blog {
  author_name: string;
  author_username: string;
  author_email: string;
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<AdminBlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit Modal State
  const [editingBlog, setEditingBlog] = useState<AdminBlogItem | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs?search=${encodeURIComponent(query)}`);
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBlogs(search);
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    try {
      const res = await fetch(`/api/admin/blogs/${editingBlog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBlog),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Failed to update blog.' });
      } else {
        setMessage({ type: 'success', text: 'Blog post updated successfully!' });
        setEditingBlog(null);
        fetchBlogs(search);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error updating blog.' });
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Blog post deleted.' });
        fetchBlogs(search);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete blog.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error deleting blog.' });
    }
  };

  const togglePublishStatus = async (blog: AdminBlogItem) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...blog, status: newStatus }),
      });

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Blog #${blog.id} status changed to ${newStatus}.`,
        });
        fetchBlogs(search);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to update status.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-amber-600" /> Blog Management Portal
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or author..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg text-sm hover:bg-amber-700">
            Search
          </button>
        </form>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm flex items-center justify-between ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-500 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Blogs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Loading blog posts...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No blog posts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-500">#{b.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 line-clamp-1 max-w-xs">
                      {b.title}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {b.author_name} <span className="text-xs text-slate-400">(@{b.author_username})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => togglePublishStatus(b)}
                        className={`px-2.5 py-0.5 text-xs font-bold rounded cursor-pointer transition ${
                          b.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title="Click to toggle publish/unpublish"
                      >
                        {b.status === 'published' ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/blogs/${b.id}`}
                        target="_blank"
                        className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Link>
                      <button
                        onClick={() => setEditingBlog(b)}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(b.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Blog Modal */}
      {editingBlog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Admin Edit Blog Post (#{editingBlog.id})</h3>
              <button onClick={() => setEditingBlog(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingBlog.title}
                  onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingBlog.status}
                  onChange={(e) =>
                    setEditingBlog({
                      ...editingBlog,
                      status: e.target.value as 'published' | 'draft',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
                <textarea
                  rows={8}
                  value={editingBlog.description}
                  onChange={(e) => setEditingBlog({ ...editingBlog, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingBlog(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
