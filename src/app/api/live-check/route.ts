import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapeAmazon } from '@/lib/scrapers/amazon';
import { scrapeFlipkart } from '@/lib/scrapers/flipkart';
import { scrapeCroma } from '@/lib/scrapers/croma';
import { scrapeVijaySales } from '@/lib/scrapers/vijaysales';
import { scrapeRelianceDigital } from '@/lib/scrapers/reliancedigital';

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
    // We do NOT update the global database here, because local delivery restrictions
    // for one user's pincode should not overwrite the "National Snapshot".
    const [
      amazonResult,
      flipkartResult,
      cromaResult,
      vijaySalesResult,
      relianceResult
    ] = await Promise.all([
      scrapeAmazon(validPincode),
      scrapeFlipkart(validPincode),
      scrapeCroma(validPincode),
      scrapeVijaySales(validPincode),
      scrapeRelianceDigital(validPincode)
    ]);

    return NextResponse.json({
      pincode: validPincode,
      results: [
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
