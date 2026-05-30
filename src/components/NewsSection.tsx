'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Newspaper, ArrowRight } from 'lucide-react';
import type { NewsItem } from '@/app/api/news/route';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function SkeletonCard() {
  return (
    <div className="ps-card overflow-hidden animate-pulse">
      <div className="h-40 bg-theme-card" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-20 bg-theme-card rounded" />
        <div className="h-4 bg-theme-card rounded" />
        <div className="h-4 w-3/4 bg-theme-card rounded" />
        <div className="h-3 w-full bg-theme-card rounded mt-2" />
        <div className="h-3 w-2/3 bg-theme-card rounded" />
      </div>
    </div>
  );
}

export default function NewsSection() {
  const [items, setItems]   = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(data => { setItems((data as NewsItem[]).slice(0, 6)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Newspaper className="w-4 h-4 text-ps-neon-blue" />
              <p className="text-[10px] font-black text-ps-neon-blue uppercase tracking-widest">Latest</p>
            </div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-theme-page">
              PS5 News
            </h2>
            <p className="text-xs font-bold text-theme-faint uppercase tracking-widest mt-1">
              From Push Square, PlayStation Blog &amp; VGC
            </p>
          </div>
          <Link
            href="/news"
            className="shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-ps-neon-blue hover:underline"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <p className="text-theme-faint text-sm font-medium text-center py-10">
            Could not load news right now.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ps-card overflow-hidden flex flex-col group cursor-pointer"
              >
                {/* Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-theme-card">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-10 h-10 text-theme-faint opacity-30" />
                    </div>
                  )}
                  {/* Source badge */}
                  <span
                    className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: item.sourceColor }}
                  >
                    {item.source}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-black text-theme-page leading-snug line-clamp-2 group-hover:text-ps-neon-blue transition-colors">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-theme-muted mt-2 line-clamp-2 leading-relaxed flex-1">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold text-theme-faint uppercase tracking-widest">
                      {item.pubDate ? timeAgo(item.pubDate) : ''}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-theme-faint group-hover:text-ps-neon-blue transition-colors" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
