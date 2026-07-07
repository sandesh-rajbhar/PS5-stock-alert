import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';
import { fetchWithTimeout } from './fetchWithTimeout';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const PRODUCT_URLS = [
  'https://www.amazon.in/Sony-PlaysStation-Console-Storage-Capacity/dp/B0CWH9WCWT',
  'https://www.amazon.in/Sony-Ps5-Gaming-Console-Controllers/dp/B0DT9MQQC1',
  'https://www.amazon.in/Sony-PlayStation%C2%AE5-Digital-Edition-slim/dp/B0CY5QW186',
  'https://www.amazon.in/Sony-CFI-2008A01X-PlayStation%C2%AE5-Console-slim/dp/B0FNS22DLT',
  'https://www.amazon.in/Sony-CFI-2008A01X-PlayStation%C2%AE5-Console-slim/dp/B0CY5HVDS2',
  'https://www.amazon.in/Sony-PlayStation%C2%AE5-Console-Disc-Edition/dp/B0FF9NXYDL',
];

// Regex extraction instead of cheerio: PDP HTML is ~1MB and we only need a few
// anchored fragments, so full DOM parsing wastes CPU on serverless.
function extract(html: string, re: RegExp): string {
  return (html.match(re)?.[1] ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

interface CookieJar { map: Map<string, string> }

interface NodeFetchResponse { headers: { raw(): Record<string, string[]> } }

function storeCookies(jar: CookieJar, res: NodeFetchResponse) {
  const raw: string[] = res.headers.raw()['set-cookie'] || [];
  for (const c of raw) {
    const [kv] = c.split(';');
    const eq = kv.indexOf('=');
    if (eq < 1) continue;
    const key = kv.slice(0, eq).trim();
    const val = kv.slice(eq + 1);
    if (val && val !== '-' && val !== '""') jar.map.set(key, val);
  }
}

const cookieHeader = (jar: CookieJar) => [...jar.map.entries()].map(([k, v]) => `${k}=${v}`).join('; ');

export async function scrapeAmazon(pincode: string): Promise<ScrapeResult> {
  const baseHeaders = {
    'User-Agent': UA,
    'Accept-Language': 'en-IN,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };

  try {
    const jar: CookieJar = { map: new Map() };

    // Step 1: glow modal endpoint mints a session (homepage returns a bot page,
    // but this endpoint reliably sets session cookies).
    const modal = await fetchWithTimeout(
      'https://www.amazon.in/portal-migration/hz/glow/get-rendered-address-selections?deviceType=desktop&pageType=Gateway&storeContext=NoStoreName&actionSource=desktop-modal',
      { headers: { ...baseHeaders, 'X-Requested-With': 'XMLHttpRequest', 'Referer': 'https://www.amazon.in/' } },
      10000
    );
    storeCookies(jar, modal);

    // Step 2: bind the pincode to this session
    const addr = await fetchWithTimeout('https://www.amazon.in/gp/delivery/ajax/address-change.html', {
      method: 'POST',
      headers: {
        ...baseHeaders,
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Cookie': cookieHeader(jar),
        'x-requested-with': 'XMLHttpRequest',
        'Referer': 'https://www.amazon.in/',
        'Origin': 'https://www.amazon.in',
      },
      body: new URLSearchParams({
        locationType: 'LOCATION_INPUT',
        zipCode: pincode,
        storeContext: 'generic',
        deviceType: 'web',
        pageType: 'Gateway',
        actionSource: 'glow',
      }),
    }, 10000);
    storeCookies(jar, addr);

    let addressBound = false;
    try {
      const addrJson = await addr.json();
      addressBound = addrJson?.isAddressUpdated === 1;
    } catch { /* non-JSON means bot wall; PDP glow check below still guards us */ }

    const cookies = cookieHeader(jar);

    const fetchPromises = PRODUCT_URLS.map(async (url, index) => {
      try {
        await new Promise(r => setTimeout(r, index * 250));

        const response = await fetchWithTimeout(url, {
          headers: { ...baseHeaders, 'Cookie': cookies },
        }, 15000);

        if (!response.ok) return null;
        const html: string = await response.text();

        // Captcha / bot interstitial
        if (html.includes('api-services-support@amazon.com')) return null;

        const title = extract(html, /id="productTitle"[^>]*>([\s\S]{1,400}?)<\/span>/);
        if (!title) return null;

        // Guard: if the delivery location widget doesn't show our pincode, the
        // page reflects national stock, not this pincode — don't trust it.
        const glow = extract(html, /id="glow-ingress-line2"[^>]*>([\s\S]{1,200}?)<\/span>/);
        const pincodeApplied = glow.includes(pincode);
        if (addressBound && !pincodeApplied) return null;

        const availability = extract(html, /id="availability"[^>]*>[\s\S]{0,200}?<span[^>]*>([\s\S]{1,300}?)<\/span>/).toLowerCase();
        const addToCart = html.includes('id="add-to-cart-button"') || html.includes('name="submit.add-to-cart"');
        const buyNow = html.includes('id="buy-now-button"') || html.includes('name="submit.buy-now"');
        const outOfStockDiv = html.includes('id="outOfStock"');

        // Note: check "unavailable" BEFORE "available" — "currently unavailable"
        // contains the substring "available".
        const saysUnavailable =
          availability.includes('unavailable') ||
          availability.includes('out of stock') ||
          availability.includes('cannot be delivered') ||
          availability.includes('not deliverable');
        const saysInStock = !saysUnavailable && (availability.includes('in stock') || availability.includes('available'));

        let isOutOfStock: boolean;
        if (outOfStockDiv || saysUnavailable) {
          isOutOfStock = true;
        } else if ((addToCart || buyNow) && saysInStock) {
          isOutOfStock = false;
        } else if (addToCart || buyNow) {
          // Buttons present but availability text missing — treat as in stock
          // only when the pincode was verified as applied.
          isOutOfStock = !pincodeApplied;
        } else {
          isOutOfStock = true;
        }

        let price = '';
        if (!isOutOfStock) {
          // Search near the buybox/core price block first, then fall back.
          const coreIdx = html.search(/id="corePrice|id="apex_desktop/);
          const region = coreIdx > -1 ? html.slice(coreIdx, coreIdx + 5000) : html;
          const m = region.match(/class="a-offscreen">\s*(₹[\d,]+(?:\.\d+)?)/) || html.match(/id="priceblock_(?:our|deal)price"[^>]*>\s*(₹[\d,]+(?:\.\d+)?)/);
          if (m) price = m[1].replace(/\s+/g, '');
        }

        return { title, url, price: price || null, isOutOfStock };
      } catch {
        return null;
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    const availableItems: ScrapeResult['items'] = [];
    let bestMatch: { title: string; url: string; price: string | null; isOutOfStock: boolean } | null = null;

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const item = result.value;
        if (!item.isOutOfStock && item.price) {
          availableItems.push({ name: item.title, url: item.url, price: item.price, inStock: true });
          if (!bestMatch || bestMatch.isOutOfStock) bestMatch = item;
        } else if (!bestMatch) {
          bestMatch = item;
        }
      }
    }

    if (!bestMatch) {
      return {
        inStock: false,
        price: null,
        productUrl: PRODUCT_URLS[0],
        productName: nameFromUrl(PRODUCT_URLS[0]),
        listingCount: PRODUCT_URLS.length,
        items: [],
        error: true, // every page failed (blocked or pincode not applied) — unknown, not "no stock"
        note: 'Amazon check could not be verified for this pincode',
      };
    }

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl: bestMatch.url,
      productName: bestMatch.title,
      listingCount: PRODUCT_URLS.length,
      items: availableItems,
    };
  } catch (error) {
    console.error('Amazon localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: PRODUCT_URLS[0],
      productName: nameFromUrl(PRODUCT_URLS[0]),
      listingCount: PRODUCT_URLS.length,
      error: true,
    };
  }
}
