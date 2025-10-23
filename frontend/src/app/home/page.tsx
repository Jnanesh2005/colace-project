'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import CommentSection from '@/components/CommentSection';
import EditPostModal from '@/components/EditPostModal';

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

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const fetchPosts = async () => {
    try {
      const response = await api.get('/feed/');
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/');
        return;
      }
      try {
        const [userResponse, feedResponse] = await Promise.all([
          api.get('/auth/users/me/'),
          api.get('/feed/')
        ]);
        setCurrentUser(userResponse.data);
        setPosts(feedResponse.data);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        localStorage.removeItem('auth_token');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndPosts();
  }, [router]);

  const handleLogout = () => { /* ... (function unchanged) ... */ };
  const handleDeletePost = async (postId: number) => { /* ... (function unchanged) ... */ };
  const handlePostSubmit = async (e: React.FormEvent<HTMLFormElement>) => { /* ... (function unchanged) ... */ };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  if (loading) return <p className="text-white text-center mt-10">Loading...</p>;

  return (
    <>
      <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header & Create Post Form... */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={`${post.id}-${post.comments.length}`} className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10">
                      {post.author_profile_photo ? (
                        <Image src={post.author_profile_photo} alt={post.author_username} layout="fill" className="rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-700 rounded-full" />
                      )}
                    </div>
                    <div>
                      <Link href={`/profile/${post.author_username}`} className="font-bold text-blue-400 hover:underline">{post.author_username}</Link>
                      <div className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  {currentUser?.username === post.author_username && (
                    <div className="flex space-x-3 text-sm font-semibold">
                      <button onClick={() => openEditModal(post)} className="text-gray-500 hover:text-blue-400">Edit</button>
                      <button onClick={() => handleDeletePost(post.id)} className="text-gray-500 hover:text-red-500">Delete</button>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 whitespace-pre-wrap mt-2 ml-13">{post.content}</p> {/* Adjusted margin for alignment */}
                <CommentSection postId={post.id} initialComments={post.comments} onCommentAdded={fetchPosts} />
              </div>
            ))}
          </div>
        </div>
      </main>
      {editingPost && (
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={editingPost}
          onPostUpdated={() => {
            setIsEditModalOpen(false);
            fetchPosts();
          }}
        />
      )}
    </>
  );
}