import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';

// Blinkit PS5 product IDs (path: /prn/<slug>/prid/<id>)
const PRODUCTS = [
  { id: '547909', slug: 'sony-ps5-standard-standalone-console-white' },
  { id: '547392', slug: 'sony-ps5-console-slim' },
  { id: '547393', slug: 'playstation-ps5-digital-edition-gaming-console-slim-white' },
  { id: '686032', slug: 'playstation-ps5-console-gaming-console-disc-edition-call-of-duty-bundle-white' },
  { id: '686327', slug: 'playstation-ps5-gaming-console-digital-edition-call-of-duty-bundle-white' },
];

const BASE_URL = 'https://blinkit.com';

function buildHeaders(lat: number, lng: number, cookieExtra = '') {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
    'Referer': 'https://blinkit.com/',
    'Cookie': [
      `gr_1_lat=${lat}`,
      `gr_1_lon=${lng}`,
      `gr_1_locality=1`,
      `gr_1_landmark=`,
      cookieExtra,
    ].filter(Boolean).join('; '),
  };
}

async function fetchProduct(productId: string, slug: string, lat: number, lng: number) {
  const url = `${BASE_URL}/prn/${slug}/prid/${productId}`;
  try {
    const res = await fetch(url, { headers: buildHeaders(lat, lng), redirect: 'follow' });
    if (!res.ok) {
      console.warn(`[blinkit] ${productId} status=${res.status}`);
      return null;
    }
    const html = await res.text();
    console.log(`[blinkit] ${productId} status=${res.status} bytes=${html.length}`);
    const $ = cheerio.load(html);

    // Blinkit embeds product state in __NEXT_DATA__
    const nextData = $('#__NEXT_DATA__').html();
    let inStock = false;
    let price: string | null = null;
    let name = '';

    if (nextData) {
      try {
        const parsed = JSON.parse(nextData);
        const pageProps = parsed?.props?.pageProps || {};
        // Schema not fully documented — probe known shapes
        const product = pageProps.product || pageProps.productData || pageProps.initialProduct || {};
        name = product.name || product.title || product.product_name || '';
        const inv = product.inventory ?? product.inventory_quantity ?? product.stock ?? null;
        const unserviceable = product.unserviceable ?? pageProps.unserviceable ?? false;
        const priceRaw = product.mrp || product.price || product.normal_price || product.sale_price || null;
        if (priceRaw) price = '₹' + String(priceRaw).replace(/[^\d.]/g, '');
        inStock = !unserviceable && (typeof inv === 'number' ? inv > 0 : Boolean(inv));
      } catch {
        // fall through to DOM scrape
      }
    }

    // Fallback: DOM signals
    if (!name) name = $('h1').first().text().trim() || nameFromUrl(url);
    if (!price) {
      const priceText = $('[class*="Price"]').first().text() || $('body').text();
      const m = priceText.match(/₹\s*[\d,]+/);
      if (m) price = m[0].replace(/\s+/g, '');
    }
    if (!inStock) {
      const bodyText = html.toLowerCase();
      const oosSignals = ['notify me', 'out of stock', 'not available', 'unserviceable', 'currently unavailable'];
      const hasOos = oosSignals.some(s => bodyText.includes(s));
      const hasAdd = /add\s*to\s*cart|"add"/i.test(html);
      inStock = hasAdd && !hasOos;
    }

    return { url, name, price, inStock };
  } catch {
    return null;
  }
}

export async function scrapeBlinkit(lat: number, lng: number): Promise<ScrapeResult> {
  try {
    const results = await Promise.allSettled(
      PRODUCTS.map((p, i) =>
        new Promise<ReturnType<typeof fetchProduct>>(resolve =>
          setTimeout(() => resolve(fetchProduct(p.id, p.slug, lat, lng)), i * 200)
        ).then(r => r)
      )
    );

    let best: { url: string; name: string; price: string | null; inStock: boolean } | null = null;
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        const v = r.value;
        if (v.inStock && v.price) { best = v; break; }
        if (!best) best = v;
      }
    }

    if (!best) {
      return {
        inStock: false,
        price: null,
        productUrl: `${BASE_URL}/prn/${PRODUCTS[0].slug}/prid/${PRODUCTS[0].id}`,
        productName: 'PS5 Console',
        listingCount: PRODUCTS.length,
        note: 'Not serviceable at current location',
      };
    }

    return {
      inStock: best.inStock,
      price: best.price,
      productUrl: best.url,
      productName: best.name || nameFromUrl(best.url),
      listingCount: PRODUCTS.length,
      note: best.inStock ? undefined : 'Not serviceable at current location',
    };
  } catch (error) {
    console.error('Blinkit scrape error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: `${BASE_URL}/prn/${PRODUCTS[0].slug}/prid/${PRODUCTS[0].id}`,
      productName: 'PS5 Console',
      listingCount: PRODUCTS.length,
      error: true,
    };
  }
}
