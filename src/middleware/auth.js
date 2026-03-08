/**
 * auth.js — Security Layer
 * Telegram ID whitelist check + Double-lock protection
 * Only 2 users can ever access WMT Junior
 */

export function isAllowedUser(userId, env) {
  if (!userId) return false;

  const allowedIds = env.ALLOWED_USER_IDS
    ? env.ALLOWED_USER_IDS.split(",").map((id) => id.trim())
    : [];

  return allowedIds.includes(String(userId));
}

export function isAdmin(userId, env) {
  if (!userId) return false;
  return String(userId) === String(env.ADMIN_ID);
}

export function isValidWebhookSecret(request, env) {
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  return secret === env.TELEGRAM_WEBHOOK_SECRET;
}

export function isValidAdminToken(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === env.ADMIN_SECRET_TOKEN;
}

export function unauthorizedResponse(reason = "Unauthorized") {
  return new Response(JSON.stringify({ error: reason }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function forbiddenResponse() {
  return new Response(JSON.stringify({ error: "Forbidden" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
  });
}
