import { notFound } from 'next/navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { GAMES } from '@/data/games';
import { ArrowLeft, ExternalLink, ShoppingCart } from 'lucide-react';

export function generateStaticParams() {
  return GAMES.map(g => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const game = GAMES.find(g => g.slug === params.slug);
  if (!game) return {};
  return {
    title: `${game.title} PS5 Price India | PS Deals`,
    description: `Compare ${game.title} PS5 prices across Amazon, Flipkart and more. Find the best deal in India.`,
  };
}

const STORES = [
  { name: 'Amazon India',      color: '#f97316', getUrl: (t: string) => `https://www.amazon.in/s?k=${encodeURIComponent(t + ' PS5')}` },
  { name: 'Flipkart',          color: '#2874f0', getUrl: (t: string) => `https://www.flipkart.com/search?q=${encodeURIComponent(t + ' PS5')}` },
  { name: 'Croma',             color: '#6db33f', getUrl: (t: string) => `https://www.croma.com/searchB?q=${encodeURIComponent(t)}` },
  { name: 'Reliance Digital',  color: '#e31837', getUrl: (t: string) => `https://www.reliancedigital.in/search?q=${encodeURIComponent(t)}` },
  { name: 'PlayStation Store', color: '#003087', getUrl: (t: string) => `https://store.playstation.com/en-in/search/${encodeURIComponent(t)}` },
];

export default function GamePage({ params }: { params: { slug: string } }) {
  const game = GAMES.find(g => g.slug === params.slug);
  if (!game) notFound();

  return (
    <main className="min-h-screen bg-theme-page text-theme-page">

      {/* Hero */}
      <div className={`relative h-[50vh] min-h-[320px] bg-gradient-to-br ${game.gradient} overflow-hidden`}>
        {/* Cover image */}
        {game.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.coverUrl}
            alt={game.title}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Back button */}
        <div className="absolute top-5 left-4">
          <Link
            href="/games"
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All Games
          </Link>
        </div>

        {/* Game info */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            {game.exclusive && (
              <span className="text-[9px] font-black uppercase tracking-widest bg-ps-neon-blue text-white px-2.5 py-1 rounded-full">
                PS5 Exclusive
              </span>
            )}
            {game.genre.map(g => (
              <span key={g} className="text-[9px] font-black uppercase tracking-widest bg-white/15 text-white px-2.5 py-1 rounded-full border border-white/20">
                {g}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-1">{game.title}</h1>
          <p className="text-sm text-white/60 font-bold">{game.developer} · {game.year}</p>
        </div>
      </div>

      {/* Content */}
      <section className="px-4 py-10 max-w-5xl mx-auto">

        {/* BETA notice */}
        <div className="mb-8 p-4 rounded-2xl bg-amber-500/8 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/25 px-2 py-0.5 rounded-full shrink-0 mt-0.5">Beta</span>
            <p className="text-sm text-theme-muted leading-relaxed">
              Live price tracking is coming soon. For now, use the store links below to check the latest prices directly. We&apos;ll alert you when price comparison goes live.
            </p>
          </div>
        </div>

        {/* Price comparison table */}
        <div className="mb-10">
          <h2 className="text-lg font-black uppercase tracking-tight text-theme-page mb-4">Check Prices</h2>
          <div className="space-y-3">
            {STORES.map(store => (
              <a
                key={store.name}
                href={store.getUrl(game.title)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 ps-card hover:border-ps-neon-blue/30 transition-all group"
              >
                {/* Store color dot */}
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: store.color }} />
                <span className="font-bold text-sm text-theme-page flex-1">{store.name}</span>
                <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mr-2 hidden sm:inline">
                  Live price soon
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-ps-neon-blue group-hover:translate-x-1 transition-transform">
                  Search <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={`https://www.amazon.in/s?k=${encodeURIComponent(game.title + ' PS5')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ps-button ps-button-primary w-full sm:w-auto inline-flex items-center gap-2 px-8 py-4 text-sm"
          >
            <ShoppingCart className="w-4 h-4" /> Buy on Amazon
          </a>
          <Link
            href="/tracker#subscribe"
            className="ps-button w-full sm:w-auto inline-flex px-8 py-4 text-sm bg-theme-card border border-theme-card text-theme-page hover:border-theme-nav transition-colors"
          >
            Get Price Drop Alert
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
