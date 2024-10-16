import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Host Update Property - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, update workspaces, update properties'],
};

export default function HostUpdatePropertyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
