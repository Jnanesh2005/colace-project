'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import Link from 'next/link';
import api from '@/lib/api';
import AddMemberModal from '@/components/AddMemberModal';
import CommentSection from '@/components/CommentSection';
import { AxiosError } from 'axios';
// Import types
import type { Post, GroupDetail, CurrentUser } from '@/types';
import Image from 'next/image'; // Import Image

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter(); // Initialize router
  const groupId = params.groupId as string;

  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Use useCallback for fetch function
  const fetchGroupData = useCallback(async () => {
    if (!groupId) {
       setError("Group ID is missing.");
       setLoading(false);
       return;
    };
    setError(''); // Clear previous error
    // Don't reset loading to true here if you only want initial load state
    try {
      // Ensure user is authenticated before fetching potentially restricted data
       const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/'); // Redirect to login if not authenticated
            return; // Stop execution
        }

      const [groupRes, userRes, postsRes] = await Promise.all([
        api.get(`/groups/${groupId}/`),
        api.get('/auth/users/me/'),
        api.get(`/posts/?group=${groupId}`), // Fetch posts filtered by group ID
      ]);
      setGroup(groupRes.data);
      setCurrentUser(userRes.data);
      setPosts(postsRes.data);
    } catch (err: unknown) {
      console.error('Failed to fetch group data:', err);
      if (err instanceof AxiosError) {
           if (err.response?.status === 404) {
             setError('Group not found.');
           } else if (err.response?.status === 401 || err.response?.status === 403) {
             setError('You do not have permission to view this group or your session expired.');
             // Optionally redirect to login
             // localStorage.removeItem('access_token');
             // localStorage.removeItem('refresh_token');
             // router.push('/');
           } else {
             setError('Failed to load group data. Please try again later.');
           }
       } else {
            setError('An unexpected error occurred.');
       }
    } finally {
      // Ensure loading is set to false regardless of initial state
      setLoading(false);
    }
  // Add router to dependency array as it's used for redirect
  }, [groupId, router]);

  useEffect(() => {
    setLoading(true); // Set loading true when groupId changes or component mounts
    fetchGroupData();
  }, [fetchGroupData, groupId]); // Added groupId dependency

  const handleToggleMembership = async () => {
    if (!group || !currentUser) return; // Ensure group and user are loaded
    setLoading(true); // Indicate loading state during the action
    try {
      const response = await api.post(`/groups/${group.id}/toggle_membership/`);
      // Update state directly based on response for faster UI feedback
      setGroup(prev => prev ? {
            ...prev,
            is_member: response.data.is_member,
            member_count: response.data.is_member
                ? (prev.member_count || 0) + 1
                : (prev.member_count || 1) - 1
       } : null);
    } catch (err) {
      console.error('Failed to update membership:', err);
      alert('Failed to update membership. Please try again.'); // User feedback
    } finally {
        setLoading(false); // Action finished
    }
  };

  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setLoading(true); // Indicate loading
    try {
      await api.post('/posts/', { content: newPostContent, group: groupId });
      setNewPostContent('');
      fetchGroupData(); // Refresh all data to see the new post
    } catch (err) {
      console.error('Failed to create post in group:', err);
      alert('Failed to create post. Please try again.'); // User feedback
    } finally {
        setLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
      if (window.confirm('Are you sure you want to delete this post?')) {
          setLoading(true); // Indicate loading
          try {
              await api.delete(`/posts/${postId}/`);
              // Optimistically remove post from state for faster UI update
              setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
              // fetchGroupData(); // Optionally fetch all data again to be sure
          } catch (error) {
             console.error('Failed to delete post:', error);
             alert('Failed to delete post.');
           } finally {
               setLoading(false);
           }
      }
  };

  // --- Render Logic ---
  if (loading && !group) return <p className="text-white text-center mt-10">Loading group...</p>; // Show loading only initially
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!group) return <p className="text-gray-500 text-center mt-10">Group data could not be loaded.</p>; // Fallback if group is null after loading

  const isOwner = currentUser?.username === group.owner_username;
  const isMember = group.is_member;

  return (
    <>
      <main className="min-h-screen text-white p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <Link href="/groups" className="text-blue-400 hover:underline mb-4 block">&larr; Back to All Groups</Link>
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                {/* Group Info */}
                <div className="flex-grow">
                  <h1 className="text-3xl sm:text-4xl font-bold">{group.name}</h1>
                  <p className="text-gray-400 mt-2">{group.description || 'No description provided.'}</p>
                  <p className="text-gray-500 text-sm mt-4">
                    Owned by <Link href={`/profile/${group.owner_username}`} className="text-blue-400 hover:underline">{group.owner_username}</Link>
                     {' '}&bull; {group.member_count ?? 0} members
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                  {isOwner && (
                    <button onClick={() => setIsAddMemberModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors w-full">
                      Add Members
                    </button>
                  )}
                  <button
                    onClick={handleToggleMembership}
                    disabled={loading} // Disable while action is in progress
                    className={`font-bold py-2 px-4 rounded transition-colors w-full ${
                        group.is_member
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                     } text-white disabled:bg-gray-500`}
                  >
                    {group.is_member ? 'Leave Group' : 'Join Group'}
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Group Feed Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Group Feed</h2>
            {/* Create Post Form (only if member) */}
            {isMember && (
              <div className="bg-gray-800 p-4 rounded-lg mb-8 shadow-md">
                <form onSubmit={handlePostSubmit}>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder={`Share something with the group...`}
                    className="w-full p-2 bg-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled={loading} // Disable while posting
                   />
                  <button
                    type="submit"
                    disabled={loading || !newPostContent.trim()} // Disable while posting or if empty
                    className="w-full mt-2 px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500 transition-colors"
                  >
                    {loading ? 'Posting...' : 'Post to Group'}
                  </button>
                </form>
              </div>
            )}

             {!isMember && (
                 <p className="text-gray-500 text-center mb-8 bg-gray-800 p-4 rounded-lg">Join the group to post and comment.</p>
             )}


            {/* Posts List */}
            <div className="space-y-4">
               {posts.length === 0 && !loading && isMember && (
                 <p className="text-gray-500 text-center">No posts in this group yet. Be the first!</p>
               )}
              {posts.map((post) => (
                // Use post ID as key
                <div key={post.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                  <div className="flex justify-between items-start mb-2">
                     {/* Author Info */}
                     <div className="flex items-center space-x-3">
                         <div className="relative w-10 h-10 flex-shrink-0">
                             {post.author_profile_photo ? (
                                 <Image src={post.author_profile_photo} alt={post.author_username} layout="fill" className="rounded-full object-cover" />
                             ) : (
                                 <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-xl">
                                     {post.author_username.charAt(0).toUpperCase()}
                                 </div>
                             )}
                         </div>
                         <div>
                             <Link href={`/profile/${post.author_username}`} className="font-bold text-blue-400 hover:underline">{post.author_username}</Link>
                             <div className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</div>
                         </div>
                     </div>
                     {/* Delete Button */}
                    {(currentUser?.username === post.author_username || isOwner) && ( // Allow owner or author to delete
                      <div className="flex space-x-3 text-sm font-semibold">
                         {/* Edit button could go here if needed */}
                         <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                      </div>
                    )}
                  </div>
                   {/* Post Content */}
                  <p className="text-gray-300 whitespace-pre-wrap mt-2 pl-13">{post.content}</p>
                   {/* Comment Section (only allow commenting if member) */}
                  <CommentSection
                      postId={post.id}
                      initialComments={post.comments}
                      onCommentAdded={fetchGroupData}
                      canComment={isMember} // Pass down if user can comment
                   />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Add Member Modal (only for owner) */}
      {isOwner && group && (
        <AddMemberModal
            isOpen={isAddMemberModalOpen}
            onClose={() => setIsAddMemberModalOpen(false)}
            groupId={group.id}
            onMemberAdded={fetchGroupData} // Refresh group data after adding member
         />
      )}
    </>
  );
}