import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';

const PRODUCTS = [
  { id: 'BDFUT1SDIF', slug: 'sony-ps5-1tb-slim-cd-version-single-controller-console' },
];

const BASE_URL = 'https://www.swiggy.com';

function buildHeaders(lat: number, lng: number) {
  const userLocation = encodeURIComponent(JSON.stringify({ lat, lng }));
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
    'Referer': 'https://www.swiggy.com/instamart',
    'Cookie': [
      `userLocation=${userLocation}`,
      `_guest_tid=${Math.random().toString(36).slice(2)}`,
      `lat=${lat}`,
      `lng=${lng}`,
    ].join('; '),
  };
}

async function fetchProduct(id: string, slug: string, lat: number, lng: number) {
  const url = `${BASE_URL}/instamart/p/${slug}-${id}`;
  try {
    const res = await fetch(url, { headers: buildHeaders(lat, lng), redirect: 'follow' });
    if (!res.ok) {
      console.warn(`[instamart] ${id} status=${res.status}`);
      return null;
    }
    const html = await res.text();
    console.log(`[instamart] ${id} status=${res.status} bytes=${html.length}`);
    const $ = cheerio.load(html);

    let inStock = false;
    let price: string | null = null;
    let name = '';
    let unserviceable = false;

    // Swiggy embeds state in window.___INITIAL_STATE___
    const initialState = html.match(/window\.___INITIAL_STATE___\s*=\s*({[\s\S]*?});\s*<\/script>/);
    if (initialState) {
      try {
        const parsed = JSON.parse(initialState[1]);
        const instamart = parsed?.instamart || {};
        const product = instamart.productDetails?.product || instamart.product || {};
        name = product.display_name || product.name || product.product_name || '';
        const variant = product.variations?.[0] || product;
        const priceRaw = variant.price?.mrp || variant.mrp || variant.price?.store_price || variant.store_price;
        if (priceRaw) price = '₹' + String(priceRaw).replace(/[^\d.]/g, '');
        const available = variant.inventory?.in_stock ?? variant.in_stock ?? !variant.out_of_stock;
        unserviceable = instamart.unserviceable ?? instamart.locationServiceability?.unserviceable ?? false;
        inStock = Boolean(available) && !unserviceable;
      } catch {}
    }

    if (!name) name = $('h1').first().text().trim() || nameFromUrl(url);
    if (!price) {
      const m = html.match(/₹\s*[\d,]+/);
      if (m) price = m[0].replace(/\s+/g, '');
    }
    const lower = html.toLowerCase();
    if (lower.includes('not available in your area') || lower.includes('not serviceable') || lower.includes('change location')) {
      unserviceable = true;
      inStock = false;
    }
    if (!inStock && !unserviceable) {
      const hasOos = /sold\s*out|out of stock|notify me/i.test(html);
      const hasAdd = /add\s*to\s*cart|"ADD"/i.test(html);
      inStock = hasAdd && !hasOos;
    }

    return { url, name, price, inStock, unserviceable };
  } catch {
    return null;
  }
}

export async function scrapeInstamart(lat: number, lng: number): Promise<ScrapeResult> {
  try {
    const results = await Promise.allSettled(
      PRODUCTS.map((p, i) =>
        new Promise<ReturnType<typeof fetchProduct>>(resolve =>
          setTimeout(() => resolve(fetchProduct(p.id, p.slug, lat, lng)), i * 200)
        ).then(r => r)
      )
    );

    let best: { url: string; name: string; price: string | null; inStock: boolean; unserviceable: boolean } | null = null;
    let allUnserviceable = true;
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        const v = r.value;
        if (!v.unserviceable) allUnserviceable = false;
        if (v.inStock && v.price) { best = v; break; }
        if (!best) best = v;
      }
    }

    const fallbackUrl = `${BASE_URL}/instamart/p/${PRODUCTS[0].slug}-${PRODUCTS[0].id}`;

    if (!best) {
      return {
        inStock: false,
        price: null,
        productUrl: fallbackUrl,
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
    console.error('Instamart scrape error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: `${BASE_URL}/instamart/p/${PRODUCTS[0].slug}-${PRODUCTS[0].id}`,
      productName: 'PS5 Console',
      listingCount: PRODUCTS.length,
      error: true,
    };
  }
}
