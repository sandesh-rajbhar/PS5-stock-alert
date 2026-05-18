import { ScrapeResult } from '../types';
import { callMicroservice } from './microservice';

const DEFAULT_URL = 'https://www.croma.com/sony-playstation-5-1tb-ssd-standard-disc-gaming-console-white-/p/321320';

export async function scrapeCroma(pincode: string): Promise<ScrapeResult> {
  const result = await callMicroservice('croma', pincode);
  
  if (!result.productUrl) result.productUrl = DEFAULT_URL;
  if (!result.productName || result.productName === 'PS5 on croma') {
    result.productName = 'Sony PlayStation 5';
  }
  
  return result;
}
