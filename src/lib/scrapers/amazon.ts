import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeAmazon(): Promise<ScrapeResult> {
  const url = 'https://www.amazon.in/s?k=ps5+console&rh=p_n_availability%3A1318485031';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
    });

    if (!response.ok) throw new Error(`Amazon fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Check first result for PS5 console
    const firstResult = $('[data-component-type="s-search-result"]').first();
    const title = firstResult.find('h2 span').text().toLowerCase();
    
    if (!title.includes('ps5') && !title.includes('playstation 5')) {
       return {
        inStock: false,
        price: null,
        productUrl: url,
        productName: 'PS5 Console',
      };
    }

    const price = firstResult.find('.a-price-whole').first().text().trim();
    const isOutOfStock = firstResult.find('.a-color-price').text().includes('Currently unavailable');
    const productUrl = 'https://www.amazon.in' + firstResult.find('h2 a').attr('href');

    return {
      inStock: !isOutOfStock && !!price,
      price: price ? `₹${price}` : null,
      productUrl,
      productName: firstResult.find('h2 span').text().trim(),
    };
  } catch (error) {
    console.error('Amazon scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      error: true,
    };
  }
}
