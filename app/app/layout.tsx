import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SolanaProviders } from '@/lib/solana/provider';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Time Capsule | Lock Your Predictions on Solana',
  description:
    'Create time-locked capsules with predictions, goals, and commitments. Stake SOL for accountability. Community votes determine success.',
  keywords: [
    'Solana',
    'NFT',
    'predictions',
    'accountability',
    'crypto',
    'dapp',
  ],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Time Capsule | Lock Your Predictions on Solana',
    description:
      'Create time-locked capsules with predictions, goals, and commitments. Stake SOL for accountability. Community votes determine success.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time Capsule | Lock Your Predictions on Solana',
    description:
      'Create time-locked capsules with predictions, goals, and commitments. Stake SOL for accountability. Community votes determine success.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SolanaProviders>
            <Header />
            {children}
          </SolanaProviders>
        </ThemeProvider>
        <Toaster position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
