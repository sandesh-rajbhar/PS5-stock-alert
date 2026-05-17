import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

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
        
        const title = $('.pdp__title').text().trim();
        if (!title) return null;

        const isOutOfStock = $('body').text().includes('Out of Stock') || 
                             $('.pdp__notifyMe').length > 0 || 
                             $('.pdp__addtoCart').length === 0;
        
        const rawPrice = $('.pdp__priceSection .sc-bxivhb').first().text().trim() ||
                         $('.pdp__priceSection').first().text().trim() ||
                         $('[class*="price"]').first().text().trim();
        const priceMatch = rawPrice.match(/₹\s*[\d,]+(?:\.\d+)?/) || rawPrice.match(/[\d,]{4,}(?:\.\d+)?/);
        const price = priceMatch
          ? (priceMatch[0].startsWith('₹') ? priceMatch[0].replace(/\s+/g, '') : `₹${priceMatch[0]}`)
          : '';

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
        listingCount: matchCount,
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
    console.error('Reliance Digital localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: productUrls[0],
      productName: 'PS5 Console',
      listingCount: productUrls.length,
      error: true,
    };
  }
}
