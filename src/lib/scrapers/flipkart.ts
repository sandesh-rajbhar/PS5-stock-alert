import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';
import { fetchWithTimeout } from './fetchWithTimeout';

interface ScrapeOpts {
  maxUrls?: number;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const ALL_PRODUCT_URLS = [
  'https://www.flipkart.com/sony-ps5-console-digital-slim-cfi-2008b01-1-tb-call-duty-black-ops6/p/itma157fd7ec92e6',
  'https://www.flipkart.com/sony-ps5-console-digital-slim-cfi-2008b01-1024-gb/p/itmcabcf14108133',
  'https://www.flipkart.com/sony-ps5-console-disc-slim-cfi-2008a01-1-tb-call-duty-black-ops6/p/itmab060bd6d0c5f',
  'https://www.flipkart.com/sony-ps5-standard-astro-bot-bundle-slim-1000-gb-full-game/p/itmd11e32031893c',
  'https://www.flipkart.com/sony-ps5-digital-astro-bot-bundle-slim-1000-gb-full-game/p/itm098413eda0a77',
  'https://www.flipkart.com/sony-ps5-digital-ea-sports-fc-26-bundle-cfi-2008b01-1024-gb-full-game-voucher-astros-playroom/p/itma655a8c6aa151',
  'https://www.flipkart.com/sony-ps5-console-disc-fortnite-bundle-slim-1-tb-yes/p/itma8f2dd1b539f1',
  'https://www.flipkart.com/sony-ps5-console-disc-slim-cfi-2008a01-1024-gb-nba-2k26/p/itm9e65cbc8e37d4',
  'https://www.flipkart.com/sony-ps5-digital-30th-anniv-limited-edition-slim-cfi-2008b30x-1024-gb/p/itm8cd9cce03e5df',
  'https://www.flipkart.com/sony-ps5-console-disc-slim-ps5-cfi-2008a01-1-tb/p/itmdb538afe986e8',
  'https://www.flipkart.com/sony-ps5-console-digital-fortnite-bundle-slim-1-tb-yes/p/itm1660d204e39f8',
  'https://www.flipkart.com/sony-cfi-2008a01-1024-gb-ea-sports-fc-26-full-game-voucher-astros-playroom/p/itm0ac20e91053e3',
  'https://www.flipkart.com/sony-playstation5-digital-edition-slim-cfi-2008b01x-cfi-2116b01y-1-tb/p/itm6b0a91231fb2f',
  'https://www.flipkart.com/sony-playstation5-console-slim-cfi-2008a01x-cfi-2116a01y-1-tb/p/itm89489e2adcd2c',
];

// Deep-walk the rome page JSON collecting every object that carries listing
// availability. Flipkart nests these under varying slot paths, so walking is
// more robust than hardcoding a path.
function collectAvailability(node: unknown, out: { availabilityStatus?: string; serviceable?: boolean }[]): void {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const item of node) collectAvailability(item, out);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (typeof obj.availabilityStatus === 'string') {
    out.push({
      availabilityStatus: obj.availabilityStatus as string,
      serviceable: typeof obj.serviceable === 'boolean' ? (obj.serviceable as boolean) : undefined,
    });
  }
  for (const key of Object.keys(obj)) collectAvailability(obj[key], out);
}

function findFirstString(text: string, re: RegExp): string | null {
  return text.match(re)?.[1] ?? null;
}

export async function scrapeFlipkart(pincode: string, opts: ScrapeOpts = {}): Promise<ScrapeResult> {
  const productUrls = opts.maxUrls ? ALL_PRODUCT_URLS.slice(0, opts.maxUrls) : ALL_PRODUCT_URLS;

  try {
    const availableItems: ScrapeResult['items'] = [];
    let bestMatch: { title: string; url: string; price: string | null; isOutOfStock: boolean } | null = null;
    let blockedCount = 0;

    const fetchPromises = productUrls.map(async (url, index) => {
      try {
        await new Promise(r => setTimeout(r, index * 300));

        const pageUri = new URL(url).pathname;
        const response = await fetchWithTimeout('https://1.rome.api.flipkart.com/api/4/page/fetch', {
          method: 'POST',
          headers: {
            'User-Agent': UA,
            'Content-Type': 'application/json',
            'X-User-Agent': `${UA} FKUA/website/42/website/Desktop`,
            'Origin': 'https://www.flipkart.com',
            'Referer': 'https://www.flipkart.com/',
            'Accept': '*/*',
          },
          body: JSON.stringify({
            pageUri,
            pageContext: { fetchSeoData: false, paginatedFetch: false },
            locationContext: { pincode },
          }),
        }, 15000);

        if (!response.ok) {
          if (response.status === 403 || response.status === 429) blockedCount++;
          return;
        }

        const text: string = await response.text();
        if (text.trimStart().startsWith('<')) { blockedCount++; return; }

        const data = JSON.parse(text);
        const listings: { availabilityStatus?: string; serviceable?: boolean }[] = [];
        collectAvailability(data, listings);
        if (listings.length === 0) return;

        // In stock for this pincode only if some listing is IN_STOCK and not
        // explicitly unserviceable.
        const inStock = listings.some(
          l => l.availabilityStatus === 'IN_STOCK' && l.serviceable !== false
        );

        const title = findFirstString(text, /"title"\s*:\s*"((?:[^"\\]|\\.){10,300}?)"/)?.replace(/\\"/g, '"') || nameFromUrl(url);
        const priceValue = findFirstString(text, /"finalPrice"\s*:\s*\{[^{}]*?"value"\s*:\s*(\d+)/)
          || findFirstString(text, /"price"\s*:\s*\{[^{}]*?"value"\s*:\s*(\d+)/);
        const price = priceValue ? `₹${Number(priceValue).toLocaleString('en-IN')}` : null;

        const item = { title, url, price, isOutOfStock: !inStock };

        if (!item.isOutOfStock && item.price) {
          availableItems!.push({ name: item.title, url: item.url, price: item.price, inStock: true });
        }
        if (!bestMatch || (bestMatch.isOutOfStock && !item.isOutOfStock)) {
          bestMatch = item;
        }
      } catch {
        // ignore individual product failures
      }
    });

    await Promise.allSettled(fetchPromises);

    if (!bestMatch) {
      const blocked = blockedCount > 0;
      return {
        inStock: false,
        price: null,
        productUrl: productUrls[0],
        productName: nameFromUrl(productUrls[0]),
        listingCount: productUrls.length,
        items: [],
        error: blocked,
        note: blocked ? 'Flipkart blocked the check — status unknown' : undefined,
      };
    }

    const match: { title: string; url: string; price: string | null; isOutOfStock: boolean } = bestMatch;
    return {
      inStock: !match.isOutOfStock,
      price: match.price,
      productUrl: match.url,
      productName: match.title,
      listingCount: productUrls.length,
      items: availableItems,
    };
  } catch (error) {
    console.error('Flipkart localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: productUrls[0],
      productName: nameFromUrl(productUrls[0]),
      listingCount: productUrls.length,
      error: true,
    };
  }
}
