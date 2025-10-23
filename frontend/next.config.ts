/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      // --- Add this block for Render ---
      {
        protocol: 'https', // Render uses https
        hostname: '*.onrender.com', // Placeholder for Render hostname
        port: '', // Default https port
        pathname: '/media/**',
      },
      // --------------------------------
    ],
  },
};

export default nextConfig;