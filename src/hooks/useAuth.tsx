import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isStaff: boolean;
  loading: boolean;
  refreshRoles: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRoles = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setIsStaff(false);
      return;
    }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    setIsStaff(Boolean(data && data.length > 0));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setTimeout(() => {
        loadRoles(nextSession?.user?.id).finally(() => setLoading(false));
      }, 0);
    });

    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadRoles(data.session?.user?.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, [loadRoles]);

  const refreshRoles = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    await loadRoles(data.user?.id);
  }, [loadRoles]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsStaff(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, isStaff, loading, refreshRoles, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
