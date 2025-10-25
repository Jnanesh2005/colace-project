"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import CommentSection from "@/components/CommentSection";
import type { Post, Comment } from "@/types";

export default function GroupPage() {
  const { groupId } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/groups/${groupId}/posts/`);
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [groupId]);

  if (loading) {
    return <p className="text-center text-gray-300 mt-10">Loading...</p>;
  }

  return (
    <div className="p-5 space-y-6">
      {posts.length === 0 && (
        <p className="text-gray-400 text-center">No posts in this group yet.</p>
      )}

      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-gray-800 p-4 rounded-md shadow-md border border-gray-700"
        >
          <h3 className="font-bold text-white mb-2">{post.author_username}</h3>
          <p className="text-gray-300">{post.content}</p>

          {/* ✅ Passing correct props */}
          <CommentSection
            postId={post.id}
            initialComments={post.comments as Comment[]}
            onCommentAdded={fetchPosts}
            canComment={true}
          />
        </div>
      ))}
    </div>
  );
}
