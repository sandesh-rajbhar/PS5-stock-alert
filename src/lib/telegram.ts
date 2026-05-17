const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = BOT_TOKEN ? `https://api.telegram.org/bot${BOT_TOKEN}` : null;

let cachedUsername: string | null = null;

export async function getBotUsername(): Promise<string | null> {
  if (!API_BASE) return null;
  if (cachedUsername) return cachedUsername;

  try {
    const res = await fetch(`${API_BASE}/getMe`);
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; result?: { username?: string } };
    if (data.ok && data.result?.username) {
      cachedUsername = data.result.username;
      return cachedUsername;
    }
  } catch (error) {
    console.error('Telegram getMe failed:', error);
  }
  return null;
}

export async function sendTelegramMessage(chatId: string, html: string): Promise<boolean> {
  if (!API_BASE) return false;

  try {
    const res = await fetch(`${API_BASE}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Telegram sendMessage failed (${res.status}):`, body);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Telegram sendMessage error:', error);
    return false;
  }
}

export async function buildConnectLink(startPayload: string): Promise<string | null> {
  const username = await getBotUsername();
  if (!username) return null;
  return `https://t.me/${username}?start=${encodeURIComponent(startPayload)}`;
}
