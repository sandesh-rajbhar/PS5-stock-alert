import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeFlipkart(): Promise<ScrapeResult> {
  const url = 'https://www.flipkart.com/search?q=ps5+console&sort=relevance';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) throw new Error(`Flipkart fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Flipkart usually has results in a grid or list
    // Look for product tiles
    const firstResult = $('[data-id]').first();
    const title = firstResult.find('a[title]').attr('title')?.toLowerCase() || '';

    if (!title.includes('ps5') && !title.includes('playstation 5')) {
       return {
        inStock: false,
        price: null,
        productUrl: url,
        productName: 'PS5 Console',
      };
    }

    // Flipkart price class changes, but often starts with _30jeq3
    const price = firstResult.find('div[class*="_30jeq3"]').first().text().trim();
    const isOutOfStock = firstResult.text().includes('Sold Out') || firstResult.text().includes('Currently unavailable');
    const relativeUrl = firstResult.find('a[title]').attr('href');
    const productUrl = relativeUrl ? 'https://www.flipkart.com' + relativeUrl : url;

    return {
      inStock: !isOutOfStock && !!price,
      price: price || null,
      productUrl,
      productName: firstResult.find('a[title]').attr('title') || 'PS5 Console',
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
