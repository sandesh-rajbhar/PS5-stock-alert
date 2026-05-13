import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeRelianceDigital(): Promise<ScrapeResult> {
  const url = 'https://www.reliancedigital.in/search?q=ps5:relevance';
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) throw new Error(`Reliance Digital fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const firstResult = $('.sp__product').first();
    const title = firstResult.find('.sp__name').text().trim();

    if (!title.toLowerCase().includes('ps5') && !title.toLowerCase().includes('playstation 5')) {
       return {
        inStock: false,
        price: null,
        productUrl: url,
        productName: 'PS5 Console',
      };
    }

    const price = firstResult.find('.sc-bxivhb').first().text().trim();
    const isOutOfStock = firstResult.text().includes('Out of Stock') || firstResult.find('.btn-notify').length > 0;
    const relativeUrl = firstResult.find('a').first().attr('href');
    const productUrl = relativeUrl ? 'https://www.reliancedigital.in' + relativeUrl : url;

    return {
      inStock: !isOutOfStock && !!price,
      price: price || null,
      productUrl,
      productName: title || 'PS5 Console',
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
