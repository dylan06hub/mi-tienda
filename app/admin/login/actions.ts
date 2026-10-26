"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function iniciarSesionAdmin(
  _estado: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return { error: "Completá email y contraseña." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    return { error: "Email, contraseña o permisos incorrectos." };
  }

  const { data: esAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError || esAdmin !== true) {
    await supabase.auth.signOut();
    return { error: "Email, contraseña o permisos incorrectos." };
  }

  redirect("/admin");
}
