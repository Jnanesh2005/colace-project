'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';

interface UserProfile {
  username: string;
  bio: string | null;
  profile_photo: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bio, setBio] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch current user data when the page loads
  useEffect(() => {
    api.get('/auth/users/me/')
      .then(res => {
        setProfile(res.data);
        setBio(res.data.bio || '');
        setPreview(res.data.profile_photo);
      })
      .catch(err => {
        console.error("Failed to fetch user data:", err);
        router.push('/'); // Redirect to login if not authenticated
      })
      .finally(() => setLoading(false));
  }, [router]);

  // Handle file selection and create a preview URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('bio', bio);
    if (profilePhoto) {
      formData.append('profile_photo', profilePhoto);
    }

    try {
      // Use PATCH to update the user's profile
      const response = await api.patch('/auth/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Redirect to the updated profile page on success
      router.push(`/profile/${response.data.username}`);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-white text-center p-10">Loading settings...</p>;

  return (
    <main className="min-h-screen text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex items-center space-x-4">
            <div className="relative w-24 h-24">
              {preview ? (
                <Image src={preview} alt="Profile preview" layout="fill" className="rounded-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}
            </div>
            <div>
              <label htmlFor="profile-photo-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Change Photo
              </label>
              <input
                id="profile-photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
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
              placeholder="Tell us about yourself..."
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 px-4 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-500"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </main>
  );
}