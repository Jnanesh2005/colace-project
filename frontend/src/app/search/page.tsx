'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

// Define the structure of a user in the search results
interface UserSearchResult {
  id: number;
  username: string;
  bio: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // This useEffect hook will run whenever the search query changes
  useEffect(() => {
    // Don't search if the query is empty
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    setLoading(true);

    // Set a timer to "debounce" the search input.
    // This waits for the user to stop typing for 300ms before making an API call.
    const timer = setTimeout(() => {
      api.get(`/users/?search=${query}`)
        .then(response => {
          setResults(response.data);
        })
        .catch(error => {
          console.error("Failed to fetch search results:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    // Cleanup function to cancel the timer if the user types again quickly
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <main className="min-h-screen text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search for Users</h1>

        {/* Search Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username..."
          className="w-full p-3 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Search Results */}
        <div className="mt-6 space-y-4">
          {loading && <p className="text-gray-400">Searching...</p>}
          
          {!loading && results.length > 0 && (
            results.map(user => (
              <Link key={user.id} href={`/profile/${user.username}`}>
                <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors">
                  <h3 className="font-bold text-lg text-blue-400">{user.username}</h3>
                  <p className="text-gray-400 text-sm">{user.bio || 'No bio.'}</p>
                </div>
              </Link>
            ))
          )}

          {!loading && results.length === 0 && query.length > 0 && (
            <p className="text-gray-500">No users found.</p>
          )}
        </div>
      </div>
    </main>
  );
}