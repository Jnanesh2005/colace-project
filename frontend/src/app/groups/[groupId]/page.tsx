'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import AddMemberModal from '@/components/AddMemberModal';
import CommentSection from '@/components/CommentSection';

// --- Define data structures ---
interface Post {
  id: number;
  content: string;
  author_username: string;
  created_at: string;
  comments: any[];
}
interface GroupDetail {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
  is_member: boolean;
  owner_username: string;
}
interface CurrentUser {
  username: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGroupData = async () => {
    if (!groupId) return;
    try {
      // Fetch all necessary data in parallel
      const [groupRes, userRes, postsRes] = await Promise.all([
        api.get(`/groups/${groupId}/`),
        api.get('/auth/users/me/'),
        api.get(`/posts/?group=${groupId}`),
      ]);
      setGroup(groupRes.data);
      setCurrentUser(userRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error('Failed to fetch group data:', err);
      setError('Group not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const handleToggleMembership = async () => {
    if (!group) return;
    try {
      const response = await api.post(`/groups/${group.id}/toggle_membership/`);
      setGroup(prev => prev ? { ...prev, is_member: response.data.is_member, member_count: response.data.is_member ? prev.member_count + 1 : prev.member_count - 1 } : null);
    } catch (err) {
      console.error('Failed to update membership:', err);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      await api.post('/posts/', { content: newPostContent, group: groupId });
      setNewPostContent('');
      fetchGroupData(); // Refresh all data to show the new post
    } catch (err) {
      console.error('Failed to create post in group:', err);
    }
  };
  
  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${postId}/`);
        fetchGroupData(); // Refresh group data to remove the post
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('You can only delete your own posts.');
      }
    }
  };

  if (loading) return <p className="text-white text-center mt-10">Loading group...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!group) return null;

  const isOwner = currentUser?.username === group.owner_username;
  const isMember = group.is_member;

  return (
    <>
      <main className="min-h-screen text-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Group Header */}
          <header className="mb-8">
            <Link href="/groups" className="text-blue-400 hover:underline mb-4 block">&larr; Back to All Groups</Link>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-4xl font-bold">{group.name}</h1>
                  <p className="text-gray-400 mt-2">{group.description || 'No description provided.'}</p>
                  <p className="text-gray-500 text-sm mt-4">{group.member_count} members</p>
                </div>
                <div className="flex space-x-2">
                  {isOwner && (
                    <button onClick={() => setIsAddMemberModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                      Add Members
                    </button>
                  )}
                  <button onClick={handleToggleMembership} className={`${group.is_member ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-2 px-4 rounded`}>
                    {group.is_member ? 'Leave Group' : 'Join Group'}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Group Feed Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Group Feed</h2>
            {isMember && (
              <div className="bg-gray-800 p-4 rounded-lg mb-8">
                <form onSubmit={handlePostSubmit}>
                  <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder={`Share something with the group...`} className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none" rows={3} />
                  <button type="submit" className="w-full mt-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
                    Post to Group
                  </button>
                </form>
              </div>
            )}
            <div className="space-y-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <div key={`${post.id}-${post.comments.length}`} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/profile/${post.author_username}`} className="font-bold text-blue-400 hover:underline">{post.author_username}</Link>
                        <span className="text-gray-500 text-sm ml-2">{new Date(post.created_at).toLocaleString()}</span>
                      </div>
                      {currentUser?.username === post.author_username && (
                        <button onClick={() => handleDeletePost(post.id)} className="text-gray-500 hover:text-red-500 text-sm font-semibold">
                          Delete
                        </button>
                      )}
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap mt-2">{post.content}</p>
                    <CommentSection postId={post.id} initialComments={post.comments} onCommentAdded={fetchGroupData} />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No posts in this group yet. Be the first!</p>
              )}
            </div>
          </section>
        </div>
      </main>
      
      {isOwner && (
        <AddMemberModal isOpen={isAddMemberModalOpen} onClose={() => setIsAddMemberModalOpen(false)} groupId={group.id} onMemberAdded={fetchGroupData} />
      )}
    </>
  );
}