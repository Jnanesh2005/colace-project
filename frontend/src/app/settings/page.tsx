'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
import type { UserProfile } from '@/types'; // Import type
import { AxiosError } from 'axios'; // Import AxiosError
import Link from 'next/link';

export default function EditProfilePage() {
  const router = useRouter();
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        router.push('/');
        return;
    }
    setLoading(true);
    api.get<UserProfile>('/auth/users/me/')
      .then(res => {
        setCurrentUsername(res.data.username);
        setBio(res.data.bio || '');
        setPreview(res.data.profile_photo);
      })
      .catch(err => {
        console.error("Failed to fetch user data:", err);
         localStorage.removeItem('access_token');
         localStorage.removeItem('refresh_token');
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUsername) {
        setError("User data not loaded correctly. Please refresh.");
        return;
    }
    setSaving(true);
    setError('');
    const formData = new FormData();
    formData.append('bio', bio);
    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto);
    }

    try {
      const response = await api.patch<UserProfile>('/auth/users/me/', formData);
      const updatedUsername = response.data.username || currentUsername;
      router.push(`/profile/${updatedUsername}`);
    } catch (err) { // Keep err as unknown
      console.error('Failed to update profile:', err);
      let errorMsg = 'Failed to update profile. Please try again.';
      // Use AxiosError type guard
      if (err instanceof AxiosError && err.response?.data) {
            const responseData = err.response.data as any; // Use 'as any' carefully here
            if (responseData.bio && Array.isArray(responseData.bio)) errorMsg = `Bio: ${responseData.bio.join(', ')}`;
            else if (responseData.profile_photo && Array.isArray(responseData.profile_photo)) errorMsg = `Profile Photo: ${responseData.profile_photo.join(', ')}`;
            else if (responseData.detail) errorMsg = responseData.detail;
            // You might want to define a specific error response type instead of 'as any'
        }
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // --- Render Logic (Keep the version from the previous response) ---
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
                accept="image/png, image/jpeg, image/gif"
                onChange={handleFileChange}
                className="hidden"
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
              maxLength={200}
              placeholder="Tell us about yourself..."
            />
             <p className="text-xs text-gray-500 mt-1 text-right">{bio.length} / 200</p>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Buttons */}
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