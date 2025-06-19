import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MockingJar - Generator',
  description: 'AI-powered JSON data generator with visual schema builder',
};

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>
}
