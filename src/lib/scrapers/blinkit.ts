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

export async function scrapeBlinkit(pincode: string): Promise<ScrapeResult> {
  const url = 'https://blinkit.com/';
  try {
    const coords = await geocodePincode(pincode);
    if (!coords) throw new Error('Could not geocode pincode');

    // Blinkit API call
    const response = await fetch('https://blinkit.com/v2/search/', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'app_version': '1',
        'web-version': '1',
        'device_id': 'web',
        'content-type': 'application/json',
        'Cookie': `gr_1=lat%3D${coords.lat}%26lon%3D${coords.lon}`,
      },
      body: JSON.stringify({
        query: 'PS5 console',
        start: 0,
        size: 10,
      }),
    });

    if (!response.ok) throw new Error(`Blinkit API failed: ${response.status}`);
    
    interface BlinkitProduct {
      name: string;
      inventory: number;
      price?: number;
      id: string;
      eta?: string;
    }

    const data = await response.json() as { products?: BlinkitProduct[] };
    const products = data.products || [];
    let bestMatch: any = null;
    
    // Find PS5 console in results - Scan all and prioritize in-stock
    for (const p of products) {
      const name = p.name.toLowerCase();
      const isPS5 = name.includes('ps5') || name.includes('playstation 5');
      const isConsole = name.includes('console') || name.includes('slim') || name.includes('bundle') || name.includes('edition');
      const isAccessory = name.includes('controller') || name.includes('dualsense') || name.includes('disk drive') || 
                          name.includes('remote') || name.includes('cover') || name.includes('stand') || name.includes('headset');

      if (isPS5 && (isConsole || !isAccessory)) {
        if (p.inventory > 0) {
          if (!bestMatch || bestMatch.inventory === 0) {
            bestMatch = p;
          }
        } else if (!bestMatch) {
          bestMatch = p;
        }
      }
    }

    if (bestMatch) {
      return {
        inStock: bestMatch.inventory > 0,
        price: bestMatch.price ? `₹${bestMatch.price}` : null,
        productUrl: `https://blinkit.com/prn/x/prid/${bestMatch.id}`,
        productName: bestMatch.name,
        deliveryTime: bestMatch.eta || '10-20 mins',
      };
    }

    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
    };
  } catch (error) {
    console.error('Blinkit scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: url,
      productName: 'PS5 Console',
      error: true,
    };
  }
}
