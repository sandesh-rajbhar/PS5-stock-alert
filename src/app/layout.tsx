import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PS5 Stock Tracker India | Amazon, Flipkart, Croma Alerts',
  description: 'Get instant email alerts when PS5 is back in stock on Amazon India, Flipkart, Croma, Vijay Sales, and Reliance Digital. Pincode-aware stock tracking.',
  keywords: 'PS5 stock india, playstation 5 india tracker, amazon ps5 india, flipkart ps5 stock, croma ps5, vijay sales ps5, reliance digital ps5',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
