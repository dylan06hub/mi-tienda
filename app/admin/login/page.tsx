import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-6 py-16 md:min-h-[70vh]">
      <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
        Administración
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">
        Acceso al panel
      </h1>
      <p className="mt-3 text-sm leading-6 text-stone-600">
        Ingresá con tu cuenta de administrador.
      </p>

      <LoginForm />

      <Link
        href="/"
        className="mt-8 text-center text-sm text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
