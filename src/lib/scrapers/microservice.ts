import { ScrapeResult, Platform } from '../types';

const MICROSERVICE_URL = process.env.SCRAPER_API_URL || 'http://localhost:3001/scrape';

export async function callMicroservice(platform: Platform, pincode: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(MICROSERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ platform, pincode }),
    });

    if (!response.ok) {
      throw new Error(`Microservice returned status ${response.status}`);
    }

    const data = await response.json();
    return data as ScrapeResult;
  } catch (error) {
    console.error(`Error calling microservice for ${platform}:`, error);
    return {
      inStock: false,
      price: null,
      productUrl: '', // Will be filled by individual scrapers if needed or returned by service
      productName: `PS5 on ${platform}`,
      error: true,
      note: 'External scraper service unavailable',
    };
  }
}
