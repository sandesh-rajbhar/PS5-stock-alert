import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapeBlinkit } from '@/lib/scrapers/blinkit';
import { scrapeZepto } from '@/lib/scrapers/zepto';
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

    // Run scrapers in parallel
    const [blinkitResult, zeptoResult] = await Promise.all([
      scrapeBlinkit(validPincode),
      scrapeZepto(validPincode),
    ]);

    // Update database for each (caching for future users/subscribers)
    // We do this without blocking the response to keep it fast
    Promise.all([
      blinkitResult.error ? Promise.resolve() : supabaseAdmin.from('quick_commerce_stock').upsert({
        platform: 'blinkit',
        pincode: validPincode,
        in_stock: blinkitResult.inStock,
        price: blinkitResult.price,
        product_url: blinkitResult.productUrl,
        delivery_time: blinkitResult.deliveryTime,
        last_checked: new Date().toISOString(),
      }, { onConflict: 'platform,pincode' }),

      zeptoResult.error ? Promise.resolve() : supabaseAdmin.from('quick_commerce_stock').upsert({
        platform: 'zepto',
        pincode: validPincode,
        in_stock: zeptoResult.inStock,
        price: zeptoResult.price,
        product_url: zeptoResult.productUrl,
        delivery_time: zeptoResult.deliveryTime,
        last_checked: new Date().toISOString(),
      }, { onConflict: 'platform,pincode' })
    ]).catch(err => console.error('DB Cache Error:', err));

    return NextResponse.json({
      pincode: validPincode,
      results: [
        { platform: 'Blinkit', ...blinkitResult },
        { platform: 'Zepto', ...zeptoResult },
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
