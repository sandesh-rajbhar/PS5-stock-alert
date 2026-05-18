import { ScrapeResult } from '../types';
import { callMicroservice } from './microservice';

const DEFAULT_URL = 'https://www.reliancedigital.in/product/sony-ps5-standard-console-with-2-dualsense-controllers-m7oq28-8963763';

export async function scrapeRelianceDigital(pincode: string): Promise<ScrapeResult> {
  const result = await callMicroservice('reliancedigital', pincode);
  
  if (!result.productUrl) result.productUrl = DEFAULT_URL;
  if (!result.productName || result.productName === 'PS5 on reliancedigital') {
    result.productName = 'Sony PlayStation 5';
  }
  
  return result;
}
