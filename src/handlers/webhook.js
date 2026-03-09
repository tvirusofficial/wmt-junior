/**
 * webhook.js — Telegram Webhook Handler
 */

import { isAllowedUser, isValidWebhookSecret } from "../middleware/auth.js";
import { extractMessage, sendMessage, sendTyping } from "../services/telegram.js";
import { getRecentSessionHistory, saveChatLog, getAllKB } from "../services/supabase.js";
import { generateReply, detectAdminFlag } from "../services/gemini.js";
import { buildSystemPrompt } from "../system-prompt.js";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

  // 1-2 sec natural delay before replying
  const delay = 1000 + Math.random() * 1000;
  await sleep(delay);

  try {
    const [kbEntries, chatHistory] = await Promise.all([
      getAllKB(env),
      getRecentSessionHistory(env, userId, 20),
    ]);

    const systemPrompt = buildSystemPrompt(kbEntries);
    const messages = [...chatHistory, { role: "user", content: text }];

    // Generate reply first
    const reply = await generateReply(env, systemPrompt, messages);

    // Only call Gemini flag detection if message contains relevant keywords
    // Saves API usage — most messages won't need flag detection
    const FLAG_KEYWORDS = ["ဆရာ့ကို", "ဆရာ သိစေ", "ဆရာ့ဆီ", "ဆရာ့ သိစေ", "ဆရာ့အတွက်", "ဆရာ ပြောပေး", "ဆရာ့ကို ပြောပေး", "ဆရာ့ကို ပို့", "ဆရာ မသိနဲ့", "ဆရာ့ကို မပြောနဲ့"];
    const mightBeFlag = FLAG_KEYWORDS.some(kw => text.includes(kw));

    let flagForAdmin = false;
    if (mightBeFlag) {
      const flagResult = await detectAdminFlag(env, text);
      flagForAdmin = flagResult !== false;
    }

    await Promise.all([
      saveChatLog(env, { userId, role: "user", message: text, flagForAdmin }),
      saveChatLog(env, { userId, role: "assistant", message: reply }),
    ]);

    await sendMessage(env, chatId, reply);

  } catch (err) {
    console.error("Webhook handler error:", err);
    await sendMessage(env, chatId, "အင်း... တစ်ခုခု ဖြစ်သွားတယ်။ နည်းနည်းနေပြီး ပြန်ပြော 😅");
  }

  return new Response("OK", { status: 200 });
}
