import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeCroma(): Promise<ScrapeResult> {
  const url = 'https://www.croma.com/searchB?q=ps5:relevance:stockFlag:true';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) throw new Error(`Croma fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Croma uses specific classes for product items
    const firstResult = $('.product-item').first();
    const title = firstResult.find('.pdp-link a').text().trim();

    if (!title.toLowerCase().includes('ps5') && !title.toLowerCase().includes('playstation 5')) {
       return {
        inStock: false,
        price: null,
        productUrl: url,
        productName: 'PS5 Console',
      };
    }

    const price = firstResult.find('.amount').first().text().trim();
    const isOutOfStock = firstResult.text().includes('Out of Stock') || firstResult.find('.btn-not-available').length > 0;
    const relativeUrl = firstResult.find('.pdp-link a').attr('href');
    const productUrl = relativeUrl ? 'https://www.croma.com' + relativeUrl : url;

    return {
      inStock: !isOutOfStock && !!price,
      price: price || null,
      productUrl,
      productName: title || 'PS5 Console',
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
