'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { Users, Search, Edit2, Trash2, Key, Shield, ArrowLeft, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(query)}`);
      if (!res.ok) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.message || 'Failed to update user.' });
      } else {
        setMessage({ type: 'success', text: 'User profile updated successfully!' });
        setEditingUser(null);
        fetchUsers(search);
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error updating user.' });
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this user? All their blog posts will also be deleted.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully.' });
        fetchUsers(search);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete user.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error deleting user.' });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser || !newPassword) return;

    try {
      const res = await fetch(`/api/admin/users/${resettingUser.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: `Password for @${resettingUser.username} has been reset!` });
        setResettingUser(null);
        setNewPassword('');
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to reset password.' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Error resetting password.' });
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
            <Users className="w-8 h-8 text-amber-600" /> User Account Management
          </h1>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, email, username..."
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

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-500">Loading user accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-500">#{u.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">@{u.username}</td>
                    <td className="py-3.5 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-4">
                      {u.is_disabled ? (
                        <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 rounded">
                          Disabled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setResettingUser(u)}
                        className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded border border-sky-200"
                      >
                        Reset PW
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Edit Profile (#{editingUser.id})</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disableCheck"
                  checked={editingUser.is_disabled}
                  onChange={(e) => setEditingUser({ ...editingUser, is_disabled: e.target.checked })}
                  className="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500"
                />
                <label htmlFor="disableCheck" className="text-xs font-semibold text-rose-700">
                  Disable this account (Prevents user from logging in)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
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

      {/* Reset Password Modal */}
      {resettingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-sky-600" /> Reset Password for @{resettingUser.username}
              </h3>
              <button onClick={() => setResettingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  required
                />
              </div>

              <p className="text-xs text-slate-500">
                This will set a new hashed password in MySQL. Existing password remains encrypted and is never exposed.
              </p>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
