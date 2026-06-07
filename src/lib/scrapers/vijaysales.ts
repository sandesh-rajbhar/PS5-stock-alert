import * as cheerio from 'cheerio';
import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';
import { fetchWithTimeout } from './fetchWithTimeout';

export async function scrapeVijaySales(pincode: string): Promise<ScrapeResult> {
  const productUrls = [
    'https://www.vijaysales.com/p/235634/sony-playstation-ps5-disc-fortnite-bundle-edition',
    'https://www.vijaysales.com/p/235635/sony-playstation-5-slim-digital-edition-console-fortnite-cobalt-star-bundle',
    'https://www.vijaysales.com/p/254871/sony-ps5r-disc-edition-console-video-game-dual-sense-wireless-controller-bundle',
    'https://www.vijaysales.com/p/235511/sony-playstation-5-slim-digital-edition-30th-anniversary-limited-edition-bundle',
    'https://www.vijaysales.com/p/252606/sony-playstationr5-disc-sa-e-edition-console-video-game-ps5r-slim',
    'https://www.vijaysales.com/p/254870/sony-playstationr5-digital-edition-console-video-game-825gb-ps5r-slim'
  ];

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.vijaysales.com/',
    };

    // Step 1: Initialize session with pincode via handler
    const pincodeResponse = await fetchWithTimeout('https://www.vijaysales.com/Handlers/PincodeHandler.ashx', {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: `Action=SetPincode&Pincode=${pincode}`
    });
    
    const rawCookies = pincodeResponse.headers.raw()['set-cookie'] || [];
    const sessionCookies = rawCookies.map((c: string) => c.split(';')[0]).join('; ');
    const combinedCookies = `${sessionCookies}; pincode=${pincode}; vspincode=${pincode}`;

    let bestMatch: any = null;
    let matchCount = productUrls.length;

    const fetchPromises = productUrls.map(async (url, index) => {
      try {
        await new Promise(r => setTimeout(r, index * 200));

        const response = await fetchWithTimeout(url, {
          headers: {
            ...headers,
            'Cookie': combinedCookies,
          },
        });


        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);

        const title = $('#pdp-title').text().trim() || $('.vsprod-title').text().trim();
        if (!title && html.length < 5000) return null;

        const bodyText = html;
        const isInStockSchema  = bodyText.includes('"http://schema.org/InStock"')  || bodyText.includes('"https://schema.org/InStock"');
        const isOutOfStockSchema = bodyText.includes('"http://schema.org/OutOfStock"') || bodyText.includes('"https://schema.org/OutOfStock"');

        const addToCart = $('.btn-add-to-cart').length > 0 || bodyText.includes('ADD TO CART') || bodyText.includes('Add to Cart');
        const buyNow = $('.btn-buy-now').length > 0 || bodyText.includes('BUY NOW') || bodyText.includes('Buy Now');
        const notifyMe = $('.btn-notify-me').length > 0 || bodyText.includes('Notify Me') || bodyText.includes('NOTIFY ME');
        const currentlyUnavailable = bodyText.includes('Currently unavailable') || bodyText.includes('Currently Unavailable');

        let isOutOfStock = false;

        if (isOutOfStockSchema || currentlyUnavailable || notifyMe) {
          isOutOfStock = true;
        } else if ((addToCart || buyNow) && isInStockSchema) {
          isOutOfStock = false;
        } else {
          isOutOfStock = true;
        }

        // Extract price from Schema.org if possible
        const priceMatchSchema = bodyText.match(/"price":\s*"(\d+)"/);
        let price = '';
        if (priceMatchSchema) {
          price = `₹${parseInt(priceMatchSchema[1]).toLocaleString('en-IN')}`;
        } else {
          const rawPrice = $('.pdp-price').first().text().trim() ||
                           $('.vsprod-price').first().text().trim();
          const pMatch = rawPrice.match(/₹\s*[\d,]+(?:\.\d+)?/);
          price = pMatch ? pMatch[0].replace(/\s+/g, '') : '';
        }

        return {
          title,
          url,
          price: price || null,
          isOutOfStock: isOutOfStock
        };
      } catch (e) {
        return null;
      }
    });

    const results = await Promise.allSettled(fetchPromises);
    const availableItems: any[] = [];

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const item = result.value;
        if (!item.isOutOfStock && item.price) {
          availableItems.push({
            name: item.title,
            url: item.url,
            price: item.price,
            inStock: true
          });
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
        productName: nameFromUrl(productUrls[0]),
        listingCount: matchCount,
        items: [],
      };
    }

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl: bestMatch.url,
      productName: bestMatch.title,
      listingCount: matchCount,
      items: availableItems,
    };
  } catch (error) {
    console.error('Vijay Sales localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: productUrls[0],
      productName: nameFromUrl(productUrls[0]),
      listingCount: productUrls.length,
      error: true,
    };
  }
}
