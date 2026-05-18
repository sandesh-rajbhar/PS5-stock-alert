import { ScrapeResult } from '../types';
import { callMicroservice } from './microservice';

const DEFAULT_URL = 'https://www.amazon.in/Sony-PlaysStation-Console-Storage-Capacity/dp/B0CWH9WCWT';

export async function scrapeAmazon(pincode: string): Promise<ScrapeResult> {
  const result = await callMicroservice('amazon', pincode);
  
  // Ensure we have a valid product URL and name if the microservice failed
  if (!result.productUrl) result.productUrl = DEFAULT_URL;
  if (!result.productName || result.productName === 'PS5 on amazon') {
    result.productName = 'Sony PlayStation 5';
  }
  
  return result;
}
