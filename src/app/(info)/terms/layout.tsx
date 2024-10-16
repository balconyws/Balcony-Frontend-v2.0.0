import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, terms of service, terms of service balcony, workspaces, search properties'],
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
