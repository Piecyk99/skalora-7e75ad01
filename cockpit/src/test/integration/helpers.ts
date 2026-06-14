import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Konfiguracja testów integracyjnych. Wymaga ŚWIEŻEGO, OSOBNEGO projektu Supabase
// z zaaplikowanymi migracjami z cockpit/supabase/migrations. Ustaw przed `npm test`:
//   COCKPIT_TEST_SUPABASE_URL=...           (url projektu)
//   COCKPIT_TEST_ANON_KEY=...               (klucz anon — sesje userów)
//   COCKPIT_TEST_SERVICE_ROLE_KEY=...       (service role — seed/cleanup, omija RLS)
export const TEST_URL = process.env.COCKPIT_TEST_SUPABASE_URL;
export const TEST_ANON = process.env.COCKPIT_TEST_ANON_KEY;
export const TEST_SERVICE = process.env.COCKPIT_TEST_SERVICE_ROLE_KEY;

export const integrationEnabled = Boolean(TEST_URL && TEST_ANON && TEST_SERVICE);

export type AppRole = "admin" | "handlowiec_pozysk" | "viewer";

export function adminClient(): SupabaseClient {
  return createClient(TEST_URL!, TEST_SERVICE!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export interface TestUser {
  id: string;
  email: string;
  password: string;
  client: SupabaseClient; // klient z sesją tego usera (RLS jako authenticated)
}

const rand = () => Math.random().toString(36).slice(2, 8);

// Tworzy potwierdzonego usera, nadaje role i zwraca zalogowanego klienta.
export async function createTestUser(roles: AppRole[]): Promise<TestUser> {
  const admin = adminClient();
  const email = `cockpit_test_${Date.now()}_${rand()}@example.com`;
  const password = `Pw_${rand()}${rand()}!`;

  const { data: created, error: cErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (cErr || !created.user) throw cErr ?? new Error("createUser nie zwrócił usera");
  const id = created.user.id;

  if (roles.length > 0) {
    const { error: rErr } = await admin
      .from("user_roles")
      .insert(roles.map((role) => ({ user_id: id, role })));
    if (rErr) throw rErr;
  }

  const client = createClient(TEST_URL!, TEST_ANON!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: sErr } = await client.auth.signInWithPassword({ email, password });
  if (sErr) throw sErr;

  return { id, email, password, client };
}

// Tworzy partner_lead przypisany do usera (przez service role — omija RLS i grant kolumnowy).
export async function seedLead(ownerId: string, overrides: Record<string, unknown> = {}) {
  const admin = adminClient();
  const { data, error } = await admin
    .from("partner_leads")
    .insert({
      firma_nazwa: `TestCo ${rand()}`,
      email: `lead_${rand()}@example.com`,
      assigned_to: ownerId,
      source: "reczny",
      status: "nowy",
      ...overrides,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// Sprzątanie: usuwa leady i userów utworzone w teście.
export async function cleanup(leadIds: string[], userIds: string[]) {
  const admin = adminClient();
  if (leadIds.length) await admin.from("partner_leads").delete().in("id", leadIds);
  for (const uid of userIds) {
    await admin.from("partner_leads").delete().eq("assigned_to", uid);
    await admin.auth.admin.deleteUser(uid).catch(() => undefined);
  }
}
