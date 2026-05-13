import fetch from 'node-fetch';
import { ScrapeResult } from '../types';

async function geocodePincode(pincode: string): Promise<{ lat: string; lon: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PS5StockAlertIndia/1.0',
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
    
    // Find PS5 console in results
    const ps5 = products.find((p) => 
      p.name.toLowerCase().includes('ps5') || p.name.toLowerCase().includes('playstation 5')
    );

    if (ps5) {
      return {
        inStock: ps5.inventory > 0,
        price: ps5.price ? `₹${ps5.price}` : null,
        productUrl: `https://blinkit.com/prn/x/prid/${ps5.id}`,
        productName: ps5.name,
        deliveryTime: ps5.eta || '10-20 mins',
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
