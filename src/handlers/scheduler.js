/**
 * scheduler.js — Cron Job Handler
 * Runs every 5 minutes, checks pending scheduled messages
 */

import { getPendingSchedules, markScheduleSent, getChatHistory, getAllKB, saveChatLog } from "../services/supabase.js";
import { sendMessage } from "../services/telegram.js";
import { generateReply } from "../services/gemini.js";
import { buildSystemPrompt } from "../system-prompt.js";

export async function handleScheduler(env) {
  console.log("Scheduler running:", new Date().toISOString());

  const pending = await getPendingSchedules(env);
  if (pending.length === 0) return;

  console.log(`Found ${pending.length} pending scheduled message(s)`);

  for (const schedule of pending) {
    try {
      await processSchedule(env, schedule);
      await markScheduleSent(env, schedule.id);
    } catch (err) {
      console.error(`Failed to process schedule ${schedule.id}:`, err);
    }
  }
}

async function processSchedule(env, schedule) {
  const { target_user_id, message, context } = schedule;

  // Build a context-aware prompt for scheduled messages
  const [kbEntries, chatHistory] = await Promise.all([
    getAllKB(env),
    getChatHistory(env, target_user_id, 10),
  ]);

  const systemPrompt = buildSystemPrompt(kbEntries);

  // Inject schedule context so AI knows why it's reaching out
  const contextNote = context
    ? `\n\n[Admin မှတ်ချက်: ${context}] — ဒီ context ကို သိပြီး natural ဖြစ်အောင် message ပို့ပါ`
    : "";

  const messages = [
    ...chatHistory,
    { role: "user", content: `[Scheduled] ${message}${contextNote}` },
  ];

  const reply = await generateReply(env, systemPrompt, messages);

  // Save to chat logs
  await saveChatLog(env, {
    userId: target_user_id,
    role: "assistant",
    message: reply,
    sessionId: `scheduled_${schedule.id}`,
  });

  // Send to Telegram
  await sendMessage(env, target_user_id, reply);
}
