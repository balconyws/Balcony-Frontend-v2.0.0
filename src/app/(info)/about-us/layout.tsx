import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, about us, about us balcony, workspaces, search properties'],
};

export default function AboutUsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
