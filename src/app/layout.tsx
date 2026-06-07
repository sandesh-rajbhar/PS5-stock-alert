import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PS Deals | Compare Game Prices & Live Tracker',
  description: 'Compare PS5 game prices across PlayStation Store, Amazon, Flipkart, Gameloot and more. Get live alerts on stock and cheap deals in India.',
  keywords: 'PS5 game deals india, playstation 5 price comparison, cheap ps5 games india, amazon ps5 games, flipkart ps5 games, gameloot ps5, ps5 stock india',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <Navbar />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
