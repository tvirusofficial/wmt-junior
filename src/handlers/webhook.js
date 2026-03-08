/**
 * webhook.js — Telegram Webhook Handler
 * Receives messages, checks auth, calls AI, replies
 */

import { isAllowedUser, isValidWebhookSecret } from "../middleware/auth.js";
import { extractMessage, sendMessage, sendTyping } from "../services/telegram.js";
import { getChatHistory, saveChatLog, getAllKB } from "../services/supabase.js";
import { generateReply } from "../services/gemini.js";
import { buildSystemPrompt } from "../system-prompt.js";

export async function handleWebhook(request, env) {
  // ── Security Layer 1: Webhook secret check
  if (!isValidWebhookSecret(request, env)) {
    console.warn("Invalid webhook secret");
    return new Response("OK", { status: 200 }); // Return 200 to avoid Telegram retries
  }

  const update = await request.json();
  const msg = extractMessage(update);

  // Not a message update — ignore
  if (!msg || !msg.text) return new Response("OK", { status: 200 });

  const { userId, chatId, text } = msg;

  // ── Security Layer 2: Telegram ID whitelist
  if (!isAllowedUser(userId, env)) {
    console.warn(`Unauthorized access attempt from user: ${userId}`);
    // Silent ignore — don't even reply to unknown users
    return new Response("OK", { status: 200 });
  }

  // ── Show typing indicator
  await sendTyping(env, chatId);

  try {
    // ── Fetch KB + Chat history in parallel
    const [kbEntries, chatHistory] = await Promise.all([
      getAllKB(env),
      getChatHistory(env, userId, 20),
    ]);

    // ── Build system prompt with personality + KB
    const systemPrompt = buildSystemPrompt(kbEntries);

    // ── Add current message to history for AI
    const messages = [...chatHistory, { role: "user", content: text }];

    // ── Call Gemini
    const reply = await generateReply(env, systemPrompt, messages);

    // ── Save both messages to DB
    await Promise.all([
      saveChatLog(env, { userId, role: "user", message: text }),
      saveChatLog(env, { userId, role: "assistant", message: reply }),
    ]);

    // ── Send reply to Telegram
    await sendMessage(env, chatId, reply);

  } catch (err) {
    console.error("Webhook handler error:", err);
    await sendMessage(env, chatId, "အင်း... တစ်ခုခု ဖြစ်သွားတယ်။ နည်းနည်းနေပြီး ပြန်ပြော 😅");
  }

  return new Response("OK", { status: 200 });
}
