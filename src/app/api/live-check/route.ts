import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapeAmazon } from '@/lib/scrapers/amazon';
import { scrapeFlipkart } from '@/lib/scrapers/flipkart';
import { scrapeCroma } from '@/lib/scrapers/croma';
import { scrapeVijaySales } from '@/lib/scrapers/vijaysales';
import { scrapeRelianceDigital } from '@/lib/scrapers/reliancedigital';
import { supabaseAdmin } from '@/lib/supabase';
import { ScrapeResult } from '@/lib/types';

export const maxDuration = 60;

const checkSchema = z.object({
  pincode: z.string().length(6).regex(/^\d+$/),
});

// Serve from the cron-maintained cache when fresh so a live check doesn't
// burn Vercel CPU re-scraping a pincode someone (or the cron) checked minutes ago.
const CACHE_TTL_MS = 10 * 60 * 1000;

const PLATFORMS: { key: string; display: string; fn: (pincode: string) => Promise<ScrapeResult> }[] = [
  { key: 'amazon', display: 'Amazon', fn: scrapeAmazon },
  { key: 'flipkart', display: 'Flipkart', fn: scrapeFlipkart },
  { key: 'croma', display: 'Croma', fn: scrapeCroma },
  { key: 'vijaysales', display: 'Vijay Sales', fn: scrapeVijaySales },
  { key: 'reliancedigital', display: 'Reliance Digital', fn: scrapeRelianceDigital },
];

interface CacheRow {
  platform: string;
  in_stock: boolean;
  price: string | null;
  product_url: string | null;
  delivery_time: string | null;
  available_items: ScrapeResult['items'] | null;
  last_checked: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    const result = checkSchema.safeParse({ pincode });
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid pincode format' }, { status: 400 });
    }
    const validPincode = result.data.pincode;

    const { data: cachedRows } = await supabaseAdmin
      .from('quick_commerce_stock')
      .select('platform, in_stock, price, product_url, delivery_time, available_items, last_checked')
      .eq('pincode', validPincode)
      .in('platform', PLATFORMS.map(p => p.key));

    const now = Date.now();
    const freshByPlatform = new Map<string, CacheRow>();
    for (const row of (cachedRows as CacheRow[] | null) ?? []) {
      if (now - new Date(row.last_checked).getTime() < CACHE_TTL_MS) {
        freshByPlatform.set(row.platform, row);
      }
    }

    const stalePlatforms = PLATFORMS.filter(p => !freshByPlatform.has(p.key));

    const scraped = await Promise.all(
      stalePlatforms.map(p =>
        p.fn(validPincode).catch((): ScrapeResult => ({
          inStock: false,
          price: null,
          productUrl: '',
          productName: '',
          error: true,
        }))
      )
    );

    // Write-through: cache successful scrapes for subsequent checks. Errors are
    // not cached so a transient block doesn't stick for the TTL.
    const upserts = stalePlatforms
      .map((p, i) => ({ p, r: scraped[i] }))
      .filter(({ r }) => !r.error)
      .map(({ p, r }) => ({
        platform: p.key,
        pincode: validPincode,
        in_stock: r.inStock,
        price: r.price,
        product_url: r.productUrl,
        delivery_time: r.deliveryTime,
        available_items: r.items,
        last_checked: new Date().toISOString(),
      }));
    if (upserts.length > 0) {
      await supabaseAdmin
        .from('quick_commerce_stock')
        .upsert(upserts, { onConflict: 'platform,pincode' });
    }

    const results = PLATFORMS.map(p => {
      const cached = freshByPlatform.get(p.key);
      if (cached) {
        return {
          platform: p.display,
          inStock: cached.in_stock,
          price: cached.price,
          productUrl: cached.product_url,
          productName: '',
          items: cached.available_items ?? [],
          cached: true,
          ...(p.key === 'vijaysales'
            ? { scope: 'national', note: 'National availability — delivery to your pincode not verified' }
            : {}),
        };
      }
      const idx = stalePlatforms.findIndex(sp => sp.key === p.key);
      return { platform: p.display, ...scraped[idx] };
    });

    return NextResponse.json({ pincode: validPincode, results });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Live check error:', error);
    return NextResponse.json({
      error: 'Failed to perform live check',
      details: message
    }, { status: 500 });
  }
}
