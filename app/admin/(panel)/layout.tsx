import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/admin-auth";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return children;
}
