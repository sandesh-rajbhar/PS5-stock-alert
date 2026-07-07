import { ScrapeResult } from '../types';
import { nameFromUrl } from './nameFromUrl';
import { fetchWithTimeout } from './fetchWithTimeout';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Public web-app key shipped in Croma's frontend bundle (main.*.chunk.js).
const APIM_SUBSCRIPTION_KEY = '1131858141634e2abe2efb2b3a2a2a5d';

const PRODUCT_URLS = [
  'https://www.croma.com/sony-playstation-5-1tb-ssd-standard-gaming-console-with-ea-sports-fc26-bundle-white-/p/319455',
  'https://www.croma.com/sony-playstation-5-1tb-ssd-digital-gaming-console-with-ea-sports-fc26-bundle-white-/p/319456',
  'https://www.croma.com/sony-playstation-5-1tb-ssd-standard-disc-gaming-console-with-fortnite-bundle-white-/p/320033',
  'https://www.croma.com/sony-playstation-5-1tb-ssd-slim-gaming-console-with-nba-2k26-white-/p/318700',
  'https://www.croma.com/sony-playstation-5-1tb-ssd-digital-gaming-console-with-fortnite-bundle-white-/p/320034',
  'https://www.croma.com/sony-dual-sense-playstation-5-1tb-ssd-standard-gaming-console-bundle-white-/p/322191',
  'https://www.croma.com/sony-playstation-5-1tb-ssd-standard-disc-gaming-console-white-/p/321320',
  'https://www.croma.com/sony-playstation-5-825-gb-hdd-digital-edition-gaming-console-white-/p/322190',
  'https://www.croma.com/sony-playstation-5-1tb-ssd-digital-slim-gaming-console-with-cod-white-/p/316950',
  'https://www.croma.com/sony-playstation-5-1tb-ssd-disc-edition-slim-gaming-console-with-cod-white-/p/316949',
  'https://www.croma.com/sony-playstation-5-1tb-ssd-digital-edition-slim-gaming-console-white-/p/316841',
  'https://www.croma.com/sony-playstation-5-slim-1tb-ssd-gaming-console-white-/p/305985',
];

const skuFromUrl = (url: string) => url.match(/\/p\/(\d+)/)?.[1] ?? '';

interface PriceRow {
  itemId: string;
  sellingPriceValue?: string;
}

export async function scrapeCroma(pincode: string): Promise<ScrapeResult> {
  const headers = {
    'User-Agent': UA,
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://www.croma.com',
    'Referer': 'https://www.croma.com/',
    'oms-apim-subscription-key': APIM_SUBSCRIPTION_KEY,
  };

  try {
    // Croma's PDP decides "deliverable to pincode" via this OMS promise call
    // (verified against the site's own network traffic). One batched request
    // covers every SKU — no HTML fetching or DOM parsing.
    const promiseLine = PRODUCT_URLS.map((url, i) => ({
      fulfillmentType: 'HDEL',
      mch: '',
      itemID: skuFromUrl(url),
      lineId: String(i + 1),
      categoryType: '',
      reqEndDate: '2500-01-01',
      reqStartDate: '',
      requiredQty: '1',
      shipToAddress: {
        company: '', country: '', city: '', mobilePhone: '', state: '',
        zipCode: pincode,
        extn: { irlAddressLine1: '', irlAddressLine2: '' },
      },
      extn: { widerStoreFlag: 'N' },
    }));

    const response = await fetchWithTimeout('https://api.croma.com/inventory/oms/v2/tms/details-pwa/', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        promise: {
          allocationRuleID: 'SYSTEM',
          checkInventory: 'Y',
          organizationCode: 'CROMA',
          sourcingClassification: 'EC',
          promiseLines: { promiseLine },
        },
      }),
    }, 15000);

    if (!response.ok) throw new Error(`Croma OMS API returned ${response.status}`);
    const data = await response.json();

    const okLines: { itemID?: string }[] =
      data?.promise?.suggestedOption?.option?.promiseLines?.promiseLine ?? [];
    const deliverableSkus = new Set(okLines.map(l => String(l.itemID)).filter(Boolean));
    const availableUrls = PRODUCT_URLS.filter(u => deliverableSkus.has(skuFromUrl(u)));

    // Batch price lookup only when something is deliverable.
    const priceBySku = new Map<string, string>();
    if (availableUrls.length > 0) {
      try {
        const ids = availableUrls.map(skuFromUrl).join(',');
        const priceRes = await fetchWithTimeout(
          `https://api.croma.com/pricing-services/v2/price/national?itemIds=${ids}&pincode=${pincode}`,
          { headers: { ...headers, channel: 'EC' } },
          10000
        );
        if (priceRes.ok) {
          const priceData = await priceRes.json();
          for (const row of (priceData?.pricelist ?? []) as PriceRow[]) {
            const v = row.sellingPriceValue ? Math.round(parseFloat(row.sellingPriceValue)) : NaN;
            if (!Number.isNaN(v)) priceBySku.set(row.itemId, `₹${v.toLocaleString('en-IN')}`);
          }
        }
      } catch { /* prices stay null */ }
    }

    const availableItems: ScrapeResult['items'] = availableUrls.map(url => ({
      name: nameFromUrl(url),
      url,
      price: priceBySku.get(skuFromUrl(url)) ?? null,
      inStock: true,
    }));

    const best = availableItems && availableItems.length > 0 ? availableItems[0] : null;

    return {
      inStock: availableUrls.length > 0,
      price: best?.price ?? null,
      productUrl: best?.url ?? PRODUCT_URLS[0],
      productName: best?.name ?? nameFromUrl(PRODUCT_URLS[0]),
      listingCount: PRODUCT_URLS.length,
      items: availableItems,
    };
  } catch (error) {
    console.error('Croma localized scraping error:', error);
    return {
      inStock: false,
      price: null,
      productUrl: PRODUCT_URLS[0],
      productName: nameFromUrl(PRODUCT_URLS[0]),
      listingCount: PRODUCT_URLS.length,
      error: true,
    };
  }
}
