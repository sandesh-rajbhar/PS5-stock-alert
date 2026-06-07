import Footer from '@/components/Footer';
import GamesGrid from '@/components/GamesGrid';
import { Gamepad2 } from 'lucide-react';

export const metadata = {
  title: 'PS5 Games | Compare Prices Across Indian Stores',
  description: 'Browse and compare PS5 game prices across Amazon, Flipkart and more. Search by genre, find trending titles, and track deals — free.',
};

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-theme-page text-theme-page">

      {/* Hero */}
      <section className="relative px-4 py-12 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, rgba(0,112,255,0.1) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/25">
              Beta
            </span>
            <span className="text-[10px] font-black text-ps-neon-blue uppercase tracking-[0.2em]">
              Game Price Comparison
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-theme-page mb-4">
            Find the Best
            <br />
            <span className="dark:text-gradient text-gradient-light">PS5 Game Deals.</span>
          </h1>
          <p className="text-theme-muted text-base leading-relaxed max-w-xl mx-auto">
            Browse 60+ PS5 titles. Search by name or genre. Live price comparison across Amazon &amp; Flipkart coming soon.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 pb-20 max-w-7xl mx-auto">
        <GamesGrid />
      </section>

      <Footer />
    </main>
  );
}
