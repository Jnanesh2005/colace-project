'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
// Import type
import type { UserProfile } from '@/types'; // Use the shared type
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  // Removed unused state: profile, setProfile
  // const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>(''); // Store username for redirect
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch current user data when the page loads
  useEffect(() => {
    // Check for token first
    const token = localStorage.getItem('access_token');
    if (!token) {
        router.push('/'); // Redirect if not logged in
        return;
    }

    setLoading(true);
    api.get<UserProfile>('/auth/users/me/') // Specify expected type
      .then(res => {
        // setProfile(res.data); // No longer needed
        setCurrentUsername(res.data.username); // Store username for redirect
        setBio(res.data.bio || '');
        setPreview(res.data.profile_photo);
      })
      .catch(err => {
        console.error("Failed to fetch user data:", err);
         localStorage.removeItem('access_token'); // Clear potentially invalid token
         localStorage.removeItem('refresh_token');
        router.push('/'); // Redirect to login if fetch fails
      })
      .finally(() => setLoading(false));
  }, [router]); // router is a dependency

  // Handle file selection and create a preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Optional: Add file size/type validation here
      setProfilePhoto(file);

      // Clean up previous object URL to prevent memory leaks
      if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    } else {
        // Optional: Handle case where user cancels file selection
        // setProfilePhoto(null);
        // setPreview(null); // Or reset to original profile photo?
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUsername) {
        setError("User data not loaded correctly. Please refresh.");
        return;
    }
    setSaving(true);
    setError('');

    const formData = new FormData();
    // Only append bio if it has changed from the initial fetched value (optional optimization)
    // Or simply always append the current state
    formData.append('bio', bio);

    if (profilePhoto) {
      // Key name 'profile_photo' must match backend serializer/model field name
      formData.append('profile_photo', profilePhoto);
    }

    try {
      // Use PATCH to update the user's profile (/auth/users/me/ is Djoser's endpoint)
      const response = await api.patch<UserProfile>('/auth/users/me/', formData, {
        headers: {
            // Let Axios set Content-Type for FormData
             // 'Content-Type': 'multipart/form-data', (usually not needed)
         },
      });
      // Use the username from the response for redirection, just in case
      const updatedUsername = response.data.username || currentUsername;
      // Invalidate cache or simply redirect
      router.push(`/profile/${updatedUsername}`);
      // router.refresh(); // Alternative: Refresh current route data if staying on page
    } catch (err: any) {
      console.error('Failed to update profile:', err);
       let errorMsg = 'Failed to update profile. Please try again.';
        if (err.response?.data) {
            // Try to extract specific error messages from backend response
            const responseData = err.response.data;
            if (responseData.bio) errorMsg = `Bio: ${responseData.bio.join(', ')}`;
            else if (responseData.profile_photo) errorMsg = `Profile Photo: ${responseData.profile_photo.join(', ')}`;
            else if (responseData.detail) errorMsg = responseData.detail;
            // Add more specific field checks if needed
        }
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // --- Render Logic ---
  if (loading) return <p className="text-white text-center p-10">Loading settings...</p>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24 flex-shrink-0">
              {preview ? (
                <Image src={preview} alt="Profile preview" layout="fill" className="rounded-full object-cover border-2 border-gray-700" />
              ) : (
                <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-gray-500 border-2 border-gray-700">
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="profile-photo-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Change Photo
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif" // Be specific about accepted types
                onChange={handleFileChange}
                className="hidden" // Keep hidden, triggered by label
              />
               <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF accepted.</p>
            </div>
          </div>

          {/* Bio Textarea */}
          <div>
            <label htmlFor="bio" className="block text-gray-400 mb-2">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              maxLength={200} // Optional: Add a max length
              placeholder="Tell us about yourself..."
            />
             <p className="text-xs text-gray-500 mt-1 text-right">{bio.length} / 200</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
             <Link href={currentUsername ? `/profile/${currentUsername}` : '/home'}>
                 <button type="button" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-colors">
                      Cancel
                  </button>
             </Link>
             <button
                type="submit"
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors"
              >
                {saving ? 'Saving...' : 'Save Changes'}
             </button>
           </div>
        </form>
      </div>
    </main>
  );
}