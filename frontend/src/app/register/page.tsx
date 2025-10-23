'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api'; // Use our custom API client

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/register/', { email, password }, { withCredentials: true }); // Add this option
      setMessage(response.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/register/verify/', { otp }, { withCredentials: true }); // Add this option
      setMessage(response.data.message + ' You can now log in.');
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-center">Create an Account</h1>
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400">College Email</label>
                <input
                  id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
                  placeholder="user@college.ac.in"
                />
              </div>
              <div>
                <label htmlFor="password"className="block text-sm font-medium text-gray-400">Password</label>
                <input
                  id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
                {loading ? 'Sending OTP...' : 'Register'}
              </button>
            </form>
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-center">Verify Your Email</h1>
            <p className="text-center text-gray-400">Enter the OTP sent to {email}</p>
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-400">OTP</label>
                <input
                  id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength={6}
                  className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md text-center tracking-[0.5em]"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500">
                {loading ? 'Verifying...' : 'Verify Account'}
              </button>
            </form>
          </>
        )}
        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        {message && <p className="mt-4 text-center text-sm text-green-400">{message}</p>}
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/" className="font-medium text-blue-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
}