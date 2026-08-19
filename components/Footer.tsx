import Link from 'next/link';
import { BookOpen, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 mt-auto border-t border-slate-800 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-semibold text-lg">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <span>Blog</span>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/blogs" className="hover:text-white transition">Blogs</Link>
            <Link href="/register" className="hover:text-white transition">Register</Link>
            <Link href="/login" className="hover:text-white transition">Login</Link>
            <Link href="/admin/login" className="hover:text-white transition text-xs text-slate-500">Admin</Link>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Built by <strong className="text-white font-semibold">Bhushan</strong></span>
            <a
              href="https://github.com/bhushu0910"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-full text-xs font-medium transition border border-slate-700"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
