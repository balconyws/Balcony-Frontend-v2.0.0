import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, privacy policy, privacy policy balcony, workspaces, search properties'],
};

export default function PolicyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
