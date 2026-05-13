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
  const url = 'https://www.zeptonow.com/';
  try {
    const coords = await geocodePincode(pincode);
    if (!coords) throw new Error('Could not geocode pincode');

    // 1. Get store ID
    const storeResponse = await fetch('https://api.zeptonow.com/api/v2/store/', {
      headers: {
        'lat': coords.lat,
        'lon': coords.lon,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    
    if (!storeResponse.ok) throw new Error(`Zepto store API failed: ${storeResponse.status}`);
    const storeData = await storeResponse.json() as { store_id: string };
    const storeId = storeData.store_id;

    if (!storeId) throw new Error('No Zepto store found for this pincode');

    // 2. Search products
    const searchResponse = await fetch(`https://api.zeptonow.com/api/v2/search/?query=ps5&store_id=${storeId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
      // Console/Bundle check
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
        productUrl: `https://www.zeptonow.com/pn/${bestMatch.slug}/pids/${bestMatch.id}`,
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
    };
  } catch (error) {
    console.error('Zepto scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      error: true,
    };
  }
}
