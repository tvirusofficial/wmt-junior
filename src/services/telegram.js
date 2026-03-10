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
    voice: msg.voice || null,  // { file_id, duration, mime_type }
  };
}

export async function getFileUrl(env, fileId) {
  const res = await fetch(`${TG_API(env.TELEGRAM_BOT_TOKEN)}/getFile?file_id=${fileId}`);
  if (!res.ok) return null;
  const data = await res.json();
  const filePath = data?.result?.file_path;
  if (!filePath) return null;
  return `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${filePath}`;
}

export async function downloadFileAsBase64(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
