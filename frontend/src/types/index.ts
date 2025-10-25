// frontend/src/types/index.ts

// Represents a comment object from the backend
export interface Comment {
  id: number;
  content: string;
  author: number; // User ID of the author
  author_username: string;
  post: number; // Post ID the comment belongs to
  created_at: string;
  // Add updated_at if your serializer includes it
}

// Represents a post object from the backend
export interface Post {
    id: number;
    content: string;
    author: number; // User ID of the author
    author_username: string;
    author_profile_photo: string | null;
    group: number | null; // Group ID or null if personal post
    comments: Comment[]; // Use the Comment interface
    created_at: string;
    updated_at: string;
}

// Represents the currently logged-in user's basic info
export interface CurrentUser {
    id?: number; // Optional: Add if returned by /users/me/
    username: string;
    email?: string; // Optional: Add if returned by /users/me/
    // Add other fields from your UserSerializer if needed
}

// Represents a user's full profile details
export interface UserProfile {
    id: number;
    username: string;
    email?: string; // Add if included in UserSerializer
    bio: string | null;
    profile_photo: string | null;
    follower_count?: number; // Make optional if not always present
    following_count?: number; // Make optional if not always present
    is_following?: boolean; // Make optional if not always present
    date_of_birth?: string | null; // Add if needed
}

// Represents basic group info (e.g., in lists)
export interface UserGroup {
  id: number;
  name: string;
  description?: string | null;
  member_count?: number;
}

// Represents detailed group info (e.g., on group page)
export interface GroupDetail extends UserGroup {
    owner: number; // Assuming owner ID is sent
    owner_username: string;
    members: number[]; // Assuming member IDs are sent
    is_member: boolean; // Add based on GroupSerializer
    created_at: string; // Add based on GroupSerializer
}

// Represents a user found in search results
export interface UserSearchResult {
  id: number;
  username: string;
  bio: string | null;
  profile_photo?: string | null; // Add if available from backend
}