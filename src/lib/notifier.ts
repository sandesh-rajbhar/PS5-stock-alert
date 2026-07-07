import { Resend } from 'resend';
import { NotifyParams } from './types';
import { buildConnectLink, sendTelegramMessage } from './telegram';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStockAlert({
  email,
  platform,
  productUrl,
  price,
  deliveryTime,
  unsubscribeToken,
  telegramChatId,
  nationalOnly,
}: NotifyParams) {
  const subject = `🎮 PS5 is BACK IN STOCK on ${platform}!`;

  const nationalNote = nationalOnly
    ? '\n\n⚠️ <i>National stock — delivery to your pincode not verified. Check the site.</i>'
    : '';
  const tgText = `🎮 <b>PS5 is BACK IN STOCK on ${escapeHtml(platform)}!</b>\n\nPrice: <b>${escapeHtml(price || 'Check the site')}</b>\n\n<a href="${productUrl}">Buy now →</a>\n\nStock goes fast — act now!${nationalNote}`;

  // National-only stock (pincode not verified): Telegram is free, so alert
  // there with a disclaimer, but don't spend limited Resend email quota on it.
  if (!email || nationalOnly) {
    if (telegramChatId) {
      await sendTelegramMessage(telegramChatId, tgText);
    }
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #111;">PS5 is available now on ${platform.toUpperCase()}!</h2>
          <p style="font-size: 16px;">Price: <strong>${price || 'Check the site'}</strong></p>
          <div style="margin: 30px 0;">
            <a href="${productUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Buy Now on ${platform} →
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Stock goes fast — act now!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">
            You received this because you subscribed to PS5 Stock Tracker India alerts.
            <br />
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/api/unsubscribe?token=${unsubscribeToken}" style="color: #999;">
              Unsubscribe
            </a>
          </small>
        </div>
      `,
    });
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
  }

  if (telegramChatId) {
    await sendTelegramMessage(telegramChatId, tgText);
  }
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function sendConfirmationEmail(email: string, confirmToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const confirmUrl = `${baseUrl}/api/confirm?token=${encodeURIComponent(confirmToken)}`;
  const telegramLink = await buildConnectLink(confirmToken);

  const telegramBlock = telegramLink
    ? `
          <p style="color: #555; margin-top: 28px;">Want instant alerts on Telegram too?</p>
          <div style="margin: 12px 0;">
            <a href="${telegramLink}" style="background-color: #229ED9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Connect Telegram (one tap)
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">Tapping this opens Telegram and instantly links your account — no copy-pasting needed. It also confirms your email automatically.</p>`
    : '';

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'Confirm your PS5 stock alerts',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #111;">One last step 🎮</h2>
          <p>Confirm your email to start receiving PS5 stock alerts for Amazon, Flipkart, Croma, Vijay Sales, and Reliance Digital.</p>
          <div style="margin: 30px 0;">
            <a href="${confirmUrl}" style="background-color: #00439c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Confirm subscription
            </a>
          </div>
          <p style="color: #666; font-size: 13px;">If the button doesn't work, paste this link into your browser:<br /><span style="color: #2563eb; word-break: break-all;">${confirmUrl}</span></p>
          ${telegramBlock}
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">If you didn't sign up, just ignore this email — no further messages will be sent.</small>
        </div>
      `,
    });
  } catch (error) {
    console.error(`Failed to send confirmation email to ${email}:`, error);
  }
}
