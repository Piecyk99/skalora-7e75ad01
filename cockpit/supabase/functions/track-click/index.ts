// Click-tracking + redirect (publiczny, verify_jwt=false).
// GET ?o=<outreach_id>&u=<docelowy_url> -> zlicza klik i przekierowuje (302).

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  const params = new URL(req.url).searchParams;
  const o = params.get("o");
  const u = params.get("u") ?? "";

  // tylko bezpieczne schematy
  let target = "/";
  try {
    const parsed = new URL(u);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") target = parsed.toString();
  } catch { /* niepoprawny url -> redirect na "/" */ }

  if (o) {
    try {
      const db = createClient(SUPABASE_URL, SERVICE_ROLE);
      await db.rpc("bump_outreach_metric", { _id: o, _kind: "click" });
    } catch { /* nie blokuj redirectu */ }
  }
  return new Response(null, { status: 302, headers: { location: target } });
});
