import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const maxDuration = 30;
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Diagnostic endpoint to inspect actual responses from quick-commerce platforms
// Usage: /api/qc-debug?lat=X&lng=Y&platform=blinkit|zepto|instamart

const TARGETS = {
  blinkit: {
    base: 'https://blinkit.com',
    paths: [
      '/prn/sony-ps5-standard-standalone-console-white/prid/547909',
      '/prn/sony-ps5-console-slim/prid/547392',
    ],
    cookies: (lat: number, lng: number) => [
      `gr_1_lat=${lat}`,
      `gr_1_lon=${lng}`,
      `gr_1_locality=1`,
    ].join('; '),
  },
  zepto: {
    base: 'https://www.zepto.com',
    paths: ['/pn/sony-playstation-5-gaming-console-slim/pvid/ad968d7d-c5d8-415e-b7d4-58f84ff13076'],
    cookies: (lat: number, lng: number) => [
      `user_lat=${lat}`,
      `user_lng=${lng}`,
      `latitude=${lat}`,
      `longitude=${lng}`,
    ].join('; '),
  },
  instamart: {
    base: 'https://www.swiggy.com',
    paths: ['/instamart/p/sony-ps5-1tb-slim-cd-version-single-controller-console-BDFUT1SDIF'],
    cookies: (lat: number, lng: number) => {
      const userLocation = encodeURIComponent(JSON.stringify({ lat, lng }));
      return [`userLocation=${userLocation}`, `lat=${lat}`, `lng=${lng}`].join('; ');
    },
  },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '');
  const lng = parseFloat(searchParams.get('lng') || '');
  const platform = (searchParams.get('platform') || 'blinkit').toLowerCase() as keyof typeof TARGETS;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat & lng query params required' }, { status: 400 });
  }
  const target = TARGETS[platform];
  if (!target) {
    return NextResponse.json({ error: 'platform must be blinkit|zepto|instamart' }, { status: 400 });
  }

  const cookies = target.cookies(lat, lng);
  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-IN,en;q=0.9',
    'Referer': `${target.base}/`,
    'Cookie': cookies,
  };

  const out: any[] = [];
  for (const path of target.paths) {
    const url = `${target.base}${path}`;
    try {
      const res = await fetch(url, { headers, redirect: 'follow' });
      const html = await res.text();
      const $ = cheerio.load(html);

      // Probe well-known SSR state slots
      const nextData = $('#__NEXT_DATA__').html();
      let nextDataKeys: string[] = [];
      let pageProps: any = null;
      if (nextData) {
        try {
          const parsed = JSON.parse(nextData);
          pageProps = parsed?.props?.pageProps || {};
          nextDataKeys = Object.keys(pageProps);
        } catch {}
      }

      const initialStateMatch = html.match(/window\.___INITIAL_STATE___\s*=\s*({[\s\S]*?});\s*<\/script>/);
      const reduxStateMatch = html.match(/window\.__REDUX_STATE__\s*=\s*({[\s\S]*?});\s*<\/script>/);

      // Common stock signals
      const lower = html.toLowerCase();
      const signals = {
        hasNotifyMe: lower.includes('notify me'),
        hasOutOfStock: lower.includes('out of stock'),
        hasNotServiceable: lower.includes('not serviceable') || lower.includes('not deliverable'),
        hasAddToCart: /add\s*to\s*cart/i.test(html),
        hasChangeLocation: lower.includes('change location'),
        rupeesMatches: (html.match(/₹\s*[\d,]+/g) || []).slice(0, 5),
      };

      out.push({
        url,
        status: res.status,
        bytes: html.length,
        contentType: res.headers.get('content-type'),
        hasNextData: !!nextData,
        nextDataKeys: nextDataKeys.slice(0, 30),
        nextDataPreview: pageProps ? JSON.stringify(pageProps).slice(0, 1500) : null,
        hasInitialState: !!initialStateMatch,
        initialStatePreview: initialStateMatch ? initialStateMatch[1].slice(0, 1500) : null,
        hasReduxState: !!reduxStateMatch,
        signals,
        htmlHead: html.slice(0, 600),
      });
    } catch (e: any) {
      out.push({ url, error: e.message });
    }
  }

  return NextResponse.json({ platform, lat, lng, cookies, results: out });
}
