import { supabase } from "@/integrations/supabase/client";

const CRM_PASSWORD = "sk_dpx_ed1b5c9149eaec8fad9e3091d74b1c7c";
const TOKEN_KEY = "crm_authed";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthed(): boolean {
  return localStorage.getItem(TOKEN_KEY) === CRM_PASSWORD;
}

export function login(password: string): boolean {
  if (password === CRM_PASSWORD) {
    setToken(password);
    return true;
  }
  return false;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  company_stage: string | null;
  growth_blocker: string | null;
  source: string;
  status: LeadStatus;
  assigned_to: string | null;
  notes_count: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  lead_id: number;
  content: string;
  author: string;
  created_at: string;
}

export interface Activity {
  id: number;
  lead_id: number;
  type: string;
  description: string;
  created_at: string;
}

export interface LeadDetail {
  lead: Lead;
  notes: Note[];
  activities: Activity[];
}

export interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsResponse {
  total: number;
  today: number;
  this_week: number;
  by_status: { status: string; count: number }[];
}

export async function submitLead(data: {
  name: string;
  email: string;
  phone: string;
  company_stage?: string;
  growth_blocker?: string;
}) {
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({ ...data, source: "landing_page", status: "new" })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("activities").insert({
    lead_id: lead.id,
    type: "created",
    description: "Lead dodany przez formularz na stronie",
  });

  return lead;
}

export async function fetchLeads(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<LeadsResponse> {
  const page = params?.page ?? 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase.from("leads").select("*", { count: "exact" });

  if (params?.status) query = query.eq("status", params.status);
  if (params?.search) {
    const s = `%${params.search}%`;
    query = query.or(`name.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return { leads: (data ?? []) as Lead[], total: count ?? 0, page, limit };
}

export async function fetchLead(id: number): Promise<LeadDetail> {
  const [leadRes, notesRes, activitiesRes] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase.from("notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("activities").select("*").eq("lead_id", id).order("created_at", { ascending: false }).limit(20),
  ]);
  if (leadRes.error) throw leadRes.error;
  return {
    lead: leadRes.data as Lead,
    notes: (notesRes.data ?? []) as Note[],
    activities: (activitiesRes.data ?? []) as Activity[],
  };
}

export async function updateLead(
  id: number,
  data: Partial<Pick<Lead, "status" | "assigned_to" | "company_stage" | "growth_blocker">>
): Promise<{ lead: Lead }> {
  const { data: lead, error } = await supabase
    .from("leads")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  if (data.status) {
    await supabase.from("activities").insert({
      lead_id: id,
      type: "status_change",
      description: `Status zmieniony na: ${data.status}`,
    });
  }
  return { lead: lead as Lead };
}

export async function deleteLead(id: number): Promise<void> {
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) throw error;
}

export async function addNote(leadId: number, content: string, author = "agent"): Promise<{ note: Note }> {
  const { data: note, error } = await supabase
    .from("notes")
    .insert({ lead_id: leadId, content, author })
    .select()
    .single();
  if (error) throw error;

  const { data: leadData } = await supabase.from("leads").select("notes_count").eq("id", leadId).single();
  await supabase.from("leads").update({
    notes_count: (leadData?.notes_count ?? 0) + 1,
    updated_at: new Date().toISOString(),
  }).eq("id", leadId);

  await supabase.from("activities").insert({
    lead_id: leadId,
    type: "note",
    description: "Dodano notatkę",
  });

  return { note: note as Note };
}

export async function fetchStats(): Promise<StatsResponse> {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalRes, statusRes, todayRes, weekRes] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("status"),
    supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", todayStr),
    supabase.from("leads").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
  ]);

  const byStatusMap: Record<string, number> = {};
  for (const row of statusRes.data ?? []) {
    byStatusMap[row.status] = (byStatusMap[row.status] ?? 0) + 1;
  }

  return {
    total: totalRes.count ?? 0,
    today: todayRes.count ?? 0,
    this_week: weekRes.count ?? 0,
    by_status: Object.entries(byStatusMap).map(([status, count]) => ({ status, count })),
  };
}
