import { describe, it, expect, afterAll } from "vitest";
import {
  integrationEnabled,
  createTestUser,
  seedLead,
  cleanup,
  adminClient,
  type TestUser,
} from "./helpers";

// Testy rzeczywistego rpc_partner_lifecycle na żywej bazie. Pomijane gdy brak
// COCKPIT_TEST_* (provisioning robiony osobno, po napisaniu testów).
describe.skipIf(!integrationEnabled)("rpc_partner_lifecycle (integracja DB)", () => {
  const leadIds: string[] = [];
  const userIds: string[] = [];
  let owner: TestUser;
  let other: TestUser;

  async function freshLead(status = "nowy") {
    if (!owner) owner = await createTestUser(["handlowiec_pozysk"]);
    if (!userIds.includes(owner.id)) userIds.push(owner.id);
    const lead = await seedLead(owner.id, { status });
    leadIds.push(lead.id);
    return lead;
  }

  afterAll(async () => {
    await cleanup(leadIds, userIds);
  });

  it("dozwolone przejście nowy -> kontakt przechodzi i zmienia status", async () => {
    const lead = await freshLead("nowy");
    const { data, error } = await owner.client.rpc("rpc_partner_lifecycle", {
      p_lead_id: lead.id,
      p_new_status: "kontakt",
    });
    expect(error).toBeNull();
    expect((data as { status: string }).status).toBe("kontakt");
  });

  it("niedozwolone przejście nowy -> onboarding jest odrzucone", async () => {
    const lead = await freshLead("nowy");
    const { error } = await owner.client.rpc("rpc_partner_lifecycle", {
      p_lead_id: lead.id,
      p_new_status: "onboarding",
    });
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toContain("niedozwolone");
  });

  it("przejście z terminalnego 'wygrany' jest odrzucone", async () => {
    const lead = await freshLead("wygrany");
    const { error } = await owner.client.rpc("rpc_partner_lifecycle", {
      p_lead_id: lead.id,
      p_new_status: "nowy",
    });
    expect(error).not.toBeNull();
  });

  it("no-op: ten sam status zwraca leada bez błędu", async () => {
    const lead = await freshLead("nowy");
    const { data, error } = await owner.client.rpc("rpc_partner_lifecycle", {
      p_lead_id: lead.id,
      p_new_status: "nowy",
    });
    expect(error).toBeNull();
    expect((data as { status: string }).status).toBe("nowy");
  });

  it("inny handlowiec NIE może zmienić statusu cudzego leada (autoryzacja w RPC)", async () => {
    const lead = await freshLead("nowy");
    other = other ?? (await createTestUser(["handlowiec_pozysk"]));
    if (!userIds.includes(other.id)) userIds.push(other.id);
    const { error } = await other.client.rpc("rpc_partner_lifecycle", {
      p_lead_id: lead.id,
      p_new_status: "kontakt",
    });
    expect(error).not.toBeNull(); // 42501 — brak uprawnień
  });

  it("udane przejście dopisuje wpis status_change do activity_log", async () => {
    const lead = await freshLead("nowy");
    await owner.client.rpc("rpc_partner_lifecycle", {
      p_lead_id: lead.id,
      p_new_status: "kontakt",
    });
    const { data } = await adminClient()
      .from("activity_log")
      .select("*")
      .eq("entity_id", lead.id)
      .eq("event_type", "status_change");
    expect((data ?? []).length).toBeGreaterThanOrEqual(1);
    const entry = (data ?? [])[0] as { old_value: string; new_value: string } | undefined;
    expect(entry?.old_value).toBe("nowy");
    expect(entry?.new_value).toBe("kontakt");
  });
});
