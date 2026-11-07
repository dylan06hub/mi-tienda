// Layout raíz: fuentes, carrito y cabecera/pie comunes a todas las páginas.

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "norte. — Ropa esencial",
    template: "%s | norte.",
  },
  description:
    "Ropa para todos los días. Explorá remeras, camisas, pantalones y abrigos. Tienda de demostración.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-[#f7f5f0] text-stone-900">
        <a href="#contenido" className="sr-only z-[60] rounded-lg bg-white px-4 py-3 text-stone-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Saltar al contenido
        </a>
        <CartProvider>
          <Header />
          <main id="contenido" tabIndex={-1} className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
