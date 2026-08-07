#!/usr/bin/env node
"use strict";
/**
 * Within — бэкенд мини-аппа «Лея» (ИИ-собеседник) + подписка Within Plus на Telegram Stars.
 *
 * Делает три вещи:
 *   1) проксирует чат в Grok (xAI, OpenAI-совместимый API) — персона Леи, безопасность, детекция кризиса;
 *   2) продаёт подписку Within Plus за Stars (createInvoiceLink + вебхук + идемпотентная выдача);
 *   3) честно хранит права и дневной лимит на сервере (в localStorage их правит любой через консоль).
 *
 * Запуск (зависимостей нет, нужен Node 18+ с глобальным fetch):
 *   XAI_API_KEY=xai-... BOT_TOKEN=123:ABC WEBHOOK_SECRET=длинная-строка node within-bot.js
 *   # затем один раз привязать вебхук:
 *   #   curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://ВАШ-ХОСТ/webhook/<WEBHOOK_SECRET>&secret_token=<WEBHOOK_SECRET>&allowed_updates=[\"pre_checkout_query\",\"message\"]"
 *
 * Переменные окружения:
 *   XAI_API_KEY        ключ Grok (xAI). Без него — мягкая заглушка вместо ответа модели. (алиас: GROK_API_KEY)
 *   XAI_BASE           базовый URL API, по умолчанию https://api.x.ai/v1
 *   BOT_TOKEN          токен бота от @BotFather. Включает проверку initData и платежи.
 *                      Без него — DEV-режим: проверка выключена, платежи недоступны.
 *   WEBHOOK_SECRET     секрет в пути вебхука и в заголовке от Telegram (нужен для платежей)
 *   ADMIN_SECRET       для ручных возвратов через /api/refund
 *   WITHIN_MODEL       модель Grok для Plus (по умолчанию grok-3; поставь доступную на аккаунте: grok-4, grok-3, …)
 *   WITHIN_MODEL_FREE  модель для бесплатных (по умолчанию та же; можно дешевле, напр. grok-3-mini)
 *   PORT               по умолчанию 8790
 *   DB_FILE            хранилище, по умолчанию ./within-db.json
 *   ALLOW_ORIGIN       CORS, по умолчанию *
 *
 * Зависимостей нет. Node 18+.
 */
const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.BOT_TOKEN || "";
const HOOK = process.env.WEBHOOK_SECRET || "";
const ADMIN = process.env.ADMIN_SECRET || "";
// LLM: xAI Grok (OpenAI-совместимый API). Поставь WITHIN_MODEL в модель, доступную на твоём аккаунте (grok-4, grok-3, grok-3-mini…).
const XAI_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY || "";
const XAI_BASE = process.env.XAI_BASE || "https://api.x.ai/v1";
const MODEL = process.env.WITHIN_MODEL || "grok-3";              // модель для Plus
const MODEL_FREE = process.env.WITHIN_MODEL_FREE || MODEL;        // для бесплатных — по умолчанию та же (поставь дешевле, напр. grok-3-mini)
const PORT = +(process.env.PORT || 8790);
const DB_FILE = process.env.DB_FILE || "./within-db.json";
const ORIGIN = process.env.ALLOW_ORIGIN || "*";
const WEBAPP_URL = process.env.WEBAPP_URL || "";      // если задан — в напоминание добавляется кнопка «Открыть Within»
const BACKUP_DIR = process.env.BACKUP_DIR || "./within-backups";  // куда складывать ежедневные резервные копии базы
const BACKUP_KEEP = +(process.env.BACKUP_KEEP || 7);  // сколько дневных копий хранить
const MAX_AGE = 60 * 60 * 24;            // initData старше суток не принимаем
const FREE_DAILY = 5;                    // бесплатных сообщений Лее в день
const MIN_INTERVAL_MS = 1200;            // анти-флуд: не чаще одного сообщения в ~1.2 сек
const PER_MIN = 15;                       // не больше 15 сообщений в минуту (в т.ч. для Plus)
const GLOBAL_CAP = +(process.env.WITHIN_DAILY_CAP || 20000);  // защитный потолок вызовов модели в сутки на весь сервис
const HAVE_KEY = !!XAI_KEY;

