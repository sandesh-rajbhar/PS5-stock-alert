import { ScrapeResult } from '../types';
import { callMicroservice } from './microservice';

const DEFAULT_URL = 'https://www.vijaysales.com/p/254871/sony-ps5r-disc-edition-console-video-game-dual-sense-wireless-controller-bundle';

export async function scrapeVijaySales(pincode: string): Promise<ScrapeResult> {
  const result = await callMicroservice('vijaysales', pincode);
  
  if (!result.productUrl) result.productUrl = DEFAULT_URL;
  if (!result.productName || result.productName === 'PS5 on vijaysales') {
    result.productName = 'Sony PlayStation 5';
  }
  
  return result;
}
