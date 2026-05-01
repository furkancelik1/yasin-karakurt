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
      // Eğer ileride Supabase Storage kullanırsan buraya onun domainini de ekleyeceğiz.
    ],
  },
};

export default nextConfig;