// Вызов Grok (xAI). OpenAI-совместимый chat/completions.
async function grokChat(model, system, messages) {
  const r = await fetch(XAI_BASE.replace(/\/$/, "") + "/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + XAI_KEY },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      temperature: 0.7,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!r.ok) throw new Error("xAI " + r.status + " " + (await r.text().catch(() => "")).slice(0, 200));
  const j = await r.json();
  return (((j.choices || [])[0] || {}).message || {}).content?.trim() || "";
}

/* ─────────────────────── каталог подписки ───────────────────────
   Цены и длительность живут ТОЛЬКО здесь — клиент присылает id плана,
   сервер сам берёт цену, иначе покупатель оформил бы год за одну звезду. */
const CATALOG = {
  plan_week:  { stars: 149,  days: 7,   title: "Within Plus · неделя", desc: "Безлимитные разговоры, голос, все практики" },
  plan_month: { stars: 399,  days: 30,  sub: true, title: "Within Plus · месяц", desc: "Безлимитные разговоры, голос, практики и тренды. Автопродление раз в 30 дней, можно отменить в любой момент." },
  plan_year:  { stars: 2490, days: 365, title: "Within Plus · год",    desc: "Всё из Plus на год — выгоднее почти вдвое" },
};
const SUB_PERIOD = 2592000;              // единственный период Stars-подписки: 30 дней

/* ─────────────────────── персона Леи ─────────────────────── */
const STYLES = [
  "Мягкий и поддерживающий: больше тепла, меньше советов, сначала выслушай и отрази чувства.",
  "Спокойный и нейтральный: ровный тон без лишних эмоций и оценок.",
  "Прямой и структурированный: чёткие вопросы, шаги и короткие выводы.",
];
const GOALS = ["снизить тревогу","справиться со стрессом","понять свои эмоции","улучшить отношения","повысить уверенность в себе","просто выговориться"];
const CRISIS_WORDS = ["не хочу жить","жить не хочется","покончить","суицид","убить себя","убью себя","свести счёты","наложить на себя руки","наложу на себя руки","не вижу смысла","смысла жить","лучше бы меня не было","причинить себе","себе навред","умереть"];

function cleanName(name) {
  if (typeof name !== "string") return "";
  const n = name.replace(/[\r\n\t<>]/g, " ").trim().slice(0, 40);
  return /[a-zA-Zа-яА-ЯёЁ]/.test(n) ? n : "";     // только если есть буквы
}
function systemPrompt(style, goals, name) {
  const styleLine = STYLES[style] != null ? STYLES[style] : STYLES[0];
  const goalLine = Array.isArray(goals) && goals.length
    ? "Цели пользователя: " + goals.map(i => GOALS[i]).filter(Boolean).join(", ") + "." : "";
  const nm = cleanName(name);
  const nameLine = nm ? "Пользователя зовут " + nm + ". Иногда, к месту, обращайся по имени — но не в каждом сообщении." : "";
  return [
    "Ты — Лея, тёплый ИИ-собеседник в приложении Within (by Kapin Group).",
    "Твоя задача — эмоциональная поддержка и самоанализ: помочь человеку разобраться в мыслях и чувствах без критики и осуждения.",
    "Ты не врач и не психолог, не ставишь диагнозов, не назначаешь лечение и препараты. Если нужна медицинская помощь — мягко направляй к специалисту.",
    "Общайся по-русски. Тон: " + styleLine,
    nameLine,
    goalLine,
    "Отвечай коротко и по-человечески — обычно 2–5 предложений. Отражай чувства, задавай один мягкий открытый вопрос, не заваливай советами.",
    "Не используй списки, служебные пометки или XML-теги. Не начинай с «Как ИИ...». Пиши как живой внимательный собеседник.",
    "Безопасность: если человек говорит о желании причинить себе вред, о суициде или безнадёжности — отнесись серьёзно, будь рядом, вырази заботу и мягко предложи обратиться за срочной помощью к близким или в кризисную службу. Никогда не обесценивай и не давай инструкций причинения вреда.",
  ].filter(Boolean).join("\n");
}
function isCrisis(text) { const t = (text || "").toLowerCase(); return CRISIS_WORDS.some(w => t.includes(w)); }

/* ─────────────────────── хранилище ───────────────────────
   JSON-файла хватит на старт и первые тысячи пользователей.
   users[id]: { plus, until, day, count, spent, since }
   until — до какого времени активна подписка (мс). charges — против двойной выдачи. */
function newestBackup() {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => /^within-db\..+\.json$/.test(f)).sort();
    return files.length ? path.join(BACKUP_DIR, files[files.length - 1]) : null;
  } catch (e) { return null; }
}
let DB = { users: {}, charges: {} };
(function loadDB() {
  try { if (fs.existsSync(DB_FILE)) { DB = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); return; } }
  catch (e) {
    console.error("База не читается:", e.message);
    const bak = newestBackup();                     // при повреждённом файле — пробуем восстановиться из бэкапа
    if (bak) { try { DB = JSON.parse(fs.readFileSync(bak, "utf8")); console.error("Восстановлено из бэкапа:", bak); return; } catch (e2) {} }
    console.error("Начинаю с пустой базы.");
  }
})();
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { fs.writeFileSync(DB_FILE + ".tmp", JSON.stringify(DB)); fs.renameSync(DB_FILE + ".tmp", DB_FILE); }
    catch (e) { console.error("База не сохранилась:", e.message); }
  }, 200);
}
function backup() {
  try {
    if (!fs.existsSync(DB_FILE)) return;
    if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const dst = path.join(BACKUP_DIR, `within-db.${today()}.json`);   // одна копия в день (перезаписываем)
    fs.copyFileSync(DB_FILE, dst);
    const files = fs.readdirSync(BACKUP_DIR).filter(f => /^within-db\..+\.json$/.test(f)).sort();
    while (files.length > BACKUP_KEEP) { try { fs.unlinkSync(path.join(BACKUP_DIR, files.shift())); } catch (e) {} }
  } catch (e) { console.error("Бэкап не создан:", e.message); }
}
setTimeout(backup, 3000);                            // копия вскоре после старта
setInterval(backup, 6 * 60 * 60 * 1000);             // и каждые 6 часов
const user = id => (DB.users[id] = DB.users[id] || { plus: false, until: 0, day: "", count: 0, spent: 0, since: Date.now() });
const today = () => new Date().toISOString().slice(0, 10);
function touchDay(u) { const d = today(); if (u.day !== d) { u.day = d; u.count = 0; save(); } }
const isPlus = u => !!u.plus && (u.until || 0) > Date.now();
function ent(u) { touchDay(u); const plus = isPlus(u); return { plus, until: plus ? u.until : 0, sub: plus && !!u.sub, count: plus ? 0 : u.count, limit: FREE_DAILY }; }

