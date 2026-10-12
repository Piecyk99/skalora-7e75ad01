const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });

async function cfg(env, k) {
  const r = await env.DB.prepare("SELECT v FROM config WHERE k=?").bind(k).first();
  return r ? r.v : null;
}
async function setCfg(env, k, v) {
  await env.DB.prepare("INSERT INTO config(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").bind(k, v).run();
}

async function hashPin(pin, saltB64) {
  const key = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: unb64(saltB64), iterations: 100000 },
    key,
    256,
  );
  return b64(bits);
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}

const COOKIE = "gym_session";
const SESSION_DAYS = 180;

async function makeCookie(env) {
  const secret = await cfg(env, "session_secret");
  const exp = Date.now() + SESSION_DAYS * 86400000;
  const sig = await hmac(secret, String(exp));
  return `${COOKIE}=${exp}.${encodeURIComponent(sig)}; Path=/; Max-Age=${SESSION_DAYS * 86400}; HttpOnly; Secure; SameSite=Strict`;
}

async function isAuthed(request, env) {
  const m = (request.headers.get("cookie") || "").match(new RegExp(`${COOKIE}=(\\d+)\\.([^;]+)`));
  if (!m) return false;
  if (Number(m[1]) < Date.now()) return false;
  const secret = await cfg(env, "session_secret");
  if (!secret) return false;
  const expected = await hmac(secret, m[1]);
  const got = decodeURIComponent(m[2]);
  if (expected.length !== got.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}

const validDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "");
const e1rm = (w, r) => (r <= 1 ? w : w * (1 + r / 30));

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function api(request, env, url) {
  const path = url.pathname;
  const method = request.method;

  if (path === "/api/state" && method === "GET") {
    const hasPin = !!(await cfg(env, "pin_hash"));
    return json({ setup: hasPin, authed: hasPin && (await isAuthed(request, env)) });
  }

  if (path === "/api/setup" && method === "POST") {
    if (await cfg(env, "pin_hash")) return json({ error: "already_setup" }, 409);
    const { pin } = await readBody(request);
    if (typeof pin !== "string" || !/^\d{4,12}$/.test(pin)) return json({ error: "pin_format" }, 400);
    const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
    await setCfg(env, "pin_salt", salt);
    await setCfg(env, "pin_hash", await hashPin(pin, salt));
    await setCfg(env, "session_secret", b64(crypto.getRandomValues(new Uint8Array(32))));
    return json({ ok: true }, 200, { "set-cookie": await makeCookie(env) });
  }

  if (path === "/api/login" && method === "POST") {
    const lockUntil = Number((await cfg(env, "lock_until")) || 0);
    if (lockUntil > Date.now()) return json({ error: "locked", retry_s: Math.ceil((lockUntil - Date.now()) / 1000) }, 429);
    const { pin } = await readBody(request);
    const salt = await cfg(env, "pin_salt");
    const stored = await cfg(env, "pin_hash");
    if (!salt || !stored || typeof pin !== "string") return json({ error: "bad_pin" }, 401);
    if ((await hashPin(pin, salt)) !== stored) {
      const fails = Number((await cfg(env, "fails")) || 0) + 1;
      if (fails >= 5) {
        await setCfg(env, "fails", "0");
        await setCfg(env, "lock_until", String(Date.now() + 10 * 60000));
      } else {
        await setCfg(env, "fails", String(fails));
      }
      return json({ error: "bad_pin" }, 401);
    }
    await setCfg(env, "fails", "0");
    return json({ ok: true }, 200, { "set-cookie": await makeCookie(env) });
  }

  if (path === "/api/logout" && method === "POST") {
    return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict` });
  }

  if (!(await isAuthed(request, env))) return json({ error: "unauthorized" }, 401);

  if (path === "/api/sets" && method === "GET") {
    const day = url.searchParams.get("day");
    if (!validDay(day)) return json({ error: "day" }, 400);
    const { results } = await env.DB.prepare("SELECT id,exercise,weight,reps FROM sets WHERE day=? ORDER BY id").bind(day).all();
    return json(results);
  }

  if (path === "/api/sets" && method === "POST") {
    const b = await readBody(request);
    const exercise = String(b.exercise || "").trim().slice(0, 80);
    const weight = Number(b.weight);
    const reps = Math.round(Number(b.reps));
    if (!validDay(b.day) || !exercise || !(weight >= 0 && weight <= 1000) || !(reps >= 1 && reps <= 200))
      return json({ error: "invalid" }, 400);
    const r = await env.DB.prepare("INSERT INTO sets(day,exercise,weight,reps) VALUES(?,?,?,?)")
      .bind(b.day, exercise, weight, reps)
      .run();
    return json({ id: r.meta.last_row_id, exercise, weight, reps });
  }

  let m = path.match(/^\/api\/sets\/(\d+)$/);
  if (m && method === "DELETE") {
    await env.DB.prepare("DELETE FROM sets WHERE id=?").bind(Number(m[1])).run();
    return json({ ok: true });
  }

  if (path === "/api/last" && method === "GET") {
    const ex = url.searchParams.get("exercise");
    const before = url.searchParams.get("before");
    if (!ex || !validDay(before)) return json({ error: "invalid" }, 400);
    const d = await env.DB.prepare("SELECT MAX(day) AS day FROM sets WHERE exercise=? AND day<?").bind(ex, before).first();
    if (!d || !d.day) return json({ day: null, sets: [] });
    const { results } = await env.DB.prepare("SELECT weight,reps FROM sets WHERE exercise=? AND day=? ORDER BY id").bind(ex, d.day).all();
    return json({ day: d.day, sets: results });
  }

  if (path === "/api/exercises" && method === "GET") {
    const { results } = await env.DB.prepare(
      `SELECT s.exercise, s.weight AS last_weight, s.reps AS last_reps, c.cnt, c.last_day
       FROM sets s
       JOIN (SELECT exercise, MAX(id) AS mid, COUNT(*) AS cnt, MAX(day) AS last_day FROM sets GROUP BY exercise) c
         ON c.mid = s.id
       ORDER BY c.last_day DESC, c.mid DESC`,
    ).all();
    return json(results);
  }

  if (path === "/api/history" && method === "GET") {
    const ex = url.searchParams.get("exercise");
    if (!ex) return json({ error: "exercise" }, 400);
    const { results } = await env.DB.prepare("SELECT day,weight,reps FROM sets WHERE exercise=? ORDER BY day,id").bind(ex).all();
    const byDay = new Map();
    for (const r of results) {
      const d = byDay.get(r.day) || { day: r.day, best_e1rm: 0, top_weight: 0, volume: 0, sets: 0 };
      d.best_e1rm = Math.max(d.best_e1rm, e1rm(r.weight, r.reps));
      d.top_weight = Math.max(d.top_weight, r.weight);
      d.volume += r.weight * r.reps;
      d.sets += 1;
      byDay.set(r.day, d);
    }
    return json([...byDay.values()].map((d) => ({ ...d, best_e1rm: Math.round(d.best_e1rm * 10) / 10 })));
  }

  if (path === "/api/weight" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT day,kg FROM bodyweight ORDER BY day").all();
    return json(results);
  }

  if (path === "/api/weight" && method === "POST") {
    const b = await readBody(request);
    const kg = Number(b.kg);
    if (!validDay(b.day) || !(kg > 20 && kg < 400)) return json({ error: "invalid" }, 400);
    await env.DB.prepare("INSERT INTO bodyweight(day,kg) VALUES(?,?) ON CONFLICT(day) DO UPDATE SET kg=excluded.kg")
      .bind(b.day, kg)
      .run();
    return json({ ok: true });
  }

  m = path.match(/^\/api\/weight\/(\d{4}-\d{2}-\d{2})$/);
  if (m && method === "DELETE") {
    await env.DB.prepare("DELETE FROM bodyweight WHERE day=?").bind(m[1]).run();
    return json({ ok: true });
  }

  if (path === "/api/days" && method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT day, COUNT(*) AS sets, SUM(weight*reps) AS volume FROM sets GROUP BY day ORDER BY day DESC LIMIT 60",
    ).all();
    return json(results);
  }

  if (path === "/api/export" && method === "GET") {
    const sets = (await env.DB.prepare("SELECT day,exercise,weight,reps FROM sets ORDER BY id").all()).results;
    const bodyweight = (await env.DB.prepare("SELECT day,kg FROM bodyweight ORDER BY day").all()).results;
    return new Response(JSON.stringify({ exported_at: new Date().toISOString(), sets, bodyweight }, null, 2), {
      headers: {
        "content-type": "application/json",
        "content-disposition": 'attachment; filename="gym-export.json"',
        "cache-control": "no-store",
      },
    });
  }

  if (path === "/api/import" && method === "POST") {
    const b = await readBody(request);
    const stmts = [];
    for (const s of Array.isArray(b.sets) ? b.sets : []) {
      if (validDay(s.day) && s.exercise && Number(s.weight) >= 0 && Number(s.reps) >= 1)
        stmts.push(
          env.DB.prepare("INSERT INTO sets(day,exercise,weight,reps) VALUES(?,?,?,?)").bind(
            s.day,
            String(s.exercise).slice(0, 80),
            Number(s.weight),
            Math.round(Number(s.reps)),
          ),
        );
    }
    for (const w of Array.isArray(b.bodyweight) ? b.bodyweight : []) {
      if (validDay(w.day) && Number(w.kg) > 20)
        stmts.push(
          env.DB.prepare("INSERT INTO bodyweight(day,kg) VALUES(?,?) ON CONFLICT(day) DO UPDATE SET kg=excluded.kg").bind(
            w.day,
            Number(w.kg),
          ),
        );
    }
    for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50));
    return json({ imported: stmts.length });
  }

  return json({ error: "not_found" }, 404);
}

export default {
  // Pliki statyczne (interfejs, katalog, obrazki) serwuje Workers Assets; tu trafia tylko /api/*.
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/api/")) return json({ error: "not_found" }, 404);
    // Chroni przed CSRF: zapisy tylko z tego samego originu.
    if (request.method !== "GET") {
      const origin = request.headers.get("origin");
      if (origin && origin !== url.origin) return json({ error: "forbidden" }, 403);
    }
    try {
      return await api(request, env, url);
    } catch (e) {
      return json({ error: "server", message: String(e && e.message) }, 500);
    }
  },
};
