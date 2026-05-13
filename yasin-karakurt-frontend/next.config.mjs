/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'curling-trouble-goatskin.ngrok-free.dev', // <--- YENİ LİNKİN
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.ngrok-free.dev',
        pathname: '/uploads/**',
      }
    ],
  },
};

export default nextConfig;