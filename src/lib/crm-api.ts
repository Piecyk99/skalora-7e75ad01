const API_URL = import.meta.env.VITE_CRM_API_URL ?? "https://skalora-crm-api.dpsolutionsbusiness.workers.dev";
const SECRET_KEY = "crm_secret";

export function getToken(): string {
  return localStorage.getItem(SECRET_KEY) ?? "";
}

export function setToken(token: string) {
  localStorage.setItem(SECRET_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(SECRET_KEY);
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
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
  const res = await fetch(`${API_URL}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchLeads(params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<LeadsResponse> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.search) q.set("search", params.search);
  if (params?.page) q.set("page", String(params.page));
  const res = await fetch(`${API_URL}/api/leads?${q}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchLead(id: number): Promise<LeadDetail> {
  const res = await fetch(`${API_URL}/api/leads/${id}`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateLead(
  id: number,
  data: Partial<Pick<Lead, "status" | "assigned_to" | "company_stage" | "growth_blocker">>
): Promise<{ lead: Lead }> {
  const res = await fetch(`${API_URL}/api/leads/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteLead(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/leads/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await res.text());
}

export async function addNote(leadId: number, content: string, author = "agent"): Promise<{ note: Note }> {
  const res = await fetch(`${API_URL}/api/leads/${leadId}/notes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ content, author }),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_URL}/api/stats`, { headers: authHeaders() });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
