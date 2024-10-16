import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, faq, faq balcony, workspaces, search properties'],
};

export default function FaqLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
