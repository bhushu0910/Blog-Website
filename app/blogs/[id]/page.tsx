import { notFound } from 'next/navigation';
import Link from 'next/link';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { Blog } from '@/lib/types';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';

interface BlogPageProps {
  params: {
    id: string;
  };
}

async function getBlogById(id: string): Promise<Blog | null> {
  try {
    const blogId = parseInt(id, 10);
    if (isNaN(blogId)) return null;

    const [blogs] = await pool.query<RowDataPacket[]>(
      `SELECT b.id, b.user_id, b.title, b.description, b.status, b.created_at, b.updated_at,
              u.name as author_name, u.username as author_username
       FROM blogs b
       JOIN users u ON b.user_id = u.id
       WHERE b.id = ?`,
      [blogId]
    );

    if (blogs.length === 0) return null;
    return blogs[0] as Blog;
  } catch (e) {
    return null;
  }
}

export const revalidate = 0;

export default async function SingleBlogPage({ params }: BlogPageProps) {
  const blog = await getBlogById(params.id);

  if (!blog) {
    notFound();
  }

  const createdDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const updatedDate = new Date(blog.updated_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isUpdated = new Date(blog.updated_at).getTime() - new Date(blog.created_at).getTime() > 60000;

  return (
    <div className="max-w-4xl mx-auto my-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <Link
        href="/blogs"
        className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Blogs
      </Link>

      <article className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-8 sm:p-12 space-y-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200 bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full">
              <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              {blog.author_name} (@{blog.author_username})
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Published {createdDate}
            </span>
            {isUpdated && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                <Clock className="w-3 h-3" /> Updated {updatedDate}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            {blog.title}
          </h1>
        </div>

        {/* Content Body */}
        <div className="p-8 sm:p-12 bg-white dark:bg-slate-900 prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal">
          {blog.description}
        </div>

        {/* Author Footer Card */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-6 sm:p-8 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
            {blog.author_name ? blog.author_name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">{blog.author_name}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Registered Author on Blog Platform</p>
          </div>
        </div>
      </article>
    </div>
  );
}
