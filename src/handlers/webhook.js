/**
 * webhook.js — Telegram Webhook Handler
 */

import { isAllowedUser, isValidWebhookSecret } from "../middleware/auth.js";
import { extractMessage, sendMessage, sendTyping } from "../services/telegram.js";
import { getRecentSessionHistory, saveChatLog, getAllKB } from "../services/supabase.js";
import { generateReply } from "../services/gemini.js";
import { buildSystemPrompt } from "../system-prompt.js";

export async function handleWebhook(request, env) {
  if (!isValidWebhookSecret(request, env)) {
    console.warn("Invalid webhook secret");
    return new Response("OK", { status: 200 });
  }

  const update = await request.json();
  const msg = extractMessage(update);

  if (!msg || !msg.text) return new Response("OK", { status: 200 });

  const { userId, chatId, text } = msg;

  if (!isAllowedUser(userId, env)) {
    console.warn(`Unauthorized access attempt from user: ${userId}`);
    return new Response("OK", { status: 200 });
  }

  await sendTyping(env, chatId);

  try {
    const [kbEntries, chatHistory] = await Promise.all([
      getAllKB(env),
      getRecentSessionHistory(env, userId, 20),
    ]);

    const systemPrompt = buildSystemPrompt(kbEntries);
    const messages = [...chatHistory, { role: "user", content: text }];
    const reply = await generateReply(env, systemPrompt, messages);

    await Promise.all([
      saveChatLog(env, { userId, role: "user", message: text }),
      saveChatLog(env, { userId, role: "assistant", message: reply }),
    ]);

    await sendMessage(env, chatId, reply);

  } catch (err) {
    console.error("Webhook handler error:", err);
    await sendMessage(env, chatId, "အင်း... တစ်ခုခု ဖြစ်သွားတယ်။ နည်းနည်းနေပြီး ပြန်ပြော 😅");
  }

  return new Response("OK", { status: 200 });
}