/* ─────────────────────── подпись initData ─────────────────────── */
function checkInitData(initData) {
  if (!TOKEN) return { id: "dev", first_name: "Dev", dev: true };   // DEV: без токена не проверяем
  if (typeof initData !== "string" || !initData) return null;
  const p = new URLSearchParams(initData);
  const hash = p.get("hash"); if (!hash) return null;
  p.delete("hash");
  const dcs = [...p.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1).map(([k, v]) => `${k}=${v}`).join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(TOKEN).digest();
  const mine = crypto.createHmac("sha256", secret).update(dcs).digest("hex");
  const a = Buffer.from(mine, "hex"), b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const age = Math.floor(Date.now() / 1000) - Number(p.get("auth_date") || 0);
  if (!(age >= 0 && age < MAX_AGE)) return null;
  try { return JSON.parse(p.get("user") || "null"); } catch (e) { return null; }
}

/* ─────────────────────── Telegram Bot API ─────────────────────── */
async function api(method, payload) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const j = await r.json();
  if (!j.ok) throw new Error(method + ": " + (j.description || "ошибка"));
  return j.result;
}

/* ─────────────────────── выдача подписки (идемпотентно) ─────────────────────── */
function grant(uid, planId, chargeId, amount, opts) {
  opts = opts || {};
  if (chargeId && DB.charges[chargeId]) return false;           // повторный вебхук — не выдаём дважды
  const plan = CATALOG[planId]; if (!plan) return false;
  const u = user(uid);
  if (opts.until) u.until = Math.max(u.until || 0, opts.until); // подписка: срок из Telegram (авторитетно)
  else u.until = Math.max(Date.now(), u.until || 0) + plan.days * 86400000; // разовый: продлеваем, а не перезатираем
  u.plus = true;
  if (opts.sub) { u.sub = true; if (opts.charge) u.subCharge = opts.charge; }  // charge_id для отмены автопродления
  u.spent += amount || plan.stars;
  if (chargeId) DB.charges[chargeId] = { uid, planId, at: Date.now(), amount: amount || plan.stars, recurring: !!opts.sub };
  save();
  console.log(`Plus выдан: ${planId} → ${uid} (${amount || plan.stars} ⭐)${opts.sub ? " [подписка]" : ""}, до ${new Date(u.until).toISOString()}`);
  return true;
}

