import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AppRole } from "@/integrations/supabase/types";

interface AuthState {
  session: Session | null;
  user: User | null;
  roles: AppRole[];
  permissions: string[];
  loading: boolean;
  hasRole: (role: AppRole) => boolean;
  hasPermission: (key: string) => boolean;
  isStaff: boolean;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Additive RBAC: wszystkie role z public.user_roles (junction), brak pola role w profiles.
  const loadRolesAndPermissions = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setRoles([]);
      setPermissions([]);
      return;
    }
    const { data: roleRows, error: rolesErr } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    if (rolesErr) {
      console.warn("[useAuth] nie udało się wczytać ról", rolesErr);
      setRoles([]);
      setPermissions([]);
      return;
    }
    const userRoles = (roleRows ?? []).map((r) => r.role as AppRole);
    setRoles(userRoles);

    if (userRoles.length === 0) {
      setPermissions([]);
      return;
    }
    const { data: permRows } = await supabase
      .from("role_permissions")
      .select("permission_key")
      .in("role", userRoles);
    setPermissions([...new Set((permRows ?? []).map((p) => p.permission_key))]);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadRolesAndPermissions(data.session?.user?.id);
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      await loadRolesAndPermissions(newSession?.user?.id);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadRolesAndPermissions]);

  const value = useMemo<AuthState>(() => {
    const roleSet = new Set(roles);
    const permSet = new Set(permissions);
    return {
      session,
      user: session?.user ?? null,
      roles,
      permissions,
      loading,
      hasRole: (role) => roleSet.has(role),
      hasPermission: (key) => permSet.has(key),
      isStaff: roles.length > 0,
      signOut: async () => {
        await supabase.auth.signOut();
      },
      refreshRoles: () => loadRolesAndPermissions(session?.user?.id),
    };
  }, [session, roles, permissions, loading, loadRolesAndPermissions]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth musi być użyty wewnątrz <AuthProvider>");
  return ctx;
}
