import React, { useState } from 'react';
import { api } from '../../api/endpoints';
import { Comment } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CommentBoxProps {
  blogId: number;
  onCommentAdded: (newComment: Comment) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const CommentBox: React.FC<CommentBoxProps> = ({ blogId, onCommentAdded, onNotify }) => {
  const { isAuthenticated } = useAuth();
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="border border-stone-200 bg-stone-100 p-4 font-mono text-xs text-stone-500 dark:border-stone-800 dark:bg-stone-900">
        Sign in above to join the discussion and post a response.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const created = await api.blogs.addComment(blogId, { text });
      onCommentAdded(created);
      setText('');
      onNotify('Comment posted', 'success');
    } catch (err: any) {
      onNotify(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        rows={3}
        placeholder="Contribute your perspective..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full border border-stone-300 bg-transparent p-3 text-sm font-serif text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:outline-none dark:border-stone-700 dark:text-stone-100"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="bg-stone-900 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-stone-100 hover:bg-stone-800 disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900"
        >
          {submitting ? 'Submitting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
};
