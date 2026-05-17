import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scrapeAmazon } from '@/lib/scrapers/amazon';
import { scrapeFlipkart } from '@/lib/scrapers/flipkart';
import { scrapeCroma } from '@/lib/scrapers/croma';
import { scrapeVijaySales } from '@/lib/scrapers/vijaysales';
import { scrapeRelianceDigital } from '@/lib/scrapers/reliancedigital';
import { sendStockAlert } from '@/lib/notifier';
import { ScrapeResult } from '@/lib/types';

export const maxDuration = 60;

const CRON_MAX_URLS = 5; // Trim Flipkart/Reliance lists to avoid 403s + keep cron under 10s

const PLATFORMS: { name: string; fn: (pincode: string) => Promise<ScrapeResult> }[] = [
  { name: 'amazon', fn: scrapeAmazon },
  { name: 'flipkart', fn: (p) => scrapeFlipkart(p, { maxUrls: CRON_MAX_URLS }) },
  { name: 'croma', fn: scrapeCroma },
  { name: 'vijaysales', fn: scrapeVijaySales },
  { name: 'reliancedigital', fn: (p) => scrapeRelianceDigital(p, { maxUrls: CRON_MAX_URLS }) },
];

const NATIONAL_BASELINE_PINCODE = '110001';

async function processPincode(pincode: string, isBaseline: boolean) {
  const results = await Promise.all(
    PLATFORMS.map(p =>
      p.fn(pincode).catch((e): ScrapeResult => {
        console.error(`Scraper ${p.name} crashed for ${pincode}:`, e);
        return { inStock: false, price: null, productUrl: '', productName: '', error: true };
      })
    )
  );

  await Promise.all(
    PLATFORMS.map(async (p, i) => {
      const result = results[i];
      if (result.error) return;

      const { data: prevStatus } = await supabaseAdmin
        .from('quick_commerce_stock')
        .select('in_stock')
        .eq('platform', p.name)
        .eq('pincode', pincode)
        .maybeSingle();

      const becameInStock = result.inStock && (!prevStatus || !prevStatus.in_stock);

      const cacheUpsert = supabaseAdmin.from('quick_commerce_stock').upsert(
        {
          platform: p.name,
          pincode,
          in_stock: result.inStock,
          price: result.price,
          product_url: result.productUrl,
          delivery_time: result.deliveryTime,
          last_checked: new Date().toISOString(),
        },
        { onConflict: 'platform,pincode' }
      );

      const nationalUpsert = isBaseline
        ? supabaseAdmin.from('stock_status').upsert(
            {
              platform: p.name,
              product_name: result.productName,
              in_stock: result.inStock,
              price: result.price,
              product_url: result.productUrl,
              last_checked: new Date().toISOString(),
            },
            { onConflict: 'platform' }
          )
        : Promise.resolve();

      await Promise.all([cacheUpsert, nationalUpsert]);

      if (!becameInStock) return;

      const { data: event } = await supabaseAdmin
        .from('stock_events')
        .insert({
          platform: `${p.name} (${pincode})`,
          became_in_stock: true,
          price: result.price,
          product_url: result.productUrl,
        })
        .select()
        .single();

      const { data: subscribers } = await supabaseAdmin
        .from('subscribers')
        .select('id, email, unsubscribe_token, telegram_chat_id')
        .eq('is_active', true)
        .eq('pincode', pincode);

      if (!subscribers || !event) return;

      await Promise.all(
        subscribers.map(async sub => {
          await sendStockAlert({
            email: sub.email,
            platform: p.name,
            productUrl: result.productUrl,
            price: result.price,
            deliveryTime: result.deliveryTime,
            unsubscribeToken: sub.unsubscribe_token,
            telegramChatId: sub.telegram_chat_id,
          });
          await supabaseAdmin.from('notification_log').insert({
            subscriber_id: sub.id,
            stock_event_id: event.id,
          });
        })
      );
    })
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const authHeader = request.headers.get('Authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (secret !== process.env.CRON_SECRET && bearerToken !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: pincodesData } = await supabaseAdmin
      .from('subscribers')
      .select('pincode')
      .eq('is_active', true);

    const subscriberPincodes = Array.from(new Set(pincodesData?.map(p => p.pincode) || []));
    const pincodesToCheck = Array.from(new Set([NATIONAL_BASELINE_PINCODE, ...subscriberPincodes]));

    await Promise.all(
      pincodesToCheck.map(pincode =>
        processPincode(pincode, pincode === NATIONAL_BASELINE_PINCODE)
      )
    );

    return NextResponse.json({
      success: true,
      checked_pincodes: pincodesToCheck.length,
      subscriber_pincodes: subscriberPincodes.length,
    });
  } catch (error) {
    console.error('Check stock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
