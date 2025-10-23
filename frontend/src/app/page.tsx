'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 1. Import the router
import axios from 'axios';
import Link from 'next/link';

export default function Home() {
  const router = useRouter(); // 2. Initialize the router
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('Logging in...');

    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/token/login/', // Add /api here
        { email, password }
      );

      console.log('Login successful:', response.data);
      setMessage(`Login successful! Token: ${response.data.auth_token}`);

      // Save the token and redirect to the homepage
      localStorage.setItem('auth_token', response.data.auth_token);
      router.push('/home'); // 3. This line redirects the user

    } catch (error) {
      console.error('Login failed:', error);
      setMessage('Login failed. Please check your credentials.');
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
              className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-800"
            >
              Log In
            </button>
          </div>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gray-400">{message}</p>}
        {/* --- ADD THIS CODE --- */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>
        {/* ------------------- */}
      </div>
    </main>
  );
}