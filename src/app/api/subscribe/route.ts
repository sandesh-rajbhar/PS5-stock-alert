import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSubscriptionConfirmation } from '@/lib/notifier';

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

    // Upsert subscriber
    const { error } = await supabaseAdmin
      .from('subscribers')
      .upsert({ email, pincode, is_active: true }, { onConflict: 'email' });

    if (error) throw error;

    // Send confirmation email (don't await to keep response fast)
    sendSubscriptionConfirmation(email).catch(console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
