import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeVijaySales(pincode: string): Promise<ScrapeResult> {
  const productUrls = [
    'https://www.vijaysales.com/p/235634/sony-playstation-ps5-disc-fortnite-bundle-edition',
    'https://www.vijaysales.com/p/235635/sony-playstation-5-slim-digital-edition-console-fortnite-cobalt-star-bundle',
    'https://www.vijaysales.com/p/254871/sony-ps5r-disc-edition-console-video-game-dual-sense-wireless-controller-bundle',
    'https://www.vijaysales.com/p/235511/sony-playstation-5-slim-digital-edition-30th-anniversary-limited-edition-bundle',
    'https://www.vijaysales.com/p/252606/sony-playstationr5-disc-sa-e-edition-console-video-game-ps5r-slim',
    'https://www.vijaysales.com/p/254870/sony-playstationr5-digital-edition-console-video-game-825gb-ps5r-slim'
  ];
  
  try {
    let bestMatch: any = null;
    let matchCount = productUrls.length;

    const fetchPromises = productUrls.map(async (url, index) => {
      try {
        await new Promise(r => setTimeout(r, index * 200));

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': `pincode=${pincode}`,
            'Referer': 'https://www.vijaysales.com/',
          },
        });
        
        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('#pdp-title').text().trim() || $('.vsprod-title').text().trim();
        if (!title) return null;

        const isOutOfStock = $('body').text().includes('Out of Stock') || 
                             $('.btn-notify-me').length > 0 || 
                             $('.btn-add-to-cart').length === 0;
        
        const rawPrice = $('.pdp-price').first().text().trim() ||
                         $('.vsprod-price').first().text().trim() ||
                         $('[class*="price"]').first().text().trim();
        const priceMatch = rawPrice.match(/₹\s*[\d,]+(?:\.\d+)?/) || rawPrice.match(/[\d,]{4,}(?:\.\d+)?/);
        const price = priceMatch
          ? (priceMatch[0].startsWith('₹') ? priceMatch[0].replace(/\s+/g, '') : `₹${priceMatch[0]}`)
          : '';

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
        productName: 'PS5 Console',
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
    console.error('Vijay Sales localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: productUrls[0],
      productName: 'PS5 Console',
      listingCount: productUrls.length,
      error: true,
    };
  }
}
