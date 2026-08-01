import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getSession } from "@/lib/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (session.user?.role !== "admin") redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={session.user} />
      <main className="container mx-auto">{children}</main>
    </div>
  );
}
