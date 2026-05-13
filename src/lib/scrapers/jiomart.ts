import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeJioMart(): Promise<ScrapeResult> {
  const url = 'https://www.jiomart.com/search/ps5';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) throw new Error(`JioMart fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const firstResult = $('.plp-card-container').first();
    const title = firstResult.find('.plp-card-details-name').text().trim();

    if (!title.toLowerCase().includes('ps5') && !title.toLowerCase().includes('playstation 5')) {
       return {
        inStock: false,
        price: null,
        productUrl: url,
        productName: 'PS5 Console',
      };
    }

    const price = firstResult.find('.jm-heading-xxs').first().text().trim();
    const isOutOfStock = firstResult.text().includes('Out of Stock') || firstResult.find('.plp-card-out-of-stock').length > 0;
    const relativeUrl = firstResult.find('a').first().attr('href');
    const productUrl = relativeUrl ? 'https://www.jiomart.com' + relativeUrl : url;

    return {
      inStock: !isOutOfStock && !!price,
      price: price || null,
      productUrl,
      productName: title || 'PS5 Console',
    };
  } catch (error) {
    console.error('JioMart scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      error: true,
    };
  }
}
