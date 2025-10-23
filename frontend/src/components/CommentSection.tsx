'use client';

import { useState } from 'react';
import api from '@/lib/api';

// Define the structure of a comment
interface Comment {
  id: number;
  content: string;
  author_username: string;
  created_at: string;
}

// Define the props the component will receive
interface CommentSectionProps {
  postId: number;
  initialComments: Comment[];
  onCommentAdded: () => void; // A function to refresh the feed
}

export default function CommentSection({ postId, initialComments, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Post the new comment to the correct nested endpoint
      await api.post(`/posts/${postId}/comments/`, {
        content: newComment,
      });
      setNewComment(''); // Clear the input
      onCommentAdded(); // Tell the parent component to refresh the feed
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      {/* List of existing comments */}
      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div key={comment.id} className="text-sm">
            <p>
              <span className="font-bold text-blue-400">{comment.author_username}</span>
              <span className="text-gray-400 ml-2">{comment.content}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Form to add a new comment */}
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow bg-gray-700 rounded-md p-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm"
        >
          Post
        </button>
      </form>
    </div>
  );
}