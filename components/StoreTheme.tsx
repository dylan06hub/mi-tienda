"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function StoreTheme({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  return <div className={`flex min-h-screen flex-col${admin ? "" : " street-theme"}`}>{children}</div>;
}
