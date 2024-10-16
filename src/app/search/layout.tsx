import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, search workspaces, search properties'],
};

export default function SearchLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
