import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeAmazon(pincode: string): Promise<ScrapeResult> {
  const searchUrl = 'https://www.amazon.in/s?k=Sony+PlayStation+5+Console&rh=p_n_availability%3A1318485031';
  const addressUrl = 'https://www.amazon.in/gp/delivery/ajax/address-change.html';
  
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-IN,en;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    // Step 1: Set the Pincode via Amazon's internal address-change endpoint
    // This allows the subsequent search to return results for that specific location
    const addressResponse = await fetch(addressUrl, {
      method: 'POST',
      headers,
      body: new URLSearchParams({
        'locationType': 'LOCATION_INPUT',
        'zipCode': pincode,
        'storeContext': 'generic',
        'deviceType': 'web',
        'pageType': 'Search',
        'actionSource': 'glow'
      })
    });

    // Extract cookies from address change (simplified for node-fetch)
    const setCookie = addressResponse.headers.get('set-cookie') || '';

    // Step 2: Search with the pincode-aware session
    const response = await fetch(searchUrl, {
      headers: {
        ...headers,
        'Cookie': setCookie,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
    });

    if (!response.ok) throw new Error(`Amazon fetch failed: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results = $('[data-component-type="s-search-result"]');
    let bestMatch: any = null;

    results.each((_, el) => {
      const title = $(el).find('h2 span').text().toLowerCase();
      
      // Console check
      const isPS5 = (title.includes('ps5') || title.includes('5')) && 
                    (title.includes('sony') || title.includes('playstation'));
      const isConsole = title.includes('console') || title.includes('slim') || title.includes('bundle');
      
      const isAccessory = title.includes('compatible') || title.includes('stand') || title.includes('hub') || 
                          title.includes('cooling') || title.includes('fan') || title.includes('controller') || 
                          title.includes('dualsense') || title.includes('skin') || title.includes('cover');

      if (isPS5 && isConsole && !isAccessory) {
        const text = $(el).text();
        const isOutOfStock = text.includes('Currently unavailable') || text.includes('out of stock') || 
                            text.includes('Cannot be delivered to this location');
        const price = $(el).find('.a-price-whole').first().text().trim();

        if (!isOutOfStock && price) {
          if (!bestMatch || bestMatch.isOutOfStock) {
             bestMatch = { el: $(el), isOutOfStock: false, price: `₹${price}`, title: $(el).find('h2 span').text().trim() };
          }
        } else if (!bestMatch) {
          bestMatch = { el: $(el), isOutOfStock: true, price: price ? `₹${price}` : null, title: $(el).find('h2 span').text().trim() };
        }
      }
    });

    if (!bestMatch) {
       return {
        inStock: false,
        price: null,
        productUrl: searchUrl,
        productName: 'PS5 Console',
      };
    }

    const relativeUrl = bestMatch.el.find('h2 a').attr('href');
    const productUrl = relativeUrl ? (relativeUrl.startsWith('http') ? relativeUrl : 'https://www.amazon.in' + relativeUrl) : searchUrl;

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl,
      productName: bestMatch.title,
    };
  } catch (error) {
    console.error('Amazon localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: searchUrl,
      productName: 'PS5 Console',
      error: true,
    };
  }
}
