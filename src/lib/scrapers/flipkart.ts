import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeFlipkart(pincode: string): Promise<ScrapeResult> {
  const url = 'https://www.flipkart.com/search?q=ps5+console&sort=relevance';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': `pincode=${pincode}; sn=1.1.1`, // Set pincode cookie for Flipkart
      },
    });

    if (!response.ok) throw new Error(`Flipkart fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results = $('[data-id]');
    let bestMatch: any = null;

    results.each((_, el) => {
      const title = $(el).find('a[title]').attr('title')?.toLowerCase() || '';
      const text = $(el).text();

      // Console check (exclude controllers, etc.)
      const isConsole = (title.includes('ps5') || title.includes('playstation 5')) && 
                        (title.includes('console') || title.includes('slim') || title.includes('bundle'));
      const isAccessory = title.includes('controller') || title.includes('dualsense') || title.includes('disk drive') || 
                          title.includes('charging station') || title.includes('remote') || title.includes('cover');

      if (isConsole && !isAccessory) {
        const isOutOfStock = text.includes('Sold Out') || text.includes('Currently unavailable') || text.includes('Not Deliverable');
        const price = $(el).find('div[class*="_30jeq3"]').first().text().trim();

        // If we find an in-stock one, that's our best match.
        // If we already have an in-stock one, we keep the first one we found.
        if (!isOutOfStock && price) {
          if (!bestMatch || bestMatch.isOutOfStock) {
            bestMatch = { el: $(el), isOutOfStock: false, price, title: $(el).find('a[title]').attr('title') };
          }
        } else if (!bestMatch) {
          // If no match yet, store this as a fallback (out of stock)
          bestMatch = { el: $(el), isOutOfStock: true, price: price || null, title: $(el).find('a[title]').attr('title') };
        }
      }
    });

    if (!bestMatch) {
       return {
        inStock: false,
        price: null,
        productUrl: url,
        productName: 'PS5 Console',
      };
    }

    const relativeUrl = bestMatch.el.find('a[title]').attr('href');
    const productUrl = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : 'https://www.flipkart.com' + relativeUrl) : url;

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl,
      productName: bestMatch.title || 'PS5 Console',
    };
  } catch (error) {
    console.error('Flipkart scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      error: true,
    };
  }
}
