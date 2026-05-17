import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scrapeAmazon } from '@/lib/scrapers/amazon';
import { scrapeFlipkart } from '@/lib/scrapers/flipkart';
import { scrapeCroma } from '@/lib/scrapers/croma';
import { scrapeVijaySales } from '@/lib/scrapers/vijaysales';
import { scrapeRelianceDigital } from '@/lib/scrapers/reliancedigital';
import { scrapeBlinkit } from '@/lib/scrapers/blinkit';
import { scrapeZepto } from '@/lib/scrapers/zepto';
import { sendStockAlert } from '@/lib/notifier';
import { Platform, ScrapeResult } from '@/lib/types';

export const maxDuration = 60; // Extend timeout for hobby plan (if possible) or just stay efficient

async function checkAllPlatformsForPincode(pincode: string) {
  const platforms = [
    { name: 'amazon', fn: scrapeAmazon },
    { name: 'flipkart', fn: scrapeFlipkart },
    { name: 'croma', fn: scrapeCroma },
    { name: 'vijaysales', fn: scrapeVijaySales },
    { name: 'reliancedigital', fn: scrapeRelianceDigital },
    { name: 'blinkit', fn: scrapeBlinkit },
    { name: 'zepto', fn: scrapeZepto }
  ];

  for (const p of platforms) {
    try {
      const result = await p.fn(pincode);
      if (result.error) continue;

      const isQuickCommerce = ['blinkit', 'zepto'].includes(p.name);
      
      // 1. Get previous status for THIS pincode and platform
      const table = isQuickCommerce ? 'quick_commerce_stock' : 'pincode_stock_cache';
      
      // Note: We need a cache table for standard platforms too if we want to track per-pincode stock-ins accurately
      // For now, let's use the quick_commerce_stock table structure for ALL pincode-specific checks
      const { data: prevStatus } = await supabaseAdmin
        .from('quick_commerce_stock')
        .select('in_stock')
        .eq('platform', p.name)
        .eq('pincode', pincode)
        .single();

      const becameInStock = result.inStock && (!prevStatus || !prevStatus.in_stock);

      // 2. Update Pincode Cache
      await supabaseAdmin.from('quick_commerce_stock').upsert({
        platform: p.name,
        pincode,
        in_stock: result.inStock,
        price: result.price,
        product_url: result.productUrl,
        delivery_time: result.deliveryTime,
        last_checked: new Date().toISOString(),
      }, { onConflict: 'platform,pincode' });

      // 3. Notify if stock appeared
      if (becameInStock) {
        const { data: event } = await supabaseAdmin.from('stock_events').insert({
          platform: `${p.name} (${pincode})`,
          became_in_stock: true,
          price: result.price,
          product_url: result.productUrl,
        }).select().single();

        const { data: subscribers } = await supabaseAdmin
          .from('subscribers')
          .select('id, email, unsubscribe_token')
          .eq('is_active', true)
          .eq('pincode', pincode);

        if (subscribers && event) {
          for (const sub of subscribers) {
            await sendStockAlert({
              email: sub.email,
              platform: p.name,
              productUrl: result.productUrl,
              price: result.price,
              deliveryTime: result.deliveryTime,
              unsubscribeToken: sub.unsubscribe_token,
            });
            
            await supabaseAdmin.from('notification_log').insert({
              subscriber_id: sub.id,
              stock_event_id: event.id,
            });
          }
        }
      }
      
      // Delay between platforms to avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.error(`Error checking ${p.name} for ${pincode}:`, e);
    }
  }
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
    // 1. Update National Snapshot (Baseline for dashboard)
    const defaultPincode = '110001';
    const standardPlatforms = [
      { name: 'amazon', fn: scrapeAmazon },
      { name: 'flipkart', fn: scrapeFlipkart },
      { name: 'croma', fn: scrapeCroma },
      { name: 'vijaysales', fn: scrapeVijaySales },
      { name: 'reliancedigital', fn: scrapeRelianceDigital }
    ];

    for (const p of standardPlatforms) {
      const result = await p.fn(defaultPincode);
      if (!result.error) {
        await supabaseAdmin.from('stock_status').upsert({
          platform: p.name,
          product_name: result.productName,
          in_stock: result.inStock,
          price: result.price,
          product_url: result.productUrl,
          last_checked: new Date().toISOString(),
        }, { onConflict: 'platform' });
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    // 2. Localized Checks for Subscribers
    const { data: pincodesData } = await supabaseAdmin
      .from('subscribers')
      .select('pincode')
      .eq('is_active', true);

    const uniquePincodes = Array.from(new Set(pincodesData?.map(p => p.pincode) || []));

    for (const pincode of uniquePincodes) {
      await checkAllPlatformsForPincode(pincode);
      await new Promise(r => setTimeout(r, 2000)); // Larger delay between pincode batches
    }

    return NextResponse.json({ success: true, checked_pincodes: uniquePincodes.length });
  } catch (error) {
    console.error('Check stock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
