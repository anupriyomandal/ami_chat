"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ModelEntry {
  modelId: string;
  displayName: string;
  enabled: boolean;
}

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/models")
      .then((r) => r.json())
      .then((data) => {
        setModels(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleModel = async (modelId: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/admin/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, enabled }),
      });
      if (!res.ok) throw new Error();
      setModels((prev) =>
        prev.map((m) => (m.modelId === modelId ? { ...m, enabled } : m))
      );
      toast.success("Model updated");
    } catch {
      toast.error("Failed to update model");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Models</h2>
      <div className="bg-white border-2 border-[#0a0a23] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-[#0a0a23]">
              <th className="text-left p-3 font-semibold">Model ID</th>
              <th className="text-left p-3 font-semibold">Display Name</th>
              <th className="text-left p-3 font-semibold">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m) => (
              <tr key={m.modelId} className="border-b border-[#0a0a23]">
                <td className="p-3 font-mono text-xs">{m.modelId}</td>
                <td className="p-3">{m.displayName}</td>
                <td className="p-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={m.enabled}
                      onChange={(e) => toggleModel(m.modelId, e.target.checked)}
                      className="w-4 h-4 border-2 border-[#0a0a23]"
                    />
                    <span className="text-xs">{m.enabled ? "Yes" : "No"}</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