/* ─────────────────────── напоминания (планировщик) ───────────────────────
   Права и время хранятся на сервере; каждую минуту проверяем локальное время
   пользователя (по его таймзоне) и шлём мягкое сообщение раз в день, идемпотентно. */
function reminderHours(u) {
  const r = u && u.rem; if (!r || r.freq === 2) return [];        // freq 2 = «Не надо»
  const anyOn = r.on && (r.on[0] || r.on[1]);                      // хотя бы «настроение» или «итоги дня»
  if (!anyOn) return [];
  const hour = typeof r.hour === "number" ? r.hour : 21;
  return r.freq === 1 ? [...new Set([9, hour])].sort((a, b) => a - b) : [hour]; // «2 раза» = утро + вечер
}
function localHM(tz) {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: tz || "UTC", hour12: false, hour: "2-digit", minute: "2-digit" }).formatToParts(new Date());
    const o = {}; parts.forEach(p => o[p.type] = p.value);
    return { h: (+o.hour) % 24, m: +o.minute };
  } catch (e) { const d = new Date(); return { h: d.getHours(), m: d.getMinutes() }; }
}
function remText(hour) {
  return hour < 12
    ? "Доброе утро 🌱 Как вы себя чувствуете сегодня? Загляните во Within — отметить настроение."
    : "Как прошёл день? Пара минут во Within — отметить настроение или поговорить с Леей.";
}
function dueHour(u, hh, mm) {                                       // чистая функция для проверки/тестов
  if (mm > 1) return null;
  const hours = reminderHours(u);
  return hours.includes(hh) ? hh : null;
}
function tickReminders() {
  if (!TOKEN) return;
  const dk = today();
  for (const uid in DB.users) {
    const u = DB.users[uid]; if (!u.rem) continue;
    const { h, m } = localHM(u.rem.tz);
    if (dueHour(u, h, m) == null) continue;
    u.rem.sent = u.rem.sent || {};
    Object.keys(u.rem.sent).forEach(k => { if (!k.startsWith(dk)) delete u.rem.sent[k]; });  // чистим вчерашнее
    const key = dk + ":" + h; if (u.rem.sent[key]) continue;      // уже слали сегодня в этот час
    u.rem.sent[key] = true; save();
    const btn = WEBAPP_URL ? { reply_markup: { inline_keyboard: [[{ text: "Открыть Within", web_app: { url: WEBAPP_URL } }]] } } : {};
    api("sendMessage", Object.assign({ chat_id: uid, text: remText(h) }, btn)).catch(() => {});
    console.log(`напоминание → ${uid} (${h}:00)`);
  }
}
if (TOKEN) setInterval(tickReminders, 60000);

