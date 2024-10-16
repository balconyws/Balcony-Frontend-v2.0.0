import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, search workspaces, search properties, pricing'],
};

export default function PricingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
