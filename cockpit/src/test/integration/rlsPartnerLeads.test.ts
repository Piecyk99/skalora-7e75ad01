import { describe, it, expect, afterAll, beforeAll } from "vitest";
import {
  integrationEnabled,
  createTestUser,
  seedLead,
  cleanup,
  type TestUser,
} from "./helpers";

// RLS deny-by-default na partner_leads: handlowiec widzi/edytuje wyłącznie SWOJE leady.
// Pomijane gdy brak COCKPIT_TEST_* (provisioning osobno, po testach).
describe.skipIf(!integrationEnabled)("RLS partner_leads — izolacja właściciela", () => {
  const leadIds: string[] = [];
  const userIds: string[] = [];
  let userA: TestUser; // właściciel leada
  let userB: TestUser; // inny handlowiec
  let leadId: string;

  beforeAll(async () => {
    userA = await createTestUser(["handlowiec_pozysk"]);
    userB = await createTestUser(["handlowiec_pozysk"]);
    userIds.push(userA.id, userB.id);
    const lead = await seedLead(userA.id);
    leadId = lead.id;
    leadIds.push(leadId);
  });

  afterAll(async () => {
    await cleanup(leadIds, userIds);
  });

  it("właściciel (A) widzi swojego leada", async () => {
    const { data, error } = await userA.client
      .from("partner_leads")
      .select("*")
      .eq("id", leadId);
    expect(error).toBeNull();
    expect((data ?? []).length).toBe(1);
  });

  it("obcy handlowiec (B) NIE widzi cudzego leada (SELECT zwraca 0 wierszy)", async () => {
    const { data, error } = await userB.client
      .from("partner_leads")
      .select("*")
      .eq("id", leadId);
    expect(error).toBeNull(); // RLS nie rzuca błędem — po prostu nic nie zwraca
    expect((data ?? []).length).toBe(0);
  });

  it("obcy handlowiec (B) NIE może edytować cudzego leada (UPDATE nie dotyka wiersza)", async () => {
    const { data, error } = await userB.client
      .from("partner_leads")
      .update({ telefon: "999-999-999" })
      .eq("id", leadId)
      .select("*");
    // RLS: brak pasującego wiersza w zakresie B → 0 zaktualizowanych, brak wycieku.
    expect(error).toBeNull();
    expect((data ?? []).length).toBe(0);
  });

  it("nikt z frontu nie może zmienić kolumny status bezpośrednim UPDATE (brak grantu kolumnowego)", async () => {
    // Nawet właściciel A: status zmienia tylko rpc_partner_lifecycle.
    const { error } = await userA.client
      .from("partner_leads")
      .update({ status: "kontakt" })
      .eq("id", leadId)
      .select("*");
    expect(error).not.toBeNull(); // odmowa na poziomie uprawnień kolumnowych
  });

  it("właściciel (A) MOŻE edytować dozwoloną kolumnę swojego leada", async () => {
    const { data, error } = await userA.client
      .from("partner_leads")
      .update({ telefon: "111-222-333" })
      .eq("id", leadId)
      .select("*");
    expect(error).toBeNull();
    expect((data ?? []).length).toBe(1);
    expect((data![0] as { telefon: string }).telefon).toBe("111-222-333");
  });
});