/* ─────────────────────── HTTP helpers ─────────────────────── */
const send = (res, code, obj) => {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": ORIGIN,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  });
  res.end(JSON.stringify(obj));
};
const readBody = req => new Promise((ok, no) => {
  let d = ""; req.on("data", c => { d += c; if (d.length > 1e6) req.destroy(); });
  req.on("end", () => { try { ok(d ? JSON.parse(d) : {}); } catch (e) { no(e); } });
});
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
function serveStatic(res, rel) {
  const file = path.join(__dirname, rel);
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (e, buf) => {
    if (e) { res.writeHead(404); return res.end("not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
    res.end(buf);
  });
}

/* ─────────────────────── чат ─────────────────────── */
async function handleChat(res, data) {
  const who = checkInitData(data.initData);
  if (!who) return send(res, 401, { error: "invalid_initData" });
  const u = user(who.id);
  touchDay(u);
  const plus = isPlus(u);

  const msgs = Array.isArray(data.messages) ? data.messages : [];
  const last = msgs.length ? msgs[msgs.length - 1] : null;

  // Кризис — не считаем в лимит, не отправляем модели, показываем помощь.
  if (last && last.role === "user" && isCrisis(last.content)) {
    return send(res, 200, {
      crisis: true,
      reply: "Мне важно то, что вы сейчас чувствуете, и это звучит очень тяжело. Пожалуйста, не оставайтесь с этим в одиночку — рядом должен быть человек, который может помочь. Я останусь на связи.",
      ent: ent(u),
    });
  }

  // Анти-флуд: не чаще раза в ~1.2 сек и не больше PER_MIN в минуту (в т.ч. для Plus) —
  // защищает бюджет от зацикленного клиента; троттлинг не тратит бесплатный лимит.
  const now = Date.now();
  if (u.lastMsg && now - u.lastMsg < MIN_INTERVAL_MS)
    return send(res, 200, { reply: "Секунду — я ещё думаю над прошлым сообщением. Напишите чуть погодя.", throttled: true, ent: ent(u) });
  const minKey = new Date().toISOString().slice(0, 16);
  if (u.minKey !== minKey) { u.minKey = minKey; u.minN = 0; }
  if (u.minN >= PER_MIN)
    return send(res, 200, { reply: "Давайте сделаем небольшую паузу и вернёмся через минуту.", throttled: true, ent: ent(u) });
  u.lastMsg = now; u.minN = (u.minN || 0) + 1;

  // Бесплатный дневной лимит.
  if (!plus && u.count >= FREE_DAILY) {
    save();
    return send(res, 200, { limit: true, ent: ent(u) });
  }
  if (!plus) u.count++;

  // Защитный потолок вызовов модели на весь сервис в сутки — страховка от разгона расходов.
  DB.stats = DB.stats || { day: "", n: 0 };
  const dk = today();
  if (DB.stats.day !== dk) { DB.stats.day = dk; DB.stats.n = 0; }
  if (HAVE_KEY && DB.stats.n >= GLOBAL_CAP) {
    save();
    return send(res, 200, { reply: "Сейчас очень много обращений. Пожалуйста, попробуйте немного позже — я обязательно отвечу.", busy: true, ent: ent(u) });
  }
  save();

  if (!HAVE_KEY) {
    return send(res, 200, { reply: "Я вас слышу. Расскажите чуть подробнее — что чувствуется сильнее всего прямо сейчас?", fallback: true, ent: ent(u) });
  }

  const history = msgs
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-24).map(m => ({ role: m.role, content: m.content }));
  if (!history.length || history[0].role !== "user") history.unshift({ role: "user", content: (last && last.content) || "Здравствуйте" });

  DB.stats.n++; save();                          // учитываем реальный вызов модели
  try {
    const text = await grokChat(plus ? MODEL : MODEL_FREE, systemPrompt(data.style, data.goals, data.name), history);
    return send(res, 200, { reply: text || "Я рядом. Расскажите, что сейчас происходит?", ent: ent(u) });
  } catch (err) {
    console.error("chat error:", err && err.message ? err.message : err);
    return send(res, 502, { error: "upstream", reply: "", ent: ent(u) });
  }
}

