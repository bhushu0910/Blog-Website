import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Blog } from '@/lib/types';

interface BlogCardProps {
  blog: Blog;
  showActions?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function BlogCard({ blog, showActions = false, onEdit, onDelete }: BlogCardProps) {
  const formattedDate = new Date(blog.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const excerpt =
    blog.description.length > 140
      ? blog.description.substring(0, 140) + '...'
      : blog.description;

  return (
    <article className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition border border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
            <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            {blog.author_name || 'Anonymous Author'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            {formattedDate}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 hover:text-sky-600 dark:hover:text-sky-400 transition">
          <Link href={`/blogs/${blog.id}`}>{blog.title}</Link>
        </h3>

        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {excerpt}
        </p>
      </div>

      <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-slate-50 dark:border-slate-800/80 mt-auto">
        <Link
          href={`/blogs/${blog.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 group pt-3"
        >
          Read More
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        {showActions && (
          <div className="flex items-center gap-2 pt-3">
            {onEdit && (
              <button
                onClick={() => onEdit(blog.id)}
                className="text-xs font-semibold px-2.5 py-1 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 rounded border border-amber-200 dark:border-amber-800 transition"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(blog.id)}
                className="text-xs font-semibold px-2.5 py-1 text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 rounded border border-rose-200 dark:border-rose-800 transition"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
