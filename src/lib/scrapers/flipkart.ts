import { ScrapeResult } from '../types';
import { callMicroservice } from './microservice';

const DEFAULT_URL = 'https://www.flipkart.com/sony-playstation-5-console-825-gb/p/itm62f0f8b3c0bfb';

export async function scrapeFlipkart(pincode: string): Promise<ScrapeResult> {
  const result = await callMicroservice('flipkart', pincode);
  
  if (!result.productUrl) result.productUrl = DEFAULT_URL;
  if (!result.productName || result.productName === 'PS5 on flipkart') {
    result.productName = 'Sony PlayStation 5';
  }
  
  return result;
}
