import { requireAdmin } from "@/lib/auth-guard";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const tabs = [
    { label: "Users", href: "/admin/users" },
    { label: "Usage", href: "/admin/usage" },
    { label: "Models", href: "/admin/models" },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="border-b-2 border-[#0a0a23] bg-white px-6 py-4">
        <h1 className="text-2xl font-black mb-3">Admin Dashboard</h1>
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "px-4 py-2 text-sm font-semibold border-2 border-[#0a0a23] hover:bg-[#0a0a23] hover:text-white transition-colors"
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  );
}
