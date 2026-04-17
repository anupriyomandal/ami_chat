"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  lastActiveAt: string | null;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAction = async (userId: string, action: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          if (action === "ban") return { ...u, banned: true };
          if (action === "unban") return { ...u, banned: false };
          if (action === "promote") return { ...u, role: "admin" };
          if (action === "demote") return { ...u, role: "user" };
          return u;
        })
      );
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const filtered = users
    .filter((u) => u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a: any, b: any) => {
      const aVal = a[sortCol as keyof User] ?? "";
      const bVal = b[sortCol as keyof User] ?? "";
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <input
        className="border-2 border-[#0a0a23] px-3 py-2 mb-4 w-full max-w-sm text-sm"
        placeholder="Search by email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full border-2 border-[#0a0a23] bg-white text-sm">
          <thead>
            <tr className="border-b-2 border-[#0a0a23]">
              {["email", "role", "banned", "totalMessages", "totalTokens", "totalCost", "createdAt"].map((col) => (
                <th
                  key={col}
                  className="text-left p-2 cursor-pointer hover:bg-[#f5f5f5] font-semibold"
                  onClick={() => {
                    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
                    else {
                      setSortCol(col);
                      setSortDir("desc");
                    }
                  }}
                >
                  {col} {sortCol === col ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              <th className="text-left p-2 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-[#0a0a23]">
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.banned ? "Banned" : "Active"}</td>
                <td className="p-2">{u.totalMessages}</td>
                <td className="p-2">{u.totalTokens}</td>
                <td className="p-2">${u.totalCost.toFixed(4)}</td>
                <td className="p-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-2">
                  <div className="flex gap-1 flex-wrap">
                    {u.role === "user" && (
                      <button className="px-2 py-1 text-xs border border-[#0a0a23] hover:bg-[#0a0a23] hover:text-white" onClick={() => handleAction(u.id, "promote")}>
                        Promote
                      </button>
                    )}
                    {u.role === "admin" && (
                      <button className="px-2 py-1 text-xs border border-[#0a0a23] hover:bg-[#0a0a23] hover:text-white" onClick={() => handleAction(u.id, "demote")}>
                        Demote
                      </button>
                    )}
                    {!u.banned ? (
                      <button className="px-2 py-1 text-xs border border-[#dc3545] text-[#dc3545] hover:bg-[#dc3545] hover:text-white" onClick={() => handleAction(u.id, "ban")}>
                        Ban
                      </button>
                    ) : (
                      <button className="px-2 py-1 text-xs border border-[#198754] text-[#198754] hover:bg-[#198754] hover:text-white" onClick={() => handleAction(u.id, "unban")}>
                        Unban
                      </button>
                    )}
                    <button className="px-2 py-1 text-xs border border-[#dc3545] text-[#dc3545] hover:bg-[#dc3545] hover:text-white" onClick={() => handleDelete(u.id)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
