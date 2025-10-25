'use client';

import { useState } from 'react';
import api from '@/lib/api';
// Import type
import type { Comment } from '@/types'; // Use the shared type
import Link from 'next/link'; // Import Link

// Define the props the component will receive
interface CommentSectionProps {
  postId: number;
  initialComments: Comment[];
  onCommentAdded: () => void; // A function to refresh the feed/parent data
  canComment?: boolean; // Optional: Control if comment form is shown/enabled
}

export default function CommentSection({
    postId,
    initialComments,
    onCommentAdded,
    canComment = true // Default to true if not provided
}: CommentSectionProps) {
  // Removed internal 'comments' state as parent re-fetches and passes new 'initialComments'
  // const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return; // Prevent empty or double submission

    setIsSubmitting(true);
    try {
      // Post the new comment to the correct nested endpoint
      await api.post(`/posts/${postId}/comments/`, {
        content: newComment,
      });
      setNewComment(''); // Clear the input
      onCommentAdded(); // Tell the parent component to refresh data
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('Failed to post comment. Please try again.'); // User feedback
    } finally {
      setIsSubmitting(false); // Re-enable form
    }
  };

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      {/* List of existing comments */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2"> {/* Optional: Limit height and add scroll */}
        {initialComments.length === 0 && (
            <p className="text-gray-500 text-sm">No comments yet.</p>
        )}
        {/* Use initialComments directly */}
        {initialComments.map((comment) => (
          <div key={comment.id} className="text-sm">
            <p>
              <Link href={`/profile/${comment.author_username}`}>
                <span className="font-bold text-blue-400 hover:underline cursor-pointer">{comment.author_username}</span>
              </Link>
              <span className="text-gray-400 ml-2">{comment.content}</span>
               {/* Optional: Add timestamp */}
               {/* <span className="text-gray-500 text-xs ml-2">{new Date(comment.created_at).toLocaleTimeString()}</span> */}
            </p>
          </div>
        ))}
      </div>

      {/* Form to add a new comment (conditionally rendered/enabled) */}
      {canComment && (
        <form onSubmit={handleSubmit} className="flex space-x-2 items-center">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            disabled={isSubmitting} // Disable while submitting
            className="flex-grow bg-gray-700 rounded-md p-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-600"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()} // Disable if submitting or empty
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors disabled:bg-gray-500"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      )}
    </div>
  );
}