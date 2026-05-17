import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse(renderPage('Invalid link', 'This confirmation link is missing a token.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    const { data: subscriber, error: lookupErr } = await supabaseAdmin
      .from('subscribers')
      .select('id, email, is_active')
      .eq('confirm_token', token)
      .maybeSingle();

    if (lookupErr) throw lookupErr;

    if (!subscriber) {
      return new NextResponse(renderPage('Link expired or invalid', 'This confirmation link is no longer valid. Try subscribing again.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (subscriber.is_active) {
      return new NextResponse(renderPage('Already confirmed', `Your subscription for ${subscriber.email} is already active. You'll get alerts when PS5 is back in stock.`), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('subscribers')
      .update({ is_active: true })
      .eq('id', subscriber.id);

    if (updateErr) throw updateErr;

    return new NextResponse(renderPage('Subscription confirmed!', `Alerts are now active for ${subscriber.email}. We'll email you the moment PS5 is back in stock.`), {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Confirm error:', error);
    return new NextResponse(renderPage('Something went wrong', 'Please try the confirmation link again in a few minutes.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

function renderPage(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title} — PS5 Stock Tracker</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 80px auto; padding: 24px; color: #111; }
  h1 { font-size: 28px; margin-bottom: 12px; }
  p { color: #555; font-size: 16px; line-height: 1.5; }
  a { display: inline-block; margin-top: 24px; background: #00439c; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
  <h1>${title}</h1>
  <p>${body}</p>
  <a href="${process.env.NEXT_PUBLIC_APP_URL || '/'}">Back to PS5 Tracker</a>
</body>
</html>`;
}
