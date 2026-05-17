import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

async function geocodePincode(pincode: string): Promise<{ lat: string; lon: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    const data = await response.json() as { lat: string; lon: string }[];
    if (data && data.length > 0) {
      return { lat: data[0].lat, lon: data[0].lon };
    }
    return null;
  } catch (error: unknown) {
    console.error(`Geocoding failed for ${pincode}:`, error);
    return null;
  }
}

export async function scrapeZepto(pincode: string): Promise<ScrapeResult> {
  const url = 'https://www.zepto.com/';
  try {
    const coords = await geocodePincode(pincode);
    if (!coords) {
      return {
        inStock: false,
        price: null,
        productUrl: url,
        productName: 'PS5 Console',
        note: 'Store not available for this pincode',
      };
    }

    // 1. Get store ID using the serviceable address endpoint
    const storeResponse = await fetch(`https://www.zepto.com/api/v1/address/serviceable/?lat=${coords.lat}&lon=${coords.lon}`, {
      headers: {
        'User-Agent': 'okhttp/4.12.0',
        'Accept': 'application/json',
        'platform': 'ANDROID',
        'app_version': '12.0.0',
      },
    });
    
    let storeId = '';
    if (storeResponse.ok) {
        const serviceData = await storeResponse.json() as any;
        storeId = serviceData?.store_id || serviceData?.data?.store_id || serviceData?.address?.store_id;
    }

    if (!storeId) {
        // Try fallback to layout config
        const layoutResponse = await fetch(`https://www.zepto.com/api/v1/config/layout/?lat=${coords.lat}&lon=${coords.lon}&page_type=HOME`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'platform': 'WEB',
            },
        });
        if (layoutResponse.ok) {
            const layoutData = await layoutResponse.json() as any;
            storeId = layoutData?.store_id || layoutData?.data?.store_id;
        }
    }

    if (!storeId) {
        // Try v2 store fallback on new domain
        const fallbackResponse = await fetch('https://www.zepto.com/api/v2/store/', {
            headers: {
                'lat': coords.lat,
                'lon': coords.lon,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'platform': 'WEB',
            },
        });
        if (fallbackResponse.ok) {
            const storeData = await fallbackResponse.json() as { store_id: string };
            storeId = storeData.store_id;
        }
    }

    if (!storeId) throw new Error('No Zepto store found for this pincode');

    // 2. Search products using the new domain
    const searchResponse = await fetch(`https://www.zepto.com/api/v2/search/?query=ps5&store_id=${storeId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'platform': 'WEB',
        'Referer': 'https://www.zepto.com/search/',
      },
    });

    if (!searchResponse.ok) throw new Error(`Zepto search API failed: ${searchResponse.status}`);
    
    interface ZeptoProduct {
      name: string;
      is_available: boolean;
      mrp?: number;
      slug: string;
      id: string;
      eta_minutes?: number;
    }

    const searchData = await searchResponse.json() as { products?: ZeptoProduct[] };
    const products = searchData.products || [];
    let bestMatch: any = null;
    let matchCount = 0;

    for (const p of products) {
      const name = p.name.toLowerCase();
      const isPS5 = name.includes('ps5') || name.includes('playstation 5');
      const isConsole = name.includes('console') || name.includes('slim') || name.includes('bundle') || name.includes('edition');
      const isAccessory = name.includes('controller') || name.includes('dualsense') || name.includes('disk drive') || 
                          name.includes('remote') || name.includes('cover') || name.includes('stand') || name.includes('headset');

      if (isPS5 && (isConsole || !isAccessory)) {
        matchCount++;
        if (p.is_available) {
          if (!bestMatch || !bestMatch.is_available) {
            bestMatch = p;
          }
        } else if (!bestMatch) {
          bestMatch = p;
        }
      }
    }

    if (bestMatch) {
      return {
        inStock: bestMatch.is_available,
        price: bestMatch.mrp ? `₹${bestMatch.mrp}` : null,
        productUrl: `https://www.zepto.com/pn/${bestMatch.slug}/pids/${bestMatch.id}`,
        productName: bestMatch.name,
        deliveryTime: bestMatch.eta_minutes ? `${bestMatch.eta_minutes} mins` : '15 mins',
        listingCount: matchCount,
      };
    }

    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      listingCount: products.length,
    };
  } catch (error) {
    console.error('Zepto scraping error:', error);
    const message = error instanceof Error ? error.message : '';
    const notServiceable = /store|serviceable|geocode|pincode|API failed|403|404/i.test(message);
    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      note: notServiceable ? 'Store not available for this pincode' : undefined,
      error: true,
    };
  }
}
