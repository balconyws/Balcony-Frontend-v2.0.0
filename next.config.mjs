import dotenv from 'dotenv';
dotenv.config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    BACKEND_URL: process.env.BACKEND_URL,
    MAP_API_KEY: process.env.MAP_API_KEY,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.google.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**.facebook.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: '**.digitaloceanspaces.com',
        port: '',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; connect-src 'self' http://localhost:5000 https://www.balcony.co https://balcony.co https://api.balcony.co http://balcony-server.vercel.app wss: ws: https://api.maptiler.com https://sfo3.digitaloceanspaces.com https://*.google.com https://identitytoolkit.googleapis.com https://*.googleapis.com https://*.gstatic.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' http://localhost:5000 https://www.balcony.co https://balcony.co https://api.balcony.co http://balcony-server.vercel.app https://*.googleapis.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: http: blob:; font-src 'self' data: https:; frame-src 'self' https://stripe.com https://*.stripe.com https://www.google.com; media-src 'self' https: https://*.digitaloceanspaces.com blob:; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; block-all-mixed-content; script-src-elem 'self' 'unsafe-inline' https:; object-src 'none'; manifest-src 'self';",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/property',
        destination: '/properties',
        permanent: true,
      },
      {
        source: '/workspace',
        destination: '/workspaces',
        permanent: true,
      },
      {
        source: '/host',
        destination: '/host/dashboard/workspace',
        permanent: true,
      },
      {
        source: '/host/dashboard',
        destination: '/host/dashboard/workspace',
        permanent: true,
      },
      {
        source: '/host/add',
        destination: '/host/dashboard/workspace',
        permanent: true,
      },
      {
        source: '/host/update',
        destination: '/host/dashboard/workspace',
        permanent: true,
      },
      {
        source: '/host/update/workspace',
        destination: '/host/dashboard/workspace',
        permanent: true,
      },
      {
        source: '/host/update/property',
        destination: '/host/dashboard/property',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin/dashboard/workspace',
        permanent: true,
      },
      {
        source: '/admin/dashboard',
        destination: '/admin/dashboard/workspace',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
