/**
 * webhook.js — Telegram Webhook Handler
 */

import { isAllowedUser, isValidWebhookSecret } from "../middleware/auth.js";
import { extractMessage, sendMessage, sendTyping, getFileUrl, downloadFileAsBase64 } from "../services/telegram.js";
import { getRecentSessionHistory, saveChatLog, getAllKB } from "../services/supabase.js";
import { generateReply, generateReplyFromVoice } from "../services/gemini.js";
import { buildSystemPrompt } from "../system-prompt.js";

export async function handleWebhook(request, env) {
  if (!isValidWebhookSecret(request, env)) {
    console.warn("Invalid webhook secret");
    return new Response("OK", { status: 200 });
  }

  const update = await request.json();
  const msg = extractMessage(update);

  if (!msg) return new Response("OK", { status: 200 });

  const { userId, chatId, text, voice } = msg;

  // Must have text or voice
  if (!text && !voice) return new Response("OK", { status: 200 });

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
    let reply;
    let savedText;

    if (voice) {
      // Voice message flow
      const fileUrl = await getFileUrl(env, voice.file_id);
      if (!fileUrl) throw new Error("Could not get voice file URL");

      const audioBase64 = await downloadFileAsBase64(fileUrl);
      if (!audioBase64) throw new Error("Could not download voice file");

      reply = await generateReplyFromVoice(env, systemPrompt, chatHistory, audioBase64, voice.mime_type || "audio/ogg");
      savedText = "[🎤 Voice message]";
    } else {
      // Text message flow
      const messages = [...chatHistory, { role: "user", content: text }];
      reply = await generateReply(env, systemPrompt, messages);
      savedText = text;
    }

    await Promise.all([
      saveChatLog(env, { userId, role: "user", message: savedText }),
      saveChatLog(env, { userId, role: "assistant", message: reply }),
    ]);

    await sendMessage(env, chatId, reply);

  } catch (err) {
    console.error("Webhook handler error:", err);
    await sendMessage(env, chatId, "အင်း... တစ်ခုခု ဖြစ်သွားတယ်။ နည်းနည်းနေပြီး ပြန်ပြော 😅");
  }

  return new Response("OK", { status: 200 });
}
