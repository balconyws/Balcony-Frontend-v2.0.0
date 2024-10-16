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
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    STORAGE_ENDPOINT: process.env.STORAGE_ENDPOINT,
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
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
              "default-src 'self'; connect-src 'self' https://*.maptiler.com https://*.googleapis.com https://*.facebook.com https://stripe.com https://*.stripe.com wss:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.googleapis.com https://*.facebook.com https://stripe.com https://*.stripe.com; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https: http: blob:; font-src 'self' data: https:; frame-src 'self' https://stripe.com https://*.stripe.com; media-src 'self' https: https://*.digitaloceanspaces.com blob: https://stripe.com https://*.stripe.com; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; block-all-mixed-content; script-src-elem 'self' 'unsafe-inline' https:; object-src 'none'; manifest-src 'self';",
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
