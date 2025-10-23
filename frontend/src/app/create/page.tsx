'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// Define the structure for a group in the dropdown
interface UserGroup {
  id: number;
  name: string;
}

export default function CreatePostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [myGroups, setMyGroups] = useState<UserGroup[]>([]);
  const [selectedDestination, setSelectedDestination] = useState(''); // Will hold group ID or 'personal'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch the list of groups the user is a member of
  useEffect(() => {
    api.get('/my-groups/')
      .then(response => {
        setMyGroups(response.data);
      })
      .catch(err => {
        console.error("Failed to fetch user's groups:", err);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');

    // Prepare the data for the API call
    const postData: { content: string; group?: number } = {
      content: content,
    };

    if (selectedDestination && selectedDestination !== 'personal') {
      postData.group = parseInt(selectedDestination, 10);
    }

    try {
      await api.post('/posts/', postData);
      // On success, redirect to the appropriate page
      if (postData.group) {
        router.push(`/groups/${postData.group}`);
      } else {
        router.push('/home');
      }
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Could not create post. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create a New Post</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
          {/* Content Textarea */}
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-3 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={8}
              required
            />
          </div>

          {/* Destination Dropdown */}
          <div>
            <label htmlFor="destination" className="block text-gray-400 mb-2">Post to:</label>
            <select
              id="destination"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="personal">My Personal Feed</option>
              {myGroups.map(group => (
                <option key={group.id} value={group.id}>
                  Group: {group.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
          >
            {loading ? 'Posting...' : 'Create Post'}
          </button>
        </form>
      </div>
    </main>
  );
}