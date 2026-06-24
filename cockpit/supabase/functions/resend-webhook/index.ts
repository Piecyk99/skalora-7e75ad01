// Webhook Resend (publiczny, verify_jwt=false). Uwierzytelnia podpisem Svix.
// Mapuje zdarzenia dostawcy na status/zdarzenia outreachu:
//   email.bounced/complained -> status 'bounced' (+ activity_log)
//   email.delivered/opened/clicked/delivery_delayed -> wpis do outreach_events
// Dopasowanie po provider_message_id (id wiadomości zapisane przy wysyłce).
// 'replied' NIE przychodzi z Resend — oznaczane ręcznie przez rpc_mark_outreach_replied.

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ENV_WH_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET");

const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json" } });

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
function bufToB64(buf: ArrayBuffer): string {
  const arr = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}

// Weryfikacja podpisu wg schematu Svix (Resend): HMAC-SHA256 z "id.timestamp.body".
async function verifySvix(secret: string, id: string, ts: string, body: string, sigHeader: string): Promise<boolean> {
  const raw = secret.startsWith("whsec_") ? secret.slice(6) : secret;
  const key = await crypto.subtle.importKey("raw", b64ToBytes(raw), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const buf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${id}.${ts}.${body}`));
  const expected = bufToB64(buf);
  // nagłówek to lista "v1,<sig> v1,<sig>..." — wystarczy zgodność dowolnego
  return sigHeader.split(" ").map((p) => (p.includes(",") ? p.split(",")[1] : p)).some((p) => p === expected);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE);
  const body = await req.text();

  // sekret: env -> Vault
  let secret = ENV_WH_SECRET;
  if (!secret) {
    try { const { data } = await db.rpc("get_resend_webhook_secret"); secret = (data as string) ?? undefined; } catch { /* */ }
  }
  if (!secret) return json({ error: "Webhook secret not configured" }, 503);

  const svixId = req.headers.get("svix-id") ?? "";
  const svixTs = req.headers.get("svix-timestamp") ?? "";
  const svixSig = req.headers.get("svix-signature") ?? "";
  if (!svixId || !svixTs || !svixSig || !(await verifySvix(secret, svixId, svixTs, body, svixSig))) {
    return json({ error: "Invalid signature" }, 401);
  }

  let evt: Record<string, unknown> = {};
  try { evt = JSON.parse(body); } catch { return json({ error: "Bad JSON" }, 400); }
  const type = String(evt.type ?? "");
  const data = (evt.data ?? {}) as Record<string, unknown>;
  const emailId = (data.email_id ?? data.id ?? null) as string | null;
  if (!type) return json({ ok: true, skipped: "no type" });

  // dopasuj outreach po id wiadomości dostawcy
  let outreachId: string | null = null;
  if (emailId) {
    const { data: row } = await db.from("outreach").select("id").eq("provider_message_id", emailId).maybeSingle();
    outreachId = (row?.id as string) ?? null;
  }
  if (!outreachId) return json({ ok: true, matched: false, type });

  const reason = JSON.stringify(data.bounce ?? data.reason ?? type).slice(0, 500);
  const ev = (et: string, meta: Record<string, unknown> = {}) =>
    db.from("outreach_events").insert({ outreach_id: outreachId, event_type: et, meta });
  const markBounced = async (etype: string, lastErr: string) => {
    await db.from("outreach").update({ status: "bounced", last_error: lastErr.slice(0, 500) }).eq("id", outreachId);
    await ev(etype, { reason });
    await db.from("activity_log").insert({
      entity_type: "outreach", entity_id: outreachId, event_type: "status_change", old_value: "sent", new_value: "bounced",
    });
  };

  switch (type) {
    case "email.bounced": await markBounced("bounced", `bounce: ${reason}`); break;
    case "email.complained": await markBounced("complained", "complaint (spam)"); break;
    case "email.delivered": await ev("delivered"); break;
    case "email.opened": await ev("opened", { source: "resend" }); break;
    case "email.clicked": await ev("clicked", { source: "resend" }); break;
    case "email.delivery_delayed": await ev("delivery_delayed"); break;
    default: await ev(type.replace(/^email\./, ""), { raw: true });
  }

  return json({ ok: true, type, outreach: outreachId });
});
