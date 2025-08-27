// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { SubscriptionProvider } from '@/context/SubscriptionContext';

import { ThemeProvider } from 'next-themes';
import { Geist, Inter } from 'next/font/google';

const defaultUrl =
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'SubTrack',
  description: 'Track all your subscriptions in one place.',
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${inter.className} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SubscriptionProvider>
            <AppLayout>{children}</AppLayout>
          </SubscriptionProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
