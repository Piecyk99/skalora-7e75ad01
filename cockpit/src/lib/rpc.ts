import { supabase } from "@/lib/supabase";
import type { Database } from "@/integrations/supabase/types";

type Fns = Database["public"]["Functions"];

// Typowany wrapper na supabase.rpc. Generyk rpc w obecnej wersji supabase-js nie
// inferuje argumentów dla ręcznie utrzymywanych typów (rozwiązuje do `never`),
// więc quirk biblioteki izolujemy TUTAJ jednym lokalnym castem. Powierzchnia
// publiczna (callRpc) pozostaje w pełni typowana przez nasz Database — bez `any`.
export async function callRpc<K extends keyof Fns>(
  fn: K,
  args: Fns[K]["Args"],
): Promise<Fns[K]["Returns"]> {
  const { data, error } = await supabase.rpc(fn as string, args as never);
  if (error) throw error;
  return data as Fns[K]["Returns"];
}
