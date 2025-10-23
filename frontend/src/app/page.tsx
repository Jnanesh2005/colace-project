'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api'; // 1. Import and use the configured api client
import { AxiosError } from 'axios'; // 2. Import AxiosError for proper error handling

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state for button

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Logging in...');
    setLoading(true); // Set loading true
    let errorMessage = 'Login failed. Please check your credentials.'; // Default error

    try {
      // 3. Use the configured 'api' client here
      const response = await api.post(
        '/auth/token/login/', // No need for full URL, baseURL is in api.ts
        { email, password }
      );

      console.log('Login successful:', response.data);
      setMessage(`Login successful! Redirecting...`);

      localStorage.setItem('auth_token', response.data.auth_token);
      router.push('/home');

    } catch (err: unknown) { // 4. Use unknown type for error
      console.error('Login failed:', err);
      // 5. Use AxiosError type guard
      if (err instanceof AxiosError && err.response) {
         // Use backend error message if available
         errorMessage = err.response.data?.non_field_errors?.[0] || err.response.data?.detail || errorMessage;
      }
      setMessage(errorMessage);
    } finally {
        setLoading(false); // Set loading false
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Login to Colace</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading} // Disable button while loading
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800 disabled:bg-gray-500" // Added disabled style
            >
              {loading ? 'Logging In...' : 'Log In'} {/* Added loading text */}
            </button>
          </div>
        </form>
        {message && <p className={`mt-4 text-center text-sm ${message.startsWith('Login failed') ? 'text-red-500' : 'text-green-400'}`}>{message}</p>} {/* Dynamic message color */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}