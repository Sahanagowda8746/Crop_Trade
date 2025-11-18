import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https' as const,
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add the allowedDevOrigins configuration to resolve the cross-origin warning
  // that is causing server instability in the development environment.
  allowedDevOrigins: [
    'https://6000-firebase-studio-1763366724609.cluster-ejd22kqny5htuv5dfowoyipt52.cloudworkstations.dev',
  ],
};

export default nextConfig;
