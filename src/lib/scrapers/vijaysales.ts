import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';
import { fetchWithTimeout } from './fetchWithTimeout';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Vijay Sales exposes no pincode serviceability API (the old
// PincodeHandler.ashx is gone), so this scraper reports NATIONAL stock via
// their Magento GraphQL endpoint and marks the result scope accordingly.
const PRODUCT_URLS = [
  'https://www.vijaysales.com/p/235634/sony-playstation-ps5-disc-fortnite-bundle-edition',
  'https://www.vijaysales.com/p/235635/sony-playstation-5-slim-digital-edition-console-fortnite-cobalt-star-bundle',
  'https://www.vijaysales.com/p/254871/sony-ps5r-disc-edition-console-video-game-dual-sense-wireless-controller-bundle',
  'https://www.vijaysales.com/p/235511/sony-playstation-5-slim-digital-edition-30th-anniversary-limited-edition-bundle',
  'https://www.vijaysales.com/p/252606/sony-playstationr5-disc-sa-e-edition-console-video-game-ps5r-slim',
  'https://www.vijaysales.com/p/254870/sony-playstationr5-digital-edition-console-video-game-825gb-ps5r-slim',
];

const skuFromUrl = (url: string) => url.match(/\/p\/(\d+)\//)?.[1] ?? '';

interface VsGqlItem {
  sku: string;
  name: string;
  stock_status: 'IN_STOCK' | 'OUT_OF_STOCK';
  price_range?: { minimum_price?: { final_price?: { value?: number } } };
}

export async function scrapeVijaySales(_pincode: string): Promise<ScrapeResult> {
  const skus = PRODUCT_URLS.map(skuFromUrl).filter(Boolean);
  const urlBySku = new Map(PRODUCT_URLS.map(u => [skuFromUrl(u), u]));

  try {
    const query = `{products(filter:{sku:{in:[${skus.map(s => `"${s}"`).join(',')}]}},pageSize:${skus.length}){items{sku name stock_status price_range{minimum_price{final_price{value}}}}}}`;
    const response = await fetchWithTimeout(
      `https://www.vijaysales.com/api/graphql?query=${encodeURIComponent(query)}`,
      { headers: { 'User-Agent': UA, 'Accept': 'application/json' } },
      15000
    );

    if (!response.ok) throw new Error(`Vijay Sales GraphQL returned ${response.status}`);
    const data = await response.json();
    const items: VsGqlItem[] = data?.data?.products?.items ?? [];

    const availableItems: ScrapeResult['items'] = [];
    let bestMatch: { title: string; url: string; price: string | null; isOutOfStock: boolean } | null = null;

    for (const it of items) {
      const url = urlBySku.get(it.sku) ?? PRODUCT_URLS[0];
      const value = it.price_range?.minimum_price?.final_price?.value;
      const price = typeof value === 'number' ? `₹${Math.round(value).toLocaleString('en-IN')}` : null;
      const inStock = it.stock_status === 'IN_STOCK';

      const item = { title: it.name, url, price, isOutOfStock: !inStock };
      if (inStock && price) {
        availableItems!.push({ name: it.name, url, price, inStock: true });
      }
      if (!bestMatch || (bestMatch.isOutOfStock && !item.isOutOfStock)) {
        bestMatch = item;
      }
    }

    if (!bestMatch) {
      // GraphQL omits delisted SKUs; empty result = nothing purchasable.
      return {
        inStock: false,
        price: null,
        productUrl: PRODUCT_URLS[0],
        productName: nameFromUrl(PRODUCT_URLS[0]),
        listingCount: PRODUCT_URLS.length,
        items: [],
        scope: 'national',
      };
    }

    return {
      inStock: !bestMatch.isOutOfStock,
      price: bestMatch.price,
      productUrl: bestMatch.url,
      productName: bestMatch.title,
      listingCount: PRODUCT_URLS.length,
      items: availableItems,
      scope: 'national',
      note: 'National availability — delivery to your pincode not verified',
    };
  } catch (error) {
    console.error('Vijay Sales scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: PRODUCT_URLS[0],
      productName: nameFromUrl(PRODUCT_URLS[0]),
      listingCount: PRODUCT_URLS.length,
      error: true,
      scope: 'national',
    };
  }
}
