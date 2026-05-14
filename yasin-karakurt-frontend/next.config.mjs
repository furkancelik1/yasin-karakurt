/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Cloudinary görselleri için şart
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yasin-karakurt.onrender.com', // Render backend görselleri için
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      }
    ],
  },
};

export default nextConfig;