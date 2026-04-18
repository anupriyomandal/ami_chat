"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Settings, LogOut, Menu, X, MessageSquare, Trash2, Pencil, ShieldCheck } from "lucide-react";
import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
  model: string;
}

interface SidebarProps {
  user: { id: string; email: string; role: string };
}

export function Sidebar({ user }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => setConversations(data))
      .catch(() => {});
  }, []);

  const grouped = groupConversations(conversations);

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/conversations", { method: "POST" });
      const data = await res.json();
      setConversations((prev) => [data, ...prev]);
      router.push(`/chat/${data.id}`);
    } catch {}
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this conversation?")) return;
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (pathname === `/chat/${id}`) router.push("/chat");
    } catch {}
  };

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const finishRename = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle }),
      });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editTitle } : c))
      );
    } catch {}
    setEditingId(null);
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      <button
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-lg border border-[#e4e4e7] shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        className={cn(
          "fixed md:relative z-40 h-full w-64 bg-white border-r border-[#e4e4e7] flex flex-col transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="px-4 py-5">
          <Link href="/chat" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0a0a23] text-white flex items-center justify-center text-xs font-black">A</div>
            <span className="text-base font-bold tracking-tight text-[#0a0a23]">AMIChat</span>
          </Link>
        </div>

        {/* New Chat */}
        <div className="px-3 pb-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#0a0a23] text-white rounded-xl text-sm font-medium hover:bg-[#1a1a3a] transition-colors"
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>

        {/* Conversation list */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {Object.entries(grouped).map(([label, convs]) => (
            <div key={label} className="mb-4">
              <div className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider px-2 py-1">
                {label}
              </div>
              {convs.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={cn(
                    "group flex items-center gap-2 px-2 py-2 text-sm rounded-lg hover:bg-[#f4f4f5] transition-colors cursor-pointer",
                    pathname === `/chat/${conv.id}` && "bg-[#f4f4f5] font-medium"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <MessageSquare size={13} className="shrink-0 text-[#a1a1aa]" />
                  {editingId === conv.id ? (
                    <input
                      className="flex-1 text-sm px-1 py-0.5 bg-white rounded border border-[#e4e4e7] outline-none focus:ring-2 focus:ring-[#0a0a23]"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => finishRename(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") finishRename(conv.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="flex-1 truncate text-[#3f3f46]">{conv.title}</span>
                  )}
                  <span className="hidden group-hover:flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={(e) => startRename(conv, e)}
                      className="p-1 rounded hover:bg-[#e4e4e7] text-[#71717a]"
                      aria-label="Rename"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="p-1 rounded hover:bg-[#fee2e2] hover:text-[#dc3545] text-[#71717a]"
                      aria-label="Delete"
                    >
                      <Trash2 size={11} />
                    </button>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-[#e4e4e7] space-y-1">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-[#3f3f46] hover:bg-[#f4f4f5] transition-colors"
          >
            <Settings size={14} className="text-[#71717a]" />
            Settings
          </Link>
          {user.role === "admin" && (
            <Link
              href="/admin/users"
              className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-[#3f3f46] hover:bg-[#f4f4f5] transition-colors"
            >
              <ShieldCheck size={14} className="text-[#71717a]" />
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-[#3f3f46] hover:bg-[#fee2e2] hover:text-[#dc3545] transition-colors"
          >
            <LogOut size={14} className="text-[#71717a]" />
            Logout
          </button>
          <div className="text-xs text-[#a1a1aa] px-3 pt-1 truncate">{user.email}</div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}

function groupConversations(conversations: Conversation[]) {
  const groups: Record<string, Conversation[]> = {};
  const now = new Date();

  for (const conv of conversations) {
    const date = new Date(conv.updatedAt);
    let label: string;
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    else if (isWithinInterval(date, { start: subDays(now, 7), end: subDays(now, 1) }))
      label = "Previous 7 Days";
    else label = "Older";

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return groups;
}
