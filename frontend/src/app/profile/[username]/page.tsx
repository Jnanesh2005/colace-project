// frontend/src/app/profile/[username]/page.tsx

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import CommentSection from '@/components/CommentSection';
import EditPostModal from '@/components/EditPostModal';
// Import types
import type { Post, CurrentUser, UserProfile } from '@/types';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const usernameFromUrl = params.username as string;

  // --- State Management ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const fetchAllData = useCallback(async (username: string) => {
    // Keep setLoading(true) here if you want loading state on every refresh (e.g., after follow)
    // setLoading(true);
    setError(''); // Clear previous errors
    try {
      const [currentUserRes, profileRes, postsRes] = await Promise.all([
        api.get('/auth/users/me/'),
        // No-cache header might be aggressive, remove if causing issues
        api.get(`/users/${username}/`/*, { headers: { 'Cache-Control': 'no-cache' } }*/),
        api.get(`/posts/?author_username=${username}`), // Fetch posts by this author
      ]);
      setCurrentUser(currentUserRes.data);
      setProfile(profileRes.data);
      setPosts(postsRes.data);
    } catch (err: any) { // Use 'any' temporarily for Axios error checking
      console.error('Failed to fetch profile data:', err);
       if (err.response && err.response.status === 404) {
         setError(`Profile not found for user "${username}".`);
       } else {
         setError('Failed to load profile data. Please try again later.');
       }
      // Keep existing data or clear it? Decide based on desired UX.
      // setProfile(null);
      // setPosts([]);
    } finally {
       if (loading) setLoading(false); // Only set loading false if it was initially true
    }
  }, [loading]); // Add loading as dependency if setLoading(true) is inside

 useEffect(() => {
    if (!usernameFromUrl) {
      setLoading(false); // No username, stop loading
      setError("No username specified in URL.");
      return;
    }

    setLoading(true); // Start loading when username is available

    if (usernameFromUrl === 'me') {
      api.get('/auth/users/me/')
        .then(res => {
          const actualUsername = res.data.username;
          if (actualUsername) {
            // Replace URL without adding to history, then fetch data
            router.replace(`/profile/${actualUsername}`, { scroll: false });
            // Note: fetchAllData will be triggered by the username change in the next render cycle
          } else {
             throw new Error("Could not determine current user's username.");
          }
        })
        .catch((err) => {
           console.error("Failed to get current user for 'me' route:", err);
           router.replace('/'); // Redirect to login on error
        });
        // No finally setLoading(false) here, let the subsequent fetch handle it
    } else {
      fetchAllData(usernameFromUrl);
    }
  // Add fetchAllData to dependencies
  }, [usernameFromUrl, router, fetchAllData]);


  // --- Handler Functions ---
  const handleFollowToggle = async () => {
    if (!profile || !currentUser || profile.username === currentUser.username) return;

    const apiCall = profile.is_following
        ? api.delete(`/follow/${profile.username}/`) // Unfollow
        : api.post(`/follow/${profile.username}/`);   // Follow

    try {
        await apiCall;
        // Optimistic update (optional but improves UX)
        setProfile(prev => prev ? {
            ...prev,
            is_following: !prev.is_following,
            follower_count: prev.is_following
                ? (prev.follower_count || 1) - 1 // Decrement safely
                : (prev.follower_count || 0) + 1 // Increment safely
        } : null);
        // Fetch fresh data in the background to confirm (or revert if optimistic update was wrong)
        fetchAllData(usernameFromUrl);
    } catch (err) {
        console.error(`Failed to ${profile.is_following ? 'unfollow' : 'follow'}:`, err);
        alert(`Could not ${profile.is_following ? 'unfollow' : 'follow'} user. Please try again.`);
        // Optional: Revert optimistic update on error
        // fetchAllData(usernameFromUrl);
    }
  };


  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${postId}/`);
        // Refresh posts after deletion
        setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
        // Optional: Also refresh profile if post count is displayed dynamically elsewhere
        // fetchAllData(usernameFromUrl);
      } catch (error) {
         console.error('Failed to delete post:', error);
         alert('Failed to delete post.');
       }
    }
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  // --- Render Logic ---
  if (loading) return <p className="text-white text-center mt-10">Loading profile...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  // Render nothing or a specific message if profile is null but no error (e.g., during 'me' redirect)
  if (!profile) return <p className="text-white text-center mt-10">Loading user data...</p>;


  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <Link href="/home" className="text-blue-400 hover:underline mb-4 block">&larr; Back to Feed</Link>
            <div className="bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {/* Profile Picture */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    {profile.profile_photo ? (
                      <Image src={profile.profile_photo} alt={`${profile.username}'s profile photo`} layout="fill" className="rounded-full object-cover border-2 border-gray-700" />
                    ) : (
                      <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-3xl border-2 border-gray-700">
                         {profile.username.charAt(0).toUpperCase()} {/* Fallback initial */}
                      </div>
                    )}
                  </div>
                  {/* Username & Stats */}
                  <div>
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <div className="flex flex-wrap space-x-4 mt-1 text-gray-400 text-sm">
                      <span><span className="font-bold text-white">{posts.length}</span> Posts</span>
                      <span><span className="font-bold text-white">{profile.follower_count ?? 0}</span> Followers</span>
                      <span><span className="font-bold text-white">{profile.following_count ?? 0}</span> Following</span>
                    </div>
                  </div>
                </div>
                 {/* Action Button */}
                 <div className="flex-shrink-0 mt-4 sm:mt-0">
                  {isOwnProfile ? (
                    <Link href="/settings">
                        <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors w-full sm:w-auto">
                            Edit Profile
                         </button>
                    </Link>
                  ) : (
                    <button
                        onClick={handleFollowToggle}
                        className={`font-bold py-2 px-4 rounded transition-colors w-full sm:w-auto ${
                            profile.is_following
                                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        {profile.is_following ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              </div>
               {/* Bio */}
              <p className="text-gray-400 mt-4">{profile.bio || 'No bio yet.'}</p>
            </div>
          </header>

          <h2 className="text-2xl font-semibold mb-4">Posts</h2>

          {/* Post Feed */}
          <div className="space-y-4">
             {posts.length === 0 && !loading && (
                 <p className="text-gray-500 text-center">This user hasn't posted anything yet.</p>
             )}
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                 <div className="flex justify-between items-start mb-2">
                   {/* Author Info (slightly redundant on profile, but consistent) */}
                   <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {post.author_profile_photo ? ( <Image src={post.author_profile_photo} alt={post.author_username} layout="fill" className="rounded-full object-cover" /> ) : (
                          <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-xl">
                              {post.author_username.charAt(0).toUpperCase()}
                          </div>
                       )}
                    </div>
                    <div>
                      {/* Link might not be needed if already on profile, but harmless */}
                      <Link href={`/profile/${post.author_username}`} className="font-bold text-blue-400 hover:underline">{post.author_username}</Link>
                      <div className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                   {/* Edit/Delete Buttons */}
                  {isOwnProfile && (
                    <div className="flex space-x-3 text-sm font-semibold">
                      <button onClick={() => openEditModal(post)} className="text-gray-400 hover:text-blue-400 transition-colors">Edit</button>
                      <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                    </div>
                  )}
                </div>
                 {/* Post Content */}
                {/* Ensure consistent margin/padding */}
                <p className="text-gray-300 whitespace-pre-wrap mt-2 pl-13">{post.content}</p>
                 {/* Comment Section */}
                <CommentSection postId={post.id} initialComments={post.comments} onCommentAdded={() => fetchAllData(usernameFromUrl)} />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} post={editingPost} onPostUpdated={() => {
            setIsEditModalOpen(false);
            if (usernameFromUrl) fetchAllData(usernameFromUrl); // Refresh data after edit
        }} />
      )}
    </>
  );
}