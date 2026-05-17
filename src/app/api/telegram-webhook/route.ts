import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramMessage } from '@/lib/telegram';

interface TelegramUpdate {
  message?: {
    chat?: { id: number };
    text?: string;
  };
}

export async function POST(request: Request) {
  const secret = request.headers.get('x-telegram-bot-api-secret-token');
  if (!process.env.TELEGRAM_WEBHOOK_SECRET || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: true });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text?.trim() || '';
  if (!chatId) return NextResponse.json({ ok: true });

  const startMatch = text.match(/^\/start(?:\s+(\S+))?$/i);
  if (startMatch) {
    const payload = startMatch[1];
    if (!payload) {
      await sendTelegramMessage(
        String(chatId),
        'Hi! Open the confirmation email from PS5 Stock Tracker and tap "Connect Telegram" to link your account.'
      );
      return NextResponse.json({ ok: true });
    }

    const { data: subscriber, error } = await supabaseAdmin
      .from('subscribers')
      .select('id, email')
      .eq('confirm_token', payload)
      .maybeSingle();

    if (error || !subscriber) {
      await sendTelegramMessage(
        String(chatId),
        'That link is invalid or expired. Subscribe again at psalerts.shop and use the new link.'
      );
      return NextResponse.json({ ok: true });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('subscribers')
      .update({ telegram_chat_id: String(chatId), is_active: true })
      .eq('id', subscriber.id);

    if (updateErr) {
      console.error('Telegram link update failed:', updateErr);
      await sendTelegramMessage(String(chatId), 'Something went wrong linking your account. Try again in a moment.');
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(
      String(chatId),
      `✅ Linked!\n\nYou'll get instant Telegram alerts for <b>${subscriber.email}</b> the moment PS5 is back in stock.`
    );
    return NextResponse.json({ ok: true });
  }

  if (/^\/stop\b/i.test(text)) {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .update({ telegram_chat_id: null })
      .eq('telegram_chat_id', String(chatId));
    if (error) console.error('Telegram unlink failed:', error);
    await sendTelegramMessage(String(chatId), 'Telegram alerts disabled. Email alerts (if any) remain active.');
    return NextResponse.json({ ok: true });
  }

  await sendTelegramMessage(
    String(chatId),
    'Commands:\n/start <token> — link your subscription\n/stop — disable Telegram alerts'
  );
  return NextResponse.json({ ok: true });
}
