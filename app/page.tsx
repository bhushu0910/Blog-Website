import Link from 'next/link';
import BlogCard from '@/components/BlogCard';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { ArrowRight, PenSquare, Sparkles } from 'lucide-react';
import { Blog } from '@/lib/types';

async function getRecentBlogs(): Promise<Blog[]> {
  try {
    const [blogs] = await pool.query<RowDataPacket[]>(
      `SELECT b.id, b.user_id, b.title, b.description, b.status, b.created_at, b.updated_at,
              u.name as author_name, u.username as author_username
       FROM blogs b
       JOIN users u ON b.user_id = u.id
       WHERE b.status = 'published'
       ORDER BY b.created_at DESC
       LIMIT 6`
    );
    return blogs as Blog[];
  } catch (error) {
    console.error('Error fetching home recent blogs:', error);
    return [];
  }
}

export const revalidate = 0;

export default async function HomePage() {
  const recentBlogs = await getRecentBlogs();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 py-16 sm:py-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-semibold rounded-full">
            <Sparkles className="w-4 h-4" /> Welcome to Blog Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto">
            Share Your Thoughts, Code &amp; Stories With The World
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            A modern, performant blogging platform built for developers, writers, and creators. Write posts, engage your audience, and manage your content effortlessly.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/blogs"
              className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg shadow-sm transition"
            >
              Browse All Blogs
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold rounded-lg shadow-md transition flex items-center gap-2"
            >
              <PenSquare className="w-4 h-4" /> Login to Write
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Published Blogs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Recently Published Posts</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Explore the latest blogs written by our community creators.</p>
          </div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
          >
            View All Blogs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentBlogs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <p className="text-slate-500 dark:text-slate-400 text-lg">No blogs published yet.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500">Be the first writer to publish a blog post!</p>
            <Link
              href="/register"
              className="inline-block px-4 py-2 bg-sky-600 text-white font-semibold rounded-md shadow hover:bg-sky-700 transition text-sm"
            >
              Create Account &amp; Write
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
