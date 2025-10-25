// frontend/src/app/home/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import CommentSection from '@/components/CommentSection';
import EditPostModal from '@/components/EditPostModal';
// Import types
import type { Post, CurrentUser } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  // Removed unused state: newPostContent, setNewPostContent
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/feed/'); // Fetches posts for the feed
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      // Optional: Handle error display to the user
    }
  };

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      // Use access_token for JWT
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/'); // Redirect to login if no token
        return;
      }
      setLoading(true); // Ensure loading state is true at the start
      try {
        // Fetch current user and feed posts concurrently
        const [userResponse, feedResponse] = await Promise.all([
          api.get('/auth/users/me/'), // Djoser endpoint for current user
          api.get('/feed/') // Your custom feed endpoint
        ]);
        setCurrentUser(userResponse.data);
        setPosts(feedResponse.data);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        // If fetch fails (e.g., invalid token), clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token'); // Also clear refresh token if stored
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndPosts();
  }, [router]); // Dependency array includes router

  // --- Handlers for Edit/Delete ---
  // (Assuming you might add these back later, keep stubs or implement)

  // const handleLogout = () => {
  //   localStorage.removeItem('access_token');
  //   localStorage.removeItem('refresh_token');
  //   router.push('/');
  // };

  const handleDeletePost = async (postId: number) => {
     if (window.confirm('Are you sure you want to delete this post?')) {
       try {
         await api.delete(`/posts/${postId}/`);
         fetchPosts(); // Re-fetch posts after deletion
       } catch (error) {
         console.error('Failed to delete post:', error);
         alert('Failed to delete post.'); // Inform user
       }
     }
   };

  // const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   // Add logic to submit a new post from the home page if needed
  // };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  // --- Render Logic ---
  if (loading) return <p className="text-white text-center mt-10">Loading feed...</p>;

  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Optional: Add Header, Create Post Form here if needed */}
          <h1 className="text-3xl font-bold mb-6 text-center">Your Feed</h1>

          {/* Post Feed */}
          <div className="space-y-4">
             {posts.length === 0 && !loading && (
                 <p className="text-gray-500 text-center">Your feed is empty. Follow some users to see their posts!</p>
             )}
            {posts.map((post) => (
              // Use a more unique key if comments can change without ID changing
              <div key={post.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-2">
                  {/* Author Info */}
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {post.author_profile_photo ? (
                        <Image src={post.author_profile_photo} alt={post.author_username} layout="fill" className="rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-xl">
                           {post.author_username.charAt(0).toUpperCase()} {/* Fallback initial */}
                        </div>
                      )}
                    </div>
                    <div>
                      <Link href={`/profile/${post.author_username}`} className="font-bold text-blue-400 hover:underline">{post.author_username}</Link>
                      <div className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  {/* Edit/Delete Buttons */}
                  {currentUser?.username === post.author_username && (
                    <div className="flex space-x-3 text-sm font-semibold">
                      <button onClick={() => openEditModal(post)} className="text-gray-400 hover:text-blue-400 transition-colors">Edit</button>
                      <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                    </div>
                  )}
                </div>
                {/* Post Content */}
                <p className="text-gray-300 whitespace-pre-wrap mt-2 pl-13">{post.content}</p> {/* Adjust margin if needed */}
                {/* Comment Section */}
                <CommentSection postId={post.id} initialComments={post.comments} onCommentAdded={fetchPosts} />
              </div>
            ))}
          </div>
        </div>
      </main>
      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={editingPost}
          onPostUpdated={() => {
            setIsEditModalOpen(false);
            fetchPosts(); // Refresh feed after editing
          }}
        />
      )}
    </>
  );
}