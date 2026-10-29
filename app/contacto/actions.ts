"use server";

import { headers } from "next/headers";

type ResultadoConsulta =
  | { error: string }
  | { ok: string };

function validarEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function limitar(texto: string, max: number) {
  return texto.trim().slice(0, max);
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
    typeof mensaje !== "string"
  ) {
    return { error: "Completá todos los campos obligatorios." };
  }

  const nombreLimpio = limitar(nombre, 80);
  const emailLimpio = limitar(email, 120).toLowerCase();
  const telefonoLimpio = typeof telefono === "string" ? limitar(telefono, 40) : "";
  const asuntoLimpio = limitar(asunto, 120);
  const mensajeLimpio = limitar(mensaje, 1000);

  if (!nombreLimpio || !emailLimpio || !asuntoLimpio || !mensajeLimpio) {
    return { error: "Completá todos los campos obligatorios." };
  }

  if (!validarEmail(emailLimpio)) {
    return { error: "Ingresá un email válido." };
  }

  const cabeceras = await headers();
  const userAgent = cabeceras.get("user-agent") ?? "";
  const ip =
    cabeceras.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    cabeceras.get("x-real-ip") ??
    "desconocido";

  console.log(
    `[contacto] ${new Date().toISOString()} ip=${ip} ua=${userAgent.slice(0, 80)} nombre=${nombreLimpio} email=${emailLimpio} telefono=${telefonoLimpio} asunto=${asuntoLimpio} mensaje=${mensajeLimpio.replace(/\n/g, " ")}`,
  );

  return { ok: "Consulta enviada correctamente. Te respondemos a la brevedad." };
}
