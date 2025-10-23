'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import CreateGroupModal from '@/components/CreateGroupModal'; // Import the new modal

// Define the structure of a Group object
interface Group {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const response = await api.get('/groups/');
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <> {/* Use a fragment to return multiple top-level elements */}
      <main className="min-h-screen text-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Groups</h1>
            {/* This button now opens the modal */}
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Create Group
            </button>
          </div>

          {/* Groups List (no changes here) */}
          {loading ? (
            <p className="text-gray-400">Loading groups...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.length > 0 ? (
                groups.map(group => (
                  <Link key={group.id} href={`/groups/${group.id}`}>
                    <div className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors h-full">
                      <h3 className="font-bold text-lg text-blue-400">{group.name}</h3>
                      <p className="text-gray-400 text-sm mt-2 flex-grow">{group.description || 'No description.'}</p>
                      <p className="text-gray-500 text-xs mt-4">{group.member_count} members</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 col-span-full text-center">No groups have been created yet.</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Render the modal component */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={fetchGroups} // Pass the fetch function to refresh the list
      />
    </>
  );
}