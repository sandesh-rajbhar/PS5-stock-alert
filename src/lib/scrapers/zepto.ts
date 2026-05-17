import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';

const PRODUCTS = [
  { pvid: 'ad968d7d-c5d8-415e-b7d4-58f84ff13076', slug: 'sony-playstation-5-gaming-console-slim' },
  { pvid: '4dd0b8da-d86d-4d40-8ab9-8413ebeec4df', slug: 'sony-playstation-5-digital-edition-gaming-console-slim' },
];

const BASE_URL = 'https://www.zepto.com';

function buildHeaders(lat: number, lng: number) {
  return {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
    'Referer': 'https://www.zepto.com/',
    // Zepto location cookies (best-effort, schema may evolve)
    'Cookie': [
      `user_lat=${lat}`,
      `user_lng=${lng}`,
      `latitude=${lat}`,
      `longitude=${lng}`,
    ].join('; '),
    'x-latitude': String(lat),
    'x-longitude': String(lng),
  };
}

async function fetchProduct(pvid: string, slug: string, lat: number, lng: number) {
  const url = `${BASE_URL}/pn/${slug}/pvid/${pvid}`;
  try {
    const res = await fetch(url, { headers: buildHeaders(lat, lng), redirect: 'follow' });
    if (!res.ok) {
      console.warn(`[zepto] ${pvid} status=${res.status}`);
      return null;
    }
    const html = await res.text();
    console.log(`[zepto] ${pvid} status=${res.status} bytes=${html.length}`);
    const $ = cheerio.load(html);

    let inStock = false;
    let price: string | null = null;
    let name = '';
    let unserviceable = false;

    const nextData = $('#__NEXT_DATA__').html();
    if (nextData) {
      try {
        const parsed = JSON.parse(nextData);
        const pp = parsed?.props?.pageProps || {};
        const product = pp.product || pp.productData || pp.productDetails || {};
        name = product.name || product.productName || '';
        const priceRaw = product.mrp || product.sellingPrice || product.price?.mrp || product.price?.sellingPrice;
        if (priceRaw) price = '₹' + String(priceRaw).replace(/[^\d.]/g, '');
        const stockQty = product.availableQuantity ?? product.inventory ?? product.stock;
        const outOfStock = product.outOfStock ?? product.isOutOfStock ?? false;
        unserviceable = pp.unserviceable ?? pp.storeNotFound ?? false;
        inStock = !outOfStock && !unserviceable && (typeof stockQty === 'number' ? stockQty > 0 : true);
      } catch {}
    }

    if (!name) name = $('h1').first().text().trim() || nameFromUrl(url);
    if (!price) {
      const m = html.match(/₹\s*[\d,]+/);
      if (m) price = m[0].replace(/\s+/g, '');
    }
    const lower = html.toLowerCase();
    if (lower.includes('not deliverable') || lower.includes('not serviceable') || lower.includes('outside delivery')) {
      unserviceable = true;
      inStock = false;
    }
    if (!inStock && !unserviceable) {
      const hasOos = /sold\s*out|out of stock|notify me/i.test(html);
      const hasAdd = /add\s*to\s*cart/i.test(html);
      inStock = hasAdd && !hasOos;
    }

    return { url, name, price, inStock, unserviceable };
  } catch {
    return null;
  }
}

export async function scrapeZepto(lat: number, lng: number): Promise<ScrapeResult> {
  try {
    const results = await Promise.allSettled(
      PRODUCTS.map((p, i) =>
        new Promise<ReturnType<typeof fetchProduct>>(resolve =>
          setTimeout(() => resolve(fetchProduct(p.pvid, p.slug, lat, lng)), i * 200)
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

    if (!best) {
      return {
        inStock: false,
        price: null,
        productUrl: `${BASE_URL}/pn/${PRODUCTS[0].slug}/pvid/${PRODUCTS[0].pvid}`,
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
    console.error('Zepto scrape error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: `${BASE_URL}/pn/${PRODUCTS[0].slug}/pvid/${PRODUCTS[0].pvid}`,
      productName: 'PS5 Console',
      listingCount: PRODUCTS.length,
      error: true,
    };
  }
}
