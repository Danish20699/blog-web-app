import React from 'react';
import { Comment } from '../../types';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
}

export const CommentList: React.FC<CommentListProps> = ({ comments, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-6 font-mono text-xs text-stone-400">Loading replies...</div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="py-6 font-mono text-xs text-stone-400">
        No replies yet. Be the first to share your thoughts.
      </div>
    );
  }

  return (
    <div className="divide-y divide-stone-200 dark:divide-stone-800">
      {comments.map((comment) => (
        <div key={comment.id} className="py-4">
          <div className="flex items-center space-x-2 font-mono text-xs text-stone-500">
            <span>USER #{comment.commenter_id}</span>
          </div>
          <p className="mt-1 font-serif text-sm leading-relaxed text-stone-800 dark:text-stone-300">
            {comment.text}
          </p>
        </div>
      ))}
    </div>
  );
};
