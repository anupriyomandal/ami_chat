"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Settings, LogOut, Menu, X, MessageSquare, Trash2, Pencil } from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
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
        className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border-2 border-[#0a0a23]"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={cn(
          "fixed md:relative z-40 h-full w-64 bg-white border-r-2 border-[#0a0a23] flex flex-col transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b-2 border-[#0a0a23]">
          <Link href="/chat" className="text-xl font-black tracking-tight">
            AMIChat
          </Link>
        </div>

        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2 px-3 py-2 bg-[#0a0a23] text-white border-2 border-[#0a0a23] font-semibold text-sm hover:bg-white hover:text-[#0a0a23] transition-colors"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-3">
          {Object.entries(grouped).map(([label, convs]) => (
            <div key={label} className="mb-4">
              <div className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider px-2 py-1">
                {label}
              </div>
              {convs.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className={cn(
                    "group flex items-center gap-2 px-2 py-2 text-sm border-2 border-transparent hover:border-[#0a0a23] transition-colors cursor-pointer",
                    pathname === `/chat/${conv.id}` && "bg-[#f5f5f5] border-[#0a0a23]"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <MessageSquare size={14} className="shrink-0" />
                  {editingId === conv.id ? (
                    <input
                      className="flex-1 text-sm border border-[#0a0a23] px-1 py-0.5 bg-white"
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
                    <span className="flex-1 truncate">{conv.title}</span>
                  )}
                  <span className="hidden group-hover:flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => startRename(conv, e)}
                      className="p-1 hover:bg-[#f5f5f5]"
                      aria-label="Rename"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="p-1 hover:bg-[#dc3545] hover:text-white"
                      aria-label="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t-2 border-[#0a0a23] space-y-2">
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 text-sm border-2 border-[#0a0a23] hover:bg-[#0a0a23] hover:text-white transition-colors"
          >
            <Settings size={14} />
            Settings
          </Link>
          {user.role === "admin" && (
            <Link
              href="/admin/users"
              className="flex items-center gap-2 px-3 py-2 text-sm border-2 border-[#0a0a23] hover:bg-[#0a0a23] hover:text-white transition-colors"
            >
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm border-2 border-[#0a0a23] hover:bg-[#dc3545] hover:text-white hover:border-[#dc3545] transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
          <div className="text-xs text-[#6b7280] px-2 truncate">{user.email}</div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
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
