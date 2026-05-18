import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';

interface ScrapeOpts {
  maxUrls?: number;
}

export async function scrapeRelianceDigital(pincode: string, opts: ScrapeOpts = {}): Promise<ScrapeResult> {
  const allProductUrls = [
    'https://www.reliancedigital.in/product/sony-ps5-standard-console-with-2-dualsense-controllers-m7oq28-8963763',
    'https://www.reliancedigital.in/product/sonyplaystation5standardconsolenba-mg53du-9490141',
    'https://www.reliancedigital.in/product/sony-playstation-5-digital-console-fortnite-bundle-mk3j7r-9713761',
    'https://www.reliancedigital.in/product/sony-playstation-5-standard-console-fortnite-bundle-mk3j5b-9713760',
    'https://www.reliancedigital.in/product/sony-playstation-ps5-slim-digital-console-luh1rv-7537999',
    'https://www.reliancedigital.in/product/sony-ps5-astro-bot-bundle-standard-gaming-console-m85ewr-8976152',
    'https://www.reliancedigital.in/product/sony-ps5-console-fortnite-bundle-m4ih5f-8764435',
    'https://www.reliancedigital.in/product/sony-playstation-5-digital-gaming-console-with-call-of-duty-black-ops-6-bundle-md7dk3-9288584',
    'https://www.reliancedigital.in/product/sony-playstation-ps5-slim-console-luh1rv-7537998',
    'https://www.reliancedigital.in/product/sony-ps5-astro-bot-bundle-digital-edition-gaming-console-m85ewr-8976153',
    'https://www.reliancedigital.in/product/sony-playstation-5-digital-edition-m35xsd-8706126',
    'https://www.reliancedigital.in/product/sony-playstation-5-digital-edition-console',
    'https://www.reliancedigital.in/product/sony-ps5-digital-console-fortnite-bundle-m4ih5i-8764436',
    'https://www.reliancedigital.in/product/sony-ps5-digital-d-chassis-gaming-console-fc26-bundle-mia2lh-9604024',
    'https://www.reliancedigital.in/product/sony-playstation-5-standard-gaming-console-with-call-of-duty-black-ops-6-bundle-md7djz-9288583',
    'https://www.reliancedigital.in/product/sony-ps5-standard-d-chassis-gaming-console-fc26-bundle-mia2lh-9604025',
    'https://www.reliancedigital.in/product/sony-playstation-5-standard-e-chassis-ds-bundle-gaming-console-mn359o-9991585',
    'https://www.reliancedigital.in/product/sony-playstation-5-digital-e-chassis-gaming-console-mn357x-9991584',
    'https://www.reliancedigital.in/product/sony-ps5-standard-sa-e-chassis-gaming-console-mmeqbt-9974618'
  ];

  const productUrls = opts.maxUrls ? allProductUrls.slice(0, opts.maxUrls) : allProductUrls;

  try {
    let bestMatch: any = null;
    let matchCount = productUrls.length;

    const fetchPromises = productUrls.map(async (url, index) => {
      try {
        await new Promise(r => setTimeout(r, index * 200));

        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': `pincode=${pincode}`,
            'Referer': 'https://www.reliancedigital.in/',
          },
        });
        
        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('.pdp__title').text().trim() || $('title').text().replace('Buy ', '').split(' at Reliance')[0].trim();
        if (!title && html.length < 5000) return null;

        const bodyText = html;
        const mainPdpText = $('#root').text() || bodyText; // Try to target main content
        
        const addToCart = $('.pdp__addtoCart').length > 0 || 
                          $('#add-to-cart').length > 0 || 
                          bodyText.includes('ADD TO CART') || 
                          bodyText.includes('Add to Cart');
                          
        const buyNow = $('.pdp__buyNow').length > 0 || 
                        bodyText.includes('BUY NOW') || 
                        bodyText.includes('Buy Now');

        // Reliance uses Schema.org JSON-LD.
        // NOTE: We ignore the generic toast message string "Article Currently Unavailable" which is always present in the HTML config.
        const isInStockSchema = bodyText.includes('http://schema.org/InStock') || bodyText.includes('InStock');
        const isOutOfStockSchema = bodyText.includes('http://schema.org/OutOfStock') || bodyText.includes('OutOfStock');
        
        // Real OOS indicators on Reliance usually appear in specific divs or larger text blocks
        // We look for the text but EXCLUDE the generic toast message property
        const bodyWithoutConfig = bodyText.replace('"restricted_articles_toast_message":"Article Currently Unavailable"', '');
        const currentlyUnavailable = bodyWithoutConfig.toLowerCase().includes('currently unavailable') && !addToCart && !buyNow;

        let isOutOfStock = false;
        
        if (currentlyUnavailable) {
          isOutOfStock = true;
        } else if (isOutOfStockSchema) {
          isOutOfStock = true;
        } else if (isInStockSchema) {
          isOutOfStock = false;
        } else if (addToCart || buyNow) {
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
          const rawPrice = $('.pdp__priceSection .sc-bxivhb').first().text().trim() ||
                           $('.pdp__priceSection').first().text().trim();
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
    console.error('Reliance Digital localized scraping error:', error);
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
