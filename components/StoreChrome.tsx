"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export function StoreChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/admin" || pathname.startsWith("/admin/") ? null : children;
}
