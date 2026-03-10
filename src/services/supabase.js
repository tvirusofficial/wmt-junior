/**
 * supabase.js — Database Service
 * All Supabase queries for WMT Junior
 */

function getHeaders(env) {
  return {
    "Content-Type": "application/json",
    apikey: env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    Prefer: "return=representation",
  };
}

const BASE = (env) => `${env.SUPABASE_URL}/rest/v1`;

// ─── CHAT LOGS ─────────────────────────────────────────────

export async function saveChatLog(env, { userId, role, message, sessionId, voiceUrl = null }) {
  const res = await fetch(`${BASE(env)}/wmt_chat_logs`, {
    method: "POST",
    headers: getHeaders(env),
    body: JSON.stringify({
      user_id: userId,
      role,
      message,
      session_id: sessionId || null,
      voice_url: voiceUrl,
    }),
  });
  if (!res.ok) console.error("saveChatLog error:", await res.text());
}

export async function getChatHistory(env, userId, limit = 20) {
  const res = await fetch(
    `${BASE(env)}/wmt_chat_logs?user_id=eq.${userId}&order=created_at.desc&limit=${limit}`,
    { headers: getHeaders(env) }
  );
  if (!res.ok) return [];
  const rows = await res.json();
  return rows.reverse().map((r) => ({ role: r.role, content: r.message }));
}

// ── Get history from current session only (last 30 min)
export async function getRecentSessionHistory(env, userId, limit = 20) {
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const res = await fetch(
    `${BASE(env)}/wmt_chat_logs?user_id=eq.${userId}&created_at=gte.${since}&order=created_at.desc&limit=${limit}`,
    { headers: getHeaders(env) }
  );
  if (!res.ok) return [];
  const rows = await res.json();

  if (rows.length === 0) {
    return getChatHistory(env, userId, 20);
  }

  return rows.reverse().map((r) => ({ role: r.role, content: r.message }));
}

export async function getAllChatLogs(env, limit = 100, offset = 0) {
  const res = await fetch(
    `${BASE(env)}/wmt_chat_logs?order=created_at.desc&limit=${limit}&offset=${offset}`,
    { headers: getHeaders(env) }
  );
  if (!res.ok) return [];
  return res.json();
}

// ─── KNOWLEDGE BASE ────────────────────────────────────────

export async function getAllKB(env) {
  const res = await fetch(
    `${BASE(env)}/wmt_knowledge_base?order=category.asc,created_at.asc`,
    { headers: getHeaders(env) }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getKBByCategory(env, category) {
  const res = await fetch(
    `${BASE(env)}/wmt_knowledge_base?category=eq.${category}`,
    { headers: getHeaders(env) }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function addKBEntry(env, { category, title, content }) {
  const res = await fetch(`${BASE(env)}/wmt_knowledge_base`, {
    method: "POST",
    headers: getHeaders(env),
    body: JSON.stringify({ category, title, content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateKBEntry(env, id, { category, title, content }) {
  const res = await fetch(`${BASE(env)}/wmt_knowledge_base?id=eq.${id}`, {
    method: "PATCH",
    headers: getHeaders(env),
    body: JSON.stringify({ category, title, content, updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteKBEntry(env, id) {
  const res = await fetch(`${BASE(env)}/wmt_knowledge_base?id=eq.${id}`, {
    method: "DELETE",
    headers: getHeaders(env),
  });
  if (!res.ok) throw new Error(await res.text());
}

// ─── SCHEDULED MESSAGES ───────────────────────────────────

export async function getPendingSchedules(env) {
  const now = new Date().toISOString();
  const res = await fetch(
    `${BASE(env)}/wmt_scheduled_messages?is_sent=eq.false&send_at=lte.${now}&order=send_at.asc`,
    { headers: getHeaders(env) }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getAllSchedules(env) {
  const res = await fetch(
    `${BASE(env)}/wmt_scheduled_messages?order=send_at.desc&limit=100`,
    { headers: getHeaders(env) }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function addSchedule(env, { targetUserId, message, context, sendAt, recurrence = "once" }) {
  const res = await fetch(`${BASE(env)}/wmt_scheduled_messages`, {
    method: "POST",
    headers: getHeaders(env),
    body: JSON.stringify({
      target_user_id: targetUserId,
      message,
      context: context || null,
      send_at: sendAt,
      recurrence,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateSchedule(env, id, { message, context, sendAt, recurrence }) {
  const res = await fetch(`${BASE(env)}/wmt_scheduled_messages?id=eq.${id}`, {
    method: "PATCH",
    headers: getHeaders(env),
    body: JSON.stringify({ message, context, send_at: sendAt, recurrence }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function markScheduleSent(env, id) {
  const res = await fetch(`${BASE(env)}/wmt_scheduled_messages?id=eq.${id}`, {
    method: "PATCH",
    headers: getHeaders(env),
    body: JSON.stringify({ is_sent: true }),
  });
  if (!res.ok) console.error("markScheduleSent error:", await res.text());
}

export async function rescheduleRecurring(env, schedule) {
  const { recurrence, send_at, target_user_id, message, context } = schedule;
  if (!recurrence || recurrence === "once") return;

  const next = new Date(send_at);
  if (recurrence === "daily") next.setDate(next.getDate() + 1);
  else if (recurrence === "weekly") next.setDate(next.getDate() + 7);
  else if (recurrence === "monthly") next.setMonth(next.getMonth() + 1);

  await addSchedule(env, {
    targetUserId: target_user_id,
    message,
    context,
    sendAt: next.toISOString(),
    recurrence,
  });
}

export async function deleteSchedule(env, id) {
  const res = await fetch(`${BASE(env)}/wmt_scheduled_messages?id=eq.${id}`, {
    method: "DELETE",
    headers: getHeaders(env),
  });
  if (!res.ok) throw new Error(await res.text());
}

// ─── BOT CONFIG ────────────────────────────────────────────

export async function getConfig(env, key) {
  const res = await fetch(
    `${BASE(env)}/wmt_bot_config?key=eq.${key}&limit=1`,
    { headers: getHeaders(env) }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.value ?? null;
}

export async function getAllConfig(env) {
  const res = await fetch(`${BASE(env)}/wmt_bot_config`, {
    headers: getHeaders(env),
  });
  if (!res.ok) return [];
  return res.json();
}

export async function setConfig(env, key, value) {
  const res = await fetch(`${BASE(env)}/wmt_bot_config?key=eq.${key}`, {
    method: "PATCH",
    headers: getHeaders(env),
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(await res.text());
}
