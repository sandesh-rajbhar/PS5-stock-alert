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
    if (!coords) {
      return {
        inStock: false,
        price: null,
        productUrl: url,
        productName: 'PS5 Console',
        note: 'Store not available for this pincode',
      };
    }

    // Blinkit API call
    const response = await fetch('https://api2.grofers.com/v2/search', {
      method: 'GET',
      headers: {
        'User-Agent': 'okhttp/4.12.0',
        'Accept': 'application/json',
        'app_client': 'consumer_android',
        'lat': coords.lat,
        'lon': coords.lon,
        'battery-level': 'EXCELLENT',
      },
    });

    if (!response.ok) {
       // Fallback to web endpoint if mobile one fails
       const webResponse = await fetch('https://blinkit.com/v2/search/', {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'app_version': '1',
            'web-version': '1',
            'device_id': 'web',
            'content-type': 'application/json',
            'Origin': 'https://blinkit.com',
            'Referer': 'https://blinkit.com/',
            'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'Cookie': `gr_1=lat%3D${coords.lat}%26lon%3D${coords.lon}`,
          },
          body: JSON.stringify({
            query: 'PS5 console',
            start: 0,
            size: 10,
          }),
        });
        if (!webResponse.ok) throw new Error(`Blinkit API failed: ${webResponse.status}`);
        return processBlinkitResponse(await webResponse.json(), url);
    }
    
    return processBlinkitResponse(await response.json(), url);
  } catch (error) {
    console.error('Blinkit scraping error:', error);
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

function processBlinkitResponse(data: any, url: string) {
    const products = data.products || [];
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
        const inventory = p.inventory !== undefined ? p.inventory : (p.status === 'available' ? 1 : 0);
        if (inventory > 0) {
          if (!bestMatch || (bestMatch.inventory === 0)) {
            bestMatch = p;
          }
        } else if (!bestMatch) {
          bestMatch = p;
        }
      }
    }

    if (bestMatch) {
      const inventory = bestMatch.inventory !== undefined ? bestMatch.inventory : (bestMatch.status === 'available' ? 1 : 0);
      return {
        inStock: inventory > 0,
        price: bestMatch.price ? `₹${bestMatch.price}` : null,
        productUrl: `https://blinkit.com/prn/x/prid/${bestMatch.id}`,
        productName: bestMatch.name,
        deliveryTime: bestMatch.eta || '10-20 mins',
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
}
