'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number;
  onMemberAdded: () => void;
}

interface UserSearchResult {
  id: number;
  username: string;
}

export default function AddMemberModal({ isOpen, onClose, groupId, onMemberAdded }: AddMemberModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [addedMembers, setAddedMembers] = useState<number[]>([]);

  // Search for users as the owner types
  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      api.get(`/users/?search=${query}`).then(res => setResults(res.data));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAddMember = async (username: string, userId: number) => {
    try {
      await api.post(`/groups/${groupId}/add_member/`, { username });
      setAddedMembers(prev => [...prev, userId]); // Mark user as added
      onMemberAdded(); // Refresh the parent component's data
    } catch (error) {
      console.error('Failed to add member:', error);
      alert('Failed to add member. They may already be in the group.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add Members</h2>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users to add..."
          className="w-full p-2 bg-gray-700 rounded-md text-white mb-4"
        />
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {results.map(user => (
            <div key={user.id} className="flex justify-between items-center p-2 bg-gray-700 rounded">
              <span className="text-white">{user.username}</span>
              <button
                onClick={() => handleAddMember(user.username, user.id)}
                disabled={addedMembers.includes(user.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {addedMembers.includes(user.id) ? 'Added' : 'Add'}
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full">
          Done
        </button>
      </div>
    </div>
  );
}