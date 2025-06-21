import type { Metadata, Viewport } from 'next';
import './globals.css';
import MUIThemeProvider from '@/providers/ThemeProvider';
import QueryProvider from '@/providers/QueryProvider';

export const metadata: Metadata = {
  title: 'MockingJar',
  description: 'AI-powered JSON data generator with visual schema builder',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1976d2',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <head>
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      </head>
      <body>
        <QueryProvider>
          <MUIThemeProvider>
            {children}
          </MUIThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
