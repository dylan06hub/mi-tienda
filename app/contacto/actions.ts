"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ResultadoConsulta =
  | { error: string }
  | { ok: string };

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function enviarConsulta(
  _estado: ResultadoConsulta | null,
  formData: FormData,
): Promise<ResultadoConsulta | null> {
  const nombre = formData.get("nombre");
  const email = formData.get("email");
  const telefono = formData.get("telefono");
  const asunto = formData.get("asunto");
  const mensaje = formData.get("mensaje");
  const honeypot = formData.get("website");

  if (typeof honeypot === "string" && honeypot.trim()) {
    return { ok: "Consulta enviada correctamente." };
  }

  if (
    typeof nombre !== "string" ||
    typeof email !== "string" ||
    typeof asunto !== "string" ||
    typeof mensaje !== "string" ||
    (telefono !== null && typeof telefono !== "string")
  ) {
    return { error: "Completá todos los campos obligatorios." };
  }

  const nombreLimpio = nombre.trim();
  const emailLimpio = email.trim().toLowerCase();
  const telefonoLimpio = telefono?.trim() ?? "";
  const asuntoLimpio = asunto.trim();
  const mensajeLimpio = mensaje.trim();

  if (!nombreLimpio || !emailLimpio || !asuntoLimpio || !mensajeLimpio) {
    return { error: "Completá todos los campos obligatorios." };
  }

  if (!validarEmail(emailLimpio)) {
    return { error: "Ingresá un email válido." };
  }

  if (nombreLimpio.length > 80 || emailLimpio.length > 120 ||
    telefonoLimpio.length > 40 || asuntoLimpio.length > 120 || mensajeLimpio.length > 1000) {
    return { error: "Revisá la extensión de los campos. El mensaje admite hasta 1000 caracteres." };
  }

  try {
    const { error } = await createSupabaseAdminClient().from("consultas").insert({
      nombre: nombreLimpio,
      email: emailLimpio,
      telefono: telefonoLimpio || null,
      asunto: asuntoLimpio,
      mensaje: mensajeLimpio,
    });
    if (error) throw error;
  } catch {
    console.error("No se pudo guardar la consulta de contacto.");
    return { error: "No pudimos recibir tu consulta. Intentá de nuevo en unos minutos." };
  }

  revalidatePath("/admin/consultas");
  return { ok: "Consulta enviada correctamente. Te respondemos a la brevedad." };
}
