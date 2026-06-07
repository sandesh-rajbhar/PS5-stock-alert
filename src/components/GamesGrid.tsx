'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, ExternalLink } from 'lucide-react';
import { GAMES, GENRES, type Genre, type Game } from '@/data/games';

function GameCard({ game, large = false }: { game: Game; large?: boolean }) {
  const [imgError, setImgError] = useState(false);
  const amazonUrl   = `https://www.amazon.in/s?k=${encodeURIComponent(game.title + ' PS5')}`;
  const flipkartUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(game.title + ' PS5')}`;
  const showImg     = !!game.coverUrl && !imgError;

  return (
    <Link href={`/games/${game.slug}`} className="ps-card overflow-hidden flex flex-col group cursor-pointer">
      {/* Cover */}
      <div className={`relative ${large ? 'h-48 sm:h-56' : 'h-36 sm:h-40'} overflow-hidden`}>
        {/* Gradient always present as base */}
        <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient}`} />
        {/* Cover image on top */}
        {game.coverUrl && (
          <img
            src={game.coverUrl}
            alt={game.title}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${showImg ? 'opacity-100' : 'opacity-0'}`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {game.exclusive && (
            <span className="text-[8px] font-black uppercase tracking-widest bg-ps-neon-blue text-white px-2 py-0.5 rounded-full">
              PS5 Only
            </span>
          )}
          {game.trending && (
            <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">
              Trending
            </span>
          )}
        </div>

        {/* Title overlay at bottom */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-0.5">{game.genre[0]}</p>
          <h3 className={`font-black text-white leading-tight line-clamp-2 ${large ? 'text-base sm:text-lg' : 'text-sm'}`}>
            {game.title}
          </h3>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center gap-2 mt-auto" onClick={e => e.preventDefault()}>
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-[10px] font-black uppercase tracking-widest py-2 rounded-lg bg-theme-card border border-theme-card text-theme-muted hover:text-theme-page hover:border-theme-nav transition-colors"
        >
          Amazon
        </a>
        <a
          href={flipkartUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-[10px] font-black uppercase tracking-widest py-2 rounded-lg bg-theme-card border border-theme-card text-theme-muted hover:text-theme-page hover:border-theme-nav transition-colors"
        >
          Flipkart
        </a>
      </div>
    </Link>
  );
}

export default function GamesGrid() {
  const [query, setQuery]   = useState('');
  const [genre, setGenre]   = useState<Genre>('All');

  const trending = useMemo(() => GAMES.filter(g => g.trending), []);

  const filtered = useMemo(() => {
    let list = genre === 'All' ? GAMES : GAMES.filter(g => g.genre.includes(genre));
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(g => g.title.toLowerCase().includes(q) || g.developer.toLowerCase().includes(q));
    }
    return list;
  }, [query, genre]);

  const showTrending = !query.trim() && genre === 'All';

  return (
    <div>
      {/* Search + Genre filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-faint" />
          <input
            type="text"
            placeholder="Search PS5 games..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-theme-input border border-theme-input text-theme-input placeholder-zinc-400 dark:placeholder-zinc-500 text-sm font-medium outline-none focus:border-ps-neon-blue/50 transition-colors"
          />
        </div>
      </div>

      {/* Genre pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {GENRES.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border
              ${genre === g
                ? 'bg-ps-neon-blue text-white border-ps-neon-blue'
                : 'text-theme-muted border-theme-divider hover:text-theme-page bg-theme-card'
              }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Trending section */}
      {showTrending && (
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ps-neon-blue opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ps-neon-blue" />
            </span>
            <h2 className="text-sm font-black uppercase tracking-widest text-theme-page">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trending.map(game => (
              <GameCard key={game.slug} game={game} large />
            ))}
          </div>
        </div>
      )}

      {/* All games */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-widest text-theme-page">
          {query || genre !== 'All' ? `Results (${filtered.length})` : 'All Games'}
        </h2>
        <span className="text-[10px] font-bold text-theme-faint uppercase tracking-widest">
          {filtered.length} titles
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-theme-faint">
          {query.trim() ? (
            <p className="font-bold text-sm">No PS5 games found for &quot;{query}&quot;</p>
          ) : (
            <p className="font-bold text-sm">No games in this genre yet.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(game => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
