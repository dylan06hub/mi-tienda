import "server-only";

const API = "https://api.mercadopago.com";

export function mercadopagoFetch(path: string, init: RequestInit = {}) {
  const token = process.env.MP_ACCESS_TOKEN?.trim();

  if (!token) {
    throw new Error("Falta configurar MP_ACCESS_TOKEN.");
  }

  return fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}
