import { NextResponse } from 'next/server';
import { z } from 'zod';
import { scrapeBlinkit } from '@/lib/scrapers/blinkit';
import { scrapeZepto } from '@/lib/scrapers/zepto';
import { scrapeInstamart } from '@/lib/scrapers/instamart';

export const maxDuration = 30;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const checkSchema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const result = checkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid lat/lng' }, { status: 400 });
    }

    const { lat, lng } = result.data;

    const [blinkit, zepto, instamart] = await Promise.all([
      scrapeBlinkit(lat, lng),
      scrapeZepto(lat, lng),
      scrapeInstamart(lat, lng),
    ]);

    return NextResponse.json({
      lat,
      lng,
      results: [
        { platform: 'Blinkit', ...blinkit },
        { platform: 'Zepto', ...zepto },
        { platform: 'Instamart', ...instamart },
      ],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('QC live-check error:', error);
    return NextResponse.json({
      error: 'Failed to perform quick-commerce check',
      details: message,
    }, { status: 500 });
  }
}
