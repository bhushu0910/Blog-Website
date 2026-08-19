'use client';

import { useState, useEffect, useCallback } from 'react';
import BlogCard from '@/components/BlogCard';
import Pagination from '@/components/Pagination';
import { Blog } from '@/lib/types';
import { Search, BookOpen, Filter } from 'lucide-react';

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBlogs, setTotalBlogs] = useState(0);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/blogs?page=${currentPage}&limit=6&search=${encodeURIComponent(search)}`
      );
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.blogs || []);
        setTotalPages(data.pagination.totalPages);
        setTotalBlogs(data.pagination.total);
      }
    } catch (e) {
      console.error('Error fetching blogs listing:', e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBlogs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header & Search */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold mb-1">
              <BookOpen className="w-5 h-5" />
              <span>COMMUNITY POSTS</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Explore Published Blogs</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Discover stories, tutorials, and technical articles written by developers.
            </p>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
            Showing {totalBlogs} {totalBlogs === 1 ? 'post' : 'posts'}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs by title or content keywords..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-900 dark:text-white text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm transition shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading blog posts...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <Filter className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">No blogs found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {search ? `No articles matching "${search}". Try searching for something else.` : 'No blogs have been published yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </>
      )}
    </div>
  );
}
