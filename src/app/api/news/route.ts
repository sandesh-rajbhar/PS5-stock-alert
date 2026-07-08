import { NextResponse } from 'next/server';

export const revalidate = 3600; // ISR — refetch at most once per hour

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image: string | null;
  source: string;
  sourceColor: string;
}

function cdata(s: string): string {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
};

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m);
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'));
  return m ? cdata(m[1]).trim() : '';
}

function attr(xml: string, tagName: string, attrName: string): string {
  const m = xml.match(new RegExp(`<${tagName}[^>]*\\s${attrName}="([^"]*)"`, 'i'));
  return m ? m[1] : '';
}

function parseItems(xml: string, source: string, sourceColor: string): NewsItem[] {
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
  return blocks.slice(0, 6).flatMap((block): NewsItem[] => {
    const title = decodeEntities(tag(block, 'title'));
    const link  = tag(block, 'link') || attr(block, 'link', 'href');
    if (!title || !link) return [];

    const pubDate     = tag(block, 'pubDate');
    const rawDesc     = tag(block, 'description');
    const description = decodeEntities(rawDesc.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim().slice(0, 160);

    // image: enclosure → media:content → media:thumbnail → first <img> in body
    const image: string | null =
      attr(block, 'enclosure', 'url')        ||
      attr(block, 'media:content', 'url')    ||
      attr(block, 'media:thumbnail', 'url')  ||
      (() => { const m = block.match(/<img[^>]+src="([^"]+)"/i); return m ? m[1] : null; })() ||
      null;

    return [{ title, link, pubDate, description, image, source, sourceColor }];
  });
}

// Sources must allow cross-site image embedding: Push Square and VGC were
// dropped because their Cloudflare hotlink protection 403s embedded images.
const FEEDS = [
  { url: 'https://www.ign.com/rss/articles/feed?tags=playstation', name: 'IGN',              color: '#dc2626' },
  { url: 'https://blog.playstation.com/feed/',                     name: 'PlayStation Blog', color: '#0070ff' },
  { url: 'https://kotaku.com/tag/playstation-5/rss',               name: 'Kotaku',           color: '#eab308' },
];

export async function GET() {
  const settled = await Promise.allSettled(
    FEEDS.map(async ({ url, name, color }) => {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PSDeals-bot/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [] as NewsItem[];
      const xml = await res.text();
      return parseItems(xml, name, color);
    })
  );

  const items = settled
    .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, 12);

  return NextResponse.json(items, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' },
  });
}
