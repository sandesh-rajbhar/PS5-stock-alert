import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .update({ is_active: false })
      .eq('unsubscribe_token', token);

    if (error) throw error;

    return new NextResponse('<h1>Successfully unsubscribed</h1><p>You will no longer receive PS5 stock alerts.</p>', {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
