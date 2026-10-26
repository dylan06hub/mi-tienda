"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function cerrarSesionAdmin() {
  await requireAdmin();

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/admin/login");
}
