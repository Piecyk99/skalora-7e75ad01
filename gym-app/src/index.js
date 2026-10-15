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
const validPlanId = (p) => typeof p === "string" && /^(rest|[a-z0-9_]{1,40})$/.test(p);
const e1rm = (w, r) => (r <= 1 ? w : w * (1 + r / 30));

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

let layoutReady;
function ensureSchema(env) {
  if (!layoutReady) layoutReady = env.DB.prepare("ALTER TABLE sessions ADD COLUMN layout TEXT").run().catch(() => {});
  return layoutReady;
}

async function api(request, env, url) {
  await ensureSchema(env);
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
    const { results } = await env.DB.prepare("SELECT id,exercise,weight,reps,warmup FROM sets WHERE day=? ORDER BY id").bind(day).all();
    return json(results);
  }

  if (path === "/api/sets" && method === "POST") {
    const b = await readBody(request);
    const exercise = String(b.exercise || "").trim().slice(0, 80);
    const weight = Number(b.weight);
    const reps = Math.round(Number(b.reps));
    if (!validDay(b.day) || !exercise || !(weight >= 0 && weight <= 1000) || !(reps >= 1 && reps <= 200))
      return json({ error: "invalid" }, 400);
    const warmup = b.warmup ? 1 : 0;
    const r = await env.DB.prepare("INSERT INTO sets(day,exercise,weight,reps,warmup) VALUES(?,?,?,?,?)")
      .bind(b.day, exercise, weight, reps, warmup)
      .run();
    return json({ id: r.meta.last_row_id, exercise, weight, reps, warmup });
  }

  let m = path.match(/^\/api\/sets\/(\d+)$/);
  if (m && method === "PATCH") {
    const b = await readBody(request);
    if (typeof b.warmup !== "boolean") return json({ error: "warmup" }, 400);
    await env.DB.prepare("UPDATE sets SET warmup=? WHERE id=?").bind(b.warmup ? 1 : 0, Number(m[1])).run();
    return json({ ok: true });
  }
  if (m && method === "DELETE") {
    await env.DB.prepare("DELETE FROM sets WHERE id=?").bind(Number(m[1])).run();
    return json({ ok: true });
  }

  if (path === "/api/last" && method === "GET") {
    const ex = url.searchParams.get("exercise");
    const before = url.searchParams.get("before");
    if (!ex || !validDay(before)) return json({ error: "invalid" }, 400);
    const d = await env.DB.prepare("SELECT MAX(day) AS day FROM sets WHERE exercise=? AND day<? AND warmup=0").bind(ex, before).first();
    if (!d || !d.day) return json({ day: null, sets: [] });
    const { results } = await env.DB.prepare("SELECT weight,reps FROM sets WHERE exercise=? AND day=? AND warmup=0 ORDER BY id").bind(ex, d.day).all();
    return json({ day: d.day, sets: results });
  }

  if (path === "/api/exercises" && method === "GET") {
    const { results } = await env.DB.prepare(
      `SELECT s.exercise, s.weight AS last_weight, s.reps AS last_reps, c.cnt, c.last_day
       FROM sets s
       JOIN (SELECT exercise, MAX(id) AS mid, COUNT(*) AS cnt, MAX(day) AS last_day FROM sets WHERE warmup=0 GROUP BY exercise) c
         ON c.mid = s.id
       ORDER BY c.last_day DESC, c.mid DESC`,
    ).all();
    return json(results);
  }

  if (path === "/api/history" && method === "GET") {
    const ex = url.searchParams.get("exercise");
    if (!ex) return json({ error: "exercise" }, 400);
    const { results } = await env.DB.prepare("SELECT day,weight,reps FROM sets WHERE exercise=? AND warmup=0 ORDER BY day,id").bind(ex).all();
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
      "SELECT day, COUNT(*) AS sets, SUM(weight*reps) AS volume FROM sets WHERE warmup=0 GROUP BY day ORDER BY day DESC LIMIT 60",
    ).all();
    return json(results);
  }

  // ---------- kalendarz ----------
  if (path === "/api/calendar" && method === "GET") {
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    if (!validDay(from) || !validDay(to) || to < from || (Date.parse(to) - Date.parse(from)) / 86400000 > 62)
      return json({ error: "range" }, 400);
    const days = (
      await env.DB.prepare(
        "SELECT day, COUNT(*) AS sets, SUM(weight*reps) AS volume FROM sets WHERE day BETWEEN ? AND ? AND warmup=0 GROUP BY day ORDER BY day",
      ).bind(from, to).all()
    ).results;
    const sets = (
      await env.DB.prepare("SELECT day,exercise,weight,reps,warmup FROM sets WHERE day BETWEEN ? AND ? ORDER BY day,id").bind(from, to).all()
    ).results;
    const sessions = (
      await env.DB.prepare("SELECT day,plan_id,plan_name,started_at,finished_at,note,layout FROM sessions WHERE day BETWEEN ? AND ?")
        .bind(from, to)
        .all()
    ).results;
    const overrides = (await env.DB.prepare("SELECT day,plan_id FROM planned WHERE day BETWEEN ? AND ?").bind(from, to).all()).results;
    return json({ days, sets, sessions, overrides });
  }

  // ---------- harmonogram tygodnia (0 = niedziela ... 6 = sobota) ----------
  if (path === "/api/schedule" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT dow,plan_id FROM schedule").all();
    const schedule = {};
    for (const r of results) schedule[r.dow] = r.plan_id;
    return json({ schedule });
  }

  if (path === "/api/schedule" && method === "POST") {
    const b = await readBody(request);
    const dow = Number(b.dow);
    if (!Number.isInteger(dow) || dow < 0 || dow > 6) return json({ error: "dow" }, 400);
    if (b.plan_id == null || b.plan_id === "") {
      await env.DB.prepare("DELETE FROM schedule WHERE dow=?").bind(dow).run();
    } else {
      if (!validPlanId(b.plan_id)) return json({ error: "plan_id" }, 400);
      await env.DB.prepare("INSERT INTO schedule(dow,plan_id) VALUES(?,?) ON CONFLICT(dow) DO UPDATE SET plan_id=excluded.plan_id")
        .bind(dow, b.plan_id)
        .run();
    }
    return json({ ok: true });
  }

  // ---------- plan na konkretny dzień (nadpisuje harmonogram; "rest" = dzień wolny) ----------
  if (path === "/api/planned" && method === "POST") {
    const b = await readBody(request);
    if (!validDay(b.day)) return json({ error: "day" }, 400);
    if (b.plan_id == null || b.plan_id === "") {
      await env.DB.prepare("DELETE FROM planned WHERE day=?").bind(b.day).run();
    } else {
      if (!validPlanId(b.plan_id)) return json({ error: "plan_id" }, 400);
      await env.DB.prepare("INSERT INTO planned(day,plan_id) VALUES(?,?) ON CONFLICT(day) DO UPDATE SET plan_id=excluded.plan_id")
        .bind(b.day, b.plan_id)
        .run();
    }
    return json({ ok: true });
  }

  // ---------- sesje treningowe ----------
  if (path === "/api/sessions/start" && method === "POST") {
    const b = await readBody(request);
    if (!validDay(b.day) || !validPlanId(b.plan_id)) return json({ error: "invalid" }, 400);
    const name = String(b.plan_name || "").slice(0, 80);
    await env.DB.prepare(
      `INSERT INTO sessions(day,plan_id,plan_name,started_at) VALUES(?,?,?,?)
       ON CONFLICT(day) DO UPDATE SET layout=CASE WHEN sessions.plan_id=excluded.plan_id THEN sessions.layout ELSE NULL END,
         plan_id=excluded.plan_id, plan_name=excluded.plan_name, finished_at=NULL`,
    )
      .bind(b.day, b.plan_id, name, new Date().toISOString())
      .run();
    return json({ ok: true });
  }

  if (path === "/api/sessions/layout" && method === "POST") {
    const b = await readBody(request);
    if (!validDay(b.day) || !b.layout || typeof b.layout !== "object") return json({ error: "invalid" }, 400);
    const id = /^[a-z0-9_]{1,40}$/;
    const swap = {};
    for (const [k, v] of Object.entries(b.layout.swap && typeof b.layout.swap === "object" ? b.layout.swap : {})) {
      if (id.test(k) && id.test(String(v)) && Object.keys(swap).length < 60) swap[k] = String(v);
    }
    const extra = (Array.isArray(b.layout.extra) ? b.layout.extra : []).filter((x) => id.test(String(x))).slice(0, 30).map(String);
    await env.DB.prepare("UPDATE sessions SET layout=? WHERE day=?").bind(JSON.stringify({ swap, extra }), b.day).run();
    return json({ ok: true });
  }

  if (path === "/api/sessions/finish" && method === "POST") {
    const b = await readBody(request);
    if (!validDay(b.day)) return json({ error: "day" }, 400);
    const note = String(b.note || "").slice(0, 500);
    // Trening bez żadnej serii roboczej nie jest zaliczany (chroni kolejkę przed przypadkowym kliknięciem).
    const cnt = await env.DB.prepare("SELECT COUNT(*) AS n FROM sets WHERE day=? AND warmup=0").bind(b.day).first();
    if (!cnt || !cnt.n) return json({ error: "no_sets" }, 409);
    await env.DB.prepare("UPDATE sessions SET finished_at=?, note=? WHERE day=?").bind(new Date().toISOString(), note, b.day).run();
    await env.DB.prepare("DELETE FROM config WHERE k='queue_override'").run();
    return json({ ok: true });
  }

  m = path.match(/^\/api\/sessions\/(\d{4}-\d{2}-\d{2})$/);
  if (m && method === "DELETE") {
    await env.DB.prepare("DELETE FROM sessions WHERE day=?").bind(m[1]).run();
    return json({ ok: true });
  }

  // ---------- kolejka treningów ----------
  // Serwer tylko zwraca historię i ustawienia; kolejność liczy klient (public/app.js, computeQueue).
  if (path === "/api/queue" && method === "GET") {
    const ids = String(url.searchParams.get("rotation") || "").split(",").filter(Boolean);
    if (!ids.length || ids.length > 16 || !ids.every((x) => /^[a-z0-9_]{1,40}$/.test(x))) return json({ error: "rotation" }, 400);
    const marks = ids.map(() => "?").join(",");
    const { results } = await env.DB.prepare(
      `SELECT day, plan_id FROM sessions WHERE finished_at IS NOT NULL AND plan_id IN (${marks}) ORDER BY finished_at DESC LIMIT 40`,
    ).bind(...ids).all();
    const override = await cfg(env, "queue_override");
    const mode = await cfg(env, "rotation_mode");
    const work = String((await cfg(env, "work_tomorrow")) || "");
    const wm = work.match(/^(\d{4}-\d{2}-\d{2}):([01])$/);
    return json({
      last: results[0] || null,
      recent: results,
      override: override && ids.includes(override) ? override : null,
      mode: mode === "3" || mode === "4" ? mode : "auto",
      work: wm ? { day: wm[1], value: wm[2] === "1" } : null,
    });
  }

  if (path === "/api/queue" && method === "POST") {
    const b = await readBody(request);
    if (b.work_tomorrow === null) {
      await env.DB.prepare("DELETE FROM config WHERE k='work_tomorrow'").run();
      return json({ ok: true });
    }
    if (b.work_tomorrow !== undefined) {
      if (typeof b.work_tomorrow !== "boolean" || !validDay(b.day)) return json({ error: "work_tomorrow" }, 400);
      await setCfg(env, "work_tomorrow", b.day + ":" + (b.work_tomorrow ? "1" : "0"));
      return json({ ok: true });
    }
    if (b.mode !== undefined) {
      if (!["auto", "3", "4"].includes(b.mode)) return json({ error: "mode" }, 400);
      await setCfg(env, "rotation_mode", b.mode);
      await env.DB.prepare("DELETE FROM config WHERE k='queue_override'").run();
      return json({ ok: true });
    }
    if (b.override == null) {
      await env.DB.prepare("DELETE FROM config WHERE k='queue_override'").run();
    } else {
      if (typeof b.override !== "string" || !/^[a-z0-9_]{1,40}$/.test(b.override)) return json({ error: "override" }, 400);
      await setCfg(env, "queue_override", b.override);
    }
    return json({ ok: true });
  }

  // ---------- własne plany ----------
  if (path === "/api/plans" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT id,name,when_text,items FROM user_plans ORDER BY updated_at DESC").all();
    return json(results.map((r) => ({ id: r.id, name: r.name, when: r.when_text || "", items: JSON.parse(r.items), custom: true })));
  }

  if (path === "/api/plans" && method === "POST") {
    const b = await readBody(request);
    const name = String(b.name || "").trim().slice(0, 60);
    if (!name || !Array.isArray(b.items) || b.items.length < 1 || b.items.length > 40) return json({ error: "invalid" }, 400);
    const items = [];
    for (const it of b.items) {
      const sets = Math.round(Number(it && it.sets));
      const reps = String((it && it.reps) || "").trim().slice(0, 20);
      if (!it || !/^[a-z0-9_]{1,40}$/.test(String(it.exercise_id)) || !(sets >= 1 && sets <= 20) || !reps) return json({ error: "item" }, 400);
      const o = { exercise_id: it.exercise_id, sets, reps };
      if (Number(it.rest_s) > 0 && Number(it.rest_s) <= 900) o.rest_s = Math.round(Number(it.rest_s));
      if (it.note) o.note = String(it.note).slice(0, 120);
      if (it.superset_group) o.superset_group = String(it.superset_group).slice(0, 2);
      if (it.optional === true) o.optional = true;
      items.push(o);
    }
    let id = b.id;
    if (id != null && !/^u_[a-f0-9]{8,32}$/.test(String(id))) return json({ error: "id" }, 400);
    if (!id) id = "u_" + [...crypto.getRandomValues(new Uint8Array(6))].map((x) => x.toString(16).padStart(2, "0")).join("");
    await env.DB.prepare(
      `INSERT INTO user_plans(id,name,when_text,items,updated_at) VALUES(?,?,?,?,datetime('now'))
       ON CONFLICT(id) DO UPDATE SET name=excluded.name, when_text=excluded.when_text, items=excluded.items, updated_at=datetime('now')`,
    )
      .bind(id, name, String(b.when || "").slice(0, 80), JSON.stringify(items))
      .run();
    return json({ id, name, when: String(b.when || "").slice(0, 80), items, custom: true });
  }

  m = path.match(/^\/api\/plans\/(u_[a-f0-9]{8,32})$/);
  if (m && method === "DELETE") {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM user_plans WHERE id=?").bind(m[1]),
      env.DB.prepare("DELETE FROM schedule WHERE plan_id=?").bind(m[1]),
      env.DB.prepare("DELETE FROM planned WHERE plan_id=?").bind(m[1]),
    ]);
    return json({ ok: true });
  }

  // ---------- eksport / import ----------
  if (path === "/api/export" && method === "GET") {
    const q = async (sql) => (await env.DB.prepare(sql).all()).results;
    const out = {
      exported_at: new Date().toISOString(),
      sets: await q("SELECT day,exercise,weight,reps,warmup FROM sets ORDER BY id"),
      bodyweight: await q("SELECT day,kg FROM bodyweight ORDER BY day"),
      sessions: await q("SELECT day,plan_id,plan_name,started_at,finished_at,note,layout FROM sessions ORDER BY day"),
      schedule: await q("SELECT dow,plan_id FROM schedule"),
      planned: await q("SELECT day,plan_id FROM planned ORDER BY day"),
      plans: (await q("SELECT id,name,when_text,items FROM user_plans")).map((r) => ({ id: r.id, name: r.name, when: r.when_text || "", items: JSON.parse(r.items) })),
    };
    return new Response(JSON.stringify(out, null, 2), {
      headers: {
        "content-type": "application/json",
        "content-disposition": 'attachment; filename="gym-export.json"',
        "cache-control": "no-store",
      },
    });
  }

  if (path === "/api/import" && method === "POST") {
    const b = await readBody(request);
    const arr = (x) => (Array.isArray(x) ? x : []);
    const stmts = [];
    for (const s of arr(b.sets)) {
      if (validDay(s.day) && s.exercise && Number(s.weight) >= 0 && Number(s.reps) >= 1)
        stmts.push(
          env.DB.prepare("INSERT INTO sets(day,exercise,weight,reps,warmup) VALUES(?,?,?,?,?)").bind(
            s.day,
            String(s.exercise).slice(0, 80),
            Number(s.weight),
            Math.round(Number(s.reps)),
            s.warmup ? 1 : 0,
          ),
        );
    }
    for (const w of arr(b.bodyweight)) {
      if (validDay(w.day) && Number(w.kg) > 20)
        stmts.push(
          env.DB.prepare("INSERT INTO bodyweight(day,kg) VALUES(?,?) ON CONFLICT(day) DO UPDATE SET kg=excluded.kg").bind(w.day, Number(w.kg)),
        );
    }
    for (const x of arr(b.sessions)) {
      if (validDay(x.day) && validPlanId(x.plan_id))
        stmts.push(
          env.DB.prepare(
            `INSERT INTO sessions(day,plan_id,plan_name,started_at,finished_at,note,layout) VALUES(?,?,?,?,?,?,?)
             ON CONFLICT(day) DO UPDATE SET plan_id=excluded.plan_id, plan_name=excluded.plan_name, started_at=excluded.started_at, finished_at=excluded.finished_at, note=excluded.note, layout=excluded.layout`,
          ).bind(x.day, x.plan_id, String(x.plan_name || "").slice(0, 80), x.started_at || null, x.finished_at || null, String(x.note || "").slice(0, 500), typeof x.layout === "string" ? x.layout.slice(0, 4000) : null),
        );
    }
    for (const x of arr(b.schedule)) {
      if (Number.isInteger(Number(x.dow)) && Number(x.dow) >= 0 && Number(x.dow) <= 6 && validPlanId(x.plan_id))
        stmts.push(
          env.DB.prepare("INSERT INTO schedule(dow,plan_id) VALUES(?,?) ON CONFLICT(dow) DO UPDATE SET plan_id=excluded.plan_id").bind(Number(x.dow), x.plan_id),
        );
    }
    for (const x of arr(b.planned)) {
      if (validDay(x.day) && validPlanId(x.plan_id))
        stmts.push(env.DB.prepare("INSERT INTO planned(day,plan_id) VALUES(?,?) ON CONFLICT(day) DO UPDATE SET plan_id=excluded.plan_id").bind(x.day, x.plan_id));
    }
    for (const x of arr(b.plans)) {
      if (/^u_[a-f0-9]{8,32}$/.test(String(x.id)) && x.name && Array.isArray(x.items) && x.items.length <= 40)
        stmts.push(
          env.DB.prepare(
            `INSERT INTO user_plans(id,name,when_text,items) VALUES(?,?,?,?)
             ON CONFLICT(id) DO UPDATE SET name=excluded.name, when_text=excluded.when_text, items=excluded.items`,
          ).bind(x.id, String(x.name).slice(0, 60), String(x.when || "").slice(0, 80), JSON.stringify(x.items)),
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
