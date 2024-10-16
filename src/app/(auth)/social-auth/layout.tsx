import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Loading - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, workspaces, properties'],
};

export default function SocialAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <SessionProvider>{children}</SessionProvider>;
}
