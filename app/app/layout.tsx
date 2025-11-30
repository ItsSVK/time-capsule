import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { SolanaProvider } from '@/lib/solana/provider';
import { Header } from '@/components/Header';
import { Toaster } from 'react-hot-toast';

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TimeCapsule | Lock Your Predictions on Solana',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-black text-white min-h-screen`}
        suppressHydrationWarning
      >
        <SolanaProvider>
          {/* Background gradient */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-black" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl" />
          </div>

          <Header />
          <main className="relative">{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#18181b',
                color: '#fff',
                border: '1px solid #3f3f46',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </SolanaProvider>
      </body>
    </html>
  );
}
