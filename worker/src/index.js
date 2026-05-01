const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function error(message, status = 400) {
  return json({ error: message }, status);
}

function checkAuth(request, env) {
  const auth = request.headers.get("Authorization");
  return auth === `Bearer ${env.CRM_SECRET}`;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Public: submit lead from landing page
    if (path === "/api/leads" && request.method === "POST") {
      return handleCreateLead(request, env);
    }

    // Protected CRM endpoints
    if (!checkAuth(request, env)) {
      return error("Unauthorized", 401);
    }

    if (path === "/api/leads" && request.method === "GET") {
      return handleListLeads(request, env, url);
    }
    if (/^\/api\/leads\/\d+$/.test(path) && request.method === "GET") {
      return handleGetLead(env, +path.split("/")[3]);
    }
    if (/^\/api\/leads\/\d+$/.test(path) && request.method === "PATCH") {
      return handleUpdateLead(request, env, +path.split("/")[3]);
    }
    if (/^\/api\/leads\/\d+$/.test(path) && request.method === "DELETE") {
      return handleDeleteLead(env, +path.split("/")[3]);
    }
    if (/^\/api\/leads\/\d+\/notes$/.test(path) && request.method === "POST") {
      return handleAddNote(request, env, +path.split("/")[3]);
    }
    if (/^\/api\/leads\/\d+\/notes$/.test(path) && request.method === "GET") {
      return handleGetNotes(env, +path.split("/")[3]);
    }
    if (path === "/api/stats" && request.method === "GET") {
      return handleStats(env);
    }

    return error("Not Found", 404);
  },
};

async function handleCreateLead(request, env) {
  let body;
  try { body = await request.json(); } catch { return error("Invalid JSON"); }

  const { name, email, phone, company_stage, growth_blocker } = body;
  if (!name || !email || !phone) return error("name, email i phone są wymagane");

  const result = await env.DB.prepare(
    `INSERT INTO leads (name, email, phone, company_stage, growth_blocker, source, status)
     VALUES (?, ?, ?, ?, ?, 'landing_page', 'new') RETURNING *`
  ).bind(name, email, phone, company_stage ?? null, growth_blocker ?? null).first();

  await env.DB.prepare(
    `INSERT INTO activities (lead_id, type, description) VALUES (?, 'created', 'Lead dodany przez formularz na stronie')`
  ).bind(result?.id).run();

  return json({ success: true, lead: result }, 201);
}

async function handleListLeads(request, env, url) {
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params = [];

  if (status) { where += " AND status = ?"; params.push(status); }
  if (search) {
    where += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = await env.DB.prepare(`SELECT COUNT(*) as total FROM leads ${where}`)
    .bind(...params).first();

  const leads = await env.DB.prepare(
    `SELECT * FROM leads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  return json({ leads: leads.results, total: countResult?.total ?? 0, page, limit });
}

async function handleGetLead(env, id) {
  const lead = await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first();
  if (!lead) return error("Lead nie znaleziony", 404);

  const notes = await env.DB.prepare(
    "SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC"
  ).bind(id).all();

  const activities = await env.DB.prepare(
    "SELECT * FROM activities WHERE lead_id = ? ORDER BY created_at DESC LIMIT 20"
  ).bind(id).all();

  return json({ lead, notes: notes.results, activities: activities.results });
}

async function handleUpdateLead(request, env, id) {
  let body;
  try { body = await request.json(); } catch { return error("Invalid JSON"); }

  const allowed = ["status", "assigned_to", "company_stage", "growth_blocker"];
  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (key in body) { updates.push(`${key} = ?`); values.push(body[key]); }
  }

  if (updates.length === 0) return error("Brak pól do aktualizacji");
  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  await env.DB.prepare(`UPDATE leads SET ${updates.join(", ")} WHERE id = ?`).bind(...values).run();

  if (body.status) {
    await env.DB.prepare(
      `INSERT INTO activities (lead_id, type, description) VALUES (?, 'status_change', ?)`
    ).bind(id, `Status zmieniony na: ${body.status}`).run();
  }

  const updated = await env.DB.prepare("SELECT * FROM leads WHERE id = ?").bind(id).first();
  return json({ success: true, lead: updated });
}

async function handleDeleteLead(env, id) {
  const lead = await env.DB.prepare("SELECT id FROM leads WHERE id = ?").bind(id).first();
  if (!lead) return error("Lead nie znaleziony", 404);
  await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(id).run();
  return json({ success: true });
}

async function handleAddNote(request, env, leadId) {
  let body;
  try { body = await request.json(); } catch { return error("Invalid JSON"); }

  const { content, author } = body;
  if (!content) return error("Treść notatki jest wymagana");

  const note = await env.DB.prepare(
    `INSERT INTO notes (lead_id, content, author) VALUES (?, ?, ?) RETURNING *`
  ).bind(leadId, content, author ?? "agent").first();

  await env.DB.prepare(
    "UPDATE leads SET notes_count = notes_count + 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  ).bind(leadId).run();

  await env.DB.prepare(
    `INSERT INTO activities (lead_id, type, description) VALUES (?, 'note', 'Dodano notatkę')`
  ).bind(leadId).run();

  return json({ success: true, note }, 201);
}

async function handleGetNotes(env, leadId) {
  const notes = await env.DB.prepare(
    "SELECT * FROM notes WHERE lead_id = ? ORDER BY created_at DESC"
  ).bind(leadId).all();
  return json({ notes: notes.results });
}

async function handleStats(env) {
  const total = await env.DB.prepare("SELECT COUNT(*) as count FROM leads").first();
  const byStatus = await env.DB.prepare(
    "SELECT status, COUNT(*) as count FROM leads GROUP BY status"
  ).all();
  const today = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM leads WHERE DATE(created_at) = DATE('now')"
  ).first();
  const thisWeek = await env.DB.prepare(
    "SELECT COUNT(*) as count FROM leads WHERE created_at >= datetime('now', '-7 days')"
  ).first();

  return json({
    total: total?.count ?? 0,
    today: today?.count ?? 0,
    this_week: thisWeek?.count ?? 0,
    by_status: byStatus.results,
  });
}
# redeployment trigger Fri May  1 21:41:12 UTC 2026
