'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { AxiosError } from 'axios'; // Import AxiosError

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Group name is required.');
      return;
    }
    setLoading(true); // Set loading true

    try {
      await api.post('/groups/', { name, description });
      onGroupCreated();
      onClose();
      setName('');
      setDescription('');
    } catch (err: unknown) { // Use unknown
      console.error('Failed to create group:', err);
      // Type guard for AxiosError
      if (err instanceof AxiosError && err.response?.data?.name) {
        setError('A group with this name already exists.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
        setLoading(false); // Set loading false
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Create a New Group</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-400 mb-2">Group Name</label>
            <input
              id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-400 mb-2">Description (Optional)</label>
            <textarea
              id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500">
              {loading ? 'Creating...' : 'Create'} {/* Added loading text */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}