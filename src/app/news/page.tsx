'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';
import Footer from '@/components/Footer';
import type { NewsItem } from '@/app/api/news/route';

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SOURCES = ['All', 'IGN', 'PlayStation Blog', 'Kotaku'] as const;
type Source = typeof SOURCES[number];

const SOURCE_COLORS: Record<string, string> = {
  'IGN':              '#dc2626',
  'PlayStation Blog': '#0070ff',
  'Kotaku':           '#eab308',
};

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <div className={`ps-card overflow-hidden animate-pulse ${featured ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
      <div className={`bg-theme-card ${featured ? 'h-64' : 'h-44'}`} />
      <div className="p-5 space-y-3">
        <div className="h-3 w-24 bg-theme-card rounded" />
        <div className="h-5 bg-theme-card rounded" />
        <div className="h-5 w-4/5 bg-theme-card rounded" />
        <div className="h-3 w-full bg-theme-card rounded mt-2" />
        <div className="h-3 w-2/3 bg-theme-card rounded" />
      </div>
    </div>
  );
}

function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  const color = SOURCE_COLORS[item.source] ?? '#0070ff';
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`ps-card overflow-hidden flex flex-col group cursor-pointer ${featured ? 'sm:col-span-2 lg:col-span-3' : ''}`}
    >
      {/* Thumbnail */}
      <div className={`relative overflow-hidden bg-theme-card shrink-0 ${featured ? 'h-48 sm:h-64 lg:h-72' : 'h-40 sm:h-44'}`}>
        {/* Branded fallback layer — shown when there's no image or it fails to load. */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${color}33 0%, transparent 70%)` }}
        >
          <Newspaper className="w-12 h-12 opacity-25" style={{ color }} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color }}>
            {item.source}
          </span>
        </div>
        {item.image && (
          <img
            src={item.image}
            alt={item.title}
            className="relative w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        {/* source badge */}
        <span
          className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full text-white shadow"
          style={{ backgroundColor: color }}
        >
          {item.source}
        </span>
        {featured && (
          <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-black/60 text-white border border-white/10">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className={`font-black text-theme-page leading-snug group-hover:text-ps-neon-blue transition-colors line-clamp-2 ${featured ? 'text-lg sm:text-xl' : 'text-sm'}`}
        >
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-theme-muted mt-2 leading-relaxed line-clamp-3 flex-1">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-theme-divider">
          <span className="text-[10px] font-bold text-theme-faint uppercase tracking-widest">
            {timeAgo(item.pubDate)}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-theme-faint group-hover:text-ps-neon-blue transition-colors">
            Read <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </div>
    </a>
  );
}

export default function NewsPage() {
  const [all, setAll]         = useState<NewsItem[]>([]);
  const [filter, setFilter]   = useState<Source>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (bust = false) => {
    const url = bust ? `/api/news?t=${Date.now()}` : '/api/news';
    const data = await fetch(url).then(r => r.json()).catch(() => []);
    setAll(data);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const filtered = filter === 'All' ? all : all.filter(i => i.source === filter);
  const [featured, ...rest] = filtered;

  return (
    <main className="min-h-screen bg-theme-page text-theme-page">

      {/* Page header */}
      <section className="relative px-4 py-14 md:py-20 text-center overflow-hidden">
        <div className="hero-glow absolute inset-0 pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-ps-neon-blue" />
            <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-[0.2em]">PS5 News Hub</p>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] text-theme-page mb-4">
            Stay in the Loop.
          </h1>
          <p className="text-theme-muted text-base leading-relaxed max-w-xl mx-auto">
            Aggregated PS5 news from IGN, PlayStation Blog, and Kotaku — updated every hour.
          </p>
        </div>
      </section>

      {/* Filters + refresh */}
      <div className="sticky top-[57px] z-40 bg-theme-nav backdrop-blur-md border-b border-theme-nav px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Source filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {SOURCES.map(src => {
              const active = filter === src;
              const color = src !== 'All' ? SOURCE_COLORS[src] : undefined;
              return (
                <button
                  key={src}
                  onClick={() => setFilter(src)}
                  className={`shrink-0 px-3 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border min-h-[36px]
                    ${active
                      ? 'text-white border-transparent'
                      : 'text-theme-muted border-theme-nav hover:text-theme-page bg-theme-card'
                    }`}
                  style={active ? { backgroundColor: color ?? '#0070ff', borderColor: color ?? '#0070ff' } : {}}
                >
                  {src}
                </button>
              );
            })}
          </div>

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={refreshing}
            className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-theme-faint hover:text-theme-page transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      <section className="px-4 py-12 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard featured />
            {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-theme-faint opacity-30 mx-auto mb-4" />
            <p className="text-theme-muted font-bold">No articles found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured && <NewsCard item={featured} featured />}
            {rest.map((item, i) => <NewsCard key={i} item={item} />)}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
