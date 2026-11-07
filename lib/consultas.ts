import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ConsultaAdmin } from "@/types";

export async function getConsultasAdmin(): Promise<ConsultaAdmin[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("consultas")
    .select("id, nombre, email, telefono, asunto, mensaje, creado_en")
    .order("creado_en", { ascending: false });

  if (error) throw new Error("No se pudieron cargar las consultas.");
  return (data ?? []) as ConsultaAdmin[];
}
