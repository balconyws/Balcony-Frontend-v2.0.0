import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Host Workspace Dashboard - Balcony',
  description: 'Welcome to Balcony, your ultimate hub for finding customized workspace solutions.',
  keywords: ['balcony, add workspaces, add properties'],
};

export default function HostWorkspaceDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
