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
        'User-Agent': 'Mozilla/5.0',
      },
    });
    
    if (!storeResponse.ok) throw new Error(`Zepto store API failed: ${storeResponse.status}`);
    const storeData = await storeResponse.json() as { store_id: string };
    const storeId = storeData.store_id;

    if (!storeId) throw new Error('No Zepto store found for this pincode');

    // 2. Search products
    const searchResponse = await fetch(`https://api.zeptonow.com/api/v2/search/?query=ps5&store_id=${storeId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
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

    const ps5 = products.find((p) => 
      p.name.toLowerCase().includes('ps5') || p.name.toLowerCase().includes('playstation 5')
    );

    if (ps5) {
      return {
        inStock: ps5.is_available,
        price: ps5.mrp ? `₹${ps5.mrp}` : null,
        productUrl: `https://www.zeptonow.com/pn/${ps5.slug}/pids/${ps5.id}`,
        productName: ps5.name,
        deliveryTime: ps5.eta_minutes ? `${ps5.eta_minutes} mins` : '15 mins',
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
