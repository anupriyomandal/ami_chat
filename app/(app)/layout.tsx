import { requireUser } from "@/lib/auth-guard";
import { Sidebar } from "@/components/chat/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="h-screen flex">
      <Sidebar user={user} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
