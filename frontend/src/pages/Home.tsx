import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../types';
import { api } from '../api/endpoints';
import { BlogCard } from '../components/blog/BlogCard';

interface HomeProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  newBlogCreated?: Blog | null;
  searchQuery: string;
}

export const Home: React.FC<HomeProps> = ({ onNotify, newBlogCreated, searchQuery }) => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBlogs = async () => {
    try {
      const data = await api.blogs.list();
      setBlogs(data);
    } catch (err: any) {
      onNotify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  useEffect(() => {
    if (newBlogCreated) {
      setBlogs((prev) => [newBlogCreated, ...prev]);
    }
  }, [newBlogCreated]);

  const handleDelete = (id: number) => {
    setBlogs((prev) => prev.filter((b) => b.id !== id));
  };

  const filteredBlogs: Blog[] = blogs.filter((blog: Blog) => {
    return (
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const featuredBlog: Blog | null = blogs.length > 0 ? blogs[0] : null;
  const remainingBlogs: Blog[] = filteredBlogs.filter(
    (b: Blog) => b.id !== featuredBlog?.id || !!searchQuery
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* DEV Community Style Banner */}
      <section className="mb-10 rounded-xl border border-stone-200/90 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900 sm:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              <span>⚡</span>
              <span>DEVSPACE COMMUNITY</span>
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl">
              Where developers share, stay up-to-date, and build in public.
            </h1>
            <p className="mt-3 font-serif text-base text-stone-600 dark:text-stone-400">
              An open platform for sharing architectural patterns, backend code, cloud infrastructure, and technical devlogs.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end font-mono text-xs text-stone-500 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-stone-800 dark:text-stone-200">CLUSTER ONLINE</span>
            </div>
            <span>{blogs.length} {blogs.length === 1 ? 'article' : 'articles'} published</span>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {loading ? (
        <div className="py-24 text-center font-mono text-xs text-stone-400">
          Loading posts from DEVSPACE network...
        </div>
      ) : blogs.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-16 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 font-mono text-2xl text-indigo-600 dark:bg-stone-800 dark:text-indigo-400">
            💻
          </div>
          <h3 className="mt-4 text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Welcome to DEVSPACE!
          </h3>
          <p className="mx-auto mt-2 max-w-md font-serif text-sm text-stone-500 dark:text-stone-400">
            No posts published yet. Be the first developer to share an article, tutorial, or devlog on the network!
          </p>
        </div>
      ) : (
        /* Populated Feed */
        <div className="space-y-10">
          {/* Top Featured Story */}
          {featuredBlog && !searchQuery && (
            <div className="rounded-xl border border-stone-200/90 bg-white p-8 shadow-sm transition-all hover:border-stone-400 dark:border-stone-800 dark:bg-stone-900 sm:p-10">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <span>🔥 Top Story</span>
              </div>

              <Link to={`/blog/${featuredBlog.id}`} className="mt-3 block group">
                <h2 className="text-2xl font-black tracking-tight text-stone-900 group-hover:text-indigo-600 dark:text-stone-100 dark:group-hover:text-indigo-400 transition-colors sm:text-4xl">
                  {featuredBlog.title}
                </h2>
                <p className="mt-3 line-clamp-3 font-serif text-base leading-relaxed text-stone-600 dark:text-stone-400">
                  {featuredBlog.content.replace(/#+\s+/g, '')}
                </p>
              </Link>

              <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-5 font-mono text-xs text-stone-500 dark:border-stone-800">
                <div className="flex items-center space-x-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-[10px] font-bold dark:bg-white dark:text-black">
                    #{featuredBlog.author_id}
                  </div>
                  <span>Author #{featuredBlog.author_id}</span>
                </div>

                <div className="flex items-center space-x-4">
                  <span>▲ {featuredBlog.likes_count} Reactions</span>
                  <span>💬 {featuredBlog.comments_count} Comments</span>
                  <Link
                    to={`/blog/${featuredBlog.id}`}
                    className="rounded-md bg-stone-900 px-4 py-1.5 font-bold text-white hover:bg-black dark:bg-white dark:text-black"
                  >
                    Read Post →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Feed Grid */}
          <div>
            <div className="mb-6 flex items-center justify-between border-b border-stone-200/80 pb-3 dark:border-stone-800">
              <h3 className="font-mono text-xs uppercase tracking-widest text-stone-400 font-bold">
                {searchQuery ? `Search Results (${filteredBlogs.length})` : `Recent Posts (${blogs.length})`}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(searchQuery ? filteredBlogs : remainingBlogs).map((blog: Blog) => (
                <BlogCard
                  key={blog.id}
                  blog={blog}
                  onDelete={handleDelete}
                  onNotify={onNotify}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
