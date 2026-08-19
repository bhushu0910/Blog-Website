'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, User as UserIcon, LogOut, LayoutDashboard, Shield, Menu, X, PlusCircle, Sun, Moon } from 'lucide-react';
import { User, Admin } from '@/lib/types';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    fetchAuth();
  }, [pathname]);

  const fetchAuth = async () => {
    try {
      // Check User Auth
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      } else {
        setUser(null);
      }

      // Check Admin Auth
      const adminRes = await fetch('/api/admin/auth/me');
      if (adminRes.ok) {
        const adminData = await adminRes.json();
        setAdmin(adminData.admin);
      } else {
        setAdmin(null);
      }
    } catch (e) {
      setUser(null);
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const handleAdminLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    setAdmin(null);
    router.push('/admin/login');
    router.refresh();
  };

  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xl hover:opacity-90">
            <BookOpen className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span>Blog</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors hover:text-sky-600 dark:hover:text-sky-400 ${
                pathname === '/' ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Home
            </Link>
            <Link
              href="/blogs"
              className={`text-sm font-medium transition-colors hover:text-sky-600 dark:hover:text-sky-400 ${
                pathname === '/blogs' ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Blogs
            </Link>

            {loading ? (
              <div className="w-16 h-8 bg-slate-100 dark:bg-slate-800 animate-pulse rounded"></div>
            ) : admin && isAdminRoute ? (
              /* Admin Navigation */
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-1 rounded font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Admin ({admin.username})
                </span>
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1"
                >
                  <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                </Link>
                <button
                  onClick={handleAdminLogout}
                  className="text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : user ? (
              /* Authenticated User Navigation */
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/blogs/create"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" /> Create Blog
                </Link>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 ${
                    pathname === '/dashboard' ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium transition-colors hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 ${
                    pathname === '/profile' ? 'text-sky-600 dark:text-sky-400 font-semibold' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <UserIcon className="w-4 h-4" /> Profile ({user.username})
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              /* Guest Navigation */
              <div className="flex items-center space-x-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 px-3 py-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 px-4 py-1.5 rounded-md transition shadow-sm"
                >
                  Register
                </Link>
                <Link
                  href="/admin/login"
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800"
                  title="Admin Portal"
                >
                  <Shield className="w-3 h-3" /> Admin
                </Link>
              </div>
            )}

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none ml-2"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark / Light Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
          </nav>

          {/* Mobile Menu Button & Dark Mode Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
              aria-label="Toggle Dark / Light Mode"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 pt-2 pb-4 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 dark:text-slate-200 font-medium py-1 hover:text-sky-600 dark:hover:text-sky-400"
          >
            Home
          </Link>
          <Link
            href="/blogs"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-slate-700 dark:text-slate-200 font-medium py-1 hover:text-sky-600 dark:hover:text-sky-400"
          >
            Blogs
          </Link>

          {admin ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-1 rounded font-semibold inline-block">
                Admin: {admin.username}
              </span>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 dark:text-slate-200 font-medium py-1 hover:text-sky-600 dark:hover:text-sky-400"
              >
                Admin Dashboard
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleAdminLogout();
                }}
                className="block w-full text-left text-rose-600 dark:text-rose-400 font-medium py-1"
              >
                Logout Admin
              </button>
            </div>
          ) : user ? (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                href="/blogs/create"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center font-semibold text-white bg-sky-600 py-2 rounded-md"
              >
                Create Blog
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 dark:text-slate-200 font-medium py-1 hover:text-sky-600 dark:hover:text-sky-400"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 dark:text-slate-200 font-medium py-1 hover:text-sky-600 dark:hover:text-sky-400"
              >
                Profile ({user.username})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left text-rose-600 dark:text-rose-400 font-medium py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-700 dark:text-slate-200 font-medium py-1 hover:text-sky-600 dark:hover:text-sky-400"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center text-white bg-sky-600 py-2 rounded-md font-medium"
              >
                Register
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xs text-slate-500 dark:text-slate-400 py-1"
              >
                Admin Portal
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
