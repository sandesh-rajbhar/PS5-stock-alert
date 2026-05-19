import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';

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
  // Use a search-based approach for some URLs to look more natural
  const allProductUrls = [
    'https://www.flipkart.com/sony-ps5-console-disc-slim-ps5-cfi-2008a01-1-tb/p/itmdb538afe986e8',
    'https://www.flipkart.com/sony-playstation5-console-slim-cfi-2008a01x-cfi-2116a01y-1-tb/p/itm89489e2adcd2c',
    'https://www.flipkart.com/sony-playstation5-digital-edition-slim-cfi-2008b01x-cfi-2116b01y-1-tb/p/itm6b0a91231fb2f',
    'https://www.flipkart.com/sony-ps5-standard-astro-bot-bundle-slim-1000-gb-full-game/p/itmd11e32031893c',
    'https://www.flipkart.com/sony-ps5-digital-astro-bot-bundle-slim-1000-gb-full-game/p/itm098413eda0a77'
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
      'X-Requested-With': 'com.android.chrome', // Mimic Android Chrome WebView
    };

    // Step 1: Initialize session by hitting a SEARCH page instead of homepage
    // Search for "ps5 console" to get a natural session cookie
    const searchUrl = `https://www.flipkart.com/search?q=ps5+console&pincode=${pincode}`;
    const searchResponse = await fetch(searchUrl, { 
      headers: baseHeaders
    });
    
    const rawCookies = searchResponse.headers.raw()['set-cookie'] || [];
    const sessionCookies = rawCookies.map(c => c.split(';')[0]).join('; ');
    const combinedCookies = `${sessionCookies}; pincode=${pincode}`;

    let bestMatch: any = null;
    let matchCount = productUrls.length;

    const fetchPromises = productUrls.map(async (url, index) => {
      try {
        // MUCH longer randomized delay (5s - 15s) to simulate human browsing
        const delay = 5000 + Math.floor(Math.random() * 10000) + (index * 1000);
        await new Promise(r => setTimeout(r, delay));

        const response = await fetch(url, {
          headers: {
            ...baseHeaders,
            'Referer': searchUrl, // Make it look like we clicked from search results
            'Cookie': combinedCookies,
            'Sec-Fetch-Site': 'same-origin',
          },
        });





        if (!response.ok) {
          if (response.status === 403) {
            console.error(`Flipkart 403 for ${url} - likely anti-bot`);
          }
          return null;
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('.B_NuCI').text().trim() || $('h1').first().text().trim();
        if (!title && html.length < 5000) return null;

        const bodyText = html;
        const isInStockSchema = bodyText.includes('http://schema.org/InStock') || bodyText.includes('InStock');
        const isOutOfStockSchema = bodyText.includes('http://schema.org/OutOfStock') || bodyText.includes('OutOfStock');

        const addToCart = $('button._2KpZ6l._2U9u96').length > 0 || $('.row._10S6vX').length > 0 || $('button:contains("ADD TO CART")').length > 0 || $('button:contains("Add to Cart")').length > 0;
        const buyNow = $('button._2KpZ6l._20p_ns').length > 0 || $('button:contains("BUY NOW")').length > 0 || $('button:contains("Buy Now")').length > 0;
        const notifyMe = $('button:contains("NOTIFY ME")').length > 0 || $('button:contains("Notify Me")').length > 0;

        let isOutOfStock = false;

        if (isInStockSchema) {
          isOutOfStock = false;
        } else if (isOutOfStockSchema) {
          isOutOfStock = true;
        } else if (addToCart || buyNow) {
          isOutOfStock = false;
        } else if (notifyMe) {
          isOutOfStock = true;
        } else {
          isOutOfStock = true;
        }


        const rawPrice = $('._30jeq3._16Jk6d').first().text().trim() ||
                         $('._30jeq3').first().text().trim() ||
                         $('div[class*="Nx9bqj"]').first().text().trim();
        const priceMatch = rawPrice.match(/₹\s*[\d,]+(?:\.\d+)?/);
        const price = priceMatch ? priceMatch[0].replace(/\s+/g, '') : '';

        return {
          title,
          url,
          price: price || null,
          isOutOfStock: isOutOfStock
        };
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    const availableItems: any[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const item = result.value;
        if (!item.isOutOfStock && item.price) {
          availableItems.push({
            name: item.title,
            url: item.url,
            price: item.price,
            inStock: true
          });
          if (!bestMatch || bestMatch.isOutOfStock) {
            bestMatch = item;
          }
        } else if (!bestMatch) {
          bestMatch = item;
        }
      }
    }

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
