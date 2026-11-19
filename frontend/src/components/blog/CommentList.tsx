import React from 'react';
import { Comment } from '../../types';

interface CommentListProps {
  comments: Comment[];
  isLoading: boolean;
  currentUserId?: number | null;
  onDeleteComment?: (commentId: number) => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  isLoading,
  currentUserId,
  onDeleteComment,
}) => {
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
      {comments.map((comment) => {
        const isCommentOwner = currentUserId && comment.commenter_id === currentUserId;
        const displayName = comment.commenter_name || `USER #${comment.commenter_id}`;

        return (
          <div key={comment.id} className="py-4">
            <div className="flex items-center justify-between font-mono text-xs text-stone-500">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-stone-800 dark:text-stone-200">{displayName}</span>
                <span className="text-stone-400">· #{comment.commenter_id}</span>
              </div>
              {isCommentOwner && onDeleteComment && (
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="text-stone-400 hover:text-red-500 transition-colors"
                  title="Delete comment"
                >
                  [Delete]
                </button>
              )}
            </div>
            <p className="mt-1 font-serif text-sm leading-relaxed text-stone-800 dark:text-stone-300">
              {comment.text}
            </p>
          </div>
        );
      })}
    </div>
  );
};
