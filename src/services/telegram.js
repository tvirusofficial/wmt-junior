/**
 * telegram.js — Telegram Bot API Service
 */

const TG_API = (token) => `https://api.telegram.org/bot${token}`;

export async function sendMessage(env, chatId, text, extra = {}) {
  const res = await fetch(`${TG_API(env.TELEGRAM_BOT_TOKEN)}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...extra,
    }),
  });
  if (!res.ok) console.error("sendMessage error:", await res.text());
  return res.json();
}

export async function sendTyping(env, chatId) {
  await fetch(`${TG_API(env.TELEGRAM_BOT_TOKEN)}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action: "typing" }),
  });
}

export async function setWebhook(env, webhookUrl) {
  const res = await fetch(`${TG_API(env.TELEGRAM_BOT_TOKEN)}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ["message"],
      drop_pending_updates: true,
    }),
  });
  return res.json();
}

export function extractMessage(update) {
  const msg = update?.message;
  if (!msg) return null;
  return {
    messageId: msg.message_id,
    userId: msg.from?.id,
    username: msg.from?.username,
    firstName: msg.from?.first_name,
    chatId: msg.chat?.id,
    text: msg.text || "",
    date: msg.date,
  };
}
