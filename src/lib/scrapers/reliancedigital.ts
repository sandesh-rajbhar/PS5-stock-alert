import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeRelianceDigital(pincode: string): Promise<ScrapeResult> {
  const url = 'https://www.reliancedigital.in/search?q=ps5:relevance';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': `pincode=${pincode}`,
      },
    });

    if (!response.ok) throw new Error(`Reliance Digital fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results = $('.sp__product');
    let bestMatch: any = null;
    let matchCount = 0;

    results.each((_, el) => {
      const title = $(el).find('.sp__name').text().trim();
      const titleLower = title.toLowerCase();

      // Console/Bundle check
      const isPS5 = titleLower.includes('ps5') || titleLower.includes('playstation 5');
      const isConsole = titleLower.includes('console') || titleLower.includes('slim') || titleLower.includes('bundle') || titleLower.includes('edition');
      const isAccessory = titleLower.includes('controller') || titleLower.includes('dualsense') || titleLower.includes('charging station') || titleLower.includes('remote') || titleLower.includes('cover') || titleLower.includes('camera');

      if (isPS5 && isConsole && !isAccessory) {
        matchCount++;
        const price = $(el).find('.sc-bxivhb').first().text().trim();
        const isOutOfStock = $(el).text().includes('Out of Stock') || $(el).find('.btn-notify').length > 0;

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

    const relativeUrl = bestMatch.el.find('a').first().attr('href');
    const productUrl = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : 'https://www.reliancedigital.in' + relativeUrl) : url;

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl,
      productName: bestMatch.title || 'PS5 Console',
      listingCount: matchCount,
    };
  } catch (error) {
    console.error('Reliance Digital scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      error: true,
    };
  }
}
