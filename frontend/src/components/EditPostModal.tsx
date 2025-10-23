'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: { id: number; content: string };
  onPostUpdated: () => void;
}

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }: EditPostModalProps) {
  const [content, setContent] = useState(post.content);

  // This useEffect ensures the content in the modal updates if the user
  // opens the edit modal for a different post.
  useEffect(() => {
    setContent(post.content);
  }, [post]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Use a PATCH request to update only the content field
      await api.patch(`/posts/${post.id}/`, { content });
      onPostUpdated(); // Refresh the feed
      onClose(); // Close the modal
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
            required
          />
          <div className="flex justify-end space-x-4 mt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}