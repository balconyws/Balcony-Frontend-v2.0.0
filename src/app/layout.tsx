import type { Metadata, Viewport } from 'next';
import { Inter as FontSans } from 'next/font/google';

import RootProvider from '@/providers';
import { Navbar, StackNavigation, Cta } from '@/components/common';
import { cn } from '@/lib/utils';
import './globals.css';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony'],
  icons: [
    {
      rel: 'shortcut icon',
      type: 'image/x-icon',
      url: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      type: 'image/png',
      sizes: '180x180',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
    {
      rel: 'mask-icon',
      type: 'image/svg',
      color: '#5bbad5',
      url: '/safari-pinned-tab.svg',
    },
  ],
  manifest: '/site.webmanifest',
  creator: 'balcony.ws',
  publisher: 'balcony.ws',
  metadataBase: new URL('https://balcony.ws'),
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://balcony.ws',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dev = process.env.NODE_ENV === 'development';
  return (
    <html lang="en" style={{ overflowX: 'hidden' }}>
      <head>
        <meta name="msapplication-TileColor" content="#da532c" />
      </head>
      <body
        suppressHydrationWarning={dev}
        className={cn(
          'min-h-screen overflow-x-hidden bg-background font-sans antialiased',
          fontSans.variable
        )}
        style={{ marginRight: '0px !important' }}>
        <RootProvider>
          <StackNavigation />
          <Cta />
          <Navbar />
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
