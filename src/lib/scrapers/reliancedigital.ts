import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';
import { fetchWithTimeout } from './fetchWithTimeout';

interface ScrapeOpts {
  maxUrls?: number;
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Fynd storefront credentials, public in the page HTML (application_id:token).
// base64("645a057875d8c4882b096f7e:__-O44-4i")
const FYND_BEARER = 'NjQ1YTA1Nzg3NWQ4YzQ4ODJiMDk2ZjdlOl9fLU80NC00aQ==';

const ALL_PRODUCT_URLS = [
  'https://www.reliancedigital.in/product/sony-playstation-5-standard-e-chassis-ds-bundle-gaming-console-mn359o-9991585',
  'https://www.reliancedigital.in/product/sony-playstation-5-digital-e-chassis-gaming-console-mn357x-9991584',
  'https://www.reliancedigital.in/product/sony-ps5-standard-sa-e-chassis-gaming-console-mmeqbt-9974618',
  'https://www.reliancedigital.in/product/sony-playstation-5-digital-console-fortnite-bundle-mk3j7r-9713761',
  'https://www.reliancedigital.in/product/sony-playstation-5-standard-console-fortnite-bundle-mk3j5b-9713760',
  'https://www.reliancedigital.in/product/sony-ps5-digital-d-chassis-gaming-console-fc26-bundle-mia2lh-9604024',
  'https://www.reliancedigital.in/product/sony-ps5-standard-d-chassis-gaming-console-fc26-bundle-mia2lh-9604025',
  'https://www.reliancedigital.in/product/sonyplaystation5standardconsolenba-mg53du-9490141',
  'https://www.reliancedigital.in/product/sony-playstation-5-digital-gaming-console-with-call-of-duty-black-ops-6-bundle-md7dk3-9288584',
  'https://www.reliancedigital.in/product/sony-playstation-5-standard-gaming-console-with-call-of-duty-black-ops-6-bundle-md7djz-9288583',
  'https://www.reliancedigital.in/product/sony-ps5-standard-console-with-2-dualsense-controllers-m7oq28-8963763',
  'https://www.reliancedigital.in/product/sony-ps5-astro-bot-bundle-standard-gaming-console-m85ewr-8976152',
  'https://www.reliancedigital.in/product/sony-ps5-astro-bot-bundle-digital-edition-gaming-console-m85ewr-8976153',
  'https://www.reliancedigital.in/product/sony-ps5-console-fortnite-bundle-m4ih5f-8764435',
  'https://www.reliancedigital.in/product/sony-ps5-digital-console-fortnite-bundle-m4ih5i-8764436',
  'https://www.reliancedigital.in/product/sony-playstation-5-digital-edition-m35xsd-8706126',
  'https://www.reliancedigital.in/product/sony-playstation-ps5-slim-console-luh1rv-7537998',
  'https://www.reliancedigital.in/product/sony-playstation-ps5-slim-digital-console-luh1rv-7537999',
];

const slugFromUrl = (url: string) => url.split('/product/')[1] ?? '';

interface FyndSize {
  is_available?: boolean;
  quantity?: number;
}

export async function scrapeRelianceDigital(pincode: string, opts: ScrapeOpts = {}): Promise<ScrapeResult> {
  const productUrls = opts.maxUrls ? ALL_PRODUCT_URLS.slice(0, opts.maxUrls) : ALL_PRODUCT_URLS;

  const headers = {
    'User-Agent': UA,
    'Accept': 'application/json, text/plain, */*',
    'authorization': `Bearer ${FYND_BEARER}`,
    'x-currency-code': 'INR',
    'x-location-detail': JSON.stringify({ country_iso_code: 'IN', pincode }),
    'Referer': 'https://www.reliancedigital.in/',
  };

  try {
    const availableItems: ScrapeResult['items'] = [];
    let bestMatch: { title: string; url: string; price: string | null; isOutOfStock: boolean } | null = null;

    const fetchPromises = productUrls.map(async (url, index) => {
      try {
        await new Promise(r => setTimeout(r, index * 150));

        const slug = slugFromUrl(url);
        const response = await fetchWithTimeout(
          `https://www.reliancedigital.in/api/service/application/catalog/v1.0/products/${slug}/sizes/`,
          { headers },
          12000
        );
        if (!response.ok) return;

        const data = await response.json();
        if (!data || typeof data.sellable !== 'boolean') return;

        const sizes: FyndSize[] = Array.isArray(data.sizes) ? data.sizes : [];
        const inStock = data.sellable && sizes.some(s => s.is_available && (s.quantity ?? 0) > 0);

        const effective = data.price?.effective?.min;
        const price = typeof effective === 'number' ? `₹${Math.round(effective).toLocaleString('en-IN')}` : null;
        const title = nameFromUrl(url);

        const item = { title, url, price, isOutOfStock: !inStock };
        if (!item.isOutOfStock && item.price) {
          availableItems!.push({ name: item.title, url: item.url, price: item.price, inStock: true });
        }
        if (!bestMatch || (bestMatch.isOutOfStock && !item.isOutOfStock)) {
          bestMatch = item;
        }
      } catch {
        // ignore individual product failures
      }
    });

    await Promise.allSettled(fetchPromises);

    if (!bestMatch) {
      return {
        inStock: false,
        price: null,
        productUrl: productUrls[0],
        productName: nameFromUrl(productUrls[0]),
        listingCount: productUrls.length,
        items: [],
        error: true,
        note: 'Reliance Digital check failed — status unknown',
      };
    }

    const match: { title: string; url: string; price: string | null; isOutOfStock: boolean } = bestMatch;
    return {
      inStock: !match.isOutOfStock,
      price: match.price,
      productUrl: match.url,
      productName: match.title,
      listingCount: productUrls.length,
      items: availableItems,
    };
  } catch (error) {
    console.error('Reliance Digital localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: productUrls[0],
      productName: nameFromUrl(productUrls[0]),
      listingCount: productUrls.length,
      error: true,
    };
  }
}
