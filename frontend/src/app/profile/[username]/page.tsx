'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';
import CommentSection from '@/components/CommentSection';
import EditPostModal from '@/components/EditPostModal';

// --- Define data structures ---
interface Post {
  id: number;
  content: string;
  author_username: string;
  author_profile_photo: string | null;
  created_at: string;
  comments: any[];
}
interface CurrentUser {
  username: string;
}
interface UserProfile {
  id: number;
  username: string; // This was the missing property
  bio: string | null;
  profile_photo: string | null;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

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
    setLoading(true);
    try {
      const [currentUserRes, profileRes, postsRes] = await Promise.all([
        api.get('/auth/users/me/'),
        api.get(`/users/${username}/`, { headers: { 'Cache-Control': 'no-cache' } }),
        api.get(`/posts/?author_username=${username}`),
      ]);
      setCurrentUser(currentUserRes.data);
      setProfile(profileRes.data);
      setPosts(postsRes.data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
      setError('Profile not found.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!usernameFromUrl) return;

    if (usernameFromUrl === 'me') {
      api.get('/auth/users/me/')
        .then(res => {
          const actualUsername = res.data.username;
          if (actualUsername) {
            router.replace(`/profile/${actualUsername}`);
          }
        })
        .catch(() => router.replace('/'));
    } else {
      fetchAllData(usernameFromUrl);
    }
  }, [usernameFromUrl, router, fetchAllData]);

  // --- Handler Functions ---
  const handleFollow = async () => {
    if (!profile) return;
    try {
      await api.post(`/follow/${profile.username}/`);
      await fetchAllData(usernameFromUrl);
    } catch (err) { console.error('Failed to follow:', err); }
  };

  const handleUnfollow = async () => {
    if (!profile) return;
    try {
      await api.delete(`/follow/${profile.username}/`);
      await fetchAllData(usernameFromUrl);
    } catch (err) { console.error('Failed to unfollow:', err); }
  };

  const handleDeletePost = async (postId: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${postId}/`);
        await fetchAllData(usernameFromUrl);
      } catch (error) { console.error('Failed to delete post:', error); }
    }
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };
  
  // --- Render Logic ---
  if (loading) return <p className="text-white text-center mt-10">Loading profile...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;
  if (!profile) return null;

  const isOwnProfile = currentUser?.username === profile.username;

  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            <Link href="/home" className="text-blue-400 hover:underline mb-4 block">&larr; Back to Feed</Link>
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20">
                    {profile.profile_photo ? (
                      <Image src={profile.profile_photo} alt={`${profile.username}'s profile photo`} layout="fill" className="rounded-full object-cover" />
                    ) : ( <div className="w-full h-full bg-gray-700 rounded-full" /> )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <div className="flex space-x-4 mt-1 text-gray-400 text-sm">
                      <span><span className="font-bold text-white">{posts.length}</span> Posts</span>
                      <span><span className="font-bold text-white">{profile.follower_count}</span> Followers</span>
                      <span><span className="font-bold text-white">{profile.following_count}</span> Following</span>
                    </div>
                  </div>
                </div>
                <div>
                  {isOwnProfile ? (
                    <Link href="/settings"><button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Edit Profile</button></Link>
                  ) : (
                    profile.is_following ? 
                    <button onClick={handleUnfollow} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Unfollow</button> :
                    <button onClick={handleFollow} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Follow</button>
                  )}
                </div>
              </div>
              <p className="text-gray-400 mt-4">{profile.bio || 'No bio yet.'}</p>
            </div>
          </header>

          <h2 className="text-2xl font-semibold mb-4">Posts by {profile.username}</h2>
          
          {/* Post Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={`${post.id}-${post.comments.length}`} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                   <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10">
                      {post.author_profile_photo ? ( <Image src={post.author_profile_photo} alt={post.author_username} layout="fill" className="rounded-full object-cover" /> ) : ( <div className="w-full h-full bg-gray-700 rounded-full" /> )}
                    </div>
                    <div>
                      <span className="font-bold text-blue-400">{post.author_username}</span>
                      <div className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <div className="flex space-x-3 text-sm font-semibold">
                      <button onClick={() => openEditModal(post)} className="text-gray-500 hover:text-blue-400">Edit</button>
                      <button onClick={() => handleDeletePost(post.id)} className="text-gray-500 hover:text-red-500">Delete</button>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 whitespace-pre-wrap mt-2 ml-12">{post.content}</p>
                <CommentSection postId={post.id} initialComments={post.comments} onCommentAdded={() => fetchAllData(usernameFromUrl)} />
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {editingPost && (
        <EditPostModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} post={editingPost} onPostUpdated={() => {
            setIsEditModalOpen(false);
            if (usernameFromUrl) fetchAllData(usernameFromUrl);
        }} />
      )}
    </>
  );
}