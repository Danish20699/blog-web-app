import React, { useState } from 'react';
import { api } from '../../api/endpoints';
import { Blog } from '../../types';

interface PostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newBlog: Blog) => void;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const PostEditorModal: React.FC<PostEditorModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  onNotify,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      onNotify('Headline and article content are required.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await api.blogs.create({ title, content });
      onCreated({ ...created, likes_count: 0, comments_count: 0 });
      onNotify('Dispatch published to network!', 'success');
      setTitle('');
      setContent('');
      onClose();
    } catch (err: any) {
      onNotify(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-8 shadow-2xl dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 dark:border-stone-800">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-widest text-amber-700 dark:text-amber-500 font-bold">
              Dispatch Composer
            </h2>
            <p className="text-sm text-stone-500">Draft a technical essay or architectural analysis.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          >
            [ESC]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <input
              type="text"
              placeholder="Headline: e.g. Scaling Kafka Partitions Under Heavy Load..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b border-stone-200 bg-transparent py-2 text-2xl font-bold tracking-tight text-stone-900 placeholder-stone-300 focus:border-stone-900 focus:outline-none dark:border-stone-700 dark:text-stone-100 dark:placeholder-stone-600"
              autoFocus
            />
          </div>

          <div>
            <textarea
              rows={9}
              placeholder="Write your article... Supports markdown headings (###), code blocks (```python), and bullet points."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full resize-none border-b border-stone-200 bg-transparent py-2 font-serif text-base leading-relaxed text-stone-800 placeholder-stone-300 focus:border-stone-900 focus:outline-none dark:border-stone-700 dark:text-stone-200 dark:placeholder-stone-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2 font-mono text-xs text-stone-400">
            <span>{words} words • ~{Math.max(1, Math.round(words / 180))} min read</span>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="rounded-full bg-stone-900 px-6 py-2 font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-stone-800 disabled:opacity-40 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