/* ─────────────────────── сервер ─────────────────────── */
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (req.method === "GET" && url.pathname === "/api/health")
    return send(res, 200, { ok: true, model: MODEL, model_free: MODEL_FREE, key: HAVE_KEY, verify: !!TOKEN, pay: !!(TOKEN && HOOK), users: Object.keys(DB.users).length, today_calls: (DB.stats && DB.stats.day === today() ? DB.stats.n : 0), daily_cap: GLOBAL_CAP });

  try {
    /* ---- вебхук Telegram (платежи) ---- */
    if (req.method === "POST" && url.pathname === "/webhook/" + HOOK) {
      if (!HOOK || req.headers["x-telegram-bot-api-secret-token"] !== HOOK) return send(res, 403, {});
      const upd = await readBody(req);

      if (upd.pre_checkout_query) {                 // подтвердить за 10 сек, иначе платёж отменится
        const q = upd.pre_checkout_query;
        const [uid, planId] = String(q.invoice_payload || "").split(":");
        const valid = CATALOG[planId] && String(q.from.id) === uid && q.total_amount === CATALOG[planId].stars;
        await api("answerPreCheckoutQuery", valid
          ? { pre_checkout_query_id: q.id, ok: true }
          : { pre_checkout_query_id: q.id, ok: false, error_message: "Подписка временно недоступна, попробуйте ещё раз" });
        return send(res, 200, {});
      }
      const sp = upd.message && upd.message.successful_payment;
      if (sp) {
        const [uid, planId] = String(sp.invoice_payload || "").split(":");
        if (String(upd.message.from.id) === uid) {
          const plan = CATALOG[planId];
          const recurring = sp.is_recurring || (plan && plan.sub);
          const untilMs = sp.subscription_expiration_date ? sp.subscription_expiration_date * 1000 : null;
          grant(uid, planId, sp.telegram_payment_charge_id, sp.total_amount, { sub: recurring, until: untilMs, charge: sp.telegram_payment_charge_id });
          if (!sp.is_recurring || sp.is_first_recurring) {      // не спамим при каждом авто-списании
            await api("sendMessage", { chat_id: uid,
              text: `Within Plus активирован ✨ (${plan ? plan.title : planId}).${recurring ? " Автопродление раз в 30 дней — отменить можно в приложении или в настройках Telegram." : ""}\nЧек: ${sp.telegram_payment_charge_id}\n\nЕсли что-то пошло не так — напишите сюда, вернём звёзды.` }).catch(() => {});
          }
        }
        return send(res, 200, {});
      }
      return send(res, 200, {});
    }

    /* ---- API мини-аппа ---- */
    if (req.method === "POST" && url.pathname === "/api/chat") return handleChat(res, await readBody(req));

    if (req.method === "POST" && url.pathname.startsWith("/api/")) {
      const b = await readBody(req);

      if (url.pathname === "/api/refund") {          // ручной возврат
        if (!ADMIN || b.admin !== ADMIN) return send(res, 403, { error: "нет доступа" });
        const c = DB.charges[b.chargeId];
        if (!c) return send(res, 404, { error: "платёж не найден" });
        await api("refundStarPayment", { user_id: Number(c.uid), telegram_payment_charge_id: b.chargeId });
        const u = user(c.uid); u.plus = false; u.until = 0; c.refunded = Date.now(); save();
        return send(res, 200, { ok: true });
      }

      const who = checkInitData(b.initData);
      if (!who) return send(res, 401, { error: "подпись не подтверждена" });
      const u = user(who.id);

      if (url.pathname === "/api/entitlement") return send(res, 200, ent(u));

      if (url.pathname === "/api/reminders") {       // сохранить настройки напоминаний
        const on = Array.isArray(b.toggles) ? b.toggles.map(Boolean) : [true, true, false];
        const freq = [0, 1, 2].includes(b.freq) ? b.freq : 0;
        const hour = Number.isInteger(b.hour) && b.hour >= 0 && b.hour <= 23 ? b.hour : 21;
        const tz = typeof b.tz === "string" && b.tz.length < 64 ? b.tz : "UTC";
        u.rem = { on, freq, hour, tz, sent: (u.rem && u.rem.sent) || {} };
        save();
        return send(res, 200, { ok: true, scheduled: reminderHours(u), tz });
      }

      if (url.pathname === "/api/invoice") {
        if (!TOKEN || !HOOK) return send(res, 503, { error: "платежи не настроены" });
        const plan = CATALOG[b.plan];
        if (!plan) return send(res, 400, { error: "нет такого плана" });
        const payload = `${who.id}:${b.plan}:${crypto.randomBytes(6).toString("hex")}`;
        const invoice = {
          title: plan.title, description: plan.desc, payload,
          currency: "XTR",                            // Stars: provider_token не нужен
          prices: [{ label: plan.title, amount: plan.stars }],
        };
        if (plan.sub) invoice.subscription_period = SUB_PERIOD;   // авто-продление раз в 30 дней
        const link = await api("createInvoiceLink", invoice);
        return send(res, 200, { link });
      }

      if (url.pathname === "/api/cancel-sub") {        // отменить автопродление (доступ до конца оплаченного срока)
        if (!TOKEN) return send(res, 503, { error: "платежи не настроены" });
        if (!u.sub || !u.subCharge) return send(res, 400, Object.assign({ error: "нет активной подписки" }, ent(u)));
        await api("editUserStarSubscription", { user_id: Number(who.id), telegram_payment_charge_id: u.subCharge, is_canceled: true });
        u.sub = false; save();
        return send(res, 200, ent(u));
      }
      return send(res, 404, { error: "не найдено" });
    }

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/within.html")) return serveStatic(res, "within.html");
    send(res, 404, { error: "не найдено" });
  } catch (e) {
    console.error(e);
    send(res, 500, { error: "внутренняя ошибка" });
  }
});

server.listen(PORT, () => {
  console.log(`Within backend на :${PORT}  model=${MODEL}/${MODEL_FREE}  key=${HAVE_KEY ? "yes" : "no"}  verify=${TOKEN ? "on" : "DEV(off)"}  pay=${TOKEN && HOOK ? "on" : "off"}`);
  if (TOKEN && HOOK) console.log(`Вебхук: POST /webhook/${HOOK}`);
});
module.exports = { checkInitData, grant, ent, reminderHours, dueHour, localHM, systemPrompt, cleanName, CATALOG, DB };
