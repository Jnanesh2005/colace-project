// frontend/src/app/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { AxiosError } from 'axios';

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  let errorMessage = 'Login failed. Please check your credentials.'; // Default error

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Logging in...');
    setLoading(true);
    errorMessage = 'Login failed. Please check your credentials.'; // Reset error message

    try {
      // ***** CHANGE THE ENDPOINT *****
      const response = await api.post(
        '/auth/token/', // Use the JWT obtain pair endpoint
        { email, password }
      );

      console.log('Login successful:', response.data);
      setMessage(`Login successful! Redirecting...`);

      // ***** STORE ACCESS TOKEN (and optionally refresh token) *****
      // Simple JWT returns 'access' and 'refresh' tokens
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh); // Optional: store refresh token securely

      router.push('/home');

    } catch (err: unknown) {
      console.error('Login failed:', err);
      if (err instanceof AxiosError && err.response) {
         // Djoser/SimpleJWT often returns errors in 'detail' or specific fields
         errorMessage = err.response.data?.detail || err.response.data?.non_field_errors?.[0] || JSON.stringify(err.response.data) || errorMessage;
         // Handle specific 401 Unauthorized
         if (err.response.status === 401) {
            errorMessage = "Unable to log in with provided credentials.";
         }
      }
      setMessage(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  // --- JSX remains the same ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Login to Colace</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-400">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Submit Button */}
          <div>
            <button type="submit" disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>
        {message && <p className={`mt-4 text-center text-sm ${message.startsWith('Login successful') ? 'text-green-400' : 'text-red-500'}`}>{message}</p>}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-blue-400 hover:underline">Sign Up</Link>
        </p>
      </div>
    </main>
  );
}