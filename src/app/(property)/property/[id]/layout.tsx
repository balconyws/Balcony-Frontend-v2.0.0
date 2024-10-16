import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Property - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized property solutions.',
  keywords: ['balcony, search property, search properties'],
};

export default function PropertyDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
