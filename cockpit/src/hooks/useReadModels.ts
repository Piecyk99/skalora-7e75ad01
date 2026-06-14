import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type {
  ActivityLog,
  ExternalTask,
  Outreach,
  Prospect,
} from "@/integrations/supabase/types";

// Audit (read-only). Wpisy powstają wyłącznie przez RPC.
export function useActivityLog(entityId?: string) {
  return useQuery({
    queryKey: ["activity_log", entityId ?? "all"],
    queryFn: async (): Promise<ActivityLog[]> => {
      let q = supabase
        .from("activity_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (entityId) q = q.eq("entity_id", entityId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Prospects — read-only (na start pusta strefa agenta-prospektora).
export function useProspects() {
  return useQuery({
    queryKey: ["prospects"],
    queryFn: async (): Promise<Prospect[]> => {
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Outreach — read-only lista draftów (BEZ wysyłki).
export function useOutreach() {
  return useQuery({
    queryKey: ["outreach"],
    queryFn: async (): Promise<Outreach[]> => {
      const { data, error } = await supabase
        .from("outreach")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// External tasks — cache pod przyszły pull z EkoTechniki (na start pusty).
export function useExternalTasks() {
  return useQuery({
    queryKey: ["external_tasks"],
    queryFn: async (): Promise<ExternalTask[]> => {
      const { data, error } = await supabase
        .from("external_tasks")
        .select("*")
        .order("due_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
