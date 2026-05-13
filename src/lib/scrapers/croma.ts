import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeCroma(pincode?: string): Promise<ScrapeResult> {
  const url = `https://www.croma.com/searchB?q=ps5:relevance:stockFlag:true`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': pincode ? `pincode=${pincode}` : '',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) throw new Error(`Croma fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results = $('.product-item');
    let bestMatch: any = null;
    let matchCount = 0;

    results.each((_, el) => {
      const title = $(el).find('.pdp-link a').text().trim();
      const titleLower = title.toLowerCase();

      // Console/Bundle check
      const isPS5 = titleLower.includes('ps5') || titleLower.includes('playstation 5');
      const isConsole = titleLower.includes('console') || titleLower.includes('slim') || titleLower.includes('bundle') || titleLower.includes('edition');
      const isAccessory = titleLower.includes('controller') || titleLower.includes('dualsense') || titleLower.includes('charging station') || titleLower.includes('remote') || titleLower.includes('cover') || titleLower.includes('stickers') || titleLower.includes('headphones');

      if (isPS5 && isConsole && !isAccessory) {
        matchCount++;
        const price = $(el).find('.amount').first().text().trim();
        const isOutOfStock = $(el).text().includes('Out of Stock') || 
                            $(el).find('.btn-not-available').length > 0 ||
                            $(el).text().includes('Not Deliverable');

        if (!isOutOfStock && price) {
          if (!bestMatch || bestMatch.isOutOfStock) {
            bestMatch = { el: $(el), isOutOfStock: false, price, title };
          }
        } else if (!bestMatch) {
          bestMatch = { el: $(el), isOutOfStock: true, price: price || null, title };
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

    const relativeUrl = bestMatch.el.find('.pdp-link a').attr('href');
    const productUrl = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : 'https://www.croma.com' + relativeUrl) : url;

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl,
      productName: bestMatch.title || 'PS5 Console',
      listingCount: matchCount,
    };
  } catch (error) {
    console.error('Croma scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      error: true,
    };
  }
}
