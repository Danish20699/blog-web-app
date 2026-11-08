import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Blog } from '../../types';
import { api } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';

interface BlogCardProps {
  blog: Blog;
  onDelete?: (id: number) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onDelete, onNotify }) => {
  const { user, isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(blog.likes_count);
  const [hasLiked, setHasLiked] = useState(false);
  const isAuthor = user?.id === blog.author_id;

  const words = blog.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.round(words / 180));

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onNotify('Please sign in to like this story.', 'info');
      return;
    }
    try {
      const res = await api.blogs.toggleLike(blog.id);
      setHasLiked(res.liked);
      setLikes((prev) => (res.liked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err: any) {
      onNotify(err.message, 'error');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm('Delete this story permanently?')) return;
    try {
      await api.blogs.delete(blog.id);
      onDelete?.(blog.id);
      onNotify('Story deleted successfully.', 'success');
    } catch (err: any) {
      onNotify(err.message, 'error');
    }
  };

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-stone-400 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-stone-700">
      <div>
        {/* Header Metadata */}
        <div className="flex items-center justify-between font-mono text-[11px] text-stone-400">
          <span>{readTime} min read</span>

          {isAuthor && (
            <button
              onClick={handleDelete}
              className="text-stone-400 hover:text-red-600 transition-colors"
            >
              [Delete]
            </button>
          )}
        </div>

        {/* Title & Excerpt */}
        <Link to={`/blog/${blog.id}`} className="mt-3 block">
          <h2 className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-amber-700 dark:text-stone-100 dark:group-hover:text-amber-400 transition-colors">
            {blog.title}
          </h2>
          <p className="mt-2.5 line-clamp-3 font-serif text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {blog.content.replace(/#+\s+/g, '')}
          </p>
        </Link>
      </div>

      {/* Footer Author & Engagement */}
      <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 font-mono text-xs dark:border-stone-800/80">
        <div className="flex items-center space-x-2 text-stone-600 dark:text-stone-400">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-900 dark:bg-stone-800 dark:text-stone-300">
            #{blog.author_id}
          </div>
          <span className="text-[11px]">Author #{blog.author_id}</span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 rounded-full px-2.5 py-1 transition-all ${
              hasLiked
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700'
            }`}
          >
            <span>▲</span>
            <span>{likes}</span>
          </button>

          <Link
            to={`/blog/${blog.id}`}
            className="flex items-center space-x-1 rounded-full bg-stone-100 px-2.5 py-1 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            <span>💬</span>
            <span>{blog.comments_count}</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
