import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapeBlinkit } from '@/lib/scrapers/blinkit';
import { scrapeZepto } from '@/lib/scrapers/zepto';
import { scrapeAmazon } from '@/lib/scrapers/amazon';
import { scrapeFlipkart } from '@/lib/scrapers/flipkart';
import { scrapeCroma } from '@/lib/scrapers/croma';
import { scrapeVijaySales } from '@/lib/scrapers/vijaysales';
import { scrapeRelianceDigital } from '@/lib/scrapers/reliancedigital';
import { supabaseAdmin } from '@/lib/supabase';

const checkSchema = z.object({
  pincode: z.string().length(6).regex(/^\d+$/),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');

    const result = checkSchema.safeParse({ pincode });

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid pincode format' }, { status: 400 });
    }

    const validPincode = result.data.pincode;

    // 1. Run ALL scrapers with the user's PINCODE for localized results
    const [
      blinkitResult,
      zeptoResult,
      amazonResult,
      flipkartResult,
      cromaResult,
      vijaySalesResult,
      relianceResult
    ] = await Promise.all([
      scrapeBlinkit(validPincode),
      scrapeZepto(validPincode),
      scrapeAmazon(validPincode),
      scrapeFlipkart(validPincode),
      scrapeCroma(validPincode),
      scrapeVijaySales(validPincode),
      scrapeRelianceDigital(validPincode)
    ]);

    // 2. Prepare database updates (background)
    const now = new Date().toISOString();
    
    const dbUpdates = [
      // Hyperlocal updates
      blinkitResult.error ? Promise.resolve() : supabaseAdmin.from('quick_commerce_stock').upsert({
        platform: 'blinkit',
        pincode: validPincode,
        in_stock: blinkitResult.inStock,
        price: blinkitResult.price,
        product_url: blinkitResult.productUrl,
        delivery_time: blinkitResult.deliveryTime,
        last_checked: now,
      }, { onConflict: 'platform,pincode' }),

      zeptoResult.error ? Promise.resolve() : supabaseAdmin.from('quick_commerce_stock').upsert({
        platform: 'zepto',
        pincode: validPincode,
        in_stock: zeptoResult.inStock,
        price: zeptoResult.price,
        product_url: zeptoResult.productUrl,
        delivery_time: zeptoResult.deliveryTime,
        last_checked: now,
      }, { onConflict: 'platform,pincode' }),

      // Global table updates (using localized data as the latest national snapshot)
      amazonResult.error ? Promise.resolve() : supabaseAdmin.from('stock_status').upsert({
        platform: 'amazon',
        product_name: amazonResult.productName,
        in_stock: amazonResult.inStock,
        price: amazonResult.price,
        product_url: amazonResult.productUrl,
        last_checked: now,
      }, { onConflict: 'platform' }),

      flipkartResult.error ? Promise.resolve() : supabaseAdmin.from('stock_status').upsert({
        platform: 'flipkart',
        product_name: flipkartResult.productName,
        in_stock: flipkartResult.inStock,
        price: flipkartResult.price,
        product_url: flipkartResult.productUrl,
        last_checked: now,
      }, { onConflict: 'platform' }),

      cromaResult.error ? Promise.resolve() : supabaseAdmin.from('stock_status').upsert({
        platform: 'croma',
        product_name: cromaResult.productName,
        in_stock: cromaResult.inStock,
        price: cromaResult.price,
        product_url: cromaResult.productUrl,
        last_checked: now,
      }, { onConflict: 'platform' }),

      vijaySalesResult.error ? Promise.resolve() : supabaseAdmin.from('stock_status').upsert({
        platform: 'vijaysales',
        product_name: vijaySalesResult.productName,
        in_stock: vijaySalesResult.inStock,
        price: vijaySalesResult.price,
        product_url: vijaySalesResult.productUrl,
        last_checked: now,
      }, { onConflict: 'platform' }),

      relianceResult.error ? Promise.resolve() : supabaseAdmin.from('stock_status').upsert({
        platform: 'reliancedigital',
        product_name: relianceResult.productName,
        in_stock: relianceResult.inStock,
        price: relianceResult.price,
        product_url: relianceResult.productUrl,
        last_checked: now,
      }, { onConflict: 'platform' })
    ];

    Promise.all(dbUpdates).catch(err => console.error('Live check DB update error:', err));

    return NextResponse.json({
      pincode: validPincode,
      results: [
        { platform: 'Blinkit', ...blinkitResult },
        { platform: 'Zepto', ...zeptoResult },
        { platform: 'Amazon', ...amazonResult },
        { platform: 'Flipkart', ...flipkartResult },
        { platform: 'Croma', ...cromaResult },
        { platform: 'Vijay Sales', ...vijaySalesResult },
        { platform: 'Reliance Digital', ...relianceResult }
      ],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Live check error:', error);
    return NextResponse.json({ 
      error: 'Failed to perform live check',
      details: message
    }, { status: 500 });
  }
}
