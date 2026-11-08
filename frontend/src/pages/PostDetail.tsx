import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Blog, Comment } from '../types';
import { api } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { CommentBox } from '../components/blog/CommentBox';
import { CommentList } from '../components/blog/CommentList';

interface PostDetailProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const PostDetail: React.FC<PostDetailProps> = ({ onNotify }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  const blogId = Number(id);

  useEffect(() => {
    if (!blogId) return;

    const fetchPost = async () => {
      try {
        const post = await api.blogs.get(blogId);
        setBlog(post);
        setLikes(post.likes_count);
      } catch (err: any) {
        onNotify(err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const list = await api.blogs.listComments(blogId);
        setComments(list);
      } catch (err: any) {
        onNotify(err.message, 'error');
      } finally {
        setLoadingComments(false);
      }
    };

    fetchPost();
    fetchComments();
  }, [blogId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      onNotify('Please sign in to react to this post.', 'info');
      return;
    }
    try {
      const res = await api.blogs.toggleLike(blogId);
      setHasLiked(res.liked);
      setLikes((prev) => (res.liked ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err: any) {
      onNotify(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.blogs.delete(blogId);
      onNotify('Post deleted successfully.', 'success');
      navigate('/');
    } catch (err: any) {
      onNotify(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center font-mono text-xs text-stone-400">
        Loading post...
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="py-32 text-center">
        <p className="font-mono text-sm text-stone-500">Post not found.</p>
        <Link to="/" className="mt-4 inline-block font-mono text-xs text-indigo-600 underline dark:text-indigo-400">
          ← Return to DEVSPACE feed
        </Link>
      </div>
    );
  }

  const isAuthor = user?.id === blog.author_id;
  const words = blog.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.round(words / 180));

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Navigation & Controls */}
      <div className="mb-6 flex items-center justify-between font-mono text-xs text-stone-500">
        <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">
          ← Back to DEVSPACE feed
        </Link>

        <div className="flex items-center space-x-4">
          <span>{readTime} min read</span>
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="text-stone-400 hover:text-red-600 transition-colors"
            >
              [Delete Post]
            </button>
          )}
        </div>
      </div>

      {/* Headline */}
      <h1 className="text-3xl font-black tracking-tight text-stone-900 dark:text-stone-100 sm:text-5xl leading-tight">
        {blog.title}
      </h1>

      {/* Author Byline */}
      <div className="mt-6 flex items-center space-x-3 border-y border-stone-200 py-4 dark:border-stone-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black font-mono text-sm font-bold text-white dark:bg-white dark:text-black">
          #{blog.author_id}
        </div>
        <div>
          <div className="font-mono text-xs font-bold text-stone-900 dark:text-stone-100">
            Developer #{blog.author_id}
          </div>
          <div className="text-[11px] text-stone-400 font-mono">
            Published on DEVSPACE Community
          </div>
        </div>
      </div>

      {/* Article Body */}
      <div className="mt-8 font-serif text-lg leading-relaxed text-stone-800 dark:text-stone-200 whitespace-pre-wrap">
        {blog.content}
      </div>

      {/* Reactions Bar */}
      <div className="mt-12 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-4 font-mono text-xs text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1.5 rounded-md px-3 py-1.5 transition-all ${
              hasLiked
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-white text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
            }`}
          >
            <span>▲</span>
            <span>{likes} Reactions</span>
          </button>
          <span>💬 {comments.length} Comments</span>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            onNotify('Post link copied to clipboard!', 'info');
          }}
          className="text-stone-500 hover:text-black dark:hover:text-white"
        >
          [Share Link]
        </button>
      </div>

      {/* Comments Section */}
      <section className="mt-14 border-t border-stone-200 pt-8 dark:border-stone-800">
        <h3 className="font-mono text-xs uppercase tracking-widest text-stone-500 font-bold">
          Discussion ({comments.length})
        </h3>

        <div className="mt-5">
          <CommentBox
            blogId={blogId}
            onCommentAdded={(newC) => setComments((prev) => [newC, ...prev])}
            onNotify={onNotify}
          />
        </div>

        <div className="mt-8">
          <CommentList comments={comments} isLoading={loadingComments} />
        </div>
      </section>
    </article>
  );
};
