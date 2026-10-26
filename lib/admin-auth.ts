import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// is_admin() comprueba la tabla public.admins con el usuario del JWT.
export const getAdminUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: esAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError || esAdmin !== true) return null;

  return { id: user.id, email: user.email ?? "" };
});

export async function requireAdmin() {
  const admin = await getAdminUser();

  if (!admin) redirect("/admin/login");

  return admin;
}
