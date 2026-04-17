"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<"default" | "user" | "loading">("loading");
  const [maskedKey, setMaskedKey] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/key")
      .then((r) => r.json())
      .then((data) => {
        setStatus(data.hasKey ? "user" : "default");
        setMaskedKey(data.masked || "");
      })
      .catch(() => setStatus("default"));
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings/key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKey.trim() }),
      });
      if (!res.ok) throw new Error();
      setStatus("user");
      setApiKey("");
      toast.success("API key saved");
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      const res = await fetch("/api/settings/key", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setStatus("default");
      setMaskedKey("");
      toast.success("API key removed");
    } catch {
      toast.error("Failed to remove API key");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-black mb-6">Settings</h1>

      <div className="bg-white border-2 border-[#0a0a23] p-6">
        <h2 className="text-lg font-bold mb-4">OpenRouter API Key</h2>

        <div className="mb-4">
          <span className="text-sm text-[#6b7280]">Status: </span>
          <span className="text-sm font-semibold">
            {status === "user" ? "Using your key" : "Using default key"}
          </span>
          {status === "user" && maskedKey && (
            <span className="text-sm text-[#6b7280] ml-2">({maskedKey})</span>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-..."
            className="flex-1"
          />
          <Button onClick={handleSave} disabled={saving || !apiKey.trim()}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>

        {status === "user" && (
          <Button variant="danger" onClick={handleRemove} className="mt-3">
            Remove Key
          </Button>
        )}
      </div>
    </div>
  );
}
