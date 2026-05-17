import { NextResponse } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { sendConfirmationEmail } from '@/lib/notifier';
import { buildConnectLink } from '@/lib/telegram';

const subscribeSchema = z.object({
  email: z.string().email(),
  pincode: z.string().length(6).regex(/^\d+$/),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid email or pincode' }, { status: 400 });
    }

    const { email, pincode } = result.data;

    const { data: existing } = await supabaseAdmin
      .from('subscribers')
      .select('id, is_active, confirm_token')
      .eq('email', email)
      .maybeSingle();

    if (existing?.is_active) {
      // Update pincode silently if it changed; user already opted in.
      await supabaseAdmin
        .from('subscribers')
        .update({ pincode })
        .eq('id', existing.id);
      const telegramLink = await buildConnectLink(existing.confirm_token);
      return NextResponse.json({ success: true, status: 'already_active', telegramLink });
    }

    const confirmToken = randomUUID();

    if (existing) {
      // Inactive existing row — refresh token + pincode, resend confirmation.
      const { error } = await supabaseAdmin
        .from('subscribers')
        .update({ pincode, confirm_token: confirmToken })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from('subscribers')
        .insert({ email, pincode, is_active: false, confirm_token: confirmToken });
      if (error) throw error;
    }

    const telegramLink = await buildConnectLink(confirmToken);

    // Fire-and-forget email (best-effort, may fail if Resend not fully set up)
    sendConfirmationEmail(email, confirmToken).catch(console.error);

    return NextResponse.json({
      success: true,
      status: 'pending_confirmation',
      telegramLink,
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
