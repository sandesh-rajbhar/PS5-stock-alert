import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { scrapeAmazon } from '@/lib/scrapers/amazon';
import { scrapeFlipkart } from '@/lib/scrapers/flipkart';
import { scrapeCroma } from '@/lib/scrapers/croma';
import { scrapeVijaySales } from '@/lib/scrapers/vijaysales';
import { scrapeRelianceDigital } from '@/lib/scrapers/reliancedigital';
import { scrapeJioMart } from '@/lib/scrapers/jiomart';
import { scrapeBlinkit } from '@/lib/scrapers/blinkit';
import { scrapeZepto } from '@/lib/scrapers/zepto';
import { sendStockAlert } from '@/lib/notifier';
import { Platform, ScrapeResult } from '@/lib/types';

export const maxDuration = 60; // Extend timeout for hobby plan (if possible) or just stay efficient

async function handleStandardPlatform(platform: Platform, scrapeFn: () => Promise<ScrapeResult>) {
  const result = await scrapeFn();
  if (result.error) return;

  // Get previous status
  const { data: prevStatus } = await supabaseAdmin
    .from('stock_status')
    .select('in_stock')
    .eq('platform', platform)
    .single();

  const becameInStock = result.inStock && (!prevStatus || !prevStatus.in_stock);

  // Update DB
  await supabaseAdmin.from('stock_status').upsert({
    platform,
    product_name: result.productName,
    in_stock: result.inStock,
    price: result.price,
    product_url: result.productUrl,
    last_checked: new Date().toISOString(),
  }, { onConflict: 'platform' });

  if (becameInStock) {
    // Log event
    const { data: event } = await supabaseAdmin.from('stock_events').insert({
      platform,
      became_in_stock: true,
      price: result.price,
      product_url: result.productUrl,
    }).select().single();

    // Notify all active subscribers
    const { data: subscribers } = await supabaseAdmin
      .from('subscribers')
      .select('id, email, unsubscribe_token')
      .eq('is_active', true);

    if (subscribers && event) {
      for (const sub of subscribers) {
        await sendStockAlert({
          email: sub.email,
          platform,
          productUrl: result.productUrl,
          price: result.price,
          unsubscribeToken: sub.unsubscribe_token,
        });
        
        // Log notification
        await supabaseAdmin.from('notification_log').insert({
          subscriber_id: sub.id,
          stock_event_id: event.id,
        });
      }
    }
  }
}

async function handleQuickCommerce(pincode: string) {
  const platforms: ('blinkit' | 'zepto')[] = ['blinkit', 'zepto'];
  
  for (const platform of platforms) {
    const scrapeFn = platform === 'blinkit' ? scrapeBlinkit : scrapeZepto;
    const result = await scrapeFn(pincode);
    if (result.error) continue;

    // Check status for this pincode
    const { data: prevStatus } = await supabaseAdmin
      .from('quick_commerce_stock')
      .select('in_stock')
      .eq('platform', platform)
      .eq('pincode', pincode)
      .single();

    const becameInStock = result.inStock && (!prevStatus || !prevStatus.in_stock);

    await supabaseAdmin.from('quick_commerce_stock').upsert({
      platform,
      pincode,
      in_stock: result.inStock,
      price: result.price,
      product_url: result.productUrl,
      delivery_time: result.deliveryTime,
      last_checked: new Date().toISOString(),
    }, { onConflict: 'platform,pincode' });

    if (becameInStock) {
       const { data: event } = await supabaseAdmin.from('stock_events').insert({
        platform: `${platform} (${pincode})`,
        became_in_stock: true,
        price: result.price,
        product_url: result.productUrl,
      }).select().single();

      // Notify only subscribers with THIS pincode
      const { data: subscribers } = await supabaseAdmin
        .from('subscribers')
        .select('id, email, unsubscribe_token')
        .eq('is_active', true)
        .eq('pincode', pincode);

      if (subscribers && event) {
        for (const sub of subscribers) {
          await sendStockAlert({
            email: sub.email,
            platform,
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
    
    // Small delay between platforms per pincode
    await new Promise(r => setTimeout(r, 500));
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('Authorization')?.replace('Bearer ', '');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Check Standard Platforms
    await Promise.allSettled([
      handleStandardPlatform('amazon', scrapeAmazon),
      handleStandardPlatform('flipkart', scrapeFlipkart),
      handleStandardPlatform('croma', scrapeCroma),
      handleStandardPlatform('vijaysales', scrapeVijaySales),
      handleStandardPlatform('reliancedigital', scrapeRelianceDigital),
      handleStandardPlatform('jiomart', scrapeJioMart),
    ]);

    // 2. Check Quick Commerce for Unique Pincodes
    const { data: pincodesData } = await supabaseAdmin
      .from('subscribers')
      .select('pincode')
      .eq('is_active', true);

    const uniquePincodes = Array.from(new Set(pincodesData?.map(p => p.pincode) || []));

    for (const pincode of uniquePincodes) {
      await handleQuickCommerce(pincode);
      // Delay between pincode batches
      await new Promise(r => setTimeout(r, 1000));
    }

    return NextResponse.json({ success: true, checked_pincodes: uniquePincodes.length });
  } catch (error) {
    console.error('Check stock error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
