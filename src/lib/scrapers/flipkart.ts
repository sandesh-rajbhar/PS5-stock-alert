import * as cheerio from 'cheerio';
import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';
import { fetchWithTimeout } from './fetchWithTimeout';

interface ScrapeOpts {
  maxUrls?: number;
}

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edge/120.0.0.0'
];


export async function scrapeFlipkart(pincode: string, opts: ScrapeOpts = {}): Promise<ScrapeResult> {
  const allProductUrls = [
    'https://www.flipkart.com/sony-playstation-5-console-gowr-vch-bundle-825-gb-yes/p/itm01fb765abae7a',
    'https://www.flipkart.com/sony-ps5-standard-dualsense-bundle-cfi-1208a01r-825gb-ssd-gb/p/itm73b71109455e7',
    'https://www.flipkart.com/sony-playstation-5-console-fc-24-825-gb-ea-sports-full-game-voucher/p/itm7b9c4acf55675',
    'https://www.flipkart.com/sony-playstation-5-console-modern-warfare-iii-825-gb-call-duty/p/itm0abb34c158d3d',
    'https://www.flipkart.com/sony-playstation-5-digital-825-gb-astro-s-playroom/p/itm3c6e8c91e0941',
    'https://www.flipkart.com/sony-ps5-digital-astro-bot-bundle-slim-1000-gb-full-game/p/itm098413eda0a77',
    'https://www.flipkart.com/sony-ps5-console-digital-slim-cfi-2008b01-1-tb-call-duty-black-ops6/p/itma157fd7ec92e6',
    'https://www.flipkart.com/sony-ps5-console-digital-slim-cfi-2008b01-1024-gb/p/itmcabcf14108133',
    'https://www.flipkart.com/sony-ps5-console-disc-slim-cfi-2008a01-1-tb-call-duty-black-ops6/p/itmab060bd6d0c5f',
    'https://www.flipkart.com/sony-ps5-standard-astro-bot-bundle-slim-1000-gb-full-game/p/itmd11e32031893c',
    'https://www.flipkart.com/sony-ps5-digital-ea-sports-fc-26-bundle-cfi-2008b01-1024-gb-full-game-voucher-astros-playroom/p/itma655a8c6aa151',
    'https://www.flipkart.com/sony-ps5-console-disc-fortnite-bundle-slim-1-tb-yes/p/itma8f2dd1b539f1',
    'https://www.flipkart.com/sony-ps5-console-disc-slim-cfi-2008a01-1024-gb-nba-2k26/p/itm9e65cbc8e37d4',
    'https://www.flipkart.com/sony-ps5-digital-30th-anniv-limited-edition-slim-cfi-2008b30x-1024-gb/p/itm8cd9cce03e5df',
    'https://www.flipkart.com/sony-ps5-console-disc-slim-ps5-cfi-2008a01-1-tb/p/itmdb538afe986e8',
    'https://www.flipkart.com/sony-ps5-console-digital-fortnite-bundle-slim-1-tb-yes/p/itm1660d204e39f8',
    'https://www.flipkart.com/sony-cfi-2008a01-1024-gb-ea-sports-fc-26-full-game-voucher-astros-playroom/p/itm0ac20e91053e3',
    'https://www.flipkart.com/sony-playstation5-digital-edition-slim-cfi-2008b01x-cfi-2116b01y-1-tb/p/itm6b0a91231fb2f',
    'https://www.flipkart.com/sony-playstation-5-console-825-gb/p/itm62f0f8b3c0bfb',
    'https://www.flipkart.com/sony-ps5-digital-cfi-2116b01y-825-gb/p/itm7124b7348127b',
    'https://www.flipkart.com/sony-playstation5-console-slim-cfi-2008a01x-cfi-2116a01y-1-tb/p/itm89489e2adcd2c'
  ];

  const productUrls = opts.maxUrls ? allProductUrls.slice(0, opts.maxUrls) : allProductUrls;

  try {
    const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    const baseHeaders = {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-IN,en;q=0.9',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'X-Requested-With': 'com.android.chrome',
    };

    const fetchWithRetry = async (url: string, headers: any): Promise<any> => {
      try {
        return await fetchWithTimeout(url, { headers }, 10000);
      } catch {
        return null;
      }
    };

    // Step 1: Initialize session
    const searchUrl = `https://www.flipkart.com/search?q=ps5+console&pincode=${pincode}`;
    const searchResponse = await fetchWithRetry(searchUrl, baseHeaders);
    
    let combinedCookies = `pincode=${pincode}`;
    if (searchResponse && searchResponse.ok) {
      const rawCookies = searchResponse.headers.raw()['set-cookie'] || [];
      const sessionCookies = rawCookies.map((c: string) => c.split(';')[0]).join('; ');
      combinedCookies = `${sessionCookies}; pincode=${pincode}`;
    }

    const availableItems: any[] = [];
    let bestMatch: any = null;
    const matchCount = productUrls.length;

    // STEP 2: Fetch products in PARALLEL with optimized delays
    const fetchPromises = productUrls.map(async (url, index) => {
      try {
        // Reduced jitter: 1s base + 0-3s random
        const jitter = Math.floor(Math.random() * 3000);
        await new Promise(r => setTimeout(r, 1000 + jitter));

        const response = await fetchWithRetry(url, {
          ...baseHeaders,
          'Referer': searchUrl,
          'Cookie': combinedCookies,
          'Sec-Fetch-Site': 'same-origin',
          'Accept-Encoding': 'gzip, deflate, br',
        });

        if (!response || !response.ok) {
          if (response?.status === 403) {
            console.error(`Flipkart 403 for ${url}`);
          }
          return;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('.B_NuCI').text().trim() || $('h1').first().text().trim();
        if (!title && html.length < 5000) return;

        // --- STRICT STOCK DETECTION ---
        // Note: We IGNORE schema.org/InStock because it often reflects National stock, not Local stock.
        const htmlLower = html.toLowerCase();
        
        const hasNotDeliverable = htmlLower.includes('not deliverable') || 
                                 htmlLower.includes('not available for') ||
                                 htmlLower.includes('check availability') ||
                                 htmlLower.includes('enter pincode');

        const buyNow = $('button._2KpZ6l._20p_ns').length > 0 || 
                      $('button:contains("BUY NOW")').length > 0 || 
                      $('button:contains("Buy Now")').length > 0;
        
        const addToCart = $('button._2KpZ6l._2U9u96').length > 0 || 
                         $('.row._10S6vX').length > 0 || 
                         $('button:contains("ADD TO CART")').length > 0 || 
                         $('button:contains("Add to Cart")').length > 0;

        const notifyMe = $('button:contains("NOTIFY ME")').length > 0 || 
                        $('button:contains("Notify Me")').length > 0;

        let isOutOfStock = true;

        // To be "In Stock" for a specific pincode:
        // 1. MUST have a "Buy Now" button (not just Add to Cart)
        // 2. MUST NOT have "Not Deliverable" text
        // 3. MUST NOT have "Notify Me" button
        if (buyNow && !hasNotDeliverable && !notifyMe) {
          isOutOfStock = false;
        } else if (addToCart && !buyNow && !hasNotDeliverable) {
          // Sometimes only Add to Cart is there, but if "Change Address" is missing, it's usually okay.
          // In your case, "Change Address" was there, so buyNow was missing.
          isOutOfStock = true; 
        } else {
          isOutOfStock = true;
        }

        // --- PRICE PARSING ---
        let price = '';
        try {
          const jsonLdText = $('script#jsonLD').text();
          if (jsonLdText) {
            const jsonLd = JSON.parse(jsonLdText);
            const offer = Array.isArray(jsonLd) ? jsonLd[0]?.offers : jsonLd?.offers;
            if (offer && offer.price) {
              price = `₹${Number(offer.price).toLocaleString('en-IN')}`;
            }
          }
        } catch (e) {}

        if (!price) {
          const rawPrice = $('._30jeq3._16Jk6d').first().text().trim() ||
                           $('._30jeq3').first().text().trim() ||
                           $('div[class*="Nx9bqj"]').first().text().trim();
          const priceMatch = rawPrice.match(/₹\s*[\d,]+(?:\.\d+)?/);
          price = priceMatch ? priceMatch[0].replace(/\s+/g, '') : '';
        }

        const item = {
          title,
          url,
          price: price || null,
          isOutOfStock: isOutOfStock
        };

        if (!item.isOutOfStock && item.price) {
          availableItems.push({
            name: item.title,
            url: item.url,
            price: item.price,
            inStock: true
          });
        }
        
        if (!bestMatch || (bestMatch.isOutOfStock && !item.isOutOfStock)) {
          bestMatch = item;
        }
      } catch (e) {
        // Silent fail
      }
    });

    await Promise.allSettled(fetchPromises);

    if (!bestMatch) {
       return {
        inStock: false,
        price: null,
        productUrl: productUrls[0],
        productName: nameFromUrl(productUrls[0]),
        listingCount: matchCount,
        items: [],
      };
    }

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl: bestMatch.url,
      productName: bestMatch.title,
      listingCount: matchCount,
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
