/**
 * scheduler.js — Cron Job Handler
 */

import { getPendingSchedules, markScheduleSent, rescheduleRecurring, getRecentSessionHistory, getAllKB, saveChatLog } from "../services/supabase.js";
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
      // If recurring, create next occurrence
      await rescheduleRecurring(env, schedule);
    } catch (err) {
      console.error(`Failed to process schedule ${schedule.id}:`, err);
    }
  }
}

async function processSchedule(env, schedule) {
  const { target_user_id, message, context } = schedule;

  const [kbEntries, chatHistory] = await Promise.all([
    getAllKB(env),
    getRecentSessionHistory(env, target_user_id, 10),
  ]);

  const systemPrompt = buildSystemPrompt(kbEntries);
  const contextNote = context
    ? `\n\n[Admin မှတ်ချက်: ${context}] — ဒီ context ကို သိပြီး natural ဖြစ်အောင် message ပို့ပါ`
    : "";

  const messages = [
    ...chatHistory,
    { role: "user", content: `[Scheduled] ${message}${contextNote}` },
  ];

  const reply = await generateReply(env, systemPrompt, messages);

  await saveChatLog(env, { userId: target_user_id, role: "assistant", message: reply, sessionId: `scheduled_${schedule.id}` });
  await sendMessage(env, target_user_id, reply);
}
