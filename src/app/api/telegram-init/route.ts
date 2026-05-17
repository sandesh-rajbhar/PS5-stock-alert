import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { buildConnectLink } from '@/lib/telegram';

const initSchema = z.object({
  pincode: z.string().length(6).regex(/^\d+$/),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = initSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 });
    }

    const { pincode } = result.data;
    const confirmToken = randomUUID();

    const { error } = await supabaseAdmin
      .from('subscribers')
      .insert({
        email: null,
        pincode,
        is_active: false,
        notify_email: false,
        confirm_token: confirmToken,
      });

    if (error) throw error;

    const telegramLink = await buildConnectLink(confirmToken);

    if (!telegramLink) {
      return NextResponse.json(
        { error: 'Telegram bot not configured. Please use email instead.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, telegramLink });
  } catch (error) {
    console.error('Telegram init error:', error);
    return NextResponse.json({ error: 'Failed to initialize Telegram link' }, { status: 500 });
  }
}
