import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeAmazon(pincode: string): Promise<ScrapeResult> {
  const productUrls = [
    'https://www.amazon.in/Sony-PlaysStation-Console-Storage-Capacity/dp/B0CWH9WCWT',
    'https://www.amazon.in/Sony-Ps5-Gaming-Console-Controllers/dp/B0DT9MQQC1',
    'https://www.amazon.in/Sony-PlayStation%C2%AE5-Digital-Edition-slim/dp/B0CY5QW186',
    'https://www.amazon.in/Sony-CFI-2008A01X-PlayStation%C2%AE5-Console-slim/dp/B0FNS22DLT',
    'https://www.amazon.in/Sony-CFI-2008A01X-PlayStation%C2%AE5-Console-slim/dp/B0CY5HVDS2'
  ];
  
  const addressUrl = 'https://www.amazon.in/gp/delivery/ajax/address-change.html';
  
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-IN,en;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Step 1: Set the Pincode via Amazon's internal address-change endpoint
    const addressResponse = await fetch(addressUrl, {
      method: 'POST',
      headers,
      body: new URLSearchParams({
        'locationType': 'LOCATION_INPUT',
        'zipCode': pincode,
        'storeContext': 'generic',
        'deviceType': 'web',
        'pageType': 'Detail',
        'actionSource': 'glow'
      })
    });

    const setCookie = addressResponse.headers.get('set-cookie') || '';
    let bestMatch: any = null;
    let matchCount = productUrls.length;

    // Step 2: Fetch all product pages concurrently
    const fetchPromises = productUrls.map(async (url) => {
      try {
        const response = await fetch(url, {
          headers: { 
            ...headers, 
            'Cookie': setCookie, 
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8' 
          },
        });
        
        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('#productTitle').text().trim();
        if (!title) return null; // Captcha or invalid page

        const availabilityText = $('#availability').text().trim().toLowerCase();
        const isOutOfStock = availabilityText.includes('currently unavailable') || 
                             availabilityText.includes('out of stock') || 
                             availabilityText.includes('cannot be delivered');
        
        const price = $('.a-price-whole').first().text().trim();

        return {
          title,
          url,
          price: price ? `₹${price}` : null,
          isOutOfStock: isOutOfStock || !price
        };
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.allSettled(fetchPromises);

    // Evaluate results to find the best match (prioritizing in-stock)
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
    console.error('Amazon localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: productUrls[0],
      productName: 'PS5 Console',
      error: true,
    };
  }
}
