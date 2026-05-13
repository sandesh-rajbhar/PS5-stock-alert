import { Resend } from 'resend';
import { NotifyParams } from './types';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendStockAlert({
  email,
  platform,
  productUrl,
  price,
  deliveryTime,
  unsubscribeToken,
}: NotifyParams) {
  const isQuickCommerce = ['blinkit', 'zepto'].includes(platform.toLowerCase());
  const subject = isQuickCommerce
    ? `⚡ PS5 available for ${deliveryTime} delivery on ${platform}!`
    : `🎮 PS5 is BACK IN STOCK on ${platform}!`;

  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #111;">PS5 is available now on ${platform.toUpperCase()}!</h2>
          ${isQuickCommerce ? `<p style="font-size: 18px; color: #e11d48;">🚀 Delivery in: <strong>${deliveryTime}</strong></p>` : ''}
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
}

export async function sendSubscriptionConfirmation(email: string) {
  try {
    await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: email,
      subject: 'You\'re subscribed! PS5 Stock Tracker India',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #111;">Subscription Confirmed! 🎮</h2>
          <p>We'll alert you the moment PS5 is available on Amazon, Flipkart, Croma, Vijay Sales, Blinkit, or Zepto.</p>
          <p>You can sit back and relax while we do the watching for you.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <small style="color: #999;">
            PS5 Stock Tracker India
          </small>
        </div>
      `,
    });
  } catch (error) {
    console.error(`Failed to send confirmation email to ${email}:`, error);
  }
}
