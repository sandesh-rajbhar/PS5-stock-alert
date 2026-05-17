import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';

export async function scrapeCroma(pincode: string): Promise<ScrapeResult> {
  const productUrls = [
    'https://www.croma.com/sony-playstation-5-1tb-ssd-standard-gaming-console-with-ea-sports-fc26-bundle-white-/p/319455',
    'https://www.croma.com/sony-playstation-5-1tb-ssd-digital-gaming-console-with-ea-sports-fc26-bundle-white-/p/319456',
    'https://www.croma.com/sony-playstation-5-1tb-ssd-standard-disc-gaming-console-with-fortnite-bundle-white-/p/320033',
    'https://www.croma.com/sony-playstation-5-1tb-ssd-slim-gaming-console-with-nba-2k26-white-/p/318700',
    'https://www.croma.com/sony-playstation-5-1tb-ssd-digital-gaming-console-with-fortnite-bundle-white-/p/320034',
    'https://www.croma.com/sony-dual-sense-playstation-5-1tb-ssd-standard-gaming-console-bundle-white-/p/322191',
    'https://www.croma.com/sony-playstation-5-1tb-ssd-standard-disc-gaming-console-white-/p/321320',
    'https://www.croma.com/sony-playstation-5-825-gb-hdd-digital-edition-gaming-console-white-/p/322190',
    'https://www.croma.com/sony-playstation-5-1tb-ssd-digital-slim-gaming-console-with-cod-white-/p/316950',
    'https://www.croma.com/sony-playstation-5-1tb-ssd-disc-edition-slim-gaming-console-with-cod-white-/p/316949',
    'https://www.croma.com/sony-playstation-5-wireless-1tb-ssd-cfi-1208a-white-/p/267452',
    'https://www.croma.com/sony-playstation-5-1tb-ssd-digital-edition-slim-gaming-console-white-/p/316841',
    'https://www.croma.com/sony-playstation-5-slim-1tb-ssd-gaming-console-white-/p/305985'
  ];
  
  try {
    let bestMatch: any = null;
    let matchCount = productUrls.length;

    // Step 1: Fetch all product pages concurrently
    const fetchPromises = productUrls.map(async (url, index) => {
      try {
        await new Promise(r => setTimeout(r, index * 200));

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': `pincode=${pincode}`,
            'Referer': 'https://www.croma.com/',
          },
        });
        
        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('h1.pd-title').text().trim() || $('.pdp-title').text().trim();
        if (!title) return null;

        const isOutOfStock = $('body').text().includes('Out of Stock') || 
                             $('.btn-not-available').length > 0 ||
                             $('body').text().includes('Not Deliverable');
        
        const rawPrice = $('.pdp-price .amount').first().text().trim() ||
                         $('.cp-price .amount').first().text().trim() ||
                         $('[data-testid="new-price"]').first().text().trim() ||
                         $('.amount').first().text().trim();
        const priceMatch = rawPrice.match(/[\d,]+(?:\.\d+)?/);
        const price = priceMatch ? `₹${priceMatch[0]}` : '';

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

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const item = result.value;
        if (!item.isOutOfStock && item.price) {
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
      };
    }

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl: bestMatch.url,
      productName: bestMatch.title,
      listingCount: matchCount,
    };
  } catch (error) {
    console.error('Croma localized scraping error:', error);
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
