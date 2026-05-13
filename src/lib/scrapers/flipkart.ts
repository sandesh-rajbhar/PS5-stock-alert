import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

export async function scrapeFlipkart(pincode: string): Promise<ScrapeResult> {
  const productUrls = [
    'https://www.flipkart.com/sony-playstation-5-console-gowr-vch-bundle-825-gb-yes/p/itm01fb765abae7a',
    'https://www.flipkart.com/sony-ps5-standard-dualsense-bundle-cfi-1208a01r-825gb-ssd-gb/p/itm73b71109455e7',
    'https://www.flipkart.com/sony-playstation-5-console-fc-24-825-gb-ea-sports-full-game-voucher/p/itm7b9c4acf55675',
    'https://www.flipkart.com/sony-playstation-5-console-modern-warfare-iii-825-gb-call-duty/p/itm0abb34c158d3d',
    'https://www.flipkart.com/sony-playstation-5-digital-825-gb-astro-s-playroom/p/itm3c6e8c91e0941',
    'https://www.flipkart.com/sony-ps5-digital-astro-bot-bundle-slim-1000-gb-full-game/p/itm098413eda0a77',
    'https://www.flipkart.com/sony-ps5-console-digital-slim-cfi-2008b01-1-tb-call-duty-black-ops6/p/itma157fd7ec92e6',
    'https://www.flipkart.com/sony-ps5-console-digital-slim-cfi-2008b01-1024-gb/p/itmcabcf14108133',
    'https://www.flipkart.com/sony-ps5-console-disc-slim-cfi-2008a01-1-tb-call-duty-black-ops6/p/itmab060bd6d0c5f',
    'https://www.flipkart.com/sony-ps5-standard-astro-bot-bundle-slim-1000-gb-full-game/p/itmd11e32031893c',
    'https://www.flipkart.com/sony-ps5-digital-ea-sports-fc-26-bundle-cfi-2008b01-1024-gb-full-game-voucher-astros-playroom/p/itma655a8c6aa151',
    'https://www.flipkart.com/sony-ps5-console-disc-fortnite-bundle-slim-1-tb-yes/p/itma8f2dd1b539f1',
    'https://www.flipkart.com/sony-ps5-console-disc-slim-cfi-2008a01-1024-gb-nba-2k26/p/itm9e65cbc8e37d4',
    'https://www.flipkart.com/sony-ps5-digital-30th-anniv-limited-edition-slim-cfi-2008b30x-1024-gb/p/itm8cd9cce03e5df',
    'https://www.flipkart.com/sony-ps5-console-disc-slim-ps5-cfi-2008a01-1-tb/p/itmdb538afe986e8',
    'https://www.flipkart.com/sony-ps5-console-digital-fortnite-bundle-slim-1-tb-yes/p/itm1660d204e39f8',
    'https://www.flipkart.com/sony-cfi-2008a01-1024-gb-ea-sports-fc-26-full-game-voucher-astros-playroom/p/itm0ac20e91053e3',
    'https://www.flipkart.com/sony-playstation5-digital-edition-slim-cfi-2008b01x-cfi-2116b01y-1-tb/p/itm6b0a91231fb2f',
    'https://www.flipkart.com/sony-playstation-5-console-825-gb/p/itm62f0f8b3c0bfb',
    'https://www.flipkart.com/sony-ps5-digital-cfi-2116b01y-825-gb/p/itm7124b7348127b',
    'https://www.flipkart.com/sony-playstation5-console-slim-cfi-2008a01x-cfi-2116a01y-1-tb/p/itm89489e2adcd2c'
  ];
  
  try {
    let bestMatch: any = null;
    let matchCount = productUrls.length;

    const fetchPromises = productUrls.map(async (url) => {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cookie': `pincode=${pincode}; sn=1.1.1`,
          },
        });
        
        if (!response.ok) return null;
        const html = await response.text();
        const $ = cheerio.load(html);
        
        const title = $('.B_NuCI').text().trim() || $('h1').first().text().trim();
        if (!title) return null;

        const isOutOfStock = $('body').text().includes('Sold Out') || 
                             $('body').text().includes('Currently unavailable') || 
                             $('body').text().includes('Not Deliverable');
        
        const price = $('.div._30jeq3._16Jk6d').first().text().trim() || $('.div._30jeq3').first().text().trim();

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
    console.error('Flipkart localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: productUrls[0],
      productName: 'PS5 Console',
      error: true,
    };
  }
}
