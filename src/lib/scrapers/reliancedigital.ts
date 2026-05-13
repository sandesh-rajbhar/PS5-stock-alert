import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeRelianceDigital(pincode: string): Promise<ScrapeResult> {
  const productUrls = [
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
  
  try {
    let bestMatch: any = null;
    let matchCount = productUrls.length;

    const fetchPromises = productUrls.map(async (url) => {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cookie': `pincode=${pincode}`,
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
        
        const price = $('.pdp__priceSection .sc-bxivhb').first().text().trim();

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
      error: true,
    };
  }
}
