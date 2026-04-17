"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Model {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/models")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setModels(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load models");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-8 w-40 bg-[#f5f5f5] border-2 border-[#0a0a23]" />
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border-2 border-[#0a0a23] px-3 py-1.5 bg-white text-sm font-semibold cursor-pointer hover:bg-[#f5f5f5] focus:outline-none focus:ring-2 focus:ring-[#0a0a23] focus:ring-offset-2"
    >
      {models.map((model) => (
        <option key={model.id} value={model.id}>
          {model.name}
        </option>
      ))}
    </select>
  );
}